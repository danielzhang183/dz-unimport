import type { Import, TypeDeclarationOptions } from '../types'

export function toTypeDeclarationFile(imports: Import[], options?: TypeDeclarationOptions) {
  const items = toTypeDeclarationItems(imports, options)
  const {
    exportHelper = true,
  } = options || {}

  let declaration = ''
  if (exportHelper)
    declaration += 'export {}\n'

  declaration += `declare global {\n${items.map(i => `  ${i}`).join('\n')}\n}`
  return declaration
}

export function toTypeDeclarationItems(imports: Import[], options?: TypeDeclarationOptions) {
  return imports
    .map((i) => {
      const from = (options?.resolvePath)?.(i) || (i.from).replace(/\.ts$/, '')
      return `const ${i.as}: typeof import('${from}')${i.name !== '*' ? `['${i.name}']` : ''}`
    })
    .sort()
}

export function toTypeReExports(imports: Import[], options?: TypeDeclarationOptions) {
  const importsMap = new Map<string, Import[]>()
  imports.forEach((i) => {
    const from = (options?.resolvePath)?.(i) || i.from
    if (!importsMap.has(from))
      importsMap.set(from, [])
    importsMap.get(from)!.push(i)
  })

  const code = Array.from(importsMap.entries())
    .flatMap(([from, imports]) => {
      const names = imports.map((i) => {
        let name = i.name === '*' ? 'default' : i.name
        if (i.as && i.as !== name)
          name += ` as ${i.as}`
        return name
      })

      return [
        '// @ts-ignore',
        `export type { ${names.join(', ')} } from '${from}'`,
      ]
    })

  return `// for type re-export\ndeclare global {\n${code.map(i => `  ${i}`).join('\n')}\n}`
}
