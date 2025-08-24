import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://root:root@cluster0.k7yeieo.mongodb.net/social_media_app?retryWrites=true&w=majority&appName=Cluster0");
    console.log("Connected to MongoDB with Mongoose");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}