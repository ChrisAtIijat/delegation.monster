import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FirstTimeRunDialogComponent } from './first-time-run-dialog.component';

describe('FirstTimeRunDialogComponent', () => {
  let component: FirstTimeRunDialogComponent;
  let fixture: ComponentFixture<FirstTimeRunDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FirstTimeRunDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FirstTimeRunDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
