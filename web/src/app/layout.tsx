import "./globals.css";

import {
  fetchEnterpriseSettingsSS,
  fetchSettingsSS,
} from "@/components/settings/lib";
import { OnyxInitializingLoader } from "@/components/OnyxInitializingLoader";
import FixedLogo from "@/components/logo/FixedLogo";
import {
  CUSTOM_ANALYTICS_ENABLED,
  GTM_ENABLED,
  SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED,
  NEXT_PUBLIC_CLOUD_ENABLED,
} from "@/lib/constants";
import { Metadata } from "next";
import { buildClientUrl } from "@/lib/utilsSS";
import { Inter } from "next/font/google";
import {
  EnterpriseSettings,
  ApplicationStatus,
} from "./admin/settings/interfaces";
import { fetchAssistantData } from "@/lib/chat/fetchAssistantdata";
import { AppProvider } from "@/components/context/AppProvider";
import { PHProvider } from "./providers";
import { getAuthTypeMetadataSS, getCurrentUserSS } from "@/lib/userSS";
import { Suspense } from "react";
import PostHogPageView from "./PostHogPageView";
import Script from "next/script";
import { Hanken_Grotesk } from "next/font/google";
import { WebVitals } from "./web-vitals";
import { ThemeProvider } from "next-themes";
import { DocumentsProvider } from "./chat/my-documents/DocumentsContext";
import CloudError from "@/components/errorPages/CloudErrorPage";
import Error from "@/components/errorPages/ErrorPage";
import AccessRestrictedPage from "@/components/errorPages/AccessRestrictedPage";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const enterpriseName = process.env.ENTERPRISE_NAME || "GrantGPT";
  const enterpriseLogo = process.env.ENTERPRISE_LOGO || buildClientUrl("/onyx.ico");

  return {
    title: enterpriseName,
    description: "Matching you with the perfect Grants",
    icons: {
      icon: enterpriseLogo,
    },
  };
}

export const dynamic = "force-dynamic";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({
  children,
}: RootLayoutProps) {
  const enterpriseName = process.env.NEXT_PUBLIC_ENTERPRISE_NAME || "GrantGPT";
  const enterpriseLogo = process.env.NEXT_PUBLIC_ENTERPRISE_LOGO || buildClientUrl("/onyx.ico");

  const getPageContent = async (content: React.ReactNode) => (
    <html
      lang="en"
      className={`${inter.variable} ${hankenGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, interactive-widget=resizes-content"
        />
      </head>

      <body className={`relative ${inter.variable} font-hanken`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="text-text min-h-screen bg-background">
            {content}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );

  return getPageContent(
    <>
      <OnyxInitializingLoader enterpriseName={enterpriseName} />
      <FixedLogo enterpriseLogo={enterpriseLogo} />
      {children}
    </>
  );
}
