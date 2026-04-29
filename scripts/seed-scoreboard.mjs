// Skor tablosuna rastgele Türk koro üyeleri ekler.
// Çalıştırma:  node scripts/seed-scoreboard.mjs
//
// Dağılım:
//   4 Bas       (erkek)
//   4 Tenor     (erkek)
//   9 Alto      (kadın)
//   5 Soprano   (kadın)
//
// Tüm kayıtlar published=true ve eşik (threshold) kriterlerini sağlar
// (minSuccessRate %60, minOctaveWidth 1.0, minSuccessfulNotes 5).

import { addResult, loadAll } from '../server/store.mjs';

// -----------------------------------------------------------------------------
// Nota frekans tablosu (eşit tampere, A4 = 440 Hz)
// -----------------------------------------------------------------------------
const NOTE_BASE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function buildNoteTable() {
  const table = {};
  for (let oct = 1; oct <= 6; oct++) {
    for (let i = 0; i < 12; i++) {
      const name = `${NOTE_BASE[i]}${oct}`;
      const semitonesFromA4 = (oct - 4) * 12 + (i - 9);
      const freq = 440 * Math.pow(2, semitonesFromA4 / 12);
      table[name] = +freq.toFixed(2);
    }
  }
  return table;
}
const NOTE = buildNoteTable();

// İki nota arasındaki yarım ton sayısı (büyük > küçük varsayılır)
function semitonesBetween(low, high) {
  const idx = (n) => {
    const oct = parseInt(n.slice(-1), 10);
    const pc = NOTE_BASE.indexOf(n.slice(0, -1));
    return oct * 12 + pc;
  };
  return idx(high) - idx(low);
}
function notesBetween(low, high) {
  const semis = semitonesBetween(low, high);
  const lowOct = parseInt(low.slice(-1), 10);
  const lowPc = NOTE_BASE.indexOf(low.slice(0, -1));
  const out = [];
  for (let i = 0; i <= semis; i++) {
    const total = lowPc + i;
    const oct = lowOct + Math.floor(total / 12);
    const pc = ((total % 12) + 12) % 12;
    out.push(`${NOTE_BASE[pc]}${oct}`);
  }
  return out;
}

// -----------------------------------------------------------------------------
// Bölüm profilleri
// -----------------------------------------------------------------------------
const SECTIONS = {
  bass:    { lowest: 'E2', highest: 'E4', voiceTypeName: 'Bas',     groups: 'Bas (95%), Bariton (78%), Tenor (40%)', gender: 'male'   },
  tenor:   { lowest: 'C3', highest: 'A4', voiceTypeName: 'Tenor',   groups: 'Tenor (94%), Bariton (70%), Bas (35%)', gender: 'male'   },
  alto:    { lowest: 'F3', highest: 'F5', voiceTypeName: 'Alto',    groups: 'Alto (96%), Mezzo-Soprano (75%), Soprano (40%)', gender: 'female' },
  soprano: { lowest: 'C4', highest: 'C6', voiceTypeName: 'Soprano', groups: 'Soprano (97%), Mezzo-Soprano (72%), Alto (38%)', gender: 'female' },
};

// -----------------------------------------------------------------------------
// İsim havuzları
// -----------------------------------------------------------------------------
const MALE_NAMES = ['Mehmet','Ahmet','Hasan','Mustafa','Ali','Emre','Burak','Cem','Kaan','Tolga','Serkan','Onur','Murat','Kerem','Eren','Berk','Selim','Tarık'];
const FEMALE_NAMES = ['Ayşe','Fatma','Zeynep','Elif','Selin','Merve','Esra','Sibel','Hülya','Aslı','Pınar','Deniz','Begüm','Ece','Gizem','Nehir','Su','Defne','Yağmur','Ceren','Cansu'];
const SURNAMES = ['Yılmaz','Demir','Koç','Aydın','Kara','Şahin','Doğan','Arslan','Öztürk','Kaya','Çelik','Yıldız','Polat','Aksoy','Güneş','Erdoğan','Tunç','Yıldırım','Demirci','Acar','Özkan','Arı','Korkmaz','Tan'];

// -----------------------------------------------------------------------------
// Yardımcılar
// -----------------------------------------------------------------------------
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
function pickUnique(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    out.push(copy.splice(randInt(0, copy.length - 1), 1)[0]);
  }
  return out;
}

