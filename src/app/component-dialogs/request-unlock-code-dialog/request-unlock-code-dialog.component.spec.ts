import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestUnlockCodeDialogComponent } from './request-unlock-code-dialog.component';

describe('RequestUnlockCodeDialogComponent', () => {
  let component: RequestUnlockCodeDialogComponent;
  let fixture: ComponentFixture<RequestUnlockCodeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestUnlockCodeDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestUnlockCodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
