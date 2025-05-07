import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const iconsFilePath = path.join(__dirname, '../../web/src/components/icons/icons.tsx');

fs.readFile(iconsFilePath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
  if (err) {
    console.error('Error reading icons.tsx:', err);
    return;
  }

  let modifiedContent = data;

  // Replace OnyxLogoTypeIcon
  const logoTypeSearch = /export const OnyxLogoTypeIcon = \({[\s\S]*?}\);/m;
  const logoTypeReplace = `export const OnyxLogoTypeIcon = ({
  size = 16,
  className = defaultTailwindCSS,
}: IconProps) => {
  const defaultLogotypeWidth = 120;
  const effectiveWidth = (size === 16 && defaultLogotypeWidth > size) ? defaultLogotypeWidth : size;
  const assumedLogotypeAspectRatio = 4; // Example, adjust if known
  const effectiveHeight = effectiveWidth / assumedLogotypeAspectRatio;

  return (
    <Image
      src="/logo.svg"
      alt="GrantGPT Logotype"
      width={effectiveWidth}
      height={effectiveHeight}
      className={className}
    />
  );
};`;
  modifiedContent = modifiedContent.replace(logoTypeSearch, logoTypeReplace);

  // Replace OnyxIcon
  const iconSearch = /export const OnyxIcon = \({[\s\S]*?}\);/m;
  const iconReplace = `export const OnyxIcon = ({
  size = 16,
  className = defaultTailwindCSS,
}: IconProps) => {
  return <LogoIcon src="/logo.svg" size={size} className={className} />;
};`;
  modifiedContent = modifiedContent.replace(iconSearch, iconReplace);

  // Add necessary imports if not already present
  if (!modifiedContent.includes("import Image from 'next/image';")) {
      modifiedContent = "import Image from 'next/image';\n" + modifiedContent;
  }
   if (!modifiedContent.includes("import { LogoIcon } from './LogoIcon';")) {
      modifiedContent = "import { LogoIcon } from './LogoIcon';\n" + modifiedContent;
  }


  fs.writeFile(iconsFilePath, modifiedContent, 'utf8', (err: NodeJS.ErrnoException | null) => {
    if (err) {
      console.error('Error writing to icons.tsx:', err);
      return;
    }
    console.log('icons.tsx updated successfully.');
  });
});
