import fs from 'node:fs';
import path from 'node:path';

const inputPath = process.argv[2];
const outputPath = process.argv[3] ?? path.resolve('src/wcg2024WorkIndex.generated.ts');

if (!inputPath) {
  throw new Error('Usage: node scripts/import-wcg-programs.mjs <extracted-text> [output-ts]');
}

const lines = fs.readFileSync(inputPath, 'utf8').replace(/\r/g, '').split('\n');
const choirLineIndices = new Set();

for (let index = 0; index < lines.length; index += 1) {
  if (!/^Conductors?:/.test(lines[index].trim())) continue;
  let previous = index - 1;
  while (previous >= 0 && !lines[previous].trim()) previous -= 1;
  if (previous >= 0) choirLineIndices.add(previous);
}

const records = [];
let competition = '';
let category = '';
let choir = '';
let conductor = '';
let location = '';
let country = '';
let waitingForLocation = false;
let currentWork = null;
let pendingWorkLine = '';

const structural = (line) =>
  !line ||
  line.includes('\f') ||
  /^(The Champions Competition|The Open Competition|Category [A-Z]\d+|Jury:|Qualification|WORLD CHOIR GAMES|COMPETITION PROGRAMS|Open Competition|Champions Competition)/i.test(line) ||
  /^\d{2}\.\d{2}\.\d{4}/.test(line) ||
  /^Conductors?:/.test(line) ||
  /^\d+\s*\)$/.test(line);

for (let index = 0; index < lines.length; index += 1) {
  const line = lines[index].trim();

  if (line === 'The Champions Competition') competition = 'Champions';
  if (line === 'The Open Competition') competition = 'Open';

  const categoryMatch = line.match(/^Category\s+([A-Z]\d+)/);
  if (categoryMatch) category = categoryMatch[1];

  if (choirLineIndices.has(index)) {
    choir = line;
    conductor = '';
    currentWork = null;
    waitingForLocation = false;
    location = '';
    country = '';
    pendingWorkLine = '';
    continue;
  }

  const conductorMatch = line.match(/^Conductors?:\s*(.*)$/);
  if (conductorMatch) {
    conductor = conductorMatch[1].trim();
    waitingForLocation = true;
    currentWork = null;
    pendingWorkLine = '';
    continue;
  }

  const numberedLine = line.match(/^(\d+)\s+(.+)$/);
  if (numberedLine && !/^\d+\s*\)$/.test(line) && choir && category && !line.includes('\f')) {
    currentWork = null;
    pendingWorkLine = line;
  } else if (pendingWorkLine && line && !structural(line)) {
    pendingWorkLine = `${pendingWorkLine} ${line}`.replace(/\s+/g, ' ').trim();
  }

  const workMatch = pendingWorkLine.match(/^(\d+)\s+(.+?):\s*(.+)$/);
  if (workMatch && choir && category) {
    waitingForLocation = false;
    currentWork = {
      id: `wcg24-${String(records.length + 1).padStart(4, '0')}`,
      festival: 'World Choir Games',
      year: 2024,
      competition,
      category,
      choir,
      conductor,
      location,
      country,
      order: Number(workMatch[1]),
      composer: workMatch[2].replace(/\s+/g, ' ').trim(),
      title: workMatch[3].replace(/\s+/g, ' ').trim(),
      source: 'https://www.interkultur.com/fileadmin/INTERKULTUR/Events/2024/Auckland/Information/CompetitionPrograms-WCG2024.pdf',
    };
    records.push(currentWork);
    pendingWorkLine = '';
    continue;
  }

  if (numberedLine && pendingWorkLine) continue;

  if (waitingForLocation && line && !/^\d+\s*\)$/.test(line) && !line.includes('\f')) {
    location = line.replace(/\s+/g, ' ').trim();
    const locationParts = location.split(',').map((part) => part.trim()).filter(Boolean);
    country = locationParts.at(-1) ?? location;
    waitingForLocation = false;
    continue;
  }

  if (currentWork && !structural(line) && !choirLineIndices.has(index)) {
    currentWork.title = `${currentWork.title} ${line}`.replace(/\s+/g, ' ').trim();
  }

  if (!line || line.includes('\f')) {
    currentWork = null;
    pendingWorkLine = '';
  }
}

if (records.length < 1000) {
  throw new Error(`Expected at least 1000 works, parsed ${records.length}`);
}

const missing = records.filter((record) => !record.choir || !record.category || !record.composer || !record.title);
if (missing.length) {
  throw new Error(`Parsed ${missing.length} incomplete records`);
}

const header = `// Generated from the official World Choir Games Auckland 2024 competition-program PDF.\n// Do not edit by hand; regenerate with scripts/import-wcg-programs.mjs.\n\n`;
const type = `export type WcgWorkRecord = {\n  id: string;\n  festival: string;\n  year: number;\n  competition: string;\n  category: string;\n  choir: string;\n  conductor: string;\n  location: string;\n  country: string;\n  order: number;\n  composer: string;\n  title: string;\n  source: string;\n};\n\n`;
const body = `export const wcg2024WorkIndex: WcgWorkRecord[] = ${JSON.stringify(records, null, 2)};\n`;

fs.writeFileSync(outputPath, header + type + body, 'utf8');
console.log(JSON.stringify({ records: records.length, choirs: new Set(records.map((item) => item.choir)).size, categories: new Set(records.map((item) => item.category)).size, outputPath }));
