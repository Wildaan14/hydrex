import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import config from "./config/env";
import connectDB from "./config/db";

// Import routes
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import esgRoutes from "./routes/esgRoutes";
import marketplaceRoutes from "./routes/marketplaceRoutes";
import mrvRoutes from "./routes/mrvRoutes";
import blockchainRoutes from "./routes/blockchainRoutes";
import forumRoutes from "./routes/forumRoutes";
import newsRoutes from "./routes/newsRoutes";

// Initialize express
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.FRONTEND_URL || "*",
    ],
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/esg", esgRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/mrv", mrvRoutes);
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/news", newsRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "HydrEx API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: [
      "/api/auth",
      "/api/projects",
      "/api/esg",
      "/api/marketplace",
      "/api/mrv",
      "/api/blockchain",
      "/api/forum",
      "/api/news",
    ],
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: config.nodeEnv === "development" ? err.message : undefined,
    });
  },
);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 HydrEx Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🗄️  MongoDB: ${config.mongoUri}`);
});

export default app;
