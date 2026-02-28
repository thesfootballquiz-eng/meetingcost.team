export interface BlogPost {
  id: string;
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  content: Record<string, string>;
  author: string;
  coverImage?: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

import fs from "fs";
import path from "path";

let posts: BlogPost[] = [];
let loaded = false;

function getPostsFilePath(): string {
  return path.join(process.cwd(), "data", "posts.json");
}

function ensureLoaded(): void {
  if (loaded) return;
  loaded = true;

  const filePath = getPostsFilePath();
  try {
    if (!fs.existsSync(filePath)) {
      posts = [];
      return;
    }
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    posts = Array.isArray(parsed) ? (parsed as BlogPost[]) : [];
  } catch {
    posts = [];
  }
}

function persist(): void {
  const filePath = getPostsFilePath();
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(posts, null, 2), "utf8");
  } catch {
    // If filesystem is read-only (e.g. some serverless platforms), keep in-memory.
  }
}

export function getAllPosts(): BlogPost[] {
  ensureLoaded();
  return posts
    .filter((p) => p.published)
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getAllPostsAdmin(): BlogPost[] {
  ensureLoaded();
  return posts
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  ensureLoaded();
  return posts.find((p) => p.slug === slug && p.published);
}

export function getPostById(id: string): BlogPost | undefined {
  ensureLoaded();
  return posts.find((p) => p.id === id);
}

export function addPost(post: BlogPost): void {
  ensureLoaded();
  posts.push(post);
  persist();
}

export function updatePost(id: string, updates: Partial<BlogPost>): boolean {
  ensureLoaded();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  posts[idx] = { ...posts[idx], ...updates, updatedAt: new Date().toISOString() };
  persist();
  return true;
}

export function deletePost(id: string): boolean {
  ensureLoaded();
  const before = posts.length;
  posts = posts.filter((p) => p.id !== id);
  if (posts.length < before) persist();
  return posts.length < before;
}
