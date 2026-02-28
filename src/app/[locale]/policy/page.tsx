"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function PolicyPage() {
  const t = useTranslations("policy");

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">{t("title")}</h1>

      <div className="space-y-6 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">
            {t("usage_title")}
          </h2>
          <p>{t("usage_desc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">
            {t("disclaimer_title")}
          </h2>
          <p>{t("disclaimer_desc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">
            {t("changes_title")}
          </h2>
          <p>{t("changes_desc")}</p>
        </section>
      </div>

      <div className="mt-10">
        <Link
          href="/"
          className="text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          ← {t("back_home")}
        </Link>
      </div>
    </div>
  );
}
