"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-gray-800 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/blog"
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              {t("nav.blog")}
            </Link>
            <Link
              href="/contact"
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              {t("nav.contact")}
            </Link>
            <Link
              href="/policy"
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              {t("nav.policy")}
            </Link>
            <Link
              href="/privacy"
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              {t("nav.privacy")}
            </Link>
          </nav>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-1">{t("footer.made_with")}</p>
          <p className="text-gray-600 text-xs">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
