import { RxJsonSchema } from 'rxdb';

export enum NidDocTypeCol {
  Keys = 'keys',
}

export type NidDocType = {
  id: string;
  col: NidDocTypeCol;
  nid: number;
};

export const nidSchema: RxJsonSchema<NidDocType> = {
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    col: {
      type: 'string',
    },
    nid: {
      type: 'number',
    },
  },
  required: ['id', 'col', 'nid'],
};
