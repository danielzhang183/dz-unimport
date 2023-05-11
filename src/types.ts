export interface UnimportOptions {
  exclude: string[]
}

export type ModuleId = string
export type ImportName = string

export interface ImportBase {
  /**
   * Module specifier to import from
   */
  from: string
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
   * If this import is a type import
   */
  type?: boolean
}

export interface Import extends ImportBase {
  /**
   * Export name to be imported
   */
  name: ImportName
  /**
   * Import as this name
   */
  as?: ImportName
}

export type Preset = InlinePreset | PackagePreset

export type PresetImport = Omit<Import, 'from'> | ImportName | [name: ImportName, as?: ImportName, from?: ModuleId]

export interface InlinePreset extends ImportBase {
  imports: (PresetImport | InlinePreset)[]
}

export interface PackagePreset {

}

export interface AutoImportContext {
  autoImports: never[]
  map: Map<string, Import>
  matchRE: RegExp
  transform: {
    exclude: string[] | RegExp[]
  }
}
