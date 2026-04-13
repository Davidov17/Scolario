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
        <main className="p-10">
          <h1 className="text-3xl font-bold">Scholarship not found</h1>
          <Link href="/scholarships" className="text-indigo-600 hover:underline mt-4 inline-block">
            ← Back to Scholarships
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto p-10">
        <Link href="/scholarships" className="text-indigo-600 hover:underline mb-6 inline-block">
          ← Back to Scholarships
        </Link>

        <h1 className="text-3xl font-bold mb-6">{data.title}</h1>

        <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-4">
          <p className="text-gray-700">
            <span className="font-semibold text-black">Country:</span>{" "}
            {data.country || "Not specified"}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-black">Degree:</span>{" "}
            {data.degree || "Not specified"}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-black">Deadline:</span>{" "}
            {data.deadline || "Not specified"}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-black">Funding:</span>{" "}
            {data.funding || "Not specified"}
          </p>

          {data.link && (
            <a
              href={data.link}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow transition"
            >
              Apply Now →
            </a>
          )}
        </div>
      </main>
    </>
  );
}