'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type FormData = {
  name: string;
  attending: 'yes' | 'no' | '';
  guest_count: number | null;
  car_plate: string;
  message: string;
};

type Direction = 'up' | 'down';

const GUEST_OPTIONS = [
  { value: 1, letter: 'A', label: 'Saya single', sub: '1 orang je' },
  { value: 2, letter: 'B', label: 'Mestilah bawak +1', sub: '2 orang' },
  { value: 3, letter: 'C', label: '3 orang', sub: 'Ramai sikit' },
  { value: 4, letter: 'D', label: '4 orang', sub: 'Rombongan dah ni' },
];

export default function RsvpPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<Direction>('up');
  const [stepKey, setStepKey] = useState(0);
  const [data, setData] = useState<FormData>({
    name: '',
    attending: '',
    guest_count: null,
    car_plate: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Steps: 0=name, 1=attending, 2=guest_count, 3=car_plate, 4=message
  // If not attending, skip 2 and 3

  const totalSteps = data.attending === 'no' ? 3 : 5; // name, attending, (guests, car), message
  const progressStep = data.attending === 'no' && step >= 2 ? step - 1 : step;
  const progress = Math.min((progressStep / (totalSteps - 1)) * 100, 100);

  function navigate(toStep: number, dir: Direction) {
    setDirection(dir);
    setStep(toStep);
    setStepKey(k => k + 1);
  }

  function goNext() {
    if (step === 0 && !data.name.trim()) return;
    if (step === 4 || (step === 2 && data.attending === 'no')) {
      handleSubmit();
      return;
    }
    const next = step === 1 && data.attending === 'no' ? 4 : step + 1;
    navigate(next, 'up');
  }

  function goBack() {
    if (step === 0) return;
    const prev = step === 4 && data.attending === 'no' ? 1 : step - 1;
    navigate(prev, 'down');
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          attending: data.attending,
          guest_count: data.guest_count,
          car_plate: data.car_plate,
          message: data.message,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Something went wrong.');
        setSubmitting(false);
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Network error. Try again.');
      setSubmitting(false);
    }
  }

  // Focus input when step changes
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 480);
    return () => clearTimeout(timer);
  }, [step, stepKey]);

  // Enter key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        if (step === 4) return; // textarea uses shift+enter, OK button handles submit
        if (step === 0 && data.name.trim()) goNext();
        if (step === 3) goNext();
      }
    },
    [step, data.name]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0d2418] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🌙✨</div>
          <h2 className="text-4xl font-bold text-white mb-3">Terima kasih, {data.name.split(' ')[0]}!</h2>
          {data.attending === 'yes' ? (
            <p className="text-emerald-300 text-lg">Nampak muka kau nanti! 😄</p>
          ) : (
            <p className="text-emerald-300 text-lg">Takpe, lain kali kita jumpa! 😊</p>
          )}
          <p className="text-amber-400 font-semibold mt-6 text-lg">Selamat Hari Raya Aidilfitri 🌟</p>
          <p className="text-emerald-600 text-sm mt-1">Maaf Zahir & Batin</p>
        </div>
      </div>
    );
  }

  const animClass = direction === 'up' ? 'animate-slide-up' : 'animate-slide-down';

  return (
    <div className="min-h-screen bg-[#0d2418] flex flex-col select-none">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-emerald-950 z-10">
        <div
          className="h-full bg-amber-400 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div key={stepKey} className={`w-full max-w-xl ${animClass}`}>

          {/* Step 0: Name */}
          {step === 0 && (
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <span>01</span>
                <span className="text-amber-600">→</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
                Eh, siapa tu? 👋<br />
                <span className="text-emerald-300">Nama kau apa?</span>
              </h2>
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={data.name}
                onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && data.name.trim() && goNext()}
                placeholder="Taip nama kau di sini..."
                className="w-full bg-transparent border-b-2 border-emerald-600 focus:border-amber-400 text-white text-2xl py-3 outline-none placeholder:text-emerald-800 transition-colors caret-amber-400"
              />
              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={goNext}
                  disabled={!data.name.trim()}
                  className="bg-amber-400 hover:bg-amber-300 disabled:opacity-30 disabled:cursor-not-allowed text-emerald-950 font-bold px-7 py-3 rounded-lg transition-all text-base"
                >
                  OK &nbsp;✓
                </button>
                <span className="text-emerald-700 text-sm">atau tekan <kbd className="bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded text-xs">Enter ↵</kbd></span>
              </div>
            </div>
          )}

          {/* Step 1: Attending */}
          {step === 1 && (
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <span>02</span>
                <span className="text-amber-600">→</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                Hoi <span className="text-amber-400">{data.name.split(' ')[0]}</span>! 🎉
              </h2>
              <p className="text-emerald-300 text-xl mb-8">Datang tak ke open house Raya ni?</p>
              <div className="flex flex-col gap-3">
                {[
                  { value: 'yes', letter: 'Y', label: 'Datang! Insya-Allah 🤲', sub: 'Confirm hadir' },
                  { value: 'no', letter: 'N', label: 'Tak dapat la kali ni 😢', sub: 'Tak hadir' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setData(d => ({ ...d, attending: opt.value as 'yes' | 'no' }));
                      const next = opt.value === 'no' ? 4 : 2;
                      setTimeout(() => navigate(next, 'up'), 150);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all group ${
                      data.attending === opt.value
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-emerald-800 hover:border-emerald-500 bg-emerald-950/40'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0 border ${
                      data.attending === opt.value
                        ? 'bg-amber-400 border-amber-400 text-emerald-950'
                        : 'border-emerald-700 text-emerald-400 group-hover:border-emerald-400'
                    }`}>
                      {opt.letter}
                    </span>
                    <div>
                      <p className="text-white font-semibold">{opt.label}</p>
                      <p className="text-emerald-500 text-sm">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Guest count */}
          {step === 2 && (
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <span>03</span>
                <span className="text-amber-600">→</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                Best tu! 🙌
              </h2>
              <p className="text-emerald-300 text-xl mb-8">Berapa orang datang sekali?</p>
              <div className="flex flex-col gap-3">
                {GUEST_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setData(d => ({ ...d, guest_count: opt.value }));
                      setTimeout(() => navigate(3, 'up'), 150);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all group ${
                      data.guest_count === opt.value
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-emerald-800 hover:border-emerald-500 bg-emerald-950/40'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0 border ${
                      data.guest_count === opt.value
                        ? 'bg-amber-400 border-amber-400 text-emerald-950'
                        : 'border-emerald-700 text-emerald-400 group-hover:border-emerald-400'
                    }`}>
                      {opt.letter}
                    </span>
                    <div>
                      <p className="text-white font-semibold">{opt.label}</p>
                      <p className="text-emerald-500 text-sm">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Car plate */}
          {step === 3 && (
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <span>04</span>
                <span className="text-amber-600">→</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                Nombor plate kereta? 🚗
              </h2>
              <p className="text-emerald-400 text-base mb-8">
                Untuk urusan parking. Boleh skip kalau tak drive.
              </p>
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={data.car_plate}
                onChange={e => setData(d => ({ ...d, car_plate: e.target.value.toUpperCase() }))}
                onKeyDown={e => e.key === 'Enter' && goNext()}
                placeholder="Contoh: WXY 1234"
                maxLength={10}
                className="w-full bg-transparent border-b-2 border-emerald-600 focus:border-amber-400 text-white text-2xl py-3 outline-none placeholder:text-emerald-800 transition-colors caret-amber-400 uppercase tracking-widest"
              />
              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={goNext}
                  className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-7 py-3 rounded-lg transition-all text-base"
                >
                  OK &nbsp;✓
                </button>
                <span className="text-emerald-700 text-sm">atau tekan <kbd className="bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded text-xs">Enter ↵</kbd></span>
              </div>
            </div>
          )}

          {/* Step 4: Message */}
          {step === 4 && (
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <span>{data.attending === 'no' ? '03' : '05'}</span>
                <span className="text-amber-600">→</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                Ada ucapan? 💬
              </h2>
              <p className="text-emerald-400 text-base mb-8">
                Tulis apa-apa untuk tuan rumah. <span className="text-emerald-600">(optional)</span>
              </p>
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={data.message}
                onChange={e => setData(d => ({ ...d, message: e.target.value }))}
                rows={3}
                placeholder="Selamat Hari Raya! Maaf zahir batin..."
                className="w-full bg-transparent border-b-2 border-emerald-600 focus:border-amber-400 text-white text-xl py-3 outline-none placeholder:text-emerald-800 transition-colors caret-amber-400 resize-none"
              />
              {error && (
                <p className="text-red-400 text-sm mt-3">⚠️ {error}</p>
              )}
              <div className="mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-emerald-950 font-bold px-8 py-4 rounded-lg transition-all text-base flex items-center gap-2"
                >
                  {submitting ? (
                    <>Menghantar...</>
                  ) : (
                    <>Hantar RSVP 🌙</>
                  )}
                </button>
                <p className="text-emerald-700 text-xs mt-3">Shift + Enter untuk baris baru</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-6 right-6 flex gap-2">
        <button
          onClick={goBack}
          disabled={step === 0}
          className="w-10 h-10 rounded-lg bg-emerald-900 hover:bg-emerald-800 disabled:opacity-20 text-white flex items-center justify-center transition-all"
          title="Balik"
        >
          ▲
        </button>
        {(step === 0 || step === 3) && (
          <button
            onClick={goNext}
            disabled={step === 0 && !data.name.trim()}
            className="w-10 h-10 rounded-lg bg-emerald-900 hover:bg-emerald-800 disabled:opacity-20 text-white flex items-center justify-center transition-all"
            title="Seterusnya"
          >
            ▼
          </button>
        )}
      </div>

      {/* Watermark */}
      <div className="fixed bottom-6 left-6 text-emerald-900 text-xs">
        Raya Open House 🌙
      </div>
    </div>
  );
}
