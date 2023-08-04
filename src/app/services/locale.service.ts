import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocaleService {
  getDateTimeFormat(locale: string) {
    if (locale === 'en' || locale.includes('en-')) {
      return 'MM/dd/yyyy HH:mm';
    } else {
      return 'yyyy-MM-dd HH:mm';
    }
  }

  getDateFormat(locale: string) {
    if (locale === 'en' || locale.includes('en-')) {
      return 'MM/dd/yyyy';
    } else if (locale === 'de' || locale.includes('de')) {
      return 'dd.MM.yyyy';
    } else {
      return 'yyyy-MM-dd';
    }
  }
}
