/**
 * Backfill physicians from the official NPPES file in ONE pass:
 *   - gender            (M / F)               → column: gender
 *   - enumeration_year  (year NPI was issued) → column: enumeration_year  (seniority signal)
 *   - npi_deactivated   (retired/deceased)    → column: npi_deactivated    (data hygiene)
 *
 * NPPES is authoritative for all three (self-reported at registration), so no guessing.
 *
 * Prereq SQL (run once in Supabase SQL editor):
 *   ALTER TABLE physicians ADD COLUMN IF NOT EXISTS enumeration_year INT;
 *   ALTER TABLE physicians ADD COLUMN IF NOT EXISTS npi_deactivated BOOLEAN DEFAULT false;
 *   -- gender column already exists
 *
 * Key: put your cloud service_role key in scripts/service-key.local (one line), OR
 *      set $env:SUPABASE_SERVICE_KEY before running.
 *
 * Run:
 *   node scripts/backfill-nppes.mjs "C:/path/to/npidata_pfile_....csv"
 *
 * Safe to re-run — every update is idempotent (writes the same authoritative value).
 */
import { createReadStream, readFileSync, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://kgykvrrxxolyfhhqehmz.supabase.co";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const keyFile = path.join(scriptDir, "service-key.local");
let SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
if (!SERVICE_KEY && existsSync(keyFile)) {
  SERVICE_KEY = readFileSync(keyFile, "utf8").replace(/[^\x21-\x7E]/g, "").trim();
}
if (!SERVICE_KEY) {
  console.error("Missing service_role key — put it in scripts/service-key.local (one line) and re-run.");
  process.exit(1);
}

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/backfill-nppes.mjs "path/to/npidata_pfile_....csv"');
  process.exit(1);
}

const HEADERS = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" };

// Load ALL npis via keyset pagination on npi (ordering by npi alone is index-fast).
async function loadAllNpis() {
  const npis = new Set();
  let lastNpi = "0";
  for (;;) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/physicians?select=npi&npi=gt.${lastNpi}&order=npi.asc&limit=1000`,
      { headers: HEADERS }
    );
    if (!res.ok) throw new Error(`Failed to page physicians: ${res.status} ${await res.text()}`);
    const rows = await res.json();
    if (rows.length === 0) break;
    for (const r of rows) npis.add(String(r.npi));
    lastNpi = String(rows[rows.length - 1].npi);
    process.stdout.write(`\rLoading NPIs from Supabase: ${npis.size.toLocaleString()}`);
    if (rows.length < 1000) break;
  }
  console.log();
  return npis;
}

function splitCsvLine(line) {
  const out = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

// Generic grouped bulk update: PATCH ...?npi=in.(chunk) with one shared body.
async function updateGroup(npis, body, label) {
  const BATCH = 400;
  for (let i = 0; i < npis.length; i += BATCH) {
    const chunk = npis.slice(i, i + BATCH);
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/physicians?npi=in.(${chunk.join(",")})`,
      { method: "PATCH", headers: { ...HEADERS, Prefer: "return=minimal" }, body: JSON.stringify(body) }
    );
    if (!res.ok) console.error(`\nBatch failed (${label}, offset ${i}): ${res.status} ${await res.text()}`);
    process.stdout.write(`\rUpdating ${label}: ${Math.min(i + BATCH, npis.length).toLocaleString()} / ${npis.length.toLocaleString()}`);
  }
  console.log();
}

async function main() {
  const targets = await loadAllNpis();
  console.log(`Physicians to backfill: ${targets.size.toLocaleString()}`);
  if (targets.size === 0) return console.log("Nothing to do.");

  const male = [];
  const female = [];
  const byYear = new Map();       // year(int) -> [npi]
  const deactivated = [];
  let sexCol = -1, enumCol = -1, deactCol = -1, reactCol = -1;
  let lineNo = 0, matched = 0;

  const rl = createInterface({ input: createReadStream(csvPath), crlfDelay: Infinity });
  for await (const line of rl) {
    lineNo++;
    if (lineNo === 1) {
      const header = splitCsvLine(line);
      sexCol = header.findIndex(h => /provider (sex|gender) code/i.test(h));
      enumCol = header.findIndex(h => /provider enumeration date/i.test(h));
      deactCol = header.findIndex(h => /npi deactivation date/i.test(h));
      reactCol = header.findIndex(h => /npi reactivation date/i.test(h));
      if (sexCol === -1) throw new Error("Could not find 'Provider Sex Code' column");
      console.log(`Columns → sex:${sexCol} enum:${enumCol} deact:${deactCol} react:${reactCol}. Streaming ~8M rows…`);
      continue;
    }
    const npi = line.startsWith('"') ? line.slice(1, line.indexOf('"', 1)) : line.split(",", 1)[0];
    if (!targets.has(npi)) continue;
    const f = splitCsvLine(line);
    matched++;

    const sex = (f[sexCol] || "").trim().toUpperCase();
    if (sex === "M") male.push(npi);
    else if (sex === "F") female.push(npi);

    if (enumCol !== -1) {
      const d = (f[enumCol] || "").trim();            // format MM/DD/YYYY
      const y = parseInt(d.slice(-4), 10);
      if (y >= 1990 && y <= 2100) {
        if (!byYear.has(y)) byYear.set(y, []);
        byYear.get(y).push(npi);
      }
    }

    if (deactCol !== -1) {
      const deact = (f[deactCol] || "").trim();
      const react = reactCol !== -1 ? (f[reactCol] || "").trim() : "";
      if (deact && !react) deactivated.push(npi);       // deactivated and not reactivated
    }

    if (matched % 25000 === 0) {
      process.stdout.write(`\rMatched: ${matched.toLocaleString()} (scanned ${lineNo.toLocaleString()} rows)`);
    }
  }
  console.log(
    `\nMatched ${matched.toLocaleString()} — ` +
    `${male.length.toLocaleString()}M / ${female.length.toLocaleString()}F, ` +
    `${byYear.size} enum-year groups, ${deactivated.length.toLocaleString()} deactivated.`
  );

  await updateGroup(male, { gender: "M" }, "gender M");
  await updateGroup(female, { gender: "F" }, "gender F");
  for (const [year, list] of [...byYear.entries()].sort((a, b) => a[0] - b[0])) {
    await updateGroup(list, { enumeration_year: year }, `enum ${year}`);
  }
  if (deactivated.length) await updateGroup(deactivated, { npi_deactivated: true }, "deactivated");

  console.log("\nDone. Verify:");
  console.log("  select gender, count(*) from physicians group by gender;");
  console.log("  select enumeration_year, count(*) from physicians group by enumeration_year order by 1;");
  console.log("  select count(*) from physicians where npi_deactivated;");
}

main().catch(e => { console.error(e); process.exit(1); });
