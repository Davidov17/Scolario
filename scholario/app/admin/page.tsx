"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LangCert { name: string; minScore: string }

interface Requirements {
  age: { enabled: boolean; min: number; max: number };
  educationLevel: { enabled: boolean; levels: string[] };
  languageCertificates: { enabled: boolean; items: LangCert[] };
  personalEssay: boolean;
  recommendationLetters: { enabled: boolean; count: number };
  motivationLetter: boolean;
  cv: boolean;
  portfolio: boolean;
  notes: string;
}

interface Scholarship {
  _id: string;
  title: string;
  country: string;
  funding: string;
  degreeLevel: string;
  deadline: string;
  description: string;
  requirements: Requirements;
  link: string;
  isFeatured: boolean;
}

const EMPTY_REQS: Requirements = {
  age: { enabled: false, min: 0, max: 0 },
  educationLevel: { enabled: false, levels: [] },
  languageCertificates: { enabled: false, items: [] },
  personalEssay: false,
  recommendationLetters: { enabled: false, count: 1 },
  motivationLetter: false,
  cv: false,
  portfolio: false,
  notes: "",
};

const EMPTY: Omit<Scholarship, "_id"> = {
  title: "", country: "", funding: "Full", degreeLevel: "",
  deadline: "", description: "", requirements: EMPTY_REQS, link: "", isFeatured: false,
};

const EDU_LEVELS = ["High School", "Bachelor's", "Master's", "PhD", "Postdoctoral", "Any"];
const COMMON_CERTS = ["IELTS", "TOEFL", "DELF/DALF", "Goethe-Zertifikat", "DELE", "JLPT", "HSK", "Cambridge (FCE/CAE/CPE)"];

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600";

// ─── Toggle switch ─────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative rounded-full transition-colors shrink-0 ${checked ? "bg-indigo-500" : "bg-slate-300"}`}
        style={{ width: 40, height: 22 }}
      >
        <span
          className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-[3px]"}`}
        />
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
}

