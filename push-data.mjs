import { init } from "@instantdb/admin";
import { randomUUID } from "crypto";

const APP_ID = "52877744-72cc-404a-b68e-fb01f3e387ac";
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.log("ERROR: No admin token in .env");
  process.exit(1);
}

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });
console.log("Connected with admin token");

const users = [
  { name: "Rahul Sharma", email: "rahul@demo.com", phone: "9876543210", roll: "CS2024001", tier: "professional", joined: "2024-12-15 10:30" },
  { name: "Priya Patel", email: "priya@demo.com", phone: "9876543211", roll: "CS2024002", tier: "starter", joined: "2024-12-20 14:15" },
  { name: "Amit Kumar", email: "amit@demo.com", phone: "9876543212", roll: "CS2024003", tier: "free", joined: "2025-01-05 09:00" },
  { name: "Sneha Gupta", email: "sneha@demo.com", phone: "9876543213", roll: "CA2024001", tier: "ultimate", joined: "2025-01-10 11:30" },
  { name: "Vikram Singh", email: "vikram@demo.com", phone: "9876543214", roll: "MED2024001", tier: "professional", joined: "2025-01-15 16:45" },
  { name: "Anjali Verma", email: "anjali@demo.com", phone: "9876543215", roll: "CSE2024001", tier: "starter", joined: "2025-02-01 08:20" },
  { name: "Rohit Mehra", email: "rohit@demo.com", phone: "9876543216", roll: "CL2024001", tier: "free", joined: "2025-02-10 13:50" },
  { name: "Deepika Nair", email: "deepika@demo.com", phone: "9876543217", roll: "DEF2024001", tier: "professional", joined: "2025-02-15 10:10" },
  { name: "Suresh Yadav", email: "suresh@demo.com", phone: "9876543218", roll: "GATE2024001", tier: "starter", joined: "2025-03-01 15:30" },
  { name: "Kavita Joshi", email: "kavita@demo.com", phone: "9876543219", roll: "MBA2024001", tier: "ultimate", joined: "2025-03-05 09:45" }
];

console.log("Writing " + users.length + " users...");
for (const u of users) {
  const id = randomUUID();
  await db.transact(db.tx.portalusers[id].update(u));
  console.log("  OK: " + u.name);
}

