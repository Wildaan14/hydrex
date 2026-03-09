import express from "express";
import {
  createListing,
  getListings,
  getListing,
  updateListing,
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransactionStatus,
  getMarketplaceStats,
} from "../controllers/marketplaceController";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

// Public routes
router.get("/stats", getMarketplaceStats);
router.get("/listings", getListings);
router.get("/listings/:id", getListing);

// Protected routes - Listings
router.post("/listings", protect, createListing);
router.put("/listings/:id", protect, updateListing);

// Protected routes - Transactions
router.post("/transactions", protect, createTransaction);
router.get("/transactions", protect, getTransactions);
router.get("/transactions/:id", protect, getTransaction);

// Admin routes
router.put(
  "/transactions/:id/status",
  protect,
  authorize("admin"),
  updateTransactionStatus,
);

export default router;
