import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const baseUrl = "https://meetingcost.team";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "policy" });
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${baseUrl}/${loc}/policy`;
  }
  languages["x-default"] = `${baseUrl}/en/policy`;
  return {
    title: `${t("title")} | MeetingCost.team`,
    description: t("usage_desc"),
    alternates: { canonical: `${baseUrl}/${locale}/policy`, languages },
    openGraph: {
      title: `${t("title")} | MeetingCost.team`,
      description: t("usage_desc"),
      url: `${baseUrl}/${locale}/policy`,
      siteName: "MeetingCost.team",
      type: "website",
    },
  };
}

export default async function PolicyPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "policy" });

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
