// api/notify.js — Vercel Serverless Function
// Telegram bot token is stored safely in Vercel environment variables
// (never exposed in client-side code or GitHub)

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body;

  // Validate inputs
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID        = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_TOKEN || !CHAT_ID) {
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

    if (!tgRes.ok) throw new Error("Telegram API failed");

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Telegram error:", err);
    return res.status(500).json({ error: "Failed to send notification" });
  }
}