const results = [
  { name: "Rahul Sharma", email: "rahul@demo.com", roll: "CS2024001", exam: "CA Foundation", paper: "Accounting", score: 85, total: 100, pct: 85, date: "2025-01-20 10:30" },
  { name: "Rahul Sharma", email: "rahul@demo.com", roll: "CS2024001", exam: "CA Foundation", paper: "Law", score: 72, total: 100, pct: 72, date: "2025-02-15 14:00" },
  { name: "Priya Patel", email: "priya@demo.com", roll: "CS2024002", exam: "NEET UG", paper: "Physics", score: 140, total: 200, pct: 70, date: "2025-03-10 09:00" },
  { name: "Priya Patel", email: "priya@demo.com", roll: "CS2024002", exam: "NEET UG", paper: "Chemistry", score: 160, total: 200, pct: 80, date: "2025-03-10 14:00" },
  { name: "Amit Kumar", email: "amit@demo.com", roll: "CS2024003", exam: "JEE Main", paper: "Mathematics", score: 65, total: 100, pct: 65, date: "2025-04-05 10:00" },
  { name: "Sneha Gupta", email: "sneha@demo.com", roll: "CA2024001", exam: "CA Inter", paper: "Taxation", score: 78, total: 100, pct: 78, date: "2025-01-25 11:00" },
  { name: "Sneha Gupta", email: "sneha@demo.com", roll: "CA2024001", exam: "CA Inter", paper: "Accounting", score: 92, total: 100, pct: 92, date: "2025-01-26 09:00" },
  { name: "Vikram Singh", email: "vikram@demo.com", roll: "MED2024001", exam: "NEET PG", paper: "Medicine", score: 155, total: 200, pct: 78, date: "2025-03-20 10:00" },
  { name: "Anjali Verma", email: "anjali@demo.com", roll: "CSE2024001", exam: "GATE CSE", paper: "Computer Science", score: 58, total: 100, pct: 58, date: "2025-02-10 14:00" },
  { name: "Rohit Mehra", email: "rohit@demo.com", roll: "CL2024001", exam: "CLAT", paper: "Legal Reasoning", score: 88, total: 100, pct: 88, date: "2025-04-15 09:00" },
  { name: "Deepika Nair", email: "deepika@demo.com", roll: "DEF2024001", exam: "CDS", paper: "English", score: 76, total: 100, pct: 76, date: "2025-05-01 10:00" },
  { name: "Suresh Yadav", email: "suresh@demo.com", roll: "GATE2024001", exam: "GATE ME", paper: "Mechanical", score: 45, total: 100, pct: 45, date: "2025-02-20 14:00" },
  { name: "Kavita Joshi", email: "kavita@demo.com", roll: "MBA2024001", exam: "CAT", paper: "Quantitative", score: 95, total: 100, pct: 95, date: "2025-03-30 10:00" },
  { name: "Kavita Joshi", email: "kavita@demo.com", roll: "MBA2024001", exam: "CAT", paper: "Verbal", score: 82, total: 100, pct: 82, date: "2025-03-30 14:00" },
  { name: "Rahul Sharma", email: "rahul@demo.com", roll: "CS2024001", exam: "CS Executive", paper: "Company Law", score: 70, total: 100, pct: 70, date: "2025-05-10 10:00" }
];

console.log("Writing " + results.length + " results...");
for (const r of results) {
  const id = randomUUID();
  await db.transact(db.tx.results[id].update(r));
  console.log("  OK: " + r.name + " " + r.exam + " " + r.pct + "%");
}

const vouchers = [
  { id: "FREE2026", desc: "Free Access", used: 12, max: 9999, tier: "ultimate" },
  { id: "LAUNCH50", desc: "Launch Promo", used: 8, max: 9999, tier: "starter" },
  { id: "PREMIUM100", desc: "Premium Discount", used: 3, max: 100, tier: "professional" },
  { id: "STUDENT25", desc: "Student Special", used: 5, max: 50, tier: "starter" },
  { id: "EARLYBIRD", desc: "Early Bird Offer", used: 2, max: 200, tier: "ultimate" }
];

console.log("Writing " + vouchers.length + " vouchers...");
for (const v of vouchers) {
  const id = randomUUID();
  await db.transact(db.tx.vouchers[id].update(v));
  console.log("  OK: " + v.id);
}

const logs = [
  { action: "User Login: Rahul Sharma", time: "2025-05-01 10:00" },
  { action: "Exam Started: CA Foundation", time: "2025-05-01 10:05" },
  { action: "Result: 85%", time: "2025-05-01 10:35" },
  { action: "Voucher Used: FREE2026", time: "2025-05-01 11:00" },
  { action: "User Signup: Kavita Joshi", time: "2025-05-01 12:00" },
  { action: "Faculty Added 5 Questions", time: "2025-05-01 13:00" },
  { action: "Admin Backup Exported", time: "2025-05-01 14:00" },
  { action: "Voucher Created: STUDENT25", time: "2025-05-01 15:00" },
  { action: "User Login: Priya Patel", time: "2025-05-02 09:00" },
  { action: "Exam Started: NEET UG", time: "2025-05-02 09:05" }
];

console.log("Writing " + logs.length + " logs...");
for (const l of logs) {
  const id = randomUUID();
  await db.transact(db.tx.logs[id].update(l));
  console.log("  OK: " + l.action);
}

console.log("");
console.log("ALL DONE!");
console.log("Check InstantDB Explorer now!");
process.exit(0);
