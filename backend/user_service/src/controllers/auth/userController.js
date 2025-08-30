import asyncHandler from "express-async-handler";
import User from "../../models/auth/UserModel.js";
import generateToken from "../../helpers/generateToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Token from "../../models/auth/Token.js";
import crypto from "node:crypto";
import hashToken from "../../helpers/hashToken.js";
import sendEmail from "../../helpers/sendEmail.js";

import {
  registerUserSchema,
  loginUserSchema,
  updateUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../../validations/user.js";

export const registerUser = asyncHandler(async (req, res) => {
  const parsed = registerUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.errors.map((err) => err.message).join(", "),
    });
  }
  const { name, email, password } = parsed.data;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }
  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateToken(user);

  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
    secure: false,
  });

  if (user) {
    const { _id, name, email, role, photo, bio, isVerified } = user;
    res.status(201).json({
      _id,
      name,
      email,
      role,
      photo,
      bio,
      isVerified,
      token,
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const parsed = loginUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.errors.map((err) => err.message).join(", "),
    });
  }
  const { email, password } = parsed.data;

  const userExists = await User.findOne({ email });
  if (!userExists) {
    return res.status(404).json({ message: "User not found, sign up!" });
  }

  const isMatch = await bcrypt.compare(password, userExists.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = generateToken(userExists);

  if (userExists && isMatch) {
    const { _id, name, email, role, photo, bio, isVerified } = userExists;
    res.cookie("token", token, {
      path: "/",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
    secure: false,
    });
    res.status(200).json({
      _id,
      name,
      email,
      role,
      photo,
      bio,
      isVerified,
      token,
    });
  } else {
    res.status(400).json({ message: "Invalid email or password" });
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    path: "/",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
    secure: false,
  });
  res.status(200).json({ message: "User logged out" });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  const user = await User.findById(id).select("-password");

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      photo: user.photo,
      bio: user.bio,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

export const updateUser = asyncHandler(async (req, res) => {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.errors.map((err) => err.message).join(", "),
    });
  }
  const { name, bio, photo } = parsed.data;
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.photo = photo || user.photo;
    const updated = await user.save();
    res.status(200).json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      photo: updated.photo,
      bio: updated.bio,
      isVerified: updated.isVerified,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

export const userLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Not authorized, please login!" });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded) {
    res.status(200).json(true);
  } else {
    res.status(401).json(false);
  }
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.errors.map((err) => err.message).join(", "),
    });
  }

  const { email } = parsed.data;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  const passwordResetToken = crypto.randomBytes(64).toString("hex") + user._id;
  const hashedToken = hashToken(passwordResetToken);

  await new Token({
    userId: user._id,
    passwordResetToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000,
  }).save();

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}`;

  const subject = "Password Reset - AuthKit";
  const send_to = user.email;
  const send_from = process.env.USER_EMAIL;
  const reply_to = "noreply@noreply.com";
  const template = "forgotPassword";
  const name = user.name;
  const url = resetLink;

  try {
    await sendEmail(subject, send_to, send_from, reply_to, template, name, url);
    res.json({ message: "Email sent" });
  } catch (error) {
    console.error("Error sending email:", error.message || error);
    return res.status(500).json({
      message: "Email could not be sent. Please try again later.",
    });
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { resetPasswordToken } = req.params;

  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.errors.map((err) => err.message).join(", "),
    });
  }

  const { password } = parsed.data;

  const hashedToken = hashToken(resetPasswordToken);

  const userToken = await Token.findOne({
    passwordResetToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  const user = await User.findById(userToken.userId);
  user.password = password;
  await user.save();

  await userToken.deleteOne();

  res.status(200).json({ message: "Password reset successfully" });
});

export const changePassword = asyncHandler(async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.errors.map((err) => err.message).join(", "),
    });
  }
  const { currentPassword, newPassword } = parsed.data;
  const user = await User.findById(req.user._id);
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid password!" });
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({ message: "Password changed successfully" });
});
