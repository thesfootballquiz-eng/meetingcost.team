"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function ContactPage() {
  const t = useTranslations("contact");
  const contactEmail = "meetingcost.team@gmail.com";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">{t("title")}</h1>

      <div className="space-y-6 text-gray-300 leading-relaxed">
        <p>{t("intro")}</p>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📧</span>
            <div>
              <p className="text-gray-400 text-sm">{t("email_label")}</p>
              <a
                href={`mailto:${contactEmail}`}
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {contactEmail}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">🌐</span>
            <div>
              <p className="text-gray-400 text-sm">{t("website_label")}</p>
              <a
                href="https://meetingcost.team"
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                meetingcost.team
              </a>
            </div>
          </div>
        </div>

        <p className="text-gray-400 text-sm">{t("response_time")}</p>
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
