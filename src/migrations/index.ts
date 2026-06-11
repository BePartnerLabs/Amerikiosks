import * as migration_20260611_030033 from './20260611_030033'

export const migrations = [
  {
    up: migration_20260611_030033.up,
    down: migration_20260611_030033.down,
    name: '20260611_030033',
  },
]
