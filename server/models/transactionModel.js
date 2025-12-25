import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // 🔥 FIX
    ref: "user",
    required: true,
  },

  plan: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  credits: {
    type: Number,
    required: true,
  },

  razorpayOrderId: {
    type: String, // 🔥 VERY IMPORTANT
  },

  payment: {
    type: Boolean,
    default: false,
  },

  paymentId: {
    type: String,
  },

  date: {
    type: Number,
    default: Date.now,
  },
});

const transactionModel =
  mongoose.models.transaction ||
  mongoose.model("transaction", transactionSchema);

export default transactionModel;
