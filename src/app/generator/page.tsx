'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import {
  Check,
  Copy,
  MousePointerClick,
  Sparkles,
  Users,
  EyeOff,
  Zap
} from 'lucide-react';

interface RecipientResult {
  id: string;
  email: string;
  name?: string;
  token: string;
}

interface GeneratedTracker {
  id: string;
  title: string;
  subject?: string;
  recipients: RecipientResult[];
}

export default function GeneratorPage() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [category] = useState('General');
  const [recipientsInput, setRecipientsInput] = useState('');
  const [targetLink, setTargetLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdTracker, setCreatedTracker] = useState<GeneratedTracker | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !recipientsInput.trim()) return;

    // Split input by newlines, commas, or semicolons
    const recipientEmails = recipientsInput
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && e.includes('@'));

    if (recipientEmails.length === 0) {
      alert('Please enter at least one valid recipient email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/trackers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject,
          category,
          recipients: recipientEmails,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCreatedTracker(json.data);
      } else {
        alert(json.error || 'Failed to create tracker');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating tracker');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="flex h-screen bg-[#090d16] text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Stealth Pixel & Link Generator" />

        <main className="p-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Multi-Recipient Tracking Generator</h1>
                <p className="text-xs text-slate-400">
                  Generate invisible 1x1 HTML pixel tags tailored per recipient for exact open pinpointing in CC/BCC.
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Campaign / Email Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q3 Sales Pitch - Acme Corp"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Email Subject Line (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Partnership Proposal for 2026"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Recipient Email Addresses * (CC / BCC / Multi-Send)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter recipient emails separated by line, comma or semicolon:
alice@acme.com
bob@acme.com
carol@acme.com"
                  value={recipientsInput}
                  onChange={(e) => setRecipientsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                ></textarea>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  💡 Each recipient gets a unique invisible pixel token. If sending in CC/BCC, use each recipient&apos;s custom snippet in their individual copy or mail merge!
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Target Link to Track Clicks (Optional)
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://mycompany.com/proposal.pdf"
                  value={targetLink}
                  onChange={(e) => setTargetLink(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  {loading ? 'Generating Tokens...' : 'Generate Invisible Tracking Snippets'}
                </button>
              </div>
            </form>
          </div>

          {/* Generated Output Card */}
          {createdTracker && (
            <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-md space-y-6 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    <Check className="w-4 h-4" /> Tracker Created Successfully
                  </div>
                  <h2 className="text-lg font-bold text-white">{createdTracker.title}</h2>
                </div>

                <button
                  onClick={() => {
                    setCreatedTracker(null);
                    setTitle('');
                    setRecipientsInput('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Create Another
                </button>
              </div>

              {/* Recipient Snippets List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Individual Recipient Stealth HTML Snippets ({createdTracker.recipients.length})
                </h3>

                <div className="space-y-4">
                  {createdTracker.recipients.map((rec) => {
                    const pixelUrl = `${baseUrl}/api/track/pixel?t=${rec.token}`;
                    const pixelHtml = `<img src="${pixelUrl}" width="1" height="1" border="0" style="display:none !important; width:1px; height:1px; border:0; outline:none; text-decoration:none;" alt="" />`;
                    const clickUrl = targetLink
                      ? `${baseUrl}/api/track/link?t=${rec.token}&url=${encodeURIComponent(targetLink)}`
                      : null;

                    return (
                      <div key={rec.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-indigo-400 text-sm">{rec.email}</span>
                          <span className="text-[11px] text-slate-400 font-mono">Token: {rec.token.substring(0, 8)}...</span>
                        </div>

                        {/* Invisible Pixel HTML Snippet */}
                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                            <span className="flex items-center gap-1">
                              <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> Invisible HTML Pixel Component (0px Size)
                            </span>
                            <button
                              onClick={() => copyToClipboard(pixelHtml, `pixel-${rec.id}`)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-[11px] font-medium transition"
                            >
                              {copiedToken === `pixel-${rec.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              {copiedToken === `pixel-${rec.id}` ? 'Copied HTML!' : 'Copy Pixel HTML'}
                            </button>
                          </div>
                          <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                            {pixelHtml}
                          </pre>
                        </div>

                        {/* Tracked Link if targetLink provided */}
                        {clickUrl && (
                          <div>
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                              <span className="flex items-center gap-1">
                                <MousePointerClick className="w-3.5 h-3.5 text-amber-400" /> Tracked Hyperlink
                              </span>
                              <button
                                onClick={() => copyToClipboard(clickUrl, `link-${rec.id}`)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 text-[11px] font-medium transition"
                              >
                                {copiedToken === `link-${rec.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                {copiedToken === `link-${rec.id}` ? 'Copied Link!' : 'Copy Tracked Link'}
                              </button>
                            </div>
                            <input
                              type="text"
                              readOnly
                              value={clickUrl}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-300 select-all"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
