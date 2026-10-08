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
  },
];

export const JOURNEY_STOPS = STOPS.map((s) => s.title);
