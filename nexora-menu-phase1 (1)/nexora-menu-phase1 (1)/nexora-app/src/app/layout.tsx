import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import { siteConfig } from "@/config/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.productName} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.productName}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.productName,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.productName,
    images: [siteConfig.ogImage],
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} dark`}>
      <body className="min-h-screen bg-void font-sans antialiased">
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#E9E9EE",
            },
          }}
        />
      </body>
    </html>
  );
}
