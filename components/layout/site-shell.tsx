import type { ReactNode } from "react";
import { TopNav } from "@/components/layout/top-nav";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="breath absolute left-6 top-8 h-20 w-20 rounded-full bg-[#ffd4e5]/70 blur-sm md:h-28 md:w-28" />
        <div className="breath absolute right-10 top-24 h-16 w-16 rounded-full bg-[#cdeefe]/80 blur-sm [animation-delay:1.4s] md:h-24 md:w-24" />
        <div className="breath absolute bottom-10 left-1/3 h-12 w-12 rounded-full bg-[#d6fbe8]/80 blur-sm [animation-delay:2.3s] md:h-20 md:w-20" />
      </div>
      <TopNav />
      <main className="relative mx-auto w-full max-w-6xl px-4 pb-8 pt-4 md:px-8 md:pb-10 md:pt-5">
        {children}
      </main>
    </div>
  );
}
