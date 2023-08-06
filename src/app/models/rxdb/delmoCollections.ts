import { RxCollection } from 'rxdb';
import { AppDocType } from './schemas/app';
import { KeyDocType } from './schemas/key';
import { NidDocType } from './schemas/nid';
import { DelegationDocType } from './schemas/delegation';
import { ResponseDocType } from './schemas/response';

export type AppCollection = RxCollection<AppDocType>;
export type DelegationCollection = RxCollection<DelegationDocType>;
export type KeyCollection = RxCollection<KeyDocType>;
export type NidCollection = RxCollection<NidDocType>;
export type ResponseCollection = RxCollection<ResponseDocType>;

export type DelmoCollections = {
  apps: AppCollection;
  responses: ResponseCollection;
  delegations: DelegationCollection;
  keys: KeyCollection;
  nids: NidCollection;
};
