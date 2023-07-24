export enum Nip46LogLevel {
  Nip46 = 'nip46',
  Nostr = 'nostr',
  System = 'system',
}

export class Nip46Log {
  direction: 'in' | 'out';
  message: string;
  details: any;
  get detailsAsString(): string {
    if (typeof this.details === 'object') {
      return JSON.stringify(this.details, undefined, 4);
    }
    return 'na';
  }

  constructor({
    direction,
    message,
    details,
  }: {
    direction: 'in' | 'out';
    message: string;
    details?: object;
  }) {
    this.direction = direction;
    this.message = message;
    if (details) {
      this.details = details;
    }
  }
}
