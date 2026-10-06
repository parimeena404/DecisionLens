'use client';

import React, { useState } from 'react';
import { ThemeProvider } from '@/lib/theme';
import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/Navbar';
import StatusStrip from '@/components/StatusStrip';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/CommandPalette';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [cmdKOpen, setCmdKOpen] = useState(false);

  return (
    <ThemeProvider>
      <SmoothScroll>
        <div className="min-h-screen flex flex-col transition-colors duration-300">
          <Navbar onCmdK={() => setCmdKOpen(true)} />
          <StatusStrip />
          <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
          <CommandPalette open={cmdKOpen} onOpenChange={setCmdKOpen} />
        </div>
      </SmoothScroll>
    </ThemeProvider>
  );
}
