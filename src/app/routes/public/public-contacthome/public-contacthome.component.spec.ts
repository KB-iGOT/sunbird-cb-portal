import { PublicContacthomeComponent } from './public-contacthome.component';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../src/environments/environment';

// Mock the environment
jest.mock('../../../../../src/environments/environment', () => ({
  environment: {
    contactMeetLink: 'mock-meet-link',
    meetingLinkDetail: 'mock-meeting-detail',
    karmayogiBharatLink: 'mock-karmayogi-link'
  }
}));

describe('PublicContacthomeComponent', () => {
  let component: PublicContacthomeComponent;
  let mockConfigSvc: jest.Mocked<ConfigurationsService>;
  let mockTranslateService: jest.Mocked<TranslateService>;
  
  beforeEach(() => {
    // Create mock for ConfigurationsService
    mockConfigSvc = {
      pageNavBar: { color: 'white', type: 'theme' },
      instanceConfig: {
        mailIds: {
          contactUs: 'test@example.com'
        }
      }
    } as unknown as jest.Mocked<ConfigurationsService>;
    
    // Create mock for TranslateService
    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn()
    } as unknown as jest.Mocked<TranslateService>;
    
    // Mock localStorage
    const localStorageMock = (() => {
      let store: { [key: string]: string } = {};
      return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
        clear: jest.fn(() => {
          store = {};
        })
      };
    })();
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
    
    // Create component instance
    component = new PublicContacthomeComponent(
      mockConfigSvc,
      mockTranslateService
    );
  });
  
  describe('constructor', () => {
    it('should set default language and use stored language when websiteLanguage exists in localStorage', () => {
      // Setup localStorage to return a language
      jest.spyOn(localStorage, 'getItem').mockReturnValueOnce('fr');
      
      // Re-initialize component to trigger constructor
      component = new PublicContacthomeComponent(
        mockConfigSvc,
        mockTranslateService
      );
      
      // Verify the translation service methods were called correctly
      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockTranslateService.use).toHaveBeenCalledWith('fr');
    });
    
    it('should not set language when websiteLanguage does not exist in localStorage', () => {
      // Setup localStorage to return null
      jest.spyOn(localStorage, 'getItem').mockReturnValueOnce(null);
      
      // Re-initialize component to trigger constructor
      component = new PublicContacthomeComponent(
        mockConfigSvc,
        mockTranslateService
      );
      
      // Verify the translation service methods were not called
      expect(mockTranslateService.setDefaultLang).not.toHaveBeenCalled();
      expect(mockTranslateService.use).not.toHaveBeenCalled();
    });
  });
  
  describe('ngOnInit', () => {
    it('should initialize environment variables correctly', () => {
      // Call ngOnInit
      component.ngOnInit();
      
      // Verify environment variables were set correctly
      expect(component.environment).toEqual(environment);
      expect(component.meetLink).toEqual('mock-meet-link');
      expect(component.meetingDetail).toEqual('mock-meeting-detail');
      expect(component.karmayogiBharatLink).toEqual('mock-karmayogi-link');
    });
    
    it('should set contactUsMail when instanceConfig is available', () => {
      // Call ngOnInit
      component.ngOnInit();
      
      // Verify contactUsMail was set correctly
      expect(component.contactUsMail).toEqual('test@example.com');
    });
    
    it('should not set contactUsMail when instanceConfig is not available', () => {
      // Set instanceConfig to undefined
      mockConfigSvc.instanceConfig = null;
      
      // Call ngOnInit
      component.ngOnInit();
      
      // Verify contactUsMail was not set
      expect(component.contactUsMail).toEqual('');
    });
  });
  
  describe('translateHub', () => {
    it('should return translated value for the given hub name', () => {
      // Setup mock for translate.instant
      mockTranslateService.instant.mockReturnValue('Translated Hub');
      
      // Call the method
      const result = component.translateHub('HubName');
      
      // Verify translate.instant was called with correct parameter
      expect(mockTranslateService.instant).toHaveBeenCalledWith('HubName');
      
      // Verify result
      expect(result).toEqual('Translated Hub');
    });
  });
  
  describe('preventData', () => {
    it('should call preventDefault on the event', () => {
      // Create mock event
      const mockEvent = {
        preventDefault: jest.fn()
      };
      
      // Call the method
      component.preventData(mockEvent);
      
      // Verify preventDefault was called
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });
});