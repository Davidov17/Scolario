import { Router, Response } from "express";
import { Profile } from "../models/Profile";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/profile — get the logged-in user's profile
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json(profile);
  } catch {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT /api/profile — create or update the logged-in user's profile
router.put("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { certDocs, ...profileData } = req.body; // strip certDocs (binary, not stored in DB)
    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { ...profileData, userId: req.userId },
      { new: true, upsert: true, runValidators: false }
    );
    res.json(profile);
  } catch {
    res.status(500).json({ error: "Failed to save profile" });
  }
});

export default router;
