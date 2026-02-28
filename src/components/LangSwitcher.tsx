"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import { useState, useRef, useEffect } from "react";

const languageNames: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  ru: "Русский",
  hi: "हिन्दी",
};

const languageFlags: Record<Locale, string> = {
  en: "🇺🇸",
  vi: "🇻🇳",
  zh: "🇨🇳",
  ja: "🇯🇵",
  ko: "🇰🇷",
  ru: "🇷🇺",
  hi: "🇮🇳",
};

export default function LangSwitcher() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm text-gray-200 border border-gray-700"
        aria-label={t("lang_switcher.label")}
      >
        <span className="text-lg">{languageFlags[locale]}</span>
        <span className="hidden sm:inline">{languageNames[locale]}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-700 transition-colors ${
                loc === locale
                  ? "bg-gray-700 text-emerald-400"
                  : "text-gray-200"
              }`}
            >
              <span className="text-lg">{languageFlags[loc]}</span>
              <span>{languageNames[loc]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
