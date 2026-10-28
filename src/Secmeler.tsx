import { useState, type CSSProperties } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Drum,
  Ear,
  MapPin,
  MessageCircle,
  Mic,
  Music,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import Reveal from './Reveal';
import { useLang } from './i18n';

type FaqItem = { q: string; a: string | string[] };

const FAQ_GROUPS: { label: string; items: FaqItem[] }[] = [
  {
    label: 'Başvuru ve Seçme',
    items: [
      { q: 'Seçme randevusuna gelemeyeceksem ne yapmalıyım?', a: 'Durumu erken bildirmeniz hâlinde yeni bir gün/saat ayarlayabiliriz. Seçme dönemi sona erdiyse, bir sonraki seçme sürecini beklemeniz gerekebilir.' },
      { q: 'Seçme saatleri nasıl belirleniyor?', a: 'Katılım durumunuza göre gün ve saat belirlenerek size iletilir. Uymuyorsa lütfen en kısa sürede geri dönüş yapın.' },
      { q: 'Vize ve pasaport işlemleri nasıl yürütülüyor?', a: 'Pasaport başvurusu bireysel olarak yapılır. Vize işlemleri koro yönetimi tarafından yürütülür.' },
      { q: 'Vize reddi yaşanırsa ne olur?', a: 'Bu durumda maalesef festivale katılım sağlanamaz. Konsolosluk süreci dış etken olduğu için garanti verilemez.' },
      { q: 'Sahne kostümleri nasıl belirleniyor?', a: 'Kostüm detayları üyeliğiniz onaylandıktan sonra paylaşılır. Nereden temin edileceği konusunda bilgilendirme yapılır.' },
      { q: 'Fotoğraf ve videolar nasıl kullanılıyor?', a: 'Tanıtım, sosyal medya ve arşiv amaçlı kullanılabilir. Kullanım için yazılı onay alınır.' },
    ],
  },
  {
    label: 'Prova',
    items: [
      { q: 'Provalar nerede ve ne zaman yapılıyor?', a: 'Her pazartesi ve cuma günleri 19:00–22:00 saatlerinde yapılır. Yer: Narlıdere Atatürk Kültür Merkezi, Mithat Paşa Cad. 447/A Narlıdere/İzmir.' },
      { q: 'Provalar hangi dilde yürütülüyor?', a: 'Provalar Türkçe yürütülür. Farklı dillerdeki eserler için özel telaffuz çalışmaları yapılır.' },
      { q: 'Her provaya katılım zorunlu mu?', a: 'Evet. Rutin ve ek çalışmalara düzenli katılım beklenir.' },
      { q: 'Ek prova ya da grup çalışmaları yapılıyor mu?', a: 'Evet, ihtiyaç durumunda ek çalışmalar yapılır. Tarih ve saatler önceden duyurulur.' },
      { q: 'Konser ve turneler hangi dönemlerde oluyor?', a: 'Genellikle hafta sonlarına ve tatil günlerine denk getirilir.' },
      { q: 'Yıl içinde takvim nasıl işler?', a: 'Prova ve konser takvimi dönem başında paylaşılır. Resmi tatillerde de çalışma olabilir.' },
    ],
  },
  {
    label: 'Koro',
    items: [
      { q: 'Agora Voice nedir?', a: 'Agora Voice, farklı korolarda deneyim kazanmış koristlerin bir araya gelerek kurduğu, müziğe tutkuyla bağlı bir vokal topluluğudur.' },
      { q: 'Ne zaman kuruldunuz?', a: 'Koromuz, ilk çalışmasını 27 Ocak 2025 tarihinde gerçekleştirmiştir.' },
      { q: 'Adınızı nereden alıyorsunuz?', a: 'İzmir’in tarihî ve kültürel simgelerinden biri olan Antik Agora’dan ilham alıyoruz.' },
      { q: 'Koro şefiniz kimdir?', a: 'Şefimiz, deneyimli müzik eğitimcisi Özlem Varışlı Atçeken’dir.' },
      { q: 'Korepetitörünüz kimdir?', a: 'Piyanist, aranjör Rıza Atçeken çalışmalarımıza eşlik etmektedir.' },
      { q: 'Kimlerden oluşuyorsunuz?', a: 'Koromuz, farklı meslek gruplarından gelen, daha önce çeşitli korolarda görev almış, deneyimli koristlerden oluşmaktadır.' },
      { q: 'Hangi müzik türlerini seslendiriyorsunuz?', a: 'Klasik çok sesli eserlerden çağdaş koro düzenlemelerine kadar geniş bir repertuvar çalışıyoruz.' },
      { q: 'Hedefiniz nedir?', a: 'Sanatı, sesi ve ortak tutkuyu bir araya getirerek yurt içi ve yurt dışında ülkemizi başarıyla temsil etmektir.' },
      { q: 'Çalışma koşullarınız nelerdir?', a: 'Bütün sistem birlikte söyleme üzerine kurulu olduğundan, sağlık ve çalışma mesaisi gibi zorunlu ve özel durumlar dışında çalışmalara düzenli ve tam katılım (en az %80) beklenir. Aksi durumda korist çalışmalara katılmaya devam edebilir, fakat ilk etkinlikte yer alamaz. Diğer etkinliklere katılımı ise koristin bireysel çaba ve çalışmaları doğrultusunda şefin vereceği karara bağlıdır. Bu durum online ve partisyon çalışmaları için de geçerlidir.' },
      { q: 'Koristlerin görev ve sorumlulukları nelerdir?', a: ['1- Eserle ilgili verilen ödevi yerine getirir.', '2- Uyarılar doğrultusunda gerekli düzeltmeleri yapar.', '3- Çalışmalara Partisyonunu eksiksiz öğrenerek, hazır gelir.', '4- Korunun sanatsal ve sosyal işleyişinde uygun görülen ekiplerde aktif görev alır.'] },
    ],
  },
];

