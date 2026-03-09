import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import MRVReport from "../models/MRVReport";
import Project from "../models/Project";
import { AuthRequest } from "../middleware/auth";

// @desc    Get MRV dashboard stats
// @route   GET /api/mrv/stats
// @access  Public
export const getMRVStats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const [total, ready, generating, failed] = await Promise.all([
      MRVReport.countDocuments(),
      MRVReport.countDocuments({ status: "ready" }),
      MRVReport.countDocuments({ status: "generating" }),
      MRVReport.countDocuments({ status: "failed" }),
    ]);

    const byType = await MRVReport.aggregate([
      { $group: { _id: "$reportType", count: { $sum: 1 } } },
    ]);

    const byCategory = await MRVReport.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const totalCredits = await MRVReport.aggregate([
      { $match: { status: "ready" } },
      { $group: { _id: null, total: { $sum: "$credits" } } },
    ]);

    const accuracy =
      total > 0 ? Math.round((ready / total) * 100 * 10) / 10 : 98.5;

    res.json({
      success: true,
      data: {
        total,
        ready,
        generating,
        failed,
        accuracy,
        totalCredits: totalCredits[0]?.total || 0,
        byType: byType.reduce(
          (acc: any, item: any) => {
            acc[item._id] = item.count;
            return acc;
          },
          {} as Record<string, number>,
        ),
        byCategory: byCategory.reduce(
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
      message: "Error fetching MRV stats",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get all MRV reports
// @route   GET /api/mrv/reports
// @access  Public
export const getMRVReports = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { type, category, status, projectId, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (type) query.reportType = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (projectId) query.projectId = projectId;

    // If not admin, show only own reports
    if (req.user && req.user.role !== "admin") {
      query.generatedBy = req.user.email || req.user.name;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
      MRVReport.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      MRVReport.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: reports,
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
      message: "Error fetching MRV reports",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get single MRV report
// @route   GET /api/mrv/reports/:id
// @access  Public
export const getMRVReport = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const report = await MRVReport.findOne({ id: req.params.id });
    if (!report) {
      res.status(404).json({ success: false, message: "Report not found" });
      return;
    }
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching report",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get MRV reports by project
// @route   GET /api/mrv/project/:projectId
// @access  Public
export const getMRVByProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const reports = await MRVReport.find({
      projectId: req.params.projectId,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching project reports",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Generate MRV report from project data
// @route   POST /api/mrv/reports/generate
// @access  Private
export const generateMRVReport = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { projectId, reportType } = req.body;

    if (!projectId || !reportType) {
      res.status(400).json({
        success: false,
        message: "projectId and reportType are required",
      });
      return;
    }

    // Fetch project data
    const project = await Project.findOne({ id: projectId });
    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    const isAccepted = ["verified", "running", "completed"].includes(
      project.status,
    );
    const isCorp = (project as any).category === "corporate";

    // Check if report already exists
    const existing = await MRVReport.findOne({ projectId, reportType });
    if (existing) {
      res.status(409).json({
        success: false,
        message: "Report already exists for this project and type",
        data: existing,
      });
      return;
    }

    const reportId = `rpt-${reportType}-${project.id}-${Date.now()}`;

    const reportData: any = {
      id: reportId,
      projectId: project.id,
      projectName: project.title,
      reportType,
      status: isAccepted ? "ready" : "generating",
      period: new Date(
        project.startDate || project.createdAt || Date.now(),
      )
        .getFullYear()
        .toString(),
      generatedBy:
        req.user?.email ||
        (project.ownerCompany || project.owner),
      location: project.location?.province || "—",
      credits:
        project.waterData?.verifiedCredits ||
        project.waterData?.estimatedCredits,
      category: (project as any).category || "community",
      projectStatus: project.status,
      description: _buildDescription(reportType, project),
      fileSize: _estimateFileSize(reportType),
      data: _buildReportData(reportType, project),
    };

    if (isCorp && (project as any).corporateData) {
      const cd = (project as any).corporateData;
      reportData.industry = cd.industry;
      reportData.surplusDeficit = cd.surplusDeficit;
      reportData.tradingIntent = cd.tradingIntent;
    }

    const report = await MRVReport.create(reportData);

    res.status(201).json({
      success: true,
      message: "MRV report generated successfully",
      data: report,
    });
  } catch (error) {
    console.error("Generate MRV report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating MRV report",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Generate reports for ALL projects (bulk)
// @route   POST /api/mrv/reports/generate-all
// @access  Private (Admin)
export const generateAllReports = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const projects = await Project.find({});
    const created: any[] = [];
    const skipped: any[] = [];

    for (const project of projects) {
      const isAccepted = ["verified", "running", "completed"].includes(
        project.status,
      );
      const isActive = [
        "under_verification",
        "verified",
        "running",
        "completed",
      ].includes(project.status);
      const isCorp = (project as any).category === "corporate";

      const typesToCreate: string[] = ["mrv"];
      if (isAccepted) typesToCreate.push("certificate");
      if (!isCorp && isActive) typesToCreate.push("emission");
      if (isCorp && isActive) typesToCreate.push("audit");
      if (isAccepted) typesToCreate.push("esg");

      for (const rType of typesToCreate) {
        const exists = await MRVReport.findOne({
          projectId: project.id,
          reportType: rType,
        });
        if (exists) {
          skipped.push({ projectId: project.id, type: rType });
          continue;
        }

        const report = await MRVReport.create({
          id: `rpt-${rType}-${project.id}-${Date.now()}-${uuidv4().slice(0, 4)}`,
          projectId: project.id,
          projectName: project.title,
          reportType: rType,
          status: isAccepted ? "ready" : "generating",
          period: new Date(project.startDate || Date.now())
            .getFullYear()
            .toString(),
          generatedBy: project.ownerCompany || project.owner,
          location: project.location?.province || "—",
          credits:
            project.waterData?.verifiedCredits ||
            project.waterData?.estimatedCredits,
          category: (project as any).category || "community",
          projectStatus: project.status,
          description: _buildDescription(rType, project),
          fileSize: _estimateFileSize(rType),
          data: _buildReportData(rType, project),
        });
        created.push(report.id);
      }
    }

    res.json({
      success: true,
      message: `Generated ${created.length} reports, skipped ${skipped.length}`,
      data: { created: created.length, skipped: skipped.length },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating all reports",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Delete MRV report
// @route   DELETE /api/mrv/reports/:id
// @access  Private
export const deleteMRVReport = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const report = await MRVReport.findOne({ id: req.params.id });
    if (!report) {
      res.status(404).json({ success: false, message: "Report not found" });
      return;
    }
    await report.deleteOne();
    res.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting report",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _buildDescription(reportType: string, project: any): string {
  const name = project.title;
  switch (reportType) {
    case "mrv":
      return `Laporan MRV untuk proyek ${name}`;
    case "emission":
      return `Laporan konsumsi & konservasi air — ${name}`;
    case "certificate":
      return `Sertifikat water credit terverifikasi — ${name}`;
    case "esg":
      return `Laporan ESG scoring — ${name}`;
    case "audit":
      return `Laporan audit kuota air — ${name}`;
    default:
      return `Laporan ${reportType} — ${name}`;
  }
}

function _estimateFileSize(reportType: string): string {
  const sizes: Record<string, string> = {
    mrv: "2.4 MB",
    emission: "1.8 MB",
    certificate: "0.9 MB",
    esg: "3.2 MB",
    audit: "2.1 MB",
  };
  return sizes[reportType] || "1.0 MB";
}

function _buildReportData(reportType: string, project: any): Record<string, any> {
  const base = {
    projectId: project.id,
    projectType: project.projectType,
    areaHectares: project.areaHectares,
    location: project.location,
    waterData: project.waterData,
    startDate: project.startDate,
    endDate: project.endDate,
    generatedAt: new Date().toISOString(),
  };

  if (reportType === "certificate") {
    return {
      ...base,
      certificateNumber: `WC-${project.id}-${new Date().getFullYear()}`,
      issuedBy: "HydrEx Water Credit Platform",
      validUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
      ).toISOString(),
      credits: project.waterData?.verifiedCredits,
    };
  }

  if (reportType === "audit" && project.corporateData) {
    return {
      ...base,
      corporateData: project.corporateData,
      auditPeriod: new Date(project.startDate || Date.now())
        .getFullYear()
        .toString(),
    };
  }

  return base;
}
