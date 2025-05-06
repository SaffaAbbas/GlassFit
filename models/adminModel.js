import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

const AdminSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true },
        password: { type: String },
    },
    { timestamps: true }
);

AdminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export const Admin = mongoose.model("Admin", AdminSchema);
