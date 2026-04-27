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

// POST /api/notifications/cron-reminders
// Called by a scheduled job (e.g. Railway cron). Protected by CRON_SECRET header.
router.post("/cron-reminders", async (req, res: Response) => {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers["x-cron-secret"] !== secret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const Bookmark = mongoose.models["Bookmark"] ||
      model("Bookmark", new Schema({ userId: Schema.Types.ObjectId, scholarshipId: { type: Schema.Types.ObjectId, ref: "Scholarship" } }, { timestamps: true }));

    const allPrefs = await NotifPrefs.find({ emailEnabled: true });
    let sent = 0;
    const now = new Date();

    for (const prefs of allPrefs) {
      const user = await User.findById(prefs.userId);
      if (!user) continue;

      const bookmarks = await Bookmark.find({ userId: prefs.userId }).populate("scholarshipId");
      const days = prefs.daysBeforeDeadline;

      const upcoming = bookmarks
        .map((b: any) => b.scholarshipId)
        .filter((s: any) => {
          if (!s?.deadline) return false;
          const deadline = new Date(s.deadline);
          const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return daysUntil >= 0 && daysUntil <= days;
        })
        .map((s: any) => ({ title: s.title, deadline: s.deadline, link: s.link }));

      if (upcoming.length === 0) continue;

      await sendDeadlineReminder(user.email, upcoming).catch((e) =>
        console.error(`Reminder failed for ${user.email}:`, e)
      );
      sent++;
    }

    res.json({ message: `Reminders sent to ${sent} user(s).`, sent });
  } catch (err) {
    console.error("Cron reminder error:", err);
    res.status(500).json({ error: "Failed to send cron reminders" });
  }
});

export default router;
