"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

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
    ielts: "",
    fundingType: "",
    degreeLevel: "",
    age: "",
    englishLevel: "",
    otherLanguages: "",
    scholarshipStatus: "",
  });

  const [success, setSuccess] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("scholarioProfile");
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "gpa" ? parseFloat(value) || 0 : value,
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    localStorage.setItem("scholarioProfile", JSON.stringify(formData));
    setSuccess("Profile saved successfully!");

    setTimeout(() => {
      router.push("/user");
    }, 1000);
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
                <select
                  name="englishLevel"
                  value={formData.englishLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">English Level</option>
                  <option value="Beginner">Beginner (A1–A2)</option>
                  <option value="Intermediate">Intermediate (B1–B2)</option>
                  <option value="Advanced">Advanced (C1–C2)</option>
                  <option value="Native">Native</option>
                </select>

                <input
                  type="number"
                  name="ielts"
                  placeholder="IELTS Score (e.g. 7.0)"
                  value={formData.ielts}
                  onChange={handleChange}
                  step="0.5"
                  min="0"
                  max="9"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                />

                <input
                  type="text"
                  name="otherLanguages"
                  placeholder="Other languages (e.g. German B2, French A1)"
                  value={formData.otherLanguages}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                />
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