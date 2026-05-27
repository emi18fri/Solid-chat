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

=== CERTIFIERINGAR OCH OMDÖMEN ===
Alviks Bygg är certifierade på Reco.se med högt betyg från nöjda kunder. Reco är Sveriges ledande rekommendationstjänst för hantverkare och företag. Se alla recensioner på reco.se/alviks-bygg

=== KUNDRECENSIONER FRÅN RECO ===
Alviks Bygg har högt betyg på Reco.se. Här är några recensioner:

"Snabb respons av offert och snabbt utförande och grundlig städning." - Gunilla O via Reco

"Proffsigt arbete i allt från projektering till färdigställande, otroligt nöjda över vår nya balkong!!" - Johannes via Reco

"Alviks bygg är proffsiga och lyhörda. De gjorde jobbet snyggt och snabbt, och fixade lite extra saker som jag bad om i samband med tilläggsisolering av tak. Jag kan varmt rekommendera dom!" - Tomas A via Reco

Se alla recensioner på reco.se/alviks-bygg

=== UNGEFÄRLIGA PRISER ===
Dränering: Generellt ligger kostnaden för att dränera runt ett vanligt hus på cirka 1 500–3 000 kronor per löpmeter. Som exempel skulle dräneringen av ett hus med en omkrets på 40 meter kosta mellan 60 000 och 120 000 kronor. Att dränera en källare kan kosta lite mer. Det beror på att arbetet kan vara mer komplicerat och kräva ytterligare åtgärder för att skydda väggar och golv från fukt.
Schaktning: Schaktning i Sundsvall kan variera i pris beroende på storleken av projektet, hur djupt som ska grävas och vilken utrustning som krävs. Generellt kostar schaktning mellan 800 och 1 500 kronor per timme, inklusive maskiner och förare. För större projekt kan vi erbjuda ett fast pris baserat på en genomgång av arbetets omfattning.

=== OM FÖRETAGET ===
Sedan 2001 har Alviks Byggentreprenad erbjudit pålitliga bygg-, entreprenad-, och snickeritjänster i Gästrikland, Västernorrland och Jämtland/Härjedalen. Med lång erfarenhet, över 100 genomförda nybyggnationer, moderna maskiner och god lokalkännedom erbjuder våra hantverkare i Sundsvall trygga lösningar för privatpersoner och företag. Ansvarsförsäkrade, kvalitetssäkrade och serviceinriktade.

=== PRISER ===
Vi erbjuder kostnadsfria offertförfrågningar. Kontakta oss på 070-888 62 22 eller info@alviksbygg.se så återkommer vi med en offert anpassad för ditt projekt.

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
