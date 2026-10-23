"use client";

import { shareCardPath, shareIntent, shareLine } from "@/lib/share-card";

export function ShareButton({
  tokenId,
  streak,
  saved,
  testId = "share-card",
}: {
  tokenId: number;
  streak: number;
  saved: bigint;
  testId?: string;
}) {
  const line = shareLine(tokenId, streak, saved);
  const cardPath = shareCardPath(tokenId, streak, saved);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        data-testid={testId}
        data-line={line}
        className="font-anton h-[var(--control)] rounded-full bg-[#6FFF00] px-6 uppercase text-[#010828]"
        onClick={() => {
          const page = `${window.location.origin}${cardPath}`;
          window.open(shareIntent(line, page), "_blank", "noopener,noreferrer");
        }}
      >
        Share on X
      </button>
      <a href={cardPath} className="text-sm text-[#6FFF00]" data-testid="share-image">
        Card image
      </a>
      <p className="w-full text-sm text-[#EFF4FF]/70">{line}</p>
    </div>
  );
}
