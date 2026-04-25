/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D6A4F',
          light:   '#52B788',
          pale:    '#D8F3DC',
          dark:    '#245A42',
        },
        accent: {
          DEFAULT: '#E76F51',
          light:   '#F4A261',
          pale:    '#FFF0E6',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          2:       '#F5F4F0',
          3:       '#F0EDE8',
        },
        border: {
          DEFAULT: '#E8E6E1',
          light:   '#F0EDE8',
        },
        ink: {
          DEFAULT: '#1A1A2E',
          2:       '#374151',
          3:       '#6B7280',
          4:       '#9CA3AF',
        },
        success: '#2D6A4F',
        warning: '#F59E0B',
        danger:  '#DC2626',
        info:    '#3B82F6',
        // Dark mode warm tones
        dark: {
          bg:      '#1C1C1E',
          surface: '#2C2C2E',
          border:  '#3A3A3C',
          text:    '#F5F4F0',
        },
      },
      fontFamily: { sans: ['Poppins', 'system-ui', 'sans-serif'] },
      borderRadius: {
        xl:   '12px',
        '2xl':'16px',
        '3xl':'24px',
        '4xl':'32px',
      },
      boxShadow: {
        xs:   '0 1px 2px rgba(0,0,0,0.04)',
        sm:   '0 1px 3px rgba(0,0,0,0.06)',
        md:   '0 4px 12px rgba(0,0,0,0.08)',
        lg:   '0 8px 24px rgba(0,0,0,0.10)',
        xl:   '0 20px 60px rgba(0,0,0,0.15)',
        card: '0 1px 3px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
