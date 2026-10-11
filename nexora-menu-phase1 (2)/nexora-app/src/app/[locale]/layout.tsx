import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter, Fraunces } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import { routing, getDirection } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { AdPixels } from "@/components/shared/ad-pixels";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${fraunces.variable} dark`}>
      <body className="min-h-screen bg-void font-sans antialiased">
        <AdPixels />
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        <Toaster
          theme="dark"
          dir={dir}
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
