import express from "express";
import { protect } from "../middleware/auth";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addReply,
  deleteReply,
  getForumStats,
} from "../controllers/forumController";

const router = express.Router();

// Stats first before /:id
router.get("/stats", getForumStats);

// Public list + detail
router.get("/posts", getPosts);
router.get("/posts/:id", getPost);

// Protected CRUD
router.post("/posts", protect, createPost);
router.put("/posts/:id", protect, updatePost);
router.delete("/posts/:id", protect, deletePost);

// Like + replies
router.put("/posts/:id/like", protect, likePost);
router.post("/posts/:id/reply", protect, addReply);
router.delete("/posts/:id/reply/:replyId", protect, deleteReply);

export default router;
