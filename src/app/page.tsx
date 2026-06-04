'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import {
  Eye,
  Mail,
  MousePointerClick,
  TrendingUp,
  Activity,
  PlusCircle,
  Globe,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsData {
  totalTrackers: number;
  totalRecipients: number;
  openedRecipients: number;
  clickedRecipients: number;
  totalOpens: number;
  totalClicks: number;
  openRate: number;
  clickRate: number;
  recentActivity: Array<{
    id: string;
    openedAt: string;
    ip: string;
    browser: string;
    os: string;
    device: string;
    clientType: string;
    country: string | null;
    city: string | null;
    recipient: {
      email: string;
      name: string | null;
      tracker: {
        title: string;
        subject: string | null;
      };
    };
  }>;
  deviceData: Array<{ name: string; value: number }>;
  clientData: Array<{ name: string; value: number }>;
  timelineData: Array<{ date: string; opens: number }>;
}

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Poll every 10 seconds for real-time tracking updates
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-[#090d16] text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Dashboard & Live Analytics" />

        <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Actions & Overview */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Email Tracking Telemetry</h1>
              <p className="text-sm text-slate-400">
                Real-time stealth monitoring for opened emails, multi-recipient CC/BCC clicks, and location data.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchAnalytics}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-sm font-medium transition"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <Link
                href="/generator"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
              >
                <PlusCircle className="w-4 h-4" />
                New Tracker
              </Link>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Total Tracked</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-white">{data?.totalRecipients ?? 0}</div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  Across <span className="font-semibold text-slate-200">{data?.totalTrackers ?? 0}</span> campaigns
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Unique Opens</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-white">{data?.openedRecipients ?? 0}</div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {data?.openRate ?? 0}% Unique Open Rate
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Total Open Events</span>
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-white">{data?.totalOpens ?? 0}</div>
                <div className="text-xs text-slate-400 mt-1">Total pixel reads recorded</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Link Clicks</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <MousePointerClick className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-white">{data?.totalClicks ?? 0}</div>
                <div className="text-xs text-amber-400 mt-1 font-medium">
                  {data?.clickRate ?? 0}% Click-Through Rate (CTR)
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Opens Timeline Chart */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-base">Opens Over Time</h3>
                  <p className="text-xs text-slate-400">Daily email reads across all recipients</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Last 7 Days
                </span>
              </div>

              <div className="h-64 w-full">
                {data?.timelineData && data.timelineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Area type="monotone" dataKey="opens" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOpens)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-500">
                    No opens recorded yet. Generate a tracker to see live chart data!
                  </div>
                )}
              </div>
            </div>

            {/* Email Client & Device Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white text-base mb-1">Device & Client Breakdown</h3>
                <p className="text-xs text-slate-400 mb-4">Email clients & proxies reading pixels</p>
              </div>

              <div className="h-48 w-full flex items-center justify-center relative">
                {data?.clientData && data.clientData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.clientData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {data.clientData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-slate-500">No client data yet</div>
                )}
              </div>

              <div className="space-y-1.5 mt-2">
                {data?.clientData?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      ></span>
                      <span className="text-slate-300 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-200">{item.value} opens</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Recent Activity Feed Table */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base">Live Activity Feed</h3>
                <p className="text-xs text-slate-400">Real-time open events recorded by stealth pixel</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Live Polling
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/50 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Recipient Email</th>
                    <th className="px-4 py-3">Campaign / Subject</th>
                    <th className="px-4 py-3">Client / Proxy</th>
                    <th className="px-4 py-3">Browser / OS</th>
                    <th className="px-4 py-3">Location & IP</th>
                    <th className="px-4 py-3 text-right">Time Opened</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data?.recentActivity && data.recentActivity.length > 0 ? (
                    data.recentActivity.map((activity) => (
                      <tr key={activity.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 font-medium text-white">
                          {activity.recipient.email}
                          {activity.recipient.name && (
                            <span className="text-slate-400 text-[11px] block">{activity.recipient.name}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          <div className="font-medium text-slate-200">{activity.recipient.tracker.title}</div>
                          <div className="text-slate-500 text-[11px] truncate max-w-[200px]">
                            {activity.recipient.tracker.subject || 'No subject'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 text-[11px] font-medium">
                            {activity.clientType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {activity.browser} • {activity.os}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-500" />
                            {activity.city ? `${activity.city}, ${activity.country}` : activity.ip}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-400 font-mono text-[11px]">
                          {new Date(activity.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        No activity recorded yet. Create a tracker to start capturing opens!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
