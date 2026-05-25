'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import {
  Search,
  Trash2,
  ChevronRight,
  X,
  RefreshCw,
  Users
} from 'lucide-react';

interface Recipient {
  id: string;
  email: string;
  name: string | null;
  token: string;
  openCount: number;
  clickCount: number;
  firstOpened: string | null;
  lastOpened: string | null;
  openLogs?: Array<{
    id: string;
    openedAt: string;
    ip: string;
    browser: string;
    os: string;
    device: string;
    clientType: string;
    city: string | null;
    country: string | null;
  }>;
}

interface Tracker {
  id: string;
  title: string;
  subject: string | null;
  category: string;
  createdAt: string;
  recipients: Recipient[];
}

export default function TrackersPage() {
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);

  const fetchTrackers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/trackers');
      const json = await res.json();
      if (json.success) {
        setTrackers(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tracker and all its logs?')) return;
    try {
      const res = await fetch(`/api/trackers/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setTrackers(trackers.filter((t) => t.id !== id));
        if (selectedTracker?.id === id) setSelectedTracker(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTrackerDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/trackers/${id}`);
      const json = await res.json();
      if (json.success) {
        setSelectedTracker(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTrackers = trackers.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.recipients.some((r) => r.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-[#090d16] text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Campaigns & Email Trackers" />

        <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Active Tracking Campaigns</h1>
              <p className="text-xs text-slate-400">View and inspect telemetry logs for all generated trackers</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search campaigns or emails..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={fetchTrackers}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrackers.map((t) => {
              const totalRec = t.recipients.length;
              const openedRec = t.recipients.filter((r) => r.openCount > 0).length;
              const openRate = totalRec > 0 ? Math.round((openedRec / totalRec) * 100) : 0;

              return (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {t.category}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition truncate">
                      {t.title}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{t.subject || 'No subject line specified'}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Recipients ({totalRec}):</span>
                      <span className="font-semibold text-slate-200">{openedRec} Opened ({openRate}%)</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all"
                        style={{ width: `${openRate}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => fetchTrackerDetail(t.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        View Telemetry <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tracker Detail Modal */}
          {selectedTracker && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedTracker.title}</h2>
                    <p className="text-xs text-slate-400">{selectedTracker.subject || 'No subject'}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTracker(null)}
                    className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Recipient Status & Open Times
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-2.5">Email</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5">Opens</th>
                          <th className="px-4 py-2.5">First Opened</th>
                          <th className="px-4 py-2.5">Last Opened</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {selectedTracker.recipients.map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-800/30">
                            <td className="px-4 py-3 font-medium text-white">{rec.email}</td>
                            <td className="px-4 py-3">
                              {rec.openCount > 0 ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                                  Opened ({rec.openCount}x)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px]">
                                  Unopened
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-200">{rec.openCount}</td>
                            <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                              {rec.firstOpened ? new Date(rec.firstOpened).toLocaleString() : '-'}
                            </td>
                            <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                              {rec.lastOpened ? new Date(rec.lastOpened).toLocaleString() : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
