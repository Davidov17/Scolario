import mongoose, { Document, Schema } from "mongoose";

export interface ILangCert {
  name: string;
  minScore: string;
}

export interface IRequirements {
  age: { enabled: boolean; min: number; max: number };
  educationLevel: { enabled: boolean; levels: string[] };
  languageCertificates: { enabled: boolean; items: ILangCert[] };
  personalEssay: boolean;
  recommendationLetters: { enabled: boolean; count: number };
  motivationLetter: boolean;
  cv: boolean;
  portfolio: boolean;
  notes: string;
}

export interface IScholarship extends Document {
  title: string;
  country: string;
  funding: string;
  degreeLevel: string;
  deadline: string;
  description: string;
  requirements: IRequirements;
  link: string;
  isFeatured: boolean;
  source: "manual" | "spreadsheet";
  createdAt: Date;
  updatedAt: Date;
}

const LangCertSchema = new Schema<ILangCert>({ name: String, minScore: String }, { _id: false });

const RequirementsSchema = new Schema<IRequirements>(
  {
    age:                  { enabled: { type: Boolean, default: false }, min: { type: Number, default: 0 }, max: { type: Number, default: 0 } },
    educationLevel:       { enabled: { type: Boolean, default: false }, levels: { type: [String], default: [] } },
    languageCertificates: { enabled: { type: Boolean, default: false }, items: { type: [LangCertSchema], default: [] } },
    personalEssay:        { type: Boolean, default: false },
    recommendationLetters:{ enabled: { type: Boolean, default: false }, count: { type: Number, default: 1 } },
    motivationLetter:     { type: Boolean, default: false },
    cv:                   { type: Boolean, default: false },
    portfolio:            { type: Boolean, default: false },
    notes:                { type: String, default: "" },
  },
  { _id: false }
);

const defaultRequirements = (): IRequirements => ({
  age: { enabled: false, min: 0, max: 0 },
  educationLevel: { enabled: false, levels: [] },
  languageCertificates: { enabled: false, items: [] },
  personalEssay: false,
  recommendationLetters: { enabled: false, count: 1 },
  motivationLetter: false,
  cv: false,
  portfolio: false,
  notes: "",
});

const ScholarshipSchema = new Schema<IScholarship>(
  {
    title: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    funding: { type: String, required: true, trim: true },
    degreeLevel: { type: String, default: "" },
    deadline: { type: String, default: "" },
    description: { type: String, default: "" },
    requirements: { type: RequirementsSchema, default: defaultRequirements },
    link: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
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
