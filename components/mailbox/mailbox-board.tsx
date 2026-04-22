"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type MailboxTab = "SUGGESTION" | "WHISPER";

const maxLength = 200;

const tabConfig: Record<
  MailboxTab,
  { label: string; placeholder: string; submitLabel: string; successText: string }
> = {
  SUGGESTION: {
    label: "网站建议",
    placeholder: "想提什么建议都可以告诉我，比如：某个页面可以更方便一点...",
    submitLabel: "提交建议",
    successText: "收到建议啦，我会认真优化网站～",
  },
  WHISPER: {
    label: "悄悄话信箱",
    placeholder: "把你想说的话留在这里，我会安静地读完。",
    submitLabel: "发送悄悄话",
    successText: "悄悄话已送达，谢谢你的信任。",
  },
};

export function MailboxBoard() {
  const [activeTab, setActiveTab] = useState<MailboxTab>("SUGGESTION");
  const [suggestionText, setSuggestionText] = useState("");
  const [whisperText, setWhisperText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  const currentValue = activeTab === "SUGGESTION" ? suggestionText : whisperText;
  const currentLength = useMemo(() => currentValue.length, [currentValue]);
  const currentConfig = tabConfig[activeTab];

  const setCurrentValue = (value: string) => {
    if (activeTab === "SUGGESTION") {
      setSuggestionText(value.slice(0, maxLength));
      return;
    }
    setWhisperText(value.slice(0, maxLength));
  };

  const submitMessage = async () => {
    const content = currentValue.trim();
    if (!content) {
      setErrorText("先写一点内容再提交吧。");
      return;
    }

    setIsSubmitting(true);
    setErrorText("");
    setSuccessText("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          content,
          isAnonymous,
        }),
      });

      if (!response.ok) {
        throw new Error("提交失败");
      }

      if (activeTab === "SUGGESTION") {
        setSuggestionText("");
      } else {
        setWhisperText("");
      }

      setSuccessText(currentConfig.successText);
    } catch {
      setErrorText("提交失败了，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-4xl pt-2 md:pt-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="hero-card rounded-[2rem] bg-[linear-gradient(160deg,rgba(255,249,244,0.9),rgba(255,242,248,0.92),rgba(243,248,255,0.88))] p-6 md:p-8"
      >
        <header>
          <p className="inline-flex rounded-full bg-[#ffe3ef] px-4 py-1 text-xs font-bold tracking-[0.2em] text-[#ff518f]">
            MAIL BOX
          </p>
          <h1 className="mt-4 font-[var(--font-baloo)] text-4xl leading-tight text-[#2b2534] md:text-5xl">
            给我留一句话吧 💌
          </h1>
          <p className="mt-2 text-base text-[#5c526b] md:text-lg">
            建议、夸夸、吐槽、悄悄话，我都会认真看。
          </p>
        </header>

        <div className="mt-6 inline-flex rounded-2xl bg-white/80 p-1">
          {(Object.keys(tabConfig) as MailboxTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setErrorText("");
                setSuccessText("");
              }}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition md:text-base ${
                activeTab === tab ? "bg-[#ffd8ea] text-[#8e3a62]" : "text-[#6f6283] hover:bg-white/85"
              }`}
            >
              {tabConfig[tab].label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-3xl bg-white/78 p-4 md:p-5">
          <textarea
            value={currentValue}
            onChange={(event) => setCurrentValue(event.target.value)}
            placeholder={currentConfig.placeholder}
            className="h-40 w-full resize-none rounded-2xl border border-[#ffd5e6] bg-white/90 px-4 py-3 text-sm leading-7 text-[#433a53] outline-none transition placeholder:text-[#a89eb8] focus:border-[#ff99c1] md:h-44 md:text-base"
          />

          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-[#625675] md:text-base">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(event) => setIsAnonymous(event.target.checked)}
                className="h-4 w-4 rounded border-[#ddb4c9] text-[#ff5d97] focus:ring-[#ffb8d4]"
              />
              匿名留言
            </label>
            <p className="text-sm text-[#867a96]">
              {currentLength}/{maxLength}
            </p>
          </div>

          <motion.button
            type="button"
            disabled={isSubmitting}
            onClick={() => void submitMessage()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="mt-4 rounded-2xl bg-gradient-to-r from-[#ff6f9f] to-[#ff9e82] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(255,111,159,0.3)] disabled:cursor-not-allowed disabled:opacity-70 md:text-base"
          >
            {isSubmitting ? "发送中..." : currentConfig.submitLabel}
          </motion.button>

          <AnimatePresence mode="wait">
            {successText ? (
              <motion.p
                key={successText}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-3 rounded-2xl bg-[#e8fff2] px-4 py-3 text-sm text-[#31734e] md:text-base"
              >
                {successText}
              </motion.p>
            ) : null}
          </AnimatePresence>

          {errorText ? <p className="mt-3 text-sm text-[#c44c7c] md:text-base">{errorText}</p> : null}
        </div>
      </motion.div>
    </section>
  );
}

