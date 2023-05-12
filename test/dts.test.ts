import { describe, expect, it } from 'vitest'
import { toTypeDeclarationFile, toTypeReExports } from '../src/utils'
import type { Import } from '../src'

describe('dts', () => {
  const imports = [
    { name: 'default', from: 'default', as: 'customDefault' },
    { name: 'foobar', from: 'foobar', as: 'foobar' },
  ]

  it('basic', () => {
    expect(toTypeDeclarationFile(imports))
      .toMatchInlineSnapshot(`
        "export {}
        declare global {
          const customDefault: typeof import('default')['default']
          const foobar: typeof import('foobar')['foobar']
        }"
      `)

    expect(toTypeDeclarationFile(
      imports,
      { exportHelper: false },
    )).not.contain('export {}')

    expect(toTypeDeclarationFile(
      imports,
      { resolvePath: (_import: Import) => `./fixtures/composables/${_import.from}` },
    )).toMatchInlineSnapshot(`
      "export {}
      declare global {
        const customDefault: typeof import('./fixtures/composables/default')['default']
        const foobar: typeof import('./fixtures/composables/foobar')['foobar']
      }"
    `)
  })

  it('reExport', () => {
    expect(toTypeReExports(imports))
      .toMatchInlineSnapshot(`
        "// for type re-export
        declare global {
          // @ts-ignore
          export type { default as customDefault } from 'default'
          // @ts-ignore
          export type { foobar } from 'foobar'
        }"
      `)
  })
})
