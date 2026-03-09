import { Request, Response } from "express";
import { Listing, CommunityListing, CorporateListing } from "../models/Listing";
import {
  Transaction,
  Certificate,
  Contract,
  WCPA,
} from "../models/Transaction";
import { AuthRequest } from "../middleware/auth";

// @desc    Create new listing
// @route   POST /api/marketplace/listings
// @access  Private
export const createListing = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const listingData = {
      ...req.body,
      id: `listing-${Date.now()}`,
      sellerId: req.user?._id,
      sellerName: req.user?.name,
      sellerType:
        req.user?.role === "company" ? "company" : "individual",
    };

    let listing;
    if (req.body.category === "community") {
      listing = await CommunityListing.create(listingData);
    } else if (req.body.category === "corporate") {
      listing = await CorporateListing.create(listingData);
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid listing category. Must be 'community' or 'corporate'",
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: listing,
    });
  } catch (error) {
    console.error("Create listing error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating listing",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get all listings
// @route   GET /api/marketplace/listings
// @access  Public
export const getListings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      category,
      status,
      province,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
    } = req.query;

    const query: any = { status: "active" };
    if (category) query.category = category;
    if (province) query["location.province"] = province;
    if (minPrice || maxPrice) {
      query.pricePerTon = {};
      if (minPrice) query.pricePerTon.$gte = Number(minPrice);
      if (maxPrice) query.pricePerTon.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Listing.countDocuments(query);

    res.json({
      success: true,
      data: listings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get listings error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting listings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get single listing
// @route   GET /api/marketplace/listings/:id
// @access  Public
export const getListing = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const listing = await Listing.findOne({ id: req.params.id });

    if (!listing) {
      res.status(404).json({
        success: false,
        message: "Listing not found",
      });
      return;
    }

    res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error("Get listing error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting listing",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Update listing
// @route   PUT /api/marketplace/listings/:id
// @access  Private
export const updateListing = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const listing = await Listing.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updatedAt: new Date() },
      { new: true },
    );

    if (!listing) {
      res.status(404).json({
        success: false,
        message: "Listing not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Listing updated successfully",
      data: listing,
    });
  } catch (error) {
    console.error("Update listing error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating listing",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Create transaction
// @route   POST /api/marketplace/transactions
// @access  Private
export const createTransaction = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { items, paymentMethod, buyerInfo } = req.body;

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      const listing = await Listing.findOne({ id: item.listingId });
      if (!listing) {
        res.status(404).json({
          success: false,
          message: `Listing not found: ${item.listingId}`,
        });
        return;
      }
      if (listing.availableCredits < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient credits for listing: ${listing.projectName}`,
        });
        return;
      }
      subtotal += item.quantity * listing.pricePerTon;
    }

    const serviceFee = subtotal * 0.025;
    const tax = subtotal * 0.11;
    const total = subtotal + serviceFee + tax;

    // Generate transaction
    const transaction = await Transaction.create({
      id: `TXN-${Date.now()}`,
      buyerId: req.user?._id,
      buyerName: buyerInfo.name,
      buyerEmail: buyerInfo.email,
      items,
      subtotal,
      serviceFee,
      tax,
      total,
      paymentMethod,
      paymentStatus: "pending",
      blockchainTxHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      blockchainBlockNumber: Math.floor(18000000 + Math.random() * 1000000),
    });

    // Update listing available credits
    for (const item of items) {
      await Listing.findOneAndUpdate(
        { id: item.listingId },
        {
          $inc: {
            availableCredits: -item.quantity,
            totalSold: item.quantity,
          },
        },
      );
    }

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating transaction",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get user transactions
// @route   GET /api/marketplace/transactions
// @access  Private
export const getTransactions = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const buyerId = req.user?._id;
    const transactions = await Transaction.find({ buyerId }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting transactions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get single transaction
// @route   GET /api/marketplace/transactions/:id
// @access  Private
export const getTransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const transaction = await Transaction.findOne({ id: req.params.id });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting transaction",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Update transaction status
// @route   PUT /api/marketplace/transactions/:id/status
// @access  Private (Admin)
export const updateTransactionStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findOneAndUpdate(
      { id: req.params.id },
      {
        paymentStatus: status,
        completedAt:
          status === "completed" ? new Date().toISOString() : undefined,
      },
      { new: true },
    );

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    // If completed, create certificate
    if (status === "completed") {
      const certificate = await Certificate.create({
        id: `CERT-${Date.now()}`,
        transactionId: transaction.id,
        buyerName: transaction.buyerName,
        buyerEmail: transaction.buyerEmail,
        credits: transaction.items.map((item, index) => ({
          listingCategory: item.listingCategory,
          projectName: item.projectName,
          quantity: item.quantity,
          serialNumbers: Array.from(
            { length: Math.min(item.quantity, 5) },
            (_, i) =>
              `${item.listingCategory === "community" ? "WCC" : "WCQ"}-${String(i + 1).padStart(6, "0")}`,
          ),
          certificationStandard: item.certificationStandard,
          vintageYear: item.vintageYear,
        })),
        totalCredits: transaction.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        ),
        issuedAt: new Date().toISOString(),
        blockchainVerified: true,
        blockchainTxHash: transaction.blockchainTxHash,
      });

      // Create contracts
      for (const item of transaction.items) {
        const listing = await Listing.findOne({ id: item.listingId });
        await Contract.create({
          id: `CTR-${Date.now()}-${item.listingId}`,
          transactionId: transaction.id,
          projectId: listing?.projectId || "",
          projectName: item.projectName,
          listingCategory: item.listingCategory,
          seller: item.sellerName,
          buyer: transaction.buyerName,
          province: listing?.location.province || "",
          date: new Date().toISOString().split("T")[0],
          quantity: item.quantity,
          pricePerCredit: item.pricePerTon,
          totalAmount: item.subtotal,
          certificationStandard: item.certificationStandard,
          tradingIntent: item.tradingIntent,
          companyIndustry: item.companyIndustry,
          verifier: listing?.verificationBody || "Verified Body",
          status: "active",
          blockchainTxHash: transaction.blockchainTxHash,
        });

        // Create WCPA
        await WCPA.create({
          id: `WCPA-${Date.now()}-${item.listingId}`,
          contractId: `CTR-${Date.now()}-${item.listingId}`,
          transactionId: transaction.id,
          projectName: item.projectName,
          issuedAt: new Date().toISOString(),
          validUntil: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1),
          ).toISOString(),
        });
      }
    }

    res.json({
      success: true,
      message: "Transaction status updated",
      data: transaction,
    });
  } catch (error) {
    console.error("Update transaction status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating transaction status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get marketplace statistics
// @route   GET /api/marketplace/stats
// @access  Public
export const getMarketplaceStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const listings = await Listing.find({ status: "active" });
    const transactions = await Transaction.find({ paymentStatus: "completed" });

    const stats = {
      totalListings: listings.length,
      communityListings: listings.filter(
        (l) => l.category === "community",
      ).length,
      corporateListings: listings.filter(
        (l) => l.category === "corporate",
      ).length,
      totalCreditsAvailable: listings.reduce(
        (sum, l) => sum + l.availableCredits,
        0,
      ),
      totalTransactions: transactions.length,
      totalCreditsSold: transactions.reduce(
        (sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0),
        0,
      ),
      averagePrice:
        listings.length > 0
          ? listings.reduce((sum, l) => sum + l.pricePerTon, 0) /
            listings.length
          : 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get marketplace stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting marketplace statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
