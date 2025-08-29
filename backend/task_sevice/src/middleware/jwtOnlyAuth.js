import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

export const protectJWTOnly = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, please login!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Trust JWT payload - no database lookup
    req.user = {
      _id: decoded.id,
      // Add more fields to JWT payload if needed
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed!" });
  }
});