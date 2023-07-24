import { RxJsonSchema } from 'rxdb';

export type AppDocType = {
  id: string;
  nostrConnectUri: string;
  pubkey: string; // the public key of the app
  relay: string;
  metadata: {
    name: string;
    url?: string;
    description?: string;
    icons?: string[];
  };
  lastKeyId?: string;
};

export const appSchema: RxJsonSchema<AppDocType> = {
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    nostrConnectUri: {
      type: 'string',
    },
    pubkey: {
      type: 'string',
    },
    relay: {
      type: 'string',
    },
    metadata: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        url: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        icons: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      required: ['name'],
    },
    lastKeyId: {
      type: 'string',
    },
  },
  required: ['id', 'nostrConnectUri', 'pubkey', 'relay', 'metadata'],
};
