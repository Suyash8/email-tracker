'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import {
  ShieldCheck,
  Database,
  Globe,
  ExternalLink,
  Zap,
  Layers
} from 'lucide-react';

export default function SetupPage() {
  return (
    <div className="flex h-screen bg-[#090d16] text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Vercel & Free Database Setup Guide" />

        <main className="p-6 max-w-5xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">100% Free Stack & Vercel Deployment Blueprint</h1>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              This application is engineered specifically for Vercel deployment with free serverless database backends. Follow these steps to put your tracking engine online in less than 3 minutes without paying a single dollar.
            </p>
          </div>

          {/* Recommended Free Services Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">1. Vercel Hosting</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Free Next.js frontend + serverless backend hosting, custom domains, and automatic SSL.
              </p>
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-medium pt-1"
              >
                Go to Vercel <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">2. Neon Database</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Free Serverless PostgreSQL database (0.5GB free forever). Instant connection string for Prisma.
              </p>
              <a
                href="https://neon.tech"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-medium pt-1"
              >
                Create Free DB on Neon <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">3. Resend / Gmail</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Free SMTP / Resend API (3,000 emails/month free) for optional direct in-app mail dispatching.
              </p>
              <a
                href="https://resend.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:underline font-medium pt-1"
              >
                Get Resend Free Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Deployment Step-by-Step Instructions */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Step-by-Step Deployment Instructions
            </h2>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white text-sm">Create Free PostgreSQL Database</h4>
                  <p className="text-xs text-slate-300">
                    Sign up at <a href="https://neon.tech" target="_blank" className="text-indigo-400 underline">Neon.tech</a> or <a href="https://supabase.com" target="_blank" className="text-indigo-400 underline">Supabase.com</a>. Create a new project and copy your pooled connection string (starts with <code>postgresql://...</code>).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white text-sm">Switch Prisma Datasource to PostgreSQL</h4>
                  <p className="text-xs text-slate-300">
                    In <code>prisma/schema.prisma</code>, change provider from <code>&quot;sqlite&quot;</code> to <code>&quot;postgresql&quot;</code>:
                  </p>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
{`datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`}
                  </pre>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white text-sm">Deploy to Vercel & Configure Environment Variables</h4>
                  <p className="text-xs text-slate-300">
                    Push your code to GitHub and import the repository into Vercel. In Vercel Project Settings &gt; Environment Variables, add:
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5 font-mono">
                    <li><strong className="text-indigo-400">DATABASE_URL</strong>: your PostgreSQL connection string</li>
                    <li><strong className="text-indigo-400">NEXT_PUBLIC_APP_URL</strong>: https://your-app-name.vercel.app</li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  4
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white text-sm">Push Database Tables & Enjoy</h4>
                  <p className="text-xs text-slate-300">
                    Run <code>npx prisma db push</code> in your local terminal or configure Vercel build command to <code>npx prisma db push &amp;&amp; next build</code>. Your stealth email tracking suite is live!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
