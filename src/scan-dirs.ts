import { dirname, extname, join, normalize, parse as parsePath, resolve } from 'path'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import fg from 'fast-glob'
import { findExports } from 'mlly'
import { camelCase } from 'scule'
import type { Import } from './types'

export interface ScanDirExportsOptions {
  /**
   * Glob patterns for matching files
   *
   * @default ['*.{ts,js,mjs,cjs,mts,cts}']
   */
  filePatterns?: string[]

  /**
   * Custom function to filter scanned files
   */
  fileFilter?: (file: string) => boolean

  /**
   * Current working directory
   *
   * @default process.cwd()
   */
  cwd?: string
}

export async function scanFilesFromDir(dir: string | string[], options?: ScanDirExportsOptions) {
  const dirs = (Array.isArray(dir) ? dir : [dir]).map(d => normalize(d))

  const filePatterns = options?.filePatterns || ['*.{ts,js,mjs,cjs,mts,cts}']
  const fileFilter = options?.fileFilter || (() => true)

  const result = await Promise.all(
    dirs.map(async i => await fg(
      [i, ...filePatterns.map(p => join(i, p))], {
        absolute: true,
        cwd: options?.cwd || process.cwd(),
        onlyFiles: true,
        followSymbolicLinks: true,
      })
      .then(r => r
        .map(f => normalize(f))
        .sort(),
      ),
    ),
  )

  return Array.from(new Set(result.flat())).filter(fileFilter)
}

export async function scanDirExports(dir: string | string[], options?: ScanDirExportsOptions) {
  const files = await scanFilesFromDir(dir, options)
  const findExports = await Promise.all(files.map(i => scanExports(i)))

  return findExports.flat()
}

const FileExtensionLookup = [
  '.mts',
  '.cts',
  '.ts',
  '.mjs',
  '.cjs',
  '.js',
]

export async function scanExports(filepath: string, seen = new Set<string>()): Promise<Import[]> {
  if (seen.has(filepath)) {
    console.warn(`[unimport] "${filepath}" is already scanned, skipping`)
    return []
  }

  seen.add(filepath)
  const imports: Import[] = []
  const code = await readFile(filepath, 'utf-8')
  const exports = findExports(code)
  const defaultExport = exports.find(i => i.type === 'default')

  if (defaultExport) {
    let name = parsePath(filepath).name
    if (name === 'index')
      name = parsePath(filepath.split('/').slice(0, -1).join('/')).name
    const as = /[-_.]/.test(name) ? camelCase(name) : name
    imports.push({ name: 'default', as, from: filepath })
  }

  for (const exp of exports) {
    if (exp.type === 'named') {
      for (const name of exp.names)
        imports.push({ name, as: name, from: filepath })
    }
    else if (exp.type === 'declaration') {
      if (exp.name)
        imports.push({ name: exp.name, as: exp.name, from: filepath })
    }
    else if (exp.type === 'star' && exp.specifier) {
      const subfile = exp.specifier
      let subfilepath = resolve(dirname(filepath), subfile)

      if (!extname(subfilepath)) {
        for (const ext of FileExtensionLookup) {
          if (existsSync(`${subfilepath}${ext}`)) {
            subfilepath = `${subfilepath}${ext}`
            break
          }
          else if (existsSync(`${subfilepath}/index${ext}`)) {
            subfilepath = `${subfilepath}/index${ext}`
            break
          }
        }
      }

      if (!existsSync(subfilepath)) {
        console.warn(`[unimport] failed to resolve "${subfilepath}", skip scanning`)
        continue
      }

      imports.push(...await scanExports(subfilepath, seen))
    }
  }

  return imports
}
