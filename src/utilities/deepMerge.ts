/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: unknown): item is object {
  return typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export default function deepMerge<T, R>(target: T, source: R): T {
  const output = { ...target } as Record<string, unknown>
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject((source as Record<string, unknown>)[key])) {
        if (!(key in target)) {
          output[key] = (source as Record<string, unknown>)[key]
        } else {
          output[key] = deepMerge(
            (target as Record<string, unknown>)[key],
            (source as Record<string, unknown>)[key],
          )
        }
      } else {
        output[key] = (source as Record<string, unknown>)[key]
      }
    })
  }

  return output as T
}
