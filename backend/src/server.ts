import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import scholarshipRoutes from "./routes/scholarships";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import bookmarkRoutes from "./routes/bookmarks";
import applicationRoutes from "./routes/applications";
import notificationRoutes from "./routes/notifications";
import userRoutes from "./routes/users";
import agentRoutes from "./routes/agent";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/scolario";

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/agent", agentRoutes);

app.get("/", (_req, res) => {
  res.json({ status: "Scolario API is running" });
});

// ─── Connect to MongoDB & start server ───────────────────────────────────────
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

export default app;
