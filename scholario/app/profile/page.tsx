"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { getProfile, saveProfile } from "../../lib/api";

type LanguageEntry = {
  language: string;
  proficiency: string;
  certificate: string;
  score: string;
  fileUrl: string;
  fileName: string;
};

type CertDoc = {
  name: string;
  label: string;
  dataUrl: string;
  size: string;
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

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 text-sm";

export default function ProfilePage() {
  const router = useRouter();
  const [isExisting, setIsExisting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    streetAddress: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "",
    age: "",
    major: "",
    gpa: "",
    fundingType: "",
    degreeLevel: "",
    scholarshipStatus: "",
  });

  const [languages, setLanguages] = useState<LanguageEntry[]>([
    { language: "", proficiency: "", certificate: "", score: "", fileUrl: "", fileName: "" },
  ]);

  const [certDocs, setCertDocs] = useState<CertDoc[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      // Seed name defaults from signup data
      const authRaw = localStorage.getItem("user");
      const authUser = authRaw ? JSON.parse(authRaw) : null;

      const token = localStorage.getItem("token");
      if (token) {
        const remote = await getProfile(token);
        if (remote) {
          setIsExisting(true);
          const { languages: savedLangs, certDocs: savedDocs, _id, userId, __v, createdAt, updatedAt, ...rest } = remote as any;
          setFormData((prev) => ({
            ...prev,
            firstName: authUser?.firstName || prev.firstName,
            lastName: authUser?.lastName || prev.lastName,
            ...rest,
          }));
          if (savedLangs?.length) setLanguages(savedLangs);
          const local = localStorage.getItem("scholarioProfile");
          if (local) {
            const parsed = JSON.parse(local);
            if (parsed.certDocs?.length) setCertDocs(parsed.certDocs);
          }
          return;
        }
      }
      // Fallback to localStorage
      const saved = localStorage.getItem("scholarioProfile");
      if (saved) {
        setIsExisting(true);
        const parsed = JSON.parse(saved);
        const { languages: savedLangs, certDocs: savedDocs, ...rest } = parsed;
        setFormData((prev) => ({
          ...prev,
          firstName: authUser?.firstName || prev.firstName,
          lastName: authUser?.lastName || prev.lastName,
          ...rest,
        }));
        if (savedLangs?.length) setLanguages(savedLangs);
        if (savedDocs?.length) setCertDocs(savedDocs);
      } else if (authUser) {
        // Brand new profile — seed name from signup
        setFormData((prev) => ({
          ...prev,
          firstName: authUser.firstName || "",
          lastName: authUser.lastName || "",
        }));
      }
    }
    loadProfile();
  }, []);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setUploadError("File is too large. Maximum size is 4MB.");
      return;
    }

    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only PDF, JPG, and PNG files are allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const sizeKb = (file.size / 1024).toFixed(1);
      setCertDocs((prev) => [
        ...prev,
        { name: file.name, label: file.name.replace(/\.[^/.]+$/, ""), dataUrl, size: `${sizeKb} KB` },
      ]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function removeCertDoc(index: number) {
    setCertDocs((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCertLabel(index: number, label: string) {
    setCertDocs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], label };
      return updated;
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === "dateOfBirth" && value) {
      const today = new Date();
      const dob = new Date(value);
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
      setFormData((prev) => ({ ...prev, dateOfBirth: value, age: age > 0 ? String(age) : "" }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  function handleLanguageFile(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("File is too large. Max 4MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLanguages((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], fileUrl: reader.result as string, fileName: file.name };
        return updated;
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function removeLanguageFile(index: number) {
    setLanguages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], fileUrl: "", fileName: "" };
      return updated;
    });
  }

  function addLanguage() {
    setLanguages((prev) => [...prev, { language: "", proficiency: "", certificate: "", score: "", fileUrl: "", fileName: "" }]);
  }

  function removeLanguage(index: number) {
    setLanguages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Always save to localStorage (includes certDocs which aren't sent to backend)
    localStorage.setItem("scholarioProfile", JSON.stringify({ ...formData, languages, certDocs }));
    // Also save to backend if logged in
    const token = localStorage.getItem("token");
    if (token) {
      await saveProfile(token, { ...formData, languages });
    }
    setSuccess("Profile saved successfully!");
    setTimeout(() => router.push("/user"), 1000);
  }

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative text-white py-12 px-8 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-slate-900/82" />
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-slate-300 text-xs font-semibold uppercase tracking-widest mb-5">
            {isExisting ? "Update Profile" : "Complete Profile"}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            {isExisting ? "Update Your Profile" : "Complete Your Profile"}
          </h1>
          <p className="text-slate-400 text-sm">
            Fill in your details so we can match you with the best scholarships. All fields are optional but improve your matches.
          </p>
        </div>
      </section>

      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <form className="space-y-8" onSubmit={handleSubmit}>

            {/* Personal Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-5">Personal Information</h2>
              <div className="space-y-4">

                {/* Full Name */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                {/* Date of Birth & Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Age & Nationality */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    name="age"
                    placeholder="Age (auto-calculated)"
                    value={formData.age}
                    readOnly
                    className={`${inputClass} bg-slate-50 text-slate-500 cursor-default`}
                  />
                  <select name="nationality" value={formData.nationality} onChange={handleChange} className={inputClass}>
                    <option value="">Nationality</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Address</p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="streetAddress"
                      placeholder="Street Address"
                      value={formData.streetAddress}
                      onChange={handleChange}
                      className={inputClass}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        name="stateProvince"
                        placeholder="State / Province"
                        value={formData.stateProvince}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="postalCode"
                        placeholder="Postal Code"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className={inputClass}
                      />
                      <select name="country" value={formData.country} onChange={handleChange} className={inputClass}>
                        <option value="">Country</option>
                        {countries.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Academic Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-5">Academic Information</h2>
              <div className="space-y-4">
                <select name="degreeLevel" value={formData.degreeLevel} onChange={handleChange} className={inputClass}>
                  <option value="">Degree Level</option>
                  <option value="Bachelor">Bachelor&apos;s</option>
                  <option value="Master">Master&apos;s</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="text"
                  name="major"
                  placeholder="Intended Major (e.g. Computer Science)"
                  value={formData.major}
                  onChange={handleChange}
                  className={inputClass}
                />

                <input
                  type="number"
                  name="gpa"
                  placeholder="GPA (e.g. 3.8)"
                  value={formData.gpa}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="4"
                  className={inputClass}
                />

                <select name="fundingType" value={formData.fundingType} onChange={handleChange} className={inputClass}>
                  <option value="">Funding Type Preference</option>
                  <option value="Full">Full Scholarship</option>
                  <option value="Partial">Partial Scholarship</option>
                </select>
              </div>
            </div>

            {/* Language Proficiency */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-5">Language Proficiency</h2>
              <div className="space-y-4">
                {languages.map((entry, index) => (
                  <div key={index} className="border border-slate-200 rounded-2xl p-5 space-y-3 relative bg-slate-50/50">
                    {languages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLanguage(index)}
                        className="absolute top-4 right-4 text-red-400 hover:text-red-600 text-xs font-medium"
                      >
                        Remove
                      </button>
                    )}

                    <select
                      value={entry.language}
                      onChange={(e) => handleLanguageChange(index, "language", e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select language</option>
                      {LANGUAGES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>

                    <select
                      value={entry.proficiency}
                      onChange={(e) => handleLanguageChange(index, "proficiency", e.target.value)}
                      className={inputClass}
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

                    <select
                      value={entry.certificate}
                      onChange={(e) => handleLanguageChange(index, "certificate", e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Certificate type (optional)</option>
                      {(CERTIFICATES[entry.language] || DEFAULT_CERTS).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    {entry.certificate && entry.certificate !== "None" && (
                      <input
                        type="text"
                        placeholder={`${entry.certificate} score (e.g. 7.5)`}
                        value={entry.score}
                        onChange={(e) => handleLanguageChange(index, "score", e.target.value)}
                        className={inputClass}
                      />
                    )}

                    {entry.certificate && entry.certificate !== "None" && (
                      <div>
                        <p className="text-xs text-slate-500 mb-2 font-medium">Certificate document (PDF, JPG, PNG — max 4MB)</p>
                        {entry.fileUrl ? (
                          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
                            <span className="text-sm text-slate-700 flex-1 truncate">{entry.fileName}</span>
                            <a href={entry.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline shrink-0">View</a>
                            <button type="button" onClick={() => removeLanguageFile(index)} className="text-xs text-red-400 hover:text-red-600 shrink-0">Remove</button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-3 border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-xl px-4 py-3 cursor-pointer transition bg-white">
                            <span className="text-sm text-indigo-600">Click to upload {entry.certificate} certificate</span>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleLanguageFile(index, e)} className="hidden" />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addLanguage}
                  className="w-full border-2 border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-600 py-3 rounded-xl text-sm font-medium transition"
                >
                  + Add another language
                </button>
              </div>
            </div>

            {/* Scholarship Status */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-5">Scholarship Status</h2>
              <select name="scholarshipStatus" value={formData.scholarshipStatus} onChange={handleChange} className={inputClass}>
                <option value="">Select your status</option>
                <option value="First time">First time applying</option>
                <option value="Reapplying">Reapplying</option>
                <option value="Currently funded">Currently funded</option>
              </select>
            </div>

            {/* Certificate Upload */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Upload Other Certificates</h2>
              <p className="text-sm text-slate-400 mb-5">Any additional documents — PDF, JPG, or PNG, max 4MB each</p>

              <div className="space-y-3">
                {certDocs.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={doc.label}
                        onChange={(e) => updateCertLabel(index, e.target.value)}
                        className="w-full text-sm font-medium border-b border-slate-200 focus:outline-none focus:border-indigo-500 pb-0.5 mb-1 bg-transparent"
                        placeholder="Certificate name"
                      />
                      <p className="text-xs text-slate-400">{doc.name} · {doc.size}</p>
                    </div>
                    <a href={doc.dataUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline shrink-0">View</a>
                    <button type="button" onClick={() => removeCertDoc(index)} className="text-xs text-red-400 hover:text-red-600 shrink-0">Remove</button>
                  </div>
                ))}

                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl py-8 cursor-pointer transition bg-white">
                  <span className="text-sm text-indigo-600 font-medium mb-1">Click to upload a certificate</span>
                  <span className="text-xs text-slate-400">PDF, JPG, PNG — max 4MB</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" />
                </label>

                {uploadError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{uploadError}</p>
                )}
              </div>
            </div>

            {success && (
              <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3">{success}</p>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
            >
              Save Profile
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
