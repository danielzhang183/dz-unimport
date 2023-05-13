import { resolveBuiltinPresets } from './preset'
import type { BuiltinPresetName } from './presets'
import { scanExports, scanFilesFromDir } from './scan-dirs'
import type { ScanDirExportsOptions } from './scan-dirs'
import type { Import, ModuleId, Preset, Thenable, TypeDeclarationOptions } from './types'
import { dedupeImports, normalizeImports, toExports, toTypeDeclarationFile, toTypeReExports } from './utils'

export type Unimport = ReturnType<typeof createUnimport>

export interface UnimportOptions {
  /**
   * Auto import items
   */
  imports: Import[]
  /**
   * Auto import preset
   */
  presets: (BuiltinPresetName | Preset)[]
  /**
   * Directories to scan for auto import
   * @default []
   */
  dirs?: string[]
  /**
   * Options for scanning directories for auto import
   */
  dirsScanOptions?: ScanDirExportsOptions
  /**
   * Custom warning function
   * @default console.warn
   */
  warn: (msg: string) => string
}

export interface UnimportContext {
  options: Partial<UnimportOptions>
  staticImports: Import[]
  dynamicImports: Import[]
  getImports(): Promise<Import[]>
  getImportMap(): Promise<Map<string, Import>>
  invalidate(): void
}

export function createUnimport(options: Partial<UnimportOptions>) {
  let _combinedImports: Import[] | undefined
  const _map = new Map<ModuleId, Import>()

  const ctx: UnimportContext = {
    options,
    staticImports: [...(options.imports || [])].filter(Boolean),
    dynamicImports: [],
    async getImports() {
      await resolvePromise
      return updateImports()
    },
    async getImportMap() {
      await ctx.getImports()
      return _map
    },
    invalidate() {
      _combinedImports = undefined
    },
  }

  // Resolve presets
  const resolvePromise = resolveBuiltinPresets(options.presets || [])
    .then((r) => {
      ctx.staticImports.unshift(...r)
      _combinedImports = undefined
      updateImports()
    })

  function updateImports() {
    if (!_combinedImports) {
      const imports = normalizeImports(dedupeImports(
        [...ctx.staticImports, ...ctx.dynamicImports],
        options.warn || console.warn,
      ))
        .filter(i => !i.disabled)

      _map.clear()
      for (const _import of imports) {
        if (!_import.type)
          _map.set(_import.as ?? _import.name, _import)
      }

      _combinedImports = imports
    }

    return _combinedImports
  }

  async function modifyDynamicImports(fn: (imports: Import[]) => Thenable<void | Import[]>) {
    const result = await fn(ctx.dynamicImports)
    if (Array.isArray(result))
      ctx.dynamicImports = result
    ctx.invalidate()
  }

  function clearDynamicImports() {
    ctx.dynamicImports.length = 0
    ctx.invalidate()
  }

  async function scanImportsFromFile(filepath: string) {
    const additions = await scanExports(filepath)
    await modifyDynamicImports(imports => imports.filter(i => i.from !== filepath).concat(additions))
    return additions
  }

  async function generateTypeDeclarations(options?: TypeDeclarationOptions) {
    const opts: TypeDeclarationOptions = {
      resolvePath: i => i.from,
      ...options,
    }
    const {
      typeReExports = true,
    } = options || {}
    const imports = await ctx.getImports()
    let dts = toTypeDeclarationFile(imports.filter(i => !i.type), opts)
    const typeOnly = imports.filter(i => i.type)
    if (typeReExports && typeOnly.length)
      dts += `\n${toTypeReExports(typeOnly, opts)}`

    return dts
  }

  async function scanImportsFromDir(dirs = ctx.options.dirs || [], options = ctx.options.dirsScanOptions) {
    const files = await scanFilesFromDir(dirs, options)
    return (await Promise.all(files.map(scanImportsFromFile))).flat()
  }

  async function init() {
    if (ctx.options.dirs?.length)
      await scanImportsFromDir()
  }

  // Public(expose) API
  return {
    init,
    scanImportsFromDir,
    scanImportsFromFile,
    getImports: () => ctx.getImports(),
    getImportMap: () => ctx.getImportMap(),
    modifyDynamicImports,
    clearDynamicImports,
    toExports: async (filepath?: string) => toExports(await ctx.getImports(), filepath),
    generateTypeDeclarations: (options?: TypeDeclarationOptions) => generateTypeDeclarations(options),
  }
}
