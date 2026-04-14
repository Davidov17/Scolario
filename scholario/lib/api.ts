const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface LangCert { name: string; minScore: string }

export interface ScholarshipRequirements {
  age: { enabled: boolean; min: number; max: number };
  educationLevel: { enabled: boolean; levels: string[] };
  languageCertificates: { enabled: boolean; items: LangCert[] };
  personalEssay: boolean;
  recommendationLetters: { enabled: boolean; count: number };
  motivationLetter: boolean;
  cv: boolean;
  portfolio: boolean;
  notes: string;
}

export interface Scholarship {
  _id: string;
  title: string;
  country: string;
  funding: string;
  degreeLevel: string;
  deadline: string;
  description: string;
  requirements: ScholarshipRequirements | string;
  link: string;
  isFeatured: boolean;
}

export async function getScholarships(featured?: boolean): Promise<Scholarship[]> {
  try {
    const url = featured
      ? `${API_BASE}/scholarships?featured=true`
      : `${API_BASE}/scholarships`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getScholarshipById(id: string): Promise<Scholarship | null> {
  try {
    const res = await fetch(`${API_BASE}/scholarships/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getProfile(token: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function saveProfile(token: string, data: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getBookmarks(token: string): Promise<Scholarship[]> {
  try {
    const res = await fetch(`${API_BASE}/bookmarks`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function toggleBookmark(token: string, scholarshipId: string): Promise<boolean | null> {
  try {
    const res = await fetch(`${API_BASE}/bookmarks/${scholarshipId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.bookmarked;
  } catch {
    return null;
  }
}

export type AppStatus = "saved" | "applied" | "pending" | "accepted" | "rejected";

export interface Application {
  _id: string;
  scholarshipId: Scholarship;
  status: AppStatus;
  notes: string;
  appliedAt?: string;
  updatedAt: string;
}

export async function getApplications(token: string): Promise<Application[]> {
  try {
    const res = await fetch(`${API_BASE}/applications`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getApplication(token: string, scholarshipId: string): Promise<Application | null> {
  try {
    const res = await fetch(`${API_BASE}/applications/${scholarshipId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function updateApplication(
  token: string,
  scholarshipId: string,
  status: AppStatus,
  notes: string
): Promise<Application | null> {
  try {
    const res = await fetch(`${API_BASE}/applications/${scholarshipId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function deleteApplication(token: string, scholarshipId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/applications/${scholarshipId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
