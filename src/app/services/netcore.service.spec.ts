import { NetCoreService } from './netcore.service';
import { HttpClient } from '@angular/common/http';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { of, throwError } from 'rxjs';
import moment from 'moment';

// Mock the smartech function
jest.mock('smartech', () => jest.fn());

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});


describe('NetCoreService', () => {
  let service: NetCoreService;
  let httpClient: HttpClient;
  let configSvc: ConfigurationsService;
  let smartech: jest.Mock;

  beforeEach(() => {
    httpClient = { post: jest.fn(), get: jest.fn() } as unknown as HttpClient;
    configSvc = { sitePath: 'http://example.com' } as unknown as ConfigurationsService;
    service = new NetCoreService(httpClient, configSvc);
    smartech = require('smartech');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('netCoreConfigReadData', () => {
    it('should return the form data if formReadData is successful', () => {
      const payload = { someKey: 'someValue' };
      const mockResponse = { result: { form: { data: { key: 'value' } } } };
      httpClient.post = jest.fn().mockReturnValue(of(mockResponse));

      service.netCoreConfigReadData(payload).subscribe((data) => {
        expect(data).toEqual(mockResponse.result.form.data);
        expect(httpClient.post).toHaveBeenCalledWith('/apis/v1/form/read', payload);
      });
    });

    it('should fallback to http get when formReadData fails', () => {
      const payload = { someKey: 'someValue' };
      httpClient.post = jest.fn().mockReturnValue(throwError(new Error('Error')));
      httpClient.get = jest.fn().mockReturnValue(of({ data: 'fallback data' }));

      service.netCoreConfigReadData(payload).subscribe((data) => {
        expect(data).toEqual('fallback data');
        expect(httpClient.get).toHaveBeenCalledWith('http://example.com/netcore.json');
      });
    });
  });

  describe('netCoreUserLoginSetup', () => {
    it('should call smartech with correct parameters', () => {
      const payload = { user: 'testUser' };
      service.netCoreUserLoginSetup(payload);
      expect(smartech).toHaveBeenCalledWith('contact', '', payload);
    });
  });

  describe('netCoreUserNameUpdate', () => {
    it('should call smartech with correct parameters', () => {
      const payload = { user: 'testUser' };
      service.netCoreUserNameUpdate(payload);
      expect(smartech).toHaveBeenCalledWith('contact', '', payload);
    });
  });

  describe('netCoreUserProfilePhotoUpdate', () => {
    it('should call smartech with correct parameters', () => {
      const payload = { user: 'testUser' };
      service.netCoreUserProfilePhotoUpdate(payload);
      expect(smartech).toHaveBeenCalledWith('contact', '', payload);
    });
  });

  describe('netCoreUserProfileUpdateEvent', () => {
    it('should call smartech with correct parameters for identify and dispatch', () => {
      const payload = { user: 'testUser' };
      const eventName = 'profile_update';
      const userIdentifier = 'user123';

      service.netCoreUserProfileUpdateEvent(payload, eventName, userIdentifier);

      expect(smartech).toHaveBeenCalledWith('identify', userIdentifier);
      expect(smartech).toHaveBeenCalledWith('dispatch', eventName, payload);
    });
  });

  describe('trackEvent', () => {
    it('should call smartech with correct payload and event name', () => {
      const eventName = 'event_name';
      const userIdentifier = 'user123';
      const userpayload = { profile: 'updated' };

      const momentSpy = jest.spyOn(moment.prototype, 'format').mockReturnValue('2025-03-03 10:00:00');

      service.trackEvent(eventName, userIdentifier, userpayload);

      expect(smartech).toHaveBeenCalledWith('identify', userIdentifier);
      expect(smartech).toHaveBeenCalledWith('dispatch', eventName, {
        action_time: '2025-03-03 10:00:00',
        action_device: 'Desktop',
        profile_attribute_updated: '{"profile":"updated"}',
      });

      momentSpy.mockRestore();
    });

    it('should handle when userpayload is undefined', () => {
      const eventName = 'event_name';
      const userIdentifier = 'user123';

      const momentSpy = jest.spyOn(moment.prototype, 'format').mockReturnValue('2025-03-03 10:00:00');

      service.trackEvent(eventName, userIdentifier);

      expect(smartech).toHaveBeenCalledWith('identify', userIdentifier);
      expect(smartech).toHaveBeenCalledWith('dispatch', eventName, {
        action_time: '2025-03-03 10:00:00',
        action_device: 'Desktop',
      });

      momentSpy.mockRestore();
    });
  });
});
