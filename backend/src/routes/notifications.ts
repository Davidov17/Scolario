import { Router, Response } from "express";
import mongoose, { Schema, model, Document } from "mongoose";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { sendDeadlineReminder } from "../services/mailer";

// NotificationPrefs model — stores per-user email notification settings
interface INotifPrefs extends Document {
  userId: mongoose.Types.ObjectId;
  emailEnabled: boolean;
  daysBeforeDeadline: number; // how many days before deadline to send reminder
}

const NotifPrefsSchema = new Schema<INotifPrefs>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    emailEnabled: { type: Boolean, default: true },
    daysBeforeDeadline: { type: Number, default: 7 },
  },
  { timestamps: true }
);
const NotifPrefs = model<INotifPrefs>("NotifPrefs", NotifPrefsSchema);

const router = Router();

// GET /api/notifications/prefs
router.get("/prefs", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const prefs = await NotifPrefs.findOne({ userId: req.userId });
    res.json(prefs || { emailEnabled: true, daysBeforeDeadline: 7 });
  } catch {
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

// PUT /api/notifications/prefs
router.put("/prefs", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { emailEnabled, daysBeforeDeadline } = req.body;
    const prefs = await NotifPrefs.findOneAndUpdate(
      { userId: req.userId },
      { emailEnabled, daysBeforeDeadline },
      { new: true, upsert: true }
    );
    res.json(prefs);
  } catch {
    res.status(500).json({ error: "Failed to save preferences" });
  }
});

// POST /api/notifications/send-reminders
// Triggers deadline reminder emails for the logged-in user's bookmarks
router.post("/send-reminders", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    // Import Bookmark model inline to avoid circular deps
    const Bookmark = mongoose.models["Bookmark"] ||
      model("Bookmark", new Schema({ userId: Schema.Types.ObjectId, scholarshipId: { type: Schema.Types.ObjectId, ref: "Scholarship" } }, { timestamps: true }));

    const bookmarks = await Bookmark.find({ userId: req.userId }).populate("scholarshipId");

    const prefs = await NotifPrefs.findOne({ userId: req.userId });
    const days = prefs?.daysBeforeDeadline ?? 7;

    const now = new Date();
    const upcoming = bookmarks
      .map((b: any) => b.scholarshipId)
      .filter((s: any) => {
        if (!s?.deadline) return false;
        const deadline = new Date(s.deadline);
        const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntil >= 0 && daysUntil <= days;
      })
      .map((s: any) => ({ title: s.title, deadline: s.deadline, link: s.link }));

    if (upcoming.length === 0) {
      res.json({ message: "No upcoming deadlines within your reminder window.", sent: false });
      return;
    }

    const previewUrl = await sendDeadlineReminder(user.email, upcoming);
    res.json({
      message: `Reminder sent for ${upcoming.length} scholarship${upcoming.length > 1 ? "s" : ""}.`,
      sent: true,
      previewUrl, // Ethereal preview URL for development
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send reminders" });
  }
});

export default router;
