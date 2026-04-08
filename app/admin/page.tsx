'use client';

import { useState, useEffect } from 'react';

type RSVP = {
  id: number;
  name: string;
  whatsapp: string;
  attending: string;
  guest_count: number;
  dietary: string | null;
  message: string | null;
  created_at: string;
};

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchRsvps(s: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/rsvps?secret=${encodeURIComponent(s)}`);
      if (res.status === 401) {
        setError('Wrong password. Try again.');
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setRsvps(data.rsvps || []);
      setAuthenticated(true);
    } catch {
      setError('Failed to fetch. Check your connection.');
    }
    setLoading(false);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    fetchRsvps(secret);
  }

  // Refresh every 30s
  useEffect(() => {
    if (!authenticated) return;
    const interval = setInterval(() => fetchRsvps(secret), 30000);
    return () => clearInterval(interval);
  }, [authenticated, secret]);

  const attending = rsvps.filter(r => r.attending === 'yes');
  const maybe = rsvps.filter(r => r.attending === 'maybe');
  const notAttending = rsvps.filter(r => r.attending === 'no');
  const totalGuests = attending.reduce((sum, r) => sum + r.guest_count, 0);
  const maybeGuests = maybe.reduce((sum, r) => sum + r.guest_count, 0);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-emerald-800 mb-1">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mb-6">Enter your admin password to view RSVPs</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              placeholder="Admin password"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🌙 Raya RSVP Dashboard</h1>
            <p className="text-gray-500 text-sm">{rsvps.length} responses · auto-refreshes every 30s</p>
          </div>
          <button
            onClick={() => fetchRsvps(secret)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-emerald-500">
            <p className="text-3xl font-bold text-emerald-600">{attending.length}</p>
            <p className="text-sm text-gray-500 mt-1">Confirmed Yes</p>
            <p className="text-xs text-gray-400">{totalGuests} guests total</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-amber-400">
            <p className="text-3xl font-bold text-amber-500">{maybe.length}</p>
            <p className="text-sm text-gray-500 mt-1">Maybe</p>
            <p className="text-xs text-gray-400">{maybeGuests} potential guests</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-red-400">
            <p className="text-3xl font-bold text-red-500">{notAttending.length}</p>
            <p className="text-sm text-gray-500 mt-1">Can&apos;t make it</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-blue-400">
            <p className="text-3xl font-bold text-blue-500">{totalGuests + maybeGuests}</p>
            <p className="text-sm text-gray-500 mt-1">Max Expected</p>
            <p className="text-xs text-gray-400">confirmed + maybe</p>
          </div>
        </div>

        {/* RSVP table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">All Responses</h2>
          </div>
          {rsvps.length === 0 ? (
            <div className="p-10 text-center text-gray-400">No RSVPs yet 🌙</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">WhatsApp</th>
                    <th className="px-4 py-3 text-left">Attending</th>
                    <th className="px-4 py-3 text-left">Guests</th>
                    <th className="px-4 py-3 text-left">Dietary</th>
                    <th className="px-4 py-3 text-left">Message</th>
                    <th className="px-4 py-3 text-left">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rsvps.map((r, i) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://wa.me/60${r.whatsapp.replace(/^0/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline"
                        >
                          {r.whatsapp}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          r.attending === 'yes' ? 'bg-emerald-100 text-emerald-700'
                          : r.attending === 'maybe' ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                          {r.attending === 'yes' ? '✅ Yes' : r.attending === 'maybe' ? '🤔 Maybe' : '❌ No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.attending !== 'no' ? r.guest_count : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{r.dietary || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{r.message || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
