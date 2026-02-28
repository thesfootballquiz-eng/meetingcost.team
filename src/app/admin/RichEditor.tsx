"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Image from "next/image";

function ToolButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-all ${
        active
          ? "bg-emerald-500/30 text-emerald-300 ring-1 ring-emerald-500/50"
          : "text-gray-400 hover:text-white hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className="w-px h-6 bg-gray-700 mx-1" />;
}

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [hideImagePreview, setHideImagePreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const isInternalChange = useRef(false);
  const savedRange = useRef<Range | null>(null);

  // Save current cursor position
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  // Restore saved cursor position
  const restoreSelection = useCallback(() => {
    if (savedRange.current && editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRange.current);
      }
    }
  }, []);

  // Set initial content
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState("bold")) formats.add("bold");
    if (document.queryCommandState("italic")) formats.add("italic");
    if (document.queryCommandState("underline")) formats.add("underline");
    if (document.queryCommandState("strikeThrough")) formats.add("strikethrough");
    if (document.queryCommandState("insertUnorderedList")) formats.add("ul");
    if (document.queryCommandState("insertOrderedList")) formats.add("ol");

    // Check block format
    const block = document.queryCommandValue("formatBlock");
    if (block) formats.add(block.toLowerCase());

    setActiveFormats(formats);
  }, []);

  const exec = useCallback((command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleInput();
    updateActiveFormats();
  }, [handleInput, updateActiveFormats]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Tab to indent
    if (e.key === "Tab") {
      e.preventDefault();
      exec(e.shiftKey ? "outdent" : "indent");
    }
    updateActiveFormats();
  }, [exec, updateActiveFormats]);

  const insertLink = useCallback(() => {
    if (linkUrl.trim()) {
      restoreSelection();
      exec("createLink", linkUrl.trim());
      // Make link open in new tab
      const links = editorRef.current?.querySelectorAll("a");
      links?.forEach((a) => {
        if (a.getAttribute("href") === linkUrl.trim() && !a.getAttribute("target")) {
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
          a.classList.add("text-emerald-400", "underline", "hover:text-emerald-300");
        }
      });
    }
    setLinkUrl("");
    setShowLinkModal(false);
    handleInput();
  }, [linkUrl, exec, handleInput, restoreSelection]);

  const insertImage = useCallback(() => {
    if (imageUrl.trim() && editorRef.current) {
      restoreSelection();
      const alt = imageAlt.trim() || "Image";
      const html = `<figure class="my-4"><img src="${imageUrl.trim()}" alt="${alt}" class="max-w-full rounded-lg mx-auto" />${imageAlt.trim() ? `<figcaption class="text-center text-sm text-gray-400 mt-2">${imageAlt.trim()}</figcaption>` : ""}</figure><p><br></p>`;
      document.execCommand("insertHTML", false, html);
      handleInput();
    }
    setImageUrl("");
    setImageAlt("");
    setShowImageModal(false);
  }, [imageUrl, imageAlt, handleInput, restoreSelection]);

  const insertDivider = useCallback(() => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, '<hr class="border-gray-700 my-6" />');
    handleInput();
  }, [handleInput]);

  const isActive = (format: string) => activeFormats.has(format);

  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden bg-gray-800">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-800/80 border-b border-gray-700">
        {/* Text format */}
        <ToolButton onClick={() => exec("bold")} active={isActive("bold")} title="Bold (Ctrl+B)">
          <strong>B</strong>
        </ToolButton>
        <ToolButton onClick={() => exec("italic")} active={isActive("italic")} title="Italic (Ctrl+I)">
          <em>I</em>
        </ToolButton>
        <ToolButton onClick={() => exec("underline")} active={isActive("underline")} title="Underline (Ctrl+U)">
          <span className="underline">U</span>
        </ToolButton>
        <ToolButton onClick={() => exec("strikeThrough")} active={isActive("strikethrough")} title="Strikethrough">
          <span className="line-through">S</span>
        </ToolButton>

        <Separator />

        {/* Headings */}
        <ToolButton onClick={() => exec("formatBlock", "h2")} active={isActive("h2")} title="Heading 2">
          H2
        </ToolButton>
        <ToolButton onClick={() => exec("formatBlock", "h3")} active={isActive("h3")} title="Heading 3">
          H3
        </ToolButton>
        <ToolButton onClick={() => exec("formatBlock", "h4")} active={isActive("h4")} title="Heading 4">
          H4
        </ToolButton>
        <ToolButton onClick={() => exec("formatBlock", "p")} active={isActive("p")} title="Paragraph">
          ¶
        </ToolButton>

        <Separator />

        {/* Alignment */}
        <ToolButton onClick={() => exec("justifyLeft")} title="Align Left">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M3 6h18M3 12h12M3 18h16" /></svg>
        </ToolButton>
        <ToolButton onClick={() => exec("justifyCenter")} title="Align Center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M3 6h18M6 12h12M4 18h16" /></svg>
        </ToolButton>
        <ToolButton onClick={() => exec("justifyRight")} title="Align Right">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M3 6h18M9 12h12M5 18h16" /></svg>
        </ToolButton>

        <Separator />

        {/* Lists */}
        <ToolButton onClick={() => exec("insertUnorderedList")} active={isActive("ul")} title="Bullet List">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
        </ToolButton>
        <ToolButton onClick={() => exec("insertOrderedList")} active={isActive("ol")} title="Numbered List">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><text x="1" y="8" fontSize="7" fontFamily="monospace">1.</text><line x1="9" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="2" /><text x="1" y="15" fontSize="7" fontFamily="monospace">2.</text><line x1="9" y1="13" x2="22" y2="13" stroke="currentColor" strokeWidth="2" /><text x="1" y="22" fontSize="7" fontFamily="monospace">3.</text><line x1="9" y1="20" x2="22" y2="20" stroke="currentColor" strokeWidth="2" /></svg>
        </ToolButton>
        <ToolButton onClick={() => exec("formatBlock", "blockquote")} title="Blockquote">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" /></svg>
        </ToolButton>

        <Separator />

        {/* Insert */}
        <ToolButton onClick={() => { saveSelection(); setShowLinkModal(true); }} title="Insert Link">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        </ToolButton>
        <ToolButton onClick={() => { saveSelection(); setShowImageModal(true); }} title="Insert Image">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </ToolButton>
        <ToolButton onClick={insertDivider} title="Horizontal Line">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M3 12h18" /></svg>
        </ToolButton>

        <Separator />

        {/* Code */}
        <ToolButton onClick={() => {
          editorRef.current?.focus();
          document.execCommand("insertHTML", false, "<code class='bg-gray-900 px-1.5 py-0.5 rounded text-emerald-300 text-sm font-mono'>" + (window.getSelection()?.toString() || "code") + "</code>");
          handleInput();
        }} title="Inline Code">
          <span className="font-mono text-xs">&lt;/&gt;</span>
        </ToolButton>
        <ToolButton onClick={() => {
          editorRef.current?.focus();
          document.execCommand("insertHTML", false, "<pre class='bg-gray-900 rounded-lg p-4 my-4 overflow-x-auto'><code class='text-emerald-300 text-sm font-mono'>" + (window.getSelection()?.toString() || "// code block") + "</code></pre><p><br></p>");
          handleInput();
        }} title="Code Block">
          <span className="font-mono text-[10px]">{"{}"}</span>
        </ToolButton>

        <Separator />

        {/* Undo/Redo */}
        <ToolButton onClick={() => exec("undo")} title="Undo (Ctrl+Z)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" /></svg>
        </ToolButton>
        <ToolButton onClick={() => exec("redo")} title="Redo (Ctrl+Y)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M21 10H11a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4" /></svg>
        </ToolButton>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Preview toggle */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            showPreview
              ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/50"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          {showPreview ? "✎ Edit" : "👁 Preview"}
        </button>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div
          className="rich-editor-content p-6 min-h-[400px] max-h-[600px] overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-gray-500">Chưa có nội dung</p>' }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onMouseUp={updateActiveFormats}
          onKeyUp={updateActiveFormats}
          data-placeholder={placeholder || "Bắt đầu viết nội dung bài viết..."}
          className="rich-editor-content p-6 min-h-[400px] max-h-[600px] overflow-y-auto focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-600"
        />
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Chèn liên kết</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && insertLink()}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowLinkModal(false); setLinkUrl(""); }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={insertLink}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Chèn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Chèn hình ảnh</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">URL hình ảnh</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setHideImagePreview(false);
                    setImageUrl(e.target.value);
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Mô tả ảnh (alt text)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Mô tả hình ảnh"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  onKeyDown={(e) => e.key === "Enter" && insertImage()}
                />
              </div>
              {imageUrl && !hideImagePreview && (
                <div className="border border-gray-700 rounded-xl overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={imageAlt || "Preview"}
                    width={800}
                    height={450}
                    className="max-h-48 w-auto mx-auto"
                    unoptimized
                    onError={() => setHideImagePreview(true)}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl("");
                  setImageAlt("");
                  setHideImagePreview(false);
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={insertImage}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Chèn ảnh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
