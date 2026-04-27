import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { sendVerificationCode, sendPasswordChangeConfirmation } from "../services/mailer";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/signup
// Creates an unverified user and sends a 6-digit code to their email.
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      if (!existing.isVerified) {
        const code = generateCode();
        existing.verificationCode = code;
        existing.verificationCodeExpiry = new Date(Date.now() + 1000 * 60 * 60);
        await existing.save();
        sendVerificationCode(existing.email, code, "signup").catch((e) =>
          console.error("Email send failed:", e)
        );
        res.status(200).json({ needsVerification: true, email: existing.email });
        return;
      }
      res.status(400).json({ error: "An account with this email already exists." });
      return;
    }

    const code = generateCode();
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      password,
      isVerified: false,
      verificationCode: code,
      verificationCodeExpiry: new Date(Date.now() + 1000 * 60 * 60),
    });
    await user.save();

    // Don't await — email failure should not block the signup response
    sendVerificationCode(user.email, code, "signup").catch((e) =>
      console.error("Email send failed:", e)
    );

    res.status(201).json({ needsVerification: true, email: user.email });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed. Please try again." });
  }
});

// POST /api/auth/verify-signup
// { email, code } → mark user verified, return JWT.
router.post("/verify-signup", async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ error: "Email and code are required." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(400).json({ error: "Invalid verification code." });
      return;
    }

    if (
      user.verificationCode !== code ||
      !user.verificationCodeExpiry ||
      user.verificationCodeExpiry < new Date()
    ) {
      res.status(400).json({ error: "Invalid or expired verification code." });
      return;
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();

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
    console.error("Verify signup error:", err);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// POST /api/auth/resend-code
// { email } → regenerate and resend the verification code.
router.post("/resend-code", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.isVerified) {
      // Don't reveal whether user exists
      res.json({ message: "If an unverified account exists, a new code has been sent." });
      return;
    }

    const code = generateCode();
    user.verificationCode = code;
    user.verificationCodeExpiry = new Date(Date.now() + 1000 * 60 * 60);
    await user.save();

    sendVerificationCode(user.email, code, "signup").catch((e) =>
      console.error("Email send failed:", e)
    );
    res.json({ message: "A new verification code has been sent to your email." });
  } catch (err) {
    console.error("Resend code error:", err);
    res.status(500).json({ error: "Failed to resend code." });
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

    if (!user.isVerified) {
      // Resend a fresh code so they can complete signup
      const code = generateCode();
      user.verificationCode = code;
      user.verificationCodeExpiry = new Date(Date.now() + 1000 * 60 * 60);
      await user.save();
      sendVerificationCode(user.email, code, "signup").catch((e) =>
        console.error("Email send failed:", e)
      );
      res.status(403).json({
        error: "Please verify your email before logging in.",
        needsVerification: true,
        email: user.email,
      });
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
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// POST /api/auth/forgot-password
// Sends a 6-digit reset code to the user's email.
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.json({ message: "If an account exists, a reset code has been sent to your email." });
      return;
    }

    const code = generateCode();
    user.resetToken = code;
    user.resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60);
    await user.save();

    sendVerificationCode(user.email, code, "reset").catch((e) =>
      console.error("Email send failed:", e)
    );

    res.json({ message: "A password reset code has been sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Failed to send reset code." });
  }
});

// POST /api/auth/reset-password
// { email, code, password } → verify code, update password.
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) {
      res.status(400).json({ error: "Email, code, and new password are required." });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters." });
      return;
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetToken: code,
      resetTokenExpiry: { $gt: new Date() },
    });
    if (!user) {
      res.status(400).json({ error: "Invalid or expired reset code." });
      return;
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password." });
  }
});

// POST /api/auth/change-password
// Authenticated users change their password by providing the current one.
router.post("/change-password", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Current and new password are required." });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: "New password must be at least 8 characters." });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) { res.status(404).json({ error: "User not found." }); return; }

    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      res.status(401).json({ error: "Current password is incorrect." });
      return;
    }

    user.password = newPassword;
    await user.save();

    sendPasswordChangeConfirmation(user.email, user.firstName).catch((e) =>
      console.error("Password change email failed:", e)
    );

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Failed to change password." });
  }
});

export default router;
