import axios from "axios";
import * as cheerio from "cheerio";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const axiosConfig = {
  headers: { "User-Agent": USER_AGENT },
  timeout: 20000,
  maxContentLength: 5 * 1024 * 1024,
};

/** Returns raw HTML string for a URL. */
export async function fetchPageHtml(url: string): Promise<string> {
  const res = await axios.get<string>(url, axiosConfig);
  return res.data;
}

/** Returns clean readable text (strips scripts, nav, ads etc). */
export async function fetchPageText(url: string): Promise<string> {
  const html = await fetchPageHtml(url);
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header, iframe, noscript, aside, .ads, .advertisement").remove();
  return $("body")
    .text()
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 60000);
}
