import express from "express";
import {
  changePassword,
  forgotPassword,
  getUser,
  getUserById,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateUser,
  userLoginStatus,
} from "../controllers/auth/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/user", protect, getUser);
router.get("/user/:id", protect, getUserById);
router.patch("/user", protect, updateUser);

router.get("/login-status", userLoginStatus);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:resetPasswordToken", resetPassword);

router.patch("/change-password", protect, changePassword);

export default router;


