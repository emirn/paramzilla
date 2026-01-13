import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

const production = !process.env.ROLLUP_WATCH;

export default [
  // Main builds (UMD + ESM)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/paramzilla.js',
        format: 'umd',
        name: 'Paramzilla',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: 'dist/paramzilla.esm.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
    ],
  },
  // Minified UMD build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/paramzilla.min.js',
      format: 'umd',
      name: 'Paramzilla',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
      production &&
        terser({
          compress: {
            drop_console: false,
            pure_funcs: [], // Keep console.log for debug mode
          },
          mangle: {
            properties: false,
          },
          format: {
            comments: false,
          },
        }),
    ],
  },
  // TypeScript declarations
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/paramzilla.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
