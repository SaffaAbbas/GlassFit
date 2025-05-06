import express from "express";
import { forgotPassword, login, resetPassword, signup, verifyPasswordOTP } from "../controllers/userController.js";
import { auth, authenticate } from "../middleware/auth.js";
const router = express.Router();
router.post("/users/register", signup);
router.post("/users/login", login);
router.post("/users/forget-password", authenticate, forgotPassword);
router.post("/users/verify-password-otp", verifyPasswordOTP);
router.post("/users/reset-password", resetPassword);

export { router as userRoute };