const FAQ_GROUPS_EN: { label: string; items: FaqItem[] }[] = [
  {
    label: 'Application & Audition',
    items: [
      { q: 'What if I can’t make my audition appointment?', a: 'If you let us know early, we can arrange a new day/time. If the audition period has ended, you may need to wait for the next audition round.' },
      { q: 'How are audition times set?', a: 'A day and time are set based on your availability and sent to you. If it doesn’t suit you, please get back to us as soon as possible.' },
      { q: 'How are visa and passport procedures handled?', a: 'Passport applications are made individually. Visa procedures are handled by the choir management.' },
      { q: 'What happens if a visa is refused?', a: 'Unfortunately, participation in the festival is then not possible. Since the consular process is an external factor, no guarantee can be given.' },
      { q: 'How are stage costumes decided?', a: 'Costume details are shared once your membership is confirmed, along with information on where to obtain them.' },
      { q: 'How are photos and videos used?', a: 'They may be used for promotion, social media and archive purposes. Written consent is obtained for their use.' },
    ],
  },
  {
    label: 'Rehearsals',
    items: [
      { q: 'Where and when are rehearsals held?', a: 'Every Monday and Friday, 19:00–22:00. Venue: Narlıdere Atatürk Cultural Center, Mithat Paşa Cad. 447/A Narlıdere/İzmir.' },
      { q: 'In which language are rehearsals held?', a: 'Rehearsals are held in Turkish. Special pronunciation work is done for pieces in other languages.' },
      { q: 'Is attendance at every rehearsal mandatory?', a: 'Yes. Regular attendance at routine and additional sessions is expected.' },
      { q: 'Are there extra rehearsals or sectionals?', a: 'Yes, additional sessions are held when needed. Dates and times are announced in advance.' },
      { q: 'When do concerts and tours take place?', a: 'They are usually scheduled on weekends and holidays.' },
      { q: 'How does the yearly schedule work?', a: 'The rehearsal and concert schedule is shared at the start of the season. Sessions may also take place on public holidays.' },
    ],
  },
  {
    label: 'The Choir',
    items: [
      { q: 'What is Agora Voice?', a: 'Agora Voice is a vocal ensemble passionately devoted to music, founded by choristers who gained experience in various choirs.' },
      { q: 'When were you founded?', a: 'Our choir held its first rehearsal on 27 January 2025.' },
      { q: 'Where does your name come from?', a: 'We are inspired by the Ancient Agora, one of Izmir’s historical and cultural landmarks.' },
      { q: 'Who is your conductor?', a: 'Our conductor is the experienced music educator Özlem Varışlı Atçeken.' },
      { q: 'Who is your répétiteur?', a: 'Pianist and arranger Rıza Atçeken accompanies our work.' },
      { q: 'Who are your members?', a: 'Our choir consists of experienced choristers from various professions who have previously sung in different choirs.' },
      { q: 'What kind of music do you perform?', a: 'We work on a wide repertoire, from classical polyphonic works to contemporary choral arrangements.' },
      { q: 'What is your goal?', a: 'To successfully represent our country at home and abroad by bringing together art, voice and shared passion.' },
      { q: 'What are the working conditions?', a: 'Since everything is built on singing together, regular and full attendance (at least 80%) is expected, except for compulsory and special circumstances such as health or work. Otherwise, the chorister may continue attending rehearsals but cannot take part in the first event. Participation in further events depends on the conductor’s decision based on the chorister’s individual effort. This also applies to online and sectional rehearsals.' },
      { q: 'What are the choristers’ duties and responsibilities?', a: ['1- Completes the assignments given for each piece.', '2- Makes the necessary corrections based on feedback.', '3- Comes to rehearsals prepared, having fully learned their part.', '4- Takes an active role in teams supporting the choir’s artistic and social activities.'] },
    ],
  },
];

