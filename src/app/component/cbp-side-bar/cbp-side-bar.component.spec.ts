import { CbpSideBarComponent } from './cbp-side-bar.component';
import { EventEmitter } from '@angular/core';

describe('CbpSideBarComponent', () => {
  let component: CbpSideBarComponent;
  let filterValueEmitMock: EventEmitter<any>;

  beforeEach(() => {
    // Mock the EventEmitter
    filterValueEmitMock = {
      emit: jest.fn(),
    } as any;

    // Create an instance of the component
    component = new CbpSideBarComponent();
    
    // Assign the mock EventEmitter
    component.filterValueEmit = filterValueEmitMock;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call filterValueEmit.emit when filterValueEmitMethod is called', () => {
    const event = { some: 'value' };
    component.filterValueEmitMethod(event);
    
    // Check that emit was called
    expect(filterValueEmitMock.emit).toHaveBeenCalledWith(event);
  });

  it('should have initial inputs set to undefined', () => {
    expect(component.cbpCount).toBeUndefined();
    expect(component.upcommingList).toBeUndefined();
    expect(component.overDueList).toBeUndefined();
    expect(component.cbpLoader).toBeUndefined();
    expect(component.cbpOriginalData).toBeUndefined();
  });

  it('should handle inputs correctly', () => {
    // Set inputs directly
    component.cbpCount = 5;
    component.upcommingList = ['item1', 'item2'];
    component.overDueList = ['item3'];
    component.cbpLoader = true;
    component.cbpOriginalData = { key: 'value' };

    // Expect the inputs to be set correctly
    expect(component.cbpCount).toBe(5);
    expect(component.upcommingList).toEqual(['item1', 'item2']);
    expect(component.overDueList).toEqual(['item3']);
    expect(component.cbpLoader).toBe(true);
    expect(component.cbpOriginalData).toEqual({ key: 'value' });
  });

  it('should call ngOnInit without errors', () => {
    // Call ngOnInit and ensure no errors
    expect(() => component.ngOnInit()).not.toThrow();
  });
});
