import { User } from "../models/userModel.js";
import { BlacklistedToken } from "../models/blackListedTokenModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendEmail } from "../helper/helper.js";
import { generateOTP } from "../helper/helper.js";
import { otpEmailTemplate } from "../helper/emailTemplate.js";

export const signup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields.",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered.",
            });
        }

        const user = new User({ name, email, password });
        await user.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.log("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "An error occured while registration.",
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields.",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        user.isVerified = true;
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRETKEY, {
            expiresIn: "30d",
        });

        res.status(200).json({
            success: true,
            message: "Login successful.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while logging in.",
        });
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'Please provide a valid token.' });
        }
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        await BlacklistedToken.create({
            token,
            expiresAt: expirationDate,
        });
        res.status(200).json({ success: true, message: 'Logged out successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res
                .status(400)
                .json({ success: false, message: "Email is required to proceed." });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found." });
        }

        if (!user.isVerified) {
            return res
                .status(400)
                .json({ success: false, message: "Your account has not been verified." });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        const htmlContent = otpEmailTemplate(otp, 'FORGOT_PASSWORD');
        const emailResult = await sendEmail(user.email, 'Reset Your Password - OTP for Verification', htmlContent);
        if (!emailResult.success) {
            return res
                .status(500)
                .json({ success: false, message: "Failed to send OTP to the provided email address." });
        }
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Please check your email to reset your password.",
        });
    } catch (error) {
        console.error("Error in forgot password:", error);
        res.status(500)
            .json({ success: false, message: "An error occured while processing your request." });
    }
};

export const verifyPasswordOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided.",
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found." });
        }
        if (user.otp !== otp) {
            return res
                .status(400)
                .json({ success: false, message: "Please provide a valid OTP." });
        }
        if (user.otpExpires && user.otpExpires < new Date()) {
            return res
                .status(400)
                .json({ success: false, message: "The OTP has expired." });
        }
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        res
            .status(200)
            .json({ success: true, message: "OTP verified successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "An error occured while verifying your OTP." });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { password, email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required to proceed."
            })
        }
        if (!password) {
            return res
                .status(400)
                .json({ success: false, message: "New password is required." });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found." });
        }
        if (user.isVerified === true && user.otp != null) {
            return res.status(400).json({
                success: false,
                message: "OTP verification is required to reset the password.",
            });
        }
        user.password = password;
        await user.save();
        res
            .status(200)
            .json({ success: true, message: "Password reset successfully." });
    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: "An error occured while resetting your password." });
    }
};
