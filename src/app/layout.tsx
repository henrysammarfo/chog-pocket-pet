import type { Metadata, Viewport } from "next";
import { Anton, Condiment, DM_Serif_Display, Fraunces, Inter, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-nunito",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-fraunces",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif-display",
});

const condiment = Condiment({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-condiment",
});

export const metadata: Metadata = {
  title: "Chog Pocket Pet",
  description:
    "Your Chog is the pet. Its traits set the mood. Feed it by setting $CHOG aside each day.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#010828",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${fraunces.variable} ${anton.variable} ${inter.variable} ${dmSerif.variable} ${condiment.variable} h-full antialiased`}
      style={{
        ["--background" as string]: "#010828",
        ["--foreground" as string]: "#eff4ff",
        ["--card" as string]: "#071033",
        ["--card-foreground" as string]: "#eff4ff",
        ["--popover" as string]: "#071033",
        ["--popover-foreground" as string]: "#eff4ff",
        ["--primary" as string]: "#6fff00",
        ["--primary-foreground" as string]: "#010828",
        ["--secondary" as string]: "#121a3d",
        ["--secondary-foreground" as string]: "#eff4ff",
        ["--muted" as string]: "#121a3d",
        ["--muted-foreground" as string]: "#b7c3e0",
        ["--accent" as string]: "#1a1040",
        ["--accent-foreground" as string]: "#eff4ff",
        ["--destructive" as string]: "#ff5a7a",
        ["--border" as string]: "rgba(255,255,255,0.14)",
        ["--input" as string]: "rgba(255,255,255,0.16)",
        ["--ring" as string]: "#6fff00",
      }}
    >
      <body className="min-h-full bg-[#010828] text-[#EFF4FF]">{children}</body>
    </html>
  );
}
