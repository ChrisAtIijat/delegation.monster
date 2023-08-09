import { Event, EventTemplate } from '@iijat-sw/nip46';

declare global {
  interface Window {
    nostr?: {
      getPublicKey: () => Promise<string>;
      signEvent: (event: EventTemplate) => Promise<Event>;
    };
  }
}
