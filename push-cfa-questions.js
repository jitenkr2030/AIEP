const crypto = require("crypto");
const { init } = require("@instantdb/admin");
const db = init({ appId: "52877744-72cc-404a-b68e-fb01f3e387ac", adminToken: "9374433e-fd5f-4d17-b065-6102bd7df017" });
const uuid = () => crypto.randomUUID();
const Q = require("./cfa-questions.json");

async function pushQ(examKey, paperKey, questions) {
  const key = examKey + "_" + paperKey;
  console.log("Pushing " + questions.length + " for " + key);
  const formattedQ = questions.map((q) => ({
    id: "cfa_" + uuid(), q: q.question,
    opts: { A: q.options.A, B: q.options.B, C: q.options.C, D: q.options.D },
    ans: q.answer, diff: q.difficulty || "medium", topic: q.topic || "",
    explain: q.explanation || "", date: new Date().toLocaleString()
  }));
  const id = uuid();
  await db.transact(db.tx.facultyq[id].update({
    paperKey: key, count: formattedQ.length,
    questions: JSON.stringify(formattedQ), updated: new Date().toISOString()
  }));
  console.log("  OK: " + formattedQ.length + " pushed");
}

async function main() {
  console.log("=== PUSHING CFA QUESTIONS ===");
  for (const [key, questions] of Object.entries(Q)) {
    const parts = key.split("_");
    const paperKey = parts.pop();
    const examKey = parts.join("_");
    await pushQ(examKey, paperKey, questions);
  }
  console.log("=== ALL DONE ===");
}
main().catch(console.error);
