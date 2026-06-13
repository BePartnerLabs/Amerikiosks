import * as migration_20260611_030447 from './20260611_030447';
import * as migration_20260611_164448 from './20260611_164448';
import * as migration_20260611_164757 from './20260611_164757';
import * as migration_20260611_171403 from './20260611_171403';
import * as migration_20260611_215117 from './20260611_215117';
import * as migration_20260611_225904 from './20260611_225904';
import * as migration_20260613_023047 from './20260613_023047';
import * as migration_20260613_155214 from './20260613_155214';

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
  {
    up: migration_20260611_164757.up,
    down: migration_20260611_164757.down,
    name: '20260611_164757',
  },
  {
    up: migration_20260611_171403.up,
    down: migration_20260611_171403.down,
    name: '20260611_171403',
  },
  {
    up: migration_20260611_215117.up,
    down: migration_20260611_215117.down,
    name: '20260611_215117',
  },
  {
    up: migration_20260611_225904.up,
    down: migration_20260611_225904.down,
    name: '20260611_225904',
  },
  {
    up: migration_20260613_023047.up,
    down: migration_20260613_023047.down,
    name: '20260613_023047',
  },
  {
    up: migration_20260613_155214.up,
    down: migration_20260613_155214.down,
    name: '20260613_155214'
  },
];
