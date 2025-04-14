/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'proxima': ['Proxima Nova Bold', 'Proxima Nova Medium'], // For headings and titles
        'inter': ['Inter Regular', 'Inter Semibold'], // For body text and CTAs
      },
      borderRadius: {
        'md': '6px', // From design-guidelines for buttons
      },
      boxShadow: {
        'md': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'xl': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'focus': '0 0 0 2px rgba(10, 36, 99, 0.2)', // For focus states, using primary color
      },
      fontSize: {
        'base': ['16px', { lineHeight: '1.5' }],
        'lg': ['20px', { lineHeight: '1.2' }],
        'xl': ['24px', { lineHeight: '1.2' }],
      },
      fontWeight: {
        'normal': 400, // Body text
        'medium': 500, // Subheadings
        'semibold': 600, // CTAs/Highlights
        'bold': 700, // Headings
      },
    },
  },
};
