import { RxJsonSchema } from 'rxdb';

export type DelegationDocType = {
  id: string;
  delegateePubkey: string;
  delegatorPubkey: string;
  delegatorNick?: string;
  kinds: number[];
  from?: number;
  until?: number;
  conditions: string;
  token: string;
};

export const delegationSchema: RxJsonSchema<DelegationDocType> = {
  version: 1,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    delegateePubkey: {
      type: 'string',
    },
    delegatorPubkey: {
      type: 'string',
    },
    delegatorNick: {
      type: 'string',
    },
    kinds: {
      type: 'array',
      items: {
        type: 'integer',
      },
    },
    from: {
      type: 'integer',
    },
    until: {
      type: 'integer',
    },
    conditions: {
      type: 'string',
    },
    token: {
      type: 'string',
    },
  },
  required: [
    'id',
    'delegateePubkey',
    'delegatorPubkey',
    'kinds',
    'conditions',
    'token',
  ],
};
