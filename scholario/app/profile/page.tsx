"use client";

import { useState } from "react";
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
  });

  const [success, setSuccess] = useState("");

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
      router.push("/matches");
    }, 1000);
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 px-6 py-16">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-gray-500 mb-8">
            Tell us about yourself so we can match scholarships to you.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select your country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
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

            <input
              type="number"
              name="ielts"
              placeholder="IELTS Score (optional)"
              value={formData.ielts}
              onChange={handleChange}
              step="0.5"
              min="0"
              max="9"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
            />

            <select
              name="fundingType"
              value={formData.fundingType}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Funding Type</option>
              <option value="Full">Full</option>
              <option value="Partial">Partial</option>
            </select>

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