const STAGES_EN = [
  { icon: Ear, title: 'Ear Test', points: ['You are asked to repeat one, two, three and four reference notes played on the piano.', 'This measures your musical ear.'] },
  { icon: Music, title: 'Melody Repetition', points: ['Two short melodies are played on the piano.', 'You are asked to sing them back.'] },
  { icon: Drum, title: 'Sense of Rhythm', points: ['You are asked to repeat two reference rhythms.', 'This measures your sense of rhythm.'] },
  { icon: Mic, title: 'Prepared Piece', points: ['You are asked to sing a piece you have prepared.', 'Language, genre and style are up to you.'] },
];

const STAGES = [
  { icon: Ear, title: 'Müzik Kulağı Testi', points: ['Piyano ile verilen rehber tek, çift, üç ve dört sesin tekrarı istenir.', 'Adayın müzik kulağı ölçülür.'] },
  { icon: Music, title: 'Ezgi Tekrarı', points: ['Verilen iki küçük ezgi piyano ile çalınır.', 'Adayın tekrarı istenir.'] },
  { icon: Drum, title: 'Ritim Duygusu', points: ['Verilen rehber iki ritmin tekrarı istenir.', 'Adayın ritim duygusu ölçülür.'] },
  { icon: Mic, title: 'Hazırlanan Eser', points: ['Adayın hazırladığı bir eseri seslendirmesi istenir.', 'Dil, tür ve tarz serbesttir.'] },
];

// Ses dalgası çubuklarının deterministik yükseklikleri (her render'da aynı).
const WAVE = Array.from({ length: 34 }, (_, i) => {
  const h = 22 + Math.round(Math.abs(Math.sin(i * 0.72) * 58 + Math.cos(i * 1.9) * 16));
  return { h: Math.min(h, 92), dl: `${(i % 9) * -0.17}s` };
});

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Narl%C4%B1dere+Atat%C3%BCrk+K%C3%BClt%C3%BCr+Merkezi+%C4%B0zmir';

type SecmelerProps = {
  applicationsOpen: boolean;
  onStartPitchTest: () => void;
  onAskAssistant?: () => void;
};

