import { Router, Response } from "express";
import { requireAdmin, AuthRequest } from "../middleware/auth";
import { runScholarshipAgent, SOURCES } from "../agent/scholarshipAgent";

const router = Router();

/**
 * POST /api/agent/run
 * Triggers the scholarship scraping agent (no API key required).
 * Admin-only.
 *
 * Response:
 *   { message, saved, skipped, errors, logs }
 */
router.post("/run", requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const logs: string[] = [];
    const result = await runScholarshipAgent(SOURCES, (msg) => logs.push(msg));

    res.json({
      message: `Agent finished. ${result.saved} scholarship(s) saved, ${result.skipped} skipped.`,
      saved: result.saved,
      skipped: result.skipped,
      errors: result.errors,
      logs,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Agent route error:", err);
    res.status(500).json({ error: "Agent failed: " + msg });
  }
});

/**
 * GET /api/agent/sources
 * Returns the list of sources the agent scrapes.
 */
router.get("/sources", requireAdmin, (_req: AuthRequest, res: Response) => {
  res.json({ sources: SOURCES.map((s) => ({ name: s.name, urls: s.listingUrls })) });
});

export default router;
