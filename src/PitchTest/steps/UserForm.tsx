import { useState } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import type { Gender, UserInfo } from '..';
import { validateName } from '../lib/profanity';

export default function UserForm({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (info: UserInfo) => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0 && gender;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const firstCheck = validateName(firstName);
    if (!firstCheck.ok) {
      setError(`Ad: ${firstCheck.reason}`);
      return;
    }
    const lastCheck = validateName(lastName);
    if (!lastCheck.ok) {
      setError(`Soyad: ${lastCheck.reason}`);
      return;
    }

    setError(null);
    onNext({ firstName: firstName.trim(), lastName: lastName.trim(), gender: gender! });
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in max-w-xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-agora-muted hover:text-agora-dark transition-colors mb-6"
      >
        <ArrowLeft size={18} /> Geri
      </button>

      <h2 className="text-2xl sm:text-3xl font-bold text-agora-dark mb-2">Seni tanıyalım</h2>
      <p className="text-agora-muted mb-8">Sonuçların kayıtlı kalması ve ses tipinin doğru hesaplanması için.</p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-agora-dark mb-2">Adın</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); if (error) setError(null); }}
            className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white/80 focus:outline-none focus:border-[var(--agora-terracotta)] focus:ring-2 focus:ring-[var(--agora-terracotta)]/20 transition-all"
            placeholder="Örn. Mennan"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-agora-dark mb-2">Soyadın</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); if (error) setError(null); }}
            className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white/80 focus:outline-none focus:border-[var(--agora-terracotta)] focus:ring-2 focus:ring-[var(--agora-terracotta)]/20 transition-all"
            placeholder="Örn. Sevim"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-agora-dark mb-2">Cinsiyetin</label>
          <div className="grid grid-cols-2 gap-3">
            <GenderButton
              active={gender === 'male'}
              onClick={() => setGender('male')}
              label="Erkek"
              hint="Test Do3'ten başlar"
            />
            <GenderButton
              active={gender === 'female'}
              onClick={() => setGender('female')}
              label="Kadın"
              hint="Test Do4'ten başlar"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full mt-8 btn-agora-primary py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Devam Et <ArrowRight size={18} />
      </button>
    </form>
  );
}

function GenderButton({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all text-left ${
        active
          ? 'border-[var(--agora-terracotta)] bg-[var(--agora-terracotta)]/5 shadow-glow'
          : 'border-stone-300 bg-white/70 hover:border-stone-400'
      }`}
    >
      <div className="font-semibold text-agora-dark">{label}</div>
      <div className="text-xs text-agora-muted mt-0.5">{hint}</div>
    </button>
  );
}
