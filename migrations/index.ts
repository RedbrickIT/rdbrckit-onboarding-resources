import * as migration_20260827_001405_initial from './20260827_001405_initial';
import * as migration_20260827_212420_remove_media_uploads from './20260827_212420_remove_media_uploads';

export const migrations = [
  {
    up: migration_20260827_001405_initial.up,
    down: migration_20260827_001405_initial.down,
    name: '20260827_001405_initial',
  },
  {
    up: migration_20260827_212420_remove_media_uploads.up,
    down: migration_20260827_212420_remove_media_uploads.down,
    name: '20260827_212420_remove_media_uploads'
  },
];
