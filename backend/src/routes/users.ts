import { Router, Response } from "express";
import { User } from "../models/User";
import { AuthRequest, requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/users — list all users (admin only)
router.get("/", requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({}, { password: 0, resetToken: 0, resetTokenExpiry: 0 }).sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// PATCH /api/users/:id/toggle-admin — promote/demote admin (admin only)
router.patch("/:id/toggle-admin", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404).json({ error: "User not found." }); return; }
    // Prevent self-demotion
    if (user._id.toString() === req.userId) {
      res.status(400).json({ error: "You cannot change your own admin status." });
      return;
    }
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json({ isAdmin: user.isAdmin });
  } catch {
    res.status(500).json({ error: "Failed to update user." });
  }
});

// DELETE /api/users/:id — delete a user (admin only)
router.delete("/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (req.params.id === req.userId) {
      res.status(400).json({ error: "You cannot delete your own account." });
      return;
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted." });
  } catch {
    res.status(500).json({ error: "Failed to delete user." });
  }
});

export default router;
