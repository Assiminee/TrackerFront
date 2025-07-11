import plugin from 'tailwindcss/plugin';

export default {
  content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,svelte}'],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('sm-screen', '@media (min-width: 640px) or (min-height: 400px)');
    }),
  ],
};
