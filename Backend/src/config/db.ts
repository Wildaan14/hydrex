import mongoose from "mongoose";

// Global is used here to maintain a cached connection across hot reloads or serverless function invocations.
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/hydrex";

    cached.promise = mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    }).then((mongoose) => {
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error(`MongoDB Connection Error: ${error}`);
    throw error;
  }
};

export default connectDB;
