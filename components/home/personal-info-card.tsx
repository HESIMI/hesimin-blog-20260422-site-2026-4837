"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type PersonalInfo = {
  id: string;
  mbti: string;
  zodiac: string;
  signature: string;
};

type PersonalInfoCardProps = {
  info: PersonalInfo;
  title: string;
  subtitle: string;
  nextHref: string;
};

export function PersonalInfoCard({ info, title, subtitle, nextHref }: PersonalInfoCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 24, y: 18 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
      className="hero-card flex h-full flex-col justify-between rounded-[2rem] p-6 md:p-8"
    >
      <div className="space-y-5">
        <p className="inline-flex items-center rounded-full bg-[#ffe3ef] px-4 py-1 text-xs font-bold tracking-[0.2em] text-[#ff4c8e]">
          MY ENERGY CARD
        </p>
        <h1 className="font-[var(--font-baloo)] text-4xl leading-tight text-[#2b2534] md:text-5xl">
          {title}
        </h1>
        <p className="max-w-md text-base text-[#584d67] md:text-lg">{subtitle}</p>
      </div>

      <div className="mt-7 space-y-3">
        <InfoRow label="ID" value={info.id} />
        <InfoRow label="MBTI" value={info.mbti} />
        <InfoRow label="星座" value={info.zodiac} />
        <div className="rounded-2xl bg-[#fff3f9] p-4">
          <p className="text-xs font-bold tracking-widest text-[#ff5f9c]">个性签名</p>
          <p className="mt-2 text-sm leading-7 text-[#5a4f68] md:text-base">{info.signature}</p>
        </div>
      </div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-8">
        <Link
          href={nextHref}
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff6d9f] to-[#ff9f7f] px-7 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(255,109,159,0.35)] transition-transform md:text-base"
        >
          进入下一页
        </Link>
      </motion.div>
    </motion.section>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
      <span className="text-xs font-semibold tracking-widest text-[#857595]">{label}</span>
      <span className="text-sm font-bold text-[#2f2839] md:text-base">{value}</span>
    </div>
  );
}

