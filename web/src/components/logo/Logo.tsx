"use client";

import Image from "next/image"; // Import Next.js Image component
// Removed unused imports:
// import { useContext } from "react";
// import { SettingsContext } from "../settings/SettingsProvider";
import { OnyxLogoTypeIcon } from "../icons/icons"; // Keep this for LogoType

export function Logo({
  height,
  width,
  className,
}: {
  height?: number;
  width?: number;
  className?: string;
  // Removed size prop as height/width are now explicit or defaulted here
}) {
  // Provide default dimensions if not passed
  const displayHeight = height || 32;
  const displayWidth = width || 32; // Adjust default width if needed for aspect ratio

  return (
    // The outer div might still be useful for positioning/styling with className
    <div
      style={{ height: displayHeight, width: displayWidth }}
      className={`flex-none relative ${className || ""}`} // Ensure className is applied
    >
      <Image
        src="/logo.svg" // Path relative to the public folder
        alt="GrantGPT Logo" // Updated Alt text
        height={displayHeight} // Use the determined height
        width={displayWidth} // Use the determined width
        style={{ objectFit: "contain" }} // Keep objectFit if needed
      />
    </div>
  );
}

// LogoType component remains unchanged, but might be unused elsewhere now
export function LogoType({
  size = "default",
}: {
  size?: "small" | "default" | "large";
}) {
  return (
    <OnyxLogoTypeIcon
      size={115}
      className={`items-center w-full dark:text-[#fff]`}
    />
  );
}