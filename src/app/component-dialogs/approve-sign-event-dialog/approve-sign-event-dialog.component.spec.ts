import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApproveSignEventDialogComponent } from './approve-sign-event-dialog.component';

describe('ApproveSignEventDialogComponent', () => {
  let component: ApproveSignEventDialogComponent;
  let fixture: ComponentFixture<ApproveSignEventDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApproveSignEventDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApproveSignEventDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
