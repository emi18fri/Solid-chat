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
  const system = "Du ar en hjalpsam assistent for Alviks Bygg, ett byggforetag i Västernorrland/Gästrikland/Härjedalen/Jämtland. Svara kort och professionellt. Svara pa samma sprak som anvandaren skriver pa." +
    (info ? " Info fran hemsidan: " + info.slice(0, 8000) : "");

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
