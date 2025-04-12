module.exports = {
  plugins: [
    require('postcss-import'), // Revert to array syntax to ensure order
    require('tailwindcss'),
    require('autoprefixer'),
  ],
};
