import * as migration_20260611_030447 from './20260611_030447'

export const migrations = [
  {
    up: migration_20260611_030447.up,
    down: migration_20260611_030447.down,
    name: '20260611_030447',
  },
]
