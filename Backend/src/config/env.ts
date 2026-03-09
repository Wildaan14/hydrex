import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/hydrex",
  jwtSecret:
    process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  uploadPath: process.env.UPLOAD_PATH || "./uploads",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10),
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  blockchain: {
    enabled: process.env.BLOCKCHAIN_ENABLED === "true",
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL,
  },
};
