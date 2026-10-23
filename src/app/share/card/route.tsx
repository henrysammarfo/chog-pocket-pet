import { ImageResponse } from "next/og";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? "0";
  const streak = searchParams.get("streak") ?? "0";
  const saved = searchParams.get("saved") ?? "0";
  const days = streak === "1" ? "1-day streak" : `${streak}-day streak`;
  const line = `Chog #${token} · ${days} · ${saved} $CHOG saved`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#F4845F",
          color: "white",
          padding: "64px",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, fontStyle: "italic" }}>still yours</div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1, letterSpacing: "-1px", marginTop: 12 }}>
          {line}
        </div>
        <div style={{ display: "flex", fontSize: 28, marginTop: 24 }}>Chog Pocket · Monad</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
