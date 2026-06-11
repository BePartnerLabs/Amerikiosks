import * as migration_20260610_190233_initial from './20260610_190233_initial'
import * as migration_20260611_020427 from './20260611_020427'
import * as migration_20260611_024605 from './20260611_024605'

export const migrations = [
  {
    up: migration_20260610_190233_initial.up,
    down: migration_20260610_190233_initial.down,
    name: '20260610_190233_initial',
  },
  {
    up: migration_20260611_020427.up,
    down: migration_20260611_020427.down,
    name: '20260611_020427',
  },
  {
    up: migration_20260611_024605.up,
    down: migration_20260611_024605.down,
    name: '20260611_024605',
  },
]
