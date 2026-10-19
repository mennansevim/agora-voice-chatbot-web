export type Stop = {
  date: string;
  title: string;
  place: string;
  // Her öğe ayrı bir paragraf olarak gösterilir.
  text: string[];
  image?: string;
  focus?: string;
  awards?: string[];
  // Eser künyesi (şef, düzenleme, solist…) — kartta küçük bir liste olarak gösterilir.
  credits?: { role: string; name: string }[];
  // Seslendirilen eserler.
  program?: string[];
  // İngilizce karşılıklar — verilmeyen alanlar Türkçe hâliyle gösterilir.
  en?: Partial<Omit<Stop, 'en' | 'image' | 'focus'>>;
};

// Yolculuğumuz — yeni durak eklemek için listeye bir kayıt eklemek yeterli.
// Metinler Instagram paylaşımlarımızdan alınmıştır. `image` yoksa kartta markaya
// uygun bir yer tutucu gösterilir.
export const STOPS: Stop[] = [
  {
    date: 'Temmuz 2025',
    title: 'Aziz Helena Kilisesi',
    place: 'İzmir',
    text: [
      'Kuruluşumuzun ilk yılında Aziz Helena’nın tarihî atmosferinde dinleyicilerimizle buluştuk. Çok sesli yolculuğumuzun ilk durağı.',
    ],
    image: '/journey/aziz-helena-2025.jpg',
    focus: 'center 62%',
    en: {
      date: 'July 2025',
      title: 'Church of St. Helena',
      text: [
        'In our founding year, we met our audience in the historic atmosphere of St. Helena. The first stop of our polyphonic journey.',
      ],
    },
  },
  {
    date: 'Mayıs 2026',
    title: 'Aziz Vukolos Kilisesi',
    place: 'İzmir',
    text: [
      'Agora Voice olarak yolculuğumuza, İzmir’in ruhunu taşıyan Aziz Vukolos Kilisesi’nin büyüleyici atmosferinde “merhaba” dedik. Yüzyıllardır pek çok sese ev sahipliği yapmış bu tarihî mekânda, bizim seslerimizin yankılanması tarif edilemez bir gururdu.',
      'İlk konserimizde bizi yalnız bırakmayan, alkışlarıyla heyecanımıza ortak olan tüm dinleyicilerimize sonsuz teşekkürler. Bu sadece bir başlangıç; daha nice şarkılarda, farklı mekânlarda buluşmak dileğiyle! ✨',
    ],
    image: '/journey/aziz-vukolos-2026.jpg',
    focus: 'center 45%',
    credits: [
      { role: 'Eser', name: 'İzmir’in Kavakları' },
      { role: 'Şef', name: 'Özlem Varışlı Atçeken' },
      { role: 'Düzenleme', name: 'Rıza Atçeken' },
      { role: 'Zeybek', name: 'Engin Yümlü (Tenor)' },
    ],
    en: {
      date: 'May 2026',
      title: 'Church of St. Voukolos',
      text: [
        'As Agora Voice, we said “hello” in the enchanting atmosphere of the Church of St. Voukolos, which carries the spirit of Izmir. Hearing our voices echo in this historic venue, home to so many voices for centuries, was an indescribable source of pride.',
        'Endless thanks to everyone who joined us at our first concert and shared our excitement with their applause. This is only the beginning — we hope to meet again with many more songs, in many more places! ✨',
      ],
      credits: [
        { role: 'Work', name: 'İzmir’in Kavakları' },
        { role: 'Conductor', name: 'Özlem Varışlı Atçeken' },
        { role: 'Arrangement', name: 'Rıza Atçeken' },
        { role: 'Zeybek', name: 'Engin Yümlü (Tenor)' },
      ],
    },
  },
  {
    date: 'Mayıs 2026',
    title: 'İzmir Uluslararası Çoksesli Korolar Festivali',
    place: 'Ahmed Adnan Saygun Sanat Merkezi · İzmir',
    text: [
      'AASSM sahnesinde yurt içinden ve yurt dışından korolarla aynı festivali paylaştık. İzmir Uluslararası Çoksesli Korolar Festivali performansımız “Müzikalite ve Müzikal Dinamiklerde Başarı” ödülüne layık görüldü.',
      'Seslendirdiğimiz eserlerin tamamını çok yakında YouTube sayfamızda sizlerle buluşturacağız. Takipte kalın!',
    ],
    image: '/journey/izmir-aassm-2026.jpg',
    focus: 'center 65%',
    awards: ['Müzikalite ve Müzikal Dinamiklerde Başarı Ödülü'],
    program: [
      'Signore Delle Cime — Giuseppe De Marzi',
      'Quizas Quizas Quizas — Osvaldo Farrés (düz. Jose L. Blasco)',
      'Pirlere Niyaz Ederiz — düz. Rıza Atçeken',
      'Let It Be — John Lennon / Paul McCartney (düz. Jose L. Blasco Diez)',
      'Siyahamba — Güney Afrika özgürlük şarkısı',
    ],
    en: {
      date: 'May 2026',
      title: 'Izmir International Polyphonic Choirs Festival',
      place: 'Ahmed Adnan Saygun Arts Center · Izmir',
      text: [
        'We shared the AASSM stage with choirs from Türkiye and abroad. Our performance at the Izmir International Polyphonic Choirs Festival received the “Achievement in Musicality and Musical Dynamics” award.',
        'All the works we performed will soon be on our YouTube channel. Stay tuned!',
      ],
      awards: ['Award for Achievement in Musicality and Musical Dynamics'],
      program: [
        'Signore Delle Cime — Giuseppe De Marzi',
        'Quizas Quizas Quizas — Osvaldo Farrés (arr. Jose L. Blasco)',
        'Pirlere Niyaz Ederiz — arr. Rıza Atçeken',
        'Let It Be — John Lennon / Paul McCartney (arr. Jose L. Blasco Diez)',
        'Siyahamba — South African freedom song',
      ],
    },
  },
  {
    date: 'Temmuz 2026',
    title: 'Çanakkale Uluslararası Koro Festivali',
    place: 'Çanakkale',
    text: [
      'Çanakkale Uluslararası Koro Festivali 2026’da iki ödül almaya hak kazandık. Repertuvar seçimi, sahne sunumu, entonasyon, ses bütünlüğü ve homojenliği, ritmik yapı ve ses dengesi alanlarındaki başarımızla Genel ve Teknik İzlenim Başarı Ödülü’nü; çalgı eşlikli eser icramızla da Mükemmellik Ödülü’nü kazandık.',
      'Birlikte ürettiğimiz, çalıştığımız ve aynı heyecanla ses verdiğimiz bu yolculuğun iki güzel ödülle taçlanmasından büyük mutluluk ve gurur duyuyoruz. Müziğe, çok sesliliğe ve birlikte söylemeye devam! 💙',
    ],
    image: '/journey/canakkale-2026.jpg',
    focus: 'center 58%',
    awards: [
      'Koro Eserlerini Yorumlamada Genel ve Teknik İzlenim Başarı Ödülü',
      'Çalgı Eşlikli Koro Eseri İcrasında Mükemmellik Ödülü',
    ],
    en: {
      date: 'July 2026',
      title: 'Çanakkale International Choir Festival',
      text: [
        'We earned two awards at the Çanakkale International Choir Festival 2026: the General and Technical Impression Achievement Award for our repertoire choice, stage presentation, intonation, vocal unity and homogeneity, rhythmic structure and balance; and the Excellence Award for our performance of an accompanied work.',
        'We are delighted and proud to see this journey — built, rehearsed and sung together with the same excitement — crowned with two beautiful awards. Here’s to music, polyphony and singing together! 💙',
      ],
      awards: [
        'General and Technical Impression Achievement Award in Choral Interpretation',
        'Excellence Award in Accompanied Choral Performance',
      ],
    },
  },
  {
    date: 'Ağustos 2026',
    title: 'Ohrid Choir Festival',
    place: 'Ohrid · Kuzey Makedonya',
    text: [
      'Kuzey Makedonya’dan alın terimizle kazandığımız iki güzel ödülle döndük! Ohrid Choir Festival 2026’da yarışmayı 85,67 puanla ikinci tamamladık ve En İyi Sahne Performansı Özel Ödülü’nü kazandık.',
      'Aylar süren çalışmanın, emeğin, disiplinin ve birlikte üretmenin karşılığını almanın gururunu yaşıyoruz. Festival boyunca müziğimizi paylaşmak, farklı ülkelerden korolarla aynı sahnede buluşmak ve ülkemizi temsil etmek bizim için çok değerliydi.',
      'Bu organizasyonda desteğini bizden esirgemeyen ana sponsorumuz Commencis’e gönülden teşekkür ederiz. 🙏',
    ],
    image: '/journey/ohrid-2026.jpg',
    focus: 'center 55%',
    awards: ['II. Ödül · 85,67 puan', 'En İyi Sahne Performansı Özel Ödülü'],
    en: {
      date: 'August 2026',
      place: 'Ohrid · North Macedonia',
      text: [
        'We came back from North Macedonia with two hard-earned awards! At the Ohrid Choir Festival 2026 we finished second in the competition with 85.67 points and won the Special Award for Best Stage Performance.',
        'We are proud to see months of work, effort, discipline and collaboration pay off. Sharing our music throughout the festival, meeting choirs from many countries on the same stage and representing our country meant a great deal to us.',
        'Our heartfelt thanks to our main sponsor Commencis for their generous support. 🙏',
      ],
      awards: ['2nd Prize · 85.67 points', 'Special Award for Best Stage Performance'],
    },
  },
];

// Seçili dile göre durak — İngilizce alan yoksa Türkçesine düşer.
export const localizeStop = (stop: Stop, lang: 'tr' | 'en'): Stop => (lang === 'en' && stop.en ? { ...stop, ...stop.en } : stop);

export const journeyStops = (lang: 'tr' | 'en') => STOPS.map((s) => localizeStop(s, lang).title);
