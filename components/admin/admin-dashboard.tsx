"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

type TagItem = {
  id: number;
  name: string;
  count: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

type MessageItem = {
  id: number;
  type: "SUGGESTION" | "WHISPER";
  content: string;
  isAnonymous: boolean;
  isRead: boolean;
  createdAt: string;
};

type AdminDashboardProps = {
  initialTags: TagItem[];
  initialMessages: MessageItem[];
};

export function AdminDashboard({ initialTags, initialMessages }: AdminDashboardProps) {
  const [tags, setTags] = useState<TagItem[]>(initialTags);
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [workingIds, setWorkingIds] = useState<Set<string>>(new Set());
  const [errorText, setErrorText] = useState("");

  const unreadCount = useMemo(() => messages.filter((message) => !message.isRead).length, [messages]);

  const withWorking = async (key: string, task: () => Promise<void>) => {
    setWorkingIds((prev) => new Set(prev).add(key));
    setErrorText("");
    try {
      await task();
    } catch {
      setErrorText("操作失败，请稍后重试");
    } finally {
      setWorkingIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const deleteTag = async (id: number) => {
    await withWorking(`tag-${id}`, async () => {
      const response = await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("delete tag failed");
      setTags((prev) => prev.filter((tag) => tag.id !== id));
    });
  };

  const deleteMessage = async (id: number) => {
    await withWorking(`message-del-${id}`, async () => {
      const response = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("delete message failed");
      setMessages((prev) => prev.filter((message) => message.id !== id));
    });
  };

  const markRead = async (id: number) => {
    await withWorking(`message-read-${id}`, async () => {
      const response = await fetch(`/api/admin/messages/${id}/read`, { method: "PATCH" });
      if (!response.ok) throw new Error("read message failed");
      setMessages((prev) =>
        prev.map((message) => (message.id === id ? { ...message, isRead: true } : message)),
      );
    });
  };

  const logout = async () => {
    await withWorking("logout", async () => {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("logout failed");
      window.location.reload();
    });
  };

  const formatType = (type: MessageItem["type"]) => (type === "SUGGESTION" ? "网站建议" : "悄悄话");

  return (
    <section className="mx-auto w-full max-w-6xl pt-2 md:pt-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="hero-card rounded-[2rem] p-6 md:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex rounded-full bg-[#ffe3ef] px-4 py-1 text-xs font-bold tracking-[0.2em] text-[#ff518f]">
              ADMIN PANEL
            </p>
            <h1 className="mt-3 font-[var(--font-baloo)] text-4xl text-[#2b2534] md:text-5xl">后台管理</h1>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => void logout()}
            disabled={workingIds.has("logout")}
            className="rounded-2xl bg-white/85 px-4 py-2 text-sm font-bold text-[#805b72] shadow-[0_8px_18px_rgba(0,0,0,0.08)] disabled:cursor-not-allowed disabled:opacity-70 md:text-base"
          >
            退出登录
          </motion.button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <StatCard label="标签总数" value={String(tags.length)} />
          <StatCard label="留言总数" value={String(messages.length)} />
          <StatCard label="未读留言" value={String(unreadCount)} />
        </div>

        {errorText ? <p className="mt-3 text-sm text-[#c44c7c]">{errorText}</p> : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white/78 p-4 md:p-5">
            <h2 className="font-[var(--font-baloo)] text-3xl text-[#3a3048]">标签数据</h2>
            <div className="mt-3 space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between rounded-2xl border border-[#ffe2ee] bg-white/85 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-[#433a53]">{tag.name}</p>
                    <p className="text-xs text-[#8b7f9c]">票数：{tag.count}</p>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => void deleteTag(tag.id)}
                    disabled={workingIds.has(`tag-${tag.id}`)}
                    className="rounded-xl bg-[#ffe8f2] px-3 py-2 text-xs font-bold text-[#a34f74] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    删除
                  </motion.button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white/78 p-4 md:p-5">
            <h2 className="font-[var(--font-baloo)] text-3xl text-[#3a3048]">留言管理</h2>
            <div className="mt-3 space-y-2">
              {messages.map((message) => (
                <div key={message.id} className="rounded-2xl border border-[#ffe2ee] bg-white/85 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f4ebff] px-3 py-1 text-xs font-semibold text-[#6e4f9c]">
                      {formatType(message.type)}
                    </span>
                    <span className="rounded-full bg-[#eef8ff] px-3 py-1 text-xs font-semibold text-[#427296]">
                      {message.isAnonymous ? "匿名" : "署名"}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        message.isRead
                          ? "bg-[#e6fff0] text-[#3f7d5a]"
                          : "bg-[#fff2d9] text-[#9b6b24]"
                      }`}
                    >
                      {message.isRead ? "已读" : "未读"}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#433a53]">{message.content}</p>
                  <p className="mt-2 text-xs text-[#8b7f9c]">{message.createdAt}</p>
                  <div className="mt-3 flex items-center gap-2">
                    {!message.isRead ? (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => void markRead(message.id)}
                        disabled={workingIds.has(`message-read-${message.id}`)}
                        className="rounded-xl bg-[#eaf8ff] px-3 py-2 text-xs font-bold text-[#3d6e8e] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        标记已读
                      </motion.button>
                    ) : null}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => void deleteMessage(message.id)}
                      disabled={workingIds.has(`message-del-${message.id}`)}
                      className="rounded-xl bg-[#ffe8f2] px-3 py-2 text-xs font-bold text-[#a34f74] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      删除留言
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-4 shadow-[0_10px_20px_rgba(0,0,0,0.06)]">
      <p className="text-sm text-[#7a6e8a]">{label}</p>
      <p className="mt-1 font-[var(--font-baloo)] text-3xl text-[#382f46]">{value}</p>
    </div>
  );
}

