import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileTabBar } from './MobileTabBar';
import { AuroraBackground } from '../ui/AuroraBackground';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-brand-void">
      <AuroraBackground className="opacity-40" />
      <Sidebar />
      <main className="relative mx-auto max-w-[1600px] px-4 py-8 pb-28 sm:px-6 lg:pb-8 lg:pl-[76px] lg:pr-8 xl:pl-64">
        {children}
      </main>
      <MobileTabBar />
    </div>
  );
}
