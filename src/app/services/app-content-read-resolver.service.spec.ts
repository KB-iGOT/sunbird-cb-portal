/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { of, throwError } from 'rxjs'
import { AppContentResolverService } from './app-content-read-resolver.service'

describe('AppContentResolverService', () => {
  let service: AppContentResolverService
  let mockWidgetContentService: any
  let mockActivatedRouteSnapshot: any
  let mockRouterStateSnapshot: any

  beforeEach(() => {
    mockWidgetContentService = {
      fetchProgramContent: jest.fn(),
    }

    service = new AppContentResolverService(mockWidgetContentService)

    mockActivatedRouteSnapshot = {
      queryParams: {},
    }
    mockRouterStateSnapshot = {}
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(service).toBeTruthy()
    })

    it('should be defined', () => {
      expect(service).toBeDefined()
    })

    it('should store contentSvc reference', () => {
      expect((service as any).contentSvc).toBe(mockWidgetContentService)
    })
  })

  describe('resolve - collectionId not provided', () => {
    it('should return error when collectionId is not provided', (done) => {
      mockActivatedRouteSnapshot.queryParams = {}

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result).toEqual({ error: 'Collection Id not found', data: null })
        done()
      })
    })

    it('should return error when queryParams is undefined', (done) => {
      mockActivatedRouteSnapshot.queryParams = undefined

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result).toEqual({ error: 'Collection Id not found', data: null })
        done()
      })
    })

    it('should return error when queryParams is null', (done) => {
      mockActivatedRouteSnapshot.queryParams = null

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result).toEqual({ error: 'Collection Id not found', data: null })
        done()
      })
    })

    it('should return error when collectionId is empty string', (done) => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: '' }

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result).toEqual({ error: 'Collection Id not found', data: null })
        done()
      })
    })

    it('should not call fetchProgramContent when collectionId is not provided', (done) => {
      mockActivatedRouteSnapshot.queryParams = {}

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe(() => {
        expect(mockWidgetContentService.fetchProgramContent).not.toHaveBeenCalled()
        done()
      })
    })
  })

  describe('resolve - collectionId provided', () => {
    it('should fetch content when collectionId is provided', (done) => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: 'test-id' }
      const mockResponse = { data: 'test-data' }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of(mockResponse))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result).toEqual({ data: mockResponse, error: null })
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledWith('test-id')
        done()
      })
    })

    it('should call fetchProgramContent with correct collectionId', (done) => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: 'collection-123' }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of({ data: 'test' }))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe(() => {
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledWith('collection-123')
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledTimes(1)
        done()
      })
    })

    it('should handle successful response with complex data', (done) => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: 'test-id' }
      const mockResponse = {
        responseData: [
          { name: 'item1', id: '1' },
          { name: 'item2', id: '2' },
        ],
      }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of(mockResponse))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result.data).toEqual(mockResponse)
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should handle successful response with empty data', (done) => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: 'test-id' }
      const mockResponse = {}
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of(mockResponse))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result.data).toEqual(mockResponse)
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should handle successful response with array data', (done) => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: 'test-id' }
      const mockResponse = [1, 2, 3, 4, 5]
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of(mockResponse))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result.data).toEqual(mockResponse)
        expect(result.error).toBeNull()
        done()
      })
    })
  })

  describe('resolve - MLId (Multilingual Content Id)', () => {
    it('should use MLId when provided and different from collectionId', (done) => {
      mockActivatedRouteSnapshot.queryParams = {
        collectionId: 'original-id',
        MLId: 'multilingual-id',
      }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of({ data: 'test' }))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe(() => {
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledWith('multilingual-id')
        done()
      })
    })

    it('should use collectionId when MLId is same as collectionId', (done) => {
      mockActivatedRouteSnapshot.queryParams = {
        collectionId: 'same-id',
        MLId: 'same-id',
      }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of({ data: 'test' }))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe(() => {
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledWith('same-id')
        done()
      })
    })

    it('should use collectionId when MLId is not provided', (done) => {
      mockActivatedRouteSnapshot.queryParams = {
        collectionId: 'collection-id',
      }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of({ data: 'test' }))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe(() => {
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledWith('collection-id')
        done()
      })
    })

    it('should use MLId when only MLId is provided', (done) => {
      mockActivatedRouteSnapshot.queryParams = {
        MLId: 'ml-only-id',
      }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of({ data: 'test' }))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe(() => {
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledWith('ml-only-id')
        done()
      })
    })

    it('should prioritize MLId over collectionId when both are different', (done) => {
      mockActivatedRouteSnapshot.queryParams = {
        collectionId: 'col-123',
        MLId: 'ml-456',
      }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of({ data: 'test' }))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe(() => {
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledWith('ml-456')
        expect(mockWidgetContentService.fetchProgramContent).not.toHaveBeenCalledWith('col-123')
        done()
      })
    })

    it('should handle MLId as empty string', (done) => {
      mockActivatedRouteSnapshot.queryParams = {
        collectionId: 'col-123',
        MLId: '',
      }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of({ data: 'test' }))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe(() => {
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledWith('col-123')
        done()
      })
    })
  })

  describe('resolve - error handling', () => {
    it('should handle error when content fetch fails', (done) => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: 'test-id' }
      const mockError = new Error('Fetch failed')
      mockWidgetContentService.fetchProgramContent.mockReturnValue(throwError(mockError))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result).toEqual({ error: mockError, data: null })
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledWith('test-id')
        done()
      })
    })

    it('should handle HTTP error response', (done) => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: 'test-id' }
      const mockError = {
        status: 404,
        statusText: 'Not Found',
        message: 'Content not found',
      }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(throwError(mockError))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result.error).toEqual(mockError)
        expect(result.data).toBeNull()
        done()
      })
    })

    it('should handle network error', (done) => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: 'test-id' }
      const mockError = { message: 'Network error' }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(throwError(mockError))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result.error).toEqual(mockError)
        expect(result.data).toBeNull()
        done()
      })
    })

    it('should handle timeout error', (done) => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: 'test-id' }
      const mockError = { name: 'TimeoutError', message: 'Request timeout' }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(throwError(mockError))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result.error).toEqual(mockError)
        expect(result.data).toBeNull()
        done()
      })
    })

    it('should handle string error', (done) => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: 'test-id' }
      const mockError = 'String error message'
      mockWidgetContentService.fetchProgramContent.mockReturnValue(throwError(mockError))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result.error).toEqual(mockError)
        expect(result.data).toBeNull()
        done()
      })
    })
  })

  describe('resolve - edge cases', () => {
    it('should handle very long collectionId', (done) => {
      const longId = 'a'.repeat(1000)
      mockActivatedRouteSnapshot.queryParams = { collectionId: longId }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of({ data: 'test' }))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe(() => {
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledWith(longId)
        done()
      })
    })

    it('should handle collectionId with special characters', (done) => {
      const specialId = 'col-123_@#$%'
      mockActivatedRouteSnapshot.queryParams = { collectionId: specialId }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of({ data: 'test' }))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe(() => {
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledWith(specialId)
        done()
      })
    })

    it('should handle collectionId with spaces', (done) => {
      const idWithSpaces = 'col 123 test'
      mockActivatedRouteSnapshot.queryParams = { collectionId: idWithSpaces }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of({ data: 'test' }))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe(() => {
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledWith(idWithSpaces)
        done()
      })
    })

    it('should handle numeric collectionId', (done) => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: 12345 }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of({ data: 'test' }))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe(() => {
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalled()
        done()
      })
    })

    it('should handle extra query parameters', (done) => {
      mockActivatedRouteSnapshot.queryParams = {
        collectionId: 'test-id',
        extraParam1: 'value1',
        extraParam2: 'value2',
      }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of({ data: 'test' }))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe(() => {
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledWith('test-id')
        done()
      })
    })

    it('should handle null response from fetchProgramContent', (done) => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: 'test-id' }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of(null))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result.data).toBeNull()
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should handle undefined response from fetchProgramContent', (done) => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: 'test-id' }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of(undefined))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result.data).toBeUndefined()
        expect(result.error).toBeNull()
        done()
      })
    })
  })

  describe('resolve - multiple calls', () => {
    it('should handle multiple resolve calls with different IDs', (done) => {
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of({ data: 'test' }))

      mockActivatedRouteSnapshot.queryParams = { collectionId: 'id-1' }
      service.resolve(mockActivatedRouteSnapshot, mockRouterStateSnapshot).subscribe()

      mockActivatedRouteSnapshot.queryParams = { collectionId: 'id-2' }
      service.resolve(mockActivatedRouteSnapshot, mockRouterStateSnapshot).subscribe()

      mockActivatedRouteSnapshot.queryParams = { collectionId: 'id-3' }
      service.resolve(mockActivatedRouteSnapshot, mockRouterStateSnapshot).subscribe(() => {
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledTimes(3)
        done()
      })
    })

    it('should handle consecutive resolve calls', (done) => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: 'test-id' }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of({ data: 'test' }))

      service.resolve(mockActivatedRouteSnapshot, mockRouterStateSnapshot).subscribe()
      service.resolve(mockActivatedRouteSnapshot, mockRouterStateSnapshot).subscribe(() => {
        expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledTimes(2)
        done()
      })
    })
  })

  describe('resolve - return type validation', () => {
    it('should return observable', () => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: 'test-id' }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of({ data: 'test' }))

      const result = service.resolve(mockActivatedRouteSnapshot, mockRouterStateSnapshot)

      expect(result).toBeDefined()
      expect(typeof result.subscribe).toBe('function')
    })

    it('should return IResolveResponse structure with data', (done) => {
      mockActivatedRouteSnapshot.queryParams = { collectionId: 'test-id' }
      mockWidgetContentService.fetchProgramContent.mockReturnValue(of({ data: 'test' }))

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result.data).toBeDefined()
        expect(result.error).toBeDefined()
        done()
      })
    })

    it('should return IResolveResponse structure with error', (done) => {
      mockActivatedRouteSnapshot.queryParams = {}

      service.resolve(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      ).subscribe((result) => {
        expect(result.data).toBeDefined()
        expect(result.error).toBeDefined()
        done()
      })
    })
  })
})