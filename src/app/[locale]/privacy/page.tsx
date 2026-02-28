"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">{t("title")}</h1>

      <div className="space-y-6 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">
            {t("data_title")}
          </h2>
          <p>{t("data_desc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">
            {t("cookies_title")}
          </h2>
          <p>{t("cookies_desc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">
            {t("third_party_title")}
          </h2>
          <p>{t("third_party_desc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">
            {t("contact_title")}
          </h2>
          <p>{t("contact_desc")}</p>
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
