import MagicString from 'magic-string'
import { resolvePath } from 'mlly'

export function getString(code: string | MagicString) {
  if (typeof code === 'string')
    return code
  return code.toString()
}

export function getMagicString(code: string | MagicString) {
  if (typeof code === 'string')
    return new MagicString(code)
  return code
}

export function resolveIdAbsolute(id: string, parentId?: string) {
  return resolvePath(id, {
    url: parentId,
  })
}
