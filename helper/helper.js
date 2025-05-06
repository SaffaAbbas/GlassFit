import nodemailer from "nodemailer";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export function generateOTP(length = 6) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min)).toString();
}

// export const sendEmailTo = async (options) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             host: process.env.SMTP_HOST,
//             port: process.env.SMTP_PORT,
//             secure: process.env.SMTP_SECURE,
//             auth: {
//                 user: process.env.SMTP_USER,
//                 pass: process.env.SMTP_PASSWORD,
//             },
//         });
//         await transporter.sendMail(options);
//     } catch (error) {
//         throw new Error(error);
//     }
// };

export const sendEmail = async (options) => {
    console.log(options);
    const transport = nodemailer.createTransport({

        service: "gmail",
        auth: {
            user: "safaabbas167@gmail.com",
            pass: "hhgu cols qnzy xoob"
        },
    });
    const mailOption = {
        from: "safaabbas167@gmail.com",
        to: options.email,
        subject: options.subject,
        html: options.message,
    }
    await transport.sendMail(mailOption);
};

export const validateObjectIds = (res, ids) => {
    for (const [key, value] of Object.entries(ids)) {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid id.",
            });
        }
    }
    return null;
};

export const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};