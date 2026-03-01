import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAllPosts, getAllPostsAdmin, addPost } from "@/lib/posts";

export async function GET(request: NextRequest) {
  const isAdmin = request.headers.get("x-admin") === "true";

  if (isAdmin) {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ posts: await getAllPostsAdmin() });
  }

  return NextResponse.json({ posts: await getAllPosts() });
}

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, excerpt, content, author, tags, published, slug, slugs, coverImage } = body;

    if (!title || !Object.values(title as Record<string, string>).some(t => t?.trim())) {
      return NextResponse.json(
        { error: "Vui lòng nhập tiêu đề cho ít nhất 1 ngôn ngữ" },
        { status: 400 }
      );
    }

    if (!slug || !(slug as string).trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập slug (URL) cho bài viết" },
        { status: 400 }
      );
    }

    const post = {
      id: crypto.randomUUID(),
      slug: slug as string,
      ...(slugs && typeof slugs === "object" ? { slugs: slugs as Record<string, string> } : {}),
      title: title as Record<string, string>,
      excerpt: (excerpt || {}) as Record<string, string>,
      content: (content || {}) as Record<string, string>,
      author: (author as string) || "Admin",
      coverImage: (coverImage as string) || "",
      tags: (tags as string[]) || [],
      published: published !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addPost(post);
    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
