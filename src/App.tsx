import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Bot,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Music,
  Globe,
  Star,
  Music2,
  Music3,
  Music4,
  Instagram,
  CalendarDays,
  MessageCircle
} from 'lucide-react';
import Secmeler from './Secmeler';
import PitchTest from './PitchTest';
import AdminPanel from './Admin';
import KvkkPage from './Kvkk';

// AI asistan robot maskotu — tamamen SVG (ekstra dosya yok). Gözler index.css'te kırpışır.
function RobotMascot({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 130 132" className={className} fill="none" aria-hidden="true">
      <line x1="65" y1="34" x2="65" y2="17" stroke="#b9a9e8" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="65" cy="12" r="6.5" fill="#ffffff" stroke="#cdbff0" strokeWidth="1.5" />
      <path d="M24 72 Q24 30 65 28 Q106 30 106 72" fill="none" stroke="#1c1830" strokeWidth="7" strokeLinecap="round" />
      <rect x="26" y="33" width="78" height="62" rx="29" fill="#ffffff" stroke="#ece7f8" strokeWidth="1.5" />
      <path d="M101 50 q12 4 9 18 q-4 10 -12 9 Z" fill="#7c6fd6" opacity="0.85" />
      <circle cx="26" cy="66" r="11.5" fill="#241f44" />
      <circle cx="104" cy="66" r="11.5" fill="#241f44" />
      <rect x="35" y="47" width="60" height="31" rx="15.5" fill="#15111f" />
      <circle className="agora-robot-eye" cx="52" cy="62" r="7" fill="#ff8fa3" />
      <circle className="agora-robot-eye" cx="78" cy="62" r="7" fill="#ff8fa3" />
      <path d="M26 75 Q27 95 50 91" fill="none" stroke="#241f44" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="52" cy="91" r="4.5" fill="#241f44" />
      <path d="M44 96 q21 11 42 0 l-4 20 q-17 9 -34 0 Z" fill="#f3f0fc" stroke="#e0d9f5" strokeWidth="1.2" />
      <circle cx="65" cy="108" r="4" fill="#cdbff0" />
    </svg>
  );
}

