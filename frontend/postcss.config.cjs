const plugins = {};
try {
  // only load tailwindcss if it's installed in this environment
  // this allows the project to run without tailwind present
  require.resolve('tailwindcss');
  plugins['tailwindcss'] = {};
} catch (e) {
  // tailwind not installed — skip
}

plugins['autoprefixer'] = {};

module.exports = { plugins };
