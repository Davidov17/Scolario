export const dynamic = "force-dynamic";

import Navbar from "../../../components/Navbar";
import Link from "next/link";

const SHEET_ID = "1V71nSZuWQ6C-cJeEiu7yROCXZeEExwAcbqe9NUANaIU";

async function getScholarships() {
  try {
    const res = await fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`,
      { cache: "no-store" }
    );
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows || [];

    return rows
      .map((row: any) => ({
        title: row.c?.[0]?.v || "",
        country: row.c?.[1]?.v || "",
        degree: row.c?.[2]?.v || "",
        funding: row.c?.[3]?.v || "",
        deadline: row.c?.[4]?.v || "",
        link: row.c?.[5]?.v || "",
      }))
      .filter((item: any) => item.title)
      .map((item: any, index: number) => ({ ...item, id: index + 1 }));
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    return [];
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scholarships = await getScholarships();
  const data = scholarships.find((s: any) => s.id === Number(id));

  if (!data) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Scholarship not found</h1>
            <p className="text-slate-500 mb-8">This scholarship may have been removed or the link is incorrect.</p>
            <Link
              href="/scholarships"
              className="inline-block bg-slate-900 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              ← Back to Scholarships
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative text-white py-14 px-8 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-slate-900/82" />
        <div className="relative max-w-4xl mx-auto">
          <Link
            href="/scholarships"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
          >
            ← Back to Scholarships
          </Link>
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
            {data.degree || "Scholarship"}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug">{data.title}</h1>
        </div>
      </section>

      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-8 py-12">

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Country", value: data.country || "—" },
              { label: "Deadline", value: data.deadline || "—" },
              { label: "Funding", value: data.funding || "—" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-5 border border-slate-200 text-center shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                <p className="text-lg font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Details card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Scholarship Details</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { label: "Title", value: data.title },
                { label: "Country", value: data.country || "Not specified" },
                { label: "Degree Level", value: data.degree || "Not specified" },
                { label: "Deadline", value: data.deadline || "Not specified" },
                { label: "Funding Type", value: data.funding || "Not specified" },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-6 px-8 py-4">
                  <span className="text-sm font-semibold text-slate-400 w-32 shrink-0 pt-0.5">{row.label}</span>
                  <span className="text-sm text-slate-800">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100">
              {data.link ? (
                <a
                  href={data.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3 rounded-xl font-semibold shadow-sm hover:shadow-indigo-500/20 hover:shadow-md transition-all"
                >
                  Apply Now →
                </a>
              ) : (
                <button
                  disabled
                  className="inline-block bg-slate-200 text-slate-400 px-7 py-3 rounded-xl font-medium cursor-not-allowed"
                >
                  No Application Link
                </button>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
