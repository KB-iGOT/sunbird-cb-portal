import { NetworkHubComponent } from './network-hub.component';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { HomePageService } from 'src/app/services/home-page.service';
import { TranslateService } from '@ngx-translate/core';
import { EventService, WsEvents } from '@sunbird-cb/utils-v2';

describe('NetworkHubComponent', () => {
  let component: NetworkHubComponent;
  let mockConfigService: Partial<ConfigurationsService>;
  let mockHomePageService: Partial<HomePageService>;
  let mockMatSnackBar: Partial<MatSnackBar>;
  let mockTranslateService: Partial<TranslateService>;
  let mockEventService: Partial<EventService>;

  beforeEach(() => {
    mockConfigService = {
      userProfile: { departmentName: 'Engineering', userId: 'user123' }
    };

    mockHomePageService = {
      getNetworkRecommendations: jest.fn(),
      getRecentRequests: jest.fn(),
      connectToNetwork: jest.fn(),
      updateConnection: jest.fn(),
    };

    mockMatSnackBar = {
      open: jest.fn(),
    };

    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn().mockReturnValue('translatedString'),
    };

    mockEventService = {
      raiseInteractTelemetry: jest.fn(),
    };

    component = new NetworkHubComponent(
      mockConfigService as ConfigurationsService,
      mockHomePageService as HomePageService,
      mockMatSnackBar as MatSnackBar,
      mockTranslateService as TranslateService,
      mockEventService as EventService
    );
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set default language on initialization if localStorage has "websiteLanguage"', () => {
    localStorage.setItem('websiteLanguage', 'en');
    component.ngOnInit();
    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(mockTranslateService.use).toHaveBeenCalledWith('en');
  });

  it('should fetch network recommendations if networkSuggestions is active in networkConfig', () => {
    component.networkConfig = { networkSuggestions: { active: true } };
   // const mockResponse = { result: { data: [{ results: ['result1', 'result2'] }] } };
   // mockHomePageService.getNetworkRecommendations.mockReturnValue(of(mockResponse));

    component.ngOnInit();

    expect(mockHomePageService.getNetworkRecommendations).toHaveBeenCalled();
    expect(component.network.networkRecommended).toEqual(['result1', 'result2']);
  });

  it('should not fetch network recommendations if networkSuggestions is not active in networkConfig', () => {
    component.networkConfig = { networkSuggestions: { active: false } };
    component.ngOnInit();

    expect(mockHomePageService.getNetworkRecommendations).not.toHaveBeenCalled();
  });

  it('should handle error when fetching network recommendations fails', () => {
    component.networkConfig = { networkSuggestions: { active: true } };
    //const mockErrorResponse = new HttpErrorResponse({ error: 'Error' });
   // mockHomePageService.getNetworkRecommendations.mockReturnValue(throwError(mockErrorResponse));

    component.fetchNetworkRecommendations();

    expect(component.network.suggestionsLoader).toBe(false);
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to connect due to some error!');
  });

  it('should fetch recent requests if recentRequests is active in networkConfig', () => {
    component.networkConfig = { recentRequests: { active: true } };
   // const mockResponse = { result: { data: [{ fullName: 'john doe', connecting: false }] } };
   // mockHomePageService.getRecentRequests.mockReturnValue(of(mockResponse));

    component.ngOnInit();

    expect(mockHomePageService.getRecentRequests).toHaveBeenCalled();
   // expect(component.recentRequests.data[0].fullName).toBe('John doe');
  });

  it('should handle error when fetching recent requests fails', () => {
    component.networkConfig = { recentRequests: { active: true } };
    // const mockErrorResponse = new HttpErrorResponse({ error: 'Error' });
    // mockHomePageService.getRecentRequests.mockReturnValue(throwError(mockErrorResponse));

    component.fetchRecentRequests();

    expect(component.recentRequests.loadSkeleton).toBe(false);
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to update connection, due to some error!');
  });

  it('should handle update request and show success message when request is approved', () => {
    const event = { action: 'Approved', payload: {}, reqObject: { connecting: true } };
    // mockHomePageService.updateConnection.mockReturnValue(of({}));

    component.handleUpdateRequest(event);

    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Request accepted successfully');
    expect(event.reqObject.connecting).toBe(false);
  });

  it('should show error message when update request fails', () => {
    const event = { action: 'Approved', payload: {}, reqObject: { connecting: true } };
    //const mockErrorResponse = new HttpErrorResponse({ error: 'Error' });
    // mockHomePageService.updateConnection.mockReturnValue(throwError(mockErrorResponse));

    component.handleUpdateRequest(event);

    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to update connection, due to some error!');
    expect(event.reqObject.connecting).toBe(false);
  });

  it('should handle connect and show success message', () => {
    const obj = { userId: 'user2', employmentDetails: { departmentName: 'HR' }, connecting: false };
    const payload = {
      connectionId: 'user2',
      userIdFrom: 'user123',
      userNameFrom: 'user123',
      userDepartmentFrom: 'Engineering',
      userIdTo: 'user2',
      userNameTo: 'user2',
      userDepartmentTo: 'HR',
    };

    // mockHomePageService.connectToNetwork.mockReturnValue(of({}));

    component.handleConnect(obj);

    expect(mockHomePageService.connectToNetwork).toHaveBeenCalledWith(payload);
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Connection request sent successfully!');
  });

  it('should handle connect failure and show error message', () => {
    const obj = { userId: 'user2', employmentDetails: { departmentName: 'HR' }, connecting: false };
    // const mockErrorResponse = new HttpErrorResponse({ error: 'Error' });
    // mockHomePageService.connectToNetwork.mockReturnValue(throwError(mockErrorResponse));

    component.handleConnect(obj);

    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to connect due to some error!');
  });

  it('should raise telemetry event when show all is clicked', () => {
    component.handleShowAll();

    expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
      {
        id: 'show-all',
        type: WsEvents.EnumInteractTypes.CLICK,
        subType: WsEvents.EnumInteractSubTypes.SUGGESTED_CONNECTIONS,
      },
      {},
      {
        module: WsEvents.EnumTelemetrymodules.HOME,
      }
    );
  });

  it('should create initials from first name', () => {
    const initials = component.createInitials('John Doe');
    expect(initials).toBe('JD');
  });
});
