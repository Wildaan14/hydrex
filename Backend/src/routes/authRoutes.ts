import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  verifyEmail,
  updatePreferences,
  deleteAccount,
} from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);
router.put("/preferences", protect, updatePreferences);
router.delete("/account", protect, deleteAccount);

export default router;
