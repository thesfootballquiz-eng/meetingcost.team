"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

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
};

export default function WidgetTicker() {
  const t = useTranslations("widget");
  const [participants, setParticipants] = useState(5);
  const [rate, setRate] = useState(50);
  const [currency, setCurrency] = useState("USD");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cost, setCost] = useState(0);
  const animRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const accRef = useRef(0);

  const formatCurrency = useCallback((amount: number, cur: string) => {
    const fmt = currencyFormats[cur] || { locale: "en-US", currency: "USD" };
    try {
      return new Intl.NumberFormat(fmt.locale, {
        style: "currency",
        currency: fmt.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: amount < 100 ? 4 : 2,
      }).format(amount);
    } catch {
      return `${amount.toFixed(2)}`;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      lastRef.current = null;
      return;
    }
    function tick(ts: number) {
      if (lastRef.current === null) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      accRef.current += dt;
      const totalRate = participants * rate;
      setCost((totalRate / 3600) * accRef.current);
      setElapsed(Math.floor(accRef.current));
      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isRunning, participants, rate]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleToggle = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      accRef.current = 0;
      setCost(0);
      setElapsed(0);
      setIsRunning(true);
    }
  };

  return (
    <div style={{ background: "#111827", borderRadius: "16px", padding: "20px", maxWidth: "380px", margin: "0 auto", fontFamily: "system-ui, sans-serif", color: "#e5e7eb" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #34d399, #06b6d4)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "14px" }}>$</div>
        <span style={{ fontWeight: "bold", fontSize: "14px" }}>
          MeetingCost<span style={{ color: "#34d399" }}>.team</span>
        </span>
      </div>

      {/* Mini Form */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "11px", color: "#9ca3af", display: "block", marginBottom: "2px" }}>{t("people")}</label>
          <input
            type="number"
            value={participants}
            onChange={(e) => setParticipants(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            disabled={isRunning}
            style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "6px 8px", color: "#e5e7eb", fontSize: "14px", outline: "none" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "11px", color: "#9ca3af", display: "block", marginBottom: "2px" }}>{t("rate")}</label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            disabled={isRunning}
            style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "6px 8px", color: "#e5e7eb", fontSize: "14px", outline: "none" }}
          />
        </div>
        <div style={{ width: "80px" }}>
          <label style={{ fontSize: "11px", color: "#9ca3af", display: "block", marginBottom: "2px" }}>{t("currency")}</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            disabled={isRunning}
            style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "6px 4px", color: "#e5e7eb", fontSize: "13px", outline: "none" }}
          >
            {Object.keys(currencyFormats).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Cost Display */}
      <div style={{ background: "#0a0a0a", borderRadius: "12px", padding: "16px", textAlign: "center", marginBottom: "12px", border: isRunning ? "1px solid rgba(16,185,129,0.3)" : "1px solid #1f2937" }}>
        <p style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 4px" }}>{t("meeting_cost")}</p>
        <p style={{ fontSize: "32px", fontWeight: "bold", color: isRunning ? "#34d399" : "#6b7280", margin: "0", fontFamily: "monospace", fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(cost, currency)}
        </p>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "8px 0 0" }}>
          {formatTime(elapsed)} • {participants} {t("attendees")}
        </p>
      </div>

      {/* Button */}
      <button
        onClick={handleToggle}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "10px",
          border: "none",
          fontWeight: "bold",
          fontSize: "14px",
          cursor: "pointer",
          color: "#fff",
          background: isRunning ? "linear-gradient(90deg, #ef4444, #f97316)" : "linear-gradient(90deg, #10b981, #06b6d4)",
        }}
      >
        {isRunning ? t("stop") : t("start")}
      </button>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <a href="https://meetingcost.team" target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "#6b7280", textDecoration: "none" }}>
          ⚡ meetingcost.team
        </a>
      </div>
    </div>
  );
}
