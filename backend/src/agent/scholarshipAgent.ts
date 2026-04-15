import { load } from "cheerio";
import { Scholarship } from "../models/Scholarship";
import { fetchPageHtml } from "./scraper";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawScholarship {
  title: string;
  country: string;
  funding: string;
  degreeLevel: string;
  deadline: string;
  description: string;
  link: string;
  isFeatured: boolean;
}

export interface AgentResult {
  saved: number;
  skipped: number;
  errors: string[];
}

// ─── Sources ──────────────────────────────────────────────────────────────────

interface SourceConfig {
  name: string;
  /** Listing pages to crawl for article links */
  listingUrls: string[];
  /** CSS selector that matches article <a> links on listing pages */
  articleLinkSelector: string;
  /** Optional paginated URL template — {page} is replaced with page number */
  paginationTemplate?: string;
  maxPages?: number;
  featured?: boolean;
}

export const SOURCES: SourceConfig[] = [
  {
    name: "Scholars4Dev — Home",
    listingUrls: ["https://www.scholars4dev.com/"],
    // Home page puts articles in h2/h3
    articleLinkSelector: "h2 a[href], h3 a[href]",
    maxPages: 1,
  },
  {
    name: "Scholars4Dev — Masters",
    listingUrls: ["https://www.scholars4dev.com/masters-scholarships/"],
    // Category pages link from anywhere on the page
    articleLinkSelector: "a[href]",
    paginationTemplate: "https://www.scholars4dev.com/masters-scholarships/page/{page}/",
    maxPages: 3,
  },
  {
    name: "Scholars4Dev — PhD",
    listingUrls: ["https://www.scholars4dev.com/phd-fellowships/"],
    articleLinkSelector: "a[href]",
    paginationTemplate: "https://www.scholars4dev.com/phd-fellowships/page/{page}/",
    maxPages: 2,
  },
  {
    name: "Scholars4Dev — Undergraduate",
    listingUrls: ["https://www.scholars4dev.com/undergraduate-scholarships/"],
    articleLinkSelector: "a[href]",
    maxPages: 1,
  },
];

// Re-export for backwards compatibility
export const DEFAULT_SOURCES = SOURCES;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Pulls the first matching regex group from text, trimmed. */
function extract(text: string, ...patterns: RegExp[]): string {
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) return m[1].trim().replace(/\s+/g, " ");
  }
  return "";
}

/** Returns true if deadlineStr clearly refers to a past date. */
function isExpired(deadlineStr: string): boolean {
  if (!deadlineStr) return false;
  // Take the last date-like fragment (handles "20 May/9 Sept 2026")
  const parts = deadlineStr.split(/[\/,]/).map((s) => s.trim());
  for (const part of parts.reverse()) {
    const d = new Date(part.replace(/\b(st|nd|rd|th)\b/gi, ""));
    if (!isNaN(d.getTime())) return d < new Date();
  }
  return false;
}

// ─── Detail page parser ───────────────────────────────────────────────────────
// scholars4dev pages follow a very consistent template:
//   "Study in: China"
//   "Deadline: 20 May 2026"
//   "Brief description: ..."
//   "Level/Fields of study: Masters …"
//   "Scholarship value/inclusions: ..."
//   "Host Institution(s): University, Country"

