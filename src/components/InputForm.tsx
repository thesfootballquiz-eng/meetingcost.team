"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Attendee } from "./MeetingCalculator";

const localeMap: Record<string, string> = {
  en: "en-US",
  vi: "vi-VN",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
  ru: "ru-RU",
  hi: "hi-IN",
};

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

function formatNumber(value: number, locale: string): string {
  if (!value) return "";
  return new Intl.NumberFormat(localeMap[locale] || "en-US").format(value);
}

function parseFormattedNumber(value: string): number {
  const cleaned = value.replace(/[^\d]/g, "");
  return parseInt(cleaned) || 0;
}

function formatRate(amount: number, currency: string): string {
  const fmt = currencyFormats[currency] || {
    locale: "en-US",
    currency: "USD",
  };
  try {
    return new Intl.NumberFormat(fmt.locale, {
      style: "currency",
      currency: fmt.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount}`;
  }
}

interface InputFormProps {
  attendees: Attendee[];
  setAttendees: React.Dispatch<React.SetStateAction<Attendee[]>>;
  hasStarted: boolean;
  getCurrentElapsed: () => number;
  onDraftChange: (draft: Attendee | null) => void;
}

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "KRW", symbol: "₩", name: "Korean Won" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

export default function InputForm({
  attendees,
  setAttendees,
  hasStarted,
  getCurrentElapsed,
  onDraftChange,
}: InputFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState(0);
  const [newRateInput, setNewRateInput] = useState("");
  const [isRateFocused, setIsRateFocused] = useState(false);
  const [newCurrency, setNewCurrency] = useState("VND");

  // Stable ID for the draft person (refreshed after committing)
  const draftIdRef = useRef(crypto.randomUUID());
  // Track when the form first becomes complete (for joinedAtSeconds during a running meeting)
  const firstCompleteAtRef = useRef<number | null>(null);

  const isComplete = newName.trim().length > 0 && newRate > 0;

  // Report draft changes to parent
  useEffect(() => {
    if (isComplete) {
      // Capture joinedAtSeconds only once when first complete
      if (firstCompleteAtRef.current === null) {
        firstCompleteAtRef.current = hasStarted ? getCurrentElapsed() : 0;
      }
      onDraftChange({
        id: draftIdRef.current,
        name: newName.trim(),
        hourlyRate: newRate,
        currency: newCurrency,
        joinedAtSeconds: firstCompleteAtRef.current,
      });
    } else {
      firstCompleteAtRef.current = null;
      onDraftChange(null);
    }
  }, [newName, newRate, newCurrency, isComplete, hasStarted, getCurrentElapsed, onDraftChange]);

  // "+" button = save current person, clear form for next
  const commitAndClear = () => {
    if (!isComplete) return;
    const attendee: Attendee = {
      id: draftIdRef.current,
      name: newName.trim(),
      hourlyRate: newRate,
      currency: newCurrency,
      joinedAtSeconds: firstCompleteAtRef.current ?? (hasStarted ? getCurrentElapsed() : 0),
    };
    setAttendees((prev) => [...prev, attendee]);
    // Clear form for next person
    setNewName("");
    setNewRate(0);
    setNewRateInput("");
    draftIdRef.current = crypto.randomUUID();
    firstCompleteAtRef.current = null;
    onDraftChange(null);
  };

  const removeAttendee = (id: string) => {
    setAttendees((prev) => prev.filter((a) => a.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitAndClear();
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Saved attendees list */}
      {attendees.length > 0 && (
        <div>
          <label className="block text-sm text-gray-400 mb-3 font-medium">
            {t("form.attendees_label")} ({attendees.length})
          </label>
          <div className="space-y-2">
            {attendees.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between px-3 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-xl"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 bg-emerald-500/30 rounded-full flex items-center justify-center text-xs font-bold text-emerald-300 uppercase shrink-0">
                    {person.name.charAt(0)}
                  </span>
                  <span className="text-white text-sm font-medium truncate">
                    {person.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-gray-400 text-xs font-mono">
                    {formatRate(person.hourlyRate, person.currency)}/h
                  </span>
                  {!hasStarted && (
                    <button
                      onClick={() => removeAttendee(person.id)}
                      className="w-5 h-5 rounded-full hover:bg-red-500/30 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors text-sm"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current person form */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-400 mb-2 font-medium">
            {t("form.name_label")}
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("form.name_placeholder")}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">
              {t("form.hourly_rate_label")}
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={isRateFocused ? newRateInput : formatNumber(newRate, locale)}
              onChange={(e) => {
                const raw = e.target.value;
                setNewRateInput(raw);
                setNewRate(parseFormattedNumber(raw));
              }}
              onFocus={() => {
                setIsRateFocused(true);
                setNewRateInput(newRate ? String(newRate) : "");
              }}
              onBlur={() => {
                setIsRateFocused(false);
                setNewRateInput(formatNumber(newRate, locale));
              }}
              onKeyDown={handleKeyDown}
              placeholder={t("form.hourly_rate_placeholder")}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">
              {t("form.currency_label")}
            </label>
            <select
              value={newCurrency}
              onChange={(e) => setNewCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              {currencies.map((cur) => (
                <option key={cur.code} value={cur.code}>
                  {cur.symbol} {cur.code} - {cur.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* "+" button = save current person & add next */}
        <button
          onClick={commitAndClear}
          disabled={!isComplete}
          className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <span className="text-xl leading-none">+</span>{" "}
          {t("form.add_person")}
        </button>
      </div>
    </div>
  );
}
