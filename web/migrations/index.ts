import * as migration_20260827_001405_initial from "./20260827_001405_initial";

export const migrations = [
  {
    up: migration_20260827_001405_initial.up,
    down: migration_20260827_001405_initial.down,
    name: "20260827_001405_initial",
  },
];
