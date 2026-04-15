/**
 * CLI runner for the scholarship scraping agent.
 * Usage:  npm run agent
 */

import "dotenv/config";
import mongoose from "mongoose";
import { runScholarshipAgent, SOURCES } from "./scholarshipAgent";

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌  MONGODB_URI is not set. Check your .env file.");
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("✅  Connected to MongoDB\n");

  console.log(`🤖  Starting scholarship scraper — ${SOURCES.length} source(s):`);
  SOURCES.forEach((s) => console.log(`    • ${s.name}`));
  console.log();

  const result = await runScholarshipAgent(SOURCES);

  console.log("\n─── Scraper finished ──────────────────────────────────────");
  console.log(`✅  Saved:   ${result.saved} scholarships`);
  console.log(`⏭️   Skipped: ${result.skipped} (duplicates or missing data)`);
  if (result.errors.length) {
    console.log(`❌  Errors:  ${result.errors.length}`);
    result.errors.forEach((e) => console.log(`    • ${e}`));
  }
  console.log("──────────────────────────────────────────────────────────\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
