"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ firstName: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const onStorage = () => {
      const s = localStorage.getItem("user");
      setUser(s ? JSON.parse(s) : null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  }

  return (
    <nav className="w-full flex items-center justify-between px-8 py-5 border-b bg-white shadow-sm">
      <Link href="/" className="text-2xl font-bold">
        Scholario
      </Link>

      <div className="flex items-center gap-6 text-sm font-medium">
        <Link href="/">Home</Link>
        <Link href="/scholarships">Scholarships</Link>
        {user ? (
          <>
            <Link href="/user" className="text-indigo-600 font-semibold">
              Hi, {user.firstName} 👋
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link href="/signup">Sign Up</Link>
            <Link
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition"
            >
              Log In
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}