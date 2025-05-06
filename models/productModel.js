import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true },
        frame: [{ public_id: { type: String }, url: { type: String } }],
        sizes: { type: [String], enum: ["Small", "Medium", "Large", "XL", "XXL"], default: [] },
        category: { type: String, enum: ["Sunglasses", "Eyeglasses", "AI Glasses", "Promo", "ASAP Rocky"], required: true },
        photos: [{ public_id: { type: String }, url: { type: String } }],
        description: { type: String, trim: true },
        salesCount: { type: Number, default: 0 },
        frameMeasurements: {
            lensWidth: { value: Number, unit: String },
            lensHeight: { value: Number, unit: String },
            bridgeWidth: { value: Number, unit: String },
            templeLength: { value: Number, unit: String }
        },
        size: { type: String },
        material: { type: String },
        shape: { type: String },
        springHinges: { type: Boolean },
        progressiveEligible: { type: Boolean },
        gender: { type: String, enum: ["Men", "Women", "Unisex"] },
        frameType: { type: String, enum: ["Full-Rim", "Half-Rim", "Rimless"] },
        lensFeature: { type: String },
        polarized: { type: Boolean }
    },
    { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);