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
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&aring;/g, "å")
    .replace(/&auml;/g, "ä")
    .replace(/&ouml;/g, "ö")
    .replace(/\s{2,}/g, " ")
    .trim();
}
const MANUELL_INFO = `
Kontakt Solid Bygg och Betong:
Telefon: [070-888 62 22]
        
Email: [E-postadress: info@alviksbygg.se]
Adress: [Fockvägen 17, 865 31 Alnö]
`;
const PAGES = [
  "https://alviksbygg.se/",
  "https://alviksbygg.se/byggtjanster/",
  "https://alviksbygg.se/isolering/",
  "https://alviksbygg.se/markarbeten/",
  "https://alviksbygg.se/tips-och-rad/",
  "https://alviksbygg.se/om-oss/",
  "https://alviksbygg.se/kontakta-oss/",
  "https://alviksbygg.se/badrumsrenovering/",
  "https://alviksbygg.se/koksrenovering/",
  "https://alviksbygg.se/taklaggning/",
  "https://alviksbygg.se/om-och-tillbyggnad/",
];

let cachedInfo = null;
let cacheTime = null;

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  if (cachedInfo && cacheTime && (Date.now() - cacheTime < 3 * 60 * 60 * 1000)) {
    return res.json({ content: cachedInfo });
  }

  try {
    let all = "";
    for (const url of PAGES) {
      try {
        const html = await fetchUrl(url);
        all += "\n\n" + stripHtml(html).slice(0, 2000);
      } catch(e) {}
    }
    cachedInfo = MANUELL_INFO + all.slice(0, 15000);
    cacheTime = Date.now();
    res.json({ content: cachedInfo });
  } catch(e) {
    res.json({ content: "" });
  }
};
