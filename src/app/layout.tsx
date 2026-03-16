import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arena Infinity",
  description: "Infinite canvas explorer for Are.na channels and blocks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
