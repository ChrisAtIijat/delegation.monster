import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { RxDocument } from 'rxdb';
import { DelegationDocType } from 'src/app/models/rxdb/schemas/delegation';
import { KeyDocType } from 'src/app/models/rxdb/schemas/key';
import { LocaleService } from 'src/app/services/locale.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-delegation',
  templateUrl: './delegation.component.html',
  styleUrls: ['./delegation.component.scss'],
})
export class DelegationComponent {
  @Input() delegation!: RxDocument<DelegationDocType>;
  @Input() keys!: RxDocument<KeyDocType>[];

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onClick = new EventEmitter<RxDocument<DelegationDocType>>();

  constructor(
    @Inject(MAT_DATE_LOCALE) public locale: string,
    public localeService: LocaleService
  ) {}

  onClickDelegation(delegation: RxDocument<DelegationDocType>) {
    this.onClick.emit(delegation);
  }

  getKey(pubkey: string): RxDocument<KeyDocType> | undefined {
    return this.keys.find((x) => x.pubkey === pubkey);
  }

  hasKey(pubkey: string): boolean {
    return typeof this.keys.find((x) => x.pubkey === pubkey) !== 'undefined';
  }

  getDate(time: number | undefined): Date | undefined {
    if (!time) {
      return undefined;
    }
    return new Date(time * 1000);
  }
}
