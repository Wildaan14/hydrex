import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import BlockchainRecord from "../models/BlockchainRecord";
import { AuthRequest } from "../middleware/auth";

// @desc    Get all blockchain records
// @route   GET /api/blockchain/records
// @access  Public
export const getBlockchainRecords = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId, action, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (projectId) query.projectId = projectId;
    if (action) query.action = action;

    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      BlockchainRecord.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      BlockchainRecord.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blockchain records",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get blockchain records by project
// @route   GET /api/blockchain/project/:projectId
// @access  Public
export const getRecordsByProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const records = await BlockchainRecord.find({
      projectId: req.params.projectId,
    }).sort({ timestamp: -1 });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching project records",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Add blockchain record
// @route   POST /api/blockchain/records
// @access  Private
export const addBlockchainRecord = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { projectId, projectTitle, action, amount, unit, metadata } =
      req.body;

    if (!projectId || !projectTitle || !action) {
      res.status(400).json({
        success: false,
        message: "projectId, projectTitle and action are required",
      });
      return;
    }

    // Generate blockchain-like hash
    const txHash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("")}`;

    const record = await BlockchainRecord.create({
      id: `bc-${uuidv4()}`,
      projectId,
      projectTitle,
      action,
      txHash,
      blockNumber: Math.floor(18_000_000 + Math.random() * 1_000_000),
      timestamp: new Date().toISOString(),
      dataHash: `0x${uuidv4().replace(/-/g, "")}`,
      verifier: req.user?.name || "System",
      amount,
      unit: unit || "m³",
      metadata: metadata || {},
    });

    res.status(201).json({
      success: true,
      message: "Blockchain record added",
      data: record,
    });
  } catch (error) {
    console.error("Add blockchain record error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding blockchain record",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get blockchain stats
// @route   GET /api/blockchain/stats
// @access  Public
export const getBlockchainStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const [total, byAction] = await Promise.all([
      BlockchainRecord.countDocuments(),
      BlockchainRecord.aggregate([
        { $group: { _id: "$action", count: { $sum: 1 } } },
      ]),
    ]);

    const totalCredits = await BlockchainRecord.aggregate([
      { $match: { action: "credited" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      success: true,
      data: {
        totalRecords: total,
        totalCredits: totalCredits[0]?.total || 0,
        byAction: byAction.reduce(
          (acc: any, item: any) => {
            acc[item._id] = item.count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blockchain stats",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
