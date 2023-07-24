import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasteUriComponent } from './paste-uri.component';

describe('PasteUriComponent', () => {
  let component: PasteUriComponent;
  let fixture: ComponentFixture<PasteUriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PasteUriComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PasteUriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
