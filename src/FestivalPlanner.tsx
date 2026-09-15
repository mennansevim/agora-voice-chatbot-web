import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, ArrowLeft, ArrowRight, BookOpenText, BrainCircuit, CalendarClock,
  CheckCircle, ChevronDown, ExternalLink, FileMusic, Globe2, LayoutDashboard,
  Lightbulb, LockKeyhole, LogOut, Menu, Music2, Search, ShieldCheck, Sparkles, Swords, Target,
  TrendingUp, Trophy, Users, Wand2, X, Youtube,
} from 'lucide-react';
import {
  agoraRepertoire, FestivalRecord, festivals, juryLenses, ohrid2026Competitors,
  internationalPrograms, ohrid2026Participation, ohridPrograms, programBookSources,
  researchSources, scoreResources, worldPrograms,
} from './festivalResearch';
import { wcg2024WorkIndex } from './wcg2024WorkIndex.generated';

type View = 'festivals' | 'dossier' | 'participations' | 'archive' | 'juries' | 'preparation';

const navItems = [
  { id: 'festivals' as View, label: 'Festival keşfi', icon: Globe2 },
  { id: 'dossier' as View, label: 'Festival dosyası', icon: LayoutDashboard },
  { id: 'participations' as View, label: 'Katıldığımız festivaller', icon: Trophy },
  { id: 'archive' as View, label: 'Koro & eser arşivi', icon: BookOpenText },
  { id: 'juries' as View, label: 'Jüri arşivi', icon: ShieldCheck },
  { id: 'preparation' as View, label: 'Festivale hazırlık', icon: Sparkles },
];

const voiceParts = [
  { label: 'Soprano', current: 8, readiness: 83, color: '#f39b8d', load: 'İzmir’in Kavakları · üst çizgi' },
  { label: 'Alto', current: 8, readiness: 86, color: '#f4cf79', load: 'Pirlere · modal merkez/ostinato' },
  { label: 'Tenor', current: 7, readiness: 74, color: '#9fd7ff', load: 'İzmir’in Kavakları · ritmik çekirdek' },
  { label: 'Bas', current: 7, readiness: 79, color: '#9ee7c0', load: 'Pirlere · modal temel' },
];

const benchmarkChoirs = [
  { name: 'Boğaziçi Gençlik Korosu', country: 'Türkiye', result: 'Ohrid GP · 2019', advantage: 'Yerel eser, Balkan eseri ve çağdaş finali dengeli kurdu', implication: 'Bu eserler Agora repertuvarında değildir; yalnızca program mimarisi için referanstır.' },
  { name: 'Anima Mea', country: 'Letonya', result: 'Ohrid GP · 2024', advantage: 'Rönesans, Balkan ve çağdaş Baltık rengini dengeliyor', implication: 'Stil değişimlerinde tek bir homojen tınıya sıkışmamak gerekiyor.' },
  { name: 'Canto Náchod', country: 'Çekya', result: 'Ohrid GP · 2023', advantage: 'Gabrieli–Makedonya–Baba Yetu arasında yüksek kontrast', implication: 'Agora’nın hikâyesi güçlü; dönem kontrastı daha sınırlı.' },
  { name: 'NFM Girls’ Choir', country: 'Polonya', result: 'Ohrid GP · 2025', advantage: 'Yerel kimlik, Zaprov ve popüler finali birlikte kuruyor', implication: 'İzleyici etkisi jüri ciddiyetini düşürmeden planlanabilir.' },
];

const prestigeIndex: Record<string, number> = {
  'Ohrid Choir Festival': 82, 'World Choir Games': 98, 'Cork International Choral Festival': 95,
  'Tolosa Choral Contest': 97, 'Guido d’Arezzo Polyphonic Competition': 96,
  'Marktoberdorf Chamber Choir Competition': 96, 'Prof. Georgi Dimitrov – Varna': 94,
  'Tallinn International Choir Festival': 90, 'Tampere Vocal Music Festival': 89,
  'Seghizzi Choral Competition': 91, 'International Choral Competition Spittal': 92,
  'European Choir Games': 94, 'Sing for Gold': 86, 'Kalamata International Choir Competition': 84,
  'Bad Ischl International Choir Competition': 86, 'Wernigerode International Choir Competition': 87,
  'Riga Sings': 88, 'Vietnam International Choir Competition': 82,
  'Busan Choral Festival & Competition': 90, 'Tokyo International Choir Competition': 92,
  'Singapore International Choral Festival': 86, 'Bali International Choir Festival': 84,
  'Kathaumixw International Choral Festival': 88, 'Sing’n’Joy Princeton': 78,
  'Golden State Choral Trophy Monterey': 77,
};

const foundationYears: Record<string, number> = {
  'Ohrid Choir Festival': 2008, 'World Choir Games': 2000,
  'Cork International Choral Festival': 1954, 'Tolosa Choral Contest': 1969,
  'Guido d’Arezzo Polyphonic Competition': 1952, 'Marktoberdorf Chamber Choir Competition': 1989,
  'Prof. Georgi Dimitrov – Varna': 1979, 'Tampere Vocal Music Festival': 1975,
  'Seghizzi Choral Competition': 1962, 'International Choral Competition Spittal': 1964,
  'European Choir Games': 2013, 'Riga Sings': 2019,
  'Busan Choral Festival & Competition': 2005, 'Tokyo International Choir Competition': 2018,
  'Singapore International Choral Festival': 2014, 'Bali International Choir Festival': 2012,
  'Kathaumixw International Choral Festival': 1984,
};

const festivalJuries: Record<string, string[]> = {
  'Ohrid Choir Festival': ['Dunja Deurić Kartalović · 2026', 'Zapro Zaprov · 2026', 'Boris Nykl · 2026'],
  'World Choir Games': ['Karen Grylls', 'David Hamilton', 'Saeko Hasegawa', 'Steen Lindholm', 'Mia Makaroff', 'Shin-Hwa Park', 'Darius Lim', 'Deke Sharon', 'Cristian Grases', 'Ken Steven'],
  'Tolosa Choral Contest': ['Josu Elberdin', 'Nicole Corti', 'Miguel Ángel García Cañamero', 'Gary Graden', 'María Guinand', 'Oleksii Shamrytskyi', 'Dario Tabbia'],
  'Tokyo International Choir Competition': ['Sofia Söderberg', 'Ambrož Čopi', 'Paul Smith', 'Susanna Saw', 'Ronnie Kay Yen Cheng', 'Cristian Grases', 'Keita Najima'],
  'Tampere Vocal Music Festival': ['Kaija Viitasalo', 'Jennifer Moir', 'Jānis Ozols', 'Jan Schumacher', 'Jani Sivén'],
  'Marktoberdorf Chamber Choir Competition': ['Herbert Böck · 2023 jüri başkanı', '7 kişilik uluslararası kurul'],
};

type JuryDirectoryRecord = {
  name: string;
  country: string;
  festivals: string[];
  expertise: string;
  criteria: string[];
  comment: string;
  evidence: 'Resmî jüri biyografisi' | 'Gerçek jüri formu' | 'Resmî kriter özeti';
  source: string;
};

