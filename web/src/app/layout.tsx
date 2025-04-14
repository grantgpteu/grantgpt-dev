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
  CombinedSettings,
  Settings,
  QueryHistoryType,
} from "./admin/settings/interfaces";
import { AppProvider } from "@/components/context/AppProvider";
import { fetchAssistantData } from "@/lib/chat/fetchAssistantdata";
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
  let logoLocation = buildClientUrl("/onyx.ico");
  let enterpriseSettings: EnterpriseSettings | null = null;
  if (SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED) {
    enterpriseSettings = await (await fetchEnterpriseSettingsSS()).json();
    logoLocation =
      enterpriseSettings && enterpriseSettings.use_custom_logo
        ? "/api/enterprise-settings/logo"
        : buildClientUrl("/onyx.ico");
  }

  return {
    title: enterpriseSettings?.application_name || "GrantGPT",
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

  // Fetch data needed for AppProvider
  const [user, rawSettings, authTypeMetadata, assistantsResponse] = await Promise.all([
    getCurrentUserSS(),
    fetchSettingsSS(),
    getAuthTypeMetadataSS(),
    fetchAssistantData(),
  ]);

  if (!rawSettings) {
    return getPageContent(
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Error</h1>
          <p>Could not load application settings</p>
        </div>
      </div>
    );
  }

  // Handle enterprise settings
  let enterpriseSettings: EnterpriseSettings | null = null;
  if (SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED) {
    const response = await fetchEnterpriseSettingsSS();
    if (response) {
      const responseData = response as unknown as Partial<EnterpriseSettings>;
      enterpriseSettings = {
        application_name: responseData.application_name ?? null,
        use_custom_logo: responseData.use_custom_logo ?? false,
        use_custom_logotype: responseData.use_custom_logotype ?? false,
        custom_nav_items: Array.isArray(responseData.custom_nav_items) ? responseData.custom_nav_items : [],
        custom_lower_disclaimer_content: responseData.custom_lower_disclaimer_content ?? null,
        custom_header_content: responseData.custom_header_content ?? null,
        two_lines_for_chat_header: responseData.two_lines_for_chat_header ?? null,
        custom_popup_header: responseData.custom_popup_header ?? null,
        custom_popup_content: responseData.custom_popup_content ?? null,
        enable_consent_screen: responseData.enable_consent_screen ?? null,
        logo: responseData.logo ?? '',
        name: responseData.name ?? '',
        tagline: responseData.tagline ?? undefined,
      };
    }
  }

  // Handle base settings
  const settingsData = rawSettings as unknown as Partial<Settings>;
  const settings: Settings = {
    anonymous_user_enabled: Boolean(settingsData.anonymous_user_enabled),
    notifications: Array.isArray(settingsData.notifications) ? settingsData.notifications : [],
    needs_reindexing: Boolean(settingsData.needs_reindexing),
    gpu_enabled: Boolean(settingsData.gpu_enabled),
    auto_scroll: Boolean(settingsData.auto_scroll),
    temperature_override_enabled: Boolean(settingsData.temperature_override_enabled),
    query_history_type: settingsData.query_history_type ?? QueryHistoryType.NORMAL,
    application_status: settingsData.application_status ?? ApplicationStatus.ACTIVE,
    maximum_chat_retention_days: settingsData.maximum_chat_retention_days ?? null,
    anonymous_user_path: settingsData.anonymous_user_path,
    pro_search_enabled: Boolean(settingsData.pro_search_enabled),
    image_extraction_and_analysis_enabled: Boolean(settingsData.image_extraction_and_analysis_enabled),
    search_time_image_analysis_enabled: Boolean(settingsData.search_time_image_analysis_enabled),
    image_analysis_max_size_mb: settingsData.image_analysis_max_size_mb ?? null,
  };

  // Create the final settings object
  const combinedSettings: CombinedSettings = {
    settings,
    enterpriseSettings,
    customAnalyticsScript: null,
    webVersion: null,
    webDomain: null,
    isMobile: false,
  };

  const assistants = assistantsResponse?.assistants || [];
  const hasAnyConnectors = assistantsResponse?.hasAnyConnectors || false;
  const hasImageCompatibleModel = assistantsResponse?.hasImageCompatibleModel || false;

  // Check for critical errors
  if (NEXT_PUBLIC_CLOUD_ENABLED && 
      settings.application_status === ApplicationStatus.GATED_ACCESS) {
    return getPageContent(<AccessRestrictedPage />);
  }

  const content = (
    <>
      <AppProvider
        user={user}
        settings={combinedSettings}
        assistants={assistants}
        hasAnyConnectors={hasAnyConnectors}
        hasImageCompatibleModel={hasImageCompatibleModel}
        authTypeMetadata={authTypeMetadata}
      >
        <OnyxInitializingLoader enterpriseName={enterpriseName} />
        <FixedLogo enterpriseLogo={enterpriseLogo} />
        {children}
      </AppProvider>
    </>
  );

  return getPageContent(content);
}
