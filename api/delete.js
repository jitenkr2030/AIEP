const { init } = require("@instantdb/admin");

const db = init({
  appId: "52877744-72cc-404a-b68e-fb01f3e387ac",
  adminToken: "9374433e-fd5f-4d17-b065-6102bd7df017"
});

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }

  try {
    const { collection, id } = req.body;
    await db.transact(db.tx[collection][id].delete());
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};
