"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { MeetingSession } from "@/hooks/useMeetingSessions";

interface SessionPanelProps {
  sessions: MeetingSession[];
  currentSessionId: string | null;
  onLoadSession: (session: MeetingSession) => void;
  onDeleteSession: (id: string) => void;
  onNewSession: () => void;
}

export default function SessionPanel({
  sessions,
  currentSessionId,
  onLoadSession,
  onDeleteSession,
  onNewSession,
}: SessionPanelProps) {
  const t = useTranslations("sessions");
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return t("just_now");
    if (diffMin < 60) return t("minutes_ago", { count: diffMin });
    if (diffHour < 24) return t("hours_ago", { count: diffHour });
    if (diffDay < 7) return t("days_ago", { count: diffDay });
    return d.toLocaleDateString();
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatCost = (costSnapshot: Record<string, number>) => {
    const entries = Object.entries(costSnapshot).filter(([, v]) => v > 0);
    if (entries.length === 0) return "—";
    return entries
      .map(([cur, amt]) => {
        try {
          return new Intl.NumberFormat("en", {
            style: "currency",
            currency: cur,
            maximumFractionDigits: 2,
          }).format(amt);
        } catch {
          return `${amt.toFixed(2)} ${cur}`;
        }
      })
      .join(" + ");
  };

  const statusIcon = (status: MeetingSession["status"]) => {
    switch (status) {
      case "running":
        return (
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </span>
        );
      case "paused":
        return (
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </span>
        );
      case "stopped":
        return (
          <span className="flex items-center gap-1 text-gray-500">
            <span className="w-2 h-2 rounded-full bg-gray-500" />
          </span>
        );
    }
  };

  const statusLabel = (status: MeetingSession["status"]) => {
    switch (status) {
      case "running": return t("status_running");
      case "paused": return t("status_paused");
      case "stopped": return t("status_stopped");
    }
  };

  if (sessions.length === 0 && !currentSessionId) return null;

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl text-sm transition-all group"
      >
        <svg className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="text-gray-300">{t("my_sessions")}</span>
        <span className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-xs font-mono">
          {sessions.length}
        </span>
        <svg className={`w-3 h-3 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Sessions dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 sm:left-auto sm:w-[420px] mt-2 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-white">{t("saved_sessions")}</h3>
            <button
              onClick={() => {
                onNewSession();
                setIsOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              {t("new_session")}
            </button>
          </div>

          {/* Sessions list */}
          <div className="max-h-80 overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                {t("no_sessions")}
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {sessions.map((session) => {
                  const isCurrent = session.id === currentSessionId;
                  return (
                    <div
                      key={session.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                        isCurrent
                          ? "bg-emerald-500/5 border-l-2 border-l-emerald-500"
                          : "hover:bg-gray-800/50 border-l-2 border-l-transparent"
                      }`}
                    >
                      {/* Status + Info */}
                      <div className="mt-1">{statusIcon(session.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-white truncate">
                            {session.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-medium">
                              {t("current")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{statusLabel(session.status)}</span>
                          <span className="text-gray-700">•</span>
                          <span className="font-mono">{formatTime(session.elapsedSeconds)}</span>
                          <span className="text-gray-700">•</span>
                          <span>{session.attendees.length} {t("people")}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5 font-mono">
                          {formatCost(session.totalCostSnapshot)}
                        </div>
                        <div className="text-[10px] text-gray-600 mt-0.5">
                          {formatDate(session.updatedAt)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {!isCurrent && (
                          <button
                            onClick={() => {
                              onLoadSession(session);
                              setIsOpen(false);
                            }}
                            className="p-1.5 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title={t("load")}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(t("delete_confirm"))) {
                              onDeleteSession(session.id);
                            }
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title={t("delete")}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
