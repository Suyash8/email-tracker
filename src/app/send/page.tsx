'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Mail, Send, Settings, ShieldCheck, Sparkles } from 'lucide-react';

export default function SendMailPage() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [recipientsInput, setRecipientsInput] = useState('');
  const [htmlContent, setHtmlContent] = useState(
    `<p>Hello,</p>\n<p>Hope this email finds you well. Here is the project summary we discussed.</p>\n<p>Best regards,<br/>Team</p>`
  );
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [showSmtp, setShowSmtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    data?: {
      smtpConfigured: boolean;
      sendResults: Array<{ email: string; status: string; error?: string }>;
    };
    error?: string;
  } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !recipientsInput || !htmlContent) return;

    const recipientEmails = recipientsInput
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && e.includes('@'));

    if (recipientEmails.length === 0) {
      alert('Please provide at least one valid recipient email.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject,
          htmlContent,
          recipients: recipientEmails,
          smtpSettings: smtpUser && smtpPass ? { host: smtpHost, port: smtpPort, user: smtpUser, pass: smtpPass } : null,
        }),
      });

      const json = await res.json();
      setResult(json);
    } catch (err) {
      console.error(err);
      alert('Failed to process mail dispatch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#090d16] text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="In-App Tracked Mail Composer" />

        <main className="p-6 max-w-4xl mx-auto w-full space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Compose & Dispatch Tracked Email</h1>
                  <p className="text-xs text-slate-400">
                    Automatically inject recipient-specific stealth pixels into your emails.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSmtp(!showSmtp)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
              >
                <Settings className="w-3.5 h-3.5" />
                {showSmtp ? 'Hide SMTP Setup' : 'SMTP Credentials'}
              </button>
            </div>

            {/* SMTP Setup accordion */}
            {showSmtp && (
              <div className="p-4 mb-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Optional Custom SMTP (Gmail / Ethereal / SendGrid)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Host</label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Port</label>
                    <input
                      type="text"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">SMTP User / Email</label>
                    <input
                      type="text"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">SMTP Password / App Key</label>
                    <input
                      type="password"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. November Product Release"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Exciting updates inside!"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Recipient Email(s) *</label>
                <input
                  type="text"
                  required
                  placeholder="john@example.com, sarah@example.com"
                  value={recipientsInput}
                  onChange={(e) => setRecipientsInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">HTML Email Content</label>
                <textarea
                  rows={6}
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Dispatching...' : 'Dispatch Tracked Email'}
                </button>
              </div>
            </form>
          </div>

          {result && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Dispatch Result
              </div>
              <p className="text-xs text-slate-300">
                {result.data?.smtpConfigured
                  ? 'Emails sent via configured SMTP server with individual stealth tracking pixels!'
                  : 'Tracker created and recipient tokens prepared! (No SMTP entered; tokens are ready for external mailer).'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
