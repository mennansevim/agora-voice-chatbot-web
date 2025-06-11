import React, { useState, useRef, useEffect } from 'react';
import { Mic, X, Music, Music2, Music3, Music4, Users, Guitar, Mic2, Headphones, Waves, Globe, Drum } from 'lucide-react';

function App() {
  const [showChatbot, setShowChatbot] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
    if (!showChatbot) {
      setIsLoading(true);
    }
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = () => {
        setIsLoading(false);
      };
      iframe.addEventListener('load', handleLoad);
      return () => iframe.removeEventListener('load', handleLoad);
    }
  }, [showChatbot]);

  useEffect(() => {
    audioRef.current = new Audio('/signore-trial.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (audioRef.current && hasInteracted) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.log('Ses çalma hatası:', error);
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleFirstInteraction = () => {
    setHasInteracted(true);
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.log('İlk etkileşim ses çalma hatası:', error);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden overflow-y-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="pt-8 pb-4 text-center">
          <div className="flex justify-center items-center mb-4 relative">
            <Music className="absolute left-2 top-10 text-purple-400 opacity-70 z-10" style={{fontSize: '2rem'}} />
            <Music2 className="absolute right-6 top-16 text-blue-400 opacity-60 z-10" style={{fontSize: '1.5rem'}} />
            <Music3 className="absolute left-12 bottom-6 text-pink-400 opacity-60 z-10" style={{fontSize: '1.7rem'}} />
            <Music4 className="absolute right-10 bottom-8 text-yellow-400 opacity-60 z-10" style={{fontSize: '1.3rem'}} />
            <div className="p-2 rounded-full relative z-20">
              <img 
                src="/agora-png.png" 
                alt="Agora Voice" 
                className="h-60 md:h-72 w-auto filter brightness-0 invert opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        </header>

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
                  className="group relative w-80 h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 p-1 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105"
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
                        <div className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-purple-300 transition-colors duration-300">
                          Agora Voice
                        </div>
                        <div className="text-lg md:text-xl font-light text-slate-300 group-hover:text-white transition-colors duration-300">
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
            <div className="w-full max-w-6xl mx-auto relative">
              {/* Close button */}
              <button
                onClick={toggleChatbot}
                className="absolute -top-16 right-4 w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center transition-colors duration-200 z-20 backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Iframe container */}
              <div className="relative w-full h-[600px] md:h-[700px] rounded-2xl overflow-hidden shadow-2xl bg-slate-800/50 backdrop-blur-sm">
                <iframe
                  ref={iframeRef}
                  src="https://agoravoice.asistant.keenetic.link/chat/7d0SRt4Z3zhUQh8o"
                  className="w-full h-full border-0 rounded-2xl"
                  title="Agora Voice Assistant Chatbot"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-presentation"
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

        {/* Footer */}
        <footer className="pb-8 text-center flex flex-col items-center">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            {/* Çok sesli müzik */}
            <div className="flex flex-col items-center bg-gradient-to-br from-purple-900/60 to-slate-800/60 backdrop-blur-md rounded-2xl px-5 py-4 shadow-lg hover:shadow-purple-400/40 transition-all duration-300">
              <Waves className="w-10 h-10 text-purple-300 opacity-30 hover:opacity-80 drop-shadow-lg mb-1 transition-all duration-300" />
              <span className="text-xs text-purple-100 font-bold">Çok Sesli Müzik</span>
              <span className="text-[10px] text-purple-200 mt-1">Katmanlı ve zengin tınılar</span>
            </div>
            {/* Acapella */}
            <div className="flex flex-col items-center bg-gradient-to-br from-blue-900/60 to-slate-800/60 backdrop-blur-md rounded-2xl px-5 py-4 shadow-lg hover:shadow-blue-400/40 transition-all duration-300">
              <Users className="w-10 h-10 text-blue-300 opacity-30 hover:opacity-80 drop-shadow-lg mb-1 transition-all duration-300" />
              <span className="text-xs text-blue-100 font-bold">Acapella</span>
              <span className="text-[10px] text-blue-200 mt-1">Sadece insan sesi</span>
            </div>
            {/* Perküsyon */}
            <div className="flex flex-col items-center bg-gradient-to-br from-green-900/60 to-slate-800/60 backdrop-blur-md rounded-2xl px-5 py-4 shadow-lg hover:shadow-green-400/40 transition-all duration-300">
              <Drum className="w-10 h-10 text-green-300 opacity-30 hover:opacity-80 drop-shadow-lg mb-1 transition-all duration-300" />
              <span className="text-xs text-green-100 font-bold">Perküsyon</span>
              <span className="text-[10px] text-green-200 mt-1">Ritim ve vurmalı sesler</span>
            </div>
            {/* Canlı Performans */}
            <div className="flex flex-col items-center bg-gradient-to-br from-pink-900/60 to-slate-800/60 backdrop-blur-md rounded-2xl px-5 py-4 shadow-lg hover:shadow-pink-400/40 transition-all duration-300">
              <Mic2 className="w-10 h-10 text-pink-300 opacity-30 hover:opacity-80 drop-shadow-lg mb-1 transition-all duration-300" />
              <span className="text-xs text-pink-100 font-bold">Canlı Performans</span>
              <span className="text-[10px] text-pink-200 mt-1">Sahne enerjisi</span>
            </div>
            {/* Yurtdışı Festival */}
            <div className="flex flex-col items-center bg-gradient-to-br from-yellow-900/60 to-slate-800/60 backdrop-blur-md rounded-2xl px-5 py-4 shadow-lg hover:shadow-yellow-400/40 transition-all duration-300">
              <Globe className="w-10 h-10 text-yellow-300 opacity-30 hover:opacity-80 drop-shadow-lg mb-1 transition-all duration-300" />
              <span className="text-xs text-yellow-100 font-bold">Yurtdışı Festival</span>
              <span className="text-[10px] text-yellow-200 mt-1">Dünya müziği ve etkinlikler</span>
            </div>
          </div>
          <div className="mt-4 flex flex-row items-center justify-center gap-4">
            <span className="text-slate-500 text-sm font-light tracking-wide">
              Sitemiz yapım aşamasındadır. |
            </span>
            <a href="https://instagram.com/agoravoice" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-500 font-semibold transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5Zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5Zm6 1.25a1 1 0 1 1-2 0a1 1 0 0 1 2 0Z"/></svg>
              @agoravoice
            </a>
          </div>
        </footer>
      </div>

      {/* Animated particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-1 h-1 bg-purple-400/40 rounded-full animate-ping" style={{ top: '20%', left: '10%', animationDelay: '0s' }}></div>
        <div className="absolute w-1 h-1 bg-blue-400/40 rounded-full animate-ping" style={{ top: '40%', right: '15%', animationDelay: '1s' }}></div>
        <div className="absolute w-1 h-1 bg-indigo-400/40 rounded-full animate-ping" style={{ top: '70%', left: '20%', animationDelay: '2s' }}></div>
        <div className="absolute w-1 h-1 bg-purple-400/40 rounded-full animate-ping" style={{ top: '60%', right: '25%', animationDelay: '3s' }}></div>
      </div>
    </div>
  );
}

export default App;