// ─── Requirements editor ───────────────────────────────────────────────────
function RequirementsEditor({ value, onChange }: { value: Requirements; onChange: (r: Requirements) => void }) {
  function set<K extends keyof Requirements>(key: K, val: Requirements[K]) {
    onChange({ ...value, [key]: val });
  }

  function toggleEduLevel(level: string) {
    const levels = value.educationLevel.levels.includes(level)
      ? value.educationLevel.levels.filter((l) => l !== level)
      : [...value.educationLevel.levels, level];
    set("educationLevel", { ...value.educationLevel, levels });
  }

  function addCert() {
    set("languageCertificates", {
      ...value.languageCertificates,
      items: [...value.languageCertificates.items, { name: "", minScore: "" }],
    });
  }

  function updateCert(i: number, field: keyof LangCert, val: string) {
    const items = value.languageCertificates.items.map((c, idx) => idx === i ? { ...c, [field]: val } : c);
    set("languageCertificates", { ...value.languageCertificates, items });
  }

  function removeCert(i: number) {
    set("languageCertificates", {
      ...value.languageCertificates,
      items: value.languageCertificates.items.filter((_, idx) => idx !== i),
    });
  }

  const sectionClass = "bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3";
  const labelClass = "block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5";
  const smallInput = "px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600";

  return (
    <div className="md:col-span-2 space-y-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Requirements</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* Age */}
        <div className={sectionClass}>
          <Toggle
            checked={value.age.enabled}
            onChange={(v) => set("age", { ...value.age, enabled: v })}
            label="Age Requirement"
          />
          {value.age.enabled && (
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1">
                <label className={labelClass}>Min Age</label>
                <input
                  type="number" min={0} max={100}
                  value={value.age.min || ""}
                  onChange={(e) => set("age", { ...value.age, min: Number(e.target.value) })}
                  placeholder="e.g. 18"
                  className={`${smallInput} w-full`}
                />
              </div>
              <div className="flex-1">
                <label className={labelClass}>Max Age</label>
                <input
                  type="number" min={0} max={100}
                  value={value.age.max || ""}
                  onChange={(e) => set("age", { ...value.age, max: Number(e.target.value) })}
                  placeholder="e.g. 35"
                  className={`${smallInput} w-full`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Education level */}
        <div className={sectionClass}>
          <Toggle
            checked={value.educationLevel.enabled}
            onChange={(v) => set("educationLevel", { ...value.educationLevel, enabled: v })}
            label="Education Level"
          />
          {value.educationLevel.enabled && (
            <div className="flex flex-wrap gap-2 pt-1">
              {EDU_LEVELS.map((level) => {
                const active = value.educationLevel.levels.includes(level);
                return (
                  <button
                    key={level} type="button"
                    onClick={() => toggleEduLevel(level)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      active
                        ? "bg-indigo-500 border-indigo-400 text-white"
                        : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Language certificates */}
        <div className={`${sectionClass} md:col-span-2`}>
          <Toggle
            checked={value.languageCertificates.enabled}
            onChange={(v) => set("languageCertificates", { ...value.languageCertificates, enabled: v })}
            label="Language Certificates"
          />
          {value.languageCertificates.enabled && (
            <div className="space-y-2 pt-1">
              {value.languageCertificates.items.map((cert, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      value={cert.name}
                      onChange={(e) => updateCert(i, "name", e.target.value)}
                      placeholder="Certificate (e.g. IELTS)"
                      list="cert-suggestions"
                      className={`${smallInput} w-full`}
                    />
                    <datalist id="cert-suggestions">
                      {COMMON_CERTS.map((c) => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <input
                    value={cert.minScore}
                    onChange={(e) => updateCert(i, "minScore", e.target.value)}
                    placeholder="Min score (e.g. 6.5)"
                    className={`${smallInput} w-28`}
                  />
                  <button
                    type="button" onClick={() => removeCert(i)}
                    className="text-slate-500 hover:text-red-400 transition-colors text-lg leading-none shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button" onClick={addCert}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                + Add certificate
              </button>
            </div>
          )}
        </div>

        {/* Recommendation letters */}
        <div className={sectionClass}>
          <Toggle
            checked={value.recommendationLetters.enabled}
            onChange={(v) => set("recommendationLetters", { ...value.recommendationLetters, enabled: v })}
            label="Recommendation Letters"
          />
          {value.recommendationLetters.enabled && (
            <div className="pt-1">
              <label className={labelClass}>Number Required</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n} type="button"
                    onClick={() => set("recommendationLetters", { ...value.recommendationLetters, count: n })}
                    className={`w-9 h-9 rounded-lg text-sm font-bold border transition-all ${
                      value.recommendationLetters.count === n
                        ? "bg-indigo-500 border-indigo-400 text-white"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Simple toggles */}
        <div className={sectionClass}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Documents Required</p>
          <div className="space-y-2.5">
            <Toggle checked={value.personalEssay} onChange={(v) => set("personalEssay", v)} label="Personal Essay" />
            <Toggle checked={value.motivationLetter} onChange={(v) => set("motivationLetter", v)} label="Motivation Letter" />
            <Toggle checked={value.cv} onChange={(v) => set("cv", v)} label="CV / Resume" />
            <Toggle checked={value.portfolio} onChange={(v) => set("portfolio", v)} label="Portfolio" />
          </div>
        </div>

      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Additional Requirements / Notes</label>
        <textarea
          value={value.notes}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          rows={2}
          placeholder="Any other requirements not covered above…"
          className={`${inputClass} resize-none`}
        />
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function AdminScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Scholarship | null>(null);
  const [form, setForm] = useState<Omit<Scholarship, "_id">>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/scholarships`);
      setScholarships(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function authHeaders(): Record<string, string> {
    const token = localStorage.getItem("token") || "";
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  }

  function openNew() { setEditing(null); setForm(EMPTY); setShowForm(true); }
  function openEdit(s: Scholarship) {
    setEditing(s);
    const { _id, ...rest } = s;
    // Merge with EMPTY_REQS so old string-based records still open cleanly
    const reqs: Requirements = (rest.requirements && typeof rest.requirements === "object")
      ? { ...EMPTY_REQS, ...rest.requirements }
      : EMPTY_REQS;
    setForm({ ...rest, requirements: reqs });
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        await fetch(`${API}/scholarships/${editing._id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(form) });
      } else {
        await fetch(`${API}/scholarships`, { method: "POST", headers: authHeaders(), body: JSON.stringify(form) });
      }
      setShowForm(false);
      await fetchAll();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    await fetch(`${API}/scholarships/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } });
    setDeleteId(null);
    await fetchAll();
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    setImportMsg("");
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch(`${API}/scholarships/import/spreadsheet`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body,
      });
      const data = await res.json();
      setImportMsg(data.message || "Import complete.");
      await fetchAll();
    } catch {
      setImportMsg("Import failed.");
    } finally {
      setImportLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const filtered = scholarships.filter(
    (s) => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">

      {/* Page header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scholarships</h1>
          <p className="text-slate-600 text-sm mt-0.5">{scholarships.length} total in database</p>
        </div>
        <div className="flex items-center gap-3">
          {importMsg && <p className="text-emerald-600 text-xs">{importMsg}</p>}
          <label className={`cursor-pointer px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors ${importLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
            {importLoading ? "Importing…" : "Import CSV / XLSX"}
            <input ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleImport} disabled={importLoading} />
          </label>
          <button
            onClick={openNew}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            + Add Scholarship
          </button>
        </div>
      </div>

      {/* Slide-down form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-7 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-900">{editing ? "Edit Scholarship" : "New Scholarship"}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700 text-sm">Cancel</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic fields */}
            {(["title", "country", "funding", "degreeLevel", "deadline", "link"] as (keyof typeof form)[]).map((field) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 capitalize">
                  {field === "degreeLevel" ? "Degree Level" : field}
                </label>
                <input
                  value={form[field] as string}
                  onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  className={inputClass}
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className={`${inputClass} resize-none`} />
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <input type="checkbox" id="isFeatured" checked={form.isFeatured} onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))} className="w-4 h-4 accent-indigo-500" />
              <label htmlFor="isFeatured" className="text-sm font-medium text-slate-700">Featured on homepage</label>
            </div>

            {/* Divider */}
            <div className="md:col-span-2 border-t border-white/8 pt-4" />

            {/* Structured requirements */}
            <RequirementsEditor
              value={form.requirements}
              onChange={(r) => setForm((p) => ({ ...p, requirements: r }))}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving || !form.title || !form.country || !form.funding}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Save Changes" : "Create"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700">Cancel</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search scholarships…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-6 h-6 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No scholarships found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["Title", "Country", "Degree", "Funding", "Deadline", "Featured", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900 max-w-[220px] truncate">{s.title}</td>
                  <td className="px-5 py-3.5 text-slate-600">{s.country}</td>
                  <td className="px-5 py-3.5 text-slate-600">{s.degreeLevel || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.funding?.toLowerCase().includes("full") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {s.funding}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{s.deadline || "—"}</td>
                  <td className="px-5 py-3.5">
                    {s.isFeatured
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">Yes</span>
                      : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEdit(s)} className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold">Edit</button>
                      <button onClick={() => setDeleteId(s._id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Delete</button>
                      <Link href={`/scholarships/${s._id}`} className="text-slate-500 hover:text-slate-700 text-xs" target="_blank">View</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete scholarship?</h3>
            <p className="text-slate-600 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
