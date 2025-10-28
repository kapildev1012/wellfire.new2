import mongoose from "mongoose";
import { optimizeDatabase } from "./dbOptimization.js";

const connectDB = async () => {
    mongoose.connection.on('connected', async () => {
        console.log(" DB Connected");
        // Run database optimizations after connection
        await optimizeDatabase();
    });

    // Connection options for better performance
    const options = {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        compressors: ['zlib']
    };

    await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`, options);
}

export default connectDB;