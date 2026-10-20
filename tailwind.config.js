// Picked up automatically by the Angular builder. JIT generates only the utilities that
// appear in the content files below, instead of shipping the full prebuilt
// tailwindcss/dist/utilities.min.css (~2.8 MB) in libraries.css.

// grid-layout builds these at runtime (`${responsiveSuffix}:${sizeSuffix}`, `p-${gutter}`,
// `-mx-${gutter}`), so they never appear literally in source and must be safelisted.
const screens = ['sm', 'md', 'lg', 'xl']
const widths = [...Array.from({ length: 11 }, (_, i) => `w-${i + 1}/12`), 'w-full']
const spacing = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12']

// Prebuilt @sunbird-cb packages carry templates as escaped JS strings
// (class=\"form-section md:col-span-7\"), and the default extractor keeps the trailing
// backslash, so `md:col-span-7\` never matches. Turn the escapes into whitespace first.
const unescapeJs = content => content.replace(/\\[nrt"'`]/g, ' ')

module.exports = {
  mode: 'jit',
  purge: {
    content: [
      './src/**/*.{html,ts}',
      './project/**/*.{html,ts}',
      './library/**/*.{html,ts}',
      './node_modules/@sunbird-cb/**/*.{html,mjs,js}',
    ],
    transform: {
      mjs: unescapeJs,
      js: unescapeJs,
    },
    safelist: [
      ...widths,
      ...screens.flatMap(s => widths.map(w => `${s}:${w}`)),
      ...spacing.flatMap(n => [`p-${n}`, `-mx-${n}`]),
    ],
  },
  darkMode: false,
  // The prebuilt dist files never included preflight; keep it off so base styles don't change.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
