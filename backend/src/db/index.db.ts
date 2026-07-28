import mongoose, { Connection } from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const connectionInstance: Connection = (await mongoose.connect(
      process.env.MONGODB_URI as string
    )).connection;

    console.log(`\n✅ MongoDB connected! DB HOST: ${connectionInstance.host}`);
  } catch (error) {
    console.error("❌ MONGODB connection ERROR:", error);
    process.exit(1);
  }
};

export default connectDB;