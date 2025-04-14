"use client";

import React, { memo } from "react";
import { HeaderTitle } from "@/components/header/HeaderTitle";
import { Logo } from "@/components/logo/Logo";
import { SettingsContext } from "@/components/settings/SettingsProvider";
import { NEXT_PUBLIC_DO_NOT_USE_TOGGLE_OFF_DANSWER_POWERED } from "@/lib/constants";
import Link from "next/link";
import { useContext } from "react";
import { FiSidebar } from "react-icons/fi";
import { LogoType } from "@/components/logo/Logo";
import { EnterpriseSettings } from "@/app/admin/settings/interfaces";
import { useRouter } from "next/navigation";

interface FixedLogoProps {
  enterpriseLogo: string;
  backgroundToggled?: boolean;
}

export const LogoComponent = memo(function LogoComponent({
  enterpriseLogo,
  backgroundToggled,
  show,
  isAdmin,
}: {
  enterpriseLogo: string;
  backgroundToggled?: boolean;
  show?: boolean;
  isAdmin?: boolean;
}) {
  const router = useRouter();

  return (
    <div
      onClick={isAdmin ? () => router.push("/chat") : () => {}}
      className={`max-w-[200px]
        ${!show && "mobile:hidden"}
       flex text-text-900 items-center gap-x-1`}
    >
      <img src={enterpriseLogo} height={24} width={24} alt="Logo" />
    </div>
  );
});

export default function FixedLogo({
  enterpriseLogo,
  backgroundToggled,
}: FixedLogoProps) {

  return (
    <>
      <Link
        href="/chat"
        className="fixed cursor-pointer flex z-40 left-4 top-3 h-8"
      >
        <LogoComponent
          enterpriseLogo={enterpriseLogo}
          backgroundToggled={backgroundToggled}
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
