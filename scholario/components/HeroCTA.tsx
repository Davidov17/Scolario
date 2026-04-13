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
      <div className="flex justify-center gap-4 flex-wrap">
        <Link
          href="/user"
          className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-medium shadow-lg hover:scale-105 transition"
        >
          Go to My Dashboard →
        </Link>
        <Link
          href="/scholarships"
          className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-black transition"
        >
          Browse Scholarships
        </Link>
      </div>
    );
  }

  return (
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
  );
}
