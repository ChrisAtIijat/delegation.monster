import { RxCollection } from 'rxdb';
import { AppDocType } from './schemas/app';
import { KeyDocType } from './schemas/key';
import { NidDocType } from './schemas/nid';

export type AppCollection = RxCollection<AppDocType>;
export type KeyCollection = RxCollection<KeyDocType>;
export type NidCollection = RxCollection<NidDocType>;

export type DelmoCollections = {
  apps: AppCollection;
  keys: KeyCollection;
  nids: NidCollection;
};
