export type NostrPubkeyObject = {
  hex: string;
  npub: string;
};

export type NostrPrivkeyObject = {
  hex: string;
  nsec: string;
};

export type DelegationRequest = {
  delegateePubkey: string;
  kinds: number[];
  until?: number;
  since?: number;
};
