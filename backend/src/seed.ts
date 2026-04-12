/**
 * Run once to seed your database with the scholarships
 * that were previously hardcoded in React.
 *
 * Usage:  npm run seed
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Scholarship } from "./models/Scholarship";

dotenv.config();

const seedData = [
  {
    title: "DAAD Scholarship",
    country: "Germany",
    funding: "Full / Partial",
    deadline: "2026-06-01",
    description:
      "The DAAD scholarship supports international students pursuing academic studies in Germany.",
    requirements: "Strong academic record, language proficiency (German or English)",
    link: "https://www.daad.de/en/",
    isFeatured: true,
    source: "manual" as const,
  },
  {
    title: "Erasmus+ Scholarship",
    country: "Europe",
    funding: "Full",
    deadline: "2026-05-15",
    description:
      "Erasmus+ supports education, training, youth and sport in Europe.",
    requirements: "EU/EEA enrollment at a participating university",
    link: "https://erasmus-plus.ec.europa.eu/",
    isFeatured: true,
    source: "manual" as const,
  },
  {
    title: "Korean Government Scholarship",
    country: "South Korea",
    funding: "Full",
    deadline: "2026-04-10",
    description:
      "KGSP provides scholarships for international students to study at Korean universities.",
    requirements: "Under 25 years old, GPA above 80%",
    link: "https://www.studyinkorea.go.kr/",
    isFeatured: true,
    source: "manual" as const,
  },
];

async function seed() {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/scolario";

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  // Clear old data first
  await Scholarship.deleteMany({});
  console.log("🗑  Cleared existing scholarships");

  // Insert seed data
  await Scholarship.insertMany(seedData);
  console.log(`🌱 Seeded ${seedData.length} scholarships`);

  await mongoose.disconnect();
  console.log("✅ Done. You can now delete this seed file or keep it for resets.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
