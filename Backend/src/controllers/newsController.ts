import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import News from "../models/News";
import { AuthRequest } from "../middleware/auth";

// @desc    Get all published news
// @route   GET /api/news
// @access  Public
export const getNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    const query: any = { isPublished: true };
    if (category && category !== "all") query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search as string, "i")] } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [news, total] = await Promise.all([
      News.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("-content"), // exclude full content in list
      News.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: news,
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
      message: "Error fetching news",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get all news (admin — including unpublished)
// @route   GET /api/news/admin
// @access  Private (Admin)
export const getAllNewsAdmin = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [news, total] = await Promise.all([
      News.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("-content"),
      News.countDocuments(),
    ]);

    res.json({
      success: true,
      data: news,
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
      message: "Error fetching news",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get single news item
// @route   GET /api/news/:id
// @access  Public
export const getNewsItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const item = await News.findOne({ id: req.params.id, isPublished: true });
    if (!item) {
      res.status(404).json({ success: false, message: "News not found" });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching news",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Create news
// @route   POST /api/news
// @access  Private (Admin)
export const createNews = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      title,
      summary,
      content,
      category,
      imageUrl,
      tags,
      isPublished,
      source,
      externalUrl,
    } = req.body;

    if (!title || !summary || !content) {
      res.status(400).json({
        success: false,
        message: "Title, summary and content are required",
      });
      return;
    }

    const news = await News.create({
      id: `news-${uuidv4()}`,
      title,
      summary,
      content,
      author: req.user?.name || "Admin",
      authorId: req.user?._id?.toString() || "",
      category: category || "general",
      imageUrl,
      tags: tags || [],
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date().toISOString() : undefined,
      viewCount: 0,
      source,
      externalUrl,
    });

    res.status(201).json({
      success: true,
      message: "News created successfully",
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating news",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Private (Admin)
export const updateNews = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const item = await News.findOne({ id: req.params.id });
    if (!item) {
      res.status(404).json({ success: false, message: "News not found" });
      return;
    }

    const { title, summary, content, category, imageUrl, tags, isPublished, source, externalUrl } =
      req.body;

    if (title) item.title = title;
    if (summary) item.summary = summary;
    if (content) item.content = content;
    if (category) item.category = category;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    if (tags) item.tags = tags;
    if (source) item.source = source;
    if (externalUrl) item.externalUrl = externalUrl;

    // Handle publish toggle
    if (isPublished !== undefined && isPublished !== item.isPublished) {
      item.isPublished = isPublished;
      if (isPublished && !item.publishedAt) {
        item.publishedAt = new Date().toISOString();
      }
    }

    await item.save();
    res.json({ success: true, message: "News updated", data: item });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating news",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private (Admin)
export const deleteNews = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const item = await News.findOne({ id: req.params.id });
    if (!item) {
      res.status(404).json({ success: false, message: "News not found" });
      return;
    }
    await item.deleteOne();
    res.json({ success: true, message: "News deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting news",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Increment news view
// @route   PUT /api/news/:id/view
// @access  Public
export const incrementView = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await News.findOneAndUpdate({ id: req.params.id }, { $inc: { viewCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating view" });
  }
};

// @desc    Get news stats
// @route   GET /api/news/stats
// @access  Public
export const getNewsStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const [total, published, byCategory] = await Promise.all([
      News.countDocuments(),
      News.countDocuments({ isPublished: true }),
      News.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    const totalViews = await News.aggregate([
      { $group: { _id: null, total: { $sum: "$viewCount" } } },
    ]);

    res.json({
      success: true,
      data: {
        total,
        published,
        draft: total - published,
        totalViews: totalViews[0]?.total || 0,
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
      message: "Error fetching news stats",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
