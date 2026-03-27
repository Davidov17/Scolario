import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-5 border-b bg-white shadow-sm">
      <Link href="/" className="text-2xl font-bold">
        Scholario
      </Link>

      <div className="flex gap-6 text-sm font-medium">
        <Link href="/">Home</Link>
        <Link href="/scholarships">Scholarships</Link>
        <Link href="/signup">Signup</Link>
      </div>
    </nav>
  );
}