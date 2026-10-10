import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { FooterProof } from "@/components/FooterProof";
import { Providers } from "@/components/Providers";
import { PRODUCT } from "@/lib/product";

export const metadata: Metadata = {
  title: `${PRODUCT.name} - payment requests on BOT Chain`,
  description: PRODUCT.heroBody,
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon-128.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <Providers>
          <Header />
          <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
            {children}
          </main>
          <FooterProof />
        </Providers>
      </body>
    </html>
  );
}