const Secmeler = ({ applicationsOpen, onStartPitchTest, onAskAssistant }: SecmelerProps) => {
  const [faqTab, setFaqTab] = useState(0);
  const { lang, t } = useLang();
  const faqGroups = lang === 'en' ? FAQ_GROUPS_EN : FAQ_GROUPS;
  const stages = lang === 'en' ? STAGES_EN : STAGES;
  const group = faqGroups[faqTab];

  return (
    <section id="secmeler" className="av-section av-section--alt" aria-labelledby="secmeler-title">
      <div className="av-wrap">
        <Reveal className="av-section-head">
          <span className="av-chip">{t('Seçmeler', 'Auditions')}</span>
          <div className="av-section-head__body">
            <span className="av-eyebrow">{t('Agora Voice 2026 / 2027 – Çok Sesli A Capella Koro Seçmeleri', 'Agora Voice 2026 / 2027 – Polyphonic A Cappella Choir Auditions')}</span>
            <h2 id="secmeler-title" className="av-display av-h2">
              {t('Sahnedeki yerin', 'Your place on stage')} <em>{t('seni bekliyor.', 'awaits you.')}</em>
            </h2>
            <p className="av-lead" style={{ maxWidth: 760 }}>
              {applicationsOpen
                ? t('Ön değerlendirme sonuçları 15-25 Temmuz tarihleri arasında e-posta yoluyla sizinle paylaşılacaktır. ', 'Preliminary results will be shared with you by email between 15–25 July. ')
                : t('2026 – 2027 dönemi seçmelerimiz tamamlandı; yeni dönem başvuruları açıldığında duyuracağız. ', 'Our 2026 – 2027 auditions are complete; we will announce when applications for the next season open. ')}
              {t(
                "Amacımız yurt içi ve yurt dışı festivallerde ülkemizi ve İzmir'i temsil edecek ekibi oluşturmaktır. Katılımcılar, uluslararası bir sahnede çok sesli müziğin coşkusunu paylaşma fırsatı bulacaklardır.",
                'Our aim is to build a team that will represent Türkiye and Izmir at festivals at home and abroad. Participants will have the chance to share the joy of polyphonic music on an international stage.',
              )}
            </p>
          </div>
        </Reveal>

        {/* Kimler başvurabilir */}
        <Reveal className="av-card av-spot" style={{ marginBottom: 16 }}>
          <div className="av-icon"><Users size={22} /></div>
          <h3>{t('Kimler başvurabilir?', 'Who can apply?')}</h3>
          <p>{t("Agora Voice'a katılmak için:", 'To join Agora Voice:')}</p>
          <ul className="av-criteria">
            <li><CheckCircle2 size={20} />{t('20 – 55 yaş aralığında olmalısınız.', 'You should be between 20 and 55 years old.')}</li>
            <li><CheckCircle2 size={20} />{t('Temel düzeyde nota bilgisi ve müzik kulağına sahip olmanız beklenir.', 'Basic music reading skills and a good musical ear are expected.')}</li>
            <li><CheckCircle2 size={20} />{t('Provalara düzenli katılım sağlayabilmelisiniz.', 'You should be able to attend rehearsals regularly.')}</li>
            <li className="is-bonus">
              <Star size={20} />
              <span>{t('Daha önce çok sesli müzik deneyimi edinmiş olmanız avantajdır ancak zorunlu değildir.', 'Previous polyphonic singing experience is an advantage but not required.')}<em>{t('Avantaj', 'Bonus')}</em></span>
            </li>
            <li><CheckCircle2 size={20} />{t('2027 yılında festivale katılımınız için yurt dışı seyahati yapabilecek durumda olmalısınız.', 'You should be able to travel abroad to take part in festivals in 2027.')}</li>
          </ul>
        </Reveal>

        {/* Seçme aşamaları */}
        <Reveal className="av-section-head__row" style={{ margin: 'clamp(3.5rem, 7vw, 5.5rem) 0 1.6rem' }}>
          <h3 className="av-display" style={{ fontSize: 'clamp(2.2rem, 4.4vw, 3.8rem)' }}>
            {t('Seçme', 'Audition')} <em>{t('aşamaları', 'stages')}</em>
          </h3>
          <p className="av-lead" style={{ maxWidth: 440 }}>
            {t('Agora Voice seçmeleri canlı ve birebir yapılır. Aşamalar aşağıdaki gibidir:', 'Agora Voice auditions are held live and one-on-one. The stages are as follows:')}
          </p>
        </Reveal>
        <div className="av-stages">
          {stages.map(({ icon: Icon, title, points }, i) => (
            <Reveal key={title} className="av-card av-spot av-stage" delay={i * 90}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="av-stage__num">0{i + 1}</span>
                <div className="av-icon" style={{ marginBottom: 0 }}><Icon size={21} /></div>
              </div>
              <h4>{title}</h4>
              <ul>
                {points.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </Reveal>
          ))}
        </div>

        {/* Ses testi bandı */}
        <Reveal className="av-voiceband">
          <div>
            <span className="av-eyebrow">{t('Ücretsiz · 1 dakika', 'Free · 1 minute')}</span>
            <h3>{t('Seçmeye gelmeden önce tek bir ses denemesi yapmak ister misiniz?', 'Want to try your voice before the audition?')}</h3>
            <p>{t('Ücretsiz ses aralığı testimizle hangi ses grubuna uygun olduğunuzu hemen keşfedin.', 'Find out which voice part suits you with our free vocal range test.')}</p>
          </div>
          <div className="av-voiceband__right">
            <div className="av-wave" aria-hidden="true">
              {WAVE.map((b, i) => (
                <i key={i} style={{ '--h': `${b.h}px`, '--dl': b.dl } as CSSProperties} />
              ))}
            </div>
            <button type="button" onClick={onStartPitchTest} className="av-btn av-btn--light">
              <Mic size={18} strokeWidth={2.25} aria-hidden />
              {t('Ses Aralığı Testini Dene', 'Try the Vocal Range Test')}
              <ArrowRight size={18} className="av-arrow" aria-hidden />
            </button>
          </div>
        </Reveal>

        {/* Prova & ücret */}
        <div className="av-bento">
          <Reveal className="av-card av-spot av-span-4">
            <div className="av-icon"><MapPin size={22} /></div>
            <span className="av-eyebrow">{t('Prova ve lokasyon bilgileri', 'Rehearsal & location')}</span>
            <p className="av-place__addr" style={{ color: 'var(--av-ink)' }}>
              {t('Narlıdere Atatürk Kültür Merkezi', 'Narlıdere Atatürk Cultural Center')}
              <br />
              <span style={{ color: 'var(--av-muted)' }}>Mithat Paşa Cad. 447/A Narlıdere/İzmir.</span>
            </p>
            <div className="av-meta-row">
              <span><Calendar size={16} aria-hidden /> {t('Pazartesi ve Cuma günleri 19.00 – 22.00', 'Mondays and Fridays 19:00 – 22:00')}</span>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                {t('Haritada aç', 'Open in Maps')} <ArrowUpRight size={16} aria-hidden />
              </a>
            </div>
          </Reveal>
          <Reveal className="av-card av-card--terra av-span-2" delay={90}>
            <div className="av-icon"><Sparkles size={22} /></div>
            <span className="av-eyebrow" style={{ color: 'rgba(255,255,255,.75)' }}>{t('Başvuru ücreti', 'Application fee')}</span>
            <p className="av-free" style={{ color: '#fff' }}>{t('Ücretsiz', 'Free')}</p>
            <p>{t('Seçmelere katılım ücretsizdir.', 'Taking part in auditions is free of charge.')}</p>
          </Reveal>
        </div>

        {/* SSS */}
        <div className="av-faq">
          <Reveal className="av-faq__aside">
            <span className="av-eyebrow">{t('Merak edilenler', 'Good to know')}</span>
            <h3 className="av-display">{t('Sık sorulan', 'Frequently asked')} <em>{t('sorular', 'questions')}</em></h3>
            <p>
              {onAskAssistant
                ? t('Aradığınız cevabı bulamadıysanız yapay zeka asistanımıza sorabilir ya da bize e-posta gönderebilirsiniz.', 'Can’t find what you’re looking for? Ask our AI assistant or send us an email.')
                : t('Aradığınız cevabı bulamadıysanız bize e-posta gönderebilirsiniz.', 'Can’t find what you’re looking for? Send us an email.')}
            </p>
            {onAskAssistant && (
              <button type="button" onClick={onAskAssistant} className="av-btn av-btn--ghost av-btn--sm">
                <MessageCircle size={17} aria-hidden />
                {t('Asistana sor', 'Ask the assistant')}
              </button>
            )}
          </Reveal>
          <Reveal delay={120}>
            <div className="av-tabs" role="tablist" aria-label={t('Soru kategorileri', 'Question categories')}>
              {faqGroups.map((g, i) => (
                <button
                  key={g.label}
                  type="button"
                  role="tab"
                  id={`faq-tab-${i}`}
                  aria-selected={faqTab === i}
                  aria-controls="faq-panel"
                  className="av-tab"
                  onClick={() => setFaqTab(i)}
                >
                  {g.label}
                  <small>{g.items.length}</small>
                </button>
              ))}
            </div>
            <div className="av-acc" key={faqTab} id="faq-panel" role="tabpanel" aria-labelledby={`faq-tab-${faqTab}`}>
              {group.items.map((item) => (
                <details key={item.q} name="av-faq">
                  <summary>
                    {item.q}
                    <i aria-hidden="true" />
                  </summary>
                  <div className="av-acc__answer">
                    {Array.isArray(item.a) ? item.a.map((line) => <div key={line}>{line}</div>) : item.a}
                  </div>
                </details>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Başvuru nasıl yapılır */}
        <Reveal className="av-section-head__row" style={{ margin: 'clamp(4rem, 8vw, 7rem) 0 1.6rem' }}>
          <h3 className="av-display" style={{ fontSize: 'clamp(2.2rem, 4.4vw, 3.8rem)' }}>
            {t('Başvuru', 'How to')} <em>{t('nasıl yapılır?', 'apply?')}</em>
          </h3>
        </Reveal>
        <div className="av-bento">
          <Reveal className="av-card av-card--ink av-spot av-span-3">
            <span className="av-eyebrow" style={{ color: 'var(--av-on-ink-muted)' }}>{t('Başvuru süreci', 'Application process')}</span>
            <ol className="av-steps">
              <li><span>1</span><p>{t('Başvuru formunu eksiksiz doldurun.', 'Fill out the application form completely.')}</p></li>
              <li><span>2</span><p>{t('Size e-posta yoluyla ulaşılacak ve seçme randevusu verilecektir.', 'We will contact you by email and give you an audition appointment.')}</p></li>
              <li>
                <span>3</span>
                <p>
                  {applicationsOpen
                    ? t('Ön değerlendirme sonuçları 15–25 Temmuz tarihleri arasında e-posta yoluyla paylaşılacaktır.', 'Preliminary results will be shared by email between 15–25 July.')
                    : t('Ön değerlendirme sonuçları, dönem başında duyurulan tarihlerde e-posta yoluyla paylaşılır.', 'Preliminary results are shared by email on dates announced at the start of the season.')}
                </p>
              </li>
            </ol>
          </Reveal>
          <Reveal className="av-card av-spot av-span-3" delay={90}>
            <span className="av-eyebrow">{t('Seçmelere geldiğinizde', 'On audition day')}</span>
            <ul className="av-checks">
              <li><CheckCircle2 size={20} />{t('Hafif bir şeyler yiyip gelin.', 'Have a light meal beforehand.')}</li>
              <li><CheckCircle2 size={20} />{t('Şarkınızı önceden seçmiş olun.', 'Choose your song in advance.')}</li>
              <li><CheckCircle2 size={20} />{t('15 dakika erken gelin.', 'Arrive 15 minutes early.')}</li>
            </ul>
          </Reveal>
          <Reveal className="av-card av-card--terra av-quote av-span-6" delay={120}>
            <span className="av-eyebrow" style={{ color: 'rgba(255,255,255,.75)' }}>{t('Son bir not', 'One last note')}</span>
            <blockquote>
              <em>{t('Unutmayın!..', 'Remember!')}</em>
              {t('Sizleri sınamak için değil aramızda görmek için orada olacağız.', 'We’ll be there not to test you, but because we want to see you among us.')}
            </blockquote>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Secmeler;
