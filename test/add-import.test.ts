import { describe, expect, test } from 'vitest'
import { addImportToCode } from '../src/utils'
import type { Import } from '../src/types'

describe('addImportToCode', () => {
  const code = `
import { foo } from 'specifier1'
import { bar } from 'specifier1'
import defaultFoo from 'specifier2'
import{compact}from'specifier3'
import * as importAll from 'specifier4'
import { } from 'specifier5'
`

  const imports: Import[] = [
    { name: 'import1', from: 'specifier1' },
    { name: 'import2', from: 'specifier2' },
    { name: 'import3', from: 'specifier3' },
    { name: 'import4', from: 'specifier4' },
    { name: 'foo', as: 'import5', from: 'specifier5' },
    { name: 'import10', from: 'specifier10' },
  ]

  test('no merge', () => {
    expect(addImportToCode(code, imports, false)).toMatchInlineSnapshot('undefined')
  })

  test('merge existing', () => {
    expect(addImportToCode(code, imports, false)).toMatchInlineSnapshot('undefined')
  })
})
