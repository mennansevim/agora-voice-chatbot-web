import { useState } from 'react';
import { X } from 'lucide-react';
import Intro from './steps/Intro';
import Consent from './steps/Consent';
import UserForm from './steps/UserForm';
import MicCheck from './steps/MicCheck';
import RangeTest from './steps/RangeTest';
import Result from './steps/Result';
import Scoreboard from './steps/Scoreboard';
import StagePerformance from './steps/StagePerformance';
import FreeSong from './steps/FreeSong';
import { releaseMicrophone } from './lib/recorder';

export type Gender = 'male' | 'female';
export type UserInfo = { firstName: string; lastName: string; gender: Gender };
export type FinalResult = { testResultId: number; userId: number };

type Step = 'intro' | 'consent' | 'form' | 'mic' | 'test' | 'result' | 'freeSong' | 'scoreboard' | 'stage';

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
              <div className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center overflow-hidden shadow-sm">
                <img src="/agora-transparent.png" alt="Agora Voice" className="w-7 h-7 object-contain" draggable={false} />
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

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {step === 'intro' && (
            <Intro
              onStart={() => setStep('consent')}
              onScoreboard={() => setStep('scoreboard')}
            />
          )}
          {step === 'consent' && (
            <Consent
              onAccept={() => setStep('form')}
              onDecline={handleClose}
            />
          )}
          {step === 'form' && (
            <UserForm
              onBack={() => setStep('consent')}
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
              onFreeSong={() => setStep('freeSong')}
              onRestart={() => {
                setUser(null);
                setFinalResult(null);
                setStep('intro');
              }}
            />
          )}
          {step === 'freeSong' && finalResult && (
            <FreeSong
              sessionId={finalResult.testResultId}
              onSkip={() => setStep('scoreboard')}
              onFinish={() => setStep('scoreboard')}
            />
          )}
          {step === 'scoreboard' && (
            <Scoreboard onBack={() => setStep('intro')} onStage={() => setStep('stage')} />
          )}
          {step === 'stage' && (
            <StagePerformance onBack={() => setStep('scoreboard')} />
          )}
        </main>
      </div>
    </div>
  );
}
