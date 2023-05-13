import type MagicString from 'magic-string'
import type { StaticImport } from 'mlly'
import { findStaticImports } from 'mlly'
import type { Import } from '../types'
import { toImports } from './to-imports'
import { getMagicString } from './helpers'
import { stringifyImportAlias } from './import-helpers'

export function addImportToCode(
  code: string | MagicString,
  imports: Import[],
  isCJS = false,
  mergeExisting = false,
  injectAtLast = false,
  firstOccurrence = Infinity,
) {
  let newImports: Import[] = []
  const s = getMagicString(code)

  let _staticImports: StaticImport[] | undefined
  function findStaticImportsLazy() {
    if (!_staticImports)
      _staticImports = findStaticImports(s.original)
    return _staticImports
  }

  if (mergeExisting && !isCJS) {
    const existingImports = findStaticImportsLazy()
    const map = new Map<StaticImport, Import[]>()

    imports.forEach((i) => {
      const target = existingImports.find(e => e.specifier === i.from && e.imports.startsWith('{'))
      if (!target)
        return newImports.push(i)
      if (!map.has(target))
        map.set(target, [])
      map.get(target)!.push(i)
    })

    for (const [target, items] of map.entries()) {
      const strings = items.map(i => `${stringifyImportAlias(i)}, `)
      const importLength = target.code.match(/^\s*import\s*{/)?.[0]?.length
      if (importLength)
        s.appendLeft(target.start + importLength, ` ${strings.join('').trim()}`)
    }
  }
  else {
    newImports = imports
  }

  const newEntries = toImports(newImports, isCJS)
  if (newEntries) {
    const insertionIndex = injectAtLast
      ? findStaticImportsLazy().reverse().find(i => i.end <= firstOccurrence)?.end ?? 0
      : 0

    if (insertionIndex === 0)
      s.prepend(`${newEntries}\n`)

    else
      s.appendRight(insertionIndex, `\n${newEntries}\n`)
  }

  return {
    s,
    get code() { return s.toString() },
  }
}
