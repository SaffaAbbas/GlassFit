import express from "express";
import { adminLogin, adminSignup } from "../controllers/adminController.js";
const router = express.Router();
router.post("/admin/register", adminSignup);
router.post("/admin/login", adminLogin);

export { router as adminRoute };
