"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LocaleNotFound() {
  const t = useTranslations("blog");

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl font-bold text-emerald-400 mb-4">404</div>
      <h1 className="text-2xl font-bold text-white mb-3">{t("page_not_found")}</h1>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        {t("back_home")}
      </Link>
    </div>
  );
}
