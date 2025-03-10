import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return Promise.resolve(cached.conn);  // Ensure it's always a Promise
    }

    if (!cached.promise) {
        const opts = { bufferCommands: false,
            serverSelectionTimeoutMS: 10000, // Increase server selection timeout
            socketTimeoutMS: 45000, // Increase socket timeout
         };
        cached.promise = mongoose.connect(`${process.env.MONGODB_URI}/quickstart`, opts);
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        console.error('MongoDB connection error:', error.message); // Log only the error message

        throw error;
    }
}


export default connectDB;
