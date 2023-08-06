import { RxJsonSchema } from 'rxdb';

export enum Response {
  GetPublicKey = 'get_public_key',
  SignEvent = 'sign_event_',
}

export type ResponseDocType = {
  id: string;
  appId: string;
  response: string;
  lastKeyId: string;
  lastDelegationId?: string;
};

export const responseSchema: RxJsonSchema<ResponseDocType> = {
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    appId: {
      type: 'string',
    },
    response: {
      type: 'string',
    },
    lastKeyId: {
      type: 'string',
    },
    lastDelegationId: {
      type: 'string',
    },
  },
  required: ['id', 'appId', 'response', 'lastKeyId'],
};
