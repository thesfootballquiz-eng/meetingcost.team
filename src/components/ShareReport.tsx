"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { Attendee } from "./MeetingCalculator";

interface ShareReportProps {
  attendees: Attendee[];
  elapsedSeconds: number;
  isVisible: boolean;
}

const currencyFormats: Record<string, { locale: string; currency: string }> = {
  USD: { locale: "en-US", currency: "USD" },
  EUR: { locale: "de-DE", currency: "EUR" },
  GBP: { locale: "en-GB", currency: "GBP" },
  VND: { locale: "vi-VN", currency: "VND" },
  CNY: { locale: "zh-CN", currency: "CNY" },
  JPY: { locale: "ja-JP", currency: "JPY" },
  KRW: { locale: "ko-KR", currency: "KRW" },
  RUB: { locale: "ru-RU", currency: "RUB" },
  INR: { locale: "hi-IN", currency: "INR" },
  BRL: { locale: "pt-BR", currency: "BRL" },
  CAD: { locale: "en-CA", currency: "CAD" },
  AUD: { locale: "en-AU", currency: "AUD" },
};

export default function ShareReport({
  attendees,
  elapsedSeconds,
  isVisible,
}: ShareReportProps) {
  const t = useTranslations("share");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDuration = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    if (m > 0) return `${m}m`;
    return `${seconds}s`;
  }, []);

  const getCostString = useCallback(() => {
    const totals: Record<string, number> = {};
    for (const a of attendees) {
      const personElapsed = Math.max(0, elapsedSeconds - a.joinedAtSeconds);
      const cost = (a.hourlyRate / 3600) * personElapsed;
      totals[a.currency] = (totals[a.currency] || 0) + cost;
    }

    return Object.entries(totals)
      .filter(([, v]) => v > 0)
      .map(([cur, amt]) => {
        const fmt = currencyFormats[cur] || { locale: "en-US", currency: "USD" };
        try {
          return new Intl.NumberFormat(fmt.locale, {
            style: "currency",
            currency: fmt.currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(amt);
        } catch {
          return `${amt.toFixed(2)} ${cur}`;
        }
      })
      .join(" + ");
  }, [attendees, elapsedSeconds]);

  const getImageUrl = useCallback(() => {
    const params = new URLSearchParams({
      duration: formatDuration(elapsedSeconds),
      participants: String(attendees.length),
      cost: getCostString(),
    });
    return `/api/share-image?${params.toString()}`;
  }, [attendees.length, elapsedSeconds, formatDuration, getCostString]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const url = getImageUrl();
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `meeting-cost-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Download failed:", e);
    }
    setDownloading(false);
  }, [getImageUrl]);

  const handleCopyLink = useCallback(async () => {
    const url = `${window.location.origin}${getImageUrl()}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [getImageUrl]);

  const handleShareNative = useCallback(async () => {
    const costStr = getCostString();
    const duration = formatDuration(elapsedSeconds);
    const text = `Meeting Cost Report: ${costStr} | Duration: ${duration} | ${attendees.length} participants\n\nCheck your meeting cost at meetingcost.team`;

    if (navigator.share) {
      try {
        // Try sharing with image
        const res = await fetch(getImageUrl());
        const blob = await res.blob();
        const file = new File([blob], "meeting-cost.png", { type: "image/png" });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: "Meeting Cost Report",
            text,
            files: [file],
          });
        } else {
          await navigator.share({
            title: "Meeting Cost Report",
            text,
            url: "https://meetingcost.team",
          });
        }
      } catch {
        // User cancelled or unsupported
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  }, [attendees.length, elapsedSeconds, formatDuration, getCostString, getImageUrl, handleCopyLink]);

  if (!isVisible || attendees.length === 0 || elapsedSeconds < 1) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mt-6">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {t("title")}
      </h3>

      {/* Preview card */}
      <div className="mb-4 rounded-xl overflow-hidden border border-gray-700">
        {/* Mini preview - matching the image card style */}
        <div className="bg-gradient-to-br from-gray-950 via-emerald-950/30 to-gray-950 p-6">
          <div className="text-center">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">{t("total_cost")}</p>
            <p className="text-emerald-400 text-3xl font-bold font-mono mb-3">{getCostString() || "—"}</p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-gray-500 text-xs uppercase">{t("duration_label")}</p>
                <p className="text-gray-200 font-bold">{formatDuration(elapsedSeconds)}</p>
              </div>
              <div className="w-px bg-gray-700" />
              <div className="text-center">
                <p className="text-gray-500 text-xs uppercase">{t("participants_label")}</p>
                <p className="text-gray-200 font-bold">{attendees.length}</p>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-600 mt-3">
            meetingcost.team
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Download image */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {downloading ? t("downloading") : t("download_image")}
        </button>

        {/* Copy link */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {copied ? t("copied") : t("copy_link")}
        </button>

        {/* Share (mobile native) */}
        <button
          onClick={handleShareNative}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {t("share_button")}
        </button>
      </div>
    </div>
  );
}
