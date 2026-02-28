"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LangSwitcher from "./LangSwitcher";

export default function Header() {
  const t = useTranslations();

  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">$</span>
            </div>
            <span className="text-xl font-bold text-white">
              {t("header.title")}
              <span className="text-emerald-400">.team</span>
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link
              href="/blog"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {t("nav.blog")}
            </Link>
            <Link
              href="/contact"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {t("nav.contact")}
            </Link>
          </nav>
        </div>
        <LangSwitcher />
      </div>
    </header>
  );
}
