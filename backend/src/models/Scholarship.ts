import mongoose, { Document, Schema } from "mongoose";

export interface IScholarship extends Document {
  title: string;
  country: string;
  funding: string;
  deadline: string;
  description: string;
  requirements: string;
  link: string;
  isFeatured: boolean;
  source: "manual" | "spreadsheet";
  createdAt: Date;
  updatedAt: Date;
}

const ScholarshipSchema = new Schema<IScholarship>(
  {
    title: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    funding: { type: String, required: true, trim: true },
    deadline: { type: String, default: "" },
    description: { type: String, default: "" },
    requirements: { type: String, default: "" },
    link: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
    // Tracks where the data came from
    source: {
      type: String,
      enum: ["manual", "spreadsheet"],
      default: "manual",
    },
  },
  { timestamps: true }
);

export const Scholarship = mongoose.model<IScholarship>(
  "Scholarship",
  ScholarshipSchema
);
