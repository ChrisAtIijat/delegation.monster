import { NostrHelper } from '../common/nostr/nostrHelper';

export interface NostrConnectMetadata {
  name: string;
  url?: string;
  descriptions?: string;
  icons?: string[];
}

/**
 * Deconstructs a Nostr Connect URI.
 *
 * https://github.com/nostr-protocol/nips/blob/master/46.md
 */
export class NostrConnect {
  readonly relay: string;
  readonly metadata: NostrConnectMetadata;

  constructor(relay: string, metadata: NostrConnectMetadata) {
    this.relay = relay;
    this.metadata = metadata;
  }

  static fromUri(nostrConnectUri: string): NostrConnect | undefined {
    // Retrieve the pubkey from the uri.
    const firstPartRegEx = /^nostrconnect:\/\/[a-f0-9]{64}\?/i;

    const firstPart = nostrConnectUri.match(firstPartRegEx)?.[0];
    if (!firstPart) {
      return undefined;
    }

    const pubkey = firstPart.match(/[a-f0-9]{64}/i)?.[0];
    if (!pubkey) {
      return undefined;
    }

    // Check if the pubkey is valid.
    const pubkeyObject = NostrHelper.getNostrPubkeyObject(pubkey);
    if (!pubkeyObject) {
      return undefined;
    }

    // Retrieve parameters from the secondPart.
    const secondPart = nostrConnectUri.toLowerCase().split(firstPart)[1];
    const params = new URLSearchParams(secondPart);

    // Get the "relay" param.
    const relay = params.get('relay');

    // Ge the "metadata" param.
    const metadataString = params.get('metadata');

    if (!relay || !metadataString) {
      return undefined;
    }

    try {
      const metadata = JSON.parse(metadataString);
      if (
        typeof metadata !== 'object' ||
        typeof metadata.name === 'undefined'
      ) {
        return undefined;
      }

      return new NostrConnect(relay, metadata);
    } catch (error) {
      return undefined;
    }
  }
}
