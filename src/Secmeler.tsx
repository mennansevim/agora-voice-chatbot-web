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
  const group = FAQ_GROUPS[faqTab];

  return (
    <section id="secmeler" className="av-section av-section--alt" aria-labelledby="secmeler-title">
      <div className="av-wrap">
        <Reveal className="av-section-head">
          <span className="av-chip">Seçmeler</span>
          <div className="av-section-head__body">
            <span className="av-eyebrow">Agora Voice 2026 / 2027 – Çok Sesli A Capella Koro Seçmeleri</span>
            <h2 id="secmeler-title" className="av-display av-h2">
              Sahnedeki yerin <em>seni bekliyor.</em>
            </h2>
            <p className="av-lead" style={{ maxWidth: 760 }}>
              {applicationsOpen
                ? 'Ön değerlendirme sonuçları 15-25 Temmuz tarihleri arasında e-posta yoluyla sizinle paylaşılacaktır. '
                : '2026 – 2027 dönemi seçmelerimiz tamamlandı; yeni dönem başvuruları açıldığında duyuracağız. '}
              Amacımız yurt içi ve yurt dışı festivallerde ülkemizi ve İzmir'i temsil edecek ekibi oluşturmaktır.
              Katılımcılar, uluslararası bir sahnede çok sesli müziğin coşkusunu paylaşma fırsatı bulacaklardır.
            </p>
          </div>
        </Reveal>

        {/* Kimler başvurabilir */}
        <Reveal className="av-card av-spot" style={{ marginBottom: 16 }}>
          <div className="av-icon"><Users size={22} /></div>
          <h3>Kimler başvurabilir?</h3>
          <p>Agora Voice'a katılmak için:</p>
          <ul className="av-criteria">
            <li><CheckCircle2 size={20} />20 – 55 yaş aralığında olmalısınız.</li>
            <li><CheckCircle2 size={20} />Temel düzeyde nota bilgisi ve müzik kulağına sahip olmanız beklenir.</li>
            <li><CheckCircle2 size={20} />Provalara düzenli katılım sağlayabilmelisiniz.</li>
            <li className="is-bonus">
              <Star size={20} />
              <span>Daha önce çok sesli müzik deneyimi edinmiş olmanız avantajdır ancak zorunlu değildir.<em>Avantaj</em></span>
            </li>
            <li><CheckCircle2 size={20} />2027 yılında festivale katılımınız için yurt dışı seyahati yapabilecek durumda olmalısınız.</li>
          </ul>
        </Reveal>

        {/* Seçme aşamaları */}
        <Reveal className="av-section-head__row" style={{ margin: 'clamp(3.5rem, 7vw, 5.5rem) 0 1.6rem' }}>
          <h3 className="av-display" style={{ fontSize: 'clamp(2.2rem, 4.4vw, 3.8rem)' }}>
            Seçme <em>aşamaları</em>
          </h3>
          <p className="av-lead" style={{ maxWidth: 440 }}>
            Agora Voice seçmeleri canlı ve birebir yapılır. Aşamalar aşağıdaki gibidir:
          </p>
        </Reveal>
        <div className="av-stages">
          {STAGES.map(({ icon: Icon, title, points }, i) => (
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
            <span className="av-eyebrow">Ücretsiz · 1 dakika</span>
            <h3>Seçmeye gelmeden önce tek bir ses denemesi yapmak ister misiniz?</h3>
            <p>Ücretsiz ses aralığı testimizle hangi ses grubuna uygun olduğunuzu hemen keşfedin.</p>
          </div>
          <div className="av-voiceband__right">
            <div className="av-wave" aria-hidden="true">
              {WAVE.map((b, i) => (
                <i key={i} style={{ '--h': `${b.h}px`, '--dl': b.dl } as CSSProperties} />
              ))}
            </div>
            <button type="button" onClick={onStartPitchTest} className="av-btn av-btn--light">
              <Mic size={18} strokeWidth={2.25} aria-hidden />
              Ses Aralığı Testini Dene
              <ArrowRight size={18} className="av-arrow" aria-hidden />
            </button>
          </div>
        </Reveal>

        {/* Prova & ücret */}
        <div className="av-bento">
          <Reveal className="av-card av-spot av-span-4">
            <div className="av-icon"><MapPin size={22} /></div>
            <span className="av-eyebrow">Prova ve lokasyon bilgileri</span>
            <p className="av-place__addr" style={{ color: 'var(--av-ink)' }}>
              Narlıdere Atatürk Kültür Merkezi
              <br />
              <span style={{ color: 'var(--av-muted)' }}>Mithat Paşa Cad. 447/A Narlıdere/İzmir.</span>
            </p>
            <div className="av-meta-row">
              <span><Calendar size={16} aria-hidden /> Pazartesi ve Cuma günleri 19.00 – 22.00</span>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                Haritada aç <ArrowUpRight size={16} aria-hidden />
              </a>
            </div>
          </Reveal>
          <Reveal className="av-card av-card--terra av-span-2" delay={90}>
            <div className="av-icon"><Sparkles size={22} /></div>
            <span className="av-eyebrow" style={{ color: 'rgba(255,255,255,.75)' }}>Başvuru ücreti</span>
            <p className="av-free" style={{ color: '#fff' }}>Ücretsiz</p>
            <p>Seçmelere katılım ücretsizdir.</p>
          </Reveal>
        </div>

        {/* SSS */}
        <div className="av-faq">
          <Reveal className="av-faq__aside">
            <span className="av-eyebrow">Merak edilenler</span>
            <h3 className="av-display">Sık sorulan <em>sorular</em></h3>
            <p>Aradığınız cevabı bulamadıysanız yapay zeka asistanımıza sorabilir ya da bize e-posta gönderebilirsiniz.</p>
            {onAskAssistant && (
              <button type="button" onClick={onAskAssistant} className="av-btn av-btn--ghost av-btn--sm">
                <MessageCircle size={17} aria-hidden />
                Asistana sor
              </button>
            )}
          </Reveal>
          <Reveal delay={120}>
            <div className="av-tabs" role="tablist" aria-label="Soru kategorileri">
              {FAQ_GROUPS.map((g, i) => (
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
            Başvuru <em>nasıl yapılır?</em>
          </h3>
        </Reveal>
        <div className="av-bento">
          <Reveal className="av-card av-card--ink av-spot av-span-3">
            <span className="av-eyebrow" style={{ color: 'var(--av-on-ink-muted)' }}>Başvuru süreci</span>
            <ol className="av-steps">
              <li><span>1</span><p>Başvuru formunu eksiksiz doldurun.</p></li>
              <li><span>2</span><p>Size e-posta yoluyla ulaşılacak ve seçme randevusu verilecektir.</p></li>
              <li>
                <span>3</span>
                <p>
                  {applicationsOpen
                    ? 'Ön değerlendirme sonuçları 15–25 Temmuz tarihleri arasında e-posta yoluyla paylaşılacaktır.'
                    : 'Ön değerlendirme sonuçları, dönem başında duyurulan tarihlerde e-posta yoluyla paylaşılır.'}
                </p>
              </li>
            </ol>
          </Reveal>
          <Reveal className="av-card av-spot av-span-3" delay={90}>
            <span className="av-eyebrow">Seçmelere geldiğinizde</span>
            <ul className="av-checks">
              <li><CheckCircle2 size={20} />Hafif bir şeyler yiyip gelin.</li>
              <li><CheckCircle2 size={20} />Şarkınızı önceden seçmiş olun.</li>
              <li><CheckCircle2 size={20} />15 dakika erken gelin.</li>
            </ul>
          </Reveal>
          <Reveal className="av-card av-card--terra av-quote av-span-6" delay={120}>
            <span className="av-eyebrow" style={{ color: 'rgba(255,255,255,.75)' }}>Son bir not</span>
            <blockquote>
              <em>Unutmayın!..</em>
              Sizleri sınamak için değil aramızda görmek için orada olacağız.
            </blockquote>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Secmeler;
