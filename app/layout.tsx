import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/Analytics";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Study Nook — your cozy focus corner",
  description:
    "An all-in-one study session companion: focus timer, lo-fi playlist, to-dos, bookmarks, and a little friend to keep you company.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${quicksand.variable} h-full antialiased`}>
      <body className="text-cocoa min-h-full flex flex-col font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
