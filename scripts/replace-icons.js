const fs = require('fs');
const path = require('path');

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

  // --- 1. Replace OnyxIcon ---
  const svgContentMatch = grantGptSvgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  if (!svgContentMatch || !svgContentMatch[1]) {
    throw new Error('Could not extract content from GrantGPT SVG file.');
  }
  const grantGptInnerSvg = svgContentMatch[1].trim();
  const escapedGrantGptInnerSvg = grantGptInnerSvg.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  console.log("Successfully extracted GrantGPT SVG inner content.");

  const onyxIconRegex = /(export const OnyxIcon = \([\s\S]*?=> \{[\s\S]*?return \(\s*<svg[^>]*>)([\s\S]*?)(<\/svg>\s*?\);?\s*};)/m;
  if (iconsFileContent.match(onyxIconRegex)) {
    // Check if it hasn't already been replaced (simple check for GrantGPT path data)
    if (!iconsFileContent.match(/fill="#ffd166"/)) { // Check for a color unique to GrantGPT logo
       iconsFileContent = iconsFileContent.replace(
         onyxIconRegex,
         `$1\n        ${escapedGrantGptInnerSvg}\n      $3`
       );
       console.log("Replaced OnyxIcon SVG content.");
    } else {
       console.log("OnyxIcon already contains GrantGPT content. Skipping replacement.");
    }
  } else {
    console.warn("OnyxIcon definition not found or pattern mismatch. Skipping OnyxIcon replacement.");
  }

  // --- 2. Replace OnyxLogoTypeIcon ---
  // Matches the entire function definition more reliably
  const onyxLogoTypeRegex = /(export const OnyxLogoTypeIcon = \([\s\S]*?=> \{[\s\S]*?return \()([\s\S]*?)(\);\s*\};)/m;
  const logoTypeText = "GrantGPT";
  // Define the *complete* valid JSX return statement
  const logoTypeReplacementJsx = `
    (
      <span
        style={{ fontSize: size ? \`\${size / 5}px\` : '1rem', fontWeight: 'bold' }}
        className={className}
      >
        ${logoTypeText}
      </span>
    )
  `;
  const escapedLogoTypeReplacementJsx = logoTypeReplacementJsx
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  if (iconsFileContent.match(onyxLogoTypeRegex)) {
     // Check if it hasn't already been replaced
     if (!iconsFileContent.includes(`>${logoTypeText}<`)) {
        iconsFileContent = iconsFileContent.replace(
          onyxLogoTypeRegex,
          `$1${escapedLogoTypeReplacementJsx}$3` // Replace group 2 (the original return content)
        );
        console.log("Replaced OnyxLogoTypeIcon with text span JSX.");
     } else {
        console.log("OnyxLogoTypeIcon already replaced with text span. Skipping replacement.");
     }
  } else {
    console.warn("OnyxLogoTypeIcon definition not found or pattern mismatch. Skipping OnyxLogoTypeIcon replacement.");
  }

  // Write the modified icons file content
  fs.writeFileSync(iconsFilePath, iconsFileContent, 'utf8');
  console.log(`Successfully updated ${iconsFilePath}`);

  // --- 3. Replace "Powered by Onyx" in FixedLogo.tsx ---
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
