import { Request, Response } from "express";
import ESGScoring from "../models/ESGScoring";
import { AuthRequest } from "../middleware/auth";

// Helper function to calculate ESG grade
const calculateGrade = (score: number): string => {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 60) return "D";
  return "F";
};

// Helper function to derive status
const deriveStatus = (overallScore: number, gateChecks: any): string => {
  const allGatesPassed = Object.values(gateChecks).every(Boolean);
  if (!allGatesPassed) return "not_eligible";
  if (overallScore >= 80) return "eligible";
  if (overallScore >= 65) return "conditional";
  return "not_eligible";
};

// @desc    Create ESG scoring
// @route   POST /api/esg
// @access  Private
export const createESGScoring = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const esgData = {
      ...req.body,
      id: `ESG-${Date.now()}`,
    };

    const esg = await ESGScoring.create(esgData);

    res.status(201).json({
      success: true,
      message: "ESG scoring created successfully",
      data: esg,
    });
  } catch (error) {
    console.error("Create ESG error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating ESG scoring",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get all ESG scorings
// @route   GET /api/esg
// @access  Public
export const getESGScorings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId, status, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const esgScorings = await ESGScoring.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ESGScoring.countDocuments(query);

    res.json({
      success: true,
      data: esgScorings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get ESG scorings error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting ESG scorings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get single ESG scoring
// @route   GET /api/esg/:id
// @access  Public
export const getESGScoring = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const esg = await ESGScoring.findOne({ id: req.params.id });

    if (!esg) {
      res.status(404).json({
        success: false,
        message: "ESG scoring not found",
      });
      return;
    }

    res.json({
      success: true,
      data: esg,
    });
  } catch (error) {
    console.error("Get ESG scoring error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting ESG scoring",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get ESG by project
// @route   GET /api/esg/project/:projectId
// @access  Public
export const getESGByProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const esg = await ESGScoring.findOne({ projectId: req.params.projectId });

    if (!esg) {
      res.status(404).json({
        success: false,
        message: "ESG scoring not found for this project",
      });
      return;
    }

    res.json({
      success: true,
      data: esg,
    });
  } catch (error) {
    console.error("Get ESG by project error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting ESG scoring",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Update ESG scoring
// @route   PUT /api/esg/:id
// @access  Private
export const updateESGScoring = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const esg = await ESGScoring.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!esg) {
      res.status(404).json({
        success: false,
        message: "ESG scoring not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "ESG scoring updated successfully",
      data: esg,
    });
  } catch (error) {
    console.error("Update ESG error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating ESG scoring",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Update ESG indicator
// @route   PUT /api/esg/:id/indicator/:indicatorId
// @access  Private
export const updateIndicator = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { score, status, evidence, notes } = req.body;
    const esg = await ESGScoring.findOne({ id: req.params.id });

    if (!esg) {
      res.status(404).json({
        success: false,
        message: "ESG scoring not found",
      });
      return;
    }

    const updatedIndicators = esg.indicators.map((ind: any) => {
      if (ind.id === req.params.indicatorId) {
        return {
          ...ind.toObject(),
          score: score !== undefined ? score : ind.score,
          status: status !== undefined ? status : ind.status,
          evidence: evidence !== undefined ? evidence : ind.evidence,
          notes: notes !== undefined ? notes : ind.notes,
          lastUpdated: new Date().toISOString(),
        };
      }
      return ind.toObject();
    });

    // Recalculate scores
    const eInds = updatedIndicators.filter((i: any) => i.category === "E");
    const sInds = updatedIndicators.filter((i: any) => i.category === "S");
    const gInds = updatedIndicators.filter((i: any) => i.category === "G");

    const calcCategoryScore = (inds: any[]) => {
      const totalWeight = inds.reduce((sum, i) => sum + i.weight, 0);
      if (totalWeight === 0) return 0;
      return Math.round(
        inds.reduce((sum, i) => sum + (i.score * i.weight) / totalWeight, 0),
      );
    };

    const eScore = calcCategoryScore(eInds);
    const sScore = calcCategoryScore(sInds);
    const gScore = calcCategoryScore(gInds);

    const weights = esg.weights;
    const overallScore = Math.round(
      eScore * (weights.E / 100) +
        sScore * (weights.S / 100) +
        gScore * (weights.G / 100),
    );

    const grade = calculateGrade(overallScore);
    const newStatus = deriveStatus(overallScore, { ...esg.gateChecks });

    esg.indicators = updatedIndicators as any;
    esg.eScore = eScore;
    esg.sScore = sScore;
    esg.gScore = gScore;
    esg.overallScore = overallScore;
    esg.grade = grade as any;
    esg.status = newStatus as any;

    await esg.save();

    res.json({
      success: true,
      message: "Indicator updated successfully",
      data: esg,
    });
  } catch (error) {
    console.error("Update indicator error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating indicator",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Update gate check
// @route   PUT /api/esg/:id/gate-check
// @access  Private
export const updateGateCheck = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { checkName, value } = req.body;
    const esg = await ESGScoring.findOne({ id: req.params.id });

    if (!esg) {
      res.status(404).json({
        success: false,
        message: "ESG scoring not found",
      });
      return;
    }

    const currentGateChecks = { ...esg.gateChecks };
    const updatedGateChecks = { ...currentGateChecks, [checkName]: value };
    Object.assign(esg.gateChecks, updatedGateChecks);

    // Recalculate status
    const newStatus = deriveStatus(esg.overallScore, updatedGateChecks);
    esg.status = newStatus as any;

    await esg.save();

    res.json({
      success: true,
      message: "Gate check updated",
      data: esg,
    });
  } catch (error) {
    console.error("Update gate check error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating gate check",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Lock/Unlock ESG scoring
// @route   PUT /api/esg/:id/lock
// @access  Private (Admin)
export const lockESGScoring = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { locked, lockedBy } = req.body;
    const esg = await ESGScoring.findOneAndUpdate(
      { id: req.params.id },
      {
        locked,
        lastReviewedBy: lockedBy,
        lastReviewedAt: locked ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      },
      { new: true },
    );

    if (!esg) {
      res.status(404).json({
        success: false,
        message: "ESG scoring not found",
      });
      return;
    }

    res.json({
      success: true,
      message: `ESG scoring ${locked ? "locked" : "unlocked"} successfully`,
      data: esg,
    });
  } catch (error) {
    console.error("Lock ESG error:", error);
    res.status(500).json({
      success: false,
      message: "Error locking ESG scoring",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get ESG statistics
// @route   GET /api/esg/stats
// @access  Public
export const getESGStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const esgScorings = await ESGScoring.find();

    const stats = {
      totalScorings: esgScorings.length,
      eligible: esgScorings.filter((s) => s.status === "eligible").length,
      conditional: esgScorings.filter((s) => s.status === "conditional").length,
      notEligible: esgScorings.filter((s) => s.status === "not_eligible")
        .length,
      pending: esgScorings.filter((s) => s.status === "pending").length,
      averageScore:
        esgScorings.length > 0
          ? Math.round(
              esgScorings.reduce((sum, s) => sum + s.overallScore, 0) /
                esgScorings.length,
            )
          : 0,
      averageEScore:
        esgScorings.length > 0
          ? Math.round(
              esgScorings.reduce((sum, s) => sum + s.eScore, 0) /
                esgScorings.length,
            )
          : 0,
      averageSScore:
        esgScorings.length > 0
          ? Math.round(
              esgScorings.reduce((sum, s) => sum + s.sScore, 0) /
                esgScorings.length,
            )
          : 0,
      averageGScore:
        esgScorings.length > 0
          ? Math.round(
              esgScorings.reduce((sum, s) => sum + s.gScore, 0) /
                esgScorings.length,
            )
          : 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get ESG stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting ESG statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
