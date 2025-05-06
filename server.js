import express from "express";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import bodyParser from "body-parser";
import connectDB from "./config/database.js";
import cors from 'cors'
import { userRoute } from "./routes/userRoute.js";
import { adminRoute } from "./routes/adminRoute.js";
import { prodcutRoute } from "./routes/productRoute.js";
dotenv.config()
const app = express()

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

connectDB();
app.use("/api/v1/", userRoute);
app.use("/api/v1/", adminRoute);
app.use("/api/v1/", prodcutRoute);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});