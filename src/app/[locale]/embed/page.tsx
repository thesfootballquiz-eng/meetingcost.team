import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const baseUrl = "https://meetingcost.team";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "embed" });

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${baseUrl}/${loc}/embed`;
  }
  languages["x-default"] = `${baseUrl}/en/embed`;

  return {
    title: `${t("page_title")} | MeetingCost.team`,
    description: t("page_description"),
    alternates: {
      canonical: `${baseUrl}/${locale}/embed`,
      languages,
    },
    openGraph: {
      title: `${t("page_title")} | MeetingCost.team`,
      description: t("page_description"),
      url: `${baseUrl}/${locale}/embed`,
      siteName: "MeetingCost.team",
      type: "website",
    },
  };
}

export default async function EmbedPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "embed" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  const embedCode = `<div id="meetingcost-widget"></div>
<script src="https://meetingcost.team/embed.js" data-lang="${locale}"></script>`;

  const iframeCode = `<iframe
  src="https://meetingcost.team/${locale}/embed/widget"
  width="400"
  height="320"
  frameborder="0"
  style="border-radius: 16px; border: 1px solid #1f2937;"
></iframe>`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-emerald-400 transition-colors">{nav("home")}</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-400">{t("page_title")}</span>
      </nav>

      {/* Hero */}
      <header className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          {t("page_title")}
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          {t("page_description")}
        </p>
      </header>

      {/* Benefits */}
      <section className="mb-12 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-lg font-bold mb-3">
              {i === 1 ? "🔗" : i === 2 ? "📊" : "🚀"}
            </div>
            <h3 className="text-white font-bold mb-1">{t(`benefit${i}_title`)}</h3>
            <p className="text-gray-400 text-sm">{t(`benefit${i}_desc`)}</p>
          </div>
        ))}
      </section>

      {/* Method 1: Script embed */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
          <span className="w-7 h-7 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
          {t("method1_title")}
        </h2>
        <p className="text-gray-400 text-sm mb-4">{t("method1_desc")}</p>
        <div className="relative">
          <pre className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-sm text-emerald-400 overflow-x-auto font-mono">
            <code>{embedCode}</code>
          </pre>
        </div>
      </section>

      {/* Method 2: iFrame */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
          <span className="w-7 h-7 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
          {t("method2_title")}
        </h2>
        <p className="text-gray-400 text-sm mb-4">{t("method2_desc")}</p>
        <div className="relative">
          <pre className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-sm text-cyan-400 overflow-x-auto font-mono">
            <code>{iframeCode}</code>
          </pre>
        </div>
      </section>

      {/* Live Preview */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">{t("preview_title")}</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex justify-center">
          <iframe
            src={`/${locale}/embed/widget`}
            width="400"
            height="320"
            className="rounded-2xl border border-gray-700"
            title="MeetingCost Widget Preview"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">{t("faq_title")}</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-medium mb-2">{t(`faq${i}_q`)}</h3>
              <p className="text-gray-400 text-sm">{t(`faq${i}_a`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Back */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          {nav("home")}
        </Link>
      </div>
    </div>
  );
}
