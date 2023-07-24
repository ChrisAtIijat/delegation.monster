import { bech32 } from '@scure/base';
import * as utils from '@noble/curves/abstract/utils';
import { NostrPubkeyObject } from './typeDefs';
import { secp256k1, schnorr } from '@noble/curves/secp256k1';

type NostrHexObject = {
  represents: string;
  hex: string;
};

export class NostrHelper {
  // #region Public Methods

  static generatePrivkey(): string {
    return utils.bytesToHex(secp256k1.utils.randomPrivateKey());
  }

  static getNostrPrivkeyObject(nsecORhex: string) {
    // 1. Assume we got an npriv.
    // Try to generate the hex value.
    try {
      const hexObject = this._nSomething2hexObject(nsecORhex);
      if (hexObject.represents !== 'nsec') {
        throw new Error('The provided string is NOT an nsec.');
      }

      // Everything is fine. The provided string IS an nsec.
      return {
        hex: hexObject.hex,
        nsec: nsecORhex,
      };
    } catch (error) {
      // Continue.
    }

    // 2. Assume we got an hex.
    // Try to generate the nsec.
    try {
      const nsec = NostrHelper.privkey2nsec(nsecORhex);
      return {
        hex: nsecORhex,
        nsec,
      };
    } catch (error) {
      // Continue;
    }

    throw new Error('The provided string is not a nostr key.');
  }

  static getNostrPubkeyObject(
    npubORhex: string
  ): NostrPubkeyObject | undefined {
    // 1. Assume we got an npub.
    // Try to generate the hex value.
    try {
      const hexObject = this._nSomething2hexObject(npubORhex);
      if (hexObject.represents !== 'npub') {
        throw new Error('The provided string is NOT an npub.');
      }

      // Everything is fine. The provided string IS an npub.
      return {
        hex: hexObject.hex,
        npub: npubORhex,
      };
    } catch (error) {
      // Continue.
    }

    // 2. Assume we got an hex.
    // Try to generate the npub.
    try {
      const npub = NostrHelper.pubkey2npub(npubORhex);
      return {
        hex: npubORhex,
        npub,
      };
    } catch (error) {
      // Continue;
    }

    throw undefined;
  }

  static pubkey2npub(hex: string): string {
    const data = utils.hexToBytes(hex);
    const words = bech32.toWords(data);
    return bech32.encode('npub', words, 5000);
  }

  static privkey2nsec(hex: string): string {
    const data = utils.hexToBytes(hex);
    const words = bech32.toWords(data);
    return bech32.encode('nsec', words, 5000);
  }

  static getCreatedAt(time: number | undefined = undefined) {
    if (typeof time === 'undefined') {
      time = Date.now();
    }
    return Math.floor(time / 1000);
  }

  // #endregion Public Methods

  // #region Private Methods

  private static _nSomething2hexObject(nSomething: string): NostrHexObject {
    const { prefix, words } = bech32.decode(nSomething, 5000);
    const data = new Uint8Array(bech32.fromWords(words));

    return {
      represents: prefix,
      hex: utils.bytesToHex(data),
    };
  }

  // #endregion Private Methods
}
