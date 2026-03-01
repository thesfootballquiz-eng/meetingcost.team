"use client";

import { useState, useEffect, useCallback } from "react";
import RichEditor from "./RichEditor";
import Image from "next/image";

interface BlogPost {
  id: string;
  slug: string;
  slugs?: Record<string, string>;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  content: Record<string, string>;
  author: string;
  coverImage: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const LOCALES = ["en", "vi", "zh", "ja", "ko", "ru", "hi"];

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [view, setView] = useState<"list" | "edit">("list");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [hideCoverPreview, setHideCoverPreview] = useState(false);

  // Check auth on mount
  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((d) => {
        setIsLoggedIn(d.authenticated);
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  const loadPosts = useCallback(() => {
    fetch("/api/posts", { headers: { "x-admin": "true" } })
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isLoggedIn) loadPosts();
  }, [isLoggedIn, loadPosts]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        setIsLoggedIn(true);
        setPassword("");
      } else {
        setLoginError("Sai tài khoản hoặc mật khẩu");
      }
    } catch {
      setLoginError("Lỗi kết nối");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsLoggedIn(false);
    setPosts([]);
  };

  const startNewPost = () => {
    const blank: BlogPost = {
      id: "",
      slug: "",
      slugs: {},
      title: { en: "", vi: "" },
      excerpt: { en: "", vi: "" },
      content: { en: "", vi: "" },
      author: "Seringuyen",
      coverImage: "",
      tags: [],
      published: false,
      createdAt: "",
      updatedAt: "",
    };
    setHideCoverPreview(false);
    setEditingPost(blank);
    setView("edit");
  };

  const editPost = (post: BlogPost) => {
    setHideCoverPreview(false);
    setEditingPost({ ...post });
    setView("edit");
  };

