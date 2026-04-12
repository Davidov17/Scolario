# Scolario Backend — Setup Guide

## What this is

A Node.js + Express + MongoDB backend for Scolario. It replaces all the
hardcoded scholarship arrays in your React files with a single, unified API.

---

## Folder structure

```
scolario-backend/
├── src/
│   ├── models/
│   │   └── Scholarship.ts       ← Mongoose model
│   ├── routes/
│   │   └── scholarships.ts      ← All API routes + spreadsheet import
│   ├── server.ts                ← Express app entry point
│   └── seed.ts                  ← One-time DB seed script
├── .env.example
├── package.json
└── tsconfig.json

Frontend files to replace (copy into your Next.js project):
├── frontend-page.tsx            → app/page.tsx
├── frontend-scholarships-page.tsx → app/scholarships/page.tsx
└── frontend-scholarship-detail.tsx → app/scholarships/[id]/page.tsx
```

---

## Step 1 — Set up MongoDB

Option A (local): Install MongoDB Community Edition
Option B (cloud, easier): Create a free cluster at https://cloud.mongodb.com

---

## Step 2 — Set up the backend

```bash
# In the scolario-backend folder:
npm install
cp .env.example .env

# Edit .env and set your MongoDB URI:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/scolario

# Seed the database with the existing hardcoded scholarships
npm run seed

# Start the dev server
npm run dev
# → Running at http://localhost:4000
```

---

## Step 3 — Update the frontend

1. Add your API URL to your Next.js `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

2. Replace these three files with the new versions:

| Replace this file | With this file |
|---|---|
| `app/page.tsx` | `frontend-page.tsx` |
| `app/scholarships/page.tsx` | `frontend-scholarships-page.tsx` |
| `app/scholarships/[id]/page.tsx` | `frontend-scholarship-detail.tsx` |

---

## Step 4 — Import scholarships from a spreadsheet

1. Fill in `scholarships-template.csv` with your scholarship data
2. Save it as `.xlsx` or keep as `.csv`
3. POST it to the import endpoint:

```bash
curl -X POST http://localhost:4000/api/scholarships/import/spreadsheet \
  -F "file=@scholarships-template.csv"
```

Or from your frontend (example with a file input):

```tsx
const formData = new FormData();
formData.append("file", selectedFile);
await fetch("http://localhost:4000/api/scholarships/import/spreadsheet", {
  method: "POST",
  body: formData,
});
```

Required columns: `Title`, `Country`, `Funding`, `Deadline`, `Description`, `Requirements`, `Link`, `Featured`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scholarships` | All scholarships |
| GET | `/api/scholarships?featured=true` | Featured scholarships only |
| GET | `/api/scholarships/:id` | Single scholarship |
| POST | `/api/scholarships` | Create one manually |
| PUT | `/api/scholarships/:id` | Update one |
| DELETE | `/api/scholarships/:id` | Delete one |
| POST | `/api/scholarships/import/spreadsheet` | Import from .xlsx or .csv |

---

## What to delete from your old code

After verifying everything works, remove these from your React files:

```tsx
// ❌ DELETE from app/page.tsx
const featuredScholarships = [ { id: 1, ... }, ... ];

// ❌ DELETE from app/scholarships/page.tsx
const scholarships = [ { id: 1, ... }, ... ];

// ❌ DELETE from app/scholarships/[id]/page.tsx
const scholarships = { "1": { ... }, "2": { ... } };
```

The new versions of those files already fetch from the API instead.
