import { ExternalUrlResolverService } from './external-url-resolver.service'
import { ActivatedRouteSnapshot } from '@angular/router'

// Mock ActivatedRouteSnapshot
const createMockActivatedRouteSnapshot = (externalUrl: string | null): ActivatedRouteSnapshot => {
  return {
    paramMap: {
      get: jest.fn().mockReturnValue(externalUrl)
    }
  } as any
}

// Mock window.open
const mockWindowOpen = jest.fn()

describe('ExternalUrlResolverService', () => {
  let service: ExternalUrlResolverService

  beforeEach(() => {
    service = new ExternalUrlResolverService()
    
    // Mock window.open globally
    Object.defineProperty(window, 'open', {
      writable: true,
      value: mockWindowOpen
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('canActivate', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
      expect(service.canActivate).toBeDefined()
    })

    it('should open external URL in same window and return false', (done) => {
      // Arrange
      const externalUrl = 'https://example.com'
      const mockRoute = createMockActivatedRouteSnapshot(externalUrl)

      // Act
      const result = service.canActivate(mockRoute)

      // Assert
      result.subscribe(canActivate => {
        expect(canActivate).toBe(false)
        expect(mockRoute.paramMap.get).toHaveBeenCalledWith('externalUrl')
        expect(mockWindowOpen).toHaveBeenCalledWith(externalUrl, '_self')
        done()
      })
    })

    it('should handle null external URL parameter', (done) => {
      // Arrange
      const mockRoute = createMockActivatedRouteSnapshot(null)

      // Act
      const result = service.canActivate(mockRoute)

      // Assert
      result.subscribe(canActivate => {
        expect(canActivate).toBe(false)
        expect(mockRoute.paramMap.get).toHaveBeenCalledWith('externalUrl')
        expect(mockWindowOpen).toHaveBeenCalledWith(null, '_self')
        done()
      })
    })

    it('should handle empty string external URL parameter', (done) => {
      // Arrange
      const externalUrl = ''
      const mockRoute = createMockActivatedRouteSnapshot(externalUrl)

      // Act
      const result = service.canActivate(mockRoute)

      // Assert
      result.subscribe(canActivate => {
        expect(canActivate).toBe(false)
        expect(mockRoute.paramMap.get).toHaveBeenCalledWith('externalUrl')
        expect(mockWindowOpen).toHaveBeenCalledWith(externalUrl, '_self')
        done()
      })
    })

    it('should return Observable<boolean>', () => {
      // Arrange
      const externalUrl = 'https://test.com'
      const mockRoute = createMockActivatedRouteSnapshot(externalUrl)

      // Act
      const result = service.canActivate(mockRoute)

      // Assert
    //  expect(result).toBeInstanceOf(Object)
      expect(typeof result.subscribe).toBe('function')
    })

    it('should call paramMap.get with correct parameter name', () => {
      // Arrange
      const externalUrl = 'https://test.com'
      const mockRoute = createMockActivatedRouteSnapshot(externalUrl)

      // Act
      service.canActivate(mockRoute)

      // Assert
      expect(mockRoute.paramMap.get).toHaveBeenCalledWith('externalUrl')
      expect(mockRoute.paramMap.get).toHaveBeenCalledTimes(1)
    })

    it('should always return false regardless of URL', (done) => {
      // Arrange
      const testUrls = [
        'https://google.com',
        'http://example.com',
        'https://subdomain.domain.com/path?query=value',
        'mailto:test@example.com',
        'ftp://files.example.com'
      ]

      let completedTests = 0
      const totalTests = testUrls.length

      testUrls.forEach(url => {
        const mockRoute = createMockActivatedRouteSnapshot(url)
        
        // Act
        service.canActivate(mockRoute).subscribe(result => {
          // Assert
          expect(result).toBe(false)
          
          completedTests++
          if (completedTests === totalTests) {
            done()
          }
        })
      })
    })
  })
})