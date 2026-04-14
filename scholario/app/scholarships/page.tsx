export const dynamic = "force-dynamic";

import Link from "next/link";
import Navbar from "../../components/Navbar";

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

function ScholarshipCard({ s }: { s: any }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
          {s.degree || "Scholarship"}
        </span>
        <span className="text-xs text-slate-400">{s.country || "—"}</span>
      </div>

      <h2 className="text-base font-bold text-slate-900 mb-4 leading-snug flex-1">{s.title}</h2>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Deadline</span>
          <span className="font-medium text-slate-700">{s.deadline || "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Funding</span>
          <span className="font-medium text-slate-700">{s.funding || "—"}</span>
        </div>
      </div>

      <Link
        href={`/scholarships/${s.id}`}
        className="block w-full bg-slate-900 hover:bg-slate-700 text-white py-2.5 rounded-xl text-center text-sm font-medium transition-colors"
      >
        View Details
      </Link>
    </div>
  );
}

function ScholarshipSection({
  title,
  tag,
  tagColor,
  scholarships,
}: {
  title: string;
  tag: string;
  tagColor: string;
  scholarships: any[];
}) {
  if (scholarships.length === 0) return null;
  return (
    <section className="mb-16">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-2 ${tagColor}`}>
            {tag}
          </span>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-sm font-medium">
              {scholarships.length}
            </span>
          </div>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {scholarships.map((s: any) => (
          <ScholarshipCard key={s.id} s={s} />
        ))}
      </div>
    </section>
  );
}

export default async function ScholarshipsPage() {
  const scholarships = await getScholarships();

  const bachelors = scholarships.filter((s: any) =>
    s.degree?.toLowerCase().includes("bachelor")
  );
  const masters = scholarships.filter((s: any) =>
    s.degree?.toLowerCase().includes("master")
  );
  const others = scholarships.filter(
    (s: any) =>
      !s.degree?.toLowerCase().includes("bachelor") &&
      !s.degree?.toLowerCase().includes("master")
  );

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative text-white py-16 px-8 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-slate-900/82" />
        <div className="relative max-w-6xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-slate-300 text-xs font-semibold uppercase tracking-widest mb-5">
            All Scholarships
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            {scholarships.length} Scholarships
          </h1>
          <p className="text-slate-400 text-lg">
            Organized by degree level. Find the perfect fit for your goals.
          </p>
        </div>
      </section>

      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-16">
          {scholarships.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg">No scholarships found. Check your Google Sheet sharing settings.</p>
            </div>
          ) : (
            <>
              <ScholarshipSection
                title="Bachelor's Scholarships"
                tag="Undergraduate"
                tagColor="bg-indigo-50 text-indigo-700"
                scholarships={bachelors}
              />
              <ScholarshipSection
                title="Master's Scholarships"
                tag="Postgraduate"
                tagColor="bg-violet-50 text-violet-700"
                scholarships={masters}
              />
              <ScholarshipSection
                title="Other Scholarships"
                tag="Other"
                tagColor="bg-amber-50 text-amber-700"
                scholarships={others}
              />
            </>
          )}
        </div>
      </main>
    </>
  );
}
