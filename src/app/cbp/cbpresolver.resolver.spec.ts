import { of, throwError } from 'rxjs';
import {CbpResolverService} from './cbpresolver.resolver'
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('CbpResolverService', () => {
  let service: CbpResolverService;
  let httpClientMock: jest.Mocked<HttpClient>;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let mockRouterStateSnapshot: RouterStateSnapshot;

  beforeEach(() => {
    // Create mock for HttpClient
    httpClientMock = {
      get: jest.fn()
    } as unknown as jest.Mocked<HttpClient>;

    // Create service instance with mocked dependencies
    service = new CbpResolverService(httpClientMock);

    // Create mock route and state
    mockActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    mockRouterStateSnapshot = {} as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should resolve with data when HTTP request is successful', (done) => {
    // Mock data
    const mockData = { key: 'value' };
    
    // Setup the mock to return an observable with the mock data
    httpClientMock.get.mockReturnValue(of(mockData));

    // Call the resolve method
    service.resolve(mockActivatedRouteSnapshot, mockRouterStateSnapshot).subscribe(result => {
      // Assert the result
      expect(result).toEqual({ data: mockData, error: null });
      expect(httpClientMock.get).toHaveBeenCalledWith('/assets/configurations/page/cbp.json');
      done();
    });
  });

  it('should resolve with error when HTTP request fails', (done) => {
    // Mock error
    const mockError = new Error('HTTP Error');
    
    // Setup the mock to return an observable that errors
    httpClientMock.get.mockReturnValue(throwError(mockError));

    // Call the resolve method
    service.resolve(mockActivatedRouteSnapshot, mockRouterStateSnapshot).subscribe(result => {
      // Assert the result
      expect(result).toEqual({ data: null, error: mockError });
      expect(httpClientMock.get).toHaveBeenCalledWith('/assets/configurations/page/cbp.json');
      done();
    });
  });
});