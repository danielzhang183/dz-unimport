import { isAbsolute, relative } from 'path'
import type { Import } from '../types'
import { toImportModuleMap } from './to-imports'
import { stringifyImportAlias } from './import-helpers'

export function toExports(imports: Import[], fileDir?: string) {
  const map = toImportModuleMap(imports)
  return Object.entries(map)
    .flatMap(([name, imports]) => {
      name = name.replace(/.[a-z]+$/, '')
      if (fileDir && isAbsolute(name)) {
        name = relative(fileDir, name)
        if (!name.match(/^[\.]/))
          name = `./${name}`
      }

      const entries: string[] = []
      const filtered: Import[] = Array.from(imports)
        .filter((i) => {
          if (i.name === '*') {
            entries.push(`export * as ${i.as} from '${name}'`)
            return false
          }
          return true
        })

      if (filtered.length)
        entries.push(`export { ${filtered.map(i => stringifyImportAlias(i, false)).join(', ')} } from '${name}'`)

      return entries
    })
    .join('\n')
}
