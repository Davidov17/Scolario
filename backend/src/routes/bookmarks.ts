import { Router, Response } from "express";
import mongoose, { Schema, model, Document } from "mongoose";
import { requireAuth, AuthRequest } from "../middleware/auth";

// Inline model — simple enough to not need a separate file
interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  scholarshipId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scholarshipId: { type: Schema.Types.ObjectId, ref: "Scholarship", required: true },
  },
  { timestamps: true }
);
BookmarkSchema.index({ userId: 1, scholarshipId: 1 }, { unique: true });
const Bookmark = model<IBookmark>("Bookmark", BookmarkSchema);

const router = Router();

// GET /api/bookmarks — list bookmarked scholarship IDs for the logged-in user
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.userId }).populate("scholarshipId");
    res.json(bookmarks.map((b) => b.scholarshipId));
  } catch {
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// POST /api/bookmarks/:scholarshipId — toggle bookmark
router.post("/:scholarshipId", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { scholarshipId } = req.params;
    const existing = await Bookmark.findOne({ userId: req.userId, scholarshipId });
    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      res.json({ bookmarked: false });
    } else {
      await Bookmark.create({ userId: req.userId, scholarshipId });
      res.json({ bookmarked: true });
    }
  } catch {
    res.status(500).json({ error: "Failed to toggle bookmark" });
  }
});

export default router;
