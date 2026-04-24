import { of, throwError } from 'rxjs'
import { AppEnrollmentResolverService } from './app-enrollment-resolver.service'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

describe('AppEnrollmentResolverService', () => {
  let service: AppEnrollmentResolverService
  let mockConfigSvc: any
  let mockHttp: any
  let mockDataTransfer: any
  let mockRoute: Partial<ActivatedRouteSnapshot>
  let mockState: Partial<RouterStateSnapshot>

  beforeEach(() => {
    // Mock dependencies
    mockConfigSvc = {
      userProfile: {
        userId: 'test-user-123'
      }
    }

    mockHttp = {
      post: jest.fn()
    }

    mockDataTransfer = {
      getEnrollData: jest.fn(),
      setEnrollData: jest.fn()
    }

    mockRoute = {
      queryParams: { collectionId: 'test-collection-123' }
    }

    mockState = {}

    // Initialize service with mocked dependencies
    service = new AppEnrollmentResolverService(
      mockConfigSvc as any,
      mockHttp as any,
      mockDataTransfer as any
    )

    // Reset window.location.href mock before each test
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://example.com/test'
      },
      writable: true
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  test('should be created', () => {
    expect(service).toBeTruthy()
  })

  test('should return empty data for public or preview URLs', () => {
    // Mock window.location.href for public URL
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://example.com/public/test'
      },
      writable: true
    })

    let result: any
    service.resolve(mockRoute as ActivatedRouteSnapshot, mockState as RouterStateSnapshot)
      .subscribe(res => {
        result = res
      })

    expect(result).toEqual({ error: null, data: null })

    // Mock window.location.href for preview URL
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://example.com/test?something&preview=true'
      },
      writable: true
    })

    service.resolve(mockRoute as ActivatedRouteSnapshot, mockState as RouterStateSnapshot)
      .subscribe(res => {
        result = res
      })

    expect(result).toEqual({ error: null, data: null })
  })

  test('should return data from dataTransfer if available', () => {
    const mockEnrollData = [{ id: 'course1', name: 'Test Course' }]
    mockDataTransfer.getEnrollData.mockReturnValue(mockEnrollData)

    let result: any
    service.resolve(mockRoute as ActivatedRouteSnapshot, mockState as RouterStateSnapshot)
      .subscribe(res => {
        result = res
      })

    expect(mockDataTransfer.getEnrollData).toHaveBeenCalled()
    expect(result).toEqual({ error: null, data: { courses: mockEnrollData } })
    expect(mockHttp.post).not.toHaveBeenCalled() // HTTP call should be skipped
  })

  test('should fetch data from API when dataTransfer has no data', () => {
    // Mock empty data from dataTransfer
    mockDataTransfer.getEnrollData.mockReturnValue(null)

    // Mock HTTP response
    const mockApiResponse = {
      result: {
        courses: [{ id: 'course1', name: 'API Course' }]
      }
    }
    mockHttp.post.mockReturnValue(of(mockApiResponse))

    let result: any
    service.resolve(mockRoute as ActivatedRouteSnapshot, mockState as RouterStateSnapshot)
      .subscribe(res => {
        result = res
      })

    // Verify API call was made with correct parameters
    expect(mockHttp.post).toHaveBeenCalledWith(
      `/apis/proxies/v8/learner/course/v4/user/enrollment/details/test-user-123`,
      {
        request: {
          retiredCoursesEnabled: true,
          courseId: ['test-collection-123']
        }
      }
    )

    // Verify dataTransfer.setEnrollData was called with API response data
    expect(mockDataTransfer.setEnrollData).toHaveBeenCalledWith(mockApiResponse.result.courses)

    // Verify result contains expected data
    expect(result).toEqual({ data: mockApiResponse.result, error: null })
  })

  test('should handle API error', () => {
    // Mock empty data from dataTransfer
    mockDataTransfer.getEnrollData.mockReturnValue(null)

    // Mock HTTP error response
    const mockError = new Error('API Error')
    mockHttp.post.mockReturnValue(throwError(mockError))

    let result: any
    service.resolve(mockRoute as ActivatedRouteSnapshot, mockState as RouterStateSnapshot)
      .subscribe(res => {
        result = res
      })

    // Verify error is handled properly
    expect(result).toEqual({ error: mockError, data: null })
    expect(mockDataTransfer.setEnrollData).not.toHaveBeenCalled()
  })

  test('should handle user with no profile', () => {
    // Mock user with no profile
    mockConfigSvc.userProfile = null

    // Mock empty data from dataTransfer
    mockDataTransfer.getEnrollData.mockReturnValue(null)

    // Mock HTTP response
    const mockApiResponse = {
      result: {
        courses: [{ id: 'course1', name: 'API Course' }]
      }
    }
    mockHttp.post.mockReturnValue(of(mockApiResponse))

    service.resolve(mockRoute as ActivatedRouteSnapshot, mockState as RouterStateSnapshot)
      .subscribe()

    // Verify API call was made with undefined userId (userProfile is null)
    expect(mockHttp.post).toHaveBeenCalledWith(
      `/apis/proxies/v8/learner/course/v4/user/enrollment/details/undefined`,
      expect.any(Object)
    )
  })

  test('should handle empty enrollment data array', () => {
    // Mock empty array from dataTransfer - empty array is falsy via .length=0, so HTTP call IS made
    mockDataTransfer.getEnrollData.mockReturnValue([])

    const mockApiResponse = { result: { courses: [] } }
    mockHttp.post.mockReturnValue(of(mockApiResponse))

    let result: any
    service.resolve(mockRoute as ActivatedRouteSnapshot, mockState as RouterStateSnapshot)
      .subscribe(res => {
        result = res
      })

    expect(mockHttp.post).toHaveBeenCalled() // empty array triggers HTTP call (length=0 is falsy)
    expect(result).toEqual({ data: mockApiResponse.result, error: null })
  })
})