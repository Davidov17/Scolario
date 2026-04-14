/**
 * Creates or promotes a user to admin.
 * Usage:  npm run create-admin
 * It will prompt for email + password, or you can set:
 *   ADMIN_EMAIL and ADMIN_PASSWORD environment variables.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import * as readline from "readline";
import { User } from "./models/User";

dotenv.config();

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/scolario";
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const email = process.env.ADMIN_EMAIL || await prompt("Admin email: ");
  const password = process.env.ADMIN_PASSWORD || await prompt("Admin password (min 8 chars): ");

  if (!email || !password) {
    console.error("❌ Email and password are required.");
    process.exit(1);
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });

  if (existing) {
    // Promote existing user to admin
    existing.isAdmin = true;
    await existing.save();
    console.log(`✅ User "${existing.firstName} ${existing.lastName}" (${existing.email}) promoted to admin.`);
  } else {
    // Create new admin user
    const [firstName, ...rest] = email.split("@")[0].split(".");
    const user = new User({
      firstName: firstName || "Admin",
      lastName: rest.join(" ") || "User",
      email: email.toLowerCase().trim(),
      password,
      isAdmin: true,
    });
    await user.save();
    console.log(`✅ Admin account created: ${user.email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
