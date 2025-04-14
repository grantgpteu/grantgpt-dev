import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url'; // <--- Import this
// ES Module compatible directory resolution
const __filename = fileURLToPath(import.meta.url); // Get script's own path
const __dirname = path.dirname(__filename); // Get script's directory (scripts/dist)
// Calculate paths relative to the script's directory
const projectRoot = path.resolve(__dirname, '..', '..'); // Go up two levels (from scripts/dist to repo root)
const iconsFilePath = path.join(projectRoot, 'web', 'src', 'components', 'icons', 'icons.tsx');
const grantGptSvgPath = path.join(projectRoot, 'web', 'public', 'logo.svg');
const fixedLogoPath = path.join(projectRoot, 'web', 'src', 'components', 'logo', 'FixedLogo.tsx');
// Add some debugging logs
console.log(`Script directory (__dirname): ${__dirname}`);
console.log(`Calculated project root: ${projectRoot}`);
console.log(`Attempting to read icons file: ${iconsFilePath}`);
console.log(`Attempting to read GrantGPT SVG file: ${grantGptSvgPath}`);
console.log(`Attempting to read FixedLogo file: ${fixedLogoPath}`);
try {
    // Check if file exists before reading (optional but good practice)
    if (!fs.existsSync(iconsFilePath)) {
        throw new Error(`ENOENT: icons.tsx not found at calculated path: ${iconsFilePath}`);
    }
    let iconsFileContent = fs.readFileSync(iconsFilePath, 'utf8');
    // Check if SVG file exists
    if (!fs.existsSync(grantGptSvgPath)) {
        throw new Error(`ENOENT: GrantGPT SVG not found at calculated path: ${grantGptSvgPath}`);
    }
    const grantGptSvgContent = fs.readFileSync(grantGptSvgPath, 'utf8');
    // Check if FixedLogo file exists
    if (!fs.existsSync(fixedLogoPath)) {
        throw new Error(`ENOENT: FixedLogo.tsx not found at calculated path: ${fixedLogoPath}`);
    }
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
        iconsFileContent = iconsFileContent.replace(onyxIconRegex, `$1\n        ${escapedGrantGptInnerSvg}\n      $3`);
        console.log("Replaced OnyxIcon SVG content.");
    }
    else {
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
        iconsFileContent = iconsFileContent.replace(onyxLogoTypeRegex, `$1 (${logoTypeReplacementJsx})$3`);
        console.log("Replaced OnyxLogoTypeIcon with text span JSX.");
    }
    else {
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
    }
    else {
        console.warn(`"Powered by Onyx" text not found in ${fixedLogoPath}. It might have already been changed.`);
    }
}
catch (error) {
    console.error("Error during icon/text replacement:", error);
    process.exit(1); // Ensure script exits on error
}
