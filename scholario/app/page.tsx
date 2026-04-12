import Link from "next/link";
import Navbar from "../components/Navbar";

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
      .map((row, index) => ({
        id: index + 1,
        title: row.c?.[0]?.v || "",
        country: row.c?.[1]?.v || "",
        degree: row.c?.[2]?.v || "",
        deadline: row.c?.[3]?.v || "",
        funding: row.c?.[4]?.v || "",
        link: row.c?.[5]?.v || "",
      }))
      .filter((item) => item.title);
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    return [];
  }
}

export default async function Home() {
  const scholarships = await getScholarships();
  const featuredScholarships = scholarships.slice(0, 3);

  return (
    <>
      <Navbar />

      <main className="bg-gradient-to-b from-white via-gray-50 to-gray-100 text-black">
        {/* HERO */}
        <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_white,_transparent)]"></div>

          <div className="max-w-6xl mx-auto px-8 py-28 text-center relative">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Find Scholarships That Match Your Profile
            </h1>

            <p className="text-lg text-indigo-100 max-w-2xl mx-auto mb-10">
              Discover global opportunities tailored to your academic goals —
              faster, smarter, and all in one place.
            </p>

            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                href="/signup"
                className="bg-white text-black px-6 py-3 rounded-xl font-medium shadow-lg hover:scale-105 transition"
              >
                Get Started
              </Link>

              <Link
                href="/scholarships"
                className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-black transition"
              >
                Browse Scholarships
              </Link>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="max-w-6xl mx-auto px-8 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-tight">
            How Scholario Works
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transition border border-gray-100">
              <h3 className="text-xl font-semibold mb-3">1. Create Profile</h3>
              <p className="text-gray-600">
                Enter your academic background, preferences, and goals.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transition border border-gray-100">
              <h3 className="text-xl font-semibold mb-3">2. Get Matches</h3>
              <p className="text-gray-600">
                Discover scholarships tailored specifically to you.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transition border border-gray-100">
              <h3 className="text-xl font-semibold mb-3">3. Apply Smarter</h3>
              <p className="text-gray-600">
                Track deadlines, funding, and requirements easily.
              </p>
            </div>
          </div>
        </section>

        {/* FEATURED */}
        <section className="max-w-6xl mx-auto px-8 py-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Featured Scholarships
            </h2>

            <Link
              href="/scholarships"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredScholarships.length > 0 ? (
              featuredScholarships.map((s) => (
                <div
                  key={s.id}
                  className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transition border border-gray-100 flex flex-col h-full"
                >
                  <h3 className="text-xl font-semibold mb-3">{s.title}</h3>

                  <p className="text-gray-600 mb-2">
                    <span className="font-medium text-black">Country:</span>{" "}
                    {s.country || "Not specified"}
                  </p>

                  <p className="text-gray-600 mb-2">
                    <span className="font-medium text-black">Degree:</span>{" "}
                    {s.degree || "Not specified"}
                  </p>

                  <p className="text-gray-600 mb-2">
                    <span className="font-medium text-black">Deadline:</span>{" "}
                    {s.deadline || "Not specified"}
                  </p>

                  <p className="text-gray-600 mb-6">
                    <span className="font-medium text-black">Funding:</span>{" "}
                    {s.funding || "Not specified"}
                  </p>

                  {s.link ? (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl shadow-md hover:shadow-lg transition mt-auto"
                    >
                      View Details
                    </a>
                  ) : (
                    <button
                      disabled
                      className="block text-center bg-gray-300 text-gray-600 py-3 rounded-xl mt-auto cursor-not-allowed"
                    >
                      No Link Available
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-full">
                No scholarships found. Check your Google Sheet sharing settings.
              </p>
            )}
          </div>
        </section>

        {/* WHY */}
        <section className="max-w-6xl mx-auto px-8 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-tight">
            Why Choose Scholario
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transition border border-gray-100">
              <h3 className="text-xl font-semibold mb-3">Fast Search</h3>
              <p className="text-gray-600">
                No need to search multiple websites manually.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transition border border-gray-100">
              <h3 className="text-xl font-semibold mb-3">Clear Information</h3>
              <p className="text-gray-600">
                Everything you need — funding, deadlines, requirements.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transition border border-gray-100">
              <h3 className="text-xl font-semibold mb-3">Student Focused</h3>
              <p className="text-gray-600">
                Built specifically for students aiming to study abroad.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 mt-10">
          <div className="max-w-4xl mx-auto text-center px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Your Scholarship Journey Today
            </h2>

            <p className="text-indigo-100 mb-8">
              Join Scholario and discover opportunities tailored to your future.
            </p>

            <Link
              href="/signup"
              className="inline-block bg-white text-black px-6 py-3 rounded-xl font-medium shadow-lg hover:scale-105 transition"
            >
              Create Account
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}