const https = require("https");

const MANUELL_INFO = `
=== KONTAKT ===
Företag: Alviks Bygg och Entreprenad
Adress: Fockvägen 17, 865 31 Alnö
Telefon: 070-888 62 22
E-post: info@alviksbygg.se
Öppettider: Mån-Fre 06:30-17:00
Webbsida: alviksbygg.se
Verksamma i: Sundsvall, Gästrikland, Västernorrland och Jämtland/Härjedalen

=== OM FÖRETAGET ===
Sedan 2001 har Alviks Byggentreprenad erbjudit pålitliga bygg-, entreprenad-, och snickeritjänster i Gästrikland, Västernorrland och Jämtland/Härjedalen. Med lång erfarenhet, moderna maskiner och god lokalkännedom erbjuder våra hantverkare i Sundsvall trygga lösningar för privatpersoner och företag. Ansvarsförsäkrade, kvalitetssäkrade och serviceinriktade.

=== TJÄNSTER ===
- Badrumsrenovering,
- Köksrenovering,
- Takläggning,
- Om- och tillbyggnad,
- Nyproduktion,
- Isolering,
- Markarbeten,
- Snöröjning,
`;

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

const PAGES = [
  "https://alviksbygg.se/",
  "https://alviksbygg.se/byggtjanster/",
  "https://alviksbygg.se/badrumsrenovering/",
  "https://alviksbygg.se/koksrenovering/",
  "https://alviksbygg.se/taklaggning/",
  "https://alviksbygg.se/om-och-tillbyggnad/",
  "https://alviksbygg.se/isolering/",
  "https://alviksbygg.se/markarbeten/",
  "https://alviksbygg.se/om-oss/",
  "https://alviksbygg.se/kontakta-oss/",
  "https://alviksbygg.se/tips-och-rad/",
  "https://alviksbygg.se/tips-och-rad-/rotavdrag-markarbete-har-du-ratt-till-skatteavdrag/",
  "https://alviksbygg.se/tips-och-rad-/bygglov-regler-kostnader-och-risker/",
  "https://alviksbygg.se/tips-och-rad-/snorojning-ansvar-for-vagar-och-trottoarer/",
  "https://alviksbygg.se/tips-och-rad-/dranering-av-hus-pris-och-fordelar/",
];

let cachedInfo = null;
let cacheTime = null;
const CACHE_DURATION = 3 * 60 * 60 * 1000;

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  if (req.url && req.url.includes("refresh=true")) {
    cachedInfo = null;
    cacheTime = null;
  }

  if (cachedInfo && cacheTime && (Date.now() - cacheTime < CACHE_DURATION)) {
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
    res.json({ content: MANUELL_INFO });
  }
};