async function scrapeDetailPage(url: string): Promise<RawScholarship | null> {
  const html = await fetchPageHtml(url);
  const $ = load(html);

  // ── Title ──
  const title = $("h1").first().text().trim();
  if (!title) return null;

  // ── Clean up clutter ──
  $("script, style, nav, footer, header, .sidebar, .widget-area, .comments-area, .sharedaddy, .jp-relatedposts").remove();

  // ── Full body text for regex extraction ──
  const body = $("body").text().replace(/[ \t]+/g, " ").replace(/\n+/g, " ");

  // ── Country ──
  // Extract everything after "Study in:" then strip trailing noise words
  let country = extract(body,
    /Study in:\s*([^\n.]{2,80})/i,
    /Host Institution[^:]*:\s*[^,]+?,\s*([A-Za-z ,()-]{2,50})/i,
    /Location:\s*([A-Za-z ,()-]{2,50})/i,
  );
  // Strip "Course starts…", "Deadline:", "Program", "Level", years, etc.
  country = country
    .replace(/\s+(Course|Starts?|Program|Study|Deadline|Level|Host|Open|For|Next|\d{4}).*/i, "")
    .trim();
  if (country.length < 2) country = "International";

  // ── Degree level ──
  // Match the structured label first; fall back to first clear mention in the text
  const degreeLevel = extract(body,
    /Level\/Fields of study:\s*([^.]{4,120}?)(?=\s+Number of Awards|\s+Target group|\s+Scholarship value|\s+Eligibility)/i,
    /Scholarship Level:\s*([^.]{4,80}?)(?=\s+[A-Z])/i,
    /Study level:\s*([^.]{4,80}?)(?=\s+[A-Z])/i,
    /(?:^|\s)(Bachelor(?:'s)? Degree|Master(?:'s)? Degree|PhD|Doctoral Fellowship|Postdoctoral Fellowship|Undergraduate Scholarship|Graduate Fellowship)(?=\s)/i,
  );

  // ── Deadline ──
  const deadline = extract(body,
    /Deadline:\s*([^\n|]{4,60})/i,
    /Application Deadline:\s*([^\n|]{4,60})/i,
    /Closing Date:\s*([^\n|]{4,60})/i,
  );

  // Skip expired scholarships
  if (isExpired(deadline)) return null;

  // ── Funding ──
  const funding = extract(body,
    /Scholarship value\/inclusions?:\s*([^\n]{10,300})/i,
    /Scholarship Value:\s*([^\n]{10,200})/i,
    /(?:Award|Benefits?|Coverage):\s*([^\n]{10,200})/i,
    /(?:Full|Partial)\s+(?:scholarship|funding|tuition)/i,
  ) || "See scholarship link";

  // ── Description ──
  const description =
    extract(body,
      /Brief description:\s*([^]{20,1000}?)(?=\s*Host Institution|\s*Level\/Fields|\s*Number of Awards)/i,
      /Overview:\s*([^]{20,800}?)(?=\s*Host Institution|\s*Level\/Fields|\s*Eligibility)/i,
    ) ||
    // Fallback: first 3 content paragraphs
    $(".entry-content p, article p")
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((t) => t.length > 80)
      .slice(0, 3)
      .join(" ")
      .slice(0, 1200);

  if (!description) return null;

  return {
    title,
    country: country.slice(0, 100),
    funding: funding.slice(0, 500),
    degreeLevel: degreeLevel.slice(0, 200),
    deadline: deadline.slice(0, 100),
    description: description.slice(0, 1500),
    link: url,
    isFeatured: false,
  };
}

// ─── Listing page crawler ─────────────────────────────────────────────────────

async function getArticleLinks(listingUrl: string, selector: string): Promise<string[]> {
  const html = await fetchPageHtml(listingUrl);
  const $ = load(html);
  const links = new Set<string>();

  $(selector).each((_, el) => {
    const href = $(el).attr("href") ?? "";
    // Only accept individual post URLs (contain a numeric ID segment)
    if (/scholars4dev\.com\/\d+\//.test(href)) {
      links.add(href);
    }
  });

  return [...links];
}

// ─── Main agent ───────────────────────────────────────────────────────────────

export async function runScholarshipAgent(
  sources: SourceConfig[] = SOURCES,
  onProgress?: (msg: string) => void
): Promise<AgentResult> {
  const result: AgentResult = { saved: 0, skipped: 0, errors: [] };
  const visitedUrls = new Set<string>();

  const log = (msg: string) => { console.log(msg); onProgress?.(msg); };

  for (const source of sources) {
    log(`\n📡  Source: ${source.name}`);

    // Build full list of listing page URLs (page 1 + paginated pages)
    const listingPages: string[] = [...source.listingUrls];
    if (source.paginationTemplate && source.maxPages && source.maxPages > 1) {
      for (let p = 2; p <= source.maxPages; p++) {
        listingPages.push(source.paginationTemplate.replace("{page}", String(p)));
      }
    }

    // Collect article links
    const articleLinks: string[] = [];
    for (const listingUrl of listingPages) {
      if (visitedUrls.has(listingUrl)) continue;
      visitedUrls.add(listingUrl);
      try {
        log(`  [listing] ${listingUrl}`);
        const links = await getArticleLinks(listingUrl, source.articleLinkSelector);
        const fresh = links.filter((l) => !visitedUrls.has(l));
        log(`           → ${fresh.length} article(s) found`);
        articleLinks.push(...fresh);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`  [error]  Listing failed: ${msg}`);
        result.errors.push(`Listing (${listingUrl}): ${msg}`);
      }
    }

    // Scrape each article
    for (const url of articleLinks) {
      if (visitedUrls.has(url)) continue;
      visitedUrls.add(url);

      try {
        const data = await scrapeDetailPage(url);

        if (!data) {
          log(`  [skip]   No usable data — ${url}`);
          result.skipped++;
          continue;
        }

        if (source.featured) data.isFeatured = true;

        const exists = await Scholarship.findOne({ title: data.title, country: data.country });
        if (exists) {
          log(`  [dup]    "${data.title}"`);
          result.skipped++;
          continue;
        }

        await Scholarship.create({ ...data, source: "agent" });
        log(`  [saved]  "${data.title}" — ${data.country}`);
        result.saved++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`  [error]  ${url}: ${msg}`);
        result.errors.push(`Detail (${url}): ${msg}`);
      }
    }
  }

  return result;
}
