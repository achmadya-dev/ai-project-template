/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/styles.css',
  tailwindFunctions: ['cn'],
  singleQuote: true,
  semi: false,
  trailingComma: 'all',
  printWidth: 100,
}
