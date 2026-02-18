import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';
import typographyPlugin from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F4F8',
          100: '#C5E3ED',
          200: '#8BC5D9',
          300: '#4FA5C2',
          400: '#2B7A9B',
          500: '#163E55',
          600: '#112F41',
          700: '#0D2433',
          800: '#091A25',
          900: '#061219',
          950: '#030A0F',
          DEFAULT: 'var(--aw-color-primary)',
        },
        secondary: 'var(--aw-color-secondary)',
        accent: {
          50: '#FFF8E8',
          100: '#FEECC0',
          200: '#FDD98A',
          300: '#F5AE3B',
          400: '#F09A0A',
          500: '#D98A0A',
          600: '#B07008',
          700: '#8A5706',
          800: '#6B4305',
          900: '#4D3003',
          DEFAULT: 'var(--aw-color-accent)',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F0F2F5',
          special: '#E4E9F2',
        },
        fdc: {
          orange: '#ED7630',
          corail: '#E64140',
          vert: '#619227',
          bleu: '#048BBE',
          violet: '#722683',
          bleuClair: '#9CD3D4',
        },
        default: 'var(--aw-color-text-default)',
        muted: 'var(--aw-color-text-muted)',
      },
      fontFamily: {
        sans: ['var(--aw-font-sans, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif, ui-serif)', ...defaultTheme.fontFamily.serif],
        heading: ['var(--aw-font-heading, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
      },

      animation: {
        fade: 'fadeInUp 1s both',
      },

      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(2rem)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    typographyPlugin,
    plugin(({ addVariant }) => {
      addVariant('intersect', '&:not([no-intersect])');
    }),
  ],
  darkMode: 'class',
};
