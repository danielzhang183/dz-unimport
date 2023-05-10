import type { Import } from '../types'

export function toImports(imports: Import[], isCJS = false) {
  const map = toImportModuleMap(imports)
  return Object.entries(map)
    .flatMap(([name, importSet]) => {
      const entries: string[] = []
      const imports = Array.from(importSet)
        .filter((i) => {
          // handle special imports
          if (!i.name && i.as === '') {
            entries.push(
              isCJS
                ? `require('${name}')`
                : `import '${name}'`,
            )
            return false
          }
          else if (i.name === 'default') {
            entries.push(
              isCJS
                ? `const { default: ${i.as} } = require('${name}')`
                : `import ${i.as} from '${name}'`,
            )
            return false
          }
          else if (i.name === '*') {
            entries.push(
              isCJS
                ? `const ${i.as} = require('${name}')`
                : `import * as ${i.as} from '${name}'`,
            )
            return false
          }
          return true
        })

      if (imports.length) {
        const importsAs = imports.map(i => stringifyImportAlias(i, isCJS))
        entries.push(
          isCJS
            ? `const { ${importsAs.join(', ')} } = require('${name}')`
            : `import { ${importsAs.join(', ')} } from '${name}'`,
        )
      }
      return entries
    })
    .join('\n')
}

function stringifyImportAlias(item: Import, isCJS = false) {
  return (item.as === undefined || item.name === item.as)
    ? item.name
    : isCJS
      ? `${item.name}: ${item.as}`
      : `${item.name} as ${item.as}`
}

function toImportModuleMap(imports: Import[]) {
  const map: Record<string, Set<Import>> = {}
  for (const _import of imports) {
    if (!map[_import.from])
      map[_import.from] = new Set()
    map[_import.from].add(_import)
  }

  return map
}
