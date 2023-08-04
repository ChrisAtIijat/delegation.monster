import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateTime } from 'luxon';
import { RxDocument } from 'rxdb';
import { KeyDocType, KeyDocTypeUsage } from 'src/app/models/rxdb/schemas/key';
import { MixedService } from 'src/app/services/mixed.service';
import { RxdbService } from 'src/app/services/rxdb.service';
import { nip26 } from 'nostr-tools';
import { v4 } from 'uuid';
import { DelegationDocType } from 'src/app/models/rxdb/schemas/delegation';
import { Subscription } from 'rxjs';
import { ConfirmService } from 'src/app/services/confirm.service';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { LocaleService } from 'src/app/services/locale.service';

class NewDelegation {
  canCreate = false;

  kind = 1;

  range = new FormGroup({
    from: new FormControl<Date | null>(
      DateTime.now().startOf('day').toJSDate()
    ),
    until: new FormControl<Date | null>(
      DateTime.now()
        .endOf('day')
        .plus({ seconds: -1 })
        .plus({ days: 30 })
        .toJSDate()
    ),
  });

  delegator = new FormControl<RxDocument<KeyDocType> | null>(
    null,
    Validators.required
  );
  delegatee = new FormControl<RxDocument<KeyDocType> | null>(
    null,
    Validators.required
  );

  minFrom = DateTime.now().startOf('day').toJSDate();
  minUntil = DateTime.now().startOf('day').plus({ days: 1 }).toJSDate();

  get delegationString(): string | undefined {
    if (!this.canCreate) {
      return undefined;
    }

    const kinds = `kind=${this.kind}`;
    const from = `created_at>${Math.floor(
      (this.range.controls.from.value?.getTime() ?? 0) / 1000
    )}`;
    const until = `created_at<${Math.floor(
      (this.range.controls.until.value?.getTime() ?? 0) / 1000
    )}`;

    return `nostr:delegation:${this.delegatee.value?.pubkey}:${kinds}&${from}&${until}`;
  }

  constructor() {
    this.delegator.valueChanges.subscribe(() => {
      this.evaluateCanCreate();
    });

    this.delegatee.valueChanges.subscribe(() => {
      this.evaluateCanCreate();
    });

    this.range.valueChanges.subscribe(() => {
      this.evaluateCanCreate();
    });
  }

  evaluateCanCreate(): void {
    if (this.range.invalid) {
      this.canCreate = false;
      return;
    }

    if (this.delegator.invalid) {
      this.canCreate = false;
      return;
    }

    if (this.delegatee.invalid) {
      this.canCreate = false;
      return;
    }

    if (this.delegator.value === this.delegatee.value) {
      this.canCreate = false;
      return;
    }

    this.canCreate = true;
  }
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-delegations',
  templateUrl: './delegations.component.html',
  styleUrls: ['./delegations.component.scss'],
})
export class DelegationsComponent implements OnInit, OnDestroy {
  showOverlayNewDelegation = false;
  showOverlayEditDelegation = false;

  newDelegation = new NewDelegation();
  delegations: RxDocument<DelegationDocType>[] = [];
  selectedDelegation: RxDocument<DelegationDocType> | undefined;
  keys: RxDocument<KeyDocType>[] = [];

  get hasActiveDelegations(): boolean {
    return (
      typeof this.delegations.find((x) => this.isActive(x.from, x.until)) !==
      'undefined'
    );
  }

  get hasFutureDelegations(): boolean {
    return (
      typeof this.delegations.find((x) => this.isFuture(x.from, x.until)) !==
      'undefined'
    );
  }

  get hasPastDelegations(): boolean {
    return (
      typeof this.delegations.find((x) => this.isPast(x.from, x.until)) !==
      'undefined'
    );
  }

  private _delegationsSubscriptions: Subscription | undefined;

  constructor(
    public mixedService: MixedService,
    private _rxdbService: RxdbService,
    private _confirmService: ConfirmService,
    @Inject(MAT_DATE_LOCALE) public locale: string,
    public localeService: LocaleService
  ) {}

  ngOnInit(): void {
    this._loadKeys().then(() => {
      this._loadDelegations();
    });
  }

  ngOnDestroy(): void {
    this._delegationsSubscriptions?.unsubscribe();
  }

  async onClickCreateDelegation() {
    if (!this.newDelegation.canCreate) {
      return;
    }

    if (
      !this.newDelegation.delegator.value ||
      !this.newDelegation.delegatee.value ||
      !this.newDelegation.range.controls.from.value ||
      !this.newDelegation.range.controls.until.value
    ) {
      return;
    }

    try {
      const since = Math.round(
        this.newDelegation.range.controls.from.value.getTime() / 1000
      );

      const adjustedUntil = DateTime.fromJSDate(
        this.newDelegation.range.controls.until.value as Date
      )
        .endOf('day')
        .plus({ seconds: -1 });
      const until = Math.round(adjustedUntil.toJSDate().getTime() / 1000);

      const delegation = nip26.createDelegation(
        this.newDelegation.delegator.value.privkey,
        {
          kind: this.newDelegation.kind,
          pubkey: this.newDelegation.delegatee.value.pubkey,
          since,
          until,
        }
      );
      console.log(delegation);

      await this._rxdbService.db?.delegations.insert({
        id: v4(),
        kinds: [this.newDelegation.kind],
        delegatorPubkey: delegation.from,
        delegateePubkey: delegation.to,
        from: since,
        until,
        conditions: delegation.cond,
        token: delegation.sig,
      });
      await this._loadKeys();
      this.showOverlayNewDelegation = false;
      this.newDelegation = new NewDelegation();
    } catch (error) {
      // TODO
      console.log(error);
    }
  }

  async onClickDelegation(delegation: RxDocument<DelegationDocType>) {
    this.selectedDelegation = delegation;
    this.showOverlayEditDelegation = true;
  }

  async onClickDeleteDelegation(delegation: RxDocument<DelegationDocType>) {
    this._confirmService.open(
      'Please confirm',
      'Do you really want to delete this delegation?',
      async () => {
        await delegation.remove();
        this.showOverlayEditDelegation = false;
      },
      undefined,
      async () => {
        (document.activeElement as HTMLElement)?.blur();
      }
    );
  }

  getKey(pubkey: string): RxDocument<KeyDocType> | undefined {
    return this.keys.find((x) => x.pubkey === pubkey);
  }

  getDate(time: number | undefined): Date | undefined {
    if (!time) {
      return undefined;
    }
    return new Date(time * 1000);
  }

  private async _loadDelegations() {
    this._delegationsSubscriptions = await this._rxdbService.db?.delegations
      .find({
        sort: [{ from: 'desc' }],
      })
      .$.subscribe((delegations) => {
        this.delegations = delegations;
      });
  }

  private async _loadKeys() {
    if (!this._rxdbService.db) {
      return;
    }

    const keys = await this._rxdbService.db.keys
      .find({
        selector: {
          usage: KeyDocTypeUsage.User,
        },
      })
      .exec();

    this.keys = keys.sortBy((x) => x.nid);
  }

  isActive(from: number | undefined, until: number | undefined) {
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

  isFuture(from: number | undefined, until: number | undefined) {
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

  isPast(from: number | undefined, until: number | undefined) {
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
