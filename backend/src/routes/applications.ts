import { Router, Response } from "express";
import mongoose, { Schema, model, Document } from "mongoose";
import { requireAuth, AuthRequest } from "../middleware/auth";

type AppStatus = "saved" | "applied" | "pending" | "accepted" | "rejected";

interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  scholarshipId: mongoose.Types.ObjectId;
  status: AppStatus;
  notes: string;
  appliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scholarshipId: { type: Schema.Types.ObjectId, ref: "Scholarship", required: true },
    status: {
      type: String,
      enum: ["saved", "applied", "pending", "accepted", "rejected"],
      default: "saved",
    },
    notes: { type: String, default: "" },
    appliedAt: { type: Date },
  },
  { timestamps: true }
);
ApplicationSchema.index({ userId: 1, scholarshipId: 1 }, { unique: true });
const Application = model<IApplication>("Application", ApplicationSchema);

const router = Router();

// GET /api/applications — get all applications for the logged-in user
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const apps = await Application.find({ userId: req.userId })
      .populate("scholarshipId")
      .sort({ updatedAt: -1 });
    res.json(apps);
  } catch {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// GET /api/applications/:scholarshipId — get status for a specific scholarship
router.get("/:scholarshipId", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const app = await Application.findOne({
      userId: req.userId,
      scholarshipId: req.params.scholarshipId,
    });
    res.json(app || null);
  } catch {
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

// PUT /api/applications/:scholarshipId — upsert status + notes
router.put("/:scholarshipId", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { status, notes } = req.body;
    const update: Partial<IApplication> = { status, notes };
    if (status === "applied" && !req.body.appliedAt) {
      update.appliedAt = new Date();
    }
    const app = await Application.findOneAndUpdate(
      { userId: req.userId, scholarshipId: req.params.scholarshipId },
      update,
      { new: true, upsert: true }
    );
    res.json(app);
  } catch {
    res.status(500).json({ error: "Failed to update application" });
  }
});

// DELETE /api/applications/:scholarshipId — remove tracking
router.delete("/:scholarshipId", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await Application.deleteOne({ userId: req.userId, scholarshipId: req.params.scholarshipId });
    res.json({ message: "Removed" });
  } catch {
    res.status(500).json({ error: "Failed to remove application" });
  }
});

export default router;
