import type { BuiltinPresetName } from './presets'
import type { ScanDirExportsOptions } from './scan-dirs'

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

export type ModuleId = string
export type ImportName = string

export interface ImportCommon {
  /**
   * Module specifier to import from
   */
  from: ModuleId
  /**
   * Priority of the import, if multiple imports have the same name, the one with the highest priority will be used
   *
   * @default 1
   */
  priority?: number
  /**
     * Disable auto import
     */
  disabled?: boolean
  /**
   * Metadata of the import
   */
  meta?: {
    /** Short description of the import */
    description?: string
    /** URL to the documentation */
    docsUrl?: string
    /** Additional metadata */
    [key: string]: any
  }
  /**
   * If this import is a type import
   */
  type?: boolean
}

export interface Import extends ImportCommon {
  /**
   * Export name to be imported
   */
  name: ImportName
  /**
   * Import as this name
   */
  as?: ImportName
}

export type Preset = InlinePreset

export type PresetImport = Omit<Import, 'from'> | ImportName | [name: ImportName, as?: ImportName, from?: ModuleId]

export interface InlinePreset extends ImportCommon {
  imports: (PresetImport | InlinePreset)[]
}

export interface PackagePreset {

}

export type Thenable<T> = Promise<T> | T

export type PathFromResolver = (_import: Import) => string | undefined

export interface TypeDeclarationOptions {
  /**
   * Custom resolver for path of the import
   */
  resolvePath?: PathFromResolver
  /**
   * Append `export {}` to the end of the file
   *
   * @default true
   */
  exportHelper?: boolean
  /**
   * Auto-import for type exports
   *
   * @default true
   */
  typeReExports?: boolean
}
