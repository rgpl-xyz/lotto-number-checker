import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinningInputComponent } from './winning-input.component';

describe('WinningInputComponent', () => {
  let component: WinningInputComponent;
  let fixture: ComponentFixture<WinningInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinningInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WinningInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
