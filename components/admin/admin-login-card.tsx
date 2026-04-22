"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";

export function AdminLoginCard() {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.trim()) {
      setErrorText("请输入管理员密码");
      return;
    }

    setSubmitting(true);
    setErrorText("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error("登录失败");
      }

      window.location.reload();
    } catch {
      setErrorText("密码不正确，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md pt-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="hero-card rounded-[2rem] p-6 md:p-8"
      >
        <p className="inline-flex rounded-full bg-[#ffe3ef] px-4 py-1 text-xs font-bold tracking-[0.2em] text-[#ff518f]">
          ADMIN
        </p>
        <h1 className="mt-4 font-[var(--font-baloo)] text-4xl text-[#2b2534]">后台登录</h1>
        <p className="mt-2 text-sm text-[#66597a] md:text-base">输入密码后可管理标签和留言内容。</p>

        <form onSubmit={(event) => void onSubmit(event)} className="mt-6 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="管理员密码"
            className="w-full rounded-2xl border border-[#ffd3e5] bg-white/90 px-4 py-3 text-sm text-[#443a53] outline-none transition placeholder:text-[#a097b0] focus:border-[#ff96bf] md:text-base"
          />
          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-2xl bg-gradient-to-r from-[#ff6f9f] to-[#ff9e82] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(255,111,159,0.3)] disabled:cursor-not-allowed disabled:opacity-70 md:text-base"
          >
            {submitting ? "登录中..." : "进入管理后台"}
          </motion.button>
        </form>

        {errorText ? <p className="mt-3 text-sm text-[#c44c7c]">{errorText}</p> : null}
      </motion.div>
    </section>
  );
}

