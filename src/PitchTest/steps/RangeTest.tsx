import { useEffect, useRef, useState } from 'react';
import { Volume2, Mic, ArrowDown, ArrowUp, SkipForward } from 'lucide-react';
import type { UserInfo, FinalResult } from '..';
import { initState, currentNote, recordAttempt, skipDirection, getRangeBounds, type RangeMachineState, type AttemptLog } from '../lib/rangeMachine';
import { getStartNoteForGender, NOTE_FREQUENCIES, noteToTurkish } from '../lib/notes';
import { playNote, preloadNotes, stopAllPlayback } from '../lib/audioPlayer';
import { recordSamplesWithBlob, abortActiveRecording } from '../lib/recorder';
import { analyzeBuffer, matchToTarget } from '../lib/pitchDetector';
import { saveTestSession, uploadRecording } from '../lib/db';
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
  type PendingRec = {
    blob: Blob;
    noteName: string;
    targetFreq: number;
    detectedFreq: number | null;
    accuracy: number;
    attemptNumber: number;
    direction: 'down' | 'up';
  };
  const pendingRecsRef = useRef<PendingRec[]>([]);

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
        const { samples, sampleRate, blob } = await recordSamplesWithBlob(RECORD_SECONDS);
        if (cancelled) return;
        if (consumeSkip()) {
          if (local.done) break;
          await sleep(1400);
          if (cancelled) return;
          continue;
        }

        setPhase('analyzing');
        const pitchResult = analyzeBuffer(samples, sampleRate, note.freq);
        const match = matchToTarget(pitchResult.detectedFreq, note.freq);

        const prevDirection = local.direction;
        local = recordAttempt(local, {
          detectedFreq: match.detectedFreq,
          matchedFreq: match.matchedFreq,
          octaveOffset: match.octaveOffset,
          successRate: match.successRate,
          isSuccessful: match.isMatch,
          rms: pitchResult.rms,
          pitchStabilityCents: pitchResult.pitchStabilityCents,
          voicedRatio: pitchResult.voicedRatio,
        });

        const justLogged = local.log[local.log.length - 1];
        if (justLogged) {
          pendingRecsRef.current.push({
            blob,
            noteName: justLogged.noteName,
            targetFreq: justLogged.targetFreq,
            detectedFreq: justLogged.detectedFreq,
            accuracy: justLogged.successRate,
            attemptNumber: justLogged.attemptNumber,
            direction: justLogged.direction,
          });
        }
        setLastAttempt(justLogged);
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
    const bounds = getRangeBounds(finalState);
    // Nota başına en iyi denemeyi al (aynı nota için birden fazla deneme olabilir)
    const bestByNote = new Map<string, (typeof finalState.log)[number]>();
    for (const a of finalState.log) {
      const prev = bestByNote.get(a.noteName);
      if (!prev || (a.successRate ?? 0) > (prev.successRate ?? 0)) bestByNote.set(a.noteName, a);
    }
    const successful = [...bestByNote.values()].filter((a) => a.isSuccessful).length;
    const totalNotes = bestByNote.size;
    const successRate = totalNotes > 0 ? (successful / totalNotes) * 100 : 0;

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

    const score = compositeScore(octaveWidth, successful, totalNotes);

    // Başarılı denemelerin ortalaması — ses kalitesi metrikleri
    const successfulLogs = finalState.log.filter((l) => l.isSuccessful);
    const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
    const avgRms = avg(successfulLogs.map((l) => l.rms ?? 0).filter((v) => v > 0));
    const avgPitchStability = avg(successfulLogs.map((l) => l.pitchStabilityCents ?? 0).filter((v) => v > 0));
    const avgVoicedRatio = avg(successfulLogs.map((l) => l.voicedRatio ?? 0).filter((v) => v > 0));

    const { sessionId } = await saveTestSession({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
      },
      result: {
        voiceTypeName,
        voiceTypeMatchPercent,
        possibleVoiceGroups: possibleGroups,
        minFrequency: bounds?.lowest.freq ?? 0,
        maxFrequency: bounds?.highest.freq ?? 0,
        rangeWidthHz,
        octaveRangeWidth: octaveWidth,
        totalNotesCount: totalNotes,
        successfulNotesCount: successful,
        successRate,
        lowestNote: lowest,
        highestNote: highest,
        compositeScore: score,
        avgRms,
        avgPitchStability,
        avgVoicedRatio,
        testDate: Date.now(),
      },
      attempts: finalState.log.map((l) => ({
        noteName: l.noteName,
        targetFrequency: l.targetFreq,
        detectedFrequency: l.detectedFreq,
        octaveNumber: parseInt(l.noteName.slice(1), 10) || 0,
        accuracyPercent: l.successRate,
        attemptNumber: l.attemptNumber,
        isSuccessful: l.isSuccessful,
        direction: l.direction,
        recordedAt: Date.now(),
      })),
    });

    // Ses kayıtlarını arka planda yükle — kullanıcı akışını bloklamaz.
    const recsToUpload = pendingRecsRef.current.slice();
    pendingRecsRef.current = [];
    void Promise.all(
      recsToUpload.map((r, idx) =>
        uploadRecording(sessionId, 'range', r.blob, {
          idx: `${idx}-${r.noteName}-${r.attemptNumber}`,
          noteName: r.noteName,
          targetFreq: r.targetFreq,
          detectedFreq: r.detectedFreq ?? '',
          accuracy: r.accuracy.toFixed(2),
          attemptNumber: r.attemptNumber,
          direction: r.direction,
        }),
      ),
    );

    onComplete({ testResultId: sessionId, userId: sessionId });
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
    state.direction === 'up'
      ? 'Yukarı yönü bitir, aşağıya geç'
      : 'Aşağı yönü bitir, sonuçları gör';

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

      {/* Listening: Shazam orb · diğer fazlarda: piyano tuşu */}
      <div className="flex justify-center items-center" style={{ height: '180px' }}>
        {phase === 'listening'
          ? <ListeningOrb noteName={note.name} />
          : <PianoKey noteName={note.name} phase={phase} />
        }
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