  const deletePostHandler = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) loadPosts();
  };

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 80);
  };

  const savePost = async () => {
    if (!editingPost) return;

    // Auto-generate slug if empty
    let postToSave = { ...editingPost };
    if (!postToSave.slug.trim()) {
      const titleForSlug = postToSave.title.en || postToSave.title.vi || Object.values(postToSave.title).find(t => t.trim()) || "";
      if (titleForSlug) {
        postToSave = { ...postToSave, slug: generateSlug(titleForSlug) };
      }
    }

    // Validate
    const hasTitle = Object.values(postToSave.title).some(t => t.trim());
    if (!hasTitle) {
      alert("Vui lòng nhập tiêu đề cho ít nhất 1 ngôn ngữ");
      return;
    }
    if (!postToSave.slug.trim()) {
      alert("Vui lòng nhập slug (URL) cho bài viết");
      return;
    }
    const hasContent = Object.values(postToSave.content).some(c => c.trim());
    if (!hasContent) {
      alert("Vui lòng nhập nội dung cho ít nhất 1 ngôn ngữ");
      return;
    }

    const isNew = !postToSave.id;
    const url = isNew ? "/api/posts" : `/api/posts/${postToSave.id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postToSave),
    });

    if (res.ok) {
      loadPosts();
      setView("list");
      setEditingPost(null);
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Lỗi khi lưu bài viết");
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Login Form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">$</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">MeetingCost.team</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Tài khoản
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoComplete="current-password"
              />
            </div>
            {loginError && (
              <p className="text-red-400 text-sm">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Post Editor
  if (view === "edit" && editingPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">
            {editingPost.id ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          </h1>
          <button
            onClick={() => {
              setView("list");
              setEditingPost(null);
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕ Hủy
          </button>
        </div>

        <div className="space-y-6">
          {/* Slug (primary / fallback) */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Slug chính (fallback)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editingPost.slug}
                onChange={(e) =>
                  setEditingPost({ ...editingPost, slug: e.target.value })
                }
                placeholder="my-blog-post (tự tạo nếu để trống)"
                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => {
                  const titleForSlug = editingPost.title.en || editingPost.title.vi || Object.values(editingPost.title).find(t => t.trim()) || "";
                  if (titleForSlug) {
                    setEditingPost({ ...editingPost, slug: generateSlug(titleForSlug) });
                  }
                }}
                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors whitespace-nowrap"
              >
                Tạo từ tiêu đề
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">Slug mặc định khi ngôn ngữ không có slug riêng</p>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Tác giả
            </label>
            <input
              type="text"
              value={editingPost.author}
              onChange={(e) =>
                setEditingPost({ ...editingPost, author: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Ảnh đại diện (URL)
            </label>
            <input
              type="url"
              value={editingPost.coverImage || ""}
              onChange={(e) => {
                setHideCoverPreview(false);
                setEditingPost({ ...editingPost, coverImage: e.target.value });
              }}
              placeholder="https://example.com/cover.jpg"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {editingPost.coverImage && !hideCoverPreview && (
              <div className="mt-3 border border-gray-800 rounded-xl overflow-hidden relative w-full max-h-64">
                <Image
                  src={editingPost.coverImage}
                  alt="Cover preview"
                  width={1200}
                  height={630}
                  className="w-full max-h-64 object-cover"
                  unoptimized
                  onError={() => setHideCoverPreview(true)}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Tags (phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={editingPost.tags.join(", ")}
              onChange={(e) =>
                setEditingPost({
                  ...editingPost,
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              placeholder="meeting, productivity"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Published toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editingPost.published}
              onChange={(e) =>
                setEditingPost({
                  ...editingPost,
                  published: e.target.checked,
                })
              }
              className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-white font-medium">Xuất bản</span>
          </label>

          {/* Multilingual content */}
          <div className="space-y-8">
            {LOCALES.map((loc) => (
              <div
                key={loc}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-emerald-400 mb-4 uppercase">
                  {loc}
                </h3>

                <div className="space-y-4">
                  {/* Per-locale slug */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Slug ({loc})
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingPost.slugs?.[loc] || ""}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            slugs: {
                              ...(editingPost.slugs || {}),
                              [loc]: e.target.value,
                            },
                          })
                        }
                        placeholder={editingPost.slug || "Để trống = dùng slug chính"}
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const titleForSlug = editingPost.title[loc] || "";
                          if (titleForSlug) {
                            setEditingPost({
                              ...editingPost,
                              slugs: {
                                ...(editingPost.slugs || {}),
                                [loc]: generateSlug(titleForSlug),
                              },
                            });
                          }
                        }}
                        className="px-3 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-xs transition-colors whitespace-nowrap"
                      >
                        Tạo
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Tiêu đề ({loc})
                    </label>
                    <input
                      type="text"
                      value={editingPost.title[loc] || ""}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          title: {
                            ...editingPost.title,
                            [loc]: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Tóm tắt ({loc})
                    </label>
                    <textarea
                      value={editingPost.excerpt[loc] || ""}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          excerpt: {
                            ...editingPost.excerpt,
                            [loc]: e.target.value,
                          },
                        })
                      }
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Nội dung ({loc})
                    </label>
                    <RichEditor
                      value={editingPost.content[loc] || ""}
                      onChange={(html) =>
                        setEditingPost({
                          ...editingPost,
                          content: {
                            ...editingPost.content,
                            [loc]: html,
                          },
                        })
                      }
                      placeholder={`Viết nội dung ${loc.toUpperCase()} tại đây...`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Save */}
          <div className="flex gap-3">
            <button
              onClick={savePost}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors"
            >
              {editingPost.id ? "Cập nhật" : "Tạo bài viết"}
            </button>
            <button
              onClick={() => {
                setView("list");
                setEditingPost(null);
              }}
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Posts List
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Quản lý bài viết blog
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={startNewPost}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors text-sm"
          >
            + Tạo bài viết
          </button>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors text-sm"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
          <p className="text-gray-500 text-lg mb-4">Chưa có bài viết nào</p>
          <button
            onClick={startNewPost}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors"
          >
            Tạo bài viết đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      post.published ? "bg-emerald-500" : "bg-gray-600"
                    }`}
                  />
                  <h3 className="text-white font-medium truncate">
                    {post.title.vi || post.title.en || "Chưa có tiêu đề"}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>/{post.slug}</span>
                  <span>•</span>
                  <span>{post.author}</span>
                  <span>•</span>
                  <span>
                    {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      post.published
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-gray-800 text-gray-500"
                    }`}
                  >
                    {post.published ? "Đã xuất bản" : "Nháp"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => editPost(post)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
                >
                  Sửa
                </button>
                <button
                  onClick={() => deletePostHandler(post.id)}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-lg transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
