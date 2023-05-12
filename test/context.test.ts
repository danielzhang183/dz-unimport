import { describe, expect, it } from 'vitest'
import { createUnimport } from '../src/context'

describe('context', () => {
  const presets = [
    {
      from: 'vue',
      imports: ['ref', 'reactive', 'computed', { name: 'Ref', type: true }],
    },
  ]

  const imports = [
    { name: 'default', from: 'jquery', as: '$' },
    { name: 'foo', from: 'foo', as: 'disabled', disabled: true },
    { name: 'FOO', from: 'vue', type: true },
  ]

  it('static import', async () => {
    const unimport = createUnimport({ presets })
    expect((await unimport.getImportMap()))
      .toMatchInlineSnapshot(`
        Map {
          "ref" => {
            "as": "ref",
            "from": "vue",
            "name": "ref",
          },
          "reactive" => {
            "as": "reactive",
            "from": "vue",
            "name": "reactive",
          },
          "computed" => {
            "as": "computed",
            "from": "vue",
            "name": "computed",
          },
        }
      `)
    expect(await unimport.getImports())
      .toMatchInlineSnapshot(`
        [
          {
            "as": "ref",
            "from": "vue",
            "name": "ref",
          },
          {
            "as": "reactive",
            "from": "vue",
            "name": "reactive",
          },
          {
            "as": "computed",
            "from": "vue",
            "name": "computed",
          },
          {
            "as": "Ref",
            "from": "vue",
            "name": "Ref",
            "type": true,
          },
        ]
      `)
  })

  it('dynamic import', async () => {
    const unimport = createUnimport({ imports })
    expect((await unimport.getImportMap()))
      .toMatchInlineSnapshot(`
        Map {
          "$" => {
            "as": "$",
            "from": "jquery",
            "name": "default",
          },
        }
      `)
    expect(await unimport.getImports())
      .toMatchInlineSnapshot(`
        [
          {
            "as": "$",
            "from": "jquery",
            "name": "default",
          },
          {
            "as": "FOO",
            "from": "vue",
            "name": "FOO",
            "type": true,
          },
        ]
      `)
  })

  it('should not re-export types', async () => {
    const unimport = createUnimport({
      imports,
      presets,
    })

    expect(await unimport.getImports()).toMatchInlineSnapshot(`
      [
        {
          "as": "ref",
          "from": "vue",
          "name": "ref",
        },
        {
          "as": "reactive",
          "from": "vue",
          "name": "reactive",
        },
        {
          "as": "computed",
          "from": "vue",
          "name": "computed",
        },
        {
          "as": "Ref",
          "from": "vue",
          "name": "Ref",
          "type": true,
        },
        {
          "as": "$",
          "from": "jquery",
          "name": "default",
        },
        {
          "as": "FOO",
          "from": "vue",
          "name": "FOO",
          "type": true,
        },
      ]
    `)
  })
})
