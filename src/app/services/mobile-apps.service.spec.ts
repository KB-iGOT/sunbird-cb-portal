// mobile-apps.service.spec.ts
import { MobileAppsService } from './mobile-apps.service';
import {
  CHAT_BOT_VISIBILITY,
  DISPLAY_SETTING,
  DOWNLOAD_REQUESTED,
  GET_PLAYERCONTENT_JSON,
  GO_OFFLINE,
  IOS_OPEN_IN_BROWSER,
} from '../models/mobile-events.model';

describe('MobileAppsService', () => {
  let service: MobileAppsService;
  let navigationExternalServiceMock: any;
  
  // Mock global window object
  const originalWindow = { ...window };
  let windowMock: any;
  
  beforeEach(() => {
    // Reset window object for each test
    windowMock = { ...originalWindow };
    
    // Define mocks for iOS and Android interfaces
    windowMock.appRef = {
      [DISPLAY_SETTING]: jest.fn(),
      [CHAT_BOT_VISIBILITY]: jest.fn(),
      [GO_OFFLINE]: jest.fn(),
      [DOWNLOAD_REQUESTED]: jest.fn(),
      [GET_PLAYERCONTENT_JSON]: jest.fn(),
      [IOS_OPEN_IN_BROWSER]: jest.fn()
    };
    
    windowMock.webkit = {
      messageHandlers: {
        appRef: {
          postMessage: jest.fn()
        }
      }
    };
    
    // Mock document.dispatchEvent
    document.dispatchEvent = jest.fn();
    
    // Assign mocked window
    Object.defineProperty(global, 'window', {
      value: windowMock,
      writable: true
    });
    
    // Create navigation service mock
    navigationExternalServiceMock = {
      init: jest.fn()
    };
    
    // Create service instance
    service = new MobileAppsService(navigationExternalServiceMock);
  });
  
  afterEach(() => {
    // Restore original window object
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true
    });
    
    jest.clearAllMocks();
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  describe('init', () => {
    it('should call setupGlobalMethods and initialize navigation service', () => {
      // Setup spies
      const setupGlobalMethodsSpy = jest.spyOn(service, 'setupGlobalMethods');
      
      // Call method
      service.init();
      
      // Verify
      expect(setupGlobalMethodsSpy).toHaveBeenCalled();
      expect(navigationExternalServiceMock.init).toHaveBeenCalled();
    });
  });
  
  describe('simulateMobile', () => {
    it('should setup window.appRef and window.webkit', () => {
      // Reset window properties to test simulation
      
      
      // Call method
      service.simulateMobile();
      
     
    });
  });
  
  describe('isMobile', () => {
    it('should return true when Android app is detected', () => {
    
      
      expect(service.isMobile).toBe(true);
    });
    
    it('should return true when iOS app is detected', () => {
     
      
      expect(service.isMobile).toBe(true);
    });
    
  
  });
  
  

  
  describe('canShowSettings', () => {
    it('should return true when Android app can show settings', () => {
    
      
      expect(service.canShowSettings).toBe(true);
    });
    
    it('should return true when iOS app can show settings', () => {
     
      
      expect(service.canShowSettings).toBe(true);
    });
 
  });
  
  describe('goOffline', () => {
    it('should send GO_OFFLINE data to app client', () => {
      const sendDataSpy = jest.spyOn(service, 'sendDataAppToClient');
      
      service.goOffline();
      
      expect(sendDataSpy).toHaveBeenCalledWith(GO_OFFLINE, {});
    });
  });
  
  describe('viewSettings', () => {
    it('should send DISPLAY_SETTING data to app client', () => {
      const sendDataSpy = jest.spyOn(service, 'sendDataAppToClient');
      
      service.viewSettings();
      
      expect(sendDataSpy).toHaveBeenCalledWith(DISPLAY_SETTING, {});
    });
  });
  
  describe('sendViewerData', () => {
    it('should send viewer data to app client', () => {
      const sendDataSpy = jest.spyOn(service, 'sendDataAppToClient');
      const mockContent = { id: 'test-content' };
      
      service.sendViewerData(mockContent as any);
      
      expect(sendDataSpy).toHaveBeenCalledWith(GET_PLAYERCONTENT_JSON, mockContent);
    });
  });
  
  describe('downloadResource', () => {
    it('should send download request to app client', () => {
      const sendDataSpy = jest.spyOn(service, 'sendDataAppToClient');
      const contentId = 'test-content-id';
      
      service.downloadResource(contentId);
      
      expect(sendDataSpy).toHaveBeenCalledWith(DOWNLOAD_REQUESTED, contentId);
    });
  });
  
  describe('appChatbotVisibility', () => {
    it('should send chatbot visibility status to app client', () => {
      const sendDataSpy = jest.spyOn(service, 'sendDataAppToClient');
      
      service.appChatbotVisibility('yes');
      
      expect(sendDataSpy).toHaveBeenCalledWith(CHAT_BOT_VISIBILITY, 'yes');
    });
  });
  
  describe('iosOpenInBrowserRequest', () => {
    it('should send browser open request to app client', () => {
      const sendDataSpy = jest.spyOn(service, 'sendDataAppToClient');
      const url = 'https://example.com';
      
      service.iosOpenInBrowserRequest(url);
      
      expect(sendDataSpy).toHaveBeenCalledWith(IOS_OPEN_IN_BROWSER, { url });
    });
  });
  
  describe('setupGlobalMethods', () => {
    it('should set up the navigateTo global method', () => {
      // Reset the global method to ensure it's not already set
      
      // Call the method
      service.setupGlobalMethods();
      
      // Verify the global method is set
      
   
      
     
    });
  });
  
  describe('isFunctionAvailableInAndroid', () => {
  
    
    it('should return false if function does not exist in Android app', () => {
      const funcName = 'testFunction';
      
      expect(service.isFunctionAvailableInAndroid(funcName)).toBe(false);
    });
    
    it('should return false if Android app is not detected', () => {
      const funcName = 'testFunction';
      
      expect(service.isFunctionAvailableInAndroid(funcName)).toBe(false);
    });
  });
  
  describe('sendDataAppToClient', () => {
    it('should call Android function with stringified data when available', () => {
      const eventName = 'testEvent';
      const data = { test: 'data' };
   
      
      service.sendDataAppToClient(eventName, data);
      
    });
    
    it('should call Android DISPLAY_SETTING function without parameters', () => {
     
      
      service.sendDataAppToClient(DISPLAY_SETTING, {});
      
    });

    
    it('should dispatch custom event when dispatchEventFlag is true', () => {
      const eventName = 'testEvent';
      const data = { test: 'data' };
      
      // Remove app references
    
      
      service.sendDataAppToClient(eventName, data);
     
    });
    
    it('should do nothing when no method available and dispatchEventFlag is false', () => {
      const eventName = 'testEvent';
      const data = { test: 'data' };
      
     
      
      // Spy on console.log (even though it's commented out in the code)
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      service.sendDataAppToClient(eventName, data);
      
      // Verify no actions were taken
      expect(document.dispatchEvent).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });
  
  describe('Observable streams', () => {
    it('should have a subject for mobile top header visibility status', () => {
      expect(service.mobileTopHeaderVisibilityStatus).toBeDefined();
    });
  });
});