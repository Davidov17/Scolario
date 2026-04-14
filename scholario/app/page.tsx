export const dynamic = "force-dynamic";

import Link from "next/link";
import Navbar from "../components/Navbar";
import HeroCTA from "../components/HeroCTA";
import FadeIn from "../components/FadeIn";
import { getScholarships } from "../lib/api";

export default async function Home() {
  const scholarships = await getScholarships();
  const featuredScholarships = scholarships.filter((s) => s.isFeatured).slice(0, 3);
  const displayScholarships = featuredScholarships.length > 0 ? featuredScholarships : scholarships.slice(0, 3);

  return (
    <>
      <Navbar />

      <main>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="relative text-white overflow-hidden min-h-[90vh] flex items-center">
          {/* Photo — overlay at 45% so it's clearly visible */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-slate-900/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_0%,_#4f46e528,_transparent)]" />

          <div className="relative w-full max-w-6xl mx-auto px-8 py-28 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-slate-200 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Scholarships updated live from verified sources
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-[1.08] tracking-tight mb-6 drop-shadow-lg">
              Find Scholarships That
              <br />
              <span className="text-indigo-300">Match Your Profile</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-12 leading-relaxed drop-shadow">
              Discover global funding opportunities tailored to your academic goals —
              faster, smarter, and all in one place.
            </p>

            <HeroCTA />
          </div>
        </section>

        {/* ── HOW IT WORKS — dark, contrasts with hero ─────────── */}
        <section className="relative bg-slate-900 py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_110%,_#4f46e515,_transparent)]" />

          <div className="relative max-w-6xl mx-auto px-8">
            <FadeIn className="text-center mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-4">
                How it works
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Three steps to your scholarship
              </h2>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Create Profile", desc: "Enter your academic background, preferences, and goals." },
                { step: "02", title: "Get Matches", desc: "Discover scholarships tailored specifically to you." },
                { step: "03", title: "Apply Smarter", desc: "Track deadlines, funding, and requirements easily." },
              ].map((item, i) => (
                <FadeIn key={item.step} delay={i * 120} direction="up">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 hover:border-white/20 transition-all h-full">
                    <div className="w-11 h-11 rounded-xl bg-indigo-500 flex items-center justify-center mb-6">
                      <span className="text-white text-sm font-bold">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED SCHOLARSHIPS ─────────────────────────────── */}
        <section className="bg-white py-24">
          <div className="max-w-6xl mx-auto px-8">
            <FadeIn className="flex items-end justify-between mb-12">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold uppercase tracking-widest mb-4">
                  Featured
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                  Top Scholarships
                </h2>
              </div>
              <Link href="/scholarships" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                View all →
              </Link>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-6">
              {displayScholarships.length > 0 ? (
                displayScholarships.map((s, i) => (
                  <FadeIn key={s._id} delay={i * 120} direction="up">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100 transition-all flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                          {s.degreeLevel || "Scholarship"}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{s.country || "—"}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-4 leading-snug flex-1">{s.title}</h3>
                      <div className="space-y-2 mb-6 border-t border-slate-100 pt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Deadline</span>
                          <span className="font-semibold text-slate-700">{s.deadline || "—"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Funding</span>
                          <span className="font-semibold text-slate-700">{s.funding || "—"}</span>
                        </div>
                      </div>
                      <Link
                        href={`/scholarships/${s._id}`}
                        className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </FadeIn>
                ))
              ) : (
                <p className="text-slate-400 col-span-full text-center py-8">
                  No scholarships found. Add some via the admin panel.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── WHY SCHOLARIO — photo section ────────────────────── */}
        <section className="relative py-24 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-slate-900/72" />

          <div className="relative max-w-6xl mx-auto px-8">
            <FadeIn className="text-center mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-slate-200 text-xs font-semibold uppercase tracking-widest mb-4">
                Why Scholario
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Built for students, by design
              </h2>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Fast Search", desc: "No need to search multiple websites manually.", icon: "⚡" },
                { title: "Clear Information", desc: "Everything you need — funding, deadlines, requirements.", icon: "📋" },
                { title: "Student Focused", desc: "Built specifically for students aiming to study abroad.", icon: "🎓" },
              ].map((item, i) => (
                <FadeIn key={item.title} delay={i * 120} direction="up">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-7 hover:bg-white/15 hover:border-white/25 transition-all">
                    <div className="text-4xl mb-5">{item.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ───────────────────────────────────────── */}
        <section className="relative py-28 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1920&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-slate-900/78" />

          <div className="relative max-w-4xl mx-auto text-center px-8">
            <FadeIn>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
                Start Your Scholarship
                <br />Journey Today
              </h2>
              <p className="text-slate-300 mb-10 text-lg max-w-xl mx-auto">
                Join Scholario and discover opportunities tailored to your future.
              </p>
              <Link
                href="/signup"
                className="inline-block bg-indigo-500 hover:bg-indigo-400 text-white px-10 py-4 rounded-xl font-semibold shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all text-base"
              >
                Create Free Account
              </Link>
            </FadeIn>
          </div>
        </section>

      </main>
    </>
  );
}
