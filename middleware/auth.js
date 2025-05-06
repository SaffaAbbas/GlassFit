import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { Admin } from "../models/adminModel.js";
import { BlacklistedToken } from "../models/blackListedTokenModel.js";

export const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) throw new Error();

        const isBlacklisted = await BlacklistedToken.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid or expired",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) throw new Error();

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Authentication failed."
        });
    }
};

export const authenticate = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please provide a valid token.",
            });
        }
        const isBlacklisted = await BlacklistedToken.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid or expired.",
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
        if (decoded.userId) {
            const user = await User.findById(decoded.userId).select("-password");
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.",
                });
            }
            req.user = user;
        }
        else if (decoded.admin) {
            const admin = await Admin.findById(decoded.admin).select("-password");
            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: "Admin not found.",
                });
            }
            req.admin = admin;
        }
        else {
            return res.status(400).json({
                success: false,
                message: "No valid user or admin found.",
            });
        }
        req.token = token;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Authentication failed." });
    }
};

export const authenticateAdmin = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({
            success: false, message: "Please provide a valid token.",
        });
    }
    try {
        const isBlacklisted = await BlacklistedToken.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                success: false, message: "Token is invalid or expired.",
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
        const id = decoded?.admin;
        if (!id) {
            return res.status(400).json({
                success: false, message: "Please provide a valid token.",
            });
        }
        req.admin = await Admin.findById(id).select("id name email");
        if (!req.admin) {
            return res.status(404).json({
                success: false, message: "Admin not found.",
            });
        }
        next();
    } catch (error) {
        return res.status(400).json({
            success: false, message: "Authentication failed.",
        });
    }
};