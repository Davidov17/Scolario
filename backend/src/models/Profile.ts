import mongoose, { Document, Schema } from "mongoose";

export interface ILanguageEntry {
  language: string;
  proficiency: string;
  certificate: string;
  score: string;
}

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  age: string;
  major: string;
  gpa: string;
  fundingType: string;
  degreeLevel: string;
  scholarshipStatus: string;
  languages: ILanguageEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const LanguageEntrySchema = new Schema<ILanguageEntry>(
  {
    language: { type: String, default: "" },
    proficiency: { type: String, default: "" },
    certificate: { type: String, default: "" },
    score: { type: String, default: "" },
  },
  { _id: false }
);

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    dateOfBirth: { type: String, default: "" },
    gender: { type: String, default: "" },
    nationality: { type: String, default: "" },
    streetAddress: { type: String, default: "" },
    city: { type: String, default: "" },
    stateProvince: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "" },
    age: { type: String, default: "" },
    major: { type: String, default: "" },
    gpa: { type: String, default: "" },
    fundingType: { type: String, default: "" },
    degreeLevel: { type: String, default: "" },
    scholarshipStatus: { type: String, default: "" },
    languages: { type: [LanguageEntrySchema], default: [] },
  },
  { timestamps: true }
);

export const Profile = mongoose.model<IProfile>("Profile", ProfileSchema);
