import type { Import } from '../types'

export function dedupeImports(imports: Import[], warn: (msg: string) => void) {
  const map = new Map<string, number>()
  const indexToRemove = new Set<number>()

  imports.filter(i => !i.disabled).forEach((i, idx) => {
    const name = i.as ?? i.name
    if (!map.has(name)) {
      map.set(name, idx)
      return
    }

    const other = imports[map.get(name)!]
    if (other.from === i.from) {
      indexToRemove.add(idx)
      return
    }

    const diff = (other.priority ?? 1) - (i.priority ?? 1)
    if (diff === 0)
      warn(`Duplicated imports "${name}", the one from "${other.from}" has been ignored`)

    if (diff <= 0) {
      indexToRemove.add(map.get(name)!)
      map.set(name, idx)
    }
    else {
      indexToRemove.add(idx)
    }
  })

  return imports.filter((_, index) => !indexToRemove.has(index))
}
