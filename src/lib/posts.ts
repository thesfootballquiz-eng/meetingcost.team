import { getRedisClient } from "./redis";

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

const POSTS_KEY = "blog:posts";

async function readPosts(): Promise<BlogPost[]> {
  const redis = await getRedisClient();
  const raw = await redis.get(POSTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BlogPost[]) : [];
  } catch {
    return [];
  }
}

async function writePosts(posts: BlogPost[]): Promise<void> {
  const redis = await getRedisClient();
  await redis.set(POSTS_KEY, JSON.stringify(posts));
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await readPosts();
  return posts
    .filter((p) => p.published)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function getAllPostsAdmin(): Promise<BlogPost[]> {
  const posts = await readPosts();
  return posts.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await readPosts();
  return posts.find((p) => p.slug === slug && p.published);
}

export async function getPostById(id: string): Promise<BlogPost | undefined> {
  const posts = await readPosts();
  return posts.find((p) => p.id === id);
}

export async function addPost(post: BlogPost): Promise<void> {
  const posts = await readPosts();
  posts.push(post);
  await writePosts(posts);
}

export async function updatePost(
  id: string,
  updates: Partial<BlogPost>
): Promise<boolean> {
  const posts = await readPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  posts[idx] = {
    ...posts[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await writePosts(posts);
  return true;
}

export async function deletePost(id: string): Promise<boolean> {
  const posts = await readPosts();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) return false;
  await writePosts(filtered);
  return true;
}
