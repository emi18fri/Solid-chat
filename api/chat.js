const https = require("https");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key missing" });

  const { messages, info } = req.body;
  const system = 
  "Du är en hjälpsam assistent för Alviks Bygg och Entreprenad, ett byggföretag i Sundsvall. " +
  "Svara alltid på svenska, kort och professionellt, utan markdown-formatering - inga stjärnor, inga bindestreck som listor, ingen fetstil. Skriv som vanlig text. " +
  "Svara på samma språk som användaren skriver på. " +
  "Kontaktuppgifter: Telefon: 070-888 62 22, E-post: info@alviksbygg.se, Öppettider: Mån-Fre 06:30-17:00. " +
  "Hänvisa aldrig till hemsidan. Ge kontaktuppgifterna i slutet av svaret när det är relevant, till exempel när kunden frågar om en tjänst, pris eller vill gå vidare med ett projekt. " +
  "Om du inte förstår frågan, svara med: Förlåt, jag förstod inte riktigt. Kan du förklara lite tydligare? " +
  "Du ska svara på frågor om ROT-avdrag - det är en viktig del av Alviks Byggs tjänster. ROT-avdraget ger 30% avdrag på arbetskostnaden upp till 50 000 kr per person och år. Dränering, markarbeten och renoveringar kan berättiga till ROT-avdrag. " +
  "Du ska svara på frågor om bygglov eftersom Alviks Bygg hjälper kunder med byggprojekt som kräver bygglov. Bygglov krävs ofta för nybyggnation, tillbyggnader och vissa renoveringar. " +
  (info ? "Info från hemsidan: " + info.slice(0, 8000) : "");

  const body = JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 500, system, messages });

  return new Promise((resolve) => {
    const proxyReq = https.request({
      hostname: "api.anthropic.com", path: "/v1/messages", method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Length": Buffer.byteLength(body) }
    }, (proxyRes) => {
      let data = "";
      proxyRes.on("data", chunk => data += chunk);
      proxyRes.on("end", () => { res.status(proxyRes.statusCode).json(JSON.parse(data)); resolve(); });
    });
    proxyReq.on("error", (err) => { res.status(500).json({ error: err.message }); resolve(); });
    proxyReq.write(body);
    proxyReq.end();
  });
};
