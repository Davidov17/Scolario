"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const inputClass = "w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users`, { headers: authHeaders() });
      if (res.ok) setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleAdmin(id: string) {
    setTogglingId(id);
    try {
      const res = await fetch(`${API}/users/${id}/toggle-admin`, { method: "PATCH", headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isAdmin: data.isAdmin } : u));
      }
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`${API}/users/${id}`, { method: "DELETE", headers: authHeaders() });
    setDeleteId(null);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  }

  const filtered = users.filter(
    (u) => !search ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const admins = filtered.filter((u) => u.isAdmin).length;
  const students = filtered.filter((u) => !u.isAdmin).length;

  return (
    <div className="p-8">

      {/* Page header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-600 text-sm mt-0.5">
            {users.length} total &mdash; {admins} admin{admins !== 1 ? "s" : ""}, {students} student{students !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-6 h-6 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["Name", "Email", "Role", "Joined", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                        <span className="text-indigo-600 text-xs font-bold">{u.firstName[0].toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-slate-900">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3.5">
                    {u.isAdmin
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">Admin</span>
                      : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Student</span>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleAdmin(u._id)}
                        disabled={togglingId === u._id}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
                      >
                        {togglingId === u._id ? "…" : u.isAdmin ? "Demote" : "Make Admin"}
                      </button>
                      <button
                        onClick={() => setDeleteId(u._id)}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete user?</h3>
            <p className="text-slate-600 text-sm mb-1">
              <span className="font-semibold text-slate-900">
                {users.find((u) => u._id === deleteId)?.firstName} {users.find((u) => u._id === deleteId)?.lastName}
              </span>
            </p>
            <p className="text-slate-600 text-sm mb-6">This will permanently remove their account and cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
