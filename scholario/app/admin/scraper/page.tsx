"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface AgentResult {
  message: string;
  saved: number;
  skipped: number;
  errors: string[];
  logs: string[];
}

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export default function AdminScraperPage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState("");
  const [showLogs, setShowLogs] = useState(false);

  async function handleRun() {
    setRunning(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch(`${API}/agent/run`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Agent failed.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Scholarship Scraper</h1>
        <p className="text-slate-500 text-sm mt-1">
          Automatically scrapes scholarship listings from the web and saves new ones to the database.
          Duplicate scholarships are skipped.
        </p>
      </div>

      {/* Sources card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Sources</h2>
        <ul className="space-y-2">
          {[
            "Scholars4Dev — Home (latest scholarships)",
            "Scholars4Dev — Masters",
            "Scholars4Dev — PhD",
            "Scholars4Dev — Undergraduate",
          ].map((source) => (
            <li key={source} className="flex items-center gap-2 text-sm text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              {source}
            </li>
          ))}
        </ul>
      </div>

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={running}
        className="flex items-center gap-2.5 px-6 py-3 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
      >
        {running ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Scraping… this may take a minute
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Run Scraper
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-4">

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-emerald-700">{result.saved}</p>
              <p className="text-xs font-semibold text-emerald-600 mt-1 uppercase tracking-wider">Saved</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-slate-600">{result.skipped}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Skipped</p>
            </div>
            <div className={`border rounded-xl p-4 text-center ${result.errors.length > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
              <p className={`text-3xl font-bold ${result.errors.length > 0 ? "text-red-600" : "text-slate-600"}`}>
                {result.errors.length}
              </p>
              <p className={`text-xs font-semibold mt-1 uppercase tracking-wider ${result.errors.length > 0 ? "text-red-500" : "text-slate-500"}`}>
                Errors
              </p>
            </div>
          </div>

          {/* Errors list */}
          {result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Errors</p>
              <ul className="space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-red-700 text-xs font-mono">{e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Logs toggle */}
          {result.logs.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Scraper logs ({result.logs.length} lines)</span>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform ${showLogs ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showLogs && (
                <div className="border-t border-slate-200 bg-slate-950 p-4 max-h-80 overflow-y-auto">
                  {result.logs.map((line, i) => (
                    <p
                      key={i}
                      className={`font-mono text-xs leading-5 ${
                        line.includes("[saved]") ? "text-emerald-400" :
                        line.includes("[error]") ? "text-red-400" :
                        line.includes("[dup]") ? "text-yellow-400" :
                        line.includes("[skip]") ? "text-slate-500" :
                        line.includes("📡") || line.includes("Source:") ? "text-indigo-400 font-semibold" :
                        "text-slate-300"
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
