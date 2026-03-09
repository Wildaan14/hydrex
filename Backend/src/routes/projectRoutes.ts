import express from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  updateVerificationStep,
  assignVVB,
  approveProject,
  rejectProject,
  getProjectStats,
} from "../controllers/projectController";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

// Stats route MUST come before /:id to avoid param matching
router.get("/stats", protect, getProjectStats);

// Get all projects (with pagination)
router.get("/", getProjects);

// Single project
router.get("/:id", getProject);

// Protected routes
router.post("/", protect, createProject);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);

// Admin routes
router.put(
  "/:id/verification-step",
  protect,
  authorize("admin", "vvb"),
  updateVerificationStep,
);
router.put("/:id/assign-vvb", protect, authorize("admin"), assignVVB);
router.put("/:id/approve", protect, authorize("admin"), approveProject);
router.put("/:id/reject", protect, authorize("admin"), rejectProject);

export default router;
