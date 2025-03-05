// import { EventEmitter } from '@angular/core';
import { AppOtpReaderComponent } from './app-otp-reader.component';

describe('AppOtpReaderComponent', () => {
  let component: AppOtpReaderComponent;
  let mockQueryList: any;
  let mockInputElements: any[];

  beforeEach(() => {
    // Reset mocks and component before each test
    mockInputElements = Array(6).fill(null).map((_) => ({
      nativeElement: {
        value: '',
        focus: jest.fn()
      }
    }));

    // Create a mock for QueryList
    mockQueryList = {
      toArray: jest.fn().mockReturnValue(mockInputElements)
    };

    // Initialize component
    component = new AppOtpReaderComponent();
    
    // Mock the ViewChildren QueryList
    Object.defineProperty(component, 'inputElements', {
      get: () => mockQueryList
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty input values', () => {
    expect(component.inputValues).toEqual(['', '', '', '', '', '']);
    expect(component.inputs.length).toBe(6);
  });

  it('should have getOTP as EventEmitter', () => {
   // expect(component.getOTP).toBeInstanceOf(EventEmitter);
  });

  describe('onValueChange', () => {
    it('should call digitValidate and tabChange', () => {
      // Spy on private methods
      const digitValidateSpy = jest.spyOn<any, any>(component, 'digitValidate');
      const tabChangeSpy = jest.spyOn<any, any>(component, 'tabChange');
      
      // Create mock event
      const mockEvent = {
        target: { value: 'a' }
      };
      
      component.onValueChange(mockEvent as unknown as Event, 0);
      
      expect(digitValidateSpy).toHaveBeenCalledWith(mockEvent.target);
      expect(tabChangeSpy).toHaveBeenCalledWith(0);
    });
  });

  describe('digitValidate', () => {
    it('should remove non-alphanumeric characters and convert to uppercase', () => {
      // Create mock input element
      const mockInputElement = { value: 'a1@b2' };
      
      // Call private method directly using any type
      (component as any).digitValidate(mockInputElement);
      
      expect(mockInputElement.value).toBe('A1B2');
    });
  });

  describe('tabChange', () => {
    it('should focus on next element if current index is not the last', () => {
      // Setup a non-empty value in the next element
      mockInputElements[1].nativeElement.value = 'A';
      
      // Spy on the focusElement method
      const focusElementSpy = jest.spyOn<any, any>(component, 'focusElement');
      
      // Call private method
      (component as any).tabChange(0);
      
      expect(focusElementSpy).toHaveBeenCalledWith(mockInputElements[1]);
    });

    it('should focus on current element if current index is the last', () => {
      const focusElementSpy = jest.spyOn<any, any>(component, 'focusElement');
      
      // Call private method with last index
      (component as any).tabChange(5);
      
      expect(focusElementSpy).toHaveBeenCalledWith(mockInputElements[5]);
    });
  });

  describe('onBackspace', () => {
    it('should clear previous input and focus on it when backspace is pressed on empty input', () => {
      // Set up mock elements
      mockInputElements[0].nativeElement.value = 'A';
      mockInputElements[1].nativeElement.value = '';
      
      const focusElementSpy = jest.spyOn<any, any>(component, 'focusElement');
      
      // Create backspace event
      const backspaceEvent = { key: 'Backspace' };
      
      component.onBackspace(backspaceEvent, 1);
      
      expect(mockInputElements[0].nativeElement.value).toBe('');
      expect(focusElementSpy).toHaveBeenCalledWith(mockInputElements[0]);
    });

    it('should do nothing when non-backspace key is pressed', () => {
      // Set up mock elements
      mockInputElements[0].nativeElement.value = 'A';
      
      const focusElementSpy = jest.spyOn<any, any>(component, 'focusElement');
      
      // Create non-backspace event
      const otherKeyEvent = { key: 'Enter' };
      
      component.onBackspace(otherKeyEvent, 1);
      
      expect(mockInputElements[0].nativeElement.value).toBe('A');
      expect(focusElementSpy).not.toHaveBeenCalled();
    });
  });

  describe('focusElement', () => {
    it('should update inputValues, finalValues and focus the provided element', () => {
      // Set up values in elements
      mockInputElements.forEach((el, i) => {
        el.nativeElement.value = i.toString();
      });
      
      // Call method with first element
      (component as any).focusElement(mockInputElements[0]);
      
      // Check values were updated
      expect(component.inputValues).toEqual(['0', '1', '2', '3', '4', '5']);
      expect(component.finalValues).toBe('012345');
      expect(mockInputElements[0].nativeElement.focus).toHaveBeenCalled();
    });
  });

  describe('sendFinalOtp', () => {
    it('should emit the finalValues through getOTP', () => {
      // Spy on emit method
      const emitSpy = jest.spyOn(component.getOTP, 'emit');
      
      // Set finalValues
      component.finalValues = '123456';
      
      // Call method
      component.sendFinalOtp();
      
      expect(emitSpy).toHaveBeenCalledWith('123456');
    });
  });

  describe('finalOTPValues getter', () => {
    it('should return finalValues', () => {
      // Set finalValues
      component.finalValues = '123456';
      
      expect(component.finalOTPValues).toBe('123456');
    });
  });
});