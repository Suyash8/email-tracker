'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, LayoutDashboard, PlusCircle, List, ShieldCheck, Zap } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'New Tracker Generator', href: '/generator', icon: PlusCircle },
    { name: 'Campaigns & Trackers', href: '/trackers', icon: List },
    { name: 'In-App Mailer', href: '/send', icon: Mail },
    { name: 'Vercel & Free Setup', href: '/setup', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-[#0f172a]/90 backdrop-blur-md border-r border-slate-800 p-5 flex flex-col justify-between hidden md:flex shrink-0">
      <div>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight">PixelTrack AI</h1>
            <p className="text-xs text-slate-400 font-medium">Stealth Multi-Email Tracker</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2 mb-1 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          100% Free & Vercel Ready
        </div>
        <p className="text-[11px] text-slate-500">
          Invisible recipient pixel tracking engine active.
        </p>
      </div>
    </aside>
  );
}
