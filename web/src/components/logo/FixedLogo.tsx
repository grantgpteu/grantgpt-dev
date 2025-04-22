"use client";

import React, { memo, useContext } from "react"; // Added useContext import
import Image from "next/image"; // Import the Next.js Image component
import { HeaderTitle } from "@/components/header/HeaderTitle";
// Removed unused Logo import: import { Logo } from "@/components/logo/Logo";
import { SettingsContext } from "@/components/settings/SettingsProvider";
import { NEXT_PUBLIC_DO_NOT_USE_TOGGLE_OFF_DANSWER_POWERED } from "@/lib/constants";
import Link from "next/link";
// Removed unused useContext import: import { useContext } from "react";
import { FiSidebar } from "react-icons/fi";
// Removed unused LogoType import: import { LogoType } from "@/components/logo/Logo";
import { EnterpriseSettings } from "@/app/admin/settings/interfaces";
import { useRouter } from "next/navigation";

export const LogoComponent = memo(function LogoComponent({
  enterpriseSettings,
  backgroundToggled,
  show,
  isAdmin,
}: {
  enterpriseSettings: EnterpriseSettings | null;
  backgroundToggled?: boolean;
  show?: boolean;
  isAdmin?: boolean;
}) {
  const router = useRouter();

  // Determine the application name to display, defaulting if necessary
  // or leaving it empty if only the logo should show when not configured.
  // If you ALWAYS want a name, you could default here:
  // const appName = enterpriseSettings?.application_name || "GrantGPT";
  const appName = enterpriseSettings?.application_name; // Use configured name only

  return (
    <div
      onClick={isAdmin ? () => router.push("/chat") : () => {}}
      className={`max-w-[300px]  // Increased from 200px to 300px
        ${!show && "mobile:hidden"}
       flex text-text-900 items-center gap-x-1 cursor-pointer`} // Added cursor-pointer for clarity
    >
      {/* Always display the logo from public/logotype.png */}
      <div className="flex-none my-auto">
        <Image
          src="/logotype.png" // Path relative to the public folder
          alt="GrantGPT Logo" // Updated Alt text
          width={130} // Updated to 200px width
          height={39} // Updated to 60px height to maintain proportion
        />
      </div>

      {/* Conditionally display the application name and powered by text */}
      {appName ? (
        <div className="w-full overflow-hidden"> {/* Added overflow-hidden */}
          <HeaderTitle backgroundToggled={backgroundToggled}>
            {appName}
          </HeaderTitle>
          {!NEXT_PUBLIC_DO_NOT_USE_TOGGLE_OFF_DANSWER_POWERED && (
            <p className="text-xs text-left text-subtle whitespace-nowrap overflow-hidden text-ellipsis">
              Powered by GrantGPT {/* Updated text */}
            </p>
          )}
        </div>
      ) : (
        // If no application name is set, you might want a default title
        // or just show the logo. Set to null to show only the logo.
         null
        // Example with default title:
        // <HeaderTitle backgroundToggled={backgroundToggled}>GrantGPT</HeaderTitle>
      )}
    </div>
  );
});

// FixedLogo component remains unchanged as it uses LogoComponent
export default function FixedLogo({
  backgroundToggled,
}: {
  backgroundToggled?: boolean;
}) {
  const combinedSettings = useContext(SettingsContext);
  const enterpriseSettings = combinedSettings?.enterpriseSettings;

  return (
    <>
      <Link
        href="/chat"
        className="fixed cursor-pointer flex z-40 left-4 top-4 h-16 mb-8 pointer-events-auto"  // Adjusted spacing and added pointer-events
      >
        <LogoComponent
          enterpriseSettings={enterpriseSettings!}
          backgroundToggled={backgroundToggled}
          show={true}
        />
      </Link>
      <div className="mobile:hidden fixed left-4 bottom-4">
        <FiSidebar
          className={`${
            backgroundToggled
              ? "text-text-mobile-sidebar-toggled"
              : "text-text-mobile-sidebar-untoggled"
          }`}
        />
      </div>
    </>
  );
}