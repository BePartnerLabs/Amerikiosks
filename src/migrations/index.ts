import * as migration_20260601_174356 from './20260601_174356'
import * as migration_20260601_184027 from './20260601_184027'

export const migrations = [
  {
    up: migration_20260601_174356.up,
    down: migration_20260601_174356.down,
    name: '20260601_174356',
  },
  {
    up: migration_20260601_184027.up,
    down: migration_20260601_184027.down,
    name: '20260601_184027',
  },
]
