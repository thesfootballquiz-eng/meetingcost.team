import { getTranslations } from "next-intl/server";
import MeetingCalculator from "@/components/MeetingCalculator";
import AdDisplay from "@/components/ads/AdDisplay";
import AdMultiplex from "@/components/ads/AdMultiplex";

const baseUrl = "https://meetingcost.team";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MeetingCost.team",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    description: t("metadata.description"),
    url: `${baseUrl}/${locale}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList:
      "Real-time meeting cost tracking, Multi-currency support, Per-person cost breakdown",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
          {t("header.tagline")}
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          {t("metadata.description")}
        </p>
      </section>

      {/* Calculator */}
      <MeetingCalculator />

      {/* Ad: Display between calculator and info */}
      <AdDisplay />

      {/* Info Section */}
      <section className="mt-16 space-y-12">
        {/* How It Works */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {t("info.how_it_works")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center"
              >
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                  {step}
                </div>
                <p className="text-gray-300 text-sm">
                  {t(`info.step${step}`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Track */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            {t("info.why_title")}
          </h2>
          <p className="text-gray-400 leading-relaxed">
            {t("info.why_description")}
          </p>
        </div>

        {/* Formula */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            {t("info.formula_title")}
          </h2>
          <p className="text-emerald-400 text-sm bg-gray-950 rounded-lg p-3">
            {t("info.formula")}
          </p>
        </div>
      </section>

      {/* Ad: Multiplex at bottom */}
      <AdMultiplex />
    </div>
    </>
  );
}
