import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApproveGetPublicKeyDialogComponent } from './approve-get-public-key-dialog.component';

describe('ApproveDialogComponent', () => {
  let component: ApproveGetPublicKeyDialogComponent;
  let fixture: ComponentFixture<ApproveGetPublicKeyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApproveGetPublicKeyDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApproveGetPublicKeyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
