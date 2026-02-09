import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        urgency: {
          overdue: '#EF4444',
          'due-today': '#EAB308',
          new: '#3B82F6',
          'on-track': '#22C55E',
          watching: '#6B7280',
          potential: '#F59E0B',
        },
      },
      minHeight: {
        tap: '44px',
      },
      minWidth: {
        tap: '44px',
      },
    },
  },
  plugins: [],
};

export default config;
