import type { Import } from '../types'

export function normalizeImports(imports: Import[]): Import[] {
  for (const _import of imports)
    _import.as = _import.as ?? _import.name

  return imports
}

export function stringifyImportAlias(item: Import, isCJS = false) {
  return (item.as === undefined || item.name === item.as)
    ? item.name
    : isCJS
      ? `${item.name}: ${item.as}`
      : `${item.name} as ${item.as}`
}
