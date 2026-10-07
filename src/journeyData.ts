export type Stop = {
  date: string;
  title: string;
  place: string;
  text: string;
  image?: string;
  focus?: string;
  awards?: string[];
};

// Yolculuğumuz — yeni durak eklemek için listeye bir kayıt eklemek yeterli.
// `image` yoksa kartta markaya uygun bir yer tutucu gösterilir.
export const STOPS: Stop[] = [
  {
    date: 'Temmuz 2025',
    title: 'Aziz Helena Kilisesi',
    place: 'İzmir',
    text: 'Kuruluşumuzun ilk yılında Aziz Helena’nın tarihî atmosferinde dinleyicilerimizle buluştuk. Çok sesli yolculuğumuzun ilk durağı.',
    image: '/journey/aziz-helena-2025.jpg',
    focus: 'center 62%',
  },
  {
    date: 'Mayıs 2026',
    title: 'Aziz Vukolos Kilisesi',
    place: 'İzmir',
    text: 'Tarihî Aziz Vukolos’un eşsiz akustiğinde, kalabalık bir dinleyici kitlesine çok sesli repertuvarımızı seslendirdik.',
    image: '/journey/aziz-vukolos-2026.jpg',
    focus: 'center 45%',
  },
  {
    date: 'Mayıs 2026',
    title: 'İzmir Uluslararası Çoksesli Korolar Festivali',
    place: 'Ahmed Adnan Saygun Sanat Merkezi · İzmir',
    text: 'AASSM sahnesinde yurt içinden ve yurt dışından korolarla aynı festivali paylaştık.',
    image: '/journey/izmir-aassm-2026.jpg',
    focus: 'center 65%',
    awards: ['Müzikalite ve Müzikal Dinamikler Başarı Ödülü'],
  },
  {
    date: 'Temmuz 2026',
    title: 'Çanakkale Uluslararası Koro Festivali',
    place: 'Çanakkale',
    text: 'Çanakkale’de uluslararası korolarla buluşarak sesimizi bir kez daha festival sahnesine taşıdık.',
    image: '/journey/canakkale-2026.jpg',
    focus: 'center 58%',
  },
  {
    date: 'Ağustos 2026',
    title: 'Ohrid Choir Festival',
    place: 'Ohrid · Kuzey Makedonya',
    text: 'Ohrid Koro Festivali’nde jüriden 85,67 puan alarak II. Ödül’ü ve En İyi Sahne Performansı ödülünü kazandık.',
    image: '/journey/ohrid-2026.jpg',
    focus: 'center 55%',
    awards: ['II. Ödül · 85,67 puan', 'En İyi Sahne Performansı'],
  },
];

export const JOURNEY_STOPS = STOPS.map((s) => s.title);
