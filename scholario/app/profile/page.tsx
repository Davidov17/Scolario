"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

type LanguageEntry = {
  language: string;
  proficiency: string;
  certificate: string;
  score: string;
};

const LANGUAGES = [
  "English", "German", "French", "Spanish", "Chinese", "Japanese",
  "Korean", "Arabic", "Russian", "Italian", "Portuguese", "Dutch",
  "Turkish", "Polish", "Swedish", "Other",
];

const CERTIFICATES: Record<string, string[]> = {
  English: ["IELTS", "TOEFL", "Cambridge B2 First", "Cambridge C1 Advanced", "PTE", "Duolingo English Test", "None"],
  German: ["Goethe-Zertifikat", "TestDaF", "DSH", "None"],
  French: ["DELF", "DALF", "TCF", "TEF", "None"],
  Spanish: ["DELE", "SIELE", "None"],
  Chinese: ["HSK", "None"],
  Japanese: ["JLPT", "None"],
  Korean: ["TOPIK", "None"],
  Arabic: ["ALPT", "None"],
  Russian: ["TORFL", "None"],
};

const DEFAULT_CERTS = ["None", "Other"];

const countries = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia",
  "Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Belarus",
  "Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana",
  "Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon",
  "Canada","Chad","Chile","China","Colombia","Costa Rica","Croatia",
  "Cuba","Cyprus","Czech Republic","Denmark","Dominican Republic","Ecuador",
  "Egypt","Estonia","Ethiopia","Finland","France","Georgia","Germany","Ghana",
  "Greece","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland",
  "Israel","Italy","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan",
  "Laos","Latvia","Lebanon","Lithuania","Luxembourg","Malaysia","Maldives",
  "Mexico","Moldova","Monaco","Mongolia","Morocco","Nepal","Netherlands",
  "New Zealand","Nigeria","North Korea","Norway","Oman","Pakistan","Peru",
  "Philippines","Poland","Portugal","Qatar","Romania","Russia","Saudi Arabia",
  "Serbia","Singapore","Slovakia","Slovenia","South Africa","South Korea",
  "Spain","Sri Lanka","Sweden","Switzerland","Syria","Tajikistan","Thailand",
  "Turkey","Turkmenistan","Ukraine","United Arab Emirates","United Kingdom",
  "United States","Uzbekistan","Vietnam","Yemen","Zambia","Zimbabwe"
];

export default function ProfilePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    country: "",
    major: "",
    gpa: 0,
    fundingType: "",
    degreeLevel: "",
    age: "",
    scholarshipStatus: "",
  });

  const [languages, setLanguages] = useState<LanguageEntry[]>([
    { language: "", proficiency: "", certificate: "", score: "" },
  ]);

  const [success, setSuccess] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("scholarioProfile");
    if (saved) {
      const parsed = JSON.parse(saved);
      const { languages: savedLangs, ...rest } = parsed;
      setFormData(rest);
      if (savedLangs?.length) setLanguages(savedLangs);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "gpa" ? parseFloat(value) || 0 : value,
    }));
  }

  function handleLanguageChange(index: number, field: keyof LanguageEntry, value: string) {
    setLanguages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "language") {
        updated[index].certificate = "";
        updated[index].score = "";
      }
      return updated;
    });
  }

  function addLanguage() {
    setLanguages((prev) => [...prev, { language: "", proficiency: "", certificate: "", score: "" }]);
  }

  function removeLanguage(index: number) {
    setLanguages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    localStorage.setItem("scholarioProfile", JSON.stringify({ ...formData, languages }));
    setSuccess("Profile saved successfully!");
    setTimeout(() => router.push("/user"), 1000);
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 px-6 py-16">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h1 className="text-3xl font-bold mb-2">
            {typeof window !== "undefined" && localStorage.getItem("scholarioProfile")
              ? "Update Your Profile"
              : "Complete Your Profile"}
          </h1>
          <p className="text-gray-500 mb-8">
            Fill in your details so we can match scholarships to you. All fields are optional but improve your matches.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Personal Info */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Personal Information</h2>
              <div className="space-y-4">
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>

                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  min="10"
                  max="100"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Academic Info */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Academic Information</h2>
              <div className="space-y-4">
                <select
                  name="degreeLevel"
                  value={formData.degreeLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Degree Level</option>
                  <option value="Bachelor">Bachelor's</option>
                  <option value="Master">Master's</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="text"
                  name="major"
                  placeholder="Intended Major (e.g. Computer Science)"
                  value={formData.major}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                />

                <input
                  type="number"
                  name="gpa"
                  placeholder="GPA (e.g. 3.8)"
                  value={formData.gpa === 0 ? "" : formData.gpa}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="4"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                />

                <select
                  name="fundingType"
                  value={formData.fundingType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Funding Type Preference</option>
                  <option value="Full">Full</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
            </div>

            {/* Language Proficiency */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Language Proficiency</h2>
              <div className="space-y-4">
                {languages.map((entry, index) => (
                  <div key={index} className="border border-gray-200 rounded-2xl p-4 space-y-3 relative">
                    {languages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLanguage(index)}
                        className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}

                    {/* Language */}
                    <select
                      value={entry.language}
                      onChange={(e) => handleLanguageChange(index, "language", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select language</option>
                      {LANGUAGES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>

                    {/* Proficiency */}
                    <select
                      value={entry.proficiency}
                      onChange={(e) => handleLanguageChange(index, "proficiency", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Proficiency level</option>
                      <option value="A1">A1 – Beginner</option>
                      <option value="A2">A2 – Elementary</option>
                      <option value="B1">B1 – Intermediate</option>
                      <option value="B2">B2 – Upper Intermediate</option>
                      <option value="C1">C1 – Advanced</option>
                      <option value="C2">C2 – Mastery</option>
                      <option value="Native">Native</option>
                    </select>

                    {/* Certificate */}
                    <select
                      value={entry.certificate}
                      onChange={(e) => handleLanguageChange(index, "certificate", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Certificate type (optional)</option>
                      {(CERTIFICATES[entry.language] || DEFAULT_CERTS).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    {/* Score */}
                    {entry.certificate && entry.certificate !== "None" && (
                      <input
                        type="text"
                        placeholder={`${entry.certificate} score (e.g. 7.5)`}
                        value={entry.score}
                        onChange={(e) => handleLanguageChange(index, "score", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addLanguage}
                  className="w-full border-2 border-dashed border-indigo-300 text-indigo-600 hover:border-indigo-500 py-3 rounded-xl text-sm font-medium transition"
                >
                  + Add another language
                </button>
              </div>
            </div>

            {/* Scholarship Status */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Scholarship Status</h2>
              <select
                name="scholarshipStatus"
                value={formData.scholarshipStatus}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select status</option>
                <option value="First time">First time applying</option>
                <option value="Reapplying">Reapplying</option>
                <option value="Currently funded">Currently funded</option>
              </select>
            </div>

            {success && (
              <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                {success}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl shadow-md hover:shadow-lg transition"
            >
              Save Profile
            </button>
          </form>
        </div>
      </main>
    </>
  );
}