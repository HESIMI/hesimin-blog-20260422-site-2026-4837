"use client";

import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type TagItem = {
  id: number;
  name: string;
  count: number;
};

type TagsResponse = {
  tags: TagItem[];
};

const stickerColors = [
  "bg-[#ffe5ef] text-[#a7426f] border-[#ffc6de]",
  "bg-[#fff1d9] text-[#99672a] border-[#ffdfad]",
  "bg-[#ddf6ff] text-[#2f6f86] border-[#b5e8ff]",
  "bg-[#e8ffe8] text-[#3b7d57] border-[#c6f2cf]",
  "bg-[#f0e7ff] text-[#694e95] border-[#dccdff]",
];

type TagWallBoardProps = {
  initialTags: TagItem[];
};

export function TagWallBoard({ initialTags }: TagWallBoardProps) {
  const [tags, setTags] = useState<TagItem[]>(initialTags);
  const [customTag, setCustomTag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  const topThreeTags = useMemo(() => {
    return [...tags].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 3);
  }, [tags]);

  const totalVotes = useMemo(() => tags.reduce((sum, tag) => sum + tag.count, 0), [tags]);

  const voteTag = async (tagName: string) => {
    setSubmitting(true);
    setErrorText("");

    try {
      const response = await fetch("/api/tags/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tagName }),
      });

      if (!response.ok) {
        throw new Error("投票失败");
      }

      const data = (await response.json()) as TagsResponse;
      setTags(data.tags);
    } catch {
      setErrorText("投票失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCustomTag = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTag = customTag.trim().slice(0, 12);
    if (!cleanTag) return;

    setSubmitting(true);
    setErrorText("");

    try {
      const response = await fetch("/api/tags/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanTag }),
      });

      if (!response.ok) {
        throw new Error("提交失败");
      }

      const data = (await response.json()) as TagsResponse;
      setTags(data.tags);
      setCustomTag("");
    } catch {
      setErrorText("提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl pt-2 md:pt-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="hero-card rounded-[2rem] p-6 md:p-8"
      >
        <header>
          <p className="inline-flex rounded-full bg-[#ffe3ef] px-4 py-1 text-xs font-bold tracking-[0.2em] text-[#ff518f]">
            TAG GAME
          </p>
          <h1 className="mt-4 font-[var(--font-baloo)] text-4xl leading-tight text-[#2b2534] md:text-5xl">
            你觉得我是一个怎样的人？
          </h1>
          <p className="mt-2 text-base text-[#5c526b] md:text-lg">
            选一个标签，或者留一个你心里的形容词。
          </p>
        </header>

        <div className="mt-6 rounded-3xl bg-white/70 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-[var(--font-baloo)] text-2xl text-[#3a3048]">贴纸标签墙</h2>
            <p className="rounded-full bg-[#ffeef6] px-3 py-1 text-xs font-bold text-[#cc4e83]">
              已贴 {totalVotes} 次
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {tags.map((tag, index) => (
              <motion.button
                key={tag.id}
                type="button"
                whileHover={{ y: -5, rotate: 0, scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => void voteTag(tag.name)}
                disabled={submitting}
                className={`rounded-2xl border px-4 py-2 text-sm font-bold shadow-[0_6px_14px_rgba(0,0,0,0.08)] transition md:text-base ${stickerColors[index % stickerColors.length]} ${submitting ? "cursor-not-allowed opacity-75" : ""}`}
                style={{ rotate: `${(index % 5) - 2}deg` }}
              >
                <span>{tag.name}</span>
                <span className="ml-2 rounded-full bg-white/70 px-2 py-0.5 text-xs">{tag.count}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <form onSubmit={(event) => void handleAddCustomTag(event)} className="mt-6 flex flex-col gap-3 md:flex-row">
          <input
            value={customTag}
            onChange={(event) => setCustomTag(event.target.value)}
            placeholder="输入你的标签（例如：细腻、脑洞大）"
            className="w-full rounded-2xl border border-[#ffd3e5] bg-white/85 px-4 py-3 text-sm text-[#443a53] outline-none transition placeholder:text-[#a097b0] focus:border-[#ff96bf] md:text-base"
          />
          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-2xl bg-gradient-to-r from-[#ff6f9f] to-[#ff9e82] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(255,111,159,0.3)] md:text-base disabled:cursor-not-allowed disabled:opacity-75"
          >
            贴上新标签
          </motion.button>
        </form>

        {errorText ? <p className="mt-3 text-sm text-[#c44c7c]">{errorText}</p> : null}

        <div className="mt-6 rounded-3xl bg-[#fff4fa] p-5">
          <h3 className="font-[var(--font-baloo)] text-2xl text-[#42354f]">热门标签 Top 3</h3>
          <ul className="mt-3 space-y-2">
            {topThreeTags.map((tag, index) => (
              <li
                key={tag.id}
                className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 text-[#554a64]"
              >
                <span className="font-semibold">
                  No.{index + 1} {tag.name}
                </span>
                <span className="text-sm font-bold">{tag.count} 票</span>
              </li>
            ))}
          </ul>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-6">
          <Link
            href="/mailbox"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#73c9ff] to-[#92e5ca] px-6 py-3 text-sm font-bold text-[#1f3b4f] shadow-[0_10px_22px_rgba(115,201,255,0.35)] md:text-base"
          >
            去悄悄话信箱
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
