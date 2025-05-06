// import mongoose from "mongoose";
// import dotenv from "dotenv";
// dotenv.config();
// const DB_URI = process.env.DB_URI
// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.DB_URI, {});
//     } catch (error) {
//         process.exit(1);
//     }
// };
// console.log(`Mongodb connected successfully:${DB_URI}`);
// export default connectDB;

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const connectionOptions = {
            serverSelectionTimeoutMS: 30000, // 30 seconds for server selection
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            connectTimeoutMS: 30000, // 30 seconds to establish connection
            maxPoolSize: 10, // Maintain up to 10 socket connections
            retryWrites: true,
            retryReads: true,
        };

        await mongoose.connect(process.env.DB_URI, connectionOptions);

        console.log(`✅ MongoDB connected successfully: ${process.env.DB_URI.split('@')[1]}`); // Shows cluster info without credentials

        // Setup event listeners
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to DB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected');
        });

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;