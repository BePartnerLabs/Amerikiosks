import * as migration_20260610_190233_initial from './20260610_190233_initial'

export const migrations = [
  {
    up: migration_20260610_190233_initial.up,
    down: migration_20260610_190233_initial.down,
    name: '20260610_190233_initial',
  },
]
