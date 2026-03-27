import Link from "next/link";
import Navbar from "../../components/Navbar";

const scholarships = [
  {
    id: 1,
    title: "DAAD Scholarship",
    country: "Germany",
    deadline: "2026-06-01",
    funding: "Full / Partial",
  },
  {
    id: 2,
    title: "Erasmus+ Scholarship",
    country: "Europe",
    deadline: "2026-05-15",
    funding: "Full",
  },
  {
    id: 3,
    title: "Korean Government Scholarship",
    country: "South Korea",
    deadline: "2026-04-10",
    funding: "Full",
  },
];

export default function ScholarshipsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Scholarships</h1>
          <p className="text-gray-600 mb-8">
            Explore scholarships matched to your goals.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl shadow-sm border p-6"
              >
                <h2 className="text-xl font-semibold mb-3">{s.title}</h2>

                <p className="text-gray-600">
                  <span className="font-medium text-black">Country:</span>{" "}
                  {s.country}
                </p>

                <p className="text-gray-600">
                  <span className="font-medium text-black">Deadline:</span>{" "}
                  {s.deadline}
                </p>

                <p className="text-gray-600 mb-4">
                  <span className="font-medium text-black">Funding:</span>{" "}
                  {s.funding}
                </p>

                <Link
                  href={`/scholarships/${s.id}`}
                  className="block w-full bg-black text-white py-3 rounded-xl text-center"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}