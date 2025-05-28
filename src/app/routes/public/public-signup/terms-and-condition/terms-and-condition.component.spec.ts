import { MatDialogRef } from '@angular/material/dialog';
import { TermsAndConditionComponent } from './terms-and-condition.component';
import { TranslateService } from '@ngx-translate/core';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock MatDialogRef
const mockDialogRef = {
  close: jest.fn(),
};

// Mock TranslateService
const mockTranslateService = {
  setDefaultLang: jest.fn(),
  use: jest.fn(),
  get: jest.fn(),
  instant: jest.fn(),
};

describe('TermsAndConditionComponent', () => {
  let component: TermsAndConditionComponent;
  let dialogRef: jest.Mocked<MatDialogRef<TermsAndConditionComponent>>;
  let translateService: jest.Mocked<TranslateService>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create mocked instances
    dialogRef = mockDialogRef as unknown as jest.Mocked<MatDialogRef<TermsAndConditionComponent>>;
    translateService = mockTranslateService as unknown as jest.Mocked<TranslateService>;
    
    // Clear localStorage mock
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Constructor', () => {
    it('should create component instance', () => {
      component = new TermsAndConditionComponent(dialogRef, translateService);
      
      expect(component).toBeTruthy();
      expect(component.dialogRef).toBe(dialogRef);
    });

    it('should set default language and use stored language when websiteLanguage exists in localStorage', () => {
      const storedLanguage = 'es';
      localStorageMock.getItem.mockReturnValue(storedLanguage);
      
      component = new TermsAndConditionComponent(dialogRef, translateService);
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('websiteLanguage');
      expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
      expect(translateService.use).toHaveBeenCalledWith(storedLanguage);
    });

    it('should not set language when websiteLanguage does not exist in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      component = new TermsAndConditionComponent(dialogRef, translateService);
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('websiteLanguage');
      expect(translateService.setDefaultLang).not.toHaveBeenCalled();
      expect(translateService.use).not.toHaveBeenCalled();
    });

    it('should handle different language codes from localStorage', () => {
      const testCases = ['fr', 'de', 'it', 'pt'];
      
      testCases.forEach(lang => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(lang);
        
        component = new TermsAndConditionComponent(dialogRef, translateService);
        
        expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
        expect(translateService.use).toHaveBeenCalledWith(lang);
      });
    });

    it('should handle empty string in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('');
      
      component = new TermsAndConditionComponent(dialogRef, translateService);
      
      expect(translateService.setDefaultLang).not.toHaveBeenCalled();
      expect(translateService.use).not.toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      component = new TermsAndConditionComponent(dialogRef, translateService);
    });

    it('should execute without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should be defined', () => {
      expect(component.ngOnInit).toBeDefined();
    });
  });

  describe('closeDialog', () => {
    beforeEach(() => {
      component = new TermsAndConditionComponent(dialogRef, translateService);
    });

    it('should call dialogRef.close with true', () => {
      component.closeDialog();
      
      expect(dialogRef.close).toHaveBeenCalledWith(true);
      expect(dialogRef.close).toHaveBeenCalledTimes(1);
    });

    it('should be defined', () => {
      expect(component.closeDialog).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly when localStorage has language and dialog is closed', () => {
      const storedLanguage = 'fr';
      localStorageMock.getItem.mockReturnValue(storedLanguage);
      
      component = new TermsAndConditionComponent(dialogRef, translateService);
      component.ngOnInit();
      component.closeDialog();
      
      // Verify constructor behavior
      expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
      expect(translateService.use).toHaveBeenCalledWith(storedLanguage);
      
      // Verify close behavior
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should work correctly when localStorage is empty and dialog is closed', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      component = new TermsAndConditionComponent(dialogRef, translateService);
      component.ngOnInit();
      component.closeDialog();
      
      // Verify constructor behavior
      expect(translateService.setDefaultLang).not.toHaveBeenCalled();
      expect(translateService.use).not.toHaveBeenCalled();
      
      // Verify close behavior
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage.getItem throwing an error', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      expect(() => {
        component = new TermsAndConditionComponent(dialogRef, translateService);
      }).toThrow('localStorage error');
    });

    it('should handle translateService.setDefaultLang throwing an error', () => {
      localStorageMock.getItem.mockReturnValue('en');
      translateService.setDefaultLang.mockImplementation(() => {
        throw new Error('Translation error');
      });
      
      expect(() => {
        component = new TermsAndConditionComponent(dialogRef, translateService);
      }).toThrow('Translation error');
    });

    it('should handle translateService.use throwing an error', () => {
      localStorageMock.getItem.mockReturnValue('en');
      translateService.use.mockImplementation(() => {
        throw new Error('Translation use error');
      });
      
      expect(() => {
        component = new TermsAndConditionComponent(dialogRef, translateService);
      }).toThrow('Translation use error');
    });
  });
});