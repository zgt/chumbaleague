"use client";

import { Nav } from "./nav";
import { Breadcrumbs } from "./breadcrumbs";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Nav />

      <main className="flex-1 px-4 pb-6 sm:px-6">
        <div className="glass-panel relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl p-6 sm:p-8">
          {/* Subtle emerald glow */}
          <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden rounded-3xl">
            <div className="absolute top-[-50%] left-[-20%] h-[80%] w-[80%] rounded-full bg-emerald-500/[0.04] mix-blend-screen blur-[100px]" />
            <div className="absolute right-[-10%] bottom-[-20%] h-[60%] w-[60%] rounded-full bg-emerald-600/[0.03] mix-blend-screen blur-[80px]" />
          </div>

          <div className="relative z-10 flex h-full flex-col">
            <Breadcrumbs />
            <div className="custom-scrollbar flex-1 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
