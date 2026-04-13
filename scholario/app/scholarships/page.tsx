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
      .map((row: any, index: number) => ({
        id: index + 1,
        title: row.c?.[0]?.v || "",
        country: row.c?.[1]?.v || "",
        degree: row.c?.[2]?.v || "",
        deadline: row.c?.[3]?.v || "",
        funding: row.c?.[4]?.v || "",
        link: row.c?.[5]?.v || "",
      }))
      .filter((item: any) => item.title);
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    return [];
  }
}

function ScholarshipCard({ s }: { s: any }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col">
      <h2 className="text-xl font-semibold mb-3">{s.title}</h2>
      <p className="text-gray-600">
        <span className="font-medium text-black">Country:</span>{" "}
        {s.country || "Not specified"}
      </p>
      <p className="text-gray-600">
        <span className="font-medium text-black">Degree:</span>{" "}
        {s.degree || "Not specified"}
      </p>
      <p className="text-gray-600">
        <span className="font-medium text-black">Deadline:</span>{" "}
        {s.deadline || "Not specified"}
      </p>
      <p className="text-gray-600 mb-4">
        <span className="font-medium text-black">Funding:</span>{" "}
        {s.funding || "Not specified"}
      </p>
      <Link
        href={`/scholarships/${s.id}`}
        className="block w-full bg-black text-white py-3 rounded-xl text-center mt-auto"
      >
        View Details
      </Link>
    </div>
  );
}

function ScholarshipSection({ title, scholarships }: { title: string; scholarships: any[] }) {
  if (scholarships.length === 0) return null;
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">{title}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Scholarships</h1>
          <p className="text-gray-600 mb-10">
            Explore scholarships matched to your goals.
          </p>

          <ScholarshipSection title="Bachelor's Scholarships" scholarships={bachelors} />
          <ScholarshipSection title="Master's Scholarships" scholarships={masters} />
          <ScholarshipSection title="Other Scholarships" scholarships={others} />

          {scholarships.length === 0 && (
            <p className="text-gray-500">No scholarships found. Check your Google Sheet sharing settings.</p>
          )}
        </div>
      </main>
    </>
  );
}