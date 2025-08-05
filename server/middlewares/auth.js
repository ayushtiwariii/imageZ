import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.json({ success: false, message: "Not Authorized Login Again" });
  }

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    if (token_decode.id) {
      // 🔥 FIX: Handle both GET and POST requests
      if (req.method === "GET") {
        req.userId = token_decode.id; // For GET requests
      } else {
        // Ensure req.body exists for POST requests
        if (!req.body) req.body = {};
        req.body.userId = token_decode.id; // For POST requests
      }
    } else {
      return res.json({
        success: false,
        message: "Not authorized login again",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authUser;
