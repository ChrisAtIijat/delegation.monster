import { RxCollection } from 'rxdb';
import { AppDocType } from './schemas/app';
import { KeyDocType } from './schemas/key';
import { NidDocType } from './schemas/nid';
import { DelegationDocType } from './schemas/delegation';

export type AppCollection = RxCollection<AppDocType>;
export type DelegationCollection = RxCollection<DelegationDocType>;
export type KeyCollection = RxCollection<KeyDocType>;
export type NidCollection = RxCollection<NidDocType>;

export type DelmoCollections = {
  apps: AppCollection;
  delegations: DelegationCollection;
  keys: KeyCollection;
  nids: NidCollection;
};
