import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import AdDisplay from "@/components/ads/AdDisplay";

const baseUrl = "https://meetingcost.team";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${baseUrl}/${loc}/contact`;
  }
  languages["x-default"] = `${baseUrl}/en/contact`;
  return {
    title: `${t("title")} | MeetingCost.team`,
    description: t("intro"),
    alternates: { canonical: `${baseUrl}/${locale}/contact`, languages },
    openGraph: {
      title: `${t("title")} | MeetingCost.team`,
      description: t("intro"),
      url: `${baseUrl}/${locale}/contact`,
      siteName: "MeetingCost.team",
      type: "website",
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
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

      {/* Ad: Display */}
      <AdDisplay />

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
