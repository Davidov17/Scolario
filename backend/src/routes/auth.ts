import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// POST /api/auth/signup
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(400).json({ error: "An account with this email already exists." });
      return;
    }

    const user = new User({ firstName, lastName, email: email.toLowerCase().trim(), password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, firstName: user.firstName, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (err) {
    res.status(500).json({ error: "Signup failed. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const valid = await user.comparePassword(password.trim());
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, firstName: user.firstName, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// POST /api/auth/forgot-password
// Returns the reset token in the response (no email server — UI can display or copy it)
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) { res.status(400).json({ error: "Email is required." }); return; }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Don't reveal whether user exists
      res.json({ message: "If an account exists, a reset token has been generated.", token: null });
      return;
    }
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await user.save();
    res.json({
      message: "Reset token generated. Copy it and use it to reset your password.",
      token, // In production, this would be emailed instead
    });
  } catch {
    res.status(500).json({ error: "Failed to generate reset token." });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) { res.status(400).json({ error: "Token and new password are required." }); return; }
    if (password.length < 8) { res.status(400).json({ error: "Password must be at least 8 characters." }); return; }
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });
    if (!user) { res.status(400).json({ error: "Invalid or expired reset token." }); return; }
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ message: "Password reset successfully. You can now log in." });
  } catch {
    res.status(500).json({ error: "Failed to reset password." });
  }
});

export default router;
