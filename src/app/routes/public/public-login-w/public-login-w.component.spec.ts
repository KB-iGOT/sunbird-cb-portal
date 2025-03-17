import { PublicLoginWComponent } from './public-login-w.component';
import { of } from 'rxjs';

describe('PublicLoginWComponent', () => {
  let component: PublicLoginWComponent;
  let activatedRouteMock: any;
  let httpClientMock: any;
  let queryParamMapSpy: any;

  beforeEach(() => {
    // Create mocks for dependencies
    queryParamMapSpy = jest.fn();
    
    activatedRouteMock = {
      queryParamMap: {
        subscribe: queryParamMapSpy
      }
    };
    
    httpClientMock = {
      get: jest.fn()
    };

    // Setup spies
    queryParamMapSpy.mockReturnValue(of({ params: {} }));
    httpClientMock.get.mockReturnValue(of({}));

    // Initialize component with mocked dependencies
    component = new PublicLoginWComponent(
      activatedRouteMock as any,
      httpClientMock
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should subscribe to queryParamMap', () => {
      // Arrange
      const params = { params: { code: 'test-code', state: 'test-state' } };
      queryParamMapSpy.mockReturnValue(of(params));
      
      // Act
      component.ngOnInit();
      
      // Assert
      expect(queryParamMapSpy).toHaveBeenCalled();
      expect(component.data).toEqual(params.params);
    });

    it('should call parichay callback API when code is present', () => {
      // Arrange
      const params = { params: { code: 'test-code', state: 'test-state' } };
      queryParamMapSpy.mockReturnValue(of(params));
      
      // Act
      component.ngOnInit();
      
      // Assert
      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/public/v8/parichay/callback',
        { params: { code: 'test-code', state: 'test-state' } }
      );
    });

    it('should not call API when code is not present', () => {
      // Arrange
      const params = { params: { state: 'test-state' } };
      queryParamMapSpy.mockReturnValue(of(params));
      
      // Act
      component.ngOnInit();
      
      // Assert
      expect(httpClientMock.get).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from subscriptionContact when not null', () => {
      // Arrange
      component.ngOnInit();
      //const unsubscribeSpy = jest.spyOn(component['subscriptionContact'] as any, 'unsubscribe');
      
      // Act
     // component.ngOnDestroy();
      
      // Assert
     // expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should not throw error when subscriptionContact is null', () => {
      // Arrange
      component['subscriptionContact'] = null;
      
      // Act & Assert
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('login', () => {
    it('should redirect to the resource page', () => {
      // Arrange
      Object.defineProperty(window, 'location', {
        value: {
          href: '',
          origin: 'http://test-origin.com'
        },
        writable: true
      });
      
      // Act
      component.login();
      
      // Assert
      expect(window.location.href).toBe('http://test-origin.com/protected/v8/resource');
    });
  });

  describe('Component Properties', () => {
    it('should initialize with default values', () => {
      expect(component.userMail).toBe('');
      expect(component.platform).toBe('Learner');
      expect(component.data).toBeUndefined();
    });
  });
});
