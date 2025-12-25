import dotenv from "dotenv";
dotenv.config();

import userModel from "../models/userModel.js";
import transactionModel from "../models/transactionModel.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import Razorpay from "razorpay";
import crypto from "crypto";

/* =========================
   AUTH CONTROLLERS
========================= */

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Password too short" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      creditBalance: 0,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token, user: { name: user.name } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token, user: { name: user.name } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const userCredits = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;

    if (!userId) {
      return res.json({ success: false, message: "User ID missing" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      credits: user.creditBalance,
      user: { name: user.name },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   RAZORPAY SETUP (FIXED)
========================= */

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =========================
   CREATE ORDER
========================= */

const paymentRazorpay = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    if (!userId || !planId) {
      return res.json({ success: false, message: "Missing details" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    let credits = 0;
    let amount = 0;
    let plan = "";

    switch (planId) {
      case "Basic":
        plan = "Basic";
        credits = 25;
        amount = 10;
        break;
      case "Advanced":
        plan = "Advanced";
        credits = 70;
        amount = 30;
        break;
      case "Premier":
        plan = "Premier";
        credits = 150;
        amount = 50;
        break;
      default:
        return res.json({ success: false, message: "Invalid plan" });
    }

    // 1️⃣ Create transaction in DB
    const transaction = await transactionModel.create({
      userId,
      plan,
      credits,
      amount,
      payment: false,
      date: Date.now(),
    });

    // 2️⃣ Create Razorpay order
    const order = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: transaction._id.toString(),
    });

    // 3️⃣ Save Razorpay order_id in DB
    await transactionModel.findByIdAndUpdate(transaction._id, {
      razorpayOrderId: order.id,
    });

    // 4️⃣ Send response to frontend
    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


const verifyRazorpay = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // 1️⃣ Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // 2️⃣ Find transaction using razorpayOrderId
    const transaction = await transactionModel.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!transaction) {
      return res.json({ success: false, message: "Transaction not found" });
    }

    if (transaction.payment) {
      return res.json({ success: false, message: "Payment already processed" });
    }

    // 3️⃣ Add credits to user
    const user = await userModel.findById(transaction.userId);

    await userModel.findByIdAndUpdate(user._id, {
      creditBalance: user.creditBalance + transaction.credits,
    });

    // 4️⃣ Update transaction status
    await transactionModel.findByIdAndUpdate(transaction._id, {
      payment: true,
      paymentId: razorpay_payment_id,
    });

    res.json({
      success: true,
      message: "Payment successful, credits added",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* ========================= */

export {
  registerUser,
  loginUser,
  userCredits,
  paymentRazorpay,
  verifyRazorpay,
};
