import mongoose from "mongoose";

const blacklistedTokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    blacklistedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
});

blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const BlacklistedToken = mongoose.model("BlacklistedToken", blacklistedTokenSchema);