function ListeningOrb({ noteName: _noteName }: { noteName: string }) {
  // Marka renklerinden uyumlu palet (amber, bronz, gold tonları)
  return (
    <div className="relative flex items-center justify-center" style={{ width: '170px', height: '170px' }}>
      {/* Dış halka dalgaları — sıcak amber */}
      {[0, 0.55, 1.1].map((d, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: '1.5px solid rgba(217,119,6,0.4)',
            animation: 'orb-ring-pulse 2s cubic-bezier(0,0,0.2,1) infinite',
            animationDelay: `${d}s`,
          }}
        />
      ))}

      {/* Petal katmanı 1 — amber/sarı, yavaş */}
      <div
        className="absolute rounded-full"
        style={{
          inset: '10%',
          background:
            'conic-gradient(from 0deg,' +
            'rgba(251,191,36,0.55) 0deg, rgba(251,191,36,0) 40deg,' +
            'rgba(251,191,36,0.55) 80deg, rgba(251,191,36,0) 120deg,' +
            'rgba(251,191,36,0.55) 160deg, rgba(251,191,36,0) 200deg,' +
            'rgba(251,191,36,0.55) 240deg, rgba(251,191,36,0) 280deg,' +
            'rgba(251,191,36,0.55) 320deg, rgba(251,191,36,0) 360deg)',
          animation: 'orb-spin-slow 8s linear infinite',
          filter: 'blur(3px)',
          mask: 'radial-gradient(circle, transparent 32%, black 36%, black 100%)',
          WebkitMask: 'radial-gradient(circle, transparent 32%, black 36%, black 100%)',
        }}
      />

      {/* Petal katmanı 2 — bronz/turuncu, ters yön */}
      <div
        className="absolute rounded-full"
        style={{
          inset: '14%',
          background:
            'conic-gradient(from 30deg,' +
            'rgba(217,119,6,0.5) 0deg, rgba(217,119,6,0) 60deg,' +
            'rgba(217,119,6,0.5) 120deg, rgba(217,119,6,0) 180deg,' +
            'rgba(217,119,6,0.5) 240deg, rgba(217,119,6,0) 300deg)',
          animation: 'orb-spin-rev 5s linear infinite',
          filter: 'blur(2px)',
          mask: 'radial-gradient(circle, transparent 34%, black 38%, black 100%)',
          WebkitMask: 'radial-gradient(circle, transparent 34%, black 38%, black 100%)',
        }}
      />

      {/* Yumuşak iç glow — sıcak amber */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: '22%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.35) 0%, rgba(217,119,6,0.15) 50%, transparent 75%)',
          animation: 'orb-petals-breathe 1.7s ease-in-out infinite',
        }}
      />

      {/* Merkez — Agora logo, beyaz/yumuşak zemin */}
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: '92px',
          height: '92px',
          background: 'radial-gradient(circle, #ffffff 0%, #fef3c7 70%, #fde68a 100%)',
          boxShadow: '0 0 22px rgba(217,119,6,0.45), inset 0 -3px 8px rgba(146,64,14,0.18), inset 0 2px 5px rgba(255,255,255,0.7)',
          animation: 'orb-petals-breathe 1.7s ease-in-out infinite',
        }}
      >
        <img
          src="/agora-transparent.png"
          alt="Agora Voice"
          className="object-contain"
          style={{ width: '72px', height: '72px' }}
          draggable={false}
        />
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

              {/* The bar */}
              <div
                className="relative w-full rounded-t-sm transition-all duration-700 overflow-hidden"
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
                      ? '0 -2px 14px rgba(220,38,38,0.7)'
                      : '0 -2px 12px rgba(217,119,6,0.6)'
                    : 'none',
                  animation: isCurrent && isListening ? 'soft-pulse-glow 1.6s ease-in-out infinite' : undefined,
                  transformOrigin: 'bottom',
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
  if (phase === 'transition') return <Pill text="Aşağı tarama başlıyor — daha pes notalar 🎵" tone="bronze" />;
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
