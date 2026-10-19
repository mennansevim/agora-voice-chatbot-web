import { lazy, Suspense, useCallback, useEffect, useRef, useState, type CSSProperties, type TouchEvent } from 'react';
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  AudioLines,
  ChevronLeft,
  ChevronRight,
  Compass,
  Globe,
  Instagram,
  LockKeyhole,
  Mail,
  MapPin,
  Maximize2,
  Menu,
  MessageCircle,
  Mic,
  Music,
  Play,
  Star,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import Secmeler from './Secmeler';
import Reveal from './Reveal';
import Journey from './Journey';
import { STOPS, journeyStops } from './journeyData';
import Reels from './Reels';
import { LangProvider, useLang, type Lang } from './i18n';
import './landing.css';

// Ana sayfa dışındaki ağır ekranlar ayrı paket olarak, yalnızca ihtiyaç anında yüklenir.
const PitchTest = lazy(() => import('./PitchTest'));
const AdminPanel = lazy(() => import('./Admin'));
const KvkkPage = lazy(() => import('./Kvkk'));
const FestivalPlanner = lazy(() => import('./FestivalPlanner'));

// Başvuru dönemi kapalı. Yeni dönem açıldığında `true` yapılması yeterli:
// hero'daki başvuru butonu ve girişteki başvuru popup'ı yeniden görünür olur.
const APPLICATIONS_OPEN: boolean = false;

// Konser takvimi şimdilik gizli. Takvim kesinleştiğinde `true` yapılır.
const SHOW_CONCERT_CALENDAR: boolean = false;

const APPLY_FORM_URL = 'https://forms.gle/Qgw4xp9jMte7y94h7';
const CHATBOT_URL = 'https://chat.agoravoice.com.tr/chat/7d0SRt4Z3zhUQh8o?theme=dark';
const CONTACT_EMAIL = 'agoravoiceschoir@gmail.com';

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Narl%C4%B1dere+Atat%C3%BCrk+K%C3%BClt%C3%BCr+Merkezi+%C4%B0zmir';

const NAV_ITEMS = [
  { id: 'about', label: 'Biz Kimiz', en: 'About' },
  { id: 'journey', label: 'Yolculuğumuz', en: 'Journey' },
  { id: 'secmeler', label: 'Seçmeler', en: 'Auditions' },
  { id: 'reels', label: 'Videolar', en: 'Videos' },
  { id: 'ai-assistant', label: 'AI Asistan', en: 'AI Assistant' },
  { id: 'gallery', label: 'Galeri', en: 'Gallery' },
  { id: 'contact', label: 'İletişim', en: 'Contact' },
];
const SPY_SECTIONS = ['home', ...NAV_ITEMS.map((n) => n.id)];

// Galeri — 100 resme kadar genişletilebilir. `size` bento ızgaradaki kaplama alanıdır
// (xl = 2×2, wide = 2×1, tall = 1×2, boş = 1×1). Her albüm 4 sütunu tam dolduracak
// şekilde (toplam hücre 4'ün katı) sıralanmıştır; yeni görselde bunu koruyun.
type ShotSize = 'xl' | 'tall' | 'wide' | undefined;
type Album = 'ohrid' | 'koro';
const galleryImages: { src: string; alt: string; title: string; album: Album; size?: ShotSize }[] = [
  { src: '/gallery/g-40574a13ed61.jpg', alt: 'Ohrid hikâyesi, Bölüm 1: Yolculuk başlıyor', title: 'Bölüm 1 — Yolculuk Başlıyor', album: 'ohrid', size: 'xl' },
  { src: '/gallery/g-b4ea23948026.jpg', alt: 'Agora Voice beyaz kostümlerle Ohrid Koro Festivali sahnesinde', title: 'Ohrid Choir Festival 2026', album: 'ohrid', size: 'wide' },
  { src: '/gallery/g-e3d3f4e0a345.jpg', alt: 'Ohrid hikâyesi, Bölüm 2: Sahneye doğru', title: 'Bölüm 2 — Sahneye Doğru', album: 'ohrid' },
  { src: '/gallery/g-7de8cc2a0393.jpg', alt: 'Ohrid hikâyesi, Bölüm 3: Sesimiz Ohrid’de', title: 'Bölüm 3 — Sesimiz Ohrid’de', album: 'ohrid' },
  { src: '/gallery/g-a26159156400.jpg', alt: 'Agora Voice koristleri Ohrid’de akşam grup fotoğrafında', title: 'Ohrid’de bir akşam', album: 'ohrid', size: 'xl' },
  { src: '/gallery/g-64a78ea3de07.jpg', alt: 'Ohrid Koro Festivali 2026 II. Ödül diploması, 85,67 puan', title: 'II. Ödül · 85,67 puan', album: 'ohrid', size: 'wide' },
  { src: '/gallery/g-ab8f5d3d7aaa.jpg', alt: 'Ohrid Koro Festivali 2026 En İyi Sahne Performansı diploması', title: 'En İyi Sahne Performansı', album: 'ohrid', size: 'wide' },
  { src: '/gallery/g-c1269e195e5b.jpg', alt: 'Ohrid hikâyesi, Bölüm 4: Agora Voice sahnede', title: 'Bölüm 4 — Agora Voice Sahnede', album: 'ohrid', size: 'xl' },
  { src: '/gallery/g-41406682108c.jpg', alt: 'Agora Voice beyaz kostümlerle Ohrid’de açık havada', title: 'Ohrid Choir Festival 2026', album: 'ohrid', size: 'wide' },
  { src: '/gallery/g-f7b935281cd9.jpg', alt: 'Ohrid hikâyesi, Bölüm 5: Emeğin ödülü', title: 'Bölüm 5 — Emeğin Ödülü', album: 'ohrid' },
  { src: '/gallery/g-93c7509fa266.jpg', alt: 'Agora Voice festival tişörtleriyle Ohrid Koro Festivali salonunda', title: 'Ohrid Choir Festival 2026', album: 'ohrid' },
  { src: '/gallery/g-d2abaf115639.jpg', alt: 'Agora Voice Koro', title: 'Koro performansı', album: 'koro', size: 'xl' },
  { src: '/gallery/g-b2b59178cae8.jpg', alt: 'Agora Voice Koro', title: 'Koro çalışması', album: 'koro', size: 'tall' },
  { src: '/gallery/g-b4ce85fe2cf6.jpg', alt: 'Agora Voice Koro', title: 'Koro etkinliği', album: 'koro' },
  { src: '/gallery/g-11c0b5cfff44.jpg', alt: 'Agora Voice Koro', title: 'Koro provası', album: 'koro' },
  { src: '/gallery/g-d2b58cf4aaa9.jpg', alt: 'Agora Voice Koro', title: 'Koro performansı', album: 'koro', size: 'wide' },
  { src: '/gallery/g-89f4318bbc08.jpg', alt: 'Agora Voice Koro', title: 'Koro çalışması', album: 'koro' },
  { src: '/gallery/g-58e16e113e0e.jpg', alt: 'Agora Voice Koro', title: 'Koro etkinliği', album: 'koro' },
  { src: '/gallery/g-8ca268472a05.jpg', alt: 'Agora Voice Koro', title: 'Koro provası', album: 'koro', size: 'tall' },
  { src: '/gallery/g-1972b2630f76.jpg', alt: 'Agora Voice Koro', title: 'Koro performansı', album: 'koro', size: 'xl' },
  { src: '/gallery/g-612d6f3e1aac.jpg', alt: 'Agora Voice Koro', title: 'Koro etkinliği', album: 'koro', size: 'tall' },
  { src: '/gallery/g-836c6a99156c.jpg', alt: 'Agora Voice Koro', title: 'Koro provası', album: 'koro', size: 'wide' },
  { src: '/gallery/g-e1d5948ec702.jpg', alt: 'Agora Voice Koro', title: 'Koro performansı', album: 'koro', size: 'wide' },
];

