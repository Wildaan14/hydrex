import express from "express";
import { protect, authorize } from "../middleware/auth";
import {
  getNews,
  getAllNewsAdmin,
  getNewsItem,
  createNews,
  updateNews,
  deleteNews,
  incrementView,
  getNewsStats,
} from "../controllers/newsController";

const router = express.Router();

// Public
router.get("/stats", getNewsStats);
router.get("/", getNews);
router.get("/:id", getNewsItem);
router.put("/:id/view", incrementView);

// Admin only
router.get("/admin/all", protect, authorize("admin"), getAllNewsAdmin);
router.post("/", protect, authorize("admin"), createNews);
router.put("/:id", protect, authorize("admin"), updateNews);
router.delete("/:id", protect, authorize("admin"), deleteNews);

export default router;
