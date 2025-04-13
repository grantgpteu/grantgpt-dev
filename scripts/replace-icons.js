const fs = require('fs');
const path = require('path');

const iconsFilePath = path.join(__dirname, '..', 'web', 'src', 'components', 'icons', 'icons.tsx');
const grantGptSvgPath = path.join(__dirname, '..', 'web', 'public', 'logo.svg');
const fixedLogoPath = path.join(__dirname, '..', 'web', 'src', 'components', 'logo', 'FixedLogo.tsx'); // Path for "Powered by" text

console.log(`Reading icons file: ${iconsFilePath}`);
console.log(`Reading GrantGPT SVG file: ${grantGptSvgPath}`);
console.log(`Reading FixedLogo file: ${fixedLogoPath}`);

try {
  let iconsFileContent = fs.readFileSync(iconsFilePath, 'utf8');
  const grantGptSvgContent = fs.readFileSync(grantGptSvgPath, 'utf8');
  let fixedLogoContent = fs.readFileSync(fixedLogoPath, 'utf8');

  // 1. Extract the core path data from the GrantGPT SVG
  //    We need the content *inside* the main <svg> tag
  const svgContentMatch = grantGptSvgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  if (!svgContentMatch || !svgContentMatch[1]) {
    throw new Error('Could not extract content from GrantGPT SVG file.');
  }
  const grantGptPaths = svgContentMatch[1].trim();
  // Escape backticks and dollar signs for template literal insertion
  const escapedGrantGptPaths = grantGptPaths.replace(/`/g, '\\`').replace(/\$/g, '\\$');

  console.log("Successfully extracted GrantGPT SVG paths.");

  // 2. Replace OnyxIcon SVG content
  const onyxIconRegex = /(export const OnyxIcon = \([\s\S]*?=>\s*\([\s\S]*?<svg[^>]*>)([\s\S]*?)(<\/svg>\s*?\);?\s*};)/m;
  if (iconsFileContent.match(onyxIconRegex)) {
    iconsFileContent = iconsFileContent.replace(
      onyxIconRegex,
      `$1\n        ${escapedGrantGptPaths}\n      $3`
    );
    console.log("Replaced OnyxIcon SVG content.");
  } else {
    console.warn("OnyxIcon definition not found or pattern mismatch.");
  }

  // 3. Replace OnyxLogoTypeIcon SVG with a simple span
  const onyxLogoTypeRegex = /(export const OnyxLogoTypeIcon = \([\s\S]*?=>\s*\()([\s\S]*?)(\);?\s*};)/m;
  const logoTypeText = "GrantGPT"; // Or potentially read from enterprise settings if needed later
  const logoTypeReplacement = `
    <span
      style={{ fontSize: size ? \`\${size / 5}px\` : '1rem', fontWeight: 'bold' }} // Basic styling
      className={className}
    >
      ${logoTypeText}
    </span>
  `;
  // Escape backticks and dollar signs for template literal insertion
  const escapedLogoTypeReplacement = logoTypeReplacement.replace(/`/g, '\\`').replace(/\$/g, '\\$');

  if (iconsFileContent.match(onyxLogoTypeRegex)) {
    iconsFileContent = iconsFileContent.replace(
      onyxLogoTypeRegex,
      `$1${escapedLogoTypeReplacement}$3`
    );
    console.log("Replaced OnyxLogoTypeIcon with text span.");
  } else {
    console.warn("OnyxLogoTypeIcon definition not found or pattern mismatch.");
  }

  // Write the modified icons file content
  fs.writeFileSync(iconsFilePath, iconsFileContent, 'utf8');
  console.log(`Successfully updated ${iconsFilePath}`);

  // 4. Replace "Powered by Onyx" in FixedLogo.tsx
  const poweredByRegex = /Powered by Onyx/g;
  if (fixedLogoContent.match(poweredByRegex)) {
    fixedLogoContent = fixedLogoContent.replace(poweredByRegex, 'Powered by GrantGPT');
    fs.writeFileSync(fixedLogoPath, fixedLogoContent, 'utf8');
    console.log(`Successfully updated "Powered by" text in ${fixedLogoPath}`);
  } else {
     console.warn(`"Powered by Onyx" text not found in ${fixedLogoPath}`);
  }

} catch (error) {
  console.error("Error during icon replacement:", error);
  process.exit(1);
}