const GALLERY_FILTERS: { id: 'all' | Album; label: string; en: string }[] = [
  { id: 'all', label: 'Tümü', en: 'All' },
  { id: 'ohrid', label: 'Ohrid 2026', en: 'Ohrid 2026' },
  { id: 'koro', label: 'Koro', en: 'Choir' },
];

// Galeri başlık ve alt metinlerinin İngilizcesi (Türkçe metin → İngilizce). Listede olmayan metin aynen kalır.
const GALLERY_EN: Record<string, string> = {
  'Ohrid hikâyesi, Bölüm 1: Yolculuk başlıyor': 'Ohrid story, Part 1: The journey begins',
  'Bölüm 1 — Yolculuk Başlıyor': 'Part 1 — The Journey Begins',
  'Agora Voice beyaz kostümlerle Ohrid Koro Festivali sahnesinde': 'Agora Voice in white costumes on the Ohrid Choir Festival stage',
  'Ohrid hikâyesi, Bölüm 2: Sahneye doğru': 'Ohrid story, Part 2: Towards the stage',
  'Bölüm 2 — Sahneye Doğru': 'Part 2 — Towards the Stage',
  'Ohrid hikâyesi, Bölüm 3: Sesimiz Ohrid’de': 'Ohrid story, Part 3: Our voice in Ohrid',
  'Bölüm 3 — Sesimiz Ohrid’de': 'Part 3 — Our Voice in Ohrid',
  'Agora Voice koristleri Ohrid’de akşam grup fotoğrafında': 'Agora Voice choristers in an evening group photo in Ohrid',
  'Ohrid’de bir akşam': 'An evening in Ohrid',
  'Ohrid Koro Festivali 2026 II. Ödül diploması, 85,67 puan': 'Ohrid Choir Festival 2026 2nd Prize diploma, 85.67 points',
  'II. Ödül · 85,67 puan': '2nd Prize · 85.67 points',
  'Ohrid Koro Festivali 2026 En İyi Sahne Performansı diploması': 'Ohrid Choir Festival 2026 Best Stage Performance diploma',
  'En İyi Sahne Performansı': 'Best Stage Performance',
  'Ohrid hikâyesi, Bölüm 4: Agora Voice sahnede': 'Ohrid story, Part 4: Agora Voice on stage',
  'Bölüm 4 — Agora Voice Sahnede': 'Part 4 — Agora Voice on Stage',
  'Agora Voice beyaz kostümlerle Ohrid’de açık havada': 'Agora Voice in white costumes outdoors in Ohrid',
  'Ohrid hikâyesi, Bölüm 5: Emeğin ödülü': 'Ohrid story, Part 5: Effort rewarded',
  'Bölüm 5 — Emeğin Ödülü': 'Part 5 — Effort Rewarded',
  'Agora Voice festival tişörtleriyle Ohrid Koro Festivali salonunda': 'Agora Voice in festival T-shirts at the Ohrid Choir Festival hall',
  'Agora Voice Koro': 'Agora Voice Choir',
  'Koro performansı': 'Choir performance',
  'Koro çalışması': 'Choir session',
  'Koro etkinliği': 'Choir event',
  'Koro provası': 'Choir rehearsal',
};

const concerts = [
  { name: 'İzmir Uluslararası Festivali', date: '21 Mayıs 2026', detail: 'Perşembe · Küçük Salon · 16:30', location: 'İzmir' },
  { name: 'IX. Çanakkale Koro Festivali', date: '7 – 12 Temmuz 2026', location: 'Çanakkale' },
  { name: 'Makedonya Ohrid Koro Festivali', date: '27 – 31 Ağustos 2026', location: 'Ohrid, Makedonya' },
];

const marqueeWords = (lang: Lang) => [...journeyStops(lang), 'A Cappella', lang === 'en' ? 'Polyphonic Choir' : 'Çok Sesli Koro'];

const AWARD_COUNT = STOPS.reduce((n, s) => n + (s.awards?.length ?? 0), 0);
const STATS = [
  { value: '2025', label: 'Kuruluş · İzmir', en: 'Founded · Izmir' },
  { value: String(STOPS.length), label: 'Festival ve konser durağı', en: 'Festival & concert stops' },
  { value: String(AWARD_COUNT), label: 'Festival ödülü', en: 'Festival awards' },
  { value: '85,67', en_value: '85.67', label: 'Ohrid jüri puanı', en: 'Ohrid jury score' },
  { value: 'SATB', label: 'Dört ses grubu', en: 'Four voice parts' },
  { value: '2×', label: 'Haftalık prova', en: 'Weekly rehearsals' },
];

const PRINCIPLES = [
  ['Tüm koristlerimizin provalara kendi ses grubundaki partisyonlarına çalışmış olarak gelmesi gerekmektedir.', 'All choristers must come to rehearsals having practised their own voice part.'],
  ['Şefimizin verdiği ödevler, belirtilen sürede eksiksiz olarak gönderilmelidir.', 'Assignments from our conductor must be submitted in full by the given deadline.'],
  ['Her çalışmada koro dosyanız ve kaleminiz yanınızda olmalıdır.', 'Bring your choir folder and a pencil to every session.'],
  ['Provalara önemli bir sağlık sorunu olmadıkça eksiksiz ve zamanında katılım gereklidir.', 'Full and punctual attendance is required unless there is a serious health issue.'],
  ['Provalara katılamayacak olanlar, öncesinde bilgi vermelidir.', 'Anyone unable to attend a rehearsal must let us know in advance.'],
];

