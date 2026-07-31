import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import walletRoutes from "./routes/wallet.Routes";
import uploadRoutes from "./routes/upload.Routes";
import metadataRoutes from "./routes/metadata.Routes";
import nftRoutes from "./routes/nft.Routes";
import txRoutes from "./routes/tx.Routes";
import healthRoutes from "./routes/health.Routes";
import copyrightRoutes from "./routes/copyright.Routes";
import licenseRoutes from "./routes/license.Routes";
import marketplaceRoutes from "./routes/marketplace.Routes";

dotenv.config();

const app: Application = express();

// ✅ Middleware (order matters)
app.use(cors());
app.use(express.json()); // parses JSON body
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ✅ Routes
app.use("/api/wallet", walletRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/nft", metadataRoutes);
app.use("/api/nft", nftRoutes);
app.use("/api/tx", txRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/copyright", copyrightRoutes);
app.use("/api/licenses", licenseRoutes);
app.use("/api/marketplace", marketplaceRoutes);



// ✅ Default route
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully!");
});

// ✅ Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("❌ Backend Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

export default app;
