// Türkçe ve yaygın İngilizce küfür/hakaret filtresi
// Liste ihtiyaca göre genişletilebilir.

const BLOCKED_WORDS: string[] = [
  // Türkçe küfür / hakaret (kökler — normalize sonrası eşleşir)
  'amk', 'aq', 'amq', 'amına', 'amina', 'amcık', 'amcik', 'amına koy', 'sikim', 'sikik',
  'sikeyim', 'sikiyim', 'sikerim', 'siktir', 'siktiğim', 'siktigim', 'sikiş', 'sikis',
  'göt', 'got veren', 'göt veren', 'gotlek', 'götlek',
  'orospu', 'oruspu', 'orusbu', 'oç', 'piç', 'pic',
  'yarrak', 'yarak', 'taşak', 'tasak', 'mal', 'salak', 'aptal', 'gerizekalı', 'gerizekali',
  'ibne', 'ipne', 'puşt', 'pust', 'kaltak', 'kahpe',
  'şerefsiz', 'serefsiz', 'namussuz', 'pezevenk', 'kerhane',
  'mq', 'mıq', 'amk', 'awk', 'sg', 'avradını', 'avradini', 'ananı', 'anani',
  'döl', 'dol siktiğim',

  // İngilizce
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'whore', 'slut',
  'motherfucker', 'bastard', 'wanker', 'twat', 'cock',

  // Irkçı/nefret söylemi
  'nigger', 'nigga', 'faggot', 'retard',

  // Hitler / Nazi göndermesi
  'hitler', 'nazi',
];

// Kısa kelimelerde rastgele eşleşmeyi önlemek için sadece kelime sınırı/eşitlik gerektiren liste
const SHORT_STRICT_WORDS = new Set(['oç', 'oc', 'aq', 'mq', 'mq', 'sg', 'oç']);

// Türkçe karakter normalizasyonu
function stripDiacritics(input: string): string {
  return input
    .replace(/ı/g, 'i').replace(/İ/g, 'i')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/Ü/g, 'u')
    .replace(/ş/g, 's').replace(/Ş/g, 's')
    .replace(/ö/g, 'o').replace(/Ö/g, 'o')
    .replace(/ç/g, 'c').replace(/Ç/g, 'c');
}

// Leet/karakter ikamelerini temizle
function deLeet(input: string): string {
  return input
    .replace(/0/g, 'o')
    .replace(/1/g, 'i').replace(/!/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a').replace(/@/g, 'a')
    .replace(/5/g, 's').replace(/\$/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b');
}

// Tekrarlanan harfleri tek harfe indir (siiiktiir → siktir)
function collapseRepeats(input: string): string {
  return input.replace(/(.)\1{1,}/g, '$1');
}

// Boşluk/noktalama karakterlerini sil (a m k → amk)
function stripNonLetters(input: string): string {
  return input.replace(/[^a-z]/g, '');
}

function normalize(raw: string): string {
  let s = raw.toLowerCase();
  s = stripDiacritics(s);
  s = deLeet(s);
  s = stripNonLetters(s);
  s = collapseRepeats(s);
  return s;
}

const NORMALIZED_BLOCKED = BLOCKED_WORDS.map((w) => collapseRepeats(stripNonLetters(deLeet(stripDiacritics(w.toLowerCase())))));
const NORMALIZED_STRICT = new Set(
  [...SHORT_STRICT_WORDS].map((w) => collapseRepeats(stripNonLetters(deLeet(stripDiacritics(w.toLowerCase())))))
);

export function containsProfanity(input: string): boolean {
  if (!input) return false;
  const normalized = normalize(input);
  if (!normalized) return false;

  for (const word of NORMALIZED_BLOCKED) {
    if (!word) continue;
    if (NORMALIZED_STRICT.has(word)) {
      // Kısa kelimeler için tam eşitlik
      if (normalized === word) return true;
    } else if (word.length <= 3) {
      // 3 harfli kelimeler de tam eşit veya hece olarak eşleşmeli
      if (normalized === word) return true;
    } else if (normalized.includes(word)) {
      return true;
    }
  }
  return false;
}

export function validateName(input: string): { ok: true } | { ok: false; reason: string } {
  const trimmed = input.trim();
  if (trimmed.length < 2) return { ok: false, reason: 'En az 2 karakter girmelisin.' };
  if (trimmed.length > 30) return { ok: false, reason: 'En fazla 30 karakter olabilir.' };
  if (!/^[a-zA-ZçğıöşüÇĞİÖŞÜ\s'-]+$/.test(trimmed)) return { ok: false, reason: 'Yalnızca harf kullanabilirsin.' };
  if (containsProfanity(trimmed)) return { ok: false, reason: 'Lütfen uygun bir isim gir.' };
  return { ok: true };
}
