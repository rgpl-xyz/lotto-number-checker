import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WinningNumberComponent } from './winning-number.component';
import { WinningInputComponent } from '../winning-input/winning-input.component';
import { NumberDisplayComponent } from '../number-display/number-display.component';

describe('WinningNumberComponent', () => {
  let component: WinningNumberComponent;
  let fixture: ComponentFixture<WinningNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        WinningNumberComponent,
        WinningInputComponent,
        NumberDisplayComponent
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WinningNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.title()).toBe('Lotto Number Matcher');
    expect(component.winningNumbers()).toEqual([]);
    expect(component.isEditMode()).toBe(true);
  });

  it('should set winning numbers and toggle edit mode', () => {
    const testNumbers = [1, 2, 3, 4, 5, 6];
    
    component.setWinningNumbers(testNumbers);
    
    expect(component.winningNumbers()).toEqual(testNumbers);
    expect(component.isEditMode()).toBe(false);
  });

  it('should enable edit mode when editWinningNumbers is called', () => {
    // First set edit mode to false
    component.isEditMode.set(false);
    expect(component.isEditMode()).toBe(false);
    
    // Call the editWinningNumbers method
    component.editWinningNumbers();
    
    // Expect edit mode to be true now
    expect(component.isEditMode()).toBe(true);
  });
});
