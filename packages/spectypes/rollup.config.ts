import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import { RollupOptions } from 'rollup'

const config: readonly RollupOptions[] = [
  {
    input: 'src/index.ts',
    output: { dir: 'tmp', format: 'es', sourcemap: true },
    plugins: [typescript({ tsconfig: 'tsconfig.build.json' })]
  },
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.cjs', format: 'cjs', sourcemap: true },
      { file: 'dist/index.js', format: 'esm', sourcemap: true }
    ],
    plugins: [
      typescript({
        tsconfig: 'tsconfig.build.json',
        compilerOptions: {
          declaration: false,
          removeComments: true
        }
      })
    ]
  },
  {
    input: 'tmp/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()]
  }
]

export default config
