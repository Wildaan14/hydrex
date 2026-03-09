import express from "express";
import { protect } from "../middleware/auth";
import {
  getBlockchainRecords,
  getRecordsByProject,
  addBlockchainRecord,
  getBlockchainStats,
} from "../controllers/blockchainController";

const router = express.Router();

router.get("/stats", getBlockchainStats);
router.get("/project/:projectId", getRecordsByProject);
router.get("/records", getBlockchainRecords);
router.post("/records", protect, addBlockchainRecord);

export default router;
