import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getPostBySlug,
  getPostById,
  updatePost,
  deletePost,
} from "@/lib/posts";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Try by slug first (public), then by ID (admin)
  let post = await getPostBySlug(id);
  if (!post) {
    const authenticated = await isAuthenticated();
    if (authenticated) {
      post = await getPostById(id);
    }
  }

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const success = await updatePost(id, body);
    if (!success) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const post = await getPostById(id);
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const success = await deletePost(id);
  if (!success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
