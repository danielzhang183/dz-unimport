import { join, relative } from 'path'
import { describe, expect, it } from 'vitest'
import { scanDirExports, scanFilesFromDir } from '../src/scan-dirs'

describe('scan-dirs', () => {
  it('scanFilesFromDir', async () => {
    const dir = join(__dirname, './fixtures/composables')
    expect((await scanFilesFromDir(dir)))
      .toMatchInlineSnapshot(`
        [
          "/home/t04857/i/dz-unimport/test/fixtures/composables/PascalCased.ts",
          "/home/t04857/i/dz-unimport/test/fixtures/composables/foo.ts",
          "/home/t04857/i/dz-unimport/test/fixtures/composables/index.ts",
        ]
      `)
  })

  it('scanDirExports', async () => {
    const dir = join(__dirname, './fixtures/composables')
    expect((await scanDirExports(dir))
      .map(i => ({
        ...i,
        from: relative(dir, i.from),
      }))
      .sort((a, b) => a.as!.localeCompare(b.as!)),
    )
      .toMatchInlineSnapshot(`
        [
          {
            "as": "bump",
            "from": "index.ts",
            "name": "bump",
          },
          {
            "as": "foo",
            "from": "foo.ts",
            "name": "default",
          },
          {
            "as": "localA",
            "from": "index.ts",
            "name": "localA",
          },
          {
            "as": "localBAlias",
            "from": "index.ts",
            "name": "localBAlias",
          },
          {
            "as": "multiplier",
            "from": "index.ts",
            "name": "multiplier",
          },
          {
            "as": "PascalCased",
            "from": "PascalCased.ts",
            "name": "PascalCased",
          },
          {
            "as": "useDoubled",
            "from": "index.ts",
            "name": "useDoubled",
          },
        ]
      `)
  })

  it('scanDirExports nested', async () => {
    const dir = join(__dirname, './fixtures/composables')
    expect((await scanDirExports(dir, {
      filePatterns: [
        '*.{ts,js,mjs,cjs,mts,cts}',
        '*/index.{ts,js,mjs,cjs,mts,cts}',
      ],
    }))
      .map(i => relative(dir, i.from))
      .sort(),
    )
      .toContain('nested/index.ts')
  })

  it('scanDirExports star', async () => {
    const dir = join(__dirname, './fixtures/composables')
    const importsResult = (await scanDirExports(dir, {
      filePatterns: [
        'nested/bar/index.ts',
      ],
    }))
      .map(i => ({
        ...i,
        from: relative(dir, i.from),
      }))

    expect(importsResult).toMatchInlineSnapshot(`
      [
        {
          "as": "bar",
          "from": "nested/bar/index.ts",
          "name": "bar",
        },
        {
          "as": "myBazFunction",
          "from": "nested/bar/baz.ts",
          "name": "myBazFunction",
        },
        {
          "as": "myfunc1",
          "from": "nested/bar/named.ts",
          "name": "myfunc1",
        },
        {
          "as": "myfunc2",
          "from": "nested/bar/named.ts",
          "name": "myfunc2",
        },
        {
          "as": "subFoo",
          "from": "nested/bar/sub/index.ts",
          "name": "subFoo",
        },
      ]
    `)
  })

  it('scanDirs should respect dirs order', async () => {
    const firstFolder = join(__dirname, './fixtures/composables')
    const secondFolder = join(__dirname, './fixtures/composables-override')
    const options = {
      filePatterns: [
        '*.{ts,js,mjs,cjs,mts,cts}',
        '*/index.{ts,js,mjs,cjs,mts,cts}',
      ],
    }

    const [result1, result2] = await Promise.all([
      scanDirExports([firstFolder, secondFolder], options),
      scanDirExports([secondFolder, firstFolder], options),
    ])

    expect(result1.at(-1)?.from).toBe(join(secondFolder, 'foo.ts'))
    expect(result2.at(0)?.from).toBe(join(secondFolder, 'foo.ts'))
  })
})
