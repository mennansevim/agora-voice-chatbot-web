export type FestivalRecord = {
  name: string;
  country: string;
  region: 'Balkanlar' | 'Avrupa' | 'Asya-Pasifik' | 'Amerika';
  year: string;
  scale: string;
  winner: string;
  signal: string;
  fit: number;
  evidence: 'Tam sonuç' | 'Program + sonuç' | 'Arşiv kaydı';
  source: string;
};

export const festivals: FestivalRecord[] = [
  { name: 'Ohrid Choir Festival', country: 'Kuzey Makedonya', region: 'Balkanlar', year: '2016–2026', scale: '2026 GP + 95,33 en yüksek puan', winner: '2026 · Grand Prix: Gaudeamus, Polonya', signal: 'Balkan eseri + kutsal/klasik omurga + etkili final', fit: 94, evidence: 'Program + sonuç', source: 'https://ohridchoirfestival.com/' },
  { name: 'World Choir Games', country: 'Yeni Zelanda', region: 'Asya-Pasifik', year: '2024', scale: '250 koro · 42 ülke', winner: '97,88 · University of Oregon Chamber Choirs', signal: 'Kategoriye özgü teknik çeşitlilik ve çağdaş iddia', fit: 88, evidence: 'Program + sonuç', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Cork International Choral Festival', country: 'İrlanda', region: 'Avrupa', year: '2024', scale: 'Fleischmann Trophy · tam puanlar', winner: '94,33 · Brigham Young University Singers', signal: 'Program hayal gücü, esere özgü yorum ve bütünlük', fit: 86, evidence: 'Tam sonuç', source: 'https://www.corkchoral.ie/2024/05/2024-competition-results/' },
  { name: 'Tolosa Choral Contest', country: 'İspanya', region: 'Avrupa', year: '2024', scale: '55. yarışma · jüri/korolar açık', winner: '95,20 · Riga Cathedral Choir School', signal: 'Baskça eser yorumu, dönem stili ve teknik rafinman', fit: 84, evidence: 'Program + sonuç', source: 'https://www.cittolosa.com/en/choral-contest-2/choral-contest-2024/' },
  { name: 'Guido d’Arezzo Polyphonic Competition', country: 'İtalya', region: 'Avrupa', year: '2016–2025', scale: 'European Grand Prix ağı', winner: 'Yıllık kategori ve GP sonuçları', signal: 'Çok dönemli program, polifonik şeffaflık, zorunlu eser', fit: 79, evidence: 'Arşiv kaydı', source: 'https://www.polifonico.org/polifonico-internazionale/' },
  { name: 'Marktoberdorf Chamber Choir Competition', country: 'Almanya', region: 'Avrupa', year: '2023', scale: '12 topluluk · 9 ülke', winner: 'İki kategori · 7 kişilik jüri', signal: 'Oda korosu hassasiyeti, üslup ve program mimarisi', fit: 77, evidence: 'Tam sonuç', source: 'https://www.kammerchorwettbewerb.org/de/r%C3%BCckblick-2023' },
  { name: 'Prof. Georgi Dimitrov – Varna', country: 'Bulgaristan', region: 'Balkanlar', year: '2024', scale: '8 seçkin koro · EGP ağı', winner: 'Avrupa/Asya’dan davetli topluluklar', signal: 'Üst düzey polifoni ve Avrupa Grand Prix standardı', fit: 81, evidence: 'Arşiv kaydı', source: 'https://www.egpchoral.com/about-us/varna/' },
  { name: 'Tallinn International Choir Festival', country: 'Estonya', region: 'Avrupa', year: '2023', scale: 'Kategori puanları ve cezalar açık', winner: 'Sibelius Upper Secondary Chamber Choir', signal: 'Zorunlu eser, çağdaş dil, süre disiplinine sıfır tolerans', fit: 80, evidence: 'Tam sonuç', source: 'https://kooriyhing.ee/en/the-results-of-the-17th-international-choir-festival-tallinn-2023/' },
  { name: 'Tampere Vocal Music Festival', country: 'Finlandiya', region: 'Avrupa', year: '2025', scale: '55 koro · 6 ülke', winner: 'Grand Prix · Juventus, Letonya', signal: 'Değer temelli şarkı söyleme ve yapıcı jüri geri bildirimi', fit: 82, evidence: 'Tam sonuç', source: 'https://www.tamperevocal.fi/en/news/tampere-vocal-music-festival-champions-value-based-singing/' },
  { name: 'Seghizzi Choral Competition', country: 'İtalya', region: 'Avrupa', year: '2024', scale: '61. yarışma · 20 dk kategoriler', winner: 'Kategori/çağdaş repertuvar ödülleri', signal: 'Çağdaş zorunlu eser ve bireysel jüri puanlaması', fit: 76, evidence: 'Program + sonuç', source: 'https://www.seghizzi.it/' },
  { name: 'International Choral Competition Spittal', country: 'Avusturya', region: 'Avrupa', year: '2025', scale: '300 korist · 7 ülke', winner: 'Maranatha, Consonus, Coro Encanto', signal: 'Sanat şarkısı ile folklorun ayrı renklerini göstermek', fit: 83, evidence: 'Tam sonuç', source: 'https://www.spittal-drau.at/presse/pressemeldungen/detailansicht/59-internationaler-chorwettbewerb-stimmen-der-welt-vereint-in-spittal' },
  { name: 'European Choir Games', country: 'İsveç', region: 'Avrupa', year: '2023', scale: '60 koro · 19 ülke', winner: 'Grand Prix Adult · Volve Vokal, Norveç', signal: 'Açık/Şampiyonlar/GP katmanlarında doğru kategori seçimi', fit: 85, evidence: 'Program + sonuç', source: 'https://www.interkultur.com/events/european-choir-games/norrkoeping-2023/' },
  { name: 'Sing for Gold', country: 'İspanya', region: 'Avrupa', year: '2024', scale: '52 koro · 34 ülke', winner: 'Vocal Ensemble Fortissimo, Bulgaristan', signal: 'Sekiz finalistli doğrudan karşılaştırmada sahne etkisi', fit: 84, evidence: 'Program + sonuç', source: 'https://www.interkultur.com/events/2024/calella/' },
  { name: 'Kalamata International Choir Competition', country: 'Yunanistan', region: 'Balkanlar', year: '2024', scale: '26 koro · 14 ülke', winner: 'Akademisk Kor Århus, Danimarka', signal: 'Kutsal, karma ve folklor kategorilerinde net stil ayrımı', fit: 91, evidence: 'Program + sonuç', source: 'https://www.interkultur.com/events/2024/kalamata/' },
  { name: 'Bad Ischl International Choir Competition', country: 'Avusturya', region: 'Avrupa', year: '2024', scale: '25 koro · 14 ülke', winner: 'Grand Prize · Bohemiachor', signal: 'GP’de iki yeni a cappella eser, toplam en fazla 8 dakika', fit: 80, evidence: 'Program + sonuç', source: 'https://www.interkultur.com/events/2024/bad-ischl' },
  { name: 'Wernigerode International Choir Competition', country: 'Almanya', region: 'Avrupa', year: '2023', scale: '26 madalya · anlık pedagojik görüşme', winner: 'Vox pUNT, Estonya', signal: 'Üç seçilmiş eser ve performans sonrası pedagojik geri bildirim', fit: 78, evidence: 'Program + sonuç', source: 'https://www.interkultur.com/events/2023/wernigerode' },
  { name: 'Riga Sings', country: 'Letonya', region: 'Avrupa', year: '2019', scale: '31 koro · 11 ülke', winner: 'Seisen High School Choir, Japonya', signal: 'Kutsal ve folklor kategorileri; ulusal renk', fit: 78, evidence: 'Program + sonuç', source: 'https://www.interkultur.com/pressroom/details/news/winners-of-the-premiere-event-of-riga-sings' },
  { name: 'Vietnam International Choir Competition', country: 'Vietnam', region: 'Asya-Pasifik', year: '2023', scale: '18 koro · 7 ülke', winner: 'Cantica Collegium Musicum, Slovakya', signal: 'Bölgesel kimlik, sahne enerjisi ve kategori stratejisi', fit: 83, evidence: 'Tam sonuç', source: 'https://www.interkultur.com/pressroom/details/news/cantica-collegium-musicum-wins-the-hoi-an-choir-prize-2023' },
  { name: 'Busan Choral Festival & Competition', country: 'Güney Kore', region: 'Asya-Pasifik', year: '2024', scale: 'Kategori ödülleri açık', winner: 'Grand Prix · MASKA, Letonya', signal: '10–15 dk, en az bir a cappella; etnikte ülke geleneği', fit: 82, evidence: 'Tam sonuç', source: 'https://www.busanchoral.org/eng/archive/2024bcfc_awards' },
  { name: 'Tokyo International Choir Competition', country: 'Japonya', region: 'Asya-Pasifik', year: '2018–2025', scale: '7 jüri · TES/AIS sistemi', winner: 'Kategori ve GP puanları açık', signal: 'Entonasyon, ritim, sadakat/zorluk, blend + program sanatı', fit: 87, evidence: 'Program + sonuç', source: 'https://www.ticctokyo.icot.or.jp/regulations' },
  { name: 'Singapore International Choral Festival', country: 'Singapur', region: 'Asya-Pasifik', year: '2024', scale: 'Tam kategori puanları açık', winner: '90,10 · Padjadjaran University Choir', signal: 'Karma ve folklor kategorilerinde yüksek teknik eşik', fit: 84, evidence: 'Tam sonuç', source: 'https://sicf.sg/wp/wp-content/uploads/2024/11/SICF-2024-Results.pdf' },
  { name: 'Bali International Choir Festival', country: 'Endonezya', region: 'Asya-Pasifik', year: '2024', scale: '13. festival · sonuç arşivi', winner: 'Kategori, şampiyona ve GP yapısı', signal: 'Güneydoğu Asya repertuvar rengi ve koreografik bütünlük', fit: 80, evidence: 'Arşiv kaydı', source: 'https://bandungchoral.com/bicf13' },
  { name: 'Kathaumixw International Choral Festival', country: 'Kanada', region: 'Amerika', year: '2018–2023', scale: 'Koro ve jüri profili arşivi', winner: '2023 Choir of the World · Saskatoon Children’s Choir', signal: 'Kültürlerarası repertuvar ve uzun festival rezidansı', fit: 75, evidence: 'Arşiv kaydı', source: 'https://kathaumixw.org/past.shtml' },
  { name: 'Sing’n’Joy Princeton', country: 'ABD', region: 'Amerika', year: '2019', scale: '12 koro · 3 ülke', winner: 'INTERKULTUR sonuç/program arşivi', signal: 'ABD kolej korosu standardı ve kategori odaklı program', fit: 73, evidence: 'Program + sonuç', source: 'https://www.interkultur.com/de/ergebnisse/' },
  { name: 'Golden State Choral Trophy Monterey', country: 'ABD', region: 'Amerika', year: '2016', scale: '17 koro · 5 ülke', winner: 'INTERKULTUR sonuç/program arşivi', signal: 'Karma koro ve çağdaş a cappella rekabeti', fit: 72, evidence: 'Program + sonuç', source: 'https://www.interkultur.com/de/ergebnisse/' },
];

export const agoraRepertoire = [
  { title: 'Pirlere Niyaz Ederiz', composer: 'Düzenleme: Rıza Atçeken', duration: '2:45', role: 'Anadolu niyazı', fit: 94, energy: 62, color: '#b8f2d1', risk: 'Modal renk, ostinato katmanları ve metin birlikteliği', prescription: 'Ostinato grubunu metin grubundan ayır; ünlü sürelerini işaretleyip tek nefeste cümle sınaması yap.', scores: [86, 88, 94, 91, 90] },
  { title: 'İzmir’in Kavakları', composer: 'Düzenleme: Rıza Atçeken', duration: '2:45', role: 'İzmir kimliği', fit: 92, energy: 78, color: '#f4cf79', risk: 'Aynı aranjörün önceki eserinden farklı tını üretmek', prescription: 'Pirlere ile aynı provada arka arkaya söyle; vibrato, konsonant ve tempo karakterini bilinçli karşılaştır.', scores: [84, 90, 96, 93, 88] },
];

export type JuryScore = {
  name: string;
  scores: [number, number, number, number, number, number, number];
  comment: string;
  note: string;
};

export type OhridCompetitor = {
  choir: string;
  country: string;
  conductor: string;
  result: string;
  score?: string;
  verified: boolean;
  source?: string;
  programs: { category: string; works: string[] }[];
};

export const ohrid2026Participation = {
  festival: 'Ohrid Choir Festival',
  city: 'Ohrid, Kuzey Makedonya',
  dates: '27–31 Ağustos 2026',
  category: 'C · Yetişkin koroları',
  choir: 'Agora Voice',
  country: 'Türkiye',
  conductor: 'Özlem Varışlı Atçeken',
  score: 85.67,
  prize: 'II. Ödül',
  specialAward: 'En İyi Sahne Performansı Özel Diploması',
  scoreLabels: ['Entonasyon temizliği', 'Ritim', 'Diksiyon', 'Üslup yorumu', 'Şeflik', 'Sahne performansı', 'Bütüncül sanatsal izlenim'],
  scoreAverages: [87, 85.33, 85.67, 83.33, 91, 90.67, 85.67],
  juries: [
    {
      name: 'Dunja Deurić Kartalović',
      scores: [86, 86, 85, 81, 92, 87, 86],
      comment: 'Daha zorlayıcı bir program ve özgün bir a cappella koro eseri öneriyor; sahne hareketinin daha ileri taşınabileceğini, enerjinin ise korunması gerektiğini belirtiyor.',
      note: 'İngilizce el yazısından tematik çözümleme',
    },
    {
      name: 'Zapro Zaprov',
      scores: [89, 85, 87, 88, 95, 95, 86],
      comment: 'Repertuvarın yarışmaya daha uygun ve iddialı seçilmesi gerektiğini vurguluyor; şeflik ve sahne sunumunu çok güçlü buluyor. Notta “mükemmel sahne performansı” ifadesi açıkça yer alıyor.',
      note: 'Makedonca el yazısından tematik çeviri; okunamayan bölümler yorumlanmadı',
    },
    {
      name: 'Boris Nykl',
      scores: [86, 85, 85, 81, 86, 90, 85],
      comment: 'Atmosferi, dinamikleri ve koro potansiyelini olumlu buluyor; repertuvarı biraz kolay değerlendiriyor. Müzikal cümlelerin daha doğal akmasını, bazı yerlerde alkış/ritmik jest yoğunluğunun azaltılmasını ve şefin koristlere daha fazla güvenmesini öneriyor.',
      note: 'İngilizce el yazısından tematik çözümleme',
    },
  ] as JuryScore[],
  programs: [
    {
      category: 'Yarışma',
      works: [
        'Signore delle cime — Giuseppe de Marzi',
        'Quizás, Quizás, Quizás — Osvaldo Farrés · arr. José L. Blasco Díez',
        'Pirlere Niyaz Ederiz — arr. Rıza Atçeken',
        'Pošla moma na voda — arr. Dragan Šuplevski',
        'Let It Be — Lennon–McCartney · arr. José L. Blasco Díez',
        'Siyahamba — Geleneksel Güney Afrika şarkısı',
      ],
    },
    {
      category: 'Halk müziği',
      works: [
        'Pirlere Niyaz Ederiz — arr. Rıza Atçeken',
        'İzmir’in Kavakları — arr. Rıza Atçeken',
        'Siyahamba — Geleneksel Güney Afrika şarkısı',
      ],
    },
  ],
};

export const ohrid2026Competitors: OhridCompetitor[] = [
  {
    choir: 'Gaudeamus Choir of the Nysa Cultural Centre', country: 'Polonya', conductor: 'Izabela Gach-Kaszuba',
    result: 'Grand Prix', verified: true,
    source: 'https://www.nysahot.pl/artykul/9394,wielki-sukces-choru-gaudeamus-grand-prix-na-miedzynarodowym-festiwalu-w-macedonii',
    programs: [{ category: 'Yarışma', works: ['Meri Tomćo — Geleneksel Makedon', 'Laudate Dominum — Anna Rocławska-Musiałczyk', 'Omnes gentes plaudite manibus — Marek Raczyński', 'Ederlezi — Balkan Roman şarkısı · arr. Dominik Lasota', 'We Will Rock You — Brian May · arr. Mark Brymer'] }],
  },
  {
    choir: 'Collegium Medicum Choir', country: 'Polonya', conductor: 'Adam Kujawski',
    result: 'I. Ödül · yarışmanın en yüksek puanı · 2 özel ödül', score: '95,33', verified: true,
    source: 'https://takajestbydgoszcz.pl/artykul/chor-cm-umk-z-bydgoszczy-n2473885',
    programs: [
      { category: 'Yarışma', works: ['Izhe Heruvimi / Jako da Carja — Atanas Badev', 'W lesie (In the Forest) — Zygmunt Noskowski', 'I denna ljuva sommartid — Bengt Ollén', 'Makedonsko oro — Todor Skalovski'] },
      { category: 'Kutsal', works: ['Miserere — Henryk Mikołaj Górecki', 'Intonent hodie / Adoramus te Domine — Jacek Sykulski'] },
    ],
  },
  {
    choir: 'A Capella Gramofon', country: 'Türkiye', conductor: 'Türker Barmanbek',
    result: 'I. Ödül · Foveamus Pacem özel diploması', score: '90,00', verified: true,
    source: 'https://halktv.com.tr/tanitim-bulteni/turker-barmanbekin-yonetimindeki-korolar-ohridde-birinci-ve-ucuncu-oldu-1053829h',
    programs: [],
  },
  {
    choir: 'Agora Voice', country: 'Türkiye', conductor: 'Özlem Varışlı Atçeken',
    result: 'II. Ödül · En İyi Sahne Performansı', score: '85,67', verified: true,
    programs: ohrid2026Participation.programs,
  },
  {
    choir: 'Pop Akustik', country: 'Türkiye', conductor: 'Türker Barmanbek',
    result: 'III. Ödül · sahne performansı özel diploması', score: '76,33', verified: true,
    source: 'https://halktv.com.tr/tanitim-bulteni/turker-barmanbekin-yonetimindeki-korolar-ohridde-birinci-ve-ucuncu-oldu-1053829h',
    programs: [],
  },
  {
    choir: 'Sunnmøre Festivalkor', country: 'Norveç', conductor: 'Sølvi Myklebust', result: 'Sonuç kamu kaynağında bulunamadı', verified: false,
    programs: [
      { category: 'Kutsal', works: ['I Need Thee Every Hour — A. S. Hawks & R. Lowery · arr. G. W. Matthews', 'Hear My Prayer — Moses Hogan', 'Agnus Dei with “How Great Thou Art” — Michael W. Smith · arr. Joel Raney', 'So, ro godt barn — Norveç ninnisi · arr. Anders Öhrwall'] },
      { category: 'Halk müziği', works: ['So, ro godt barn — arr. Anders Öhrwall', 'Bruremarsj fra Lødigen — Halvdan Sivertsen', 'Norwegian Wedding March — arr. Erlend Fagertun', 'Småvinir fagir — Jón Nordal / Jónas Hallgrímsson'] },
    ],
  },
  {
    choir: 'Vokalna Grupa Smirna', country: 'Kuzey Makedonya', conductor: 'Žaneta Divjakovska Doneva', result: 'Sonuç kamu kaynağında bulunamadı', verified: false,
    programs: [{ category: 'Kutsal', works: ['Gospodi Vozvah — Bizans ilahisi', 'K Bogorodice prilezno — Aleksandar Arhangelski', 'Oko serdca — Fr. Nikolaj Dazgic'] }],
  },
  {
    choir: 'Atonalia Mixed Choir', country: 'Türkiye', conductor: 'Halil İbrahim Aydın', result: 'Sonuç kamu kaynağında bulunamadı', verified: false,
    programs: [{ category: 'Yarışma', works: ['Yal Asmar Ellon (The Brunette One) — Edward Torikian', 'Mari Mome, Crnooko — Dobri Hristov', 'Tek Kapıdan — Atilla Çağdaş Değer', 'Rum Dum Dum — Dragan Šuplevski', 'Ayvanın İrisine — Erdal Tuğcular'] }],
  },
  {
    choir: 'İnci Yaman Turkish Music Ensemble', country: 'Türkiye', conductor: 'İnci Yaman', result: 'Sonuç kamu kaynağında bulunamadı', verified: false,
    programs: [{ category: 'Halk müziği', works: ['Gül yüzünde göreli zülf-i semen-sây gönül — Münir Nurettin Selçuk', 'Biljana Platno Beleše — Geleneksel Makedon halk şarkısı'] }],
  },
  {
    choir: 'Corul Mixt “Nașterea Domnului”', country: 'Romanya', conductor: 'Ovidiu-Valentin Căpitan', result: 'Sonuç kamu kaynağında bulunamadı', verified: false,
    programs: [
      { category: 'Halk müziği', works: ['Cât îi Țara Crișului — Ion Șerfezi', 'Ce s-ar face inima — arr. Răzvan Rădos', 'Cântec și joc din Maramureș — Dan Mihai Goia'] },
      { category: 'Kutsal', works: ['Fie Doamne, mila Ta spre noi — Gheorghe Danga', 'Heruvic – podobie glas 1 — Mircea Buta', 'Alleluia — Gordon Young'] },
    ],
  },
  {
    choir: 'Koro 213', country: 'Türkiye', conductor: 'Serhat Karşı', result: 'Sonuç kamu kaynağında bulunamadı', verified: false,
    programs: [
      { category: 'Yarışma', works: ['Üç Kız Bir Ana — Kerem İnak', 'Eylül Sonu — İlhan Baran', 'Nerea Izango Zen — Javier Busto', 'Autumn Leaves — Ryan O’Connell'] },
      { category: 'Kutsal', works: ['Dies Irae — Michael John Trotta', 'Aşkın Aldı — Ahmed Adnan Saygun', 'Eski Üslupta Kantat No. 4: Tanrım — Ahmed Adnan Saygun'] },
      { category: 'Pop', works: ['Mutlu Yıllar — Serhat Karşı', 'Autumn Leaves — Ryan O’Connell', 'Engel — Oliver Gies'] },
    ],
  },
];

export const ohridPrograms = [
  { year: 2026, choir: 'Gaudeamus Choir of the Nysa Cultural Centre', country: 'Polonya', works: ['Meri Tomćo — Geleneksel Makedon', 'Laudate Dominum — Anna Rocławska-Musiałczyk', 'Omnes gentes plaudite manibus — Marek Raczyński', 'Ederlezi — arr. Dominik Lasota', 'We Will Rock You — arr. Mark Brymer'] },
  { year: 2025, choir: 'NFM Girls’ Choir', country: 'Polonya', works: ['Ta wodzicka czysta — Irena Pfeiffer', 'Ptasie plotki — Henryk M. Górecki', 'Alleluja — Zapro Zaprov', 'Z tamtej strony jeziora — arr. Małgorzata Podzielny', 'Hail Holy Queen — arr. Marc Shaiman', 'Przybieżeli do Betlejem — arr. Olek Miśkiewicz'] },
  { year: 2024, choir: 'Anima Mea', country: 'Letonya', works: ['Lay a Garland — Robert Pearsall', 'Makedonsko Oro — Todor Skalovski', 'Father Thunder — Laura Jēkabsone', 'Fair Phyllis — John Farmer', 'Kalējs kala debesīs — Selga Mence', 'Es guļu, guļu — Ārijs Šķepasts'] },
  { year: 2023, choir: 'Canto Náchod', country: 'Çekya', works: ['Dafino Vino — Dragan Šuplevski', 'Ave Maria — Kimber Bex', 'Kyrie — Piotr Jańczak', 'Alma Cortés y Bella — Giovanni Gabrieli', 'Baba Yetu — Christopher Tin', 'Věneček — Zdeněk Lukáš'] },
  { year: 2022, choir: 'Interschool Choir Capricolium', country: 'Polonya', works: ['Za naszą stodołą — Volodymyr Zubyrsky', 'Don’t Worry Be Happy — arr. Marcin Wawruk', 'Ave Regina Caelorum — Marek Raczyński', 'Con el Vito — Jacek Sykulski', 'Makedonsko Oro — Todor Skalovski'] },
  { year: 2019, choir: 'Boğaziçi Gençlik Korosu', country: 'Türkiye', works: ['Pseudo-Yoik — Jaakko Mäntyjärvi', 'Yeniden — Hasan Uçarsu', 'Do Tri Momi — Dragan Šuplevski', 'Kasar Mie La Gaji — Alberto Grau', 'Nyon Nyon — Jake Runestad'] },
  { year: 2018, choir: 'Bodra Pessen', country: 'Bulgaristan', works: ['Gloria, Missa Brevis in D — Benjamin Britten', 'Otche Nash — Stoyan Babekov', 'Urok po Gadulka — Nikolay Stoykov', 'Machki i Znachki — Zapro Zaprov', 'Polegnala e Todora — arr. Philip Koutev', 'Baba Yaga — Milko Kolarov'] },
  { year: 2017, choir: 'Feliks Nowowiejski Academy Chamber Choir', country: 'Polonya', works: ['Syaniem — Tomislav Zografski', 'Hear My Prayer — Henry Purcell', 'Ave Maris Stella — Trond Kverno', 'Mystery of Faith — Szymon Godziemba-Trytek', 'Makedonska Humoreska — Todor Skalovski'] },
  { year: 2016, choir: 'Vila', country: 'Bosna-Hersek', works: ['IX Rukovet — Stevan Mokranjac', 'Bogoroditse Devo — Sergei Rachmaninoff', 'Bésame Mucho — arr. José Galván', 'Aliluja — Zapro Zaprov', 'Golema Č’čkalica — Dragana Veličković'] },
  { year: 2015, choir: 'Canto Youth Choir', country: 'Polonya', works: ['Kryste, Dniu Naszej Światłości — Wacław z Szamotuł', 'De Profundis — Marcin Łukaszewski', 'Zómci na Lodze — arr. Roman Illa Drozd', 'Makedonsko Oro — Todor Skalovski', 'Bésame Mucho — Consuelo Velázquez; arr. José Galván'] },
  { year: 2014, choir: 'Medici Cantantes', country: 'Polonya', works: ['Exultate Justi — Lodovico Viadana', 'Gloria — Alessandro Kirschner', 'Makedonsko Oro — Todor Skalovski', 'Sobótkowa Śpiewka V — Kazimierz Serocki', 'O Sifuni Mungu — arr. Roger Emerson'] },
  { year: 2013, choir: 'Gdańsk University Choir', country: 'Polonya', works: ['Exultate Iusti — Andreas Hakenberger', 'Ave Maris Stella — Trond Kverno', 'Vodi, Vodi — Tomislav Zografski', 'Music Fa-Re-Mi-Do-Si — Andrzej Koszewski'] },
  { year: 2012, choir: 'Nadzieja Chamber Choir', country: 'Polonya', works: ['Etude Op. 25 No. 12 — Fryderyk Chopin; arr. Bohdan Riemer', 'Zombie — The Cranberries; arr. Michał Gacka', 'Makedonska Humoreska — Todor Skalovski', 'Libertatum — Jim Papoulis'] },
  { year: 2011, choir: 'Skowronki Girls Choir', country: 'Polonya', works: ['Hegyi Éjszakák — Zoltán Kodály', 'Što Mi e Milo — Geleneksel Makedon', 'Słoneczko Już Zaszło — Ludwik Rok', 'Mister Sandman — Pat Ballard; arr. Ed Lojeski', 'La Petite Fille Sage — Francis Poulenc', 'Le Hérisson — Francis Poulenc'] },
  { year: 2010, choir: 'Sound Choir', country: 'Romanya', works: ['Choral Medley from Oaș Country — Darius Pop', 'Ave Maria — Javier Busto', 'Do Tri Momi — Dragan Šuplevski', 'Camomile and Fine Lads / The Wassailers — Sabin Păutza', 'Other Variations on Chindia Dance Theme — Alexandru Pașcanu'] },
  { year: 2009, choir: 'Grudnove Šmikle', country: 'Slovenya', works: ['Now I’ll Lead My Herds to Pasture — Ambrož Čopi', 'Sing Together, Children — I. G. Carniolus', 'The Aquarian — Robert Schumann', 'The Winter — Lojze Lebič', 'Landscape — Mihajlo Nikolovski', 'The Honey Flower — Alberto Grau'] },
  { year: 2008, choir: 'Gdańsk Medical University Choir', country: 'Polonya', works: ['Psalm 150 — Marek Jasiński', 'Hold On! — arr. Moses Hogan', 'Trzy Baby — Juliusz Łuciuk'] },
];

export const worldPrograms = [
  { festival: 'World Choir Games', year: 2024, category: 'Champions', choir: 'University of Oregon Chamber Choirs', country: 'ABD', score: '97,88', works: ['Earth Song — Frank Ticheli', 'Fire — Katerina Gimon', 'If I Were a Swan — Kevin Puts', 'La muerte sonriente — Diana Syrse'] },
  { festival: 'World Choir Games', year: 2024, category: 'Champions', choir: 'Delaware Choral Scholars', country: 'ABD', score: '97,63', works: ['I Sing the Body Electric — Marques L. A. Garrett/Hudson', 'Māte Saule — Pēteris Vasks', 'White Stones — Melissa Dunphy/LaVoy', 'Tuttarana — Reena Esmail'] },
  { festival: 'World Choir Games', year: 2024, category: 'Champions', choir: 'Quezon City Concert Chorus', country: 'Filipinler', score: '93,00', works: ['Rytmus — Ivan Hrušovský', 'Tinig Ng Lupa — Ruben Federizon', 'O Jesu Christe — Jachet de Mantua', 'Māte saule — Pēteris Vasks'] },
  { festival: 'World Choir Games', year: 2024, category: 'Champions', choir: 'Newcastle Chamber Choir', country: 'Avustralya', score: '92,75', works: ['Three Australian Bush Songs — Iain Grandage', 'Jubilate Deo — Ivo Antognini', 'Geography III — Paul Stanhope', 'Wayfarer — Michael Lambert'] },
  { festival: 'World Choir Games', year: 2024, category: 'Champions', choir: 'St Paul’s Co-educational College Treble Choir', country: 'Hong Kong', score: '94,75', works: ['No Place in Our World', 'I Believe', 'Gloria in excelsis — Ivo Antognini', 'Japanese Game — Ko Matsushita'] },
  { festival: 'World Choir Games', year: 2024, category: 'Champions', choir: 'Nagaland Madrigal Singers', country: 'Hindistan', score: '86,75', works: ['Tiqhe Tini Le — Hito Kiho', 'Leron Leron Sinta — arr. Saunder Choi', 'Gloria Patri — Budi Susanto Yohanes', 'Kalējs kala debesīs — Selga Mence'] },
  { festival: 'World Choir Games', year: 2024, category: 'Champions', choir: 'Delaware Choral Scholars', country: 'ABD', score: '90,88', works: ['Lähtö — Einojuhani Rautavaara', 'An die Heimat — Johannes Brahms', 'Now Sleeps the Crimson Petal — Paul Mealor', 'Leonardo Dreams of His Flying Machine — Eric Whitacre'] },
  { festival: 'World Choir Games', year: 2024, category: 'Champions', choir: 'Nankai University Student Choir', country: 'Çin', score: '90,38', works: ['Autumn — Timothy Shank', 'Ķekatu Dziesma — Pēteris Vasks', 'Flowing Stream — arr. Xiaogeng Liu', 'From Snow Area of Prayer — Lin Gan'] },
];

export const internationalPrograms = [
  { festival: 'Sing for Gold', year: 2024, category: 'Gençlik Koroları', choir: 'Vocal Ensemble Fortissimo', country: 'Bulgaristan', works: ['Bulgarian Folklore Medley — Krasimir Kyurkchiyski', 'Lasciatemi morire — Claudio Monteverdi', 'Nazad, nazad, mome Kalino — Petar Aleksiev', 'Singing With a Swing — George Gershwin / Louis Prima'] },
  { festival: 'Sing for Gold', year: 2024, category: 'Gençlik Koroları', choir: 'Estonian National Girls’ Choir Leelo', country: 'Estonya', works: ['Heliseb väljadel — Urmas Sisask', 'Arm ja surm — Tõnu Kõrvits', 'Butterfly — Mia Makaroff', 'Fire — Katerina Gimon'] },
  { festival: 'Sing for Gold', year: 2024, category: 'Oda Korosu / Vokal Ansambl', choir: 'Southern Spirit Singers', country: 'Birleşik Krallık', works: ['My Spirit Sang All Day — Gerald Finzi', 'Winds — Mia Makaroff', 'Sleep — Eric Whitacre', 'Twa tanbou — Sydney Guillaume'] },
  { festival: 'Sing for Gold', year: 2024, category: 'Oda Korosu / Vokal Ansambl', choir: 'Coro Municipal de Cancún', country: 'Meksika', works: ['Pasar la vida — Jorge Cózatl', 'Io mi son giovinetta — Claudio Monteverdi', 'Abendlied — Josef Gabriel Rheinberger', 'El guayaboso — Guido López-Gavilán'] },
  { festival: 'Sing for Gold', year: 2024, category: 'Kutsal Müzik', choir: 'Amicitia Ensemble Coral', country: 'Meksika', works: ['The Deer’s Cry — Arvo Pärt', 'Abendlied — Josef Gabriel Rheinberger', 'Dixit Dominus — Francisco López Capillas', 'Cantate Domino — Claudio Monteverdi'] },
  { festival: 'Sing for Gold', year: 2024, category: 'Kutsal Müzik', choir: 'Estudio Coral Armentum', country: 'Kosta Rika', works: ['O lux beata Trinitas — Andrej Makor', 'Richte mich, Gott — Felix Mendelssohn', 'Libera me — Anthony Sylvestre', 'Baba Yetu — Christopher Tin; arr. Albin Delgado'] },
  { festival: 'Sing for Gold', year: 2024, category: 'Pop / Caz / Gospel', choir: 'Cake O’Phonie', country: 'İsviçre', works: ['Je suis ton meilleur ami — Alan Menken; arr. Deke Sharon', 'Words — Anders Edenroth', 'Supermarket Flowers — Ed Sheeran; arr. André van der Merwe', 'Hey Ya! — Benjamin Benjamin; arr. Antoine Krattinger'] },
  { festival: 'Sing for Gold', year: 2024, category: 'Pop / Caz / Gospel', choir: 'Vocal Group No Romeo’s', country: 'Hollanda', works: ['Lyse nætter — Aske Bentzon; arr. Line Groth', 'W.I.T.C.H. — Devon Cole et al.; arr. Emily Drum', 'God’s Great Dust Storm — Anne Bergheim et al.; arr. Henrik Dahlgren', 'Love Theory — Kirk Franklin; arr. Ruben Smits'] },

  { festival: 'Kalamata International Choir Competition', year: 2024, category: 'Karma Korolar · A1', choir: 'Akademisk Kor Århus', country: 'Danimarka', works: ['Milo mou Kokkino — Geleneksel Yunan', 'Let My Love Be Heard — Jake Runestad', 'Three Stages: In the Woods — Pelle Gudmundsen-Holmgreen', 'Leron, Leron Sinta — Geleneksel Filipin; arr. Saunder Choi'] },
  { festival: 'Kalamata International Choir Competition', year: 2024, category: 'Karma Korolar · A1', choir: 'Kamarikuoro Värinä', country: 'Finlandiya', works: ['Tre dikt av Ebba Lindqvist: Vi som är födda — Alfred Janson', 'Mia smynia sto parathiri — Geleneksel Yunan; arr. Yannis Konstantinidis', 'Enjoy the Silence — Martin Gore; arr. Eric Whitacre', 'Canticum Calamitatis Maritimae — Jaakko Mäntyjärvi'] },
  { festival: 'Kalamata International Choir Competition', year: 2024, category: 'Karma Korolar · A1', choir: 'Bündner Jugendchor', country: 'İsviçre', works: ['Quasi un incanto — Ivo Antognini', 'Mja smirnjá sto parathíri — Giannis Konstantinides', 'Ta na Solbici — Samo Vovk', 'Daemon irrepit callidus — György Orbán'] },
  { festival: 'Kalamata International Choir Competition', year: 2024, category: 'Kutsal a cappella', choir: 'Akademisk Kor Århus', country: 'Danimarka', works: ['Vigilate — William Byrd', 'Schaffe in mir, Gott, ein rein Herz — Johannes Brahms', 'Gloria in excelsis — Ivo Antognini'] },
  { festival: 'Kalamata International Choir Competition', year: 2024, category: 'Kutsal a cappella', choir: 'Bündner Jugendchor', country: 'İsviçre', works: ['Conversion of Saul — Z. Randall Stroope', 'Lux Aurumque — Eric Whitacre', 'Dies Irae — Michael John Trotta'] },
  { festival: 'Kalamata International Choir Competition', year: 2024, category: 'Gençlik · Karma Sesler', choir: 'Vokalensemble incantanti', country: 'İsviçre', works: ['Sulegl VIII — Gion Andrea Casanova', 'Time — Jennifer Lucy Cook', 'Ceremony after a Fire Raid, Op. 28 — Ernst Widmer', 'Celtic Dance — Kirby Shaw'] },
  { festival: 'Kalamata International Choir Competition', year: 2024, category: 'Folklor', choir: 'Strathmore University Chorale', country: 'Kenya', works: ['Sigalagala — Sammy Otiemo', 'Vahaga — Arthur Kimoli'] },
  { festival: 'Kalamata International Choir Competition', year: 2024, category: 'Folklor', choir: 'Cantus Libera', country: 'Romanya', works: ['Iac-aşa — Simeon Nicolescu', 'Sāri mandra, sāri draga — Sabin Pautza', 'Vine hulpe de la munte — Adrian Pop', 'Chindia — Alexandru Paşcanu', 'Stăncuţa — Gavriil Musicescu'] },

  { festival: 'European Choir Games', year: 2023, category: 'GP3 · Oda Korosu / Vokal Ansambl', choir: 'Vocal Ensemble Fortissimo', country: 'Bulgaristan', works: ['Bulgarian Medley — Geleneksel; arr. Fortissimo', 'Cantate Domino — Claudio Monteverdi', 'Daemon irrepit callidus — György Orbán', 'Bohemian Rhapsody — Freddie Mercury'] },
  { festival: 'European Choir Games', year: 2023, category: 'GP3 · Oda Korosu / Vokal Ansambl', choir: 'Kammerkoret Musica', country: 'Danimarka', works: ['Trois Chansons: Yver — Claude Debussy', 'Sweet Honeysucking Bees — John Wilbye', 'Sleep — Eric Whitacre', 'The Wee Wee Man — Vagn Holmboe'] },
  { festival: 'European Choir Games', year: 2023, category: 'GP4 · Yetişkin Koroları', choir: 'Volve Vokal', country: 'Norveç', works: ['Rubbles — Pål Moddi Knudsen', 'Sansene, Op. 168 — Knut Nystedt', 'Wisdom Cries — Aurora Aksnes', 'This Little Babe — Benjamin Britten'] },
  { festival: 'European Choir Games', year: 2023, category: 'GP5 · Kutsal a cappella', choir: 'Kammerkoret Musica', country: 'Danimarka', works: ['Crucifixus — Antonio Lotti', 'Nachtlied — Max Reger', 'O Magnum Mysterium — Morten Lauridsen', 'Madonna over bølgerne — Peter Erasmus Lange-Müller'] },
  { festival: 'European Choir Games', year: 2023, category: 'GP6 · Kutsal, eşlikli', choir: 'Continuum Youth Choir', country: 'İrlanda', works: ['Regina caeli — Tomás Luis de Victoria', 'Geistliches Lied, Op. 30 — Johannes Brahms', 'A Nywe Werk — Seán Doherty', 'Messe für zwei vierstimmige Chöre: Sanctus — Frank Martin'] },
  { festival: 'European Choir Games', year: 2023, category: 'GP8 · Caz / Pop / Show', choir: 'KYN', country: 'Finlandiya', works: ['It’s Raining Men — Paul Shaffer / Paul Jabara', 'Ett liv för mej — Anders Edenroth', 'It Don’t Mean a Thing — Duke Ellington', 'Malaria — Jukka Linkola'] },
  { festival: 'European Choir Games', year: 2023, category: 'GP9 · Folklor a cappella', choir: 'University of the Free State Choir', country: 'Güney Afrika', works: ['San’bonani / Namhla Kudibene Medley — arr. Michael Barrett', 'Jikele Maweni — arr. Christian Ashley-Botha', 'Sikirileke / Koloi — arr. Sabelo Mthembu', 'Dubula / Shosholoza Medley — arr. Stephen Hatfield'] },
  { festival: 'European Choir Games', year: 2023, category: 'GP10 · Folklor, eşlikli', choir: 'Vocal Ensemble Fortissimo', country: 'Bulgaristan', works: ['Folklore Choral Partita — arr. Krassimir Kyurkchiyski', 'Yaninku — arr. Kiril Todorov', 'Lale li si, zyumbyul li si — arr. Milena Dobreva', 'Bulgarian Folklore Suite — arr. Nikolay Kaufman / Krassimir Kyurkchiyski / Milena Dobreva'] },
];

export const programBookSources = [
  { festival: 'World Choir Games', year: 2024, scope: '250 koro · 42 ülke · 296 sayfa', status: 'İşlendi', url: 'https://www.interkultur.com/fileadmin/INTERKULTUR/Events/2024/Auckland/Information/ProgramBook-WCG2024.pdf' },
  { festival: 'Sing for Gold', year: 2024, scope: '52 koro · 34 ülke · 112 sayfa', status: 'İşlendi', url: 'https://www.interkultur.com/fileadmin/INTERKULTUR/Events/2024/Calella/Information/ProgramBook-Calella2024.pdf' },
  { festival: 'Kalamata International Choir Competition', year: 2024, scope: '26 koro · 14 ülke · 100 sayfa', status: 'İşlendi', url: 'https://www.interkultur.com/fileadmin/INTERKULTUR/Events/2024/Kalamata/Information/ProgramBook-Kalamata2024.pdf' },
  { festival: 'European Choir Games', year: 2023, scope: '144 sayfa + 34 sayfa yarışma programı', status: 'İşlendi', url: 'https://www.interkultur.com/fileadmin/INTERKULTUR/Events/2023/Norrkoeping/Information/CompetitionPrograms-ECG2023.pdf' },
  { festival: 'INTERKULTUR dünya arşivi', year: '2016–2026', scope: 'Avrupa, Asya, Amerika ve Afrika etkinlikleri', status: 'Sürekli tarama', url: 'https://www.interkultur.com/program-books/' },
];

export const scoreResources = [
  { matches: ['lay a garland'], title: 'Lay a Garland', composer: 'Robert Lucas Pearsall', access: 'Açık nota', format: 'PDF / MusicXML seçenekleri', rights: 'CPDL üzerindeki edisyona özgü lisans koşullarını kontrol edin.', url: 'https://www.cpdl.org/wiki/index.php/Lay_a_garland_(Robert_Lucas_Pearsall)' },
  { matches: ['fair phyllis'], title: 'Fair Phyllis I Saw', composer: 'John Farmer', access: 'Açık nota', format: 'PDF', rights: 'CPDL edisyonu; indirme sayfasındaki lisans geçerlidir.', url: 'https://www.cpdl.org/wiki/index.php/Fair_Phyllis_I_saw_(John_Farmer)' },
  { matches: ['hear my prayer'], title: 'Hear My Prayer, O Lord', composer: 'Henry Purcell', access: 'Açık nota', format: 'PDF', rights: 'CPDL edisyonu; indirme sayfasındaki lisans geçerlidir.', url: 'https://www.cpdl.org/wiki/index.php/Hear_my_prayer,_O_Lord,_Z_15_(Henry_Purcell)' },
  { matches: ['bogoroditse devo'], title: 'Bogoroditse Devo', composer: 'Sergei Rachmaninoff', access: 'Açık arşiv', format: 'PDF', rights: 'IMSLP ülke ve edisyon uyarılarını kontrol edin.', url: 'https://s9.imslp.org/files/imglnks/usimg/9/95/IMSLP268090-PMLP28683-Rachmaninoff-Bogoroditse_Devo.pdf' },
  { matches: ['exultate justi — lodovico', 'exultate justi — ludovico'], title: 'Exultate Justi', composer: 'Ludovico da Viadana', access: 'Açık nota', format: 'PDF / MIDI / MusicXML', rights: 'CPDL üzerinde birden çok açık edisyon bulunuyor.', url: 'https://www.cpdl.org/wiki/index.php/Exultate_justi_(Ludovico_da_Viadana)' },
  { matches: ['nyon nyon'], title: 'Nyon Nyon', composer: 'Jake Runestad', access: 'Satın alma + inceleme', format: 'SATB divisi · dijital / basılı', rights: 'Koro üyesi sayısı kadar lisanslı kopya alınmalıdır.', url: 'https://jakerunestad.com/products/nyon-nyon' },
  { matches: ['let my love be heard'], title: 'Let My Love Be Heard', composer: 'Jake Runestad', access: 'Satın alma + inceleme', format: 'SATB divisi · dijital / basılı', rights: 'Koro üyesi sayısı kadar lisanslı kopya alınmalıdır.', url: 'https://jakerunestad.com/products/let-my-love-be-heard' },
  { matches: ['baba yetu'], title: 'Baba Yetu', composer: 'Christopher Tin', access: 'Satın alma', format: 'SSATBB / SATB / SAB / SSAA / TTBB', rights: 'Sürüm ve bölgeye göre lisanslı satış bağlantısı seçilmelidir.', url: 'https://christophertin.com/blogs/works/baba-yetu' },
  { matches: ['pseudo-yoik'], title: 'Pseudo-Yoik', composer: 'Jaakko Mäntyjärvi', access: 'Yayınevi bilgisi', format: 'SSSAATTTBBB · Sulasol S326', rights: 'Bestecinin resmî bilgi föyü; nota Sulasol/Walton üzerinden lisanslanır.', url: 'https://www.jaakkomantyjarvi.fi/resources/jm_webfactsheets/jmweb_py.pdf' },
  { matches: ['lux aurumque'], title: 'Lux Aurumque', composer: 'Eric Whitacre', access: 'Satın alma + inceleme', format: 'SATB / TTBB', rights: 'GIA Publications lisanslı edisyonu.', url: 'https://ericwhitacre.com/music-catalog/lux-aurumque' },
  { matches: ['dies irae — michael john trotta', 'dies irae — michael trotta'], title: 'Dies Irae', composer: 'Michael John Trotta', access: 'Satın alma + önizleme', format: 'SATB / SAB', rights: 'Bestecinin resmî katalog ve lisanslı PDF bağlantıları.', url: 'https://www.mjtrotta.com/michael-john-trotta-composer/sheet-music-composer-michael-john-trotta/' },
  { matches: ['the voices of the world'], title: 'The Voices of the World', composer: 'Millie Leandersson; arr. Richard Johansson', access: 'Ücretsiz resmî nota', format: 'PDF', rights: 'European Choir Games 2023 tarafından katılımcılar için yayımlanmıştır.', url: 'https://www.interkultur.com/fileadmin/INTERKULTUR/Events/2023/Norrkoeping/Information/OfficialSong-ECG2023.pdf' },
];

export const juryLenses = [
  { name: 'Cristian Grases', focus: 'Latin Amerika repertuvarı · besteci/şef', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Mia Makaroff', focus: 'Çocuk/gençlik korosu · ritim ve çağdaş bestecilik', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Deke Sharon', focus: 'Çağdaş a cappella · sahne dili ve vokal prodüksiyon', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Susanna Saw', focus: 'Koro eğitimi · Güneydoğu Asya repertuvarı', source: 'https://www.ticctokyo.icot.or.jp/regulations' },
  { name: 'Gary Graden', focus: 'Avrupa oda korosu · tını ve yorum', source: 'https://www.cittolosa.com/en/choral-contest-2/choral-contest-2024/' },
  { name: 'María Guinand', focus: 'Latin Amerika müziği · ritim ve kültürel özgünlük', source: 'https://www.cittolosa.com/en/choral-contest-2/choral-contest-2024/' },
  { name: 'Jānis Ozols', focus: 'Baltık koro geleneği · homojenlik ve entonasyon', source: 'https://www.tamperevocal.fi/en/news/tampere-vocal-music-festival-champions-value-based-singing/' },
  { name: 'Shin-Hwa Park', focus: 'Üniversite ve kilise müziği · repertuvar dengesi', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
];

export const researchSources = [
  ['Ohrid 2026 · en yüksek yarışma puanı', 'Collegium Medicum: 95,33, I. ödül ve iki repertuvar özel ödülü', 'https://takajestbydgoszcz.pl/artykul/chor-cm-umk-z-bydgoszczy-n2473885'],
  ['Ohrid 2026 · Grand Prix', 'Gaudeamus Choir of Nysa Cultural Centre Grand Prix doğrulaması', 'https://www.nysahot.pl/artykul/9394,wielki-sukces-choru-gaudeamus-grand-prix-na-miedzynarodowym-festiwalu-w-macedonii'],
  ['Ohrid 2026 · Türkiye sonuçları', 'A Capella Gramofon 90,00 ve Pop Akustik 76,33 puan', 'https://halktv.com.tr/tanitim-bulteni/turker-barmanbekin-yonetimindeki-korolar-ohridde-birinci-ve-ucuncu-oldu-1053829h'],
  ['INTERKULTUR sonuç arşivi', 'Festival bazında ülke/koro sayıları ve sonuç belgeleri', 'https://www.interkultur.com/de/ergebnisse/'],
  ['INTERKULTUR program kitapları', '2016–2025 etkinlik programları', 'https://www.interkultur.com/program-books/'],
  ['World Choir Games Auckland', '250 koro, 42 ülke, jüri profilleri ve kategori belgeleri', 'https://www.interkultur.com/events/world-choir-games/auckland-2024'],
  ['Cork 2024 sonuçları', 'Fleischmann Trophy puanları ve özel eser/program ödülleri', 'https://www.corkchoral.ie/2024/05/2024-competition-results/'],
  ['Tokyo yarışma yönetmeliği', 'TES/AIS puanlama, süre cezaları ve jüri sistemi', 'https://www.ticctokyo.icot.or.jp/regulations'],
  ['Tallinn 2023 sonuçları', 'Kategori puanları, zorunlu eser ödülü ve süre cezaları', 'https://kooriyhing.ee/en/the-results-of-the-17th-international-choir-festival-tallinn-2023/'],
  ['Busan 2024 sonuçları', 'Grand Prix ve kategori kazananları', 'https://www.busanchoral.org/eng/archive/2024bcfc_awards'],
  ['Tolosa 2024', '95,20 puanlı kazanan, jüri ve Basque-work ödülü', 'https://www.cittolosa.com/en/choral-contest-2/choral-contest-2024/'],
  ['Singapore 2024 sonuçları', 'Koro/ülke/kategori bazında tam puanlar', 'https://sicf.sg/wp/wp-content/uploads/2024/11/SICF-2024-Results.pdf'],
  ['Tampere 2025', '55 koro, kazananlar ve jüri geri bildirim yaklaşımı', 'https://www.tamperevocal.fi/en/news/tampere-vocal-music-festival-champions-value-based-singing/'],
] as const;
