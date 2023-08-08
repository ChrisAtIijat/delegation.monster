import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApproveDelegateDialogComponent } from './approve-delegate-dialog.component';

describe('ApproveDelegateDialogComponent', () => {
  let component: ApproveDelegateDialogComponent;
  let fixture: ComponentFixture<ApproveDelegateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApproveDelegateDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApproveDelegateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
