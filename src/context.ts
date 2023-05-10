import type { AutoImportContext, Import, UnimportOptions } from './types'

export function createContext(options: Partial<UnimportOptions>): AutoImportContext {
  return {
    autoImports: [],
    map: new Map<string, Import>(),
    matchRE: /__never__/,
    transform: {
      exclude: options.exclude || [/node_modules/],
    },
  }
}
