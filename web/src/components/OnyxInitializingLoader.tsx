import { Logo } from "./logo/Logo";

interface OnyxInitializingLoaderProps {
  enterpriseName: string;
}

export function OnyxInitializingLoader({ enterpriseName }: OnyxInitializingLoaderProps) {

  return (
    <div className="mx-auto my-auto animate-pulse">
      <Logo height={96} width={96} className="mx-auto mb-3" />
      <p className="text-lg text-text font-semibold">
        Initializing {settings?.enterpriseSettings?.application_name ?? "GrantGPT"}
      </p>
    </div>
  );
}
