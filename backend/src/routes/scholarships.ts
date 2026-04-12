import { Router, Request, Response } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { Scholarship } from "../models/Scholarship";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ─── GET /api/scholarships ───────────────────────────────────────────────────
// Returns all scholarships. Add ?featured=true to get only featured ones.
router.get("/", async (req: Request, res: Response) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.featured === "true") {
      filter.isFeatured = true;
    }
    const scholarships = await Scholarship.find(filter).sort({ createdAt: -1 });
    res.json(scholarships);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch scholarships" });
  }
});

// ─── GET /api/scholarships/:id ───────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      res.status(404).json({ error: "Scholarship not found" });
      return;
    }
    res.json(scholarship);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch scholarship" });
  }
});

// ─── POST /api/scholarships ──────────────────────────────────────────────────
// Create a single scholarship manually (from backend admin)
router.post("/", async (req: Request, res: Response) => {
  try {
    const scholarship = new Scholarship({ ...req.body, source: "manual" });
    await scholarship.save();
    res.status(201).json(scholarship);
  } catch (err) {
    res.status(400).json({ error: "Failed to create scholarship" });
  }
});

// ─── PUT /api/scholarships/:id ───────────────────────────────────────────────
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!scholarship) {
      res.status(404).json({ error: "Scholarship not found" });
      return;
    }
    res.json(scholarship);
  } catch (err) {
    res.status(400).json({ error: "Failed to update scholarship" });
  }
});

// ─── DELETE /api/scholarships/:id ───────────────────────────────────────────
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await Scholarship.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete scholarship" });
  }
});

// ─── POST /api/scholarships/import/spreadsheet ──────────────────────────────
// Upload an .xlsx or .csv file — merges into the same collection as manual ones
// Expected columns: Title, Country, Funding, Deadline, Description, Requirements, Link, Featured
router.post(
  "/import/spreadsheet",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // Parse the spreadsheet
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, string>[];

      if (!rows.length) {
        res.status(400).json({ error: "Spreadsheet is empty" });
        return;
      }

      // Map rows to scholarship documents
      const docs = rows.map((row) => ({
        title: row["Title"] || row["title"] || "",
        country: row["Country"] || row["country"] || "",
        funding: row["Funding"] || row["funding"] || "",
        deadline: row["Deadline"] || row["deadline"] || "",
        description: row["Description"] || row["description"] || "",
        requirements: row["Requirements"] || row["requirements"] || "",
        link: row["Link"] || row["link"] || "",
        isFeatured:
          String(row["Featured"] || row["featured"] || "").toLowerCase() ===
          "true",
        source: "spreadsheet" as const,
      }));

      // Insert all — skip duplicates by title+country if they already exist
      let inserted = 0;
      for (const doc of docs) {
        const exists = await Scholarship.findOne({
          title: doc.title,
          country: doc.country,
        });
        if (!exists) {
          await Scholarship.create(doc);
          inserted++;
        }
      }

      res.json({
        message: `Import complete. ${inserted} new scholarships added, ${
          docs.length - inserted
        } skipped (duplicates).`,
        total: docs.length,
        inserted,
        skipped: docs.length - inserted,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to import spreadsheet" });
    }
  }
);

export default router;
