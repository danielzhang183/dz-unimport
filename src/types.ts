export interface UnimportOptions {
  exclude: string[]
}

export interface Import {
  /**
   * Export name to be imported
   */
  name: string
  /**
   * Import as this name
   */
  as: string
  /**
   * Module specifier to import from
   */
  from: string
  /**
   * Disable auto import
   */
  disabled?: boolean
}

export interface AutoImportContext {
  autoImports: never[]
  map: Map<string, Import>
  matchRE: RegExp
  transform: {
    exclude: string[] | RegExp[]
  }
}
