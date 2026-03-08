"use client";

import { useEffect, useRef } from "react";

/**
 * Display Ad (Auto format, responsive)
 * Slot: 3480343603
 * Best for: general purpose banners between content sections
 */
export default function AdDisplay({ className = "" }: { className?: string }) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet
    }
  }, []);

  return (
    <div className={`ad-container my-8 ${className}`} aria-hidden="true">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5262734754559750"
        data-ad-slot="1336707630"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
