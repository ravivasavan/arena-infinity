import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Agentation } from "agentation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arena Infinity",
  description: "Infinite canvas explorer for Are.na channels and blocks",
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" },
    apple: "/favicon-dark.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
        <Toaster theme="dark" position="bottom-right" />
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
