import { Mic, ShieldCheck, X } from 'lucide-react';

export default function Consent({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 shadow-glow mb-3">
          <ShieldCheck size={28} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-agora-dark mb-2">Ses Kaydı Onayı</h1>
        <p className="text-sm text-agora-muted max-w-xl mx-auto leading-relaxed">
          Test sırasında alınan mikrofon kayıtlarınızı saklıyoruz. Bunlar yalnızca ses tespit
          (pitch detection) algoritmamızı geliştirmek için kullanılacak; üçüncü taraflarla
          paylaşılmayacak ve herhangi bir reklam amacıyla kullanılmayacaktır.{' '}
          <a href="/kvkk" target="_blank" rel="noopener noreferrer" className="text-agora-terracotta underline hover:text-agora-bronze">
            KVKK Aydınlatma Metni
          </a>
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur border border-stone-200 rounded-2xl p-5 mb-5 space-y-3">
        <Row icon={<Mic size={16} />} title="Hangi veriler saklanır?">
          Söylediğiniz notaların ses kayıtları, hedef nota, tespit edilen frekans ve doğruluk yüzdesi.
        </Row>
        <Row icon={<ShieldCheck size={16} />} title="Nasıl kullanılır?">
          Yalnızca uygulamanın ses tanıma kalitesini iyileştirmek için, dahili olarak.
        </Row>
        <Row icon={<X size={16} />} title="Reddederseniz?">
          Teste devam edilmez. Onay vermediğiniz sürece veri toplanmaz.
        </Row>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onAccept}
          className="flex-1 btn-agora-primary py-3 px-6 rounded-xl font-semibold"
        >
          Kabul Ediyorum, Devam Et
        </button>
        <button
          onClick={onDecline}
          className="sm:flex-initial sm:px-8 py-3 rounded-xl font-semibold border-2 border-stone-300 text-agora-dark hover:bg-stone-100 transition-colors"
        >
          Reddet
        </button>
      </div>
    </div>
  );
}

function Row({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-agora-dark mb-0.5">{title}</div>
        <div className="text-xs text-agora-muted leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
