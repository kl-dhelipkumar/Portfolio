// api/notify.js — Vercel Serverless Function
// Telegram bot token is stored safely in Vercel environment variables
// (never exposed in client-side code or GitHub)

export default async function handler(req, res) {
  // Allow CORS from any origin (GitHub Pages + Vercel)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body || {};

  // Validate inputs
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields", received: { name: !!name, email: !!email, message: !!message } });
  }

  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID        = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_TOKEN || !CHAT_ID) {
    console.error("Missing env vars: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
    return res.status(500).json({ error: "Server configuration missing — add env vars in Vercel dashboard" });
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
    return res.status(500).json({ error: "Failed to send notification", details: err.message });
  }
}
