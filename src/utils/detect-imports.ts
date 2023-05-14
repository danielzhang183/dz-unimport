import type MagicString from 'magic-string'
import { stripLiteral } from 'strip-literal'
import { detectSyntax } from 'mlly'
import type { Import, InjectImportsOptions, UnimportContext } from '../types'
import { getMagicString } from './helpers'

export const excludeRE = [
  // imported/exported from other module
  /\b(import|export)\b([\s\w_$*{},]+)\sfrom\b/gs,
  // defined as function
  /\bfunction\s*([\w_$]+?)\s*\(/gs,
  // defined as class
  /\bclass\s*([\w_$]+?)\s*{/gs,
  // defined as local variable
  /\b(?:const|let|var)\s+?(\[.*?\]|\{.*?\}|.+?)\s*?[=;\n]/gs,
]

export const importAsRE = /^.*\sas\s+/
export const separatorRE = /[,[\]{}\n]|\bimport\b/g

/**                                                           |       |
 *                    destructing   case&ternary    non-call  |  id   |
 *                         ↓             ↓             ↓      |       | */
export const matchRE = /(^|\.\.\.|(?:\bcase|\?)\s+|[^\w_$\/)])([\w_$]+)\s*(?=[.()[\]}:;?+\-*&|`<>,\n]|\b(?:instanceof|in)\b|$)/g

const regexRE = /\/[^\s]*?(?<!\\)(?<!\[[^\]]*)\/[gimsuy]*/g

function stripCommentsAndStrings(code: string) {
  return stripLiteral(code)
    .replace(regexRE, 'new RegExp("")')
}

export async function detectImports(
  code: string | MagicString,
  ctx: UnimportContext,
  options?: InjectImportsOptions,
) {
  const s = getMagicString(code)
  // Strip comments so we don't match on them
  const original = s.original
  const strippedCode = stripCommentsAndStrings(original)
  const syntax = detectSyntax(strippedCode)
  const isCJSContext = syntax.hasCJS && !syntax.hasESM
  let matchedImports: Import[] = []

  const occurrenceMap = new Map<string, number>()

  const map = await ctx.getImportMap()
  // Auto import, search for unreferenced usages
  if (options?.autoImport !== false) {
    // Find all possible injection
    Array.from(strippedCode.matchAll(matchRE))
      .forEach((i) => {
        if (i[1] === '.')
          return null
        const end = strippedCode[i.index! + i[0].length]
        if (end === ':' && !['?', 'case'].includes(i[1].trim()))
          return null
        const name = i[2]
        const occurrence = i.index! + i[1].length
        if (occurrenceMap.get(name) || Infinity > occurrence)
          occurrenceMap.set(name, occurrence)
      })

    // Remove those already defined
    for (const regex of excludeRE) {
      for (const match of strippedCode.matchAll(regex)) {
        const segments = [...match[1]?.split(separatorRE) || [], ...match[2]?.split(separatorRE) || []]
        for (const segment of segments) {
          const identifier = segment.replace(importAsRE, '').trim()
          occurrenceMap.delete(identifier)
        }
      }
    }
  }

  // TODO: Transform virtual imports like `import { foo } from '#imports'`

  const identifiers = new Set(occurrenceMap.keys())
  matchedImports = Array.from(identifiers)
    .map((name) => {
      const item = map.get(name)
      if (item && !item.disabled)
        return item
      occurrenceMap.delete(name)
      return null
    })
    .filter(Boolean) as Import[]

  const firstOccurrence = Math.min(...Array.from(occurrenceMap.entries()).map(i => i[1]))

  return {
    s,
    strippedCode,
    isCJSContext,
    matchedImports,
    firstOccurrence,
  }
}
