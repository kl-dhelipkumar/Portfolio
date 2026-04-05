// api/notify.js — Vercel Serverless Function
// Telegram bot token stored safely in Vercel environment variables

export default async function handler(req, res) {
  // CORS headers for all responses
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Support both JSON and URLSearchParams (no-cors simple request)
  let name, email, message;
  const contentType = req.headers["content-type"] || "";

  if (contentType.includes("application/json")) {
    ({ name, email, message } = req.body || {});
  } else {
    // URLSearchParams body (sent by no-cors fetch from GitHub Pages)
    const body = req.body || {};
    // Vercel auto-parses application/x-www-form-urlencoded into req.body
    name    = body.name;
    email   = body.email;
    message = body.message;
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID        = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_TOKEN || !CHAT_ID) {
    console.error("Missing env vars: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
    return res.status(500).json({ error: "Server configuration missing" });
  }

  const text = `📬 New Portfolio Message!\n👤 From: ${name}\n📧 Email: ${email}\n\n💬 "${message}"`;

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text }),
      }
    );

    const tgData = await tgRes.json();

    if (!tgRes.ok) {
      console.error("Telegram API error:", tgData);
      return res.status(500).json({ error: "Telegram API failed", details: tgData });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Telegram fetch error:", err.message);
    return res.status(500).json({ error: "Failed to send notification" });
  }
}
