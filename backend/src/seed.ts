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
    degreeLevel: "Master's",
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
    degreeLevel: "Bachelor's",
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
    degreeLevel: "Bachelor's",
    deadline: "2026-04-10",
    description:
      "KGSP provides scholarships for international students to study at Korean universities.",
    requirements: "Under 25 years old, GPA above 80%",
    link: "https://www.studyinkorea.go.kr/",
    isFeatured: true,
    source: "manual" as const,
  },
  {
    title: "Chevening Scholarship",
    country: "United Kingdom",
    funding: "Full",
    degreeLevel: "Master's",
    deadline: "2026-11-05",
    description:
      "The UK government's global scholarship programme, funded by the Foreign, Commonwealth & Development Office.",
    requirements: "Work experience, strong leadership potential, English proficiency",
    link: "https://www.chevening.org/",
    isFeatured: true,
    source: "manual" as const,
  },
  {
    title: "Australia Awards Scholarship",
    country: "Australia",
    funding: "Full",
    degreeLevel: "Master's",
    deadline: "2026-04-30",
    description:
      "Australia Awards are prestigious international scholarships funded by the Australian Government.",
    requirements: "Citizens of eligible countries, relevant work experience",
    link: "https://www.australiaawards.gov.au/",
    isFeatured: false,
    source: "manual" as const,
  },
  {
    title: "Eiffel Excellence Scholarship",
    country: "France",
    funding: "Full",
    degreeLevel: "Master's",
    deadline: "2026-01-10",
    description:
      "The Eiffel Excellence Scholarship supports international students in Master's and PhD programs in France.",
    requirements: "Excellent academic record, under 30 for Master's",
    link: "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence",
    isFeatured: false,
    source: "manual" as const,
  },
  {
    title: "Turkish Government Scholarship",
    country: "Turkey",
    funding: "Full",
    degreeLevel: "Bachelor's",
    deadline: "2026-02-20",
    description:
      "Türkiye Scholarships are awarded by the Turkish Government to international students for undergraduate and graduate studies.",
    requirements: "Under 21 for Bachelor's, min GPA 70%",
    link: "https://turkiyeburslari.gov.tr/",
    isFeatured: false,
    source: "manual" as const,
  },
  {
    title: "Hungarian Government Scholarship",
    country: "Hungary",
    funding: "Full",
    degreeLevel: "Bachelor's",
    deadline: "2026-01-15",
    description:
      "Stipendium Hungaricum enables students from partner countries to study in Hungary.",
    requirements: "Nomination from home country's educational authority",
    link: "https://stipendiumhungaricum.hu/",
    isFeatured: false,
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
