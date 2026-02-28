import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getPostBySlug } from "@/lib/posts";
import ShareButtons from "./ShareButtons";
import Image from "next/image";

const baseUrl = "https://meetingcost.team";

function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

export const dynamic = "force-dynamic";

interface BlogPostFull {
  id: string;
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  content: Record<string, string>;
  coverImage?: string;
  author: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug) as unknown as BlogPostFull | undefined;

  if (!post) {
    return {
      title: "Not found | MeetingCost.team",
      robots: { index: false, follow: false },
    };
  }

  const title = post.title[locale] || post.title["en"] || "Untitled";
  const excerpt = post.excerpt[locale] || post.excerpt["en"] || "";
  const canonicalUrl = `${baseUrl}/${locale}/blog/${post.slug}`;
  const ogImage = post.coverImage ? toAbsoluteUrl(post.coverImage) : undefined;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${baseUrl}/${loc}/blog/${post.slug}`;
  }
  languages["x-default"] = `${baseUrl}/en/blog/${post.slug}`;

  return {
    title: `${title} | MeetingCost.team`,
    description: excerpt,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: `${title} | MeetingCost.team`,
      description: excerpt,
      url: canonicalUrl,
      siteName: "MeetingCost.team",
      type: "article",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | MeetingCost.team`,
      description: excerpt,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  const post = getPostBySlug(slug) as unknown as BlogPostFull | undefined;
  if (!post) notFound();

  const title = post.title[locale] || post.title["en"] || "Untitled";
  const excerpt = post.excerpt[locale] || post.excerpt["en"] || "";
  const content = post.content[locale] || post.content["en"] || "";
  const readingTime = Math.max(
    1,
    Math.ceil(content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200)
  );

  const canonicalUrl = `${baseUrl}/${locale}/blog/${post.slug}`;
  const coverImageAbs = post.coverImage ? toAbsoluteUrl(post.coverImage) : undefined;

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: excerpt,
    image: coverImageAbs || `${baseUrl}/og-image.png`,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "MeetingCost.team",
      logo: {
        "@type": "ImageObject",
        url: "https://meetingcost.team/favicon.ico",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    keywords: post.tags.join(", "),
    wordCount: content.replace(/<[^>]*>/g, "").split(/\s+/).length,
    inLanguage: locale,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb Nav */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          <Link href="/blog" className="hover:text-emerald-400 transition-colors">Blog</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-400 truncate max-w-[200px]">{title}</span>
        </nav>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-8 rounded-2xl overflow-hidden border border-gray-800">
            <div className="relative w-full aspect-[2/1]">
              <Image
                src={post.coverImage}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Article Header */}
        <header className="mb-8">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
            {title}
          </h1>

          {excerpt && (
            <p className="text-lg text-gray-400 mb-6 leading-relaxed">{excerpt}</p>
          )}

          {/* Author & Meta Row */}
          <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {post.author.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{post.author}</p>
                <p className="text-gray-500 text-xs">
                  <time dateTime={post.createdAt}>
                    {new Date(post.createdAt).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  {post.updatedAt !== post.createdAt && (
                    <span className="ml-2 text-gray-600">
                      (cập nhật: {new Date(post.updatedAt).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })})
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-gray-500 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{readingTime} min read</span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div
          className="rich-editor-content mb-12"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Share & Navigation Footer */}
        <footer className="border-t border-gray-800 pt-8">
          <ShareButtons title={title} url={canonicalUrl} />

          {/* Back to blog */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            {t("back_blog")}
          </Link>
        </footer>
      </article>
    </>
  );
}
