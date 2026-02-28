"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { Attendee } from "./MeetingCalculator";

interface TickerProps {
  attendees: Attendee[];
  isRunning: boolean;
  hasStarted: boolean;
  onElapsedUpdate?: (seconds: number) => void;
  initialElapsed?: number;
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

export default function Ticker({
  attendees,
  isRunning,
  hasStarted,
  onElapsedUpdate,
  initialElapsed,
}: TickerProps) {
  const t = useTranslations();
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    Math.floor(initialElapsed ?? 0)
  );
  const [personCosts, setPersonCosts] = useState<Record<string, number>>(() => {
    const restored = initialElapsed ?? 0;
    if (restored <= 0) return {};
    const costs: Record<string, number> = {};
    for (const attendee of attendees) {
      const personElapsed = Math.max(0, restored - attendee.joinedAtSeconds);
      costs[attendee.id] = (attendee.hourlyRate / 3600) * personElapsed;
    }
    return costs;
  });
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef(initialElapsed ?? 0);

  const attendeesRef = useRef(attendees);
  const onElapsedUpdateRef = useRef(onElapsedUpdate);

  useEffect(() => {
    attendeesRef.current = attendees;
  }, [attendees]);
  useEffect(() => {
    onElapsedUpdateRef.current = onElapsedUpdate;
  }, [onElapsedUpdate]);

  const formatCurrencyAmount = useCallback(
    (amount: number, curr: string) => {
      const fmt = currencyFormats[curr] || {
        locale: "en-US",
        currency: "USD",
      };
      try {
        return new Intl.NumberFormat(fmt.locale, {
          style: "currency",
          currency: fmt.currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: amount < 1 ? 6 : amount < 100 ? 4 : 2,
        }).format(amount);
      } catch {
        return `${amount.toFixed(2)}`;
      }
    },
    []
  );

  const formatTime = useCallback(
    (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      const parts: string[] = [];
      if (h > 0) parts.push(`${h}${t("ticker.hours")}`);
      if (m > 0 || h > 0) parts.push(`${m}${t("ticker.minutes")}`);
      parts.push(`${s}${t("ticker.seconds")}`);
      return parts.join(" ");
    },
    [t]
  );

  // Group totals by currency (for display)
  const currencyTotals: Record<string, number> = {};
  for (const a of attendees) {
    const cost = personCosts[a.id] || 0;
    currencyTotals[a.currency] = (currencyTotals[a.currency] || 0) + cost;
  }
  const currencyGroups = Object.entries(currencyTotals);

  // Estimated rate per second grouped by currency (always visible)
  const ratePerSecByCurrency: Record<string, number> = {};
  for (const a of attendees) {
    ratePerSecByCurrency[a.currency] =
      (ratePerSecByCurrency[a.currency] || 0) + a.hourlyRate / 3600;
  }
  const rateGroups = Object.entries(ratePerSecByCurrency);

  // Animation loop
  useEffect(() => {
    if (!isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    function tick(timestamp: number) {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const deltaMs = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      const deltaSec = deltaMs / 1000;
      accumulatedTimeRef.current += deltaSec;

      const currentAttendees = attendeesRef.current;
      const costs: Record<string, number> = {};
      for (const attendee of currentAttendees) {
        const personElapsed = Math.max(
          0,
          accumulatedTimeRef.current - attendee.joinedAtSeconds
        );
        costs[attendee.id] = (attendee.hourlyRate / 3600) * personElapsed;
      }

      setPersonCosts(costs);
      setElapsedSeconds(Math.floor(accumulatedTimeRef.current));
      onElapsedUpdateRef.current?.(accumulatedTimeRef.current);
      animationFrameRef.current = requestAnimationFrame(tick);
    }

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  return (
    <div className="relative">
      {/* Glow effect */}
      {isRunning && (
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl animate-pulse" />
      )}

      <div
        className={`relative bg-gray-900 border rounded-2xl p-8 sm:p-12 text-center transition-all ${
          isRunning
            ? "border-emerald-500/50 shadow-lg shadow-emerald-500/10"
            : hasStarted
              ? "border-amber-500/40 shadow-lg shadow-amber-500/10"
              : "border-gray-800"
        }`}
      >
        <p className="text-gray-400 text-sm uppercase tracking-widest mb-2 font-medium">
          {t("ticker.total_cost")}
        </p>

        {/* Main Cost Display - grouped by currency */}
        <div
          className={`font-mono font-bold transition-all ${
            isRunning
              ? "text-emerald-400"
              : hasStarted
                ? "text-amber-400"
                : "text-gray-500"
          }`}
        >
          {currencyGroups.length === 0 ? (
            <span className="text-5xl sm:text-7xl tabular-nums">—</span>
          ) : currencyGroups.length === 1 ? (
            <span className="text-5xl sm:text-7xl lg:text-8xl tabular-nums">
              {formatCurrencyAmount(currencyGroups[0][1], currencyGroups[0][0])}
            </span>
          ) : (
            <div className="space-y-1">
              {currencyGroups.map(([cur, total]) => (
                <div
                  key={cur}
                  className="text-3xl sm:text-5xl tabular-nums"
                >
                  {formatCurrencyAmount(total, cur)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rate per second — always visible as estimate */}
        <div className="flex items-center justify-center gap-3 mt-4 text-sm font-mono text-gray-500 flex-wrap">
          {rateGroups.length > 0 ? (
            <>
              <span>
                {rateGroups.map(([cur, rate], i) => (
                  <span key={cur}>
                    {i > 0 && " + "}
                    {formatCurrencyAmount(rate, cur)}
                  </span>
                ))}
                {" "}
                {t("ticker.per_second")}
              </span>
              <span className="text-gray-700">|</span>
            </>
          ) : null}
          <span>
            {attendees.length} {t("ticker.attendees")}
          </span>
        </div>

        {/* Elapsed Time */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">
            {t("ticker.elapsed")}
          </p>
          <p
            className={`text-2xl font-mono font-semibold tabular-nums ${
              isRunning
                ? "text-cyan-400"
                : hasStarted
                  ? "text-cyan-300"
                  : "text-gray-600"
            }`}
          >
            {formatTime(elapsedSeconds)}
          </p>
        </div>

        {/* Individual Costs */}
        {attendees.length > 0 && hasStarted && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {attendees.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between px-3 py-2 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 bg-emerald-500/30 rounded-full flex items-center justify-center text-xs font-bold text-emerald-300 uppercase shrink-0">
                      {person.name.charAt(0)}
                    </span>
                    <span className="text-gray-300 text-sm truncate">
                      {person.name}
                    </span>
                    {person.joinedAtSeconds > 0 && (
                      <span className="text-[10px] text-gray-600 font-mono whitespace-nowrap">
                        +{formatTime(Math.floor(person.joinedAtSeconds))}
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-mono text-sm tabular-nums shrink-0 ml-3 ${
                      isRunning
                        ? "text-emerald-400"
                        : hasStarted
                          ? "text-amber-300"
                          : "text-gray-500"
                    }`}
                  >
                    {formatCurrencyAmount(
                      personCosts[person.id] || 0,
                      person.currency
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
