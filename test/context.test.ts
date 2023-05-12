import { describe, expect, it } from 'vitest'
import { createUnimport } from '../src/context'

describe('context', () => {
  it('basic', async () => {
    const unimport = createUnimport({
      presets: [
        {
          from: 'vue',
          imports: ['ref', 'reactive', 'computed', { name: 'Ref', type: true }],
        },
      ],
    })
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
})
