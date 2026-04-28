import { useState } from 'react';
import { X } from 'lucide-react';
import Intro from './steps/Intro';
import UserForm from './steps/UserForm';
import MicCheck from './steps/MicCheck';
import RangeTest from './steps/RangeTest';
import Result from './steps/Result';
import Scoreboard from './steps/Scoreboard';
import { releaseMicrophone } from './lib/recorder';

export type Gender = 'male' | 'female';
export type UserInfo = { firstName: string; lastName: string; gender: Gender };
export type FinalResult = { testResultId: number; userId: number };

type Step = 'intro' | 'form' | 'mic' | 'test' | 'result' | 'scoreboard';

export default function PitchTest({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('intro');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);

  const handleClose = () => {
    releaseMicrophone();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-stone-100 via-amber-50 to-stone-200 overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--agora-terracotta)] to-[var(--agora-bronze)] flex items-center justify-center text-white font-bold text-sm">
                AV
              </div>
              <div>
                <div className="text-sm font-semibold text-agora-dark">Agora Voice</div>
                <div className="text-xs text-agora-muted">Ses Aralığı Testi</div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-stone-200/60 transition-colors"
              aria-label="Kapat"
            >
              <X size={22} className="text-agora-dark" />
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {step === 'intro' && (
            <Intro
              onStart={() => setStep('form')}
              onScoreboard={() => setStep('scoreboard')}
            />
          )}
          {step === 'form' && (
            <UserForm
              onBack={() => setStep('intro')}
              onNext={(info) => {
                setUser(info);
                setStep('mic');
              }}
            />
          )}
          {step === 'mic' && user && (
            <MicCheck
              onBack={() => setStep('form')}
              onNext={() => setStep('test')}
            />
          )}
          {step === 'test' && user && (
            <RangeTest
              user={user}
              onComplete={(res) => {
                setFinalResult(res);
                setStep('result');
              }}
            />
          )}
          {step === 'result' && finalResult && (
            <Result
              testResultId={finalResult.testResultId}
              onScoreboard={() => setStep('scoreboard')}
              onRestart={() => {
                setUser(null);
                setFinalResult(null);
                setStep('intro');
              }}
            />
          )}
          {step === 'scoreboard' && (
            <Scoreboard onBack={() => setStep('intro')} />
          )}
        </main>
      </div>
    </div>
  );
}
