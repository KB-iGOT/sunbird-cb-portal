import { PublicLoginWGComponent } from './public-login-wg.component';
import { of } from 'rxjs';

describe('PublicLoginWGComponent', () => {
  let component: PublicLoginWGComponent;
  let mockActivatedRoute: any;
  let mockHttpClient: any;
  let originalConsoleLog: any;
  let originalWindowLocation: any;

  beforeEach(() => {
    // Save original console.log and window.location
    originalConsoleLog = console.log;
    originalWindowLocation = window.location;

    // Mock console.log to prevent actual logging during tests
    console.log = jest.fn();

    // Mock window.location
    //delete window.location;
    window.location = {
      ...originalWindowLocation,
      href: '',
      origin: 'http://test-host.com',
      reload: jest.fn()
    } as any;

    // Mock ActivatedRoute
    mockActivatedRoute = {
      queryParamMap: of({
        params: {
          code: 'test-code',
          state: 'test-state'
        }
      })
    };

    // Mock HttpClient
    mockHttpClient = {
      get: jest.fn().mockReturnValue(of({ token: 'test-token' }))
    };

    // Create component with mocked dependencies
    component = new PublicLoginWGComponent(
      mockActivatedRoute as any,
      mockHttpClient as any
    );
  });

  afterEach(() => {
    // Restore original console.log and window.location
    console.log = originalConsoleLog;
    window.location = originalWindowLocation;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.userMail).toBe('');
    expect(component.platform).toBe('Learner');
    expect(component.data).toBeUndefined();
  });

  it('should subscribe to query params on ngOnInit', () => {
    // Spy on httpClient.get
    const httpSpy = jest.spyOn(mockHttpClient, 'get');
    
    // Call ngOnInit
    component.ngOnInit();
    
    // Check if data was set correctly
    expect(component.data).toEqual({
      code: 'test-code',
      state: 'test-state'
    });
    
    // Verify HTTP call was made with correct parameters
    expect(httpSpy).toHaveBeenCalledWith('/apis/public/v8/google/callback', {
      params: {
        code: 'test-code',
        state: 'test-state'
      }
    });
    
    // Verify console.log was called with the response data
    expect(console.log).toHaveBeenCalledWith({ token: 'test-token' });
  });

  it('should not make HTTP call when code is not present', () => {
    // Override mockActivatedRoute to return empty params
    mockActivatedRoute.queryParamMap = of({
      params: {}
    });
    
    // Spy on httpClient.get
    const httpSpy = jest.spyOn(mockHttpClient, 'get');
    
    // Call ngOnInit
    component.ngOnInit();
    
    // Verify HTTP call was not made
    expect(httpSpy).not.toHaveBeenCalled();
  });

  it('should unsubscribe from subscriptionContact on ngOnDestroy', () => {
    // Initialize component
    component.ngOnInit();
    
    // Create spy on unsubscribe method
    const subscriptionSpy = jest.spyOn(component['subscriptionContact'] as any, 'unsubscribe');
    
    // Call ngOnDestroy
    component.ngOnDestroy();
    
    // Verify unsubscribe was called
    expect(subscriptionSpy).toHaveBeenCalled();
  });

  it('should handle null subscription in ngOnDestroy', () => {
    // Set subscription to null
    component['subscriptionContact'] = null;
    
    // This should not throw an error
    expect(() => {
      component.ngOnDestroy();
    }).not.toThrow();
  });

  it('should redirect to the protected resource on login', () => {
    // Call login method
    component.login();
    
    // Verify window.location.href was set correctly
    expect(window.location.href).toBe('http://test-host.com/protected/v8/resource');
  });
});
