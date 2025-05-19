import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinningNumberComponent } from './winning-number.component';

describe('WinningNumberComponent', () => {
  let component: WinningNumberComponent;
  let fixture: ComponentFixture<WinningNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinningNumberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WinningNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
