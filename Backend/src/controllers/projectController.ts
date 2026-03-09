import { Request, Response } from "express";
import Project from "../models/Project";
import { AuthRequest } from "../middleware/auth";

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const projectData = {
      ...req.body,
      id: `PROJ-${Date.now()}`,
      ownerEmail: req.user?.email,
      owner: req.user?.name,
      ownerCompany: req.user?.company || "",
      ownerRole: req.user?.role,
    };

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating project",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getProjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { category, status, ownerEmail, page = 1, limit = 10 } = req.query;

    const query: any = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (ownerEmail) query.ownerEmail = ownerEmail;

    const skip = (Number(page) - 1) * Number(limit);

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting projects",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
export const getProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const project = await Project.findOne({ id: req.params.id });

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting project",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const project = await Project.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body },
      { new: true, runValidators: true },
    );

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating project",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Owner or Admin)
export const deleteProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const project = await Project.findOne({ id: req.params.id });

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    // Check ownership
    if (
      project.ownerEmail !== req.user?.email &&
      req.user?.role !== "admin"
    ) {
      res.status(403).json({
        success: false,
        message: "Not authorized to delete this project",
      });
      return;
    }

    await Project.deleteOne({ id: req.params.id });

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting project",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Update verification step
// @route   PUT /api/projects/:id/verification-step
// @access  Private (Admin or VVB)
export const updateVerificationStep = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { stepId, status, verifier, notes } = req.body;
    const project = await Project.findOne({ id: req.params.id });

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    const currentSteps = project.verificationSteps.map((s) => s.toObject());
    const updatedSteps = currentSteps.map((step: any) => {
      if (step.id === stepId) {
        return {
          ...step,
          status,
          verifier: verifier || step.verifier,
          notes: notes || step.notes,
          date:
            status === "completed"
              ? new Date().toISOString().split("T")[0]
              : step.date,
        };
      }
      // Auto-activate next step
      if (step.id === stepId + 1 && status === "completed") {
        return { ...step, status: "active" };
      }
      return step;
    });

    const allCompleted = updatedSteps.every((s: any) => s.status === "completed");

    project.verificationSteps = updatedSteps as any;
    project.verificationStatus = allCompleted
      ? "verified"
      : project.verificationStatus;
    project.status = allCompleted ? "verified" : project.status;

    await project.save();

    res.json({
      success: true,
      message: "Verification step updated",
      data: project,
    });
  } catch (error) {
    console.error("Update verification step error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating verification step",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Assign VVB to project
// @route   PUT /api/projects/:id/assign-vvb
// @access  Private (Admin)
export const assignVVB = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { vvbName, vvbEmail, vvbLink } = req.body;
    const project = await Project.findOneAndUpdate(
      { id: req.params.id },
      {
        vvbAssigned: vvbName,
        vvbContactEmail: vvbEmail,
        vvbVerificationLink: vvbLink,
        status: "under_verification",
      },
      { new: true },
    );

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "VVB assigned successfully",
      data: project,
    });
  } catch (error) {
    console.error("Assign VVB error:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning VVB",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Approve project
// @route   PUT /api/projects/:id/approve
// @access  Private (Admin)
export const approveProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { adminEmail, notes } = req.body;
    const project = await Project.findOneAndUpdate(
      { id: req.params.id },
      {
        status: "under_verification",
        adminApprovalDate: new Date().toISOString(),
        adminApprovedBy: adminEmail,
        adminNotes: notes,
      },
      { new: true },
    );

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Project approved successfully",
      data: project,
    });
  } catch (error) {
    console.error("Approve project error:", error);
    res.status(500).json({
      success: false,
      message: "Error approving project",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Reject project
// @route   PUT /api/projects/:id/reject
// @access  Private (Admin)
export const rejectProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { adminEmail, reason } = req.body;
    const project = await Project.findOneAndUpdate(
      { id: req.params.id },
      {
        status: "rejected",
        verificationStatus: "rejected",
        adminRejectionReason: reason,
      },
      { new: true },
    );

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Project rejected",
      data: project,
    });
  } catch (error) {
    console.error("Reject project error:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting project",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Private
export const getProjectStats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const ownerEmail = req.user?.email;
    const isAdmin = req.user?.role === "admin";

    const query = isAdmin ? {} : { ownerEmail };

    const projects = await Project.find(query);

    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(
        (p) => p.status === "running" || p.status === "under_verification",
      ).length,
      totalCredits: projects.reduce(
        (sum, p) => sum + (p.waterData?.estimatedCredits || 0),
        0,
      ),
      teamMembers: projects.reduce((sum, p) => sum + (p.team?.length || 0), 0),
      marketplaceListings: projects.filter((p) => p.listedInMarketplace).length,
      pendingVerifications: projects.filter(
        (p) => p.status === "pending" || p.status === "under_verification",
      ).length,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get project stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting project statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
