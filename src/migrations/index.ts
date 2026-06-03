import * as migration_20260601_174356 from './20260601_174356'
import * as migration_20260601_184027 from './20260601_184027'
import * as migration_20260602_021410 from './20260602_021410'
import * as migration_20260602_022128 from './20260602_022128'
import * as migration_20260603_132818 from './20260603_132818'
import * as migration_20260603_173934 from './20260603_173934'
import * as migration_20260603_174311 from './20260603_174311'

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
  {
    up: migration_20260602_021410.up,
    down: migration_20260602_021410.down,
    name: '20260602_021410',
  },
  {
    up: migration_20260602_022128.up,
    down: migration_20260602_022128.down,
    name: '20260602_022128',
  },
  {
    up: migration_20260603_132818.up,
    down: migration_20260603_132818.down,
    name: '20260603_132818',
  },
  {
    up: migration_20260603_173934.up,
    down: migration_20260603_173934.down,
    name: '20260603_173934',
  },
  {
    up: migration_20260603_174311.up,
    down: migration_20260603_174311.down,
    name: '20260603_174311',
  },
]
