import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import ForumPost from "../models/ForumPost";
import { AuthRequest } from "../middleware/auth";

// @desc    Get all forum posts
// @route   GET /api/forum/posts
// @access  Public
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      search,
      page = 1,
      limit = 20,
      sort = "latest",
    } = req.query;

    const query: any = { isApproved: true };
    if (category && category !== "all") query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search as string, "i")] } },
      ];
    }

    let sortOption: any = { isPinned: -1, createdAt: -1 };
    if (sort === "popular") sortOption = { isPinned: -1, likes: -1 };
    if (sort === "mostReplied") sortOption = { isPinned: -1, "replies.length": -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      ForumPost.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .select("-replies"), // exclude replies in list for performance
      ForumPost.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: posts,
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
      message: "Error fetching posts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get single forum post (with replies)
// @route   GET /api/forum/posts/:id
// @access  Public
export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await ForumPost.findOne({ id: req.params.id });
    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Create forum post
// @route   POST /api/forum/posts
// @access  Private
export const createPost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, content, category, tags, imageUrl } = req.body;

    if (!title || !content) {
      res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
      return;
    }

    const post = await ForumPost.create({
      id: `forum-${uuidv4()}`,
      title,
      content,
      category: category || "general",
      tags: tags || [],
      imageUrl,
      author: req.user?.name || "Anonymous",
      authorRole: req.user?.role || "member",
      authorId: req.user?._id?.toString() || "",
      likes: 0,
      likedBy: [],
      views: 0,
      replies: [],
      isPinned: false,
      isLocked: false,
      isApproved: true,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Update forum post
// @route   PUT /api/forum/posts/:id
// @access  Private
export const updatePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const post = await ForumPost.findOne({ id: req.params.id });
    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }

    const userId = req.user?._id?.toString();
    const isAdmin = req.user?.role === "admin";
    if (post.authorId !== userId && !isAdmin) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    const { title, content, category, tags, isPinned, isLocked } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (tags) post.tags = tags;
    if (isAdmin && isPinned !== undefined) post.isPinned = isPinned;
    if (isAdmin && isLocked !== undefined) post.isLocked = isLocked;

    await post.save();
    res.json({ success: true, message: "Post updated", data: post });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Delete forum post
// @route   DELETE /api/forum/posts/:id
// @access  Private
export const deletePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const post = await ForumPost.findOne({ id: req.params.id });
    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }

    const userId = req.user?._id?.toString();
    const isAdmin = req.user?.role === "admin";
    if (post.authorId !== userId && !isAdmin) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    await post.deleteOne();
    res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Like / unlike forum post
// @route   PUT /api/forum/posts/:id/like
// @access  Private
export const likePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const post = await ForumPost.findOne({ id: req.params.id });
    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }

    const userId = req.user?._id?.toString() || "";
    const alreadyLiked = post.likedBy.includes(userId);

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((id) => id !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await post.save();
    res.json({
      success: true,
      message: alreadyLiked ? "Like removed" : "Post liked",
      data: { likes: post.likes, liked: !alreadyLiked },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling like",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Add reply to post
// @route   POST /api/forum/posts/:id/reply
// @access  Private
export const addReply = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const post = await ForumPost.findOne({ id: req.params.id });
    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }
    if (post.isLocked) {
      res.status(403).json({ success: false, message: "Post is locked" });
      return;
    }

    const { content } = req.body;
    if (!content) {
      res.status(400).json({ success: false, message: "Content is required" });
      return;
    }

    const reply = {
      id: `reply-${uuidv4()}`,
      content,
      author: req.user?.name || "Anonymous",
      authorRole: req.user?.role || "member",
      authorId: req.user?._id?.toString() || "",
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    };

    post.replies.push(reply as any);
    await post.save();

    res.status(201).json({
      success: true,
      message: "Reply added",
      data: reply,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding reply",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Delete reply
// @route   DELETE /api/forum/posts/:id/reply/:replyId
// @access  Private
export const deleteReply = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const post = await ForumPost.findOne({ id: req.params.id });
    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }

    const userId = req.user?._id?.toString();
    const isAdmin = req.user?.role === "admin";
    const reply = post.replies.find((r) => r.id === req.params.replyId);

    if (!reply) {
      res.status(404).json({ success: false, message: "Reply not found" });
      return;
    }

    if (reply.authorId !== userId && !isAdmin) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    post.replies = post.replies.filter(
      (r) => r.id !== req.params.replyId,
    ) as any;
    await post.save();

    res.json({ success: true, message: "Reply deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting reply",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get forum stats
// @route   GET /api/forum/stats
// @access  Public
export const getForumStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const [total, byCategory] = await Promise.all([
      ForumPost.countDocuments({ isApproved: true }),
      ForumPost.aggregate([
        { $match: { isApproved: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    const totalReplies = await ForumPost.aggregate([
      { $project: { replyCount: { $size: "$replies" } } },
      { $group: { _id: null, total: { $sum: "$replyCount" } } },
    ]);

    res.json({
      success: true,
      data: {
        totalPosts: total,
        totalReplies: totalReplies[0]?.total || 0,
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
      message: "Error fetching forum stats",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
