"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroCTA() {
  const [user, setUser] = useState<{ firstName: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  if (user) {
    return (
      <div className="flex justify-center gap-3 flex-wrap">
        <Link
          href="/user"
          className="bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          Go to My Dashboard →
        </Link>
        <Link
          href="/scholarships"
          className="border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
        >
          Browse Scholarships
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-3 flex-wrap">
      <Link
        href="/signup"
        className="bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
      >
        Get Started Free
      </Link>
      <Link
        href="/scholarships"
        className="border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
      >
        Browse Scholarships
      </Link>
    </div>
  );
}
