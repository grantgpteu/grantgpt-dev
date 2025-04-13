var merge = require("lodash/merge");

// Use relative paths for imports
const baseThemes = require("./tailwind-themes/tailwind.config.js");

let customThemes = null;
const themeName = process.env.NEXT_PUBLIC_THEME;

if (themeName) {
  try {
    // Construct the path dynamically but safely
    const themePath = `./tailwind-themes/custom/${themeName}/tailwind.config.js`;
    customThemes = require(themePath);
    console.log(`Successfully loaded custom theme: ${themeName}`);
  } catch (e) {
    console.warn(`Custom Tailwind config for theme "${themeName}" not found at ./tailwind-themes/custom/${themeName}/. Using base configuration only. Error: ${e.message}`);
    // Keep customThemes as null, baseThemes will be used
  }
}

/** @type {import('tailwindcss').Config} */
module.exports = customThemes ? merge({}, baseThemes, customThemes) : baseThemes; // Use merge({}) for safer merging
