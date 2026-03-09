import express from "express";
import { protect, authorize } from "../middleware/auth";
import {
  getMRVStats,
  getMRVReports,
  getMRVReport,
  getMRVByProject,
  generateMRVReport,
  generateAllReports,
  deleteMRVReport,
} from "../controllers/mrvController";

const router = express.Router();

// Public / protected stats
router.get("/stats", getMRVStats);

// Specific routes before wildcard /:id
router.get("/project/:projectId", getMRVByProject);

// Get all reports
router.get("/reports", protect, getMRVReports);

// Generate reports
router.post("/reports/generate", protect, generateMRVReport);
router.post(
  "/reports/generate-all",
  protect,
  authorize("admin"),
  generateAllReports,
);

// Single report
router.get("/reports/:id", protect, getMRVReport);
router.delete("/reports/:id", protect, deleteMRVReport);

export default router;