function buildAttempt(noteName, isSuccessful, baseTime) {
  const targetFrequency = NOTE[noteName];
  const detectedFrequency = isSuccessful
    ? targetFrequency * Math.pow(2, rand(-25, 25) / 1200) // ±25 cent
    : Math.random() < 0.4 ? null : targetFrequency * Math.pow(2, rand(-180, 180) / 1200);
  const accuracyPercent = isSuccessful ? rand(70, 99) : detectedFrequency == null ? 0 : rand(0, 55);
  const octaveNumber = parseInt(noteName.slice(-1), 10);
  return {
    noteName,
    targetFrequency,
    detectedFrequency: detectedFrequency == null ? null : +detectedFrequency.toFixed(4),
    octaveNumber,
    accuracyPercent: +accuracyPercent.toFixed(2),
    attemptNumber: 1,
    isSuccessful,
    direction: rand(0, 1) < 0.5 ? 'down' : 'up',
    recordedAt: baseTime,
  };
}

function makeMember(section, firstName, lastName) {
  const cfg = SECTIONS[section];
  const allNotes = notesBetween(cfg.lowest, cfg.highest);

  // 8-13 nota deneme, başarı %65-92 arası (her zaman ≥6 başarılı)
  const totalNotesCount = randInt(8, Math.min(13, allNotes.length));
  const sampled = pickUnique(allNotes, totalNotesCount).sort(
    (a, b) => NOTE[a] - NOTE[b]
  );
  const successRate = rand(65, 92);
  const successfulNotesCount = Math.max(6, Math.round(totalNotesCount * (successRate / 100)));
  const successPicked = pickUnique(sampled, successfulNotesCount);
  const successSet = new Set(successPicked);

  const baseTime = Date.now() - randInt(0, 30) * 86400000; // son 30 gün
  const attempts = sampled.map((n) => buildAttempt(n, successSet.has(n), baseTime));

  // Aralık: başarılı denemelerdeki en pes/tiz nota
  const successNotes = attempts.filter((a) => a.isSuccessful).map((a) => a.noteName);
  const lowestNote = successNotes[0] ?? cfg.lowest;
  const highestNote = successNotes[successNotes.length - 1] ?? cfg.highest;
  const minFrequency = NOTE[lowestNote];
  const maxFrequency = NOTE[highestNote];
  const rangeWidthHz = +(maxFrequency - minFrequency).toFixed(2);
  const octaveRangeWidth = +Math.log2(maxFrequency / minFrequency).toFixed(4);

  const realSuccessRate = +(100 * successfulNotesCount / totalNotesCount).toFixed(2);

  // Composite: oktav + doğruluk + nota sayısı karışımı
  const compositeScore = +(
    octaveRangeWidth * 8 +
    (realSuccessRate / 100) * 12 +
    successfulNotesCount * 0.6 +
    rand(-1.5, 1.5)
  ).toFixed(3);

  const avgRms = +rand(0.04, 0.16).toFixed(4);
  const avgPitchStability = +rand(15, 60).toFixed(2);
  const avgVoicedRatio = +rand(0.55, 0.92).toFixed(3);

  return {
    user: {
      firstName,
      lastName,
      gender: cfg.gender,
    },
    result: {
      voiceTypeName: cfg.voiceTypeName,
      voiceTypeMatchPercent: +rand(82, 99).toFixed(2),
      possibleVoiceGroups: cfg.groups,
      minFrequency,
      maxFrequency,
      rangeWidthHz,
      octaveRangeWidth,
      totalNotesCount,
      successfulNotesCount,
      successRate: realSuccessRate,
      lowestNote,
      highestNote,
      compositeScore,
      choirSection: section,
      published: true,
      avgRms,
      avgPitchStability,
      avgVoicedRatio,
      testDate: baseTime,
    },
    attempts,
  };
}

// -----------------------------------------------------------------------------
// Üyeleri üret
// -----------------------------------------------------------------------------
const PLAN = [
  { section: 'bass',    count: 4, namePool: MALE_NAMES   },
  { section: 'tenor',   count: 4, namePool: MALE_NAMES   },
  { section: 'alto',    count: 9, namePool: FEMALE_NAMES },
  { section: 'soprano', count: 5, namePool: FEMALE_NAMES },
];

const usedNames = new Set();
function uniqueName(pool) {
  for (let i = 0; i < 50; i++) {
    const n = `${pick(pool)} ${pick(SURNAMES)}`;
    if (!usedNames.has(n)) {
      usedNames.add(n);
      return n.split(' ');
    }
  }
  return [pick(pool), pick(SURNAMES)];
}

const before = loadAll().length;
let added = 0;

for (const { section, count, namePool } of PLAN) {
  for (let i = 0; i < count; i++) {
    const [firstName, lastName] = uniqueName(namePool);
    const member = makeMember(section, firstName, lastName);
    const rec = addResult(member);
    added++;
    console.log(
      `+ ${section.padEnd(8)} #${rec.id.toString().padStart(3)}  ` +
      `${firstName} ${lastName}  · skor ${member.result.compositeScore.toFixed(1)} · ` +
      `${member.result.lowestNote}-${member.result.highestNote}`
    );
  }
}

const after = loadAll().length;
console.log(`\n✓ ${added} üye eklendi  (önce ${before} → şimdi ${after})`);
