import type { BuiltinPresetName } from './presets'

export interface UnimportOptions {
  exclude: string[]
  presets: (BuiltinPresetName | Preset)[]
  warn: (msg: string) => string
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
