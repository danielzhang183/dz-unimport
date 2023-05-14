import type MagicString from 'magic-string'
import type { Import, InjectImportsOptions, UnimportContext } from '../types'
import { getMagicString } from './helpers'
import { detectImports } from './detect-imports'
import { addImportToCode } from './add-imports'

export async function injectImports(
  code: string | MagicString,
  id: string | undefined,
  ctx: UnimportContext,
  options?: InjectImportsOptions,
) {
  const s = getMagicString(code)
  const { isCJSContext, matchedImports, firstOccurrence } = await detectImports(s, ctx, options)
  const imports = await resolveImports(ctx.resolveId, matchedImports, id)

  return {
    ...addImportToCode(s, imports, isCJSContext, options?.mergeExisting, options?.injectAtEnd, firstOccurrence),
    imports,
  }
}

async function resolveImports(
  resolveId: UnimportContext['resolveId'],
  imports: Import[],
  id: string | undefined,
) {
  const resolveCache = new Map<string, string>()
  const _imports = await Promise.all(imports.map(async (i) => {
    if (!resolveCache.has(i.from))
      resolveCache.set(i.from, await resolveId?.(i.from, id) || i.from)
    const from = resolveCache.get(i.from)!
    // reference to self
    if (i.from === id || !from || from === '.' || from === id)
      return

    return <Import>{
      ...i,
      from,
    }
  }))

  return _imports.filter(Boolean) as Import[]
}
