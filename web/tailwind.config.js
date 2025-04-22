var merge = require("lodash/merge");

// Use relative paths for imports
const baseThemes = require("./tailwind-themes/tailwind.config.js");

const customThemes = process.env.NEXT_PUBLIC_THEME
  ? require(
      process.env.NEXT_PUBLIC_THEME
        ? `./tailwind-themes/custom/${process.env.NEXT_PUBLIC_THEME}/tailwind.config.js`
        : "./tailwind-themes/custom/default/tailwind.config.js"
    )
  : null;

/** @type {import('tailwindcss').Config} */
const grantgptTheme = require('./tailwind-themes/grantgpt-theme.js');

module.exports = merge({}, baseThemes, grantgptTheme);
