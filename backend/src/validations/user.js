import { z } from "zod";

// Schema for user registration
export const registerUserSchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Schema for user login
export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().nonempty("Password is required"),
});

// Schema for updating user data
export const updateUserSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  photo: z.string().optional(),
});

// Schema for forgot password request
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Schema for resetting password
export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Schema for changing password
export const changePasswordSchema = z.object({
  currentPassword: z.string().nonempty("Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
