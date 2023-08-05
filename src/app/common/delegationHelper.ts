export class DelegationHelper {
  static isActive(from: number | undefined, until: number | undefined) {
    const now = new Date().getTime() / 1000;

    if (!from && !until) {
      return true;
    }

    if (!from && until) {
      return now < until;
    }

    if (from && !until) {
      return now > from;
    }

    if (from && until) {
      return now > from && now < until;
    }

    return false; // will not happen :-)
  }

  static isFuture(from: number | undefined, until: number | undefined) {
    const now = new Date().getTime() / 1000;

    if (!from && !until) {
      return false;
    }

    if (!from && until) {
      return false;
    }

    if (from && !until) {
      return now < from;
    }

    if (from && until) {
      return now < from;
    }

    return false; // will not happen :-)
  }

  static isPast(from: number | undefined, until: number | undefined) {
    const now = new Date().getTime() / 1000;

    if (!from && !until) {
      return false;
    }

    if (!from && until) {
      return now > until;
    }

    if (from && !until) {
      return false;
    }

    if (from && until) {
      return now > until;
    }

    return false; // will not happen :-)
  }
}
