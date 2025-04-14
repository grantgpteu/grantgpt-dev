"use client";

import React, { useContext } from "react";
import { SettingsContext } from "@/components/settings/SettingsProvider";

interface LoginTextProps {
  enterpriseName: string;
}

export const LoginText = ({ enterpriseName }: LoginTextProps) => {
  return (
    <>
      Log In to{" "}
      {enterpriseName || "GrantGPT"}
    </>
  );
};
