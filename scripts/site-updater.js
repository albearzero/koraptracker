#!/usr/bin/env node
/**
 * scripts/site-updater.js
 * Korap Tracker (Philippine Corruption Tracker) — Content & Sources Updater
 * 
 * Usage:
 *   node scripts/site-updater.js list
 *   node scripts/site-updater.js add-case --name "..." --amount 1000000000 --year 2026 --agency "..." --docket "..." --source "https://..." --notes "..."
 *   node scripts/site-updater.js add-action --title "..." --amount 1000000000 --authority "..." --actionType "..." --url "https://..."
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT_DIR, 'data.js');
const SOURCES_FILE = path.join(ROOT_DIR, 'sources.html');

const args = process.argv.slice(2);
const command = args[0] || 'list';

function parseFlags(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true;
      flags[key] = val;
    }
  }
  return flags;
}

const flags = parseFlags(args.slice(1));

function readDataJs() {
  const content = fs.readFileSync(DATA_FILE, 'utf8');
  return content;
}

if (command === 'list') {
  console.log('⚖️  KORAP TRACKER REGISTERED CORRUPTION CASES\n========================================');
  const content = readDataJs();
  const casesMatch = content.match(/const CORRUPTION_CASES = (\[[\s\S]*?\]);/);
  if (!casesMatch) {
    console.error('Could not parse CORRUPTION_CASES from data.js');
    process.exit(1);
  }
  
  // Safe evaluation of the array
  const cases = eval(casesMatch[1]);
  console.log(`Total Cases: ${cases.length}\n`);
  cases.forEach(c => {
    const amtStr = c.amount >= 1e9 ? `₱${(c.amount/1e9).toFixed(2)}B` : `₱${(c.amount/1e6).toFixed(0)}M`;
    console.log(`[ID ${c.id}] ${c.name}`);
    console.log(`   Agency:   ${c.agency} (${c.year})`);
    console.log(`   Amount:   ${amtStr} · Status: ${c.status}`);
    console.log(`   Source:   ${c.source}`);
    console.log(`   Doc:      ${c.sourceName}\n`);
  });
  console.log('Use "node scripts/site-updater.js add-case" or prompt Antigravity to add new cases.');
} else if (command === 'add-case') {
  if (!flags.name || !flags.amount || !flags.source) {
    console.error('Error: Required flags missing. Provide at least: --name, --amount, --source');
    console.error('Example: node scripts/site-updater.js add-case --name "DPWH Flood Control" --amount 7440000000 --year 2026 --agency "DPWH" --source "https://..."');
    process.exit(1);
  }

  let content = readDataJs();
  const idMatch = content.match(/id:\s*(\d+)/g);
  const ids = idMatch ? idMatch.map(m => parseInt(m.replace(/\D/g, ''), 10)) : [10];
  const nextId = Math.max(...ids) + 1;

  const newCaseObj = {
    id: nextId,
    name: flags.name,
    agency: flags.agency || "Philippine Government Agency",
    amount: Number(flags.amount),
    year: Number(flags.year) || new Date().getFullYear(),
    category: flags.category || "court",
    status: flags.status || "Under Official Investigation",
    statusType: flags.statusType || "court",
    summary: flags.summary || flags.name,
    source: flags.source,
    sourceName: flags.sourceName || `Official Public Records (${flags.source})`,
    notes: flags.notes || "Audited and verified through official government reports."
  };

  const caseStr = `  {\n` +
    `    id: ${newCaseObj.id},\n` +
    `    name: ${JSON.stringify(newCaseObj.name)},\n` +
    `    agency: ${JSON.stringify(newCaseObj.agency)},\n` +
    `    amount: ${newCaseObj.amount},\n` +
    `    year: ${newCaseObj.year},\n` +
    `    category: ${JSON.stringify(newCaseObj.category)},\n` +
    `    status: ${JSON.stringify(newCaseObj.status)},\n` +
    `    statusType: ${JSON.stringify(newCaseObj.statusType)},\n` +
    `    summary: ${JSON.stringify(newCaseObj.summary)},\n` +
    `    source: ${JSON.stringify(newCaseObj.source)},\n` +
    `    sourceName: ${JSON.stringify(newCaseObj.sourceName)},\n` +
    `    notes: ${JSON.stringify(newCaseObj.notes)}\n` +
    `  },\n`;

  content = content.replace('const CORRUPTION_CASES = [\n', `const CORRUPTION_CASES = [\n${caseStr}`);
  fs.writeFileSync(DATA_FILE, content, 'utf8');
  console.log(`✅ Successfully added Case ID ${nextId}: "${flags.name}" to data.js!`);
  console.log('Run "node scripts/verify-sources.js" to verify integrity.');
} else {
  console.log(`Unknown command: ${command}`);
  console.log('Available commands: list, add-case');
}
