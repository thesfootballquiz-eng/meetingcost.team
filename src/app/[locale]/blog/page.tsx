import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getAllPosts, getSlugForLocale } from "@/lib/posts";
import Image from "next/image";

const baseUrl = "https://meetingcost.team";

export const dynamic = "force-dynamic";

interface BlogPostPreview {
  id: string;
  slug: string;
  slugs?: Record<string, string>;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  coverImage?: string;
  author: string;
  tags: string[];
  createdAt: string;
}

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${baseUrl}/${loc}/blog`;
  }
  languages["x-default"] = `${baseUrl}/en/blog`;

  return {
    title: `${t("title")} | MeetingCost.team`,
    description: t("subtitle"),
    alternates: {
      canonical: `${baseUrl}/${locale}/blog`,
      languages,
    },
    openGraph: {
      title: `${t("title")} | MeetingCost.team`,
      description: t("subtitle"),
      url: `${baseUrl}/${locale}/blog`,
      siteName: "MeetingCost.team",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${t("title")} | MeetingCost.team`,
      description: t("subtitle"),
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const posts = (await getAllPosts()) as unknown as BlogPostPreview[];

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Page Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">
          {t("title")}
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-24 bg-gray-900/50 border border-gray-800 rounded-3xl">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-400 text-lg mb-2">{t("no_posts")}</p>
        </div>
      ) : (
        <>
          {/* Featured Post (first post) */}
          {posts.length > 0 && (
            <Link
              href={`/blog/${getSlugForLocale(posts[0] as any, locale)}`}
              className="block mb-10 group"
            >
              <article className="relative overflow-hidden rounded-3xl border border-gray-800 hover:border-emerald-500/40 transition-all duration-300 bg-gray-900/50">
                {posts[0].coverImage ? (
                  <div className="aspect-[21/9] overflow-hidden relative">
                    <Image
                      src={posts[0].coverImage}
                      alt={posts[0].title[locale] || posts[0].title["en"] || ""}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 1024px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      priority
                    />
                  </div>
                ) : (
                  <div className="aspect-[21/9] bg-gradient-to-br from-emerald-900/30 via-gray-900 to-cyan-900/30 flex items-center justify-center">
                    <span className="text-6xl opacity-30">📖</span>
                  </div>
                )}
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <span className="text-emerald-400 text-xs font-bold">
                          {posts[0].author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span>{posts[0].author}</span>
                    </div>
                    <span className="text-gray-700">•</span>
                    <time dateTime={posts[0].createdAt}>
                      {formatDate(posts[0].createdAt)}
                    </time>
                    {posts[0].tags.length > 0 && (
                      <>
                        <span className="text-gray-700">•</span>
                        {posts[0].tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-3">
                    {posts[0].title[locale] || posts[0].title["en"] || "Untitled"}
                  </h2>
                  <p className="text-gray-400 line-clamp-2 text-base">
                    {posts[0].excerpt[locale] || posts[0].excerpt["en"] || ""}
                  </p>
                  <div className="mt-4 inline-flex items-center text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                    {t("read_more")}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* Rest of posts - grid */}
          {posts.length > 1 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(1).map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${getSlugForLocale(post as any, locale)}`}
                  className="group block"
                >
                  <article className="h-full overflow-hidden rounded-2xl border border-gray-800 hover:border-emerald-500/40 transition-all duration-300 bg-gray-900/50 flex flex-col">
                    {post.coverImage ? (
                      <div className="aspect-video overflow-hidden relative">
                        <Image
                          src={post.coverImage}
                          alt={post.title[locale] || post.title["en"] || ""}
                          fill
                          unoptimized
                          sizes="(max-width: 1024px) 50vw, 320px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-emerald-900/20 via-gray-900 to-cyan-900/20 flex items-center justify-center">
                        <span className="text-4xl opacity-20">📖</span>
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <span>{post.author}</span>
                        <span className="text-gray-700">•</span>
                        <time dateTime={post.createdAt}>
                          {formatDate(post.createdAt)}
                        </time>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-2 line-clamp-2">
                        {post.title[locale] || post.title["en"] || "Untitled"}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
                        {post.excerpt[locale] || post.excerpt["en"] || ""}
                      </p>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-auto">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full text-[11px]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      <div className="mt-14 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          {t("back_home")}
        </Link>
      </div>
    </div>
  );
}
