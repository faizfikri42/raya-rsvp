'use client';

import { useState } from 'react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function RsvpPage() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    attending: '',
    guest_count: '1',
    dietary: '',
    message: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong.');
        setFormState('error');
      } else {
        setFormState('success');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setFormState('error');
    }
  }

  if (formState === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🌙✨</div>
          <h2 className="text-3xl font-bold text-emerald-800 mb-2">Terima Kasih!</h2>
          <p className="text-gray-600 mb-1">
            {form.attending === 'yes'
              ? `We can't wait to see you, ${form.name.split(' ')[0]}!`
              : `We'll miss you, ${form.name.split(' ')[0]}. Maybe next time!`}
          </p>
          <p className="text-amber-600 font-semibold mt-4">Selamat Hari Raya Aidilfitri 🌟</p>
          <p className="text-sm text-gray-400 mt-1">Maaf Zahir & Batin</p>
          <button
            onClick={() => {
              setFormState('idle');
              setForm({ name: '', whatsapp: '', attending: '', guest_count: '1', dietary: '', message: '' });
            }}
            className="mt-6 text-sm text-emerald-600 underline hover:text-emerald-800"
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 py-10 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🌙 🕌 🌙</div>
        <h1 className="text-4xl font-extrabold text-amber-400 tracking-tight drop-shadow-lg">
          Raya Open House
        </h1>
        <p className="text-emerald-200 mt-1 text-lg font-medium">
          You&apos;re invited! Please RSVP below 💚
        </p>
        <div className="mt-3 inline-block bg-amber-400/20 border border-amber-400/40 rounded-full px-5 py-2">
          <p className="text-amber-300 text-sm font-semibold">
            📅 Raya 2025 &nbsp;|&nbsp; 📍 Kuala Lumpur
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-3" />

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Ahmad bin Ali"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              required
              placeholder="e.g. 0123456789"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          {/* Attending */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Will you be attending? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'yes', label: '✅ Yes!', color: 'emerald' },
                { value: 'maybe', label: '🤔 Maybe', color: 'amber' },
                { value: 'no', label: "❌ Can't make it", color: 'red' },
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer text-sm font-semibold transition-all ${
                    form.attending === opt.value
                      ? opt.color === 'emerald'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : opt.color === 'amber'
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="attending"
                    value={opt.value}
                    checked={form.attending === opt.value}
                    onChange={handleChange}
                    required
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Guest count */}
          {(form.attending === 'yes' || form.attending === 'maybe') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                How many people coming?{' '}
                <span className="text-gray-400 font-normal">(including yourself)</span>
              </label>
              <select
                name="guest_count"
                value={form.guest_count}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              >
                {Array.from({ length: 15 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'person' : 'people'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dietary */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Dietary requirements{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              name="dietary"
              value={form.dietary}
              onChange={handleChange}
              placeholder="e.g. Vegetarian, No shellfish, Allergies..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Message for the host{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={3}
              placeholder="Selamat Hari Raya! Can't wait to see you 😊"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Error */}
          {formState === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={formState === 'submitting'}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-lg"
          >
            {formState === 'submitting' ? 'Sending...' : 'Submit RSVP 🌙'}
          </button>

          <p className="text-center text-xs text-gray-400">
            Selamat Hari Raya Aidilfitri · Maaf Zahir & Batin
          </p>
        </form>
      </div>
    </div>
  );
}
