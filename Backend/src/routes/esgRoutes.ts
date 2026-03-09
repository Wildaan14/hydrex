import express from "express";
import {
  createESGScoring,
  getESGScorings,
  getESGScoring,
  getESGByProject,
  updateESGScoring,
  updateIndicator,
  updateGateCheck,
  lockESGScoring,
  getESGStats,
} from "../controllers/esgController";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

// Specific routes MUST come before /:id to avoid param shadowing
router.get("/stats", getESGStats);
router.get("/project/:projectId", getESGByProject);

// Get all ESG scorings (with pagination)
router.get("/", getESGScorings);

// Single ESG scoring
router.get("/:id", getESGScoring);

// Protected routes
router.post("/", protect, createESGScoring);
router.put("/:id", protect, updateESGScoring);
router.put("/:id/indicator/:indicatorId", protect, updateIndicator);
router.put("/:id/gate-check", protect, updateGateCheck);
router.put("/:id/lock", protect, authorize("admin"), lockESGScoring);

export default router;