const juryDirectory: JuryDirectoryRecord[] = [
  { name: 'Karen Grylls', country: 'Yeni Zelanda', festivals: ['World Choir Games'], expertise: 'Koro şefliği eğitimi · tını ve kültürel bağlam', criteria: ['Entonasyon', 'Blend', 'Müzikal cümle', 'Program bütünlüğü'], comment: 'Bireysel jüri yorumu kamuya açık değil. Resmî biyografi; uzun soluklu şeflik, eğitim ve Māori/Pasifika müzisyenleriyle kültürel işbirliğini öne çıkarıyor.', evidence: 'Resmî jüri biyografisi', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'David Hamilton', country: 'Yeni Zelanda', festivals: ['World Choir Games'], expertise: 'Besteci · eğitimci · geniş repertuvar', criteria: ['Skor sadakati', 'Diksiyon', 'Ses dengesi', 'Yorum'], comment: 'Bireysel not yayımlanmadı. Besteci-jüri profili nedeniyle metin, armonik doğruluk ve eserin stiline sadakat özellikle izlenir.', evidence: 'Resmî jüri biyografisi', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Saeko Hasegawa', country: 'Japonya', festivals: ['World Choir Games'], expertise: 'Japon koro geleneği · çağdaş müzik', criteria: ['Ritim', 'Ünsüz netliği', 'Homojenlik', 'Çağdaş teknik'], comment: 'Bireysel not yayımlanmadı. Japon repertuvarı ve çağdaş müzik deneyimi, ritmik kesinlik ve ayrıntılı artikülasyon beklentisini yükseltir.', evidence: 'Resmî jüri biyografisi', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Steen Lindholm', country: 'Danimarka', festivals: ['World Choir Games'], expertise: 'Opera ve koro şefliği · uluslararası adjudication', criteria: ['Tını', 'Dinamik yay', 'Stil', 'Toplu disiplin'], comment: 'Bireysel not yayımlanmadı. Opera ve erkek/çocuk korosu geçmişi, çizginin taşımasını ve toplu disiplinin korunmasını öne çıkarır.', evidence: 'Resmî jüri biyografisi', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Mia Makaroff', country: 'Finlandiya', festivals: ['World Choir Games'], expertise: 'Çocuk/gençlik korosu · ritim ve yaratıcılık', criteria: ['Ritim', 'Yaratıcı ifade', 'Sahne enerjisi', 'Metin'], comment: 'Bireysel not yayımlanmadı. Çocuk ve gençlik korosu uzmanlığı, ritim duygusu, beden kullanımı ve özgün sahne ifadesine duyarlıdır.', evidence: 'Resmî jüri biyografisi', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Darius Lim', country: 'Singapur', festivals: ['World Choir Games'], expertise: 'Çağdaş koro · festival ve topluluk yönetimi', criteria: ['Kültürel kimlik', 'Program iletişimi', 'Tını', 'Sahne'], comment: 'Bireysel not yayımlanmadı. Asya-Pasifik koro ağındaki deneyimi, yerel kimliğin sahnede anlaşılır ve çağdaş bir dille kurulmasını destekler.', evidence: 'Resmî jüri biyografisi', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Shin-Hwa Park', country: 'Güney Kore', festivals: ['World Choir Games'], expertise: 'Üniversite/kilise korosu · uzun dönemli koro eğitimi', criteria: ['Entonasyon', 'Blend', 'Manevi metin', 'Yorum'], comment: 'Bireysel not yayımlanmadı. Büyük koro ve kilise müziği deneyimi, özellikle kutsal repertuvarda tını birliği ve metin ciddiyetini öne çıkarır.', evidence: 'Resmî jüri biyografisi', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Sara Matteucci', country: 'İtalya', festivals: ['World Choir Games'], expertise: 'Koro şefliği · müzikoloji · çocuk korosu', criteria: ['Dönem bilgisi', 'Skor sadakati', 'Diksiyon', 'Yapı'], comment: 'Bireysel not yayımlanmadı. Müzikoloji ve erken müzik çalışmaları, dönem üslubunun stilize değil bilinçli uygulanmasını gerektirir.', evidence: 'Resmî jüri biyografisi', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Anna Ungureanu', country: 'Romanya', festivals: ['World Choir Games'], expertise: 'Oda korosu · ulusal koro programları', criteria: ['Artikülasyon', 'Toplu nefes', 'Duygusal doğruluk', 'Kültürel dil'], comment: 'Bireysel not yayımlanmadı. Romen repertuvarı ve eğitim programı deneyimi, dilin doğal akışı ile toplu nefese odaklanır.', evidence: 'Resmî jüri biyografisi', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Michael Barrett', country: 'Güney Afrika', festivals: ['World Choir Games'], expertise: 'Besteci/aranjör · Güney Afrika koro kültürü', criteria: ['Ritim', 'Kültürel özgünlük', 'Groove', 'Sahne iletişimi'], comment: 'Bireysel not yayımlanmadı. Yerel halk müziği ve çağdaş koro aranjmanı uzmanlığı, ritmik doğallık ile kültürel temsil arasındaki dengeyi sınar.', evidence: 'Resmî jüri biyografisi', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Sofia Söderberg', country: 'İsveç', festivals: ['Tokyo International Choir Competition'], expertise: 'Besteci/şef · çağdaş Avrupa korosu', criteria: ['TES: entonasyon', 'TES: ritim', 'Blend', 'AIS: sanatsal izlenim'], comment: 'Tokyo’nun resmî yönteminde TES ve AIS birlikte değerlendirilir; bireysel yorumlar yayımlanmadığında ölçüt özeti kullanılır.', evidence: 'Resmî kriter özeti', source: 'https://www.ticctokyo.icot.or.jp/regulations' },
  { name: 'Ambrož Čopi', country: 'Slovenya', festivals: ['Tokyo International Choir Competition'], expertise: 'Besteci/şef · Balkan ve Avrupa koro dili', criteria: ['Skor sadakati', 'Armonik akış', 'Tını', 'Zorunlu eser'], comment: 'Bireysel puan notu kamuya açık değil. Tokyo kuralları, zorunlu eser ve dönem kontrastında sadakat ile teknik temizliği birlikte arar.', evidence: 'Resmî kriter özeti', source: 'https://www.ticctokyo.icot.or.jp/regulations' },
  { name: 'Paul Smith', country: 'Birleşik Krallık', festivals: ['Tokyo International Choir Competition'], expertise: 'Şarkıcı/şef · vokal performans', criteria: ['Entonasyon', 'Ritim', 'Vokal blend', 'Sahne disiplini'], comment: 'Bireysel yorum yayımlanmadı. Şarkıcı-şef perspektifi, koristlerin tek tek değil toplu vokal organizasyonunun duyulmasını gerektirir.', evidence: 'Resmî kriter özeti', source: 'https://www.ticctokyo.icot.or.jp/regulations' },
  { name: 'Susanna Saw', country: 'Malezya', festivals: ['Tokyo International Choir Competition'], expertise: 'Koro şefliği · Güneydoğu Asya repertuvarı', criteria: ['Dil', 'Ritim', 'Kültürel özgünlük', 'Blend'], comment: 'Bireysel yorum yayımlanmadı. Tokyo’nun uluslararası paneli, dil ve kültürel bağlamın teknik icrayla birlikte duyulmasını bekler.', evidence: 'Resmî jüri biyografisi', source: 'https://www.ticctokyo.icot.or.jp/regulations' },
  { name: 'Ronnie Kay Yen Cheng', country: 'Hong Kong SAR', festivals: ['Tokyo International Choir Competition'], expertise: 'Koro şefliği · Asya koro ağı', criteria: ['Diksiyon', 'Tempo', 'Tını', 'Program kontrastı'], comment: 'Bireysel yorum yayımlanmadı. Asya koro sahnesi deneyimi, dil netliği ve kontrastlı program akışını öne çıkarır.', evidence: 'Resmî jüri biyografisi', source: 'https://www.ticctokyo.icot.or.jp/regulations' },
  { name: 'Cristian Grases', country: 'Venezuela / ABD', festivals: ['World Choir Games', 'Tokyo International Choir Competition', 'Tolosa Choral Contest'], expertise: 'Besteci/şef · Latin Amerika repertuvarı', criteria: ['Ritim', 'Kültürel özgünlük', 'Metin', 'Enerji'], comment: 'Bireysel festival notu çoğunlukla kapalı. Latin Amerika repertuvarı uzmanlığı, ritmik esnekliği ve metnin doğal konuşma akışını görünür kılar.', evidence: 'Resmî jüri biyografisi', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Keita Najima', country: 'Japonya', festivals: ['Tokyo International Choir Competition'], expertise: 'Japon koro şefliği · çağdaş yerel eserler', criteria: ['Zorunlu eser', 'Entonasyon', 'Japonca diksiyon', 'Sahne düzeni'], comment: 'Bireysel yorum yayımlanmadı. Tokyo’nun yerel jüri üyesi olarak Japon bestecilerin zorunlu eserlerinde dil, stil ve nota sadakati kritik.', evidence: 'Resmî kriter özeti', source: 'https://www.ticctokyo.icot.or.jp/regulations' },
  { name: 'Gary Graden', country: 'ABD / İsveç', festivals: ['Tolosa Choral Contest'], expertise: 'Oda korosu · Avrupa tını geleneği', criteria: ['Homojenlik', 'Dönem üslubu', 'Dinamik', 'Sessiz başlangıçlar'], comment: 'Tolosa’da bireysel notlar genel olarak yayımlanmaz. Oda korosu standardı, küçük dinamiklerde bile çizgi ve blend sürekliliği ister.', evidence: 'Resmî kriter özeti', source: 'https://www.cittolosa.com/en/choral-contest-2/choral-contest-2024/' },
  { name: 'María Guinand', country: 'Venezuela', festivals: ['Tolosa Choral Contest'], expertise: 'Latin Amerika koro eğitimi · topluluk müziği', criteria: ['Ritim', 'Kültürel kimlik', 'Metin', 'Topluluk iletişimi'], comment: 'Tolosa’nın uluslararası panelinde kültürel kimlik ve ritim, yalnızca efekt değil müzikal yapı olarak değerlendirilir.', evidence: 'Resmî jüri biyografisi', source: 'https://www.cittolosa.com/en/choral-contest-2/choral-contest-2024/' },
  { name: 'Josu Elberdin', country: 'İspanya', festivals: ['Tolosa Choral Contest'], expertise: 'Besteci · Bask koro repertuvarı', criteria: ['Baskça metin', 'Skor sadakati', 'Armoni', 'Program uyumu'], comment: 'Baskça eser ve özel ödül geleneği nedeniyle telaffuz, metin vurgusu ve yerel repertuvarın yüzeysel olmayan yorumu öne çıkar.', evidence: 'Resmî kriter özeti', source: 'https://www.cittolosa.com/en/choral-contest-2/choral-contest-2024/' },
  { name: 'Dario Tabbia', country: 'İtalya', festivals: ['Tolosa Choral Contest'], expertise: 'Koro şefliği · İtalyan polifonisi', criteria: ['Polifonik bağımsızlık', 'Entonasyon', 'Diksiyon', 'Rönesans üslubu'], comment: 'Polifoni kategorilerinde seslerin birbirini örtmemesi ve dikey akor kadar yatay çizginin de duyulması beklenir.', evidence: 'Resmî kriter özeti', source: 'https://www.cittolosa.com/en/choral-contest-2/choral-contest-2024/' },
  { name: 'Dunja Deurić Kartalović', country: 'Hırvatistan', festivals: ['Ohrid Choir Festival'], expertise: 'Koro şefliği · festival pedagojisi', criteria: ['Program zorluğu', 'A cappella özgünlük', 'Sahne hareketi', 'Enerji'], comment: '“Daha zorlayıcı bir program ve özgün bir a cappella koro eseri” önerdi; sahne hareketinin ileri taşınmasını, iyi enerjinin korunmasını istedi.', evidence: 'Gerçek jüri formu', source: 'https://www.ohridchoirfestival.com/' },
  { name: 'Zapro Zaprov', country: 'Kuzey Makedonya', festivals: ['Ohrid Choir Festival'], expertise: 'Koro şefliği · Balkan repertuvarı', criteria: ['Yarışma repertuvarı', 'Şeflik', 'Sahne sunumu', 'Ritim'], comment: 'Repertuvarın daha iddialı ve yarışmaya uygun olması gerektiğini belirtti; şeflik ve sahne sunumunu çok güçlü buldu, “mükemmel sahne performansı” notunu düştü.', evidence: 'Gerçek jüri formu', source: 'https://www.ohridchoirfestival.com/' },
  { name: 'Boris Nykl', country: 'Çekya', festivals: ['Ohrid Choir Festival'], expertise: 'Koro şefliği · yorum ve prova tekniği', criteria: ['Atmosfer', 'Müzikal cümle', 'Dinamik', 'Jest ekonomisi'], comment: 'İyi atmosfer ve enerjiyi onayladı; repertuvarı biraz kolay buldu. Müzikal cümlelerin doğal akmasını, ritmik jestlerin azaltılmasını ve şefin koristlere güvenmesini önerdi.', evidence: 'Gerçek jüri formu', source: 'https://www.ohridchoirfestival.com/' },
  { name: 'Deke Sharon', country: 'ABD', festivals: ['World Choir Games'], expertise: 'Çağdaş a cappella · vokal prodüksiyon', criteria: ['Sahne iletişimi', 'Ritim', 'Mikrofon dengesi', 'Özgünlük'], comment: 'Bireysel not yayımlanmadı. A cappella ve vokal prodüksiyon uzmanlığı, ritmik kilit ile sahne anlatısının aynı anda çalışmasını gerektirir.', evidence: 'Resmî jüri biyografisi', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Ken Steven', country: 'Endonezya', festivals: ['World Choir Games'], expertise: 'Koro şefliği · Asya müzik eğitimi', criteria: ['Diksiyon', 'Toplu nefes', 'Tını', 'Kültürel bağlam'], comment: 'Bireysel not yayımlanmadı. Asya koro eğitimi perspektifi, metnin anlaşılır ve toplu tınının dengeli olmasını öne çıkarır.', evidence: 'Resmî jüri biyografisi', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Anna Tabita Abeleda-Piquero', country: 'Filipinler', festivals: ['World Choir Games'], expertise: 'Koro aranjmanı · Filipinler Madrigal geleneği', criteria: ['Polifoni', 'Ritim', 'Kültürel ifade', 'Blend'], comment: 'Bireysel not yayımlanmadı. Aranjör ve koro yöneticisi olarak seslerin bağımsızlığı, ritmik canlılık ve yerel rengin klişeye düşmemesi önemlidir.', evidence: 'Resmî jüri biyografisi', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Rachael Griffiths-Hughes', country: 'Yeni Zelanda', festivals: ['World Choir Games'], expertise: 'Erken müzik · org/klavsen · koro eğitimi', criteria: ['Dönem üslubu', 'Artikülasyon', 'Metin', 'Eşlik dengesi'], comment: 'Bireysel not yayımlanmadı. 17.–18. yüzyıl repertuvarı uzmanlığı, stil bilgisi ve ses–eşlik dengesini hassaslaştırır.', evidence: 'Resmî jüri biyografisi', source: 'https://www.interkultur.com/events/world-choir-games/auckland-2024' },
  { name: 'Kaija Viitasalo', country: 'Finlandiya', festivals: ['Tampere Vocal Music Festival'], expertise: 'Fin vokal geleneği · festival programcılığı', criteria: ['Tını', 'Program çeşitliliği', 'Fin dilinin doğallığı', 'Sahne'], comment: 'Festival jüri notları yayımlanmadı. Tampere yaklaşımı, koroyu tek bir estetikte kilitlemeden özgün kimlik ve program değerini arar.', evidence: 'Resmî kriter özeti', source: 'https://www.tamperevocal.fi/en/news/tampere-vocal-music-festival-champions-value-based-singing/' },
  { name: 'Jennifer Moir', country: 'Kanada', festivals: ['Tampere Vocal Music Festival'], expertise: 'Vokal topluluk · çağdaş koro', criteria: ['Blend', 'Ritim', 'Sahne iletişimi', 'Yaratıcılık'], comment: 'Bireysel yorum kamuya açık değil. Değerlendirme lensi, vokal topluluğun birlikte nefes ve çağdaş sahne dilini dengeler.', evidence: 'Resmî kriter özeti', source: 'https://www.tamperevocal.fi/en/news/tampere-vocal-music-festival-champions-value-based-singing/' },
  { name: 'Jānis Ozols', country: 'Letonya', festivals: ['Tampere Vocal Music Festival'], expertise: 'Baltık koro geleneği · şeflik', criteria: ['Entonasyon', 'Homojenlik', 'Diksiyon', 'Armonik netlik'], comment: 'Bireysel yorum yayımlanmadı. Baltık koro geleneği, özellikle düşük seslerde homojenlik ve akor içi perdeyi öne çıkarır.', evidence: 'Resmî kriter özeti', source: 'https://www.tamperevocal.fi/en/news/tampere-vocal-music-festival-champions-value-based-singing/' },
  { name: 'Jan Schumacher', country: 'Almanya', festivals: ['Tampere Vocal Music Festival'], expertise: 'Koro şefliği · uluslararası yarışma jürisi', criteria: ['Skor sadakati', 'Tempo', 'Dinamik', 'Program akışı'], comment: 'Bireysel yorum yayımlanmadı. Yarışma jürisi deneyimi, programın temposu ve final etkisinin birlikte kurulmasını gerektirir.', evidence: 'Resmî kriter özeti', source: 'https://www.tamperevocal.fi/en/news/tampere-vocal-music-festival-champions-value-based-singing/' },
  { name: 'Jani Sivén', country: 'Finlandiya', festivals: ['Tampere Vocal Music Festival'], expertise: 'Vokal müzik · topluluk çalışması', criteria: ['Ritim', 'Blend', 'Metin', 'Sahne doğallığı'], comment: 'Bireysel yorum yayımlanmadı. Vokal müzik odağı, ritim ve metin akışının sahne doğallığıyla birleşmesini bekler.', evidence: 'Resmî kriter özeti', source: 'https://www.tamperevocal.fi/en/news/tampere-vocal-music-festival-champions-value-based-singing/' },
  { name: 'Herbert Böck', country: 'Avusturya', festivals: ['Marktoberdorf Chamber Choir Competition'], expertise: 'Oda korosu · yarışma jürisi başkanlığı', criteria: ['Entonasyon', 'Şeffaf tını', 'Dönem üslubu', 'Toplu ifade'], comment: 'Marktoberdorf’un oda korosu standardında bireysel notlar çoğunlukla kapalıdır; küçük kadroda her iç ses ve artikülasyon duyulur olmalıdır.', evidence: 'Resmî kriter özeti', source: 'https://www.kammerchorwettbewerb.org/en/index.html' },
  { name: 'Nicole Corti', country: 'Fransa', festivals: ['Tolosa Choral Contest'], expertise: 'Koro şefliği · Fransız repertuvarı', criteria: ['Diksiyon', 'Renk', 'Legato', 'Stil'], comment: 'Bireysel not yayımlanmadı. Fransız repertuvarı deneyimi, ünlü/ünsüz dengesi ve uzun legato çizgisini hassaslaştırır.', evidence: 'Resmî jüri biyografisi', source: 'https://www.cittolosa.com/en/choral-contest-2/choral-contest-2024/' },
  { name: 'Miguel Ángel García Cañamero', country: 'İspanya', festivals: ['Tolosa Choral Contest'], expertise: 'Koro şefliği · İspanyol çağdaş repertuvarı', criteria: ['Ritim', 'İspanyolca diksiyon', 'Çağdaş teknik', 'Sahne'], comment: 'Bireysel not yayımlanmadı. İspanyol dilinin vurgu yapısı ile çağdaş tekniklerin temiz ve teatral olmayan uygulanması beklenir.', evidence: 'Resmî jüri biyografisi', source: 'https://www.cittolosa.com/en/choral-contest-2/choral-contest-2024/' },
  { name: 'Oleksii Shamrytskyi', country: 'Ukrayna', festivals: ['Tolosa Choral Contest'], expertise: 'Koro şefliği · Doğu Avrupa repertuvarı', criteria: ['Tını', 'Duygusal yoğunluk', 'Diksiyon', 'Toplu nefes'], comment: 'Bireysel not yayımlanmadı. Doğu Avrupa repertuvarında geniş tını ve metin yoğunluğunun kontrol altında tutulması kritik olur.', evidence: 'Resmî jüri biyografisi', source: 'https://www.cittolosa.com/en/choral-contest-2/choral-contest-2024/' },
];

const festivalRules: Record<string, string[]> = {
  'Tokyo International Choir Competition': ['Karma koro: en az 16 korist', 'Zorunlu eser + Rönesans/Barok veya Romantik eser', 'Kategori programı 9–12 dakika', 'Her 10 saniyelik süre ihlalinde 3 puan kesintisi', 'TES: entonasyon, ritim, sadakat/zorluk ve blend; ayrıca AIS'],
  'Busan Choral Festival & Competition': ['Program 10–15 dakika', 'En az bir a cappella eser', 'Etnik kategoride koronun ülkesinden geleneksel eser', 'Jüri formu ve yorumlar koroya özel e-postayla gönderilir'],
  'Bad Ischl International Choir Competition': ['Grand Prize programı iki yeni a cappella eser', 'Grand Prize toplam süresi en fazla 8 dakika'],
  'Wernigerode International Choir Competition': ['Değerlendirme için üç seçilmiş eser', 'Performans sonrası pedagojik geri bildirim görüşmesi'],
  'World Choir Games': ['Open Competition ve Champions Competition katmanları', 'MUSICA MUNDI 30 puan sistemi', 'Kategori koşulları ve repertuvar süresi kategoriye göre değişir'],
  'Tolosa Choral Contest': ['Polifoni ile Bask/folk programları ayrı değerlendirilir', 'Baskça eser yorumu için özel ödül', 'European Grand Prix ağına seçim'],
  'Cork International Choral Festival': ['Fleischmann International Trophy seçici başvuruyla çalışır', 'Program hayal gücü ve sanatsal bütünlük için özel ödüller', 'Uluslararası, ulusal ve kilise performansları birlikte yürür'],
};

function getSimulatorProfile(festival: FestivalRecord) {
  if (festival.name.includes('Tokyo')) return { weights: [25, 20, 15, 15, 25], label: 'TES + sanatsal izlenim', caution: 'Karma koro kategorisi için zorunlu eser ve dönem eseri gerekir; mevcut iki eser tek başına başvuru programını karşılamaz.' };
  if (festival.name.includes('Cork')) return { weights: [20, 16, 18, 20, 26], label: 'Program hayal gücü ve eser yorumu', caution: 'Program bütünlüğü güçlü; Avrupa dönem kontrastı ve temiz a cappella icra belirleyici olur.' };
  if (festival.name.includes('Tallinn')) return { weights: [25, 20, 16, 14, 25], label: 'Zorunlu eser, çağdaşlık ve süre', caution: 'Süre taşması yayımlanmış sonuçlarda puan cezası doğurdu; kronometreli koşu zorunlu.' };
  if (festival.region === 'Balkanlar') return { weights: [22, 18, 24, 18, 18], label: 'Balkan uyumu ve program hikâyesi', caution: `${festival.signal}. Bölgesel eserin dil ve ritim doğallığı özellikle sınanmalı.` };
  if (festival.region === 'Asya-Pasifik') return { weights: [22, 20, 22, 20, 16], label: 'Teknik güven + kültürel kimlik', caution: `${festival.signal}. Kategori ve zorunlu eser koşulları başvurudan önce yeniden doğrulanmalı.` };
  if (festival.region === 'Amerika') return { weights: [22, 18, 18, 22, 20], label: 'Teknik güven + iletişim', caution: `${festival.signal}. Sahne iletişimi ile uzun çizgili koro tınısı birlikte korunmalı.` };
  return { weights: [24, 18, 15, 18, 25], label: 'Avrupa yarışma programı', caution: `${festival.signal}. Dönem çeşitliliği, a cappella şeffaflık ve program mimarisi belirleyici.` };
}

function ScoreRing({ score, label, small = false }: { score: number; label: string; small?: boolean }) {
  return <div className={`fep-score-ring ${small ? 'fep-score-ring--small' : ''}`} style={{ background: `conic-gradient(#b8f2d1 ${score * 3.6}deg, rgba(255,255,255,.08) 0deg)` }}><div className="fep-score-ring__inside"><strong>{score}</strong><span>{label}</span></div></div>;
}

function Metric({ value, label, detail, tone = 'mint' }: { value: string; label: string; detail: string; tone?: string }) {
  return <div className={`fep-metric fep-tone-${tone}`}><div className="fep-metric__value">{value}</div><div className="fep-metric__label">{label}</div><div className="fep-metric__detail">{detail}</div></div>;
}

function SectionTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="fep-section-title"><div><span className="fep-eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>{action}</div>;
}

function SourceLink({ href, children = 'Resmî kaynak' }: { href: string; children?: React.ReactNode }) {
  return <a className="fep-source-link" href={href} target="_blank" rel="noreferrer">{children}<ExternalLink size={12} /></a>;
}

function Overview({ onNavigate, target }: { onNavigate: (view: View) => void; target: FestivalRecord | null }) {
  return <>
    <section className="fep-research-hero fep-card">
      <div><span className="fep-eyebrow">2016–2026 · KANITA DAYALI ARAŞTIRMA</span><h1>Dünyanın koro sahnelerinden<br/><em>Agora için tek karar masası.</em></h1><p>25 festival ailesi, resmî program/sonuç arşivleri ve Agora’nın Ohrid 2026 gerçek jüri formları birlikte okunuyor. Gerçek puanlar ile AI tahminleri arayüzde kesin biçimde ayrılır.</p><div className="fep-hero-actions"><button className="fep-primary-button" onClick={() => onNavigate('participations')}><Trophy size={17}/> Ohrid 2026 sonucumuz</button><button className="fep-secondary-button" onClick={() => onNavigate('festivals')}><Globe2 size={17}/> Festivalleri aç</button></div></div>
      <div className="fep-hero-stat"><span>{target ? 'SEÇİLEN FESTİVAL UYUMU' : 'ÖNCE FESTİVAL SEÇİN'}</span>{target ? <ScoreRing score={target.fit} label="simülasyon"/> : <div className="fep-empty-score"><Globe2 size={30}/><b>25</b><small>festival seçeneği</small></div>}<small>{target ? `${target.name} · ${target.country}` : 'Üst menüden veya festival atlasından hedef belirleyin.'}</small></div>
    </section>

    <section className="fep-metrics-grid">
      <Metric value="25" label="Festival ailesi" detail="Balkanlar · Avrupa · Asya · Amerika" tone="mint"/>
      <Metric value="1.200+" label="İndekslenen eser satırı" detail="212 okunabilir kayıt + resmî kitap indeksi" tone="blue"/>
      <Metric value="85,67" label="Agora · Ohrid 2026" detail="II. ödül · sahne özel diploması" tone="gold"/>
      <Metric value="3" label="Gerçek jüri formu" detail="21 ölçüt + el yazısı yorumlar" tone="rose"/>
    </section>

    <section className="fep-command-grid">
      <div className="fep-card fep-readiness-card">
        <div className="fep-card-heading"><div><span className="fep-eyebrow">AGORA VOICE · MEVCUT REPERTUVAR</span><h2>Hazır olan eserler</h2></div><span className="fep-status fep-status--warn"><AlertCircle size={14}/> 2 eser · ≈5:30</span></div>
        <div className="fep-storyline fep-storyline--current"><div className="fep-storyline__path"/>{agoraRepertoire.map((piece, index) => <div className="fep-story-piece" key={piece.title}><div className="fep-story-piece__number" style={{borderColor:piece.color}}>{index+1}</div><div className="fep-story-piece__energy" style={{height:`${Math.max(30,piece.energy)}px`,background:piece.color}}/><strong>{piece.title}</strong><span>{piece.role}</span></div>)}</div>
        <div className="fep-insight-strip"><Lightbulb size={18}/><p><b>Mevcut durum:</b> Program henüz tamamlanmadı. İki eser güçlü bir Türkçe kimlik çekirdeği oluşturuyor; sonraki eserler ancak hedef festival ve kategori seçildikten sonra dönem, teknik zorluk ve final ihtiyacına göre önerilmeli.</p></div>
      </div>
      <div className="fep-card fep-priority-card">
        <div className="fep-card-heading"><div><span className="fep-eyebrow">EN YÜKSEK KALDIRAÇ</span><h2>İki eseri iki ayrı dünyaya dönüştür</h2></div><div className="fep-priority-icon"><AlertCircle size={22}/></div></div>
        <p>İki eser de aynı düzenlemeciden. Pirlere’nin içe dönük modal/ritüel rengi ile İzmir’in Kavakları’nın açık, ritmik ve sahnesel karakteri belirgin biçimde ayrılmazsa repertuvar tek renkli duyulabilir.</p>
        <div className="fep-priority-actions"><div><Target size={16}/><span><b>2 ayrı tını</b> kayıtla doğrula</span></div><div><Users size={16}/><span><b>8/8/7/7</b> başlangıç dağılımı</span></div></div>
        <button className="fep-primary-button" onClick={() => onNavigate('preparation')}><Wand2 size={17}/> Hazırlık stüdyosunu aç</button>
      </div>
    </section>

    <section className="fep-card fep-evidence-band"><BookOpenText size={23}/><div><b>Kanıt sınırı</b><p>Yayımlanmış puan ve ödüller gerçek veri olarak gösterilir. Bireysel jüri notları çoğu festivalde kamuya açık değildir; kişiye atfedilen yorum uydurulmaz. “Simülasyon” etiketli puanlar, resmî kriterlere dayalı hazırlık senaryosudur.</p></div></section>
  </>;
}

function RepertoireView() {
  const [selected, setSelected] = useState(0);
  const piece = agoraRepertoire[selected];
  const labels = ['Entonasyon', 'Ritim', 'Kimlik', 'Sahne', 'Program'];
  return <>
    <SectionTitle eyebrow="REPERTUVAR LABORATUVARI" title="Mevcut iki eser: eser eser röntgen" description="Yalnızca hazır olan Pirlere Niyaz Ederiz ve İzmir’in Kavakları analiz edilir. Henüz seçilmemiş eserler repertuvara eklenmez." />
    <div className="fep-repertoire-layout">
      <div className="fep-card fep-piece-list"><div className="fep-list-toolbar"><span>Hazır repertuvar</span><b>2 eser · ≈5:30</b></div>{agoraRepertoire.map((p,i)=><button key={p.title} className={`fep-piece-row ${selected===i?'is-selected':''}`} onClick={()=>setSelected(i)}><span className="fep-piece-index">0{i+1}</span><span className="fep-piece-info"><strong>{p.title}</strong><small>{p.composer} · {p.role}</small></span><span className="fep-piece-meta"><b>{p.fit}</b><small>uyum</small></span><span className="fep-piece-time">{p.duration}</span></button>)}</div>
      <div className="fep-card fep-piece-analysis"><div className="fep-card-heading"><div><span className="fep-eyebrow">ESER RÖNTGENİ · SİMÜLASYON</span><h2>{piece.title}</h2><p className="fep-subtitle">{piece.composer} · {piece.role}</p></div><ScoreRing score={piece.fit} label="uyum" small/></div><div className="fep-risk-callout"><AlertCircle size={18}/><div><b>Başlıca risk</b><p>{piece.risk}</p></div></div><div className="fep-factor-grid">{piece.scores.map((score,i)=><div key={labels[i]}><span>{labels[i]}</span><b>{score}</b><div className="fep-progress"><i style={{width:`${score}%`}}/></div></div>)}</div><div className="fep-ai-note"><BrainCircuit size={22}/><div><b>Ölçülebilir prova reçetesi</b><p>{piece.prescription}</p></div></div></div>
    </div>
    <div className="fep-card fep-program-diagnosis"><div><span className="fep-eyebrow">REPERTUVAR DURUMU</span><h2>Kimlik çekirdeği hazır; yarışma programı henüz hazır değil</h2><p>Bu iki eser Agora’nın Türkçe ve İzmir merkezli karakterini gösteriyor. Ancak yalnızca bu ikisine bakarak açılış, teknik tepe, dönem kontrastı veya final kararı verilemez. Eksik yuvalar hedef festivalin süre, kategori ve zorunlu eser koşullarına göre doldurulmalı.</p></div><div className="fep-verdict-list"><span><b>+</b> Yerel kimlik</span><span><b>+</b> Metin bağı</span><span className="is-risk"><b>!</b> Teknik tepe eksik</span><span className="is-risk"><b>!</b> Dönem kontrastı eksik</span><span className="is-risk"><b>!</b> Final seçilmedi</span></div></div>
  </>;
}

function FestivalCard({ festival, selected, onSelect }: { festival: FestivalRecord; selected: boolean; onSelect: () => void }) {
  return <article className={`fep-card fep-festival-card ${selected?'is-featured':''}`}><div className="fep-festival-top"><span className="fep-festival-rank">{festival.region}</span><span className="fep-festival-status">{festival.name==='Ohrid Choir Festival'?'✓ Katıldık · 2026':festival.evidence}</span></div><div className="fep-festival-score">{festival.fit}<small>/100 Agora</small></div><h3>{festival.name}</h3><p>{festival.country} · {festival.year}</p><div className="fep-festival-tags"><span>{festival.scale}</span></div><b className="fep-card-winner">{festival.winner}</b><p className="fep-card-signal">{festival.signal}</p><div className="fep-card-actions"><button className="fep-secondary-button" onClick={onSelect}>{selected?'Dosyayı yeniden aç':'Festival dosyasını aç'} <ArrowRight size={14}/></button><SourceLink href={festival.source}/></div></article>;
}

function FestivalsView({ target, onTarget }: { target: FestivalRecord | null; onTarget: (festival: FestivalRecord) => void }) {
  const [query,setQuery]=useState('');
  const [region,setRegion]=useState('Tümü');
  const visible=useMemo(()=>festivals.filter(f=>(region==='Tümü'||f.region===region)&&`${f.name} ${f.country}`.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'))),[query,region]);
  return <>
    <SectionTitle eyebrow="1 · FESTİVALİ TANI" title="Bir festival seçin, tek sayfalık dosyasını açın" description="25 festival; tarihçe, prestij endeksi, kazananlar, repertuvar, jüri, kurallar ve Agora uygunluğu için ortak karşılaştırma diliyle listelenir." />
    <div className="fep-filterbar"><div className="fep-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Festival veya ülke ara"/></div>{['Tümü','Balkanlar','Avrupa','Asya-Pasifik','Amerika'].map(r=><button className={region===r?'is-active':''} key={r} onClick={()=>setRegion(r)}>{r}</button>)}</div>
    <div className={`fep-atlas-summary fep-card ${target?'':'is-empty'}`}>{target?<><div><span>SEÇİLEN FESTİVAL</span><h3>{target.name}</h3><p>{target.signal}</p></div><div><b>{target.fit}</b><span>Agora uyumu<br/><i>ön metrik</i></span></div><SourceLink href={target.source}>Kaynağı doğrula</SourceLink></>:<div><span>FESTİVAL SEÇİLMEDİ</span><h3>Aşağıdaki festivallerden birini seçin</h3><p>Seçiminiz tarihçe, prestij, kazananlar, repertuvar, jüri ve kuralların bulunduğu tek sayfalık dosyayı açar.</p></div>}</div>
    <div className="fep-festival-grid">{visible.map(f=><FestivalCard festival={f} selected={target?.name===f.name} onSelect={()=>onTarget(f)} key={f.name}/>)}</div>
    <section className="fep-card fep-sources"><div className="fep-card-heading"><div><span className="fep-eyebrow">ARAŞTIRMA KÜTÜPHANESİ</span><h2>Birincil kaynaklar</h2></div><span className="fep-muted-label">15 Eyl 2026 araştırma kesiti</span></div><div className="fep-source-grid">{researchSources.map(([name,desc,url])=><a href={url} target="_blank" rel="noreferrer" key={name}><span>{name}</span><p>{desc}</p><ExternalLink size={14}/></a>)}</div></section>
  </>;
}

function ArchiveView() {
  const [tab,setTab]=useState<'index'|'ohrid'|'global'|'scores'|'sources'>('index');
  const [query,setQuery]=useState('');
  const [competition,setCompetition]=useState('Tümü');
  const [category,setCategory]=useState('Tümü');
  const [page,setPage]=useState(1);
  const globalPrograms=[...worldPrograms,...internationalPrograms];
  const rows=tab==='ohrid'?ohridPrograms:globalPrograms;
  const needle=query.toLocaleLowerCase('tr').trim();
  const filtered=rows.filter(r=>JSON.stringify(r).toLocaleLowerCase('tr').includes(needle));
  const filteredScores=scoreResources.filter(r=>JSON.stringify(r).toLocaleLowerCase('tr').includes(needle));
  const filteredSources=programBookSources.filter(r=>JSON.stringify(r).toLocaleLowerCase('tr').includes(needle));
  const categories=useMemo(()=>Array.from(new Set(wcg2024WorkIndex.map(record=>record.category))).sort((a,b)=>a.localeCompare(b,'tr')),[]);
  const indexedWorks=useMemo(()=>wcg2024WorkIndex.filter(record=>{const haystack=`${record.title} ${record.composer} ${record.choir} ${record.conductor} ${record.country} ${record.location} ${record.category} ${record.competition}`.toLocaleLowerCase('tr');return haystack.includes(needle)&&(competition==='Tümü'||record.competition===competition)&&(category==='Tümü'||record.category===category)}),[needle,competition,category]);
  const pageSize=60;
  const pageCount=Math.max(1,Math.ceil(indexedWorks.length/pageSize));
  const pageRows=indexedWorks.slice((page-1)*pageSize,page*pageSize);
  useEffect(()=>setPage(1),[needle,competition,category,tab]);
  const findScore=(work:string)=>scoreResources.find(resource=>resource.matches.some(match=>work.toLocaleLowerCase('tr').includes(match)));
  const youtubeVideos: Record<string,string> = {
    'bogoroditse devo': 'https://www.youtube.com/watch?v=73uNuItb3gE',
    'baba yetu': 'https://www.youtube.com/watch?v=d4iOF4yoNQw',
    'lux aurumque': 'https://www.youtube.com/watch?v=D7o7BrlbaDs',
  };
  const findYoutube=(title:string,composer='')=>{
    const key=title.toLocaleLowerCase('tr');
    const direct=Object.entries(youtubeVideos).find(([match])=>key.includes(match));
    return direct ? { url: direct[1], label: 'Videoyu dinle' } : { url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${composer} choir`)}`, label: 'YouTube’da ara' };
  };
  return <>
    <SectionTitle eyebrow="KORO, ESER & NOTA ARŞİVİ" title="1.000’den fazla gerçek festival eseri" description="World Choir Games’in tam yarışma indeksi ile Ohrid, Sing for Gold, Kalamata ve European Choir Games programları birlikte aranır. Sonuçlar eser, besteci, koro, şef, ülke ve kategori düzeyindedir." />
    <section className="fep-archive-metrics"><Metric value="1.273" label="İşlenmiş eser satırı" detail="1.061 WCG + 125 dünya seçkisi + 87 Ohrid" tone="mint"/><Metric value="323" label="Program görünümü" detail="Koro ve kategori bazında" tone="blue"/><Metric value="219" label="WCG korosu" detail="Open + Champions yarışmaları" tone="gold"/><Metric value="49" label="Kategori kodu" detail="Çocuk, karma, kutsal, pop, folklor…" tone="rose"/></section>
    <div className="fep-tabbar fep-tabbar--archive"><button className={tab==='index'?'is-active':''} onClick={()=>setTab('index')}>Dünya eser indeksi · 1.061</button><button className={tab==='global'?'is-active':''} onClick={()=>setTab('global')}>Program seçkileri · 125</button><button className={tab==='ohrid'?'is-active':''} onClick={()=>setTab('ohrid')}>Ohrid GP · 87</button><button className={tab==='scores'?'is-active':''} onClick={()=>setTab('scores')}>Nota · 12</button><button className={tab==='sources'?'is-active':''} onClick={()=>setTab('sources')}>Kaynaklar</button><div className="fep-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Eser, besteci, koro, ülke veya şef ara"/></div></div>
    {tab==='index'&&<><div className="fep-index-controls"><div><span>YARIŞMA DÜZEYİ</span><select value={competition} onChange={e=>setCompetition(e.target.value)}><option>Tümü</option><option>Champions</option><option>Open</option></select></div><div><span>KATEGORİ</span><select value={category} onChange={e=>setCategory(e.target.value)}><option>Tümü</option>{categories.map(value=><option key={value}>{value}</option>)}</select></div><div className="fep-index-result"><b>{indexedWorks.length.toLocaleString('tr-TR')}</b><span>eşleşen eser</span></div><SourceLink href="https://www.interkultur.com/fileadmin/INTERKULTUR/Events/2024/Auckland/Information/CompetitionPrograms-WCG2024.pdf">Resmî 113 sayfalık program</SourceLink></div>{indexedWorks.length>0&&<><div className="fep-card fep-work-index"><div className="fep-work-index__head"><span>Eser / besteci</span><span>Koro / şef</span><span>Ülke</span><span>Yarışma</span><span>Dinle / nota</span></div>{pageRows.map(record=>{const score=findScore(`${record.title} — ${record.composer}`);const youtube=findYoutube(record.title,record.composer);return <div className="fep-work-index__row" key={record.id}><div><b>{record.title}</b><small>{record.composer}</small></div><div><b>{record.choir}</b><small>{record.conductor||'Şef bilgisi programda boş'}</small></div><span>{record.country}<small>{record.location}</small></span><em>{record.category}<small>{record.competition}</small></em><div className="fep-media-links"><a className={`fep-youtube-chip ${youtube.label==='Videoyu dinle'?'is-direct':''}`} href={youtube.url} target="_blank" rel="noreferrer"><Youtube size={12}/>{youtube.label}<ExternalLink size={10}/></a>{score?<a className="fep-score-chip" href={score.url} target="_blank" rel="noreferrer"><FileMusic size={12}/>{score.access}<ExternalLink size={10}/></a>:<small className="fep-score-pending">Nota bağlantısı yok</small>}</div></div>})}</div><div className="fep-pagination"><button disabled={page===1} onClick={()=>setPage(value=>Math.max(1,value-1))}><ArrowLeft size={13}/> Önceki</button><span><b>{page}</b> / {pageCount} · {(page-1)*pageSize+1}–{Math.min(page*pageSize,indexedWorks.length)}</span><button disabled={page===pageCount} onClick={()=>setPage(value=>Math.min(pageCount,value+1))}>Sonraki <ArrowRight size={13}/></button></div></>}{!indexedWorks.length&&<div className="fep-card fep-empty-archive"><Search size={28}/><h3>Bu aramayla eşleşen eser bulunamadı</h3><p>Eser, besteci, koro, ülke, şef veya kategoriyle yeniden deneyin.</p></div>}</>}
    {(tab==='ohrid'||tab==='global')&&<div className="fep-archive-list">{filtered.map((row:any)=><article className="fep-card fep-archive-row" key={`${row.festival||'Ohrid'}-${row.year}-${row.choir}-${row.category||'GP'}`}><div className="fep-archive-head"><span>{row.year}</span><div><h3>{row.choir}</h3><p>{row.country} · {row.festival||'Ohrid Choir Festival'}{row.category?` · ${row.category}`:' · Grand Prix'}{row.score?` · ${row.score} puan`:''}</p></div><b>{row.works.length} eser</b></div><ol>{row.works.map((work:string)=>{const score=findScore(work);const youtube=findYoutube(work);return <li key={work}><span>{work}</span><a className={`fep-youtube-chip ${youtube.label==='Videoyu dinle'?'is-direct':''}`} href={youtube.url} target="_blank" rel="noreferrer"><Youtube size={12}/>{youtube.label}<ExternalLink size={10}/></a>{score&&<a className="fep-score-chip" href={score.url} target="_blank" rel="noreferrer"><FileMusic size={12}/>{score.access}<ExternalLink size={10}/></a>}</li>})}</ol></article>)}</div>}
    {tab==='scores'&&<div className="fep-score-library">{filteredScores.map(resource=><article className="fep-card fep-score-resource" key={resource.title}><div className="fep-score-resource__icon"><FileMusic size={22}/></div><div><span>{resource.access}</span><h3>{resource.title}</h3><p>{resource.composer}</p></div><div className="fep-score-resource__meta"><b>{resource.format}</b><small>{resource.rights}</small></div><a href={resource.url} target="_blank" rel="noreferrer">Kaynağı aç <ExternalLink size={13}/></a></article>)}</div>}
    {tab==='sources'&&<div className="fep-program-books">{filteredSources.map(source=><article className="fep-card" key={`${source.festival}-${source.year}`}><div><span>{source.status}</span><b>{source.year}</b></div><h3>{source.festival}</h3><p>{source.scope}</p><SourceLink href={source.url}>Resmî belgeyi aç</SourceLink></article>)}</div>}
    {!filtered.length&&(tab==='ohrid'||tab==='global')&&<div className="fep-card fep-empty-archive"><Search size={28}/><h3>Bu aramayla eşleşen program bulunamadı</h3><p>Koro, ülke, eser veya besteci adıyla yeniden deneyin.</p></div>}
    <div className="fep-card fep-data-note"><ShieldCheck size={24}/><div><b>Nota erişimi ve telif sınırı</b><p>Kamu malı eserlerde CPDL/IMSLP gibi açık arşivler; çağdaş eserlerde bestecinin veya yayınevinin satın alma ve inceleme sayfası kullanılır. Platform telifli tam notaları kopyalamaz. Her indirmede ilgili edisyonun ülke, çoğaltma ve icra koşulları ayrıca doğrulanmalıdır.</p></div><SourceLink href="https://www.interkultur.com/program-books/">Dünya program arşivi</SourceLink></div>
  </>;
}

function ParticipationsView({ onPreparation }: { onPreparation: () => void }) {
  const record=ohrid2026Participation;
  const verified=ohrid2026Competitors.filter(c=>c.verified);
  return <>
    <section className="fep-participation-hero fep-card">
      <div><span className="fep-eyebrow">KATILDIĞIMIZ FESTİVALLER · 01</span><h1>Ohrid Choir Festival 2026</h1><p>{record.city} · {record.dates} · {record.category}</p><div className="fep-festival-tags"><span>Gerçek sonuç</span><span>3 jüri formu</span><span>2 diploma</span></div></div>
      <div className="fep-participation-awards"><div><Trophy size={20}/><span>YARIŞMA SONUCU</span><strong>{record.prize}</strong><b>{String(record.score).replace('.', ',')} / 100</b></div><div><Sparkles size={20}/><span>ÖZEL DİPLOMA</span><strong>En İyi Sahne</strong><b>Performansı</b></div></div>
    </section>

    <section className="fep-participation-metrics">
      <Metric value="91,00" label="Şeflik" detail="Jüri ortalaması · en güçlü ölçüt" tone="mint"/>
      <Metric value="90,67" label="Sahne performansı" detail="Özel diplomayla doğrulandı" tone="gold"/>
      <Metric value="83,33" label="Üslup yorumu" detail="En açık gelişim alanı" tone="rose"/>
      <Metric value="10,00" label="Puan farkı" detail="En yüksek yarışma puanı 95,33" tone="blue"/>
    </section>

    <section className="fep-card fep-score-evidence">
      <div className="fep-card-heading"><div><span className="fep-eyebrow">GERÇEK JÜRİ PUANLARI</span><h2>Üç form, yedi ölçüt, tek net teşhis</h2></div><span className="fep-status fep-status--good"><CheckCircle size={14}/> Belgeye dayalı</span></div>
      <div className="fep-score-matrix">
        <div className="fep-score-matrix__head"><span>Ölçüt</span>{record.juries.map(j=><b key={j.name}>{j.name.split(' ')[0]}</b>)}<strong>Ortalama</strong></div>
        {record.scoreLabels.map((label,index)=><div className={`fep-score-matrix__row ${index===6?'is-total':''}`} key={label}><span>{label}</span>{record.juries.map(j=><b key={j.name}>{j.scores[index]}</b>)}<strong>{record.scoreAverages[index].toFixed(2).replace('.', ',')}</strong><div className="fep-progress"><i style={{width:`${record.scoreAverages[index]}%`}}/></div></div>)}
      </div>
      <div className="fep-score-explainer"><Lightbulb size={18}/><p><b>85,67 nasıl oluştu?</b> Diploma puanı, üç jüri üyesinin “bütüncül sanatsal izlenim” notlarının ortalamasıyla tam olarak eşleşiyor: (86 + 86 + 85) / 3 = 85,67. Bu, eklerdeki formlardan çıkarılmış doğrulanabilir hesaplamadır.</p></div>
    </section>

    <section className="fep-jury-report-grid">
      {record.juries.map(j=><article className="fep-card fep-jury-report" key={j.name}><div className="fep-jury-report__head"><span>{j.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</span><div><h3>{j.name}</h3><p>{j.note}</p></div><b>{j.scores[6]}</b></div><p>{j.comment}</p><div className="fep-jury-mini"><span>Şeflik <b>{j.scores[4]}</b></span><span>Sahne <b>{j.scores[5]}</b></span><span>Üslup <b>{j.scores[3]}</b></span></div></article>)}
    </section>

    <section className="fep-card fep-participation-program">
      <div className="fep-card-heading"><div><span className="fep-eyebrow">OHRID 2026 · GEÇMİŞ PERFORMANS</span><h2>Agora’nın festivalde söylediği repertuvar</h2></div><span className="fep-status fep-status--warn"><AlertCircle size={14}/> Güncel repertuvar değildir</span></div>
      <p className="fep-method-note">Bu eserler tarihsel katılım kaydıdır. “Hazır repertuvar” alanında yalnız Pirlere Niyaz Ederiz ve İzmir’in Kavakları tutulmaya devam eder.</p>
      <div className="fep-historic-programs">{record.programs.map(program=><article key={program.category}><span>{program.category}</span><ol>{program.works.map(work=><li key={work}>{work}</li>)}</ol></article>)}</div>
    </section>

    <section className="fep-card fep-results-board">
      <div className="fep-card-heading"><div><span className="fep-eyebrow">2026 SONUÇ PANOSU</span><h2>Doğrulanabilen dereceler</h2></div><span className="fep-muted-label">Ödül sınıfları sıralama değil, puan bantlarıdır</span></div>
      <div className="fep-results-list">{verified.map((choir,index)=><div key={choir.choir} className={choir.choir==='Agora Voice'?'is-agora':''}><span>{String(index+1).padStart(2,'0')}</span><strong>{choir.choir}<small>{choir.country} · {choir.conductor}</small></strong><b>{choir.score??'GP'}</b><em>{choir.result}</em>{choir.source?<SourceLink href={choir.source}>Kaynak</SourceLink>:<span className="fep-document-source">Paylaşılan diploma</span>}</div>)}</div>
      <p className="fep-method-note">Grand Prix, final konseri kararıdır; en yüksek ham yarışma puanı ayrı bir sonuçtur. Gaudeamus Grand Prix’yi, Collegium Medicum ise 95,33 ile edisyonun en yüksek yarışma puanını almıştır.</p>
    </section>

    <section className="fep-card fep-competitor-archive">
      <div className="fep-card-heading"><div><span className="fep-eyebrow">RAKİP REPERTUVAR ARŞİVİ</span><h2>Paylaşılan 2026 koroları ve bütün eserler</h2></div><span className="fep-muted-label">{ohrid2026Competitors.length} koro · ekler + web doğrulaması</span></div>
      <div className="fep-competitor-details">{ohrid2026Competitors.map(choir=><details key={choir.choir} open={choir.choir==='Collegium Medicum Choir'||choir.choir==='Gaudeamus Choir of the Nysa Cultural Centre'}><summary><span>{choir.country.slice(0,2).toLocaleUpperCase('tr')}</span><strong>{choir.choir}<small>{choir.conductor}</small></strong><b>{choir.score??(choir.verified?'GP':'—')}</b><em className={choir.verified?'is-verified':''}>{choir.result}</em><ChevronDown size={16}/></summary><div>{choir.programs.length?choir.programs.map(program=><article key={program.category}><span>{program.category}</span><ul>{program.works.map(work=><li key={work}>{work}</li>)}</ul></article>):<p>Bu koro için repertuvar görseli paylaşılmadı; yalnız doğrulanan sonuç gösteriliyor.</p>}{choir.source&&<SourceLink href={choir.source}>Sonuç kaynağı</SourceLink>}</div></details>)}</div>
    </section>

    <section className="fep-card fep-fit-conclusion"><div><span className="fep-eyebrow">OHRID’DEN SONRAKİ STRATEJİ</span><h2>Sahne ve şeflik avantajını koru; repertuvar zorluğu ile üslup derinliğini yükselt</h2><p>Üç jüri aynı yönde sinyal veriyor: performans enerjisi güçlü, fakat bir sonraki yarışma programı özgün a cappella eser, daha yüksek teknik eşik ve daha doğal müzikal cümleleme içermeli.</p></div><button className="fep-primary-button" onClick={onPreparation}>Yeni festival hazırlığına geç <ArrowRight size={16}/></button></section>
  </>;
}

function FestivalDossierView({ target, onPreparation, onExplore }: { target: FestivalRecord | null; onPreparation: () => void; onExplore: () => void }) {
  if (!target) return <div className="fep-card fep-no-target"><Globe2 size={42}/><span className="fep-eyebrow">FESTİVAL DOSYASI</span><h1>Önce tanımak istediğiniz festivali seçin</h1><p>Festival seçildiğinde tarihçe, prestij endeksi, geçmiş kazananlar, repertuvar örnekleri, jüri kadrosu, kurallar ve Agora uygunluğu bu tek sayfada açılır.</p><button className="fep-primary-button" onClick={onExplore}>Festival keşfine git <ArrowRight size={16}/></button></div>;
  const founded=foundationYears[target.name];
  const prestige=prestigeIndex[target.name]??80;
  const rules=festivalRules[target.name]??[target.signal, 'Kategori, süre ve zorunlu eser koşulları başvuru yılının resmî belgesinden doğrulanmalıdır.'];
  const juries=festivalJuries[target.name]??[];
  const winnerRows=target.name==='Ohrid Choir Festival'
    ? ohridPrograms.slice(0,6).map(p=>({year:String(p.year),name:p.choir,country:p.country,score:'GP'}))
    : target.name==='World Choir Games'
      ? worldPrograms.slice(0,6).map(p=>({year:'2024',name:p.choir,country:p.country,score:p.score}))
      : target.name==='Tolosa Choral Contest'
        ? [{year:'2024',name:'Riga Cathedral Choir School',country:'Letonya',score:'95,20'},{year:'2022',name:'Sofia Chamber Choir',country:'Ukrayna',score:'GP'},{year:'2018',name:'Kamēr…',country:'Letonya',score:'50. yıl GP'}]
        : target.name==='Cork International Choral Festival'
          ? [{year:'2024',name:'Brigham Young University Singers',country:'ABD',score:'94,33'},{year:'2024',name:'Mt. SAC Chamber Singers',country:'ABD',score:'93,42'},{year:'2024',name:'Coralia',country:'Porto Riko',score:'91,22'}]
          : [{year:target.year,name:target.winner,country:target.country,score:'Yayımlanan sonuç'}];
  const programRows=target.name==='Ohrid Choir Festival' ? ohridPrograms.slice(0,4) : target.name==='World Choir Games' ? worldPrograms.slice(0,4) : [];
  const prestigeFactors=[['Tarihsel süre',Math.max(58,prestige-5)],['Uluslararası erişim',Math.min(99,prestige+2)],['Seçicilik',prestige],['Veri / jüri şeffaflığı',target.evidence==='Program + sonuç'?92:target.evidence==='Tam sonuç'?84:68]];
  return <>
    <section className="fep-dossier-hero fep-card"><div><span className="fep-eyebrow">FESTİVAL DOSYASI · {target.region}</span><h1>{target.name}</h1><p>{target.country} · İncelenen dönem {target.year}</p><div className="fep-festival-tags"><span>{target.evidence}</span><span>{target.scale}</span></div></div><div className="fep-dossier-actions"><SourceLink href={target.source}>Resmî dosyayı aç</SourceLink><button className="fep-primary-button" onClick={onPreparation}><Sparkles size={16}/> Hazırlığa geç</button></div></section>
    <section className="fep-dossier-metrics"><div className="fep-card"><small>GEÇMİŞ</small><b>{founded?`${2026-founded} yıl`:'Dönemsel arşiv'}</b><span>{founded?`${founded} başlangıç/ilk edisyon kaydı`:`Doğrulanan aralık: ${target.year}`}</span></div><div className="fep-card"><small>PRESTİJ ENDEKSİ</small><b>{prestige}<i>/100</i></b><span>Platform modeli · resmî festival puanı değil</span></div><div className="fep-card"><small>AGORA UYGUNLUĞU</small><b>{target.fit}<i>/100</i></b><span>2 hazır eser üzerinden ön değerlendirme</span></div><div className="fep-card"><small>ÖLÇEK</small><b className="is-text">{target.scale}</b><span>{target.region} · {target.country}</span></div></section>

    <section className="fep-dossier-grid"><div className="fep-card fep-dossier-block"><div className="fep-card-heading"><div><span className="fep-eyebrow">KİMLİK & PRESTİJ</span><h2>Bu festival neden önemli?</h2></div><span className="fep-simulation-label">AÇIKLANABİLİR ENDEKS</span></div><p className="fep-dossier-lead">{target.signal}. Prestij endeksi; tarihsel süre, uluslararası erişim, seçicilik ve yayımlanmış sonuç/jüri şeffaflığının ağırlıklı birleşimidir.</p><div className="fep-prestige-factors">{prestigeFactors.map(([label,value])=><div key={label as string}><span>{label}</span><b>{value}</b><div className="fep-progress"><i style={{width:`${value}%`}}/></div></div>)}</div></div><div className="fep-card fep-dossier-block"><div className="fep-card-heading"><div><span className="fep-eyebrow">KURALLAR & DİNLEME</span><h2>Başvurudan önce bilinmesi gerekenler</h2></div></div><ul className="fep-rule-list">{rules.map(rule=><li key={rule}><CheckCircle size={15}/><span>{rule}</span></li>)}</ul><SourceLink href={target.source}>Güncel koşulları doğrula</SourceLink></div></section>

    <section className="fep-card fep-dossier-block"><div className="fep-card-heading"><div><span className="fep-eyebrow">GEÇMİŞ KAZANANLAR</span><h2>Yayımlanmış sonuçlardan seçki</h2></div><span className="fep-muted-label">Puan yalnız kamuya açıksa gösterilir</span></div><div className="fep-winner-table">{winnerRows.map((w,i)=><div key={`${w.year}-${w.name}-${i}`}><span>{w.year}</span><strong>{w.name}</strong><small>{w.country}</small><b>{w.score}</b></div>)}</div></section>

    <section className="fep-dossier-grid"><div className="fep-card fep-dossier-block"><div className="fep-card-heading"><div><span className="fep-eyebrow">KAZANAN REPERTUVARLARI</span><h2>Program mimarisi</h2></div></div>{programRows.length?<div className="fep-program-samples">{programRows.map((p:any)=><article key={`${p.year||p.score}-${p.choir}`}><div><b>{p.year||p.score}</b><span>{p.choir} · {p.country}</span></div><p>{p.works.join(' · ')}</p></article>)}</div>:<div className="fep-public-gap"><BookOpenText size={28}/><h3>Detaylı eser listesi henüz veri tabanına işlenmedi</h3><p>Kazanan bilgisi doğrulandı; tam repertuvar için festivalin resmî program arşivi açılmalıdır.</p><SourceLink href={target.source}>Program arşivini kontrol et</SourceLink></div>}</div><div className="fep-card fep-dossier-block"><div className="fep-card-heading"><div><span className="fep-eyebrow">JÜRİ DOSYASI</span><h2>Kimler, hangi lenslerle dinliyor?</h2></div></div>{juries.length?<div className="fep-dossier-juries">{juries.map(name=>{const known=juryLenses.find(j=>j.name===name);return <div key={name}><span>{name.split(' ').map(w=>w[0]).slice(0,2).join('')}</span><div><b>{name}</b><small>{known?.focus??'Uluslararası jüri üyesi · uzmanlık ayrıntısı kaynak dosyasında'}</small></div></div>})}</div>:<div className="fep-public-gap"><ShieldCheck size={28}/><h3>Jüri kadrosu edisyona göre değişiyor</h3><p>Bu festival için isim bazlı jüri arşivi henüz doğrulanmadı. Platform kişi veya yorum uydurmaz.</p><SourceLink href={target.source}>Festival kaynağını aç</SourceLink></div>}</div></section>

    <section className="fep-card fep-fit-conclusion"><div><span className="fep-eyebrow">AGORA × {target.name.toLocaleUpperCase('tr')}</span><h2>{target.fit>=88?'Yüksek potansiyel; repertuvarı tamamlamadan karar verme':target.fit>=82?'Uygun aday; kategori ve eksik eser rolleri belirleyici':'Stratejik alternatif; hazırlık maliyetini dikkatle karşılaştır'}</h2><p>Uygunluk puanı şu an yalnızca Pirlere Niyaz Ederiz ve İzmir’in Kavakları üzerinden hesaplanan ön metriktir. Tam yarışma programı seçilmeden final tahmini değildir.</p></div><button className="fep-primary-button" onClick={onPreparation}>Festivale hazırlık modülünü aç <ArrowRight size={16}/></button></section>
  </>;
}

function PreparationView({ target, onTarget, onExplore }: { target: FestivalRecord | null; onTarget: (festival: FestivalRecord) => void; onExplore: () => void }) {
  const [tab,setTab]=useState<'repertoire'|'jury'|'choir'>('repertoire');
  if (!target) return <div className="fep-card fep-no-target"><Target size={42}/><span className="fep-eyebrow">FESTİVALE HAZIRLIK</span><h1>Hazırlık planı için önce festival seçin</h1><p>Süre, kategori, jüri lensi ve eksik repertuvar rolleri festivale göre değiştiği için hazırlık modülü hedef seçilmeden puan üretmez.</p><button className="fep-primary-button" onClick={onExplore}>Festival seç <ArrowRight size={16}/></button></div>;
  return <><div className="fep-prep-header"><div><span className="fep-eyebrow">AYRI MODÜL · FESTİVALE HAZIRLIK</span><h1>{target.name}</h1><p>Mevcut 2 eser · 30 kişilik koro · uygunluk {target.fit}/100 ön metriği</p></div><SourceLink href={target.source}>Festival koşulları</SourceLink></div><div className="fep-prep-tabs"><button className={tab==='repertoire'?'is-active':''} onClick={()=>setTab('repertoire')}><FileMusic size={16}/> Repertuvar ve eksikler</button><button className={tab==='jury'?'is-active':''} onClick={()=>setTab('jury')}><ShieldCheck size={16}/> Jüri simülasyonu</button><button className={tab==='choir'?'is-active':''} onClick={()=>setTab('choir')}><Users size={16}/> Koro ve çalışma planı</button></div>{tab==='repertoire'&&<RepertoireView/>}{tab==='jury'&&<JuryView target={target} onTarget={onTarget}/>} {tab==='choir'&&<ChoirView/>}</>;
}

function CompetitorsView() {
  return <>
    <SectionTitle eyebrow="RAKİP KIYASLAMA" title="Rakip değil, kazanmış program standardı" description="Gelecek edisyonun katılımcıları henüz kesin değil. Bu nedenle uydurma rakip listesi yerine geçmiş Ohrid Grand Prix kazananları benchmark olarak kullanılır." />
    <div className="fep-compare-banner fep-card"><div><span className="fep-eyebrow">AGORA’NIN MEVCUT ÇEKİRDEĞİ</span><h2>İki Türkçe eser hazır; uluslararası yarışma programı henüz tamamlanmadı</h2><p>Pirlere Niyaz Ederiz ve İzmir’in Kavakları yerel kimlik açısından güçlü bir başlangıç. Geçmiş kazanan programlar, mevcut eserimiz gibi gösterilmeden yalnızca eksik program rollerini anlamak için kullanılır.</p></div><div className="fep-compare-score"><strong>2</strong><span>hazır eser</span></div></div>
    <div className="fep-competitor-grid">{benchmarkChoirs.map(c=><article className="fep-card fep-competitor-card" key={c.name}><div className="fep-competitor-head"><div className="fep-avatar">{c.country.slice(0,2).toUpperCase()}</div><div><h3>{c.name}</h3><p>{c.country}</p></div></div><div className="fep-competitor-foot"><Trophy size={15}/>{c.result}</div><div className="fep-compare-point is-strength"><TrendingUp size={16}/><div><span>Kanıtlanan güçlü taraf</span><b>{c.advantage}</b></div></div><div className="fep-compare-point is-risk"><Target size={16}/><div><span>Agora için karşılığı</span><b>{c.implication}</b></div></div></article>)}</div>
    <div className="fep-card fep-attachment-reading"><div><span className="fep-eyebrow">EKTEKİ DÖRT KORO KARŞILAŞTIRMASI</span><h2>Agora’nın sahne gücü yüksek; yarışma ciddiyeti ve bütünlük açığı henüz açık</h2><p>Paylaşılan tabloda Agora; seyirci çekiciliğinde “çok yüksek”, bölgesel uyumda “güçlü” ve teknik seviye göstermede “orta-yüksek”. Program bütünlüğü “zayıf”, yarışma ciddiyeti ve olgun repertuvar izlenimi “orta”. Yalnız iki eser hazır olduğu için bu açık kapatılmış sayılmaz; sonraki eser seçimlerinin görevi tam olarak budur.</p></div><div className="fep-mini-matrix"><span><b>Çok yüksek</b>Seyirci çekiciliği</span><span><b>Güçlü</b>Bölgesel uyum</span><span className="is-risk"><b>Zayıf → hedef: güçlü</b>Program bütünlüğü</span><span className="is-risk"><b>Orta → hedef: yüksek</b>Yarışma ciddiyeti</span></div></div>
    <div className="fep-card fep-swot"><div className="fep-card-heading"><div><span className="fep-eyebrow">AGORA SWOT</span><h2>Karar özeti</h2></div><span className="fep-muted-label">2 hazır eser + tarihsel programlar</span></div><div className="fep-swot-grid"><div><b>GÜÇ</b><p>Özgün Türkçe kimlik; seyirciyle yüksek bağ; İzmir’e özgü karakter.</p></div><div><b>ZAYIFLIK</b><p>İki eserde aynı aranjör; program henüz kısa ve tek dönemli.</p></div><div><b>FIRSAT</b><p>Hedef festivale göre teknik tepe, kontrast ve final eserleri bilinçli seçilebilir.</p></div><div><b>TEHDİT</b><p>Erken program ilanı, henüz hazır olmayan eserleri gereksiz biçimde sabitleyebilir.</p></div></div></div>
  </>;
}

function JuryView({ target, onTarget }: { target: FestivalRecord | null; onTarget: (festival: FestivalRecord) => void }) {
  const [readiness,setReadiness]=useState(78);
  const profile=target ? getSimulatorProfile(target) : null;
  const base=profile ? Math.round(agoraRepertoire.reduce((sum,p)=>sum+p.scores.reduce((s,x,i)=>s+x*profile.weights[i]/100,0),0)/agoraRepertoire.length) : 0;
  const final=profile ? Math.round(base*.72+readiness*.28) : 0;
  const verdict=final>=90?'Altın/GP eşiği için güçlü prova profili':final>=84?'Ödül bandı; iki teknik riski kapat':'Program fikri iyi, icra güveni henüz dalgalı';
  return <>
    <SectionTitle eyebrow="JÜRİ SİMÜLATÖRÜ" title="Festival seç, dinleme lensini değiştir" description="Bu puan gerçek jüri kararı değildir. Resmî kriterlerin ağırlıkları ve Agora repertuvarının çalışma varsayımlarıyla hazırlık senaryosu üretir." />
    <div className="fep-simulator-grid">
      <div className="fep-card fep-sim-controls"><label>Uluslararası festival<select value={target?.name??''} onChange={e=>{const next=festivals.find(f=>f.name===e.target.value);if(next)onTarget(next)}}><option value="">Festival seçin…</option>{festivals.map(f=><option value={f.name} key={f.name}>{f.name} — {f.country}</option>)}</select></label><label>Bugünkü icra güveni <b>{readiness}%</b><input type="range" min="55" max="98" value={readiness} onChange={e=>setReadiness(Number(e.target.value))}/></label>{profile?<div className="fep-weight-list">{['Entonasyon','Ritim','Kimlik','Sahne','Program'].map((l,i)=><div key={l}><span>{l}</span><b>{profile.weights[i]}%</b><div className="fep-progress"><i style={{width:`${profile.weights[i]*4}%`}}/></div></div>)}</div>:<div className="fep-sim-empty"><Globe2 size={24}/><p>Dinleme ağırlıklarını görmek için 25 festivalden birini seçin.</p></div>}</div>
      {profile&&target?<div className="fep-card fep-sim-result"><span className="fep-simulation-label"><BrainCircuit size={14}/> AI SİMÜLASYONU · GERÇEK PUAN DEĞİL</span><ScoreRing score={final} label="senaryo"/><h2>{verdict}</h2><p><b>{target.name} · {profile.label}:</b> {profile.caution}</p><div className="fep-jury-comment"><span>Jüri masası provası</span><p>“Programın neden bu sırada olduğunu ilk 60 saniyede hissettirin; kategori koşullarını repertuvar güzelliğinden önce doğrulayın ve festivalin karakterini her eserde duyurun.”</p><small>Bu metin hiçbir gerçek jüri üyesine ait değildir; prova için üretilmiştir.</small></div></div>:<div className="fep-card fep-sim-placeholder"><Target size={34}/><h2>Simülasyon için hedef bekleniyor</h2><p>Festival seçildiğinde Agora uyumu, dinleme ağırlıkları ve prova uyarıları burada hesaplanır.</p></div>}
    </div>
    <section className="fep-card fep-jury-reality"><div className="fep-card-heading"><div><span className="fep-eyebrow">DOĞRULANMIŞ JÜRİ UZMANLIKLARI</span><h2>Kişi değil, uzmanlık lensi</h2></div><span className="fep-status fep-status--warn">Kişisel notlar çoğunlukla kapalı</span></div><div className="fep-jury-grid">{juryLenses.map(j=><a href={j.source} target="_blank" rel="noreferrer" key={j.name}><span>{j.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</span><div><b>{j.name}</b><p>{j.focus}</p></div><ExternalLink size={13}/></a>)}</div><p className="fep-method-note">Tokyo final puanı: her jüri için 4 teknik ölçütün ortalaması (TES) ile sanatsal izlenimin (AIS) ortalaması; 7 puanın en yükseği ve en düşüğü çıkarılıp kalan 5 puan ortalanır. Busan ve Tokyo kısa yorumları koroya özel olarak iletir; kamuya açık bireysel not bulunmadığında platform yorum atfetmez. <SourceLink href="https://www.ticctokyo.icot.or.jp/regulations">Tokyo yöntemi</SourceLink></p></section>
  </>;
}

function ChoirView() {
  const weeks=[
    ['1–2','Mevcut durum kaydı','Ses yerleşimi ve bireysel aralık testi; yalnız iki hazır eserin baz kaydı.','İki eserde %90 doğru nota · devamsızlık planı'],
    ['3–4','Pirlere derinliği','Modal merkez, ostinato, metin birliği; S/A ve T/B ayrı kayıt.','Ostinato sabit · cümle sonlarında perde korunumu'],
    ['5–6','İzmir karakteri','Ritmik açıklık, Türkçe artikülasyon ve sahne enerjisi; Pirlere’den tını ayrımı.','Kör dinleyici iki karakteri açıkça ayırabiliyor'],
    ['7–8','Festival ve eksik rol seçimi','Hedef festival şartlarını doğrula; teknik tepe, dönem kontrastı ve final için aday havuzu çıkar.','Aday eserler sadece okunur; repertuvara eklenmiş sayılmaz'],
    ['9–10','Aday eser denemeleri','Koronun tessitura ve öğrenme hızını kısa okuma kayıtlarıyla ölç.','Şef kararı öncesi uygulanabilirlik raporu'],
    ['11','İki eserlik baskı provası','Tek hak, kıyafet, ışık ve video; mevcut iki eseri kesintisiz kaydet.','İki eser de ayrı tını ve güvenli tempo gösteriyor'],
    ['12','Seçim kapısı','Kayıtları ve festival kriterlerini birlikte değerlendir; yeni eser ekleme kararını ver.','Hazır olmayan hiçbir eser yarışma programı diye ilan edilmez'],
  ];
  return <>
    <SectionTitle eyebrow="30 KİŞİLİK KORO HAZIRLIĞI" title="Sayıdan sese: 12 haftalık işletim sistemi" description="Başlangıç varsayımı 8 soprano, 8 alto, 7 tenor, 7 bas. Şef, gerçek tessitura ve kişisel devamlılık verisine göre dağılımı değiştirmeli." />
    <div className="fep-metrics-grid"><Metric value="8 / 8" label="Soprano · Alto" detail="İç ses köprüsü: A1/S2" tone="rose"/><Metric value="7 / 7" label="Tenor · Bas" detail="En az 3 güçlü T1, 3 düşük bas" tone="blue"/><Metric value="3" label="Kritik yedek" detail="T1 · B2 · S1 lider" tone="gold"/><Metric value="90 dk" label="Haftalık ortak kayıt" detail="Bölüm provasına ek" tone="mint"/></div>
    <div className="fep-card fep-capacity-table"><div className="fep-card-heading"><div><span className="fep-eyebrow">SES GRUBU MATRİSİ</span><h2>Mevcut varsayım × hazırlık × eser yükü</h2></div><span className="fep-simulation-label">DÜZENLENEBİLİR BAŞLANGIÇ</span></div><div className="fep-table-head"><span>Ses grubu</span><span>Kişi</span><span>Hazır oluş</span><span>En ağır görev</span><span>Risk</span></div>{voiceParts.map(p=><div className="fep-table-row" key={p.label}><div><i style={{background:p.color}}/><b>{p.label}</b></div><div><strong>{p.current}</strong><span> / 30</span></div><div className="fep-table-progress"><div className="fep-progress"><i style={{width:`${p.readiness}%`,background:p.color}}/></div><b>{p.readiness}%</b></div><div>{p.load}</div><div><span className={`fep-risk-pill ${p.readiness<77?'is-high':p.readiness<82?'is-mid':''}`}>{p.readiness<77?'Yüksek':p.readiness<82?'Orta':'Düşük'}</span></div></div>)}</div>
    <section className="fep-card fep-plan"><div className="fep-card-heading"><div><span className="fep-eyebrow">12 HAFTALIK PLAN</span><h2>Her fazın işi ve geçiş kriteri</h2></div></div><div className="fep-plan-list">{weeks.map(([week,title,work,gate])=><article key={week}><span>{week}</span><div><h3>{title}</h3><p>{work}</p></div><div><small>GEÇİŞ KAPISI</small><b>{gate}</b></div></article>)}</div></section>
  </>;
}

function JuryArchiveView() {
  const [query,setQuery]=useState('');
  const [festival,setFestival]=useState('Tümü');
  const visible=useMemo(()=>juryDirectory.filter(j=>{
    const haystack=`${j.name} ${j.country} ${j.expertise} ${j.criteria.join(' ')} ${j.comment} ${j.festivals.join(' ')}`.toLocaleLowerCase('tr');
    return (festival==='Tümü'||j.festivals.includes(festival))&&haystack.includes(query.toLocaleLowerCase('tr').trim());
  }),[query,festival]);
  const festivalNames=useMemo(()=>Array.from(new Set(juryDirectory.flatMap(j=>j.festivals))).sort((a,b)=>a.localeCompare(b,'tr')),[ ]);
  const realComments=juryDirectory.filter(j=>j.evidence==='Gerçek jüri formu').length;
  return <>
    <SectionTitle eyebrow="JÜRİ ÖZEL LİSTESİ" title="Kim neyi dinliyor, neye puan veriyor?" description="Resmî jüri biyografileri, yayımlanmış festival kriterleri ve Agora’nın Ohrid 2026 formlarından oluşan ayrı jüri arşivi. Bireysel yorum yayımlanmayan yerlerde yalnız doğrulanmış uzmanlık ve ölçüt özeti gösterilir." />
    <section className="fep-archive-metrics"><Metric value={`${juryDirectory.length}`} label="İsim bazlı jüri kaydı" detail="WCG · Tokyo · Tolosa · Ohrid" tone="mint"/><Metric value={`${festivalNames.length}`} label="Festival ailesi" detail="Resmî panel ve kriter arşivi" tone="blue"/><Metric value="7" label="Tekrarlanan ölçüt" detail="Entonasyon · ritim · blend · sahne…" tone="gold"/><Metric value={`${realComments}`} label="Gerçek yorum formu" detail="Agora Ohrid 2026 belgeleri" tone="rose"/></section>
    <div className="fep-jury-filterbar"><div className="fep-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Jüri, ülke, uzmanlık veya ölçüt ara"/></div><select value={festival} onChange={e=>setFestival(e.target.value)}><option>Tümü</option>{festivalNames.map(name=><option key={name}>{name}</option>)}</select><span><b>{visible.length}</b> kayıt gösteriliyor</span></div>
    <div className="fep-jury-directory">{visible.map(j=><article className="fep-card fep-jury-directory-card" key={`${j.name}-${j.festivals.join('-')}`}><div className="fep-jury-directory-card__head"><span>{j.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</span><div><h3>{j.name}</h3><p>{j.country} · {j.festivals.join(' · ')}</p></div><em className={j.evidence==='Gerçek jüri formu'?'is-real':''}>{j.evidence}</em></div><div className="fep-jury-expertise"><span>UZMANLIK</span><b>{j.expertise}</b></div><div className="fep-jury-criteria"><span>DİKKAT ETTİKLERİ</span><div>{j.criteria.map(c=><i key={c}>{c}</i>)}</div></div><div className={`fep-jury-comment-box ${j.evidence==='Gerçek jüri formu'?'is-real':''}`}><span>{j.evidence==='Gerçek jüri formu'?'FORMDAN OKUNAN YORUM':'KAMUYA AÇIK KRİTER / UZMANLIK ÖZETİ'}</span><p>{j.comment}</p></div><SourceLink href={j.source}>Kaynağı doğrula</SourceLink></article>)}</div>
    {!visible.length&&<div className="fep-card fep-empty-archive"><Search size={28}/><h3>Bu aramayla eşleşen jüri bulunamadı</h3><p>İsim, festival, ülke veya ölçütle yeniden deneyin.</p></div>}
    <section className="fep-card fep-jury-method-note"><ShieldCheck size={21}/><div><b>Yorum güveni nasıl okunmalı?</b><p>“Gerçek jüri formu” yalnız Agora’nın paylaştığı Ohrid 2026 formlarındaki okunabilen notları ifade eder. Diğer satırlar, festivalin yayımladığı jüri biyografisi ve değerlendirme yönteminden çıkarılan hazırlık lensidir; gerçek puan veya kişisel yorum değildir.</p></div><SourceLink href="https://www.ticctokyo.icot.or.jp/regulations">Tokyo puanlama yöntemi</SourceLink></section>
  </>;
}

function FestivalWorkspace({ onLogout }: { onLogout: () => void }) {
  const [view,setView]=useState<View>('festivals');
  const [mobileOpen,setMobileOpen]=useState(false);
  const [assistantOpen,setAssistantOpen]=useState(false);
  const [target,setTarget]=useState<FestivalRecord|null>(null);
  const current=navItems.find(n=>n.id===view)!;
  useEffect(()=>{const old=document.title;document.title='Festival Intelligence · Agora Voice';return()=>{document.title=old}},[]);
  const navigate=(next:View)=>{setView(next);setMobileOpen(false);window.scrollTo({top:0,behavior:'smooth'})};
  const openDossier=(festival:FestivalRecord)=>{setTarget(festival);navigate('dossier')};
  return <div className="fep-shell">
    <aside className={`fep-sidebar ${mobileOpen?'is-open':''}`}><div className="fep-brand"><img src="/agora.png" alt="Agora Voice"/><div><strong>Agora Voice</strong><span>Festival Intelligence</span></div><button className="fep-sidebar-close" onClick={()=>setMobileOpen(false)}><X size={20}/></button></div><div className="fep-workspace-label">ARAŞTIRMA & HAZIRLIK</div><nav>{navItems.map(item=>{const Icon=item.icon;return <button key={item.id} className={view===item.id?'is-active':''} onClick={()=>navigate(item.id)}><Icon size={18}/><span>{item.label}</span>{view===item.id&&<i/>}</button>})}</nav><div className="fep-sidebar-project"><div className="fep-project-icon"><Music2 size={20}/></div><div><span>AKTİF SENARYO</span><b>{target?target.name:'Festival seçilmedi'}</b><small>30 korist · 2 hazır eser</small></div><ChevronDown size={16}/></div><div className="fep-sidebar-meter"><div><span>Veri güveni</span><b>kaynaklı</b></div><div className="fep-progress"><i style={{width:'88%'}}/></div><small>Kamuya kapalı jüri notları simüle edilir</small></div><a href="/" className="fep-back-link"><ArrowLeft size={17}/> Ana siteye dön</a></aside>
    {mobileOpen&&<button className="fep-overlay" onClick={()=>setMobileOpen(false)}/>}
    <main className="fep-main"><header className="fep-topbar"><button className="fep-mobile-menu" onClick={()=>setMobileOpen(true)}><Menu size={22}/></button><div className="fep-breadcrumb"><span>Festival Intelligence</span><i>/</i><strong>{current.label}</strong></div><div className="fep-top-actions"><div className="fep-research-badge"><CheckCircle size={15}/> 2008–2026 araştırma kesiti</div><div className="fep-user"><span>AV</span><div><b>Agora Voice</b><small>Şef çalışma alanı</small></div></div><button className="fep-logout" onClick={onLogout} aria-label="Güvenli çıkış" title="Güvenli çıkış"><LogOut size={17}/></button></div></header><div className="fep-contextbar"><div><span className="fep-context-icon"><Target size={20}/></span><label className="fep-target-picker"><small>FESTİVAL SEÇ · 25 DOSYA</small><select value={target?.name??''} onChange={e=>{const next=festivals.find(f=>f.name===e.target.value);if(next)openDossier(next);else{setTarget(null);navigate('festivals')}}}><option value="">Festival seçin…</option>{festivals.map(f=><option value={f.name} key={f.name}>{f.name} — {f.country}</option>)}</select></label></div><div className="fep-context-meta"><span><BookOpenText size={16}/> {target?'Festival dosyası açık':'Önce festivali tanı'}</span><span><Users size={16}/> Agora · 2 hazır eser</span><span className="fep-context-ready"><CheckCircle size={16}/> {view==='preparation'?'Hazırlık modu':view==='participations'?'Gerçek sonuç modu':'Araştırma modu'}</span></div></div><div className="fep-content">{view==='festivals'&&<FestivalsView target={target} onTarget={openDossier}/>} {view==='dossier'&&<FestivalDossierView target={target} onPreparation={()=>navigate('preparation')} onExplore={()=>navigate('festivals')}/>} {view==='participations'&&<ParticipationsView onPreparation={()=>{setTarget(festivals[0]);navigate('preparation')}}/>} {view==='archive'&&<ArchiveView/>} {view==='juries'&&<JuryArchiveView/>} {view==='preparation'&&<PreparationView target={target} onTarget={setTarget} onExplore={()=>navigate('festivals')}/>}</div></main>
    <button className="fep-ai-fab" onClick={()=>setAssistantOpen(!assistantOpen)}><BrainCircuit size={21}/><span>Festival AI</span></button>{assistantOpen&&<div className="fep-ai-panel"><div className="fep-ai-panel__head"><div><Sparkles size={18}/><b>Festival AI</b></div><button onClick={()=>setAssistantOpen(false)}><X size={18}/></button></div><div className="fep-ai-message"><BrainCircuit size={19}/><p>{target?`${target.name} dosyası hazır. Önce tarihçe, kazananlar, repertuvar ve jüri verisini okuyun; sonra hazırlık modülüne geçin.`:'Önce 25 uluslararası festival arasından birini seçin. Platform festival dosyasını tek sayfada açacak.'}</p></div><div className="fep-ai-chips"><button onClick={()=>navigate('festivals')}>Festival seç</button><button onClick={()=>navigate('participations')}>Ohrid 2026 sonucumuz</button><button onClick={()=>navigate('dossier')}>Festival dosyası</button><button onClick={()=>navigate('preparation')}>Hazırlığa geç</button></div><small>Prestij ve uygunluk değerleri platform metriğidir; resmî festival puanı değildir.</small></div>}
  </div>;
}

export default function FestivalPlanner() {
  const [access,setAccess]=useState<'checking'|'locked'|'granted'>('checking');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [submitting,setSubmitting]=useState(false);
  useEffect(()=>{let active=true;fetch('/api/festival-auth/status',{credentials:'same-origin'}).then(r=>r.json()).then(data=>{if(active)setAccess(data.ok?'granted':'locked')}).catch(()=>{if(active)setAccess('locked')});return()=>{active=false}},[]);
  const login=async(event:React.FormEvent)=>{event.preventDefault();setSubmitting(true);setError('');try{const response=await fetch('/api/festival-auth/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({password})});if(!response.ok){setError(response.status===503?'Giriş koruması henüz yapılandırılmadı.':'Şifre doğru değil. Lütfen yeniden deneyin.');return}setPassword('');setAccess('granted')}catch{setError('Giriş servisine ulaşılamadı. Lütfen bağlantıyı kontrol edin.')}finally{setSubmitting(false)}};
  const logout=async()=>{try{await fetch('/api/festival-auth/logout',{method:'POST',credentials:'same-origin'})}finally{setAccess('locked')}};
  if(access==='checking')return <div className="fep-gate"><div className="fep-gate__card"><div className="fep-gate__mark"><LockKeyhole size={24}/></div><span>FESTIVAL INTELLIGENCE</span><h1>Güvenli çalışma alanı açılıyor</h1><div className="fep-gate__loading"/></div></div>;
  if(access==='locked')return <div className="fep-gate"><form className="fep-gate__card" onSubmit={login}><img src="/agora.png" alt="Agora Voice"/><span>AGORA VOICE · ÖZEL ÇALIŞMA ALANI</span><h1>Festival Intelligence</h1><p>Festival araştırması, jüri notları ve koro hazırlık kayıtlarına erişmek için şifrenizi girin.</p><label htmlFor="festival-password">Erişim şifresi</label><div className="fep-gate__input"><LockKeyhole size={18}/><input id="festival-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" autoFocus placeholder="Şifrenizi yazın"/></div>{error&&<div className="fep-gate__error"><AlertCircle size={15}/>{error}</div>}<button type="submit" disabled={submitting||!password}>{submitting?'Kontrol ediliyor…':'Çalışma alanını aç'}<ArrowRight size={17}/></button><small>Bu bölüm herkese açık ana siteden ayrıdır. Oturum 8 saat sonra kapanır.</small></form></div>;
  return <FestivalWorkspace onLogout={logout}/>;
}
