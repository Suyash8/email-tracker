'use client';

import React from 'react';
import { Eye, Shield } from 'lucide-react';

export function Header({ title }: { title: string }) {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0b0f19]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Stealth Protocol Active</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300 font-medium">
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span>1x1 Invisible Pixel</span>
        </div>
      </div>
    </header>
  );
}
