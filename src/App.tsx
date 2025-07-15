import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Users, 
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
  Instagram
} from 'lucide-react';
import Secmeler from './Secmeler';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Galeri resimleri - 100 resme kadar genişletilebilir
  const galleryImages = [
    { src: '/gallery/agora6.jpeg', alt: 'Agora Voice Koro', title: 'Koro performansı' },
    { src: '/gallery/agora7.JPG', alt: 'Agora Voice Koro', title: 'Koro çalışması' },
    { src: '/gallery/agora8.jpg', alt: 'Agora Voice Koro', title: 'Koro etkinliği' },

    { src: '/gallery/agora12.JPG', alt: 'Agora Voice Koro', title: 'Koro çalışması' },
    { src: '/gallery/agora14.JPG', alt: 'Agora Voice Koro', title: 'Koro etkinliği' },
    { src: '/gallery/agora15.JPG', alt: 'Agora Voice Koro', title: 'Koro performansı' },
    { src: '/gallery/agora38.png', alt: 'Agora Voice Koro', title: 'Koro çalışması' },
    { src: '/gallery/agora40.jpg', alt: 'Agora Voice Koro', title: 'Koro etkinliği' },
    { src: '/gallery/agora41.png', alt: 'Agora Voice Koro', title: 'Koro performansı' },
    { src: '/gallery/agora47.JPG', alt: 'Agora Voice Koro', title: 'Koro çalışması' },
    { src: '/gallery/agora49.JPG', alt: 'Agora Voice Koro', title: 'Koro etkinliği' },
    { src: '/gallery/agora50.JPG', alt: 'Agora Voice Koro', title: 'Koro performansı' },
    { src: '/gallery/agora53.JPG', alt: 'Agora Voice Koro', title: 'Koro çalışması' },
    { src: '/gallery/agora55.JPG', alt: 'Agora Voice Koro', title: 'Koro etkinliği' },
    { src: '/gallery/agora56.JPG', alt: 'Agora Voice Koro', title: 'Koro performansı' },
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
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden w-full">
          {/* Arka plan görseli */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src="/arkaplan.jpg"
              alt="Agora Voice Arka Plan"
              className="w-full h-full object-cover opacity-60"
            />
            {/* Koyu overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          {/* İçerik */}
          <div className="relative z-10 w-full px-6 py-20 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="mb-8 animate-fade-in flex flex-col items-center">
                <div className="relative flex items-center justify-center w-[8.2rem] h-[8.2rem] mx-auto">
                  {/* Beyaz yarı saydam arka plan */}
                  <div className="absolute inset-0 bg-white/80 shadow-lg flex items-center justify-center" style={{ borderRadius: '50% / 50%' }}></div>
                  <img src="/agora.png" alt="Agora Voice Logo" className="w-[8.2rem] h-[8.2rem] relative z-10 shadow-2xl object-contain mx-auto w-14 h-14 rounded-full border-4 border-bronze-gradient shadow-agora" style={{ borderRadius: '50% / 50%' }} />
                </div>
              </div>
             
              <p className="text-xl md:text-2xl text-white mb-12 max-w-3xl mx-auto animate-fade-in" style={{ marginTop: '14rem' }}>
                Koromuz, İzmir Antik Agora'nın ruhuyla harmanlanmış ekibi ile birlikte yurt içi ve yurt dışındaki festivallerde başarılı performanslarla ülkemizi gururla temsil etmeyi amaçlıyoruz.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in mb-16">
                <button
                  onClick={() => scrollToSection('secmeler')}
                  className="btn-agora-primary font-semibold py-4 px-8 rounded-full text-lg text-white"
                >
                  Seçmeler
                </button>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeYlPUKWcF4xTPKk5qiXQVm6dxh7gut2lArcQpXbUtFe-B8Lg/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-agora-primary font-semibold py-4 px-8 rounded-full text-lg text-white text-center"
                >
                  Başvuru Formu
                </a>
              </div>
              {/* Scroll indicator */}
              <div className="animate-bounce">
                <ChevronDown className="w-8 h-8 text-white mx-auto" />
              </div>
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
              Farklı yaş ve meslek gruplarından koristlerin, ulusal ve uluslararası festival ve etkinliklerde çalışmalarını profesyonel şekilde sergilemek için Şubat 2025 tarihinde bir araya gelerek kurdukları çok sesli bir korodur.</p>
            </div>

        
            {/* Şef Hakkında */}
            <div className="card-agora rounded-xl p-8 mb-8 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-agora-dark mb-2">Koro Şefimiz</h3>
                <p className="text-agora-muted mb-2">
                  <b>Özlem VARIŞLI ATÇEKEN</b>, 1999’dan bu yana birçok koroyu yönetmiş deneyimli bir müzik eğitimcisidir. 2010’dan beri Güzel Sanatlar Liselerinde koro öğretmenliği ve şeflik yapmaktadır. Halen Aydın Yüksel Yalova Güzel Sanatlar Lisesi'nde görevini sürdürmektedir. Yönettiği korolarla çok sayıda festivale katılmış ve ödüller kazanmıştır.
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
                <img src="/public/agora.png" alt="Şef Özlem VARIŞLI ATÇEKEN" className="w-40 h-40 object-cover rounded-full border-4 border-bronze-gradient shadow-agora" />
              </div>
            </div>

                {/* Koro Hakkında */}
                <div className="card-agora rounded-xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-agora-dark mb-2">Koro Hakkında</h3>
              <p className="text-agora-muted mb-2">
                Korist ekibimiz, yurt içi ve yurt dışında birçok festivale katılmış deneyimli üyelerden oluşuyor. Her birimiz farklı meslek gruplarından geliyoruz; ancak ortak noktamız müziğe duyduğumuz sevgi ve tutkudur. Amacımız, hem ülkemizde hem de uluslararası festivallerde başarılı performanslar sergileyerek ülkemizi gururla temsil etmektir.
              </p>
              <p className="text-agora-muted">
                Çalışmalarımızda şefimize, piyano öğretmeni, aranjör ve eşi olan <b>Rıza ATÇEKEN</b> korepetitör olarak eşlik etmektedir.
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
                <li>Provalara katılamayacak olanlar, öncesinde yoklama alan arkadaşımıza bilgi vermelidir.</li>
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
        <Secmeler />

        {/* AI Assistant Section */}
        <section id="ai-assistant" className="min-h-screen bg-marble py-20 flex items-center">
          <div className="w-full">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-gradient rounded-full mb-6">
                <Bot className="w-8 h-8 text-white" />
              </div>
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
                  <div className="mb-8">
                    <button
                      onClick={() => {
                        handleFirstInteraction();
                        toggleChatbot();
                      }}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      className="group relative w-50 h-50 md:w-60 md:h-60 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 p-1 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105"
                    >
                      {/* Müzik notaları ve sol anahtarı animasyonu */}
                      <Music className="hidden group-hover:block absolute left-8 top-8 text-pink-300 opacity-0 group-hover:opacity-80 animate-float-up pointer-events-none" style={{fontSize: '2rem'}} />
                      <Music2 className="hidden group-hover:block absolute right-8 top-16 text-blue-300 opacity-0 group-hover:opacity-80 animate-float-right pointer-events-none" style={{fontSize: '1.5rem'}} />
                      <Music3 className="hidden group-hover:block absolute left-16 bottom-8 text-purple-300 opacity-0 group-hover:opacity-80 animate-float-left pointer-events-none" style={{fontSize: '1.8rem'}} />
                      <Music4 className="hidden group-hover:block absolute right-12 bottom-12 text-yellow-300 opacity-0 group-hover:opacity-80 animate-float-diag pointer-events-none" style={{fontSize: '1.2rem'}} />
                      <Music className="hidden group-hover:block absolute left-1/2 top-4 text-green-300 opacity-0 group-hover:opacity-80 animate-float-up pointer-events-none" style={{fontSize: '1.7rem'}} />
                      <Music2 className="hidden group-hover:block absolute right-4 top-1/2 text-pink-200 opacity-0 group-hover:opacity-80 animate-float-right pointer-events-none" style={{fontSize: '1.3rem'}} />
                      <Music3 className="hidden group-hover:block absolute left-4 bottom-1/2 text-blue-200 opacity-0 group-hover:opacity-80 animate-float-left pointer-events-none" style={{fontSize: '1.5rem'}} />
                      <Music4 className="hidden group-hover:block absolute left-1/3 top-1/4 text-white opacity-0 group-hover:opacity-80 animate-float-diag pointer-events-none" style={{fontSize: '2.2rem'}} />
                      {/* Inner button */}
                      <div className="w-full h-full rounded-full bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute inset-4 rounded-full border border-purple-400/30 group-hover:border-purple-400/60 transition-colors duration-500"></div>
                        <div className="absolute inset-8 rounded-full border border-purple-400/20 group-hover:border-purple-400/40 transition-colors duration-500 animate-pulse"></div>
                        <div className="relative z-10 text-center">
                          <div className="mb-4">
                            <Mic className="w-16 h-16 md:w-20 md:h-20 text-purple-400 mx-auto group-hover:text-white transition-colors duration-300" />
                          </div>
                          <div className="text-white">
                            <div className="text-l md:text-xl font-bold mb-2 group-hover:text-purple-300 transition-colors duration-300">
                              Agora Voice
                            </div>
                            <div className="text-g md:text-l font-light text-slate-300 group-hover:text-white transition-colors duration-300">
                              Assistant
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                  <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto leading-relaxed mt-6">
                    <span className="block text-xl md:text-2xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-glow animate-pulse-slow mb-2">
                      Yeni nesil akıllı asistanı deneyimleyin.
                    </span>
                    <span className="block text-base md:text-lg font-semibold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-glow animate-fade-in">
                      AI destekli müzik yolculuğunuza başlamak için tıklayın.
                    </span>
                  </p>
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
                      <p className="text-agora-muted">agoravoice.com.tr</p>
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

      {/* Footer */}
      <footer className="bg-agora-dark text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-agora-muted text-sm">
            © 2025 Agora Voice. Tüm hakları saklıdır.
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