function App() {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showApplyPopup, setShowApplyPopup] = useState(false);
  const dismissApplyPopup = useCallback(() => {
    setShowApplyPopup(false);
  }, []);
  const [showPitchTest, setShowPitchTest] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Galeri resimleri - 100 resme kadar genişletilebilir
  const galleryImages = [
    { src: '/gallery/g-d2abaf115639.jpg', alt: 'Agora Voice Koro', title: 'Koro performansı' },
    { src: '/gallery/g-b2b59178cae8.jpg', alt: 'Agora Voice Koro', title: 'Koro çalışması' },
    { src: '/gallery/g-b4ce85fe2cf6.jpg', alt: 'Agora Voice Koro', title: 'Koro etkinliği' },
    { src: '/gallery/g-11c0b5cfff44.jpg', alt: 'Agora Voice Koro', title: 'Koro provası' },
    { src: '/gallery/g-d2b58cf4aaa9.jpg', alt: 'Agora Voice Koro', title: 'Koro performansı' },
    { src: '/gallery/g-89f4318bbc08.jpg', alt: 'Agora Voice Koro', title: 'Koro çalışması' },
    { src: '/gallery/g-58e16e113e0e.jpg', alt: 'Agora Voice Koro', title: 'Koro etkinliği' },
    { src: '/gallery/g-8ca268472a05.jpg', alt: 'Agora Voice Koro', title: 'Koro provası' },
    { src: '/gallery/g-1972b2630f76.jpg', alt: 'Agora Voice Koro', title: 'Koro performansı' },
    { src: '/gallery/g-612d6f3e1aac.jpg', alt: 'Agora Voice Koro', title: 'Koro etkinliği' },
    { src: '/gallery/g-836c6a99156c.jpg', alt: 'Agora Voice Koro', title: 'Koro provası' },
    { src: '/gallery/g-e1d5948ec702.jpg', alt: 'Agora Voice Koro', title: 'Koro performansı' },
  ];

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleChatbot = () => setShowChatbot((prev) => !prev);
  const handleFirstInteraction = () => setIsLoading(true);
  const handleMouseEnter = () => {};
  const handleMouseLeave = () => {};

  const openImageModal = (imageSrc: string, index: number) => {
    setSelectedImage(imageSrc);
    setCurrentImageIndex(index);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    setSelectedImage(galleryImages[(currentImageIndex + 1) % galleryImages.length].src);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    setSelectedImage(galleryImages[(currentImageIndex - 1 + galleryImages.length) % galleryImages.length].src);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedImage) {
      if (e.key === 'Escape') {
        closeImageModal();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentImageIndex]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'secmeler', 'ai-assistant', 'gallery', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Başvuru popup'ı — siteye her girişte gösterilir.
  useEffect(() => {
    if (typeof window === 'undefined' || window.location.pathname === '/yonetim' || window.location.pathname === '/kvkk') return;
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

  if (typeof window !== 'undefined') {
    if (window.location.pathname === '/yonetim') return <AdminPanel />;
    if (window.location.pathname === '/kvkk') return <KvkkPage />;
  }

  return (
    <div className="min-h-screen bg-marble">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-agora">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img src="/agora.png" alt="Agora Voice Logo" className="w-14 h-14 rounded-full border-4 border-bronze-gradient shadow-agora " />
              <span className="text-xl font-bold  font-agoravoice">Agora Voice</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('home')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'home' ? 'text-agora-terracotta' : 'text-agora-muted hover:text-agora-dark'
                }`}
              >
                Ana Sayfa
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'about' ? 'text-agora-terracotta' : 'text-agora-muted hover:text-agora-dark'
                }`}
              >
                Biz Kimiz
              </button>
              <button
                onClick={() => scrollToSection('secmeler')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'secmeler' ? 'text-agora-terracotta' : 'text-agora-muted hover:text-agora-dark'
                }`}
              >
                Seçmeler
              </button>
              <button
                onClick={() => scrollToSection('ai-assistant')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'ai-assistant' ? 'text-agora-terracotta' : 'text-agora-muted hover:text-agora-dark'
                }`}
              >
                AI Asistan
              </button>
              <button
                onClick={() => setShowPitchTest(true)}
                className="text-sm font-medium text-agora-muted hover:text-agora-dark transition-colors"
              >
                Ses Testi
              </button>
              <button
                onClick={() => scrollToSection('gallery')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'gallery' ? 'text-agora-terracotta' : 'text-agora-muted hover:text-agora-dark'
                }`}
              >
                Galeri
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'contact' ? 'text-agora-terracotta' : 'text-agora-muted hover:text-agora-dark'
                }`}
              >
                İletişim
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-agora-muted hover:text-agora-dark"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-stone-200">
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => scrollToSection('home')}
                  className={`text-left text-sm font-medium transition-colors ${
                    activeSection === 'home' ? 'text-agora-terracotta' : 'text-agora-muted hover:text-agora-dark'
                  }`}
                >
                  Ana Sayfa
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className={`text-left text-sm font-medium transition-colors ${
                    activeSection === 'about' ? 'text-agora-terracotta' : 'text-agora-muted hover:text-agora-dark'
                  }`}
                >
                  Biz Kimiz
                </button>
                <button
                  onClick={() => scrollToSection('secmeler')}
                  className={`text-left text-sm font-medium transition-colors ${
                    activeSection === 'secmeler' ? 'text-agora-terracotta' : 'text-agora-muted hover:text-agora-dark'
                  }`}
                >
                  Seçmeler
                </button>
                <button
                  onClick={() => scrollToSection('ai-assistant')}
                  className={`text-left text-sm font-medium transition-colors ${
                    activeSection === 'ai-assistant' ? 'text-agora-terracotta' : 'text-agora-muted hover:text-agora-dark'
                  }`}
                >
                  AI Asistan
                </button>
                <button
                  onClick={() => { setIsMenuOpen(false); setShowPitchTest(true); }}
                  className="text-left text-sm font-medium text-agora-muted hover:text-agora-dark transition-colors"
                >
                  Ses Testi
                </button>
                <button
                  onClick={() => scrollToSection('gallery')}
                  className={`text-left text-sm font-medium transition-colors ${
                    activeSection === 'gallery' ? 'text-agora-terracotta' : 'text-agora-muted hover:text-agora-dark'
                  }`}
                >
                  Galeri
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className={`text-left text-sm font-medium transition-colors ${
                    activeSection === 'contact' ? 'text-agora-terracotta' : 'text-agora-muted hover:text-agora-dark'
                  }`}
                >
                  İletişim
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section
          id="home"
          className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20 pb-12"
          style={{
            background:
              'radial-gradient(ellipse at center, #1c1611 0%, #0d0a07 60%, #000000 100%)',
          }}
        >
          {/* Sıcak ışık halesi — taş rengi ile harmoni */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[120%] h-[60%] pointer-events-none"
               style={{ background: 'radial-gradient(ellipse, rgba(217,179,131,0.12) 0%, rgba(180,140,90,0.05) 40%, transparent 70%)' }} />

          <div className="relative w-[88%] max-w-7xl mx-auto flex flex-col items-center z-10">
            <picture>
              <source srcSet="/hero-collage.webp" type="image/webp" />
              <img
                src="/hero-collage.jpg"
                alt="Agora Voice — Antik mekânlarda performans kolajı"
                className="w-full h-auto block drop-shadow-2xl"
                loading="eager"
              />
            </picture>

            <p className="text-center text-stone-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto mt-12 mb-8 px-4">
              Koromuz, İzmir Antik Agora'nın ruhuyla harmanlanmış ekibi ile birlikte yurt içi ve yurt dışındaki festivallerde başarılı performanslarla ülkemizi gururla temsil etmeyi amaçlamaktadır.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a
                href="https://forms.gle/Qgw4xp9jMte7y94h7"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center font-bold py-4 px-8 rounded-full text-lg text-white text-center overflow-hidden transition-all duration-500 transform hover:scale-110 animate-glow"
                style={{
                  background: 'linear-gradient(45deg, #e74c3c, #f39c12, #e67e22, #d35400)',
                  backgroundSize: '400% 400%',
                  animation: 'gradientShift 3s ease infinite, glow 2s ease-in-out infinite'
                }}
              >
                {/* Animasyonlu arka plan */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Parlama efekti */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                {/* Müzik notaları animasyonu */}
                <Music className="absolute -left-4 -top-4 text-white/80 opacity-0 group-hover:opacity-100 animate-music-float transition-all duration-300" style={{fontSize: '1.2rem'}} />
                <Music2 className="absolute -right-4 -bottom-4 text-white/80 opacity-0 group-hover:opacity-100 animate-music-float transition-all duration-300" style={{fontSize: '1rem', animationDelay: '0.5s'}} />
                <Music3 className="absolute -left-2 top-1/2 text-white/80 opacity-0 group-hover:opacity-100 animate-music-float transition-all duration-300" style={{fontSize: '0.8rem', animationDelay: '1s'}} />
                <Music4 className="absolute -right-2 top-1/2 text-white/80 opacity-0 group-hover:opacity-100 animate-music-float transition-all duration-300" style={{fontSize: '0.9rem', animationDelay: '1.5s'}} />

                {/* İçerik */}
                <span className="relative z-10 font-bold text-white drop-shadow-lg group-hover:scale-105 transition-transform duration-300">
                  🎵 Başvuru Formu 🎵
                </span>

                {/* Hover efekti için ekstra glow */}
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>

                {/* Pulse efekti */}
                <div className="absolute inset-0 rounded-full border-2 border-white/30 opacity-0 group-hover:opacity-100 animate-ping-slow"></div>
              </a>
              <button
                onClick={() => scrollToSection('secmeler')}
                className="font-semibold py-3 px-7 rounded-full text-stone-900 bg-stone-100 hover:bg-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Seçmeler
              </button>
              <button
                onClick={() => setShowPitchTest(true)}
                className="font-semibold py-3 px-7 rounded-full text-stone-100 border-2 border-stone-400/60 bg-white/5 backdrop-blur hover:bg-white/15 transition-colors"
              >
                🎤 Ses Aralığı Testi
              </button>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-stone-500" />
          </div>
        </section>

        {/* Müzik Notası Ayracı */}
        <div className="flex items-center justify-center px-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-agora-terracotta/30"></div>
          <div className="mx-6 flex items-center justify-center">
            <div className="w-32 h-px bg-agora-terracotta/30"></div>
            <img src="/h.png" alt="Sol Anahtarı" className="w-40 h-40 opacity-70 mx-4" />
            <div className="w-32 h-px bg-agora-terracotta/30"></div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-agora-terracotta/30"></div>
        </div>

        {/* About Section */}
        <section id="about" className="min-h-screen bg-stone-50 py-20 flex items-center">
          <div className="max-w-4xl mx-auto px-6 w-full">
            {/* Başlık */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-bronze-gradient rounded-full mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-agora-dark mb-4">
                <span className="text-agora-bronze">Biz Kimiz</span>
              </h2>
              <p className="text-xl text-agora-muted max-w-4xl mx-auto">
              Farklı yaş ve meslek gruplarından koristlerin, ulusal ve uluslararası festival ve etkinliklerde çalışmalarını profesyonel şekilde sergilemek için 27 Ocak 2025 tarihinde bir araya gelerek kurdukları çok sesli bir korodur.</p>
            </div>

        
            {/* Şef Hakkında */}
            <div className="card-agora rounded-xl p-8 mb-8 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-agora-dark mb-2">Koro Şefimiz</h3>
                <p className="text-agora-muted mb-2">
                  <b>Özlem VARIŞLI ATÇEKEN</b>, 1997’den bu yana birçok koroyu yönetmiş deneyimli bir müzik eğitimcisidir. 2010’dan beri Güzel Sanatlar Liselerinde koro öğretmenliği ve şeflik yapmaktadır. Halen Aydın Yüksel Yalova Güzel Sanatlar Lisesi'nde görevini sürdürmektedir. Yönettiği korolarla çok sayıda festivale katılmış ve ödüller kazanmıştır.
                </p>
                <p className="text-agora-muted mb-2">
                  Selçuk Üniversitesi Müzik Eğitimi Bölümü mezunu olup, Necmettin Erbakan Üniversitesi'nde Müzik Eğitimi üzerine yüksek lisans yapmıştır.
                </p>
                <p className="text-agora-muted">
                  Detaylı bilgi ve görseller için şefimizin Instagram sayfasını ziyaret edebilirsiniz: <a href="https://instagram.com/ozlemchoir" target="_blank" rel="noopener noreferrer" className="text-agora-bronze underline">@ozlemchoir</a> <a href="https://instagram.com/agoravoice" target="_blank" rel="noopener noreferrer" className="text-agora-bronze underline">@agoravoice</a>
                </p>
              </div>
              <div className="flex-shrink-0">
                {/* Şefin görseli eklenebilir */}
                <img src="/ozlem-profil.jpg" alt="Şef Özlem VARIŞLI ATÇEKEN" className="w-40 h-40 object-cover rounded-full border-4 border-bronze-gradient shadow-agora" />
              </div>
            </div>

                {/* Koro Hakkında */}
                <div className="card-agora rounded-xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-agora-dark mb-2">Koro Hakkında</h3>
              <p className="text-agora-muted mb-2">
                Korist ekibimiz, yurt içi ve yurt dışında birçok festivale katılmış deneyimli üyelerden oluşuyor. Her birimiz farklı meslek gruplarından geliyoruz; ancak ortak noktamız müziğe duyduğumuz sevgi ve tutkudur. Amacımız, hem ülkemizde hem de uluslararası festivallerde başarılı performanslar sergileyerek ülkemizi gururla temsil etmektir.
              </p>
              <p className="text-agora-muted">
                Çalışmalarımızda şefimize, piyano öğretmeni, aranjör <b>Rıza ATÇEKEN</b> korrepeditör olarak eşlik etmektedir.
              </p>
            </div>


            {/* A Cappella ve Koro Nedir */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="card-agora rounded-xl p-8">
                <h3 className="text-xl font-bold text-agora-dark mb-2">A Cappella Nedir?</h3>
                <p className="text-agora-muted">
                  A cappella, enstrümansız yani sadece insan sesleriyle icra edilen müzik anlamına gelir. Koro müziğinde a cappella önemli bir yere sahiptir, çünkü insan sesinin tek başına bir enstrüman gibi kullanılabileceğini ve çok sesli uyumlar yaratılabileceğini gösterir.
                </p>
              </div>
              <div className="card-agora rounded-xl p-8">
                <h3 className="text-xl font-bold text-agora-dark mb-2">Koro Nedir?</h3>
                <p className="text-agora-muted">
                  Koro, bir müzik eserini birlikte söylemek amacıyla bir araya gelen şarkıcılardan oluşan topluluktur. Farklı ses gruplarından oluşur ve birlikte şarkı söylemek, ekip çalışması ve dikkatli dinleme gerektirir; ortaya tek bir yürekten çıkan muhteşem bir ahenk çıkar.
                </p>
              </div>
            </div>

            {/* Hedeflerimiz */}
            <div className="card-agora rounded-xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-agora-dark mb-2">Hedeflerimiz</h3>
              <p className="text-agora-muted mb-2">
                Koromuzun amacı, müzik sevgisini paylaşmak, üyelerimizin ses ve müzikal yeteneklerini geliştirmek ve birlikte kaliteli performanslar sergilemektir. Çalışmalarımızda disiplin ve keyfi bir arada tutmaya özen gösteriyoruz.
              </p>
              <p className="text-agora-muted mb-2">
                Provalarımızda önce nota tekrarı yaparak eserin ritmini ve seslerini öğreniriz; ardından eserin anlamını ve duygusunu kavrayıp provalarda birlikte çalışırız; en sonunda da şarkıyı tam bir uyumla seslendirmeye hazır hale getiririz.
              </p>
              <p className="text-agora-muted">
                Koromuz düzenli olarak prova yaparak repertuvarını zenginleştirir ve sürekli gelişmeyi hedefler. Ayrıca ekibimiz, yurt içi ve yurt dışı festival ve yarışmalara katılmayı amaçlar. Hep birlikte başarılar elde etmek ve müziğimizi daha geniş kitlelere duyurmak, en büyük motivasyon kaynaklarımızdandır.
              </p>
            </div>

            {/* Çalışma İlkeleri */}
            <div className="card-agora rounded-xl p-8">
              <h3 className="text-2xl font-bold text-agora-dark mb-2">Çalışma İlkelerimiz</h3>
              <ul className="list-disc pl-6 text-agora-muted space-y-2">
                <li>Tüm koristlerimizin provalara kendi ses grubundaki partisyonlarına çalışmış olarak gelmesi gerekmektedir.</li>
                <li>Şefimizin verdiği ödevler, belirtilen sürede eksiksiz olarak gönderilmelidir.</li>
                <li>Her çalışmada koro dosyanız ve kaleminiz yanınızda olmalıdır.</li>
                <li>Provalara önemli bir sağlık sorunu olmadıkça eksiksiz ve zamanında katılım gereklidir.</li>
                <li>Provalara katılamayacak olanlar, öncesinde bilgi vermelidir.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Müzik Notası Ayracı */}
        <div className="flex items-center justify-center px-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-agora-terracotta/30"></div>
          <div className="mx-6 flex items-center justify-center">
            <div className="w-32 h-px bg-agora-terracotta/30"></div>
            <img src="/h.png" alt="Sol Anahtarı" className="w-40 h-40 opacity-70 mx-4" />
            <div className="w-32 h-px bg-agora-terracotta/30"></div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-agora-terracotta/30"></div>
        </div>

        {/* Seçmeler Section */}
        <Secmeler onStartPitchTest={() => setShowPitchTest(true)} />
        {showPitchTest && <PitchTest onClose={() => setShowPitchTest(false)} />}

        {/* AI Assistant Section */}
        <section id="ai-assistant" className="min-h-screen bg-marble py-20 flex items-center">
          <div className="w-full">
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-bold text-agora-dark mb-6">
                <span className="text-agora-gold">AI Asistan</span>
              </h2>
              <p className="text-xl text-agora-muted max-w-3xl mx-auto">
                Antik bilgelik ile modern yapay zekayı buluşturan agora sohbet asistanı
              </p>
            </div>

            {/* Main content area */}
            <main className="flex-1 flex items-center justify-center px-4 h-[calc(100vh-300px)]">
              {!showChatbot ? (
                /* Welcome screen with main button */
                <div className="text-center flex flex-col items-center justify-center h-full">
                  <RobotMascot className="agora-robot h-44 w-40 md:h-52 md:w-48 drop-shadow-2xl" />
                  <p className="mt-4 text-2xl md:text-3xl font-extrabold text-agora-dark">
                    Merhaba! 👋
                  </p>
                  <p className="mt-2 mb-8 max-w-md mx-auto text-base md:text-lg text-agora-muted leading-relaxed">
                    Agora Voice hakkında aklındaki her şeyi bana sorabilirsin.
                  </p>
                  <button
                    onClick={() => {
                      handleFirstInteraction();
                      toggleChatbot();
                    }}
                    className="inline-flex items-center gap-2.5 rounded-full bg-violet-600 px-8 py-4 text-base md:text-lg font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:-translate-y-0.5 hover:bg-violet-700"
                  >
                    <MessageCircle className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
                    Yapay Zeka Asistanına Sor
                  </button>
                </div>
              ) : (
                /* Chatbot area */
                <div className="w-full max-w-4xl mx-auto relative">
                  {/* Close button */}
                  <button
                    onClick={toggleChatbot}
                    className="absolute -top-16 right-4 w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center transition-colors duration-200 z-20 backdrop-blur-sm"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  {/* Iframe container */}
                  <div className="relative w-full h-[420px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl bg-slate-800/50 backdrop-blur-sm">
                    <iframe
                      ref={iframeRef}
                      src="https://chat.agoravoice.com.tr/chat/7d0SRt4Z3zhUQh8o?theme=dark"
                      className="w-full h-full border-0 rounded-2xl"
                      title="Agora Voice Assistant Chatbot"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-presentation"
                      onLoad={() => setIsLoading(false)}
                    />
                    {/* Loading indicator */}
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-800/50 backdrop-blur-sm">
                        <div className="text-center">
                          <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                          <p>Loading Agora Voice Assistant...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
        </section>

        {/* Müzik Notası Ayracı */}
        <div className="flex items-center justify-center px-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-agora-terracotta/30"></div>
          <div className="mx-6 flex items-center justify-center">
            <div className="w-32 h-px bg-agora-terracotta/30"></div>
            <img src="/h.png" alt="Sol Anahtarı" className="w-40 h-40 opacity-70 mx-4" />
            <div className="w-32 h-px bg-agora-terracotta/30"></div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-agora-terracotta/30"></div>
        </div>

        {/* Konser Takvimi Section — şimdilik gizli */}
        <section id="konser-takvimi" className="hidden min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] py-20 flex items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-agora-terracotta rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-agora-bronze rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-5xl mx-auto px-6 w-full relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-agora-terracotta to-agora-bronze rounded-full mb-6 shadow-lg shadow-agora-terracotta/30">
                <CalendarDays className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-agoravoice">
                Konser Takvimi 2026
              </h2>
              <p className="text-white/60 text-lg">Planlanan konser ve festivallerimiz</p>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-agora-terracotta/60 via-agora-bronze/40 to-transparent hidden md:block"></div>

              {[
                { name: 'İzmir Uluslararası Festivali', date: '21 MAYIS', day: 'PERŞEMBE', venue: 'Küçük Salon', time: '16:30', location: 'İzmir', month: 'MAY', gradient: 'from-rose-500 to-orange-500' },
                { name: 'IX. Çanakkale Koro Festivali', date: '7 - 12 TEMMUZ', location: 'Çanakkale', month: 'TEM', gradient: 'from-emerald-500 to-teal-500' },
                { name: 'Makedonya Ohrid Koro Festivali', date: '27 - 31 AĞUSTOS', location: 'Ohrid, Makedonya', month: 'AĞU', gradient: 'from-blue-500 to-indigo-500' },
              ].map((concert, i) => (
                <div key={i} className={`relative flex items-center mb-12 last:mb-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`w-full md:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'}`}>
                    <div className="group bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/15 hover:border-white/20 transition-all duration-500 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${concert.gradient} text-white text-xs font-bold mb-3 shadow-lg`}>
                        <MapPin className="w-3 h-3 mr-1" />
                        {concert.location}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-agora-terracotta transition-colors duration-300">{concert.name}</h3>
                      <p className="text-white/80 font-semibold">
                        {concert.date} 2026{('day' in concert) && concert.day ? ` · ${concert.day}` : ''}
                      </p>
                      {('venue' in concert && concert.venue) || ('time' in concert && concert.time) ? (
                        <p className="text-white/60 text-sm mt-1">
                          {('venue' in concert && concert.venue) ? concert.venue : ''}
                          {('venue' in concert && concert.venue) && ('time' in concert && concert.time) ? ' · ' : ''}
                          {('time' in concert && concert.time) ? concert.time : ''}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center justify-center">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${concert.gradient} flex items-center justify-center shadow-lg ring-4 ring-[#16213e]`}>
                      <span className="text-white text-xs font-bold">{concert.month}</span>
                    </div>
                  </div>

                  <div className="hidden md:block w-[calc(50%-2rem)]"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="min-h-screen bg-stone-50 py-20 flex items-center">
          <div className="max-w-6xl mx-auto px-6 w-full">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-olive/20 rounded-full mb-6">
                <Music className="w-8 h-8 text-agora-olive" />
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-agora-dark mb-6">
                <span className="text-agora-olive">Galeri</span>
              </h2>
              <p className="text-xl text-agora-muted max-w-3xl mx-auto">
                Provalarımızdan ve etkinliklerimizden kareler
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {galleryImages.map((image, index) => (
                <div key={image.src} className="group relative overflow-hidden rounded-xl card-agora cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => openImageModal(image.src, index)}>
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 left-2 text-white">
                      <h4 className="font-semibold text-sm">{image.title}</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Müzik Notası Ayracı */}
        <div className="flex items-center justify-center px-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-agora-terracotta/30"></div>
          <div className="mx-6 flex items-center justify-center">
            <div className="w-32 h-px bg-agora-terracotta/30"></div>
            <img src="/h.png" alt="Sol Anahtarı" className="w-40 h-40 opacity-70 mx-4" />
            <div className="w-32 h-px bg-agora-terracotta/30"></div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-agora-terracotta/30"></div>
        </div>

        {/* Contact Section */}
        <section id="contact" className="min-h-screen bg-marble py-20 flex items-center">
          <div className="max-w-4xl mx-auto px-6 w-full">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-terracotta-gradient rounded-full mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-agora-dark mb-6">
                <span className="text-agora-terracotta">İletişim</span>
              </h2>
              <p className="text-xl text-agora-muted">
                Bizimle iletişime geçmek için aşağıdaki kanalları kullanabilirsiniz.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="card-agora rounded-xl p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-bronze-gradient rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-agora-dark">E-posta</h4>
                      <p className="text-agora-muted">agoravoiceschoir@gmail.com</p>
                    </div>
                  </div>
                </div>

                <div className="card-agora rounded-xl p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gold-gradient rounded-full flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-agora-dark">Web Sitesi</h4>
                      <p className="text-agora-muted">www.agoravoice.com.tr</p>
                    </div>
                  </div>
                </div>

                <div className="card-agora rounded-xl p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-bronze-gradient rounded-full flex items-center justify-center">
                      <Instagram className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-agora-dark">Instagram</h4>
                      <p className="text-agora-muted">@agoravoice</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mesaj gönder alanı yerine yönlendirme */}
              <div className="card-agora rounded-xl p-8 flex flex-col items-center justify-center">
                <h4 className="text-xl font-semibold text-agora-dark mb-6">Bize Ulaşın</h4>
                <p className="text-agora-muted text-center mb-4">
                  Her türlü soru, öneri ve iş birliği için <a href="mailto:agoravoiceschoir@gmail.com" className="text-agora-terracotta underline">agoravoiceschoir@gmail.com</a> adresine e-posta gönderebilirsiniz.
                </p>
                <a href="mailto:agoravoiceschoir@gmail.com" className="btn-agora-primary font-semibold py-3 px-6 rounded-lg">E-posta Gönder</a>
              </div>
            </div>
          </div>
        </section>

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
            <div className="relative w-full max-w-6xl max-h-[90vh] flex items-center justify-center">
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={selectedImage}
                alt={galleryImages[currentImageIndex].alt}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
              >
                <ChevronDown className="w-6 h-6 rotate-180" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Başvuru Popup'ı — girişte açılır */}
      {showApplyPopup && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-[2px] animate-[fadeIn_0.3s_ease-out]"
          role="presentation"
          onClick={dismissApplyPopup}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-popup-title"
            className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-[0_25px_80px_-12px_rgba(28,25,23,0.45)] ring-1 ring-stone-200/80 animate-[slideUp_0.4s_ease-out]"
            style={{
              background: 'linear-gradient(180deg, #fffefb 0%, #f7f2ea 55%, #f3eee6 100%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Üst renkli şerit */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#e74c3c] via-[#f39c12] to-[#d35400]" aria-hidden />

            <button
              type="button"
              onClick={dismissApplyPopup}
              className="absolute right-3 top-4 z-10 rounded-full p-2 text-stone-400 transition hover:bg-stone-900/5 hover:text-agora-dark"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>

            <div className="px-6 pb-7 pt-8 text-center sm:px-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-50 to-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-red-700 ring-1 ring-red-100">
                <Star className="h-3.5 w-3.5" strokeWidth={2.25} />
                2026 - 2027 Dönemi
              </span>

              <h3
                id="apply-popup-title"
                className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-agora-dark sm:text-[2rem]"
              >
                Başvurularımız Başladı!
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-stone-500">
                Agora Voice çok sesli a cappella koro seçmelerine katılmak için hemen başvur. Yurt içi ve yurt dışı festivallerde sahne almaya hazır mısın?
              </p>

              <a
                href="https://forms.gle/Qgw4xp9jMte7y94h7"
                target="_blank"
                rel="noopener noreferrer"
                onClick={dismissApplyPopup}
                className="group mt-7 flex w-full items-center justify-center gap-2 rounded-full py-3.5 px-6 text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                style={{
                  background: 'linear-gradient(45deg, #e74c3c, #f39c12, #e67e22, #d35400)',
                  backgroundSize: '300% 300%',
                  animation: 'gradientShift 3s ease infinite',
                }}
              >
                <Music className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
                Hemen Başvur
              </a>

              {/* Ayraç */}
              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-stone-200" aria-hidden />
                <span className="text-xs font-medium uppercase tracking-wider text-stone-400">veya</span>
                <span className="h-px flex-1 bg-stone-200" aria-hidden />
              </div>

              <p className="text-sm font-medium text-agora-dark">
                Önce ses aralığını merak ediyor musun?
              </p>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-stone-500">
                Ücretsiz ses testimizle hangi ses grubuna uygun olduğunu keşfet.
              </p>
              <button
                type="button"
                onClick={() => {
                  dismissApplyPopup();
                  setShowPitchTest(true);
                }}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-stone-300 bg-white py-3 px-6 text-sm font-semibold text-agora-dark transition-colors hover:border-agora-bronze hover:bg-stone-50"
              >
                <Mic className="h-4 w-4 shrink-0 text-agora-bronze" strokeWidth={2.25} aria-hidden />
                Ses Testini Dene
              </button>

              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50/70 p-2.5">
                <RobotMascot className="agora-robot h-16 w-14 shrink-0" />
                <button
                  type="button"
                  onClick={() => {
                    dismissApplyPopup();
                    setShowChatbot(true);
                    scrollToSection('ai-assistant');
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
                  Yapay Zeka Asistanına Sor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-agora-dark text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-agora-muted text-sm">
            © 2025 Agora Voice. Tüm hakları saklıdır.
          </p>
          <p className="text-agora-muted text-sm mt-3">
            <a href="/kvkk" className="underline hover:text-agora-bronze transition-colors duration-200">
              KVKK Aydınlatma Metni
            </a>
          </p>
          <p className="text-agora-terracotta text-sm mt-2">
            Design by <a href="https://instagram.com/mennansevim" target="_blank" rel="noopener noreferrer" className="underline hover:text-agora-bronze transition-colors duration-200">@mennansevim</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;