import { NoDataComponent } from './no-data.component';

describe('NoDataComponent', () => {
  let component: NoDataComponent;

  beforeEach(() => {
    // Create a new instance of the component
    component = new NoDataComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize noData with noDataValue on ngOnInit', () => {
    const mockNoDataValue = 'Some data';
    
    // Set the input property
    component.noDataValue = mockNoDataValue;

    // Call ngOnInit to simulate lifecycle hook
    component.ngOnInit();

    // Verify if noData was set correctly
    expect(component.noData).toBe(mockNoDataValue);
  });

  it('should handle undefined input', () => {
    // Set undefined value
    component.noDataValue = undefined;

    // Call ngOnInit to simulate lifecycle hook
    component.ngOnInit();

    // Verify if noData is correctly set to undefined
    expect(component.noData).toBeUndefined();
  });

  it('should handle null input', () => {
    // Set null value
    component.noDataValue = null;

    // Call ngOnInit to simulate lifecycle hook
    component.ngOnInit();

    // Verify if noData is correctly set to null
    expect(component.noData).toBeNull();
  });
});
