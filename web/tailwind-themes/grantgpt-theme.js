// web/tailwind-themes/grantgpt-theme.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'primary': 'var(--gh-primary)',
        'secondary': 'var(--gh-secondary)',
        'background': 'var(--gh-background)',
        'foreground': 'var(--gh-text-primary)',
        'foreground-secondary': 'var(--gh-text-secondary)',
        'foreground-subtitle': 'var(--gh-text-subtitle)',
        'highlight': 'var(--gh-text-highlight)',
        'lavender': 'var(--gh-lavender)',
        'teal': 'var(--gh-teal)',
      },
      fontFamily: {
        'proxima-nova-bold': ['Proxima Nova Bold', 'sans-serif'],
        'proxima-nova-medium': ['Proxima Nova Medium', 'sans-serif'],
        'inter-regular': ['Inter Regular', 'sans-serif'],
        'inter-semibold': ['Inter Semibold', 'sans-serif'],
      },
      borderRadius: {
        md: '6px',
      },
    },
  },
};
