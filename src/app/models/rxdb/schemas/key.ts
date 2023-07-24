import { RxJsonSchema } from 'rxdb';

export enum KeyDocTypeUsage {
  Signer = 'signer',
  User = 'user',
}

export type KeyDocType = {
  id: string;
  nid: number;
  pubkey: string;
  privkey: string;
  usage: KeyDocTypeUsage.Signer | KeyDocTypeUsage.User; // 'signer', 'user'
  nick: string; // something to identity the key for the user
  createdAt: string;
};

export const keySchema: RxJsonSchema<KeyDocType> = {
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    nid: {
      type: 'number',
    },
    pubkey: {
      type: 'string',
    },
    privkey: {
      type: 'string',
    },
    usage: {
      type: 'string',
    },
    nick: {
      type: 'string',
    },
    createdAt: {
      type: 'string',
    },
  },
  required: ['id', 'nid', 'pubkey', 'privkey', 'usage', 'nick', 'createdAt'],
  encrypted: ['privkey'],
};
