import { FormDataResolverService } from './form-data-resolver.service'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { FormExtService } from './form-ext.service'
import { HttpClient } from '@angular/common/http'
import { of, throwError } from 'rxjs'
import { ActivatedRouteSnapshot } from '@angular/router'

describe('FormDataResolverService', () => {
  let service: FormDataResolverService
  let mockHttpClient: jest.Mocked<HttpClient>
  let mockConfigSvc: jest.Mocked<ConfigurationsService>
  let mockFormSvc: jest.Mocked<FormExtService>
  let mockActivatedRouteSnapshot: Partial<ActivatedRouteSnapshot>

  beforeEach(() => {
    // Create mock implementations
    mockHttpClient = {
      get: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>

    mockConfigSvc = {
      sitePath: 'test-site-path',
    } as unknown as jest.Mocked<ConfigurationsService>

    mockFormSvc = {
      formReadData: jest.fn(),
    } as unknown as jest.Mocked<FormExtService>

    // Create the service with mocked dependencies
    service = new FormDataResolverService(
      mockHttpClient,
      mockConfigSvc,
      mockFormSvc
    )

    // Set up the mock route snapshot
    mockActivatedRouteSnapshot = {
      data: {
        pageKey: 'test-page-key',
        pageType: 'test-page-type'
      }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('resolve', () => {
    it('should return data from formSvc when API call succeeds', (done) => {
      // Mock API response
      const mockFormResponse = {
        result: {
          form: {
            data: { testKey: 'testValue' }
          }
        }
      }

      mockFormSvc.formReadData.mockReturnValue(of(mockFormResponse))

      // Call the resolve method
      service.resolve(mockActivatedRouteSnapshot as ActivatedRouteSnapshot, {} as any).subscribe(response => {
        // Verify the formReadData was called with correct parameters
        expect(mockFormSvc.formReadData).toHaveBeenCalledWith({
          request: {
            type: 'page',
            subType: 'test-page-key',
            action: 'page-configuration',
            component: 'portal',
            rootOrgId: '*',
          }
        })

        // Verify response data structure
        expect(response).toEqual({
          data: { testKey: 'testValue' },
          error: null
        })
        done()
      })
    })

    it('should fallback to HTTP request when formSvc call fails', (done) => {
      // Mock form service to fail
      mockFormSvc.formReadData.mockReturnValue(throwError('API Error'))

      // Mock HTTP response
      const mockHttpResponse = { fallbackKey: 'fallbackValue' }
      mockHttpClient.get.mockReturnValue(of(mockHttpResponse))

      // Call the resolve method
      service.resolve(mockActivatedRouteSnapshot as ActivatedRouteSnapshot, {} as any).subscribe(response => {
        // Verify formReadData was called
        expect(mockFormSvc.formReadData).toHaveBeenCalled()

        // Verify HTTP get was called with correct URL
        expect(mockHttpClient.get).toHaveBeenCalledWith('test-site-path/test-page-type/test-page-key.json')

        // Verify response data structure
        expect(response).toEqual({
          data: mockHttpResponse,
          error: null
        })
        done()
      })
    })

    it('should return error when both formSvc and HTTP fallback fail', (done) => {
      // Mock form service to fail
      mockFormSvc.formReadData.mockReturnValue(throwError('API Error'))

      // Mock HTTP request to fail
      const mockHttpError = new Error('HTTP Error')
      mockHttpClient.get.mockReturnValue(throwError(mockHttpError))

      // Call the resolve method
      service.resolve(mockActivatedRouteSnapshot as ActivatedRouteSnapshot, {} as any).subscribe(response => {
        // Verify both service calls were made
        expect(mockFormSvc.formReadData).toHaveBeenCalled()
        expect(mockHttpClient.get).toHaveBeenCalled()

        // Verify error response structure
        expect(response).toEqual({
          data: null,
          error: mockHttpError
        })
        done()
      })
    })

    it('should use default pageType "feature" when pageType not provided in route data', (done) => {
      const routeWithoutPageType: Partial<ActivatedRouteSnapshot> = {
        data: {
          pageKey: 'test-page-key',
          // pageType is deliberately missing
        }
      }

      mockFormSvc.formReadData.mockReturnValue(throwError('API Error'))
      mockHttpClient.get.mockReturnValue(of({ data: 'test' }))

      service.resolve(routeWithoutPageType as ActivatedRouteSnapshot, {} as any).subscribe(() => {
        // Verify the URL contains the default pageType 'feature'
        expect(mockHttpClient.get).toHaveBeenCalledWith('test-site-path/feature/test-page-key.json')
        done()
      })
    })
  })
})