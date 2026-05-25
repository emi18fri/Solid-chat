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
Telefon: [Växel: 060-30 500
          Rickard Berglund
Delägare / Ansvarig betong
Telefon: 076 – 061 21 24
Douglas Berkö
Delägare / Ekonomiansvarig

Telefon: 070 – 664 91 40
Fredrik Ölund
Arbetsledare

Telefon: 070 – 333 34 12]
        
Email: [E-postadress: info@solidbyggochbetong.se]
Adress: [Klökanvägen 12B
863 41 Sundsvall]
`;
const PAGES = [
  "https://solidbyggochbetong.se/",
  "https://solidbyggochbetong.se/byggarbeten/",
  "https://solidbyggochbetong.se/betongarbeten/",
  "https://solidbyggochbetong.se/dranering/",
  "https://solidbyggochbetong.se/stenlaggning/",
  "https://solidbyggochbetong.se/om-oss/",
  "https://solidbyggochbetong.se/kontakt/",
  "https://solidbyggochbetong.se/sundsvall/",
  "https://solidbyggochbetong.se/kramfors/",
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
