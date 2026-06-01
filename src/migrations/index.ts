import * as migration_20260528_232318 from './20260528_232318';
import * as migration_20260601_000000 from './20260601_000000';

export const migrations = [
  {
    up: migration_20260528_232318.up,
    down: migration_20260528_232318.down,
    name: '20260528_232318'
  },
  {
    up: migration_20260601_000000.up,
    down: migration_20260601_000000.down,
    name: '20260601_000000'
  },
];