// Dil seçici — üst menüde ve mobil menüde kullanılır.
function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div className="av-lang" role="group" aria-label="Dil / Language">
      {(['tr', 'en'] as const).map((code) => (
        <button key={code} type="button" lang={code} aria-pressed={lang === code} className={lang === code ? 'is-active' : ''} onClick={() => setLang(code)}>
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

// AI asistan robot maskotu — tamamen SVG (ekstra dosya yok). Gözler landing.css'te kırpışır.
function RobotMascot({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 130 132" className={className} fill="none" aria-hidden="true">
      <line x1="65" y1="34" x2="65" y2="17" stroke="#d9b48f" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="65" cy="12" r="6.5" fill="#ffffff" stroke="#e6cdb0" strokeWidth="1.5" />
      <path d="M24 72 Q24 30 65 28 Q106 30 106 72" fill="none" stroke="#2a1d16" strokeWidth="7" strokeLinecap="round" />
      <rect x="26" y="33" width="78" height="62" rx="29" fill="#ffffff" stroke="#efe4d6" strokeWidth="1.5" />
      <path d="M101 50 q12 4 9 18 q-4 10 -12 9 Z" fill="#c4502f" opacity="0.85" />
      <circle cx="26" cy="66" r="11.5" fill="#3a2a20" />
      <circle cx="104" cy="66" r="11.5" fill="#3a2a20" />
      <rect x="35" y="47" width="60" height="31" rx="15.5" fill="#1e140f" />
      <circle className="av-robot-eye" cx="52" cy="62" r="7" fill="#ffb37a" />
      <circle className="av-robot-eye" cx="78" cy="62" r="7" fill="#ffb37a" />
      <path d="M26 75 Q27 95 50 91" fill="none" stroke="#3a2a20" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="52" cy="91" r="4.5" fill="#3a2a20" />
      <path d="M44 96 q21 11 42 0 l-4 20 q-17 9 -34 0 Z" fill="#faf3ea" stroke="#eadbc8" strokeWidth="1.2" />
      <circle cx="65" cy="108" r="4" fill="#e6cdb0" />
    </svg>
  );
}

function Landing() {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<'all' | Album>('all');
  const [showApplyPopup, setShowApplyPopup] = useState(false);
  const [showPitchTest, setShowPitchTest] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const { lang, t } = useLang();
  const gt = (text: string) => (lang === 'en' ? GALLERY_EN[text] ?? text : text);

  const dismissApplyPopup = useCallback(() => setShowApplyPopup(false), []);

  const scrollToSection = useCallback((sectionId: string) => {
    // Mobil menüden gelindiyse kaydırma kilidini hemen kaldır ki scroll çalışsın.
    document.documentElement.style.overflow = '';
    setIsMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const openAssistant = useCallback(() => {
    document.documentElement.style.overflow = '';
    setIsMenuOpen(false);
    if (!showChatbot) setIsLoading(true);
    setShowChatbot(true);
    // Panel render edildikten sonra ona kaydır (içerik yüksekliği değiştiği için bölüm başına değil).
    window.setTimeout(() => {
      document.getElementById('av-chat')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }, [showChatbot]);

  const openPitchTest = useCallback(() => {
    setIsMenuOpen(false);
    setShowPitchTest(true);
  }, []);

  // Aktif bölüm takibi (scroll-spy)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    SPY_SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // Navigasyon cam efektinin yoğunluğu
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Kartlarda imleci takip eden yumuşak ışık (.av-spot)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.('.av-spot') as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // Açık katmanlarda sayfa kaydırmasını kilitle
  const isLocked = isMenuOpen || lightbox !== null || showApplyPopup;
  useEffect(() => {
    if (!isLocked) return;
    const root = document.documentElement;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = '';
    };
  }, [isLocked]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  // Başvuru popup'ı — siteye her girişte gösterilir (başvurular açıkken).
  useEffect(() => {
    if (!APPLICATIONS_OPEN) return;
    const t = setTimeout(() => setShowApplyPopup(true), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showApplyPopup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissApplyPopup();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showApplyPopup, dismissApplyPopup]);

  // Galeri — seçili albüm; lightbox yalnızca görünen kareler arasında gezinir
  const shots = galleryFilter === 'all' ? galleryImages : galleryImages.filter((img) => img.album === galleryFilter);
  const total = shots.length;
  const showNext = useCallback(() => setLightbox((i) => (i === null ? i : (i + 1) % total)), [total]);
  const showPrev = useCallback(() => setLightbox((i) => (i === null ? i : (i - 1 + total) % total)), [total]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      else if (e.key === 'ArrowRight') showNext();
      else if (e.key === 'ArrowLeft') showPrev();
    };
    document.addEventListener('keydown', onKey);
    document.querySelector('.av-lightbox__thumbs .is-active')?.scrollIntoView({ block: 'nearest', inline: 'center' });
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox, showNext, showPrev]);

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) showNext();
    else showPrev();
  };

  const year = new Date().getFullYear();

  return (
    <div className="av-root">
      {/* Navigasyon */}
      <nav className="av-nav" data-scrolled={isScrolled} aria-label={t('Ana menü', 'Main menu')}>
        <div className="av-nav__bar">
          <button type="button" className="av-brand" onClick={() => scrollToSection('home')} aria-label={t('Agora Voice — başa dön', 'Agora Voice — back to top')}>
            <img src="/agora.png" alt="" />
            <span>Agora Voice</span>
          </button>

          <div className="av-nav__links">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`av-nav__link${activeSection === item.id ? ' is-active' : ''}`}
                aria-current={activeSection === item.id ? 'true' : undefined}
              >
                {t(item.label, item.en)}
              </button>
            ))}
            <a href="/festival-ai" className="av-nav__link">
              Festival <b>AI</b>
            </a>
          </div>

          <div className="av-nav__right">
            <LangSwitch />
            <button type="button" onClick={openPitchTest} className="av-btn av-btn--primary av-btn--sm av-nav__cta">
              <Mic size={16} strokeWidth={2.25} aria-hidden />
              {t('Ses Testi', 'Voice Test')}
            </button>
            <button type="button" className="av-nav__burger" onClick={() => setIsMenuOpen(true)} aria-label={t('Menüyü aç', 'Open menu')} aria-expanded={isMenuOpen}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobil menü */}
      {isMenuOpen && (
        <div className="av-sheet" role="dialog" aria-modal="true" aria-label={t('Menü', 'Menu')}>
          <div className="av-sheet__top">
            <button type="button" className="av-brand" onClick={() => scrollToSection('home')}>
              <img src="/agora.png" alt="" />
              <span>Agora Voice</span>
            </button>
            <div className="av-nav__right">
              <LangSwitch />
              <button type="button" className="av-sheet__close" onClick={() => setIsMenuOpen(false)} aria-label={t('Menüyü kapat', 'Close menu')} autoFocus>
                <X size={20} />
              </button>
            </div>
          </div>
          <ul className="av-sheet__list">
            {[{ id: 'home', label: 'Ana Sayfa', en: 'Home' }, ...NAV_ITEMS].map((item, i) => (
              <li key={item.id} style={{ '--i': i } as CSSProperties}>
                <button type="button" onClick={() => scrollToSection(item.id)} className={activeSection === item.id ? 'is-active' : ''}>
                  <small>{pad(i + 1)}</small>
                  {t(item.label, item.en)}
                </button>
              </li>
            ))}
            <li style={{ '--i': NAV_ITEMS.length + 1 } as CSSProperties}>
              <button type="button" onClick={openPitchTest}>
                <small>{pad(NAV_ITEMS.length + 2)}</small>
                {t('Ses Testi', 'Voice Test')}
              </button>
            </li>
            <li style={{ '--i': NAV_ITEMS.length + 2 } as CSSProperties}>
              <a href="/festival-ai">
                <small>{pad(NAV_ITEMS.length + 3)}</small>
                Festival AI
              </a>
            </li>
          </ul>
          <div className="av-sheet__foot">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <a href="https://instagram.com/agoravoice" target="_blank" rel="noopener noreferrer">@agoravoice</a>
          </div>
        </div>
      )}

      <main>
        {/* Hero */}
        <header id="home" className="av-hero">
          <div className="av-hero__bg" style={{ backgroundImage: 'url(/hero-aassm.jpg)' }} aria-hidden="true" />
          <div className="av-wrap">
            <button type="button" className="av-award-pill" onClick={() => scrollToSection('journey')}>
              <span><Trophy size={14} aria-hidden /> Ohrid 2026</span>
              <span>{t('II. Ödül & En İyi Sahne Performansı', '2nd Prize & Best Stage Performance')}</span>
            </button>

            <h1 className="av-display av-hero__title">
              <span className="sr-only">Agora Voice — </span>
              <span style={{ '--i': 0 } as CSSProperties}>{t("Antik Agora'dan", 'From the Ancient Agora')}</span>
              <span style={{ '--i': 1 } as CSSProperties}>
                {t('dünya', 'to world')}{' '}
                <span className="av-squiggle">
                  {t('sahnelerine', 'stages')}
                  <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M4 16 C 50 4, 90 4, 130 14 S 210 24, 250 10 S 290 6, 296 12" />
                  </svg>
                </span>
              </span>
            </h1>

            <p className="av-lead av-hero__sub">
              {t(
                "Koromuz, İzmir Antik Agora'nın ruhuyla harmanlanmış ekibi ile birlikte yurt içi ve yurt dışındaki festivallerde başarılı performanslarla ülkemizi gururla temsil etmeyi amaçlamaktadır.",
                'Inspired by the spirit of Izmir’s Ancient Agora, our choir aims to proudly represent our country with outstanding performances at festivals in Türkiye and abroad.',
              )}
            </p>

            <div className="av-hero__ctas">
              {APPLICATIONS_OPEN && (
                <a href={APPLY_FORM_URL} target="_blank" rel="noopener noreferrer" className="av-btn av-btn--apply">
                  <Music size={18} aria-hidden />
                  {t('Başvuru Formu', 'Application Form')}
                  <ArrowUpRight size={18} className="av-arrow-diag" aria-hidden />
                </a>
              )}
              <button type="button" onClick={() => scrollToSection('secmeler')} className="av-btn av-btn--primary">
                {t('Seçmeler', 'Auditions')}
                <ArrowRight size={18} className="av-arrow" aria-hidden />
              </button>
              <button type="button" onClick={openPitchTest} className="av-btn av-btn--ghost">
                <Mic size={18} aria-hidden />
                {t('Ses Aralığı Testi', 'Vocal Range Test')}
              </button>
              <button type="button" onClick={() => scrollToSection('reels')} className="av-btn av-btn--text">
                <Play size={17} aria-hidden />
                {t('Videolarımızı izle', 'Watch our videos')}
              </button>
            </div>
            {!APPLICATIONS_OPEN && (
              <p className="av-closed-note">
                <b>{t('2026 – 2027 başvurularımız tamamlandı.', 'Applications for 2026 – 2027 are closed.')}</b>{' '}
                {t('Yeni dönem başvuruları açıldığında buradan duyuracağız.', 'We’ll announce here when applications for the next season open.')}
              </p>
            )}
          </div>
          <span className="av-scroll-cue" aria-hidden="true" />
        </header>

        {/* Durak şeridi */}
        <div className="av-marquee" aria-hidden="true">
          <div className="av-marquee__track">
            {[0, 1].map((copy) => (
              <div key={copy} style={{ display: 'flex' }}>
                {marqueeWords(lang).map((word) => <span key={word}>{word}</span>)}
              </div>
            ))}
          </div>
        </div>

        {/* Biz Kimiz */}
        <section id="about" className="av-section" aria-labelledby="about-title">
          <div className="av-wrap">
            <div className="av-story">
              <Reveal className="av-story__media">
                <img src="/gallery/g-b4ea23948026.jpg" alt={t('Agora Voice beyaz kostümleriyle Ohrid Koro Festivali sahnesinde', 'Agora Voice in white costumes on the Ohrid Choir Festival stage')} loading="lazy" />
                <div className="av-story__badge">
                  <span><Trophy size={20} aria-hidden /></span>
                  <div>
                    <b>Ohrid Choir Festival 2026</b>
                    <small>{t('II. Ödül · En İyi Sahne Performansı', '2nd Prize · Best Stage Performance')}</small>
                  </div>
                </div>
              </Reveal>
              <Reveal className="av-story__body" delay={120}>
                <span className="av-eyebrow">{t('Hikâyemiz', 'Our story')}</span>
                <h2 id="about-title" className="av-display av-h2">{t('Biz', 'Who')} <em>{t('Kimiz', 'We Are')}</em></h2>
                <p>
                  {t(
                    'Agora Voice; farklı yaş ve meslek gruplarından koristlerin, ulusal ve uluslararası festival ve etkinliklerde çalışmalarını profesyonel şekilde sergilemek için 27 Ocak 2025 tarihinde bir araya gelerek kurdukları çok sesli bir korodur.',
                    'Agora Voice is a polyphonic choir founded on 27 January 2025 by choristers of different ages and professions, who came together to present their work professionally at national and international festivals and events.',
                  )}
                </p>
                <div className="av-story__mission">
                  <span className="av-eyebrow">{t('Hedefimiz', 'Our mission')}</span>
                  <p>{t('Sanatı, sesi ve ortak tutkuyu bir araya getirerek yurt içi ve yurt dışında ülkemizi başarıyla temsil etmek.', 'To successfully represent our country at home and abroad by bringing together art, voice and shared passion.')}</p>
                </div>
                <div className="av-stats">
                  {STATS.map((s) => (
                    <div key={s.label} className="av-stat">
                      <b>{lang === 'en' ? s.en_value ?? s.value : s.value}</b>
                      <span>{t(s.label, s.en)}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal className="av-card av-conductor">
              <div className="av-conductor__photo">
                <img src="/ozlem-profil.jpg" alt={t('Şef Özlem VARIŞLI ATÇEKEN', 'Conductor Özlem VARIŞLI ATÇEKEN')} loading="lazy" />
              </div>
              <div className="av-conductor__body">
                <span className="av-eyebrow">{t('Koro Şefimiz', 'Our Conductor')}</span>
                <h3 className="av-display av-conductor__name">Özlem Varışlı Atçeken</h3>
                <p>
                  <b>Özlem VARIŞLI ATÇEKEN</b>
                  {t(
                    ", 1997’den bu yana birçok koroyu yönetmiş deneyimli bir müzik eğitimcisidir. 2010’dan beri Güzel Sanatlar Liselerinde koro öğretmenliği ve şeflik yapmaktadır. Halen Aydın Yüksel Yalova Güzel Sanatlar Lisesi'nde görevini sürdürmektedir. Yönettiği korolarla çok sayıda festivale katılmış ve ödüller kazanmıştır.",
                    ' is an experienced music educator who has led many choirs since 1997. Since 2010 she has worked as a choir teacher and conductor at Fine Arts High Schools, and currently teaches at Aydın Yüksel Yalova Fine Arts High School. She has taken part in many festivals and won numerous awards with the choirs she conducts.',
                  )}
                </p>
                <p>{t("Selçuk Üniversitesi Müzik Eğitimi Bölümü mezunu olup, Necmettin Erbakan Üniversitesi'nde Müzik Eğitimi üzerine yüksek lisans yapmıştır.", 'She graduated from the Music Education Department of Selçuk University and holds a master’s degree in Music Education from Necmettin Erbakan University.')}</p>
                <p>{t('Detaylı bilgi ve görseller için şefimizin Instagram sayfasını ziyaret edebilirsiniz:', 'For more information and photos, visit our conductor’s Instagram page:')}</p>
                <div className="av-pills">
                  <a className="av-pill" href="https://instagram.com/ozlemchoir" target="_blank" rel="noopener noreferrer">
                    <Instagram size={16} aria-hidden /> @ozlemchoir
                  </a>
                  <a className="av-pill" href="https://instagram.com/agoravoice" target="_blank" rel="noopener noreferrer">
                    <Instagram size={16} aria-hidden /> @agoravoice
                  </a>
                </div>
              </div>
            </Reveal>

            <div className="av-bento">
              <Reveal className="av-card av-spot av-span-2">
                <div className="av-icon"><Users size={22} /></div>
                <h3>{t('Koro Hakkında', 'About the Choir')}</h3>
                <p>
                  {t(
                    'Korist ekibimiz, yurt içi ve yurt dışında birçok festivale katılmış deneyimli üyelerden oluşuyor. Her birimiz farklı meslek gruplarından geliyoruz; ancak ortak noktamız müziğe duyduğumuz sevgi ve tutkudur. Amacımız, hem ülkemizde hem de uluslararası festivallerde başarılı performanslar sergileyerek ülkemizi gururla temsil etmektir.',
                    'Our choristers are experienced singers who have taken part in many festivals in Türkiye and abroad. We come from different professions, but what we share is our love and passion for music. Our goal is to proudly represent our country with successful performances at home and at international festivals.',
                  )}
                </p>
                {lang === 'en' ? (
                  <p>Our conductor is accompanied by piano teacher and arranger <b>Rıza ATÇEKEN</b> as répétiteur.</p>
                ) : (
                  <p>Çalışmalarımızda şefimize, piyano öğretmeni, aranjör <b>Rıza ATÇEKEN</b> korrepeditör olarak eşlik etmektedir.</p>
                )}
              </Reveal>
              <Reveal className="av-card av-spot av-span-2" delay={80}>
                <div className="av-icon"><AudioLines size={22} /></div>
                <h3>{t('A Cappella Nedir?', 'What is A Cappella?')}</h3>
                <p>
                  {t(
                    'A cappella, enstrümansız yani sadece insan sesleriyle icra edilen müzik anlamına gelir. Koro müziğinde a cappella önemli bir yere sahiptir, çünkü insan sesinin tek başına bir enstrüman gibi kullanılabileceğini ve çok sesli uyumlar yaratılabileceğini gösterir.',
                    'A cappella means music performed without instruments — with human voices alone. It holds a special place in choral music, showing that the human voice can be used as an instrument on its own and create rich polyphonic harmonies.',
                  )}
                </p>
              </Reveal>
              <Reveal className="av-card av-spot av-span-2" delay={160}>
                <div className="av-icon"><Music size={22} /></div>
                <h3>{t('Koro Nedir?', 'What is a Choir?')}</h3>
                <p>
                  {t(
                    'Koro, bir müzik eserini birlikte söylemek amacıyla bir araya gelen şarkıcılardan oluşan topluluktur. Farklı ses gruplarından oluşur ve birlikte şarkı söylemek, ekip çalışması ve dikkatli dinleme gerektirir; ortaya tek bir yürekten çıkan muhteşem bir ahenk çıkar.',
                    'A choir is a group of singers who come together to perform a piece of music. It is made up of different voice parts, and singing together requires teamwork and careful listening — the result is a wonderful harmony that sounds like a single heart.',
                  )}
                </p>
              </Reveal>
              <Reveal className="av-card av-card--ink av-spot av-span-6">
                <div className="av-icon"><Star size={22} /></div>
                <h3>{t('Hedeflerimiz', 'Our Goals')}</h3>
                <p>
                  {t(
                    'Koromuzun amacı, müzik sevgisini paylaşmak, üyelerimizin ses ve müzikal yeteneklerini geliştirmek ve birlikte kaliteli performanslar sergilemektir. Çalışmalarımızda disiplin ve keyfi bir arada tutmaya özen gösteriyoruz.',
                    'Our choir aims to share a love of music, develop our members’ vocal and musical skills, and deliver high-quality performances together. We take care to balance discipline and enjoyment in our work.',
                  )}
                </p>
                <div className="av-process">
                  <div>
                    <span>01</span>
                    <b>{t('Nota tekrarı', 'Note learning')}</b>
                    <p>{t('Önce nota tekrarı yaparak eserin ritmini ve seslerini öğreniriz.', 'First we learn the rhythm and notes of the piece.')}</p>
                  </div>
                  <div>
                    <span>02</span>
                    <b>{t('Anlam ve duygu', 'Meaning & emotion')}</b>
                    <p>{t('Eserin anlamını ve duygusunu kavrayıp provalarda birlikte çalışırız.', 'We grasp the meaning and emotion of the piece and work on it together in rehearsals.')}</p>
                  </div>
                  <div>
                    <span>03</span>
                    <b>{t('Tam uyum', 'Full harmony')}</b>
                    <p>{t('Şarkıyı tam bir uyumla seslendirmeye hazır hale getiririz.', 'We get the song ready to be sung in complete harmony.')}</p>
                  </div>
                </div>
                <p>
                  {t(
                    'Koromuz düzenli olarak prova yaparak repertuvarını zenginleştirir ve sürekli gelişmeyi hedefler. Ayrıca ekibimiz, yurt içi ve yurt dışı festival ve yarışmalara katılmayı amaçlar. Hep birlikte başarılar elde etmek ve müziğimizi daha geniş kitlelere duyurmak, en büyük motivasyon kaynaklarımızdandır.',
                    'Through regular rehearsals our choir keeps expanding its repertoire and strives to keep improving. Our team also aims to take part in festivals and competitions in Türkiye and abroad. Achieving success together and bringing our music to wider audiences are among our greatest motivations.',
                  )}
                </p>
              </Reveal>
              <Reveal className="av-card av-span-6">
                <h3>{t('Çalışma İlkelerimiz', 'Our Principles')}</h3>
                <ol className="av-principles">
                  {PRINCIPLES.map(([tr, en], i) => (
                    <li key={tr}>
                      <span>{pad(i + 1)}</span>
                      {t(tr, en)}
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Yolculuğumuz */}
        <section id="journey" className="av-section av-section--white" aria-labelledby="journey-title">
          <div className="av-wrap av-wrap--narrow">
            <Reveal className="av-section-head">
              <span className="av-eyebrow">Agora Voice</span>
              <h2 id="journey-title" className="av-display av-h2">{t('Yolculuğumuz', 'Our Journey')}</h2>
              <p className="av-lead">
                {t("İzmir'in tarihî mekânlarından uluslararası festival sahnelerine… Agora Voice'u bugüne taşıyan duraklar.", 'From Izmir’s historic venues to international festival stages… the milestones that brought Agora Voice to where it is today.')}
              </p>
            </Reveal>
            <Journey />
          </div>
        </section>

        {/* Seçmeler */}
        <Secmeler applicationsOpen={APPLICATIONS_OPEN} onStartPitchTest={openPitchTest} onAskAssistant={openAssistant} />

        {/* Videolar */}
        <section id="reels" className="av-section" aria-labelledby="reels-title">
          <div className="av-wrap">
            <Reveal className="av-section-head">
              <span className="av-eyebrow">Instagram</span>
              <h2 id="reels-title" className="av-display av-h2">{t('Sahneden', 'Videos from')} <em>{t('videolar', 'the stage')}</em></h2>
              <p className="av-lead">{t('Provalarımızdan, konserlerimizden ve festival yolculuğumuzdan kısa videolar — doğrudan buradan izleyin.', 'Short videos from our rehearsals, concerts and festival journey — watch them right here.')}</p>
            </Reveal>
            <Reels />
          </div>
        </section>

        {/* Dijital araçlar — AI Asistan, Ses Testi, Festival AI */}
        <section id="ai-assistant" className="av-section av-dark" aria-labelledby="ai-title">
          <div className="av-wrap">
            <Reveal className="av-section-head">
              <span className="av-eyebrow">{t('AI Asistan', 'AI Assistant')}</span>
              <h2 id="ai-title" className="av-display av-h2">
                {t('Antik bilgelik,', 'Ancient wisdom,')} <em>{t('modern zeka', 'modern intelligence')}</em>
              </h2>
              <p className="av-lead">{t('Antik bilgelik ile modern yapay zekayı buluşturan agora sohbet asistanı', 'The Agora chat assistant, where ancient wisdom meets modern AI')}</p>
            </Reveal>

            {showChatbot && (
              <div className="av-chat" id="av-chat">
                <div className="av-chat__bar">
                  <div className="av-chat__who">
                    <RobotMascot />
                    <div>
                      <b>{t('Agora Voice Asistanı', 'Agora Voice Assistant')}</b>
                      <small><i aria-hidden="true" /> {t('Çevrimiçi', 'Online')}</small>
                    </div>
                  </div>
                  <button type="button" className="av-chat__close" onClick={() => setShowChatbot(false)} aria-label={t('Asistanı kapat', 'Close assistant')}>
                    <X size={20} />
                  </button>
                </div>
                <div className="av-chat__frame">
                  <iframe
                    src={CHATBOT_URL}
                    title="Agora Voice Assistant Chatbot"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-presentation"
                    onLoad={() => setIsLoading(false)}
                  />
                  {isLoading && (
                    <div className="av-chat__loading">
                      <div className="av-spinner" />
                      <p>{t('Agora Voice Asistanı yükleniyor…', 'Loading Agora Voice Assistant…')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={`av-tools${showChatbot ? ' av-tools--row' : ''}`}>
              {!showChatbot && (
                <Reveal className="av-tile av-spot av-ai">
                  <div className="av-ai__orb">
                    <span className="av-ai__ring" />
                    <span className="av-ai__ring" style={{ '--dl': '1.2s' } as CSSProperties} />
                    <span className="av-ai__ring" style={{ '--dl': '2.4s' } as CSSProperties} />
                    <RobotMascot className="av-robot" />
                  </div>
                  <h3 className="av-display">{t('Merhaba! 👋', 'Hello! 👋')}</h3>
                  <p>{t('Agora Voice hakkında aklındaki her şeyi bana sorabilirsin.', 'Ask me anything you’d like to know about Agora Voice.')}</p>
                  <button type="button" onClick={openAssistant} className="av-btn av-btn--violet">
                    <MessageCircle size={19} strokeWidth={2.25} aria-hidden />
                    {t('Yapay Zeka Asistanına Sor', 'Ask the AI Assistant')}
                  </button>
                  <span className="av-ai__hint">{t('Seçmeler, provalar ve koro hakkında 7/24 yanıt', '24/7 answers about auditions, rehearsals and the choir')}</span>
                </Reveal>
              )}
              <Reveal as="button" type="button" onClick={openPitchTest} className="av-tile av-spot" delay={90}>
                <span className="av-eyebrow">{t('Ses Aralığı Testi', 'Vocal Range Test')}</span>
                <h3>{t('Hangi ses grubundasın?', 'Which voice part are you?')}</h3>
                <p>{t('Ücretsiz ses aralığı testimizle hangi ses grubuna uygun olduğunuzu hemen keşfedin.', 'Find out which voice part suits you with our free vocal range test.')}</p>
                <div className="av-tile__foot">
                  <AudioLines size={34} color="#e8b48a" aria-hidden />
                  <span className="av-tile__arrow"><ArrowUpRight size={20} /></span>
                </div>
              </Reveal>
              <Reveal as="a" href="/festival-ai" className="av-tile av-spot" delay={180}>
                <span className="av-eyebrow">Festival AI</span>
                <h3>{t('Festival araştırma platformu', 'Festival research platform')}</h3>
                <p>{t('Festivalleri karşılaştırın, geçmiş repertuvarları ve jüri beklentilerini inceleyin; koro için hazırlık planı oluşturun.', 'Compare festivals, explore past repertoires and jury expectations, and build a preparation plan for the choir.')}</p>
                <div className="av-tile__foot">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--av-on-dark-muted)', fontSize: '.82rem' }}>
                    <Compass size={22} color="#e8b48a" aria-hidden />
                    <LockKeyhole size={14} aria-hidden /> {t('Şifreli erişim', 'Password protected')}
                  </span>
                  <span className="av-tile__arrow"><ArrowUpRight size={20} /></span>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Konser Takvimi — şimdilik gizli */}
        {SHOW_CONCERT_CALENDAR && (
          <section id="konser-takvimi" className="av-section" aria-labelledby="concert-title">
            <div className="av-wrap">
              <Reveal className="av-section-head">
                <span className="av-eyebrow">{t('Konser Takvimi', 'Concert Calendar')}</span>
                <h2 id="concert-title" className="av-display av-h2">{t('Planlanan konser ve festivallerimiz', 'Upcoming concerts and festivals')}</h2>
              </Reveal>
              <ul className="av-concerts">
                {concerts.map((c, i) => (
                  <Reveal as="li" key={c.name} className="av-concert" delay={i * 80}>
                    <span className="av-concert__date">{c.date}</span>
                    <div>
                      <h3>{c.name}</h3>
                      {c.detail && <p>{c.detail}</p>}
                    </div>
                    <span className="av-pill"><MapPin size={15} aria-hidden /> {c.location}</span>
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Galeri */}
        <section id="gallery" className="av-section" aria-labelledby="gallery-title">
          <div className="av-wrap">
            <Reveal className="av-section-head">
              <span className="av-eyebrow">{t('Galeri', 'Gallery')}</span>
              <h2 id="gallery-title" className="av-display av-h2">{t('Sahneden', 'Moments from')} <em>{t('kareler', 'the stage')}</em></h2>
              <p className="av-lead">{t('Provalarımızdan, etkinliklerimizden ve Ohrid Koro Festivali 2026 yolculuğumuzdan kareler', 'Photos from our rehearsals, events and our Ohrid Choir Festival 2026 journey')}</p>
            </Reveal>
            <div className="av-gallery-tabs">
              <div className="av-tabs" role="tablist" aria-label={t('Galeri albümleri', 'Gallery albums')}>
                {GALLERY_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={galleryFilter === f.id}
                    className="av-tab"
                    onClick={() => setGalleryFilter(f.id)}
                  >
                    {t(f.label, f.en)}
                    <small>{f.id === 'all' ? galleryImages.length : galleryImages.filter((img) => img.album === f.id).length}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="av-gallery" key={galleryFilter}>
              {shots.map((image, index) => (
                <Reveal
                  as="button"
                  type="button"
                  key={image.src}
                  delay={(index % 4) * 70}
                  className={`av-shot${image.size ? ` av-shot--${image.size}` : ''}`}
                  onClick={() => setLightbox(index)}
                  aria-label={`${gt(image.title)} — ${t('büyüt', 'enlarge')} (${index + 1}/${total})`}
                >
                  <img src={image.src} alt={gt(image.alt)} loading="lazy" decoding="async" />
                  <span className="av-shot__cap">
                    {gt(image.title)}
                    <small>{pad(index + 1)} / {pad(total)} <Maximize2 size={13} style={{ display: 'inline', marginLeft: 6 }} aria-hidden /></small>
                  </span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* İletişim */}
        <section id="contact" className="av-section" aria-labelledby="contact-title">
          <div className="av-wrap">
            <Reveal className="av-contact">
              <div>
                <span className="av-eyebrow">{t('İletişim', 'Contact')}</span>
                <h2 id="contact-title" className="av-display av-contact__title">
                  {t('Birlikte', 'Let’s sing')} <em>{t('söyleyelim', 'together')}</em>
                </h2>
                <p className="av-lead">{t('Her türlü soru, öneri ve iş birliği için bize e-posta gönderebilirsiniz.', 'Email us with any questions, suggestions or collaboration ideas.')}</p>
                <a href={`mailto:${CONTACT_EMAIL}`} className="av-bigmail">
                  {CONTACT_EMAIL}
                  <ArrowUpRight size={22} aria-hidden />
                </a>
                <div style={{ marginTop: '1.6rem' }}>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="av-btn av-btn--primary">
                    <Mail size={18} aria-hidden />
                    {t('E-posta Gönder', 'Send an Email')}
                    <ArrowRight size={18} className="av-arrow" aria-hidden />
                  </a>
                </div>
              </div>
              <ul className="av-channels">
                <li>
                  <a href={`mailto:${CONTACT_EMAIL}`}>
                    <span className="av-icon"><Mail size={20} /></span>
                    <span><small>{t('E-posta', 'Email')}</small><b>{CONTACT_EMAIL.split('@')[0]}@<wbr />{CONTACT_EMAIL.split('@')[1]}</b></span>
                    <ArrowUpRight size={20} className="av-arrow-diag" aria-hidden />
                  </a>
                </li>
                <li>
                  <a href="https://www.agoravoice.com.tr" target="_blank" rel="noopener noreferrer">
                    <span className="av-icon"><Globe size={20} /></span>
                    <span><small>{t('Web Sitesi', 'Website')}</small><b>www.<wbr />agoravoice.com.tr</b></span>
                    <ArrowUpRight size={20} className="av-arrow-diag" aria-hidden />
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com/agoravoice" target="_blank" rel="noopener noreferrer">
                    <span className="av-icon"><Instagram size={20} /></span>
                    <span><small>Instagram</small><b>@agoravoice</b></span>
                    <ArrowUpRight size={20} className="av-arrow-diag" aria-hidden />
                  </a>
                </li>
                <li>
                  <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                    <span className="av-icon"><MapPin size={20} /></span>
                    <span><small>{t('Prova yeri', 'Rehearsal venue')}</small><b>{t('Narlıdere Atatürk Kültür Merkezi', 'Narlıdere Atatürk Cultural Center')}</b></span>
                    <ArrowUpRight size={20} className="av-arrow-diag" aria-hidden />
                  </a>
                </li>
              </ul>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="av-footer">
        <div className="av-wrap">
          <div className="av-footer__top">
            <p>{t("İzmir Antik Agora'nın ruhundan ilham alan çok sesli a cappella koro. Narlıdere Atatürk Kültür Merkezi, İzmir.", 'A polyphonic a cappella choir inspired by the spirit of Izmir’s Ancient Agora. Narlıdere Atatürk Cultural Center, Izmir.')}</p>
            <div className="av-footer__links">
              {NAV_ITEMS.map((item) => (
                <button key={item.id} type="button" onClick={() => scrollToSection(item.id)}>{t(item.label, item.en)}</button>
              ))}
              <a href="/festival-ai">Festival AI</a>
            </div>
          </div>
          <span className="av-wordmark" aria-hidden="true">Agora Voice</span>
          <div className="av-footer__bottom">
            <span>© 2025{year > 2025 ? `–${year}` : ''} Agora Voice. {t('Tüm hakları saklıdır.', 'All rights reserved.')}</span>
            <div className="av-footer__legal">
              <a href="/kvkk">{t('KVKK Aydınlatma Metni', 'Privacy Notice (KVKK)')}</a>
              <span>
                Design by{' '}
                <a href="https://instagram.com/mennansevim" target="_blank" rel="noopener noreferrer">@mennansevim</a>
              </span>
            </div>
            <button type="button" className="av-round" onClick={() => scrollToSection('home')} aria-label={t('Başa dön', 'Back to top')}>
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </footer>

      {/* Galeri lightbox */}
      {lightbox !== null && (
        <div className="av-lightbox" role="dialog" aria-modal="true" aria-label={t('Galeri', 'Gallery')} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="av-lightbox__bar">
            <span>
              {pad(lightbox + 1)} / {pad(total)} · {gt(shots[lightbox].title)}
            </span>
            <button type="button" className="av-round" onClick={() => setLightbox(null)} aria-label={t('Kapat', 'Close')} autoFocus>
              <X size={20} />
            </button>
          </div>
          <div className="av-lightbox__stage" onClick={(e) => e.target === e.currentTarget && setLightbox(null)}>
            <img key={lightbox} src={shots[lightbox].src} alt={gt(shots[lightbox].alt)} />
            <button type="button" className="av-round av-lightbox__nav av-lightbox__nav--prev" onClick={showPrev} aria-label={t('Önceki fotoğraf', 'Previous photo')}>
              <ChevronLeft size={22} />
            </button>
            <button type="button" className="av-round av-lightbox__nav av-lightbox__nav--next" onClick={showNext} aria-label={t('Sonraki fotoğraf', 'Next photo')}>
              <ChevronRight size={22} />
            </button>
          </div>
          <div className="av-lightbox__thumbs">
            {shots.map((image, i) => (
              <button key={image.src} type="button" className={i === lightbox ? 'is-active' : ''} onClick={() => setLightbox(i)} aria-label={t(`${i + 1}. fotoğraf`, `Photo ${i + 1}`)}>
                <img src={image.src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Başvuru popup'ı — girişte açılır */}
      {APPLICATIONS_OPEN && showApplyPopup && (
        <div className="av-modal" role="presentation" onClick={dismissApplyPopup}>
          <div role="dialog" aria-modal="true" aria-labelledby="apply-popup-title" className="av-modal__card" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={dismissApplyPopup} className="av-modal__close" aria-label={t('Kapat', 'Close')}>
              <X size={20} strokeWidth={1.75} />
            </button>
            <span className="av-modal__badge">
              <Star size={13} strokeWidth={2.25} />
              {t('2026 - 2027 Dönemi', '2026 - 2027 Season')}
            </span>
            <h3 id="apply-popup-title" className="av-display">
              {t('Başvurularımız', 'Applications')} <em>{t('Başladı!', 'Are Open!')}</em>
            </h3>
            <p>
              {t(
                'Agora Voice çok sesli a cappella koro seçmelerine katılmak için hemen başvur. Yurt içi ve yurt dışı festivallerde sahne almaya hazır mısın?',
                'Apply now to audition for the Agora Voice polyphonic a cappella choir. Ready to perform at festivals in Türkiye and abroad?',
              )}
            </p>
            <a href={APPLY_FORM_URL} target="_blank" rel="noopener noreferrer" onClick={dismissApplyPopup} className="av-btn av-btn--apply av-btn--block" style={{ marginTop: '1.6rem' }}>
              <Music size={18} strokeWidth={2.25} aria-hidden />
              {t('Hemen Başvur', 'Apply Now')}
            </a>
            <div className="av-modal__or">{t('veya', 'or')}</div>
            <p style={{ color: 'var(--av-ink)', fontWeight: 500 }}>{t('Önce ses aralığını merak ediyor musun?', 'Curious about your vocal range first?')}</p>
            <p style={{ fontSize: '.82rem' }}>{t('Ücretsiz ses testimizle hangi ses grubuna uygun olduğunu keşfet.', 'Find out which voice part suits you with our free voice test.')}</p>
            <button
              type="button"
              onClick={() => {
                dismissApplyPopup();
                setShowPitchTest(true);
              }}
              className="av-btn av-btn--ghost av-btn--block av-btn--sm"
              style={{ marginTop: '1rem' }}
            >
              <Mic size={16} strokeWidth={2.25} aria-hidden />
              {t('Ses Testini Dene', 'Try the Voice Test')}
            </button>
            <div className="av-modal__ai">
              <RobotMascot className="av-robot" />
              <button
                type="button"
                onClick={() => {
                  dismissApplyPopup();
                  openAssistant();
                }}
                className="av-btn av-btn--violet av-btn--block av-btn--sm"
              >
                <MessageCircle size={16} strokeWidth={2.25} aria-hidden />
                {t('Yapay Zeka Asistanına Sor', 'Ask the AI Assistant')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPitchTest && (
        <Suspense fallback={null}>
          <PitchTest onClose={() => setShowPitchTest(false)} />
        </Suspense>
      )}
    </div>
  );
}

function App() {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    const Page = path === '/yonetim' ? AdminPanel : path === '/kvkk' ? KvkkPage : path === '/festival-ai' ? FestivalPlanner : null;
    if (Page) {
      return (
        <Suspense fallback={null}>
          <Page />
        </Suspense>
      );
    }
  }
  return (
    <LangProvider>
      <Landing />
    </LangProvider>
  );
}

export default App;
