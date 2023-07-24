import { TestBed } from '@angular/core/testing';

import { MixedService } from './mixed.service';

describe('MixedService', () => {
  let service: MixedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MixedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
