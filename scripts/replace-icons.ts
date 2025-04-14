import * as fs from 'fs';
import * as path from 'path';

// CommonJS compatible directory resolution
const __dirname = path.resolve();

const iconsFilePath = path.join(__dirname, '..', 'web', 'src', 'components', 'icons', 'icons.tsx');
const grantGptSvgPath = path.join(__dirname, '..', 'web', 'public', 'logo.svg');
const fixedLogoPath = path.join(__dirname, '..', 'web', 'src', 'components', 'logo', 'FixedLogo.tsx');

console.log(`Reading icons file: ${iconsFilePath}`);
console.log(`Reading GrantGPT SVG file: ${grantGptSvgPath}`);
console.log(`Reading FixedLogo file: ${fixedLogoPath}`);

try {
  let iconsFileContent = fs.readFileSync(iconsFilePath, 'utf8');
  const grantGptSvgContent = fs.readFileSync(grantGptSvgPath, 'utf8');
  let fixedLogoContent = fs.readFileSync(fixedLogoPath, 'utf8');

  // 1. Extract the core path data from the GrantGPT SVG
  const svgContentMatch = grantGptSvgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  if (!svgContentMatch || !svgContentMatch[1]) {
    throw new Error('Could not extract content from GrantGPT SVG file.');
  }
  // Get everything inside the <svg> tag, including paths, defs, etc.
  const grantGptInnerSvg = svgContentMatch[1].trim();
  // Escape special characters for safe string insertion
  const escapedGrantGptInnerSvg = grantGptInnerSvg
    .replace(/[`$\\]/g, '\\$&')
    .replace(/"/g, '\\"')
    .trim();

  console.log("Successfully extracted GrantGPT SVG paths.");

  // 2. Replace OnyxIcon SVG content - More robust regex
  // Matches the entire function definition more reliably
  const onyxIconRegex = /(export const OnyxIcon = \({[^}]*}: IconProps\) => \{\s*return \(\s*<svg[^>]*?(?:width="[^"]*"|height="[^"]*"|className={[^}]*})*>)([^]*?)(<\/svg>\s*\);\s*\};)/m;

  if (iconsFileContent.match(onyxIconRegex)) {
    // Replace only the content between the <svg> tags
    iconsFileContent = iconsFileContent.replace(
      onyxIconRegex,
      `$1\n        ${escapedGrantGptInnerSvg}\n      $3`
    );
    console.log("Replaced OnyxIcon SVG content.");
  } else {
    console.warn("OnyxIcon definition not found or pattern mismatch. Skipping OnyxIcon replacement.");
  }

  // 3. Replace OnyxLogoTypeIcon's returned JSX with a simple span
  // Matches the entire function definition more reliably
  const onyxLogoTypeRegex = /(export const OnyxLogoTypeIcon = \({[^}]*}: IconProps\) => \{\s*return)(?:\s*\()([^]*?)(\)\s*;\s*\};)/m;
  const logoTypeText = "GrantGPT";
  // Return proper JSX for the component
  const logoTypeReplacementJsx = '<span style={{ fontSize: size ? Math.floor(size/5) + "px" : "1rem", fontWeight: "bold" }} className={className}>GrantGPT</span>';

  if (iconsFileContent.match(onyxLogoTypeRegex)) {
    // Replace the entire return (...) block content
    iconsFileContent = iconsFileContent.replace(
      onyxLogoTypeRegex,
      `$1 (${logoTypeReplacementJsx})$3`
    );
    console.log("Replaced OnyxLogoTypeIcon with text span JSX.");
  } else {
    console.warn("OnyxLogoTypeIcon definition not found or pattern mismatch. Skipping OnyxLogoTypeIcon replacement.");
  }

  // Write the modified icons file content
  fs.writeFileSync(iconsFilePath, iconsFileContent, 'utf8');
  console.log(`Successfully updated ${iconsFilePath}`);

  // 4. Replace "Powered by Onyx" in FixedLogo.tsx
  const poweredByRegex = />\s*Powered by Onyx\s*</g; // Target the text node more specifically
  if (fixedLogoContent.match(poweredByRegex)) {
    fixedLogoContent = fixedLogoContent.replace(poweredByRegex, '>Powered by GrantGPT<');
    fs.writeFileSync(fixedLogoPath, fixedLogoContent, 'utf8');
    console.log(`Successfully updated "Powered by" text in ${fixedLogoPath}`);
  } else {
     console.warn(`"Powered by Onyx" text not found in ${fixedLogoPath}. It might have already been changed.`);
  }

} catch (error) {
  console.error("Error during icon/text replacement:", error);
  process.exit(1);
}
