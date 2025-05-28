import { PublicLogoutComponent } from './public-logout.component';
import { NsPage } from '@sunbird-cb/utils-v2';
import { of } from 'rxjs';
import * as _ from 'lodash';

// Mock services
const mockAuthKeycloakService = {
  force_logout: jest.fn(),
};

const mockConfigurationsService = {
  pageNavBar: {} as Partial<NsPage.INavBackground>,
  instanceConfig: {
    mailIds: {
      contactUs: 'contact@domain.com',
    },
  },
};

const mockActivatedRoute = {
  data: of({ pageData: { data: 'some data' } }),
  queryParamMap: of({ get: jest.fn().mockReturnValue('error') }),
};

describe('PublicLogoutComponent', () => {
  let component: PublicLogoutComponent;

  beforeEach(() => {
    component = new PublicLogoutComponent(
      mockConfigurationsService as any,
      mockActivatedRoute as any,
      mockAuthKeycloakService as any
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeDefined();
  });

  it('should initialize component and set contactUsMail and contactPage on ngOnInit', () => {
    component.ngOnInit();
    expect(component.contactUsMail).toBe('contact@domain.com');
    expect(component.contactPage).toBe('some data');
  });

  it('should unsubscribe from subscriptions on ngOnDestroy', () => {
    // Setup mock unsubscribes
    const unsubscribeSpy = jest.spyOn(component['subscriptionContact']!, 'unsubscribe');
    const unsubscribeRouterSpy = jest.spyOn(component['routerSubsc']!, 'unsubscribe');

    component.ngOnDestroy();
    
    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(unsubscribeRouterSpy).toHaveBeenCalled();
  });

  it('should call force_logout when message is error in ngOnInit', () => {
    // Mock a query param for the error
    mockActivatedRoute.queryParamMap = of({ get: jest.fn().mockReturnValue('error') });
    
    component.ngOnInit();
    
    expect(mockAuthKeycloakService.force_logout).toHaveBeenCalled();
  });

  it('should not call force_logout if message is not error', () => {
    // Mock a query param without error
    mockActivatedRoute.queryParamMap = of({ get: jest.fn().mockReturnValue('') });
    
    component.ngOnInit();
    
    expect(mockAuthKeycloakService.force_logout).not.toHaveBeenCalled();
  });

  it('should navigate to login page on login()', () => {
    // Spy on window.location.href
    const spy = jest.spyOn(window.location, 'href', 'set');
    
    component.login();
    
    expect(spy).toHaveBeenCalledWith(`${window.location.origin}/protected/v8/resource`);
  });
});
