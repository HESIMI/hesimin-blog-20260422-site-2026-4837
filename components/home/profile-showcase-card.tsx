"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type ProfileShowcaseCardProps = {
  photoSrc: string;
  photoAlt: string;
};

export function ProfileShowcaseCard({ photoSrc, photoAlt }: ProfileShowcaseCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, x: -24, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="hero-card relative overflow-hidden rounded-[2rem] p-3"
    >
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#ffd8ea]/70 blur-2xl" />
      <div className="absolute -left-10 bottom-8 h-28 w-28 rounded-full bg-[#cff3ff]/70 blur-2xl" />
      <div className="relative h-[22rem] overflow-hidden rounded-[1.5rem] md:h-[31rem]">
        <Image
          src={photoSrc}
          alt={photoAlt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 46vw"
          className="object-cover"
        />
      </div>
    </motion.section>
  );
}

