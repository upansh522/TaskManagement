import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import axios from "axios";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:8001/api/v1";

export const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, please login!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Call user service to validate user
    try {
      const response = await axios.get(
        `${USER_SERVICE_URL}/user/${decoded.id}`,
        {
          timeout: 5000,
          headers: {
            Cookie: `token=${token}`,
          },
        }
      );

      req.user = {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      };

      next();
    } catch (serviceError) {
      console.log("User service error:", serviceError.message);
      
      if (serviceError.response?.status === 404) {
        return res.status(404).json({ message: "User not found!" });
      }
      
      if (serviceError.response?.status === 401) {
        return res.status(401).json({ message: "Not authorized!" });
      }
      
      // Fallback: if user service is down, trust JWT for basic operations
      console.log("Falling back to JWT-only authentication");
      req.user = { 
        _id: decoded.id,
        name: decoded.name || "Unknown",
        email: decoded.email || "unknown@example.com",
        role: decoded.role || "user"
      };
      next();
    }
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed!" });
  }
});
