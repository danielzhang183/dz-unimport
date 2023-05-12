import type { InlinePreset, Preset } from './types'

/**
 * Common properties for import item and preset
 */
const commonProps: (keyof ImportCommon)[] = ['from', 'priority', 'disabled', 'meta', 'type']

export async function resolvePreset(preset: Preset) {
  const imports: Preset[] = []

  const common = {} as ImportCommon
  commonProps.forEach((i) => {
    if (i in preset) {
      // @ts-expect-error okay
      common[i] = preset[i]
    }
  })

  for (const _import of preset.imports) {
    if (typeof _import === 'string')
      imports.push({ ...common, name: _import, as: _import })
    else if (Array.isArray(_import))
      imports.push({ ...common, name: _import[0], as: _import[1] || _import[0], from: _import[2] || preset.from })
    else if ((_import as InlinePreset).imports)
      imports.push(...await resolvePreset(_import as Preset))
    else
      imports.push({ ...common, ..._import as Import })
  }

  return imports
}
