"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/tags", label: "标签页" },
  { href: "/mailbox", label: "信箱页" },
  { href: "/admin", label: "后台" },
];

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/55 bg-white/60 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-xl bg-white/85 px-3 py-2 text-sm font-bold text-[#5d4f72] shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition hover:scale-[1.02]"
        >
          返回上一页
        </button>

        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                  active
                    ? "bg-[#ffd9ea] text-[#8f3b63]"
                    : "bg-white/70 text-[#645774] hover:bg-white/90"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

