// navigation-external.service.spec.ts
import { NavigationExternalService } from './navigation-external.service';
import { NAVIGATION_DATA_INCOMING } from '../models/mobile-events.model';

describe('NavigationExternalService', () => {
  let service: NavigationExternalService;
  let routerMock: any;
  
  // Store the original document.addEventListener
  const originalAddEventListener = document.addEventListener;
  
  // Prepare to capture event handlers
  
  beforeEach(() => {
    // Mock router
    routerMock = {
      url: '/test-url',
      navigate: jest.fn()
    };
    
    // Mock fromEvent to capture the event handler
    (window as any).fromEvent = jest.fn().mockImplementation((_target, eventName) => {
      if (eventName === NAVIGATION_DATA_INCOMING) {
        return {
          subscribe: () => {
            return { unsubscribe: jest.fn() };
          }
        };
      }
    });
    
    // Create service
    service = new NavigationExternalService(routerMock);
  });
  
  afterEach(() => {
    // Clean up mocks
    jest.clearAllMocks();
    
    // Restore original document.addEventListener
    document.addEventListener = originalAddEventListener;
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  it('should initialize with dummy value of 1', () => {
    expect(service.dummy).toBe(1);
  });
  
  it('should increment dummy value on init', () => {
    service.init();
    expect(service.dummy).toBe(2);
    
    service.init();
    expect(service.dummy).toBe(3);
  });
  
  
  
  describe('navigateTo', () => {
    it('should navigate to the given URL with params', () => {
      const url = '/test-page';
      const params = { id: '123', source: 'test' };
      
      service.navigateTo(url, params);
      
      expect(routerMock.navigate).toHaveBeenCalledWith(
        [url], 
        { 
          queryParams: { 
            ...params, 
            ref: encodeURIComponent('/test-url') 
          } 
        }
      );
    });
    
    it('should use empty object if params are not provided', () => {
      const url = '/test-page';
      
      service.navigateTo(url);
      
      expect(routerMock.navigate).toHaveBeenCalledWith(
        [url], 
        { 
          queryParams: { 
            ref: encodeURIComponent('/test-url') 
          } 
        }
      );
    });
    
    it('should use provided ref param if available', () => {
      const url = '/test-page';
      const params = { ref: '/original-url', id: '123' };
      
      service.navigateTo(url, params);
      
      expect(routerMock.navigate).toHaveBeenCalledWith(
        [url], 
        { 
          queryParams: { 
            ...params, 
            ref: encodeURIComponent('/original-url') 
          } 
        }
      );
    });
    
    it('should handle URL with existing ref parameter', () => {
      // Set up router URL with a ref parameter
      routerMock.url = '/test-url?ref=previous-page&param=value';
      
      const url = '/test-page';
      
      service.navigateTo(url);
      
      expect(routerMock.navigate).toHaveBeenCalledWith(
        [url], 
        { 
          queryParams: { 
            ref: encodeURIComponent('/test-url?param=value') 
          } 
        }
      );
    });
   
    
    it('should handle URL with only ref parameter', () => {
      // Set up router URL with only a ref parameter
      routerMock.url = '/test-url?ref=previous-page';
      
      const url = '/test-page';
      
      service.navigateTo(url);
      
      expect(routerMock.navigate).toHaveBeenCalledWith(
        [url], 
        { 
          queryParams: { 
            ref: encodeURIComponent('/test-url') 
          } 
        }
      );
    });
  });
});