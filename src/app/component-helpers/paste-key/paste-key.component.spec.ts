import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasteKeyComponent } from './paste-key.component';

describe('PasteKeyComponent', () => {
  let component: PasteKeyComponent;
  let fixture: ComponentFixture<PasteKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PasteKeyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PasteKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
