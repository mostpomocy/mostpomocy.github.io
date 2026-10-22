"use client";
import { useState } from "react";
export function ArticleActions() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="article-actions">
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(location.href.split("?")[0]);
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "Link skopiowany ✓" : "Kopiuj link ↗"}
      </button>
      <button onClick={() => window.print()}>Wydrukuj artykuł</button>
    </div>
  );
}
