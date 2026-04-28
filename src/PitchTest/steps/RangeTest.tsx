import { useEffect, useRef, useState } from 'react';
import { Volume2, Mic, ArrowDown, ArrowUp, SkipForward } from 'lucide-react';
import type { UserInfo, FinalResult } from '..';
import { initState, currentNote, recordAttempt, skipDirection, getRangeBounds, type RangeMachineState, type AttemptLog } from '../lib/rangeMachine';
import { getStartNoteForGender, NOTE_FREQUENCIES, noteToTurkish } from '../lib/notes';
import { playNote, preloadNotes, stopAllPlayback } from '../lib/audioPlayer';
import { recordSamples, abortActiveRecording } from '../lib/recorder';
import { analyzeBuffer, matchToTarget } from '../lib/pitchDetector';
import { db, upsertUser } from '../lib/db';
import { classifyVoiceType } from '../lib/voiceTypes';
import { compositeScore } from '../lib/classify';

type Phase = 'preparing' | 'playing' | 'listening' | 'analyzing' | 'feedback' | 'transition' | 'saving';

const RECORD_SECONDS = 2;

export default function RangeTest({
  user,
  onComplete,
}: {
  user: UserInfo;
  onComplete: (res: FinalResult) => void;
}) {
  const [state, setState] = useState<RangeMachineState>(() => initState(getStartNoteForGender(user.gender)));
  const [phase, setPhase] = useState<Phase>('preparing');
  const [lastAttempt, setLastAttempt] = useState<AttemptLog | null>(null);
  const [lastDirection, setLastDirection] = useState<'down' | 'up'>('down');
  useEffect(() => {
    preloadNotes(NOTE_FREQUENCIES.map((n) => n.name)).catch(() => null);
  }, []);

  const skipRef = useRef(false);

  const handleSkip = () => {
    skipRef.current = true;
    stopAllPlayback();
    abortActiveRecording();
  };

  useEffect(() => {
    let cancelled = false;
    let local = initState(getStartNoteForGender(user.gender));

    const consumeSkip = (): boolean => {
      if (!skipRef.current) return false;
      skipRef.current = false;
      const prevDir = local.direction;
      local = skipDirection(local);
      setState(local);
      setLastDirection(local.direction);
      if (!local.done && local.direction !== prevDir) {
        setPhase('transition');
      }
      return true;
    };

    const loop = async () => {
      while (!cancelled && !local.done) {
        if (consumeSkip()) {
          if (local.done) break;
          await sleep(1400);
          if (cancelled) return;
          continue;
        }

        const note = currentNote(local);
        setLastDirection(local.direction);
        setPhase('playing');
        try {
          await playNote(note.name);
        } catch {
          // file missing → still proceed
        }
        if (cancelled) return;
        if (consumeSkip()) {
          if (local.done) break;
          await sleep(1400);
          if (cancelled) return;
          continue;
        }

        setPhase('listening');
        const { samples, sampleRate } = await recordSamples(RECORD_SECONDS);
        if (cancelled) return;
        if (consumeSkip()) {
          if (local.done) break;
          await sleep(1400);
          if (cancelled) return;
          continue;
        }

        setPhase('analyzing');
        const { detectedFreq } = analyzeBuffer(samples, sampleRate);
        const match = matchToTarget(detectedFreq, note.freq);

        const prevDirection = local.direction;
        local = recordAttempt(local, {
          detectedFreq: match.detectedFreq,
          matchedFreq: match.matchedFreq,
          octaveOffset: match.octaveOffset,
          successRate: match.successRate,
          isSuccessful: match.isMatch,
        });

        setLastAttempt(local.log[local.log.length - 1]);
        setState(local);
        setPhase('feedback');
        await sleep(1100);
        if (cancelled) return;

        if (local.direction !== prevDirection && !local.done) {
          setPhase('transition');
          await sleep(1600);
          if (cancelled) return;
        }
      }

      if (cancelled || !local.done) return;
      setPhase('saving');
      await persistAndFinish(local);
    };

    loop();
    return () => {
      cancelled = true;
      stopAllPlayback();
      abortActiveRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function persistAndFinish(finalState: RangeMachineState) {
    const userId = await upsertUser(user.firstName, user.lastName, user.gender);
    const bounds = getRangeBounds(finalState);
    const successful = finalState.log.filter((l) => l.isSuccessful).length;
    const successRate = finalState.log.length > 0 ? (successful / finalState.log.length) * 100 : 0;

    let voiceTypeName: string | null = null;
    let voiceTypeMatchPercent = 0;
    let possibleGroups = '';
    let lowest = '';
    let highest = '';
    let rangeWidthHz = 0;
    let octaveWidth = 0;

    if (bounds) {
      lowest = bounds.lowest.name;
      highest = bounds.highest.name;
      rangeWidthHz = bounds.highest.freq - bounds.lowest.freq;
      octaveWidth = bounds.octaveWidth;
      const cls = classifyVoiceType(bounds.lowest.freq, bounds.highest.freq, user.gender);
      if (cls) {
        voiceTypeName = cls.best.name;
        voiceTypeMatchPercent = cls.matchPercent;
        possibleGroups = cls.possibleGroups.map((g) => `${g.type.name} (${g.percent.toFixed(0)}%)`).join(', ');
      }
    }

    const score = compositeScore(rangeWidthHz, octaveWidth, successful);

    const testResultId = await db.testResults.add({
      userId,
      voiceTypeName,
      voiceTypeMatchPercent,
      possibleVoiceGroups: possibleGroups,
      minFrequency: bounds?.lowest.freq ?? 0,
      maxFrequency: bounds?.highest.freq ?? 0,
      rangeWidthHz,
      octaveRangeWidth: octaveWidth,
      totalNotesCount: finalState.log.length,
      successfulNotesCount: successful,
      successRate,
      lowestNote: lowest,
      highestNote: highest,
      compositeScore: score,
      testDate: Date.now(),
    });

    await db.attempts.bulkAdd(
      finalState.log.map((l) => ({
        testResultId,
        userId,
        noteName: l.noteName,
        targetFrequency: l.targetFreq,
        detectedFrequency: l.detectedFreq,
        octaveNumber: parseInt(l.noteName.slice(1), 10) || 0,
        accuracyPercent: l.successRate,
        attemptNumber: l.attemptNumber,
        isSuccessful: l.isSuccessful,
        direction: l.direction,
        recordedAt: Date.now(),
      }))
    );

    onComplete({ testResultId, userId });
  }

  const note = currentNote(state);
  const reachedCount = state.reachedNotes.size;

  const skipDisabled =
    state.done ||
    phase === 'analyzing' ||
    phase === 'feedback' ||
    phase === 'transition' ||
    phase === 'saving' ||
    phase === 'preparing';

  const skipLabel =
    state.direction === 'down'
      ? 'Aşağı yönü bitir, yukarıya geç'
      : 'Yukarı yönü bitir, sonuçları gör';

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-5">
      {/* Status pill */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-200/60 text-xs font-medium text-agora-dark">
          {lastDirection === 'down' ? <><ArrowDown size={13} /> Aşağı</> : <><ArrowUp size={13} /> Yukarı</>}
          <span className="text-agora-muted">·</span>
          <span className="text-agora-muted">{reachedCount} nota başarılı</span>
        </div>
      </div>

      {/* Status banner ABOVE piano */}
      <div className="min-h-[64px] flex items-center justify-center">
        <StatusBanner phase={phase} lastAttempt={lastAttempt} />
      </div>

      {/* Animated piano key */}
      <div className="flex justify-center">
        <PianoKey noteName={note.name} phase={phase} />
      </div>

      {/* Shazam staircase */}
      <NoteStaircase state={state} phase={phase} />

      {/* Skip button */}
      <div className="flex justify-center">
        <button
          onClick={handleSkip}
          disabled={skipDisabled}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border-2 border-stone-300 text-agora-dark hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <SkipForward size={16} /> {skipLabel}
        </button>
      </div>
    </div>
  );
}

function PianoKey({ noteName, phase }: { noteName: string; phase: Phase }) {
  const isPlaying = phase === 'playing';
  const isListening = phase === 'listening';

  return (
    <div className="relative inline-block">
      {/* Shazam halo */}
      {isListening && [1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border-2 border-[var(--agora-terracotta)]/50 pointer-events-none"
          style={{
            inset: `${-14 - i * 18}px`,
            animation: `ping ${1.1 + i * 0.25}s cubic-bezier(0,0,0.2,1) infinite`,
            animationDelay: `${i * 0.18}s`,
            opacity: 1 / (i + 0.5),
          }}
        />
      ))}

      {/* The piano key */}
      <div
        className="relative flex flex-col items-center justify-end pb-5 transition-all duration-150"
        style={{
          width: '128px',
          height: '170px',
          background: isPlaying
            ? 'linear-gradient(to bottom, #fef3c7 0%, #fbbf24 70%, #d97706 100%)'
            : 'linear-gradient(to bottom, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)',
          borderRadius: '6px 6px 14px 14px',
          border: '1px solid rgba(0,0,0,0.18)',
          boxShadow: isPlaying
            ? 'inset 0 -10px 20px rgba(180,83,9,0.4), 0 1px 0 rgba(0,0,0,0.3), 0 0 36px rgba(251,191,36,0.7)'
            : '0 6px 0 rgba(0,0,0,0.12), 0 8px 14px rgba(0,0,0,0.1)',
          transform: isPlaying ? 'translateY(5px)' : 'translateY(0)',
        }}
      >
        <div
          className="text-4xl font-black"
          style={{ color: isPlaying ? '#78350f' : '#1c1917' }}
        >
          {noteToTurkish(noteName)}
        </div>
        <div className={`text-xs mt-1 font-medium ${isPlaying ? 'text-amber-900/70' : 'text-stone-500'}`}>
          {noteName}
        </div>

        {/* Playing indicator */}
        {isPlaying && (
          <Volume2
            size={14}
            className="absolute top-3 right-3 text-amber-900 animate-pulse"
          />
        )}
        {isListening && (
          <Mic
            size={14}
            className="absolute top-3 right-3 text-[var(--agora-terracotta)]"
          />
        )}
      </div>
    </div>
  );
}

function NoteStaircase({ state, phase }: { state: RangeMachineState; phase: Phase }) {
  const cur = currentNote(state);
  const isListening = phase === 'listening';
  const isPlaying = phase === 'playing';

  // Best success rate per note across attempts
  const bestSuccess = new Map<string, number>();
  for (const entry of state.log) {
    const prev = bestSuccess.get(entry.noteName) ?? 0;
    if (entry.successRate > prev) bestSuccess.set(entry.noteName, entry.successRate);
  }

  return (
    <div
      className="relative rounded-3xl overflow-hidden p-4 pb-8"
      style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 60%, #0d1b2a 100%)', minHeight: '240px' }}
    >
      {/* Grid lines */}
      <div className="absolute inset-x-0 top-4 bottom-8 flex flex-col justify-between pointer-events-none px-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="w-full h-px bg-white/5" />
        ))}
      </div>

      {/* Shazam halo behind current note (listening mode) */}
      {isListening && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[1,2,3].map(i => (
            <div
              key={i}
              className="absolute rounded-full border border-[var(--agora-terracotta)]/60"
              style={{
                width: `${i * 70}px`,
                height: `${i * 70}px`,
                animation: `ping ${0.9 + i * 0.3}s cubic-bezier(0,0,0.2,1) infinite`,
                animationDelay: `${i * 0.2}s`,
                opacity: 1 / i,
              }}
            />
          ))}
        </div>
      )}

      {/* Bars */}
      <div className="flex items-end gap-[3px] h-40 relative z-10">
        {NOTE_FREQUENCIES.map((n, idx) => {
          const heightPct = 8 + (idx / (NOTE_FREQUENCIES.length - 1)) * 88;
          const reached = state.reachedNotes.has(n.name);
          const isCurrent = n.name === cur.name && !state.done;
          const isC = n.name.startsWith('C');
          const score = bestSuccess.get(n.name);

          return (
            <div
              key={n.name}
              className="relative flex-1 flex flex-col items-center justify-end"
              style={{ height: '100%' }}
            >
              {/* % label */}
              {score !== undefined && (
                <div
                  className="absolute text-center pointer-events-none font-bold whitespace-nowrap"
                  style={{
                    bottom: `calc(${heightPct}% + 4px)`,
                    left: '-6px',
                    right: '-6px',
                    fontSize: '8px',
                    color: reached ? '#fcd34d' : 'rgba(255,255,255,0.45)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.85)',
                    letterSpacing: '-0.3px',
                  }}
                >
                  {Math.round(score)}
                </div>
              )}

              {/* Glow cap on reached bars */}
              {reached && (
                <div
                  className="absolute w-full rounded-t-sm"
                  style={{
                    bottom: `${heightPct}%`,
                    height: '4px',
                    background: 'rgba(251,191,36,0.9)',
                    boxShadow: '0 0 8px 3px rgba(251,191,36,0.6)',
                  }}
                />
              )}

              {/* Current note top indicator */}
              {isCurrent && (
                <div
                  className="absolute flex justify-center w-full"
                  style={{ bottom: `calc(${heightPct}% + 6px)` }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: '6px', height: '6px',
                      background: isListening ? 'var(--agora-terracotta)' : 'var(--agora-gold)',
                      boxShadow: isListening
                        ? '0 0 0 4px rgba(220,38,38,0.3), 0 0 12px 4px rgba(220,38,38,0.5)'
                        : '0 0 0 4px rgba(217,119,6,0.3), 0 0 12px 4px rgba(217,119,6,0.5)',
                      animation: 'pulse 1s ease-in-out infinite',
                    }}
                  />
                </div>
              )}

              {/* The bar */}
              <div
                className="w-full rounded-t-sm transition-all duration-700"
                style={{
                  height: `${heightPct}%`,
                  background: reached
                    ? 'linear-gradient(to top, #b45309, #fbbf24)'
                    : isCurrent
                    ? isListening
                      ? 'linear-gradient(to top, #7f1d1d, #dc2626)'
                      : 'linear-gradient(to top, #92400e, #d97706)'
                    : 'rgba(255,255,255,0.07)',
                  boxShadow: reached
                    ? '0 -2px 8px rgba(251,191,36,0.4)'
                    : isCurrent
                    ? isListening
                      ? '0 -2px 12px rgba(220,38,38,0.7)'
                      : '0 -2px 12px rgba(217,119,6,0.6)'
                    : 'none',
                }}
              />

              {/* C-note label */}
              {isC && (
                <div className="absolute -bottom-6 text-[8px] font-medium text-white/40">
                  {n.name}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Range label */}
      {!state.done && (
        <div className="absolute top-4 right-4 text-right">
          <div className="text-white/30 text-[9px] uppercase tracking-widest">Frekans</div>
          <div className="text-white/70 text-sm font-semibold">{cur.freq.toFixed(0)} Hz</div>
        </div>
      )}
    </div>
  );
}

function StatusBanner({ phase, lastAttempt }: { phase: Phase; lastAttempt: AttemptLog | null }) {
  if (phase === 'feedback' && lastAttempt) {
    if (lastAttempt.isSuccessful) {
      const { msg, emoji } = getMotivation(lastAttempt.successRate);
      return (
        <div
          key={`s-${lastAttempt.noteName}-${lastAttempt.attemptNumber}`}
          className="animate-fade-in flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-[var(--agora-olive)]/15 to-emerald-50 border-2 border-[var(--agora-olive)]/40 shadow-lg"
        >
          <span className="text-3xl">{emoji}</span>
          <div className="text-left">
            <div className="text-lg font-bold text-[var(--agora-olive)] leading-tight">{msg}</div>
            <div className="text-xs text-agora-muted">%{lastAttempt.successRate.toFixed(0)} doğruluk</div>
          </div>
        </div>
      );
    }
    const { msg, emoji } = getEncouragement(lastAttempt.successRate);
    return (
      <div
        key={`f-${lastAttempt.noteName}-${lastAttempt.attemptNumber}`}
        className="animate-fade-in flex items-center gap-3 px-5 py-3 rounded-2xl bg-stone-100 border-2 border-stone-300"
      >
        <span className="text-3xl">{emoji}</span>
        <div className="text-left">
          <div className="text-base font-semibold text-agora-dark leading-tight">
            {msg}{lastAttempt.attemptNumber === 1 ? ' — tekrar dene' : ''}
          </div>
          {lastAttempt.successRate > 0 && (
            <div className="text-xs text-agora-muted">%{lastAttempt.successRate.toFixed(0)} yakınlık</div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'preparing') return <Pill text="Hazırlanıyor..." />;
  if (phase === 'playing') return <Pill icon={<Volume2 size={18} className="animate-pulse" />} text="Notayı dinle" tone="bronze" />;
  if (phase === 'listening') return <Pill icon={<Mic size={18} className="animate-pulse" />} text="Şimdi sen söyle (2 sn)" tone="terracotta" />;
  if (phase === 'analyzing') return <Pill text="Analiz ediliyor..." />;
  if (phase === 'transition') return <Pill text="Yukarı tarama başlıyor — daha tiz notalar 🎵" tone="bronze" />;
  if (phase === 'saving') return <Pill text="Sonuçlar kaydediliyor..." />;
  return null;
}

function Pill({ icon, text, tone }: { icon?: React.ReactNode; text: string; tone?: 'terracotta' | 'bronze' }) {
  const styles = tone === 'terracotta'
    ? 'bg-[var(--agora-terracotta)]/10 border-[var(--agora-terracotta)]/40 text-[var(--agora-terracotta)]'
    : tone === 'bronze'
    ? 'bg-[var(--agora-bronze)]/10 border-[var(--agora-bronze)]/40 text-[var(--agora-bronze)]'
    : 'bg-stone-100 border-stone-300 text-agora-dark';
  return (
    <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 ${styles} font-semibold text-base`}>
      {icon}
      <span>{text}</span>
    </div>
  );
}

function getMotivation(rate: number): { msg: string; emoji: string } {
  if (rate >= 95) return { msg: 'Kusursuz!',     emoji: '🎯' };
  if (rate >= 90) return { msg: 'Mükemmel!',     emoji: '✨' };
  if (rate >= 85) return { msg: 'Muhteşem!',     emoji: '🌟' };
  if (rate >= 80) return { msg: 'Harika!',       emoji: '👏' };
  if (rate >= 75) return { msg: 'Çok başarılı!', emoji: '🔥' };
  if (rate >= 70) return { msg: 'Çok iyi!',      emoji: '💪' };
  if (rate >= 65) return { msg: 'İyi gidiyorsun!', emoji: '👍' };
  return { msg: 'Başarılı!', emoji: '✅' };
}

function getEncouragement(rate: number): { msg: string; emoji: string } {
  if (rate >= 50) return { msg: 'Yaklaştın, biraz daha dene', emoji: '🎵' };
  if (rate >= 30) return { msg: 'Tonla biraz oynayalım',     emoji: '🎤' };
  return { msg: 'Eşleşmedi',                                    emoji: '🌱' };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
