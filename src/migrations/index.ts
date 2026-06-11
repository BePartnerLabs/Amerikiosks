import * as migration_20260611_030447 from './20260611_030447'
import * as migration_20260611_164448 from './20260611_164448'

export const migrations = [
  {
    up: migration_20260611_030447.up,
    down: migration_20260611_030447.down,
    name: '20260611_030447',
  },
  {
    up: migration_20260611_164448.up,
    down: migration_20260611_164448.down,
    name: '20260611_164448',
  },
]
