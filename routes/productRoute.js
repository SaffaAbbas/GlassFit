import express from "express";
import { createProduct, getAllProducts, updateProduct } from "../controllers/productController.js";
import { productUpload } from "../middleware/multer.js";
import { authenticateAdmin } from "../middleware/auth.js";
const router = express.Router();
router.post("/products/create", authenticateAdmin, productUpload, createProduct);
router.put("/products/update/:id", authenticateAdmin, productUpload, updateProduct);
router.get("/products", authenticateAdmin, getAllProducts);

export { router as prodcutRoute };
