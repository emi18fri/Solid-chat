const https = require("https");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&aring;/g, "å")
    .replace(/&auml;/g, "ä")
    .replace(/&ouml;/g, "ö")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const PAGES = [
  { name: "Startsida", url: "https://solidbyggochbetong.se/" },
  { name: "Byggarbeten", url: "https://solidbyggochbetong.se/byggarbeten/" },
  { name: "Betongarbeten", url: "https://solidbyggochbetong.se/betongarbeten/" },
  { name: "Dränering", url: "https://solidbyggochbetong.se/dranering/" },
  { name: "Stenläggning", url: "https://solidbyggochbetong.se/stenlaggning/" },
  { name: "Om oss", url: "https://solidbyggochbetong.se/om-oss/" },
  { name: "Kontakt", url: "https://solidbyggochbetong.se/kontakt/" },
  { name: "Sundsvall", url: "https://solidbyggochbetong.se/sundsvall/" },
  { name: "Kramfors", url: "https://solidbyggochbetong.se/kramfors/" },
  { name: "Referenser", url: "https://solidbyggochbetong.se/referenser/" },
];

let cachedContent = null;
let cacheTime = null;
const CACHE_DURATION = 3 * 60 * 60 * 1000;

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  if (cachedContent && cacheTime && (Date.now() - cacheTime < CACHE_DURATION)) {
    return res.json({ content: cachedContent, cached: true });
  }

  try {
    let allText = "";
    for (const page of PAGES) {
      try {
        const html = await fetchUrl(page.url);
        const text = stripHtml(html);
        allText += `\n\n=== ${page.name} ===\n` + text.slice(0, 2000);
      } catch (e) {
        console.error("Failed:", page.url, e.message);
      }
    }
    cachedContent = allText.slice(0, 20000);
    cacheTime = Date.now();
    res.json({ content: cachedContent, cached: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
