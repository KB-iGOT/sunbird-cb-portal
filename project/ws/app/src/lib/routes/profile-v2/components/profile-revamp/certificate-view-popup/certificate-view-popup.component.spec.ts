import { CertificateViewPopupComponent } from './certificate-view-popup.component'

describe('CertificateViewPopupComponent (no TestBed)', () => {
  let component: CertificateViewPopupComponent
  let mockDialogRef: any
  let mockPipeCertificateImageURL: any

  beforeEach(() => {
    mockDialogRef = {
      close: jest.fn(),
    }

    mockPipeCertificateImageURL = {
      transform: jest.fn((url: string) => `transformed-${url}`),
    }

    jest.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should create the component', () => {
      const mockData = { certificateUrl: 'https://test.com/cert.pdf' }
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, mockData)

      expect(component).toBeDefined()
      expect(component.certificateUrl).toBe('')
    })

    it('should initialize with data containing certificateUrl', () => {
      const mockData = { certificateUrl: 'https://test.com/certificate.pdf' }
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, mockData)

      expect(component.data).toBe(mockData)
      expect(component.certificateUrl).toBe('')
    })

    it('should initialize with data without certificateUrl', () => {
      const mockData = { otherProperty: 'test' }
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, mockData)

      expect(component.data).toBe(mockData)
      expect(component.certificateUrl).toBe('')
    })

    it('should initialize with null data', () => {
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, null)

      expect(component.data).toBe(null)
      expect(component.certificateUrl).toBe('')
    })

    it('should initialize with undefined data', () => {
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, undefined)

      expect(component.data).toBe(undefined)
      expect(component.certificateUrl).toBe('')
    })

    it('should initialize with empty object data', () => {
      const emptyData = {} as any
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, emptyData)

      expect(component.data).toBe(emptyData)
      expect(component.certificateUrl).toBe('')
    })
  })

  describe('ngOnInit', () => {
    it('should set certificateUrl when data contains valid certificateUrl', () => {
      const testUrl = 'https://test.com/sample-certificate.pdf'
      const testData = { certificateUrl: testUrl }
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, testData)

      component.ngOnInit()

      expect(component.certificateUrl).toBe(testUrl)
    })

    it('should not set certificateUrl when data is null', () => {
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, null)

      component.ngOnInit()

      expect(component.certificateUrl).toBe('')
    })

    it('should not set certificateUrl when data is undefined', () => {
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, undefined)

      component.ngOnInit()

      expect(component.certificateUrl).toBe('')
    })

    it('should not set certificateUrl when data exists but certificateUrl is missing', () => {
      const testData = { otherProperty: 'test' }
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, testData)

      component.ngOnInit()

      expect(component.certificateUrl).toBe('')
    })

    it('should not set certificateUrl when data exists but certificateUrl is empty string', () => {
      const testData = { certificateUrl: '' }
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, testData)

      component.ngOnInit()

      expect(component.certificateUrl).toBe('')
    })

    it('should not set certificateUrl when data exists but certificateUrl is null', () => {
      const testData = { certificateUrl: null }
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, testData)

      component.ngOnInit()

      expect(component.certificateUrl).toBe('')
    })

    it('should not set certificateUrl when data exists but certificateUrl is undefined', () => {
      const testData = { certificateUrl: undefined }
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, testData)

      component.ngOnInit()

      expect(component.certificateUrl).toBe('')
    })

    it('should handle data with multiple properties including certificateUrl', () => {
      const testUrl = 'https://test.com/multi-prop-certificate.pdf'
      const testData = {
        certificateUrl: testUrl,
        title: 'Test Certificate',
        issuer: 'Test Organization',
      }
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, testData)

      component.ngOnInit()

      expect(component.certificateUrl).toBe(testUrl)
    })

    it('should process certificateUrl through getUrl method', () => {
      const testUrl = 'https://storage.googleapis.com/bucket/userAchievements/cert123.pdf'
      const testData = { certificateUrl: testUrl }
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, testData)

      component.ngOnInit()

      expect(component.certificateUrl).toBe('transformed-/userAchievements/cert123.pdf')
      expect(mockPipeCertificateImageURL.transform).toHaveBeenCalledWith('/userAchievements/cert123.pdf')
    })
  })

  describe('getUrl', () => {
    beforeEach(() => {
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, {})
    })

    it('should return transformed URL when URL contains storage.googleapis', () => {
      const googleStorageUrl = 'https://storage.googleapis.com/bucket/userAchievements/certificate.pdf'

      const result = component.getUrl(googleStorageUrl)

      expect(result).toBe('transformed-/userAchievements/certificate.pdf')
      expect(mockPipeCertificateImageURL.transform).toHaveBeenCalledWith('/userAchievements/certificate.pdf')
    })

    it('should return original URL when URL does not contain storage.googleapis', () => {
      const regularUrl = 'https://example.com/certificate.pdf'

      const result = component.getUrl(regularUrl)

      expect(result).toBe(regularUrl)
      expect(mockPipeCertificateImageURL.transform).not.toHaveBeenCalled()
    })

    it('should handle URL with storage.googleapis.com and complex path', () => {
      const complexUrl = 'https://storage.googleapis.com/my-bucket/userAchievements/subfolder/cert-2024.pdf'

      const result = component.getUrl(complexUrl)

      expect(result).toBe('transformed-/userAchievements/subfolder/cert-2024.pdf')
      expect(mockPipeCertificateImageURL.transform).toHaveBeenCalledWith('/userAchievements/subfolder/cert-2024.pdf')
    })

    it('should handle URL with storage.googleapis and special characters', () => {
      const specialUrl = 'https://storage.googleapis.com/bucket/userAchievements/cert%20with%20spaces.pdf'

      const result = component.getUrl(specialUrl)

      expect(result).toBe('transformed-/userAchievements/cert%20with%20spaces.pdf')
    })

    it('should return original URL for non-Google Storage URLs', () => {
      const awsUrl = 'https://s3.amazonaws.com/bucket/certificate.pdf'

      const result = component.getUrl(awsUrl)

      expect(result).toBe(awsUrl)
      expect(mockPipeCertificateImageURL.transform).not.toHaveBeenCalled()
    })

    it('should handle URL with storage.googleapis and multiple userAchievements paths', () => {
      const multiPathUrl = 'https://storage.googleapis.com/bucket/path/userAchievements/file/userAchievements/cert.pdf'

      const result = component.getUrl(multiPathUrl)

      // Split by '/userAchievements/' creates array: ['...path', 'file', 'cert.pdf']
      // Taking [1] gives 'file', so result is '/userAchievements/file'
      expect(result).toBe('transformed-/userAchievements/file')
      expect(mockPipeCertificateImageURL.transform).toHaveBeenCalledWith('/userAchievements/file')
    })

    it('should handle URL with query parameters', () => {
      const urlWithParams = 'https://test.com/certificate.pdf?token=abc123&version=1'

      const result = component.getUrl(urlWithParams)

      expect(result).toBe(urlWithParams)
    })

    it('should handle relative URLs', () => {
      const relativeUrl = '/assets/certificates/cert.pdf'

      const result = component.getUrl(relativeUrl)

      expect(result).toBe(relativeUrl)
    })

    it('should handle URL with storage.googleapis in middle of path', () => {
      const midPathUrl = 'https://example.com/storage.googleapis/userAchievements/cert.pdf'

      const result = component.getUrl(midPathUrl)

      expect(result).toBe('transformed-/userAchievements/cert.pdf')
      expect(mockPipeCertificateImageURL.transform).toHaveBeenCalledWith('/userAchievements/cert.pdf')
    })
  })

  describe('closePopup', () => {
    beforeEach(() => {
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, {})
    })

    it('should call dialogRef.close when closePopup is called', () => {
      component.closePopup()

      expect(mockDialogRef.close).toHaveBeenCalled()
      expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
    })

    it('should call dialogRef.close without parameters', () => {
      component.closePopup()

      expect(mockDialogRef.close).toHaveBeenCalledWith()
    })

    it('should handle multiple calls to closePopup', () => {
      component.closePopup()
      component.closePopup()
      component.closePopup()

      expect(mockDialogRef.close).toHaveBeenCalledTimes(3)
    })
  })

  describe('Component Properties', () => {
    it('should initialize certificateUrl as empty string by default', () => {
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, {})

      expect(component.certificateUrl).toBe('')
    })

    it('should have data property accessible publicly', () => {
      const testData = { certificateUrl: 'https://test.com/cert.pdf' }
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, testData)

      expect(component.data).toBeDefined()
      expect(component.data).toBe(testData)
    })

    it('should maintain certificateUrl value after setting in ngOnInit', () => {
      const testUrl = 'https://test.com/persistent-certificate.pdf'
      const testData = { certificateUrl: testUrl }
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, testData)

      component.ngOnInit()

      expect(component.certificateUrl).toBe(testUrl)

      // Verify it persists
      expect(component.certificateUrl).toBe(testUrl)
    })
  })

  describe('Integration Tests', () => {
    it('should complete full lifecycle: constructor -> ngOnInit -> closePopup', () => {
      const testUrl = 'https://test.com/lifecycle-certificate.pdf'
      const testData = { certificateUrl: testUrl }
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, testData)

      // Initial state
      expect(component.certificateUrl).toBe('')
      expect(component.data).toBe(testData)

      // After ngOnInit
      component.ngOnInit()
      expect(component.certificateUrl).toBe(testUrl)

      // After closePopup
      component.closePopup()
      expect(mockDialogRef.close).toHaveBeenCalled()
    })

    it('should handle Google Storage URL throughout lifecycle', () => {
      const googleUrl = 'https://storage.googleapis.com/bucket/userAchievements/test.pdf'
      const testData = { certificateUrl: googleUrl }
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, testData)

      component.ngOnInit()

      expect(component.certificateUrl).toBe('transformed-/userAchievements/test.pdf')
      expect(mockPipeCertificateImageURL.transform).toHaveBeenCalled()

      component.closePopup()
      expect(mockDialogRef.close).toHaveBeenCalled()
    })

    it('should handle edge case with falsy certificateUrl values', () => {
      const falsyValues = [false, 0, Number.NaN, '']

      falsyValues.forEach((value: any) => {
        const testData = { certificateUrl: value }
        component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, testData)

        component.ngOnInit()

        expect(component.certificateUrl).toBe('')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle closePopup when dialogRef.close throws error', () => {
      const mockErrorDialogRef = {
        close: jest.fn().mockImplementation(() => {
          throw new Error('Dialog close error')
        }),
      } as any

      component = new CertificateViewPopupComponent(
        mockErrorDialogRef,
        mockPipeCertificateImageURL,
        {}
      )

      expect(() => {
        component.closePopup()
      }).toThrow('Dialog close error')
    })

    it('should handle data with nested certificateUrl property', () => {
      const nestedData = {
        certificate: {
          certificateUrl: 'https://test.com/nested-certificate.pdf',
        },
        certificateUrl: 'https://test.com/direct-certificate.pdf',
      }

      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, nestedData)
      component.ngOnInit()

      // Should use the direct certificateUrl property
      expect(component.certificateUrl).toBe('https://test.com/direct-certificate.pdf')
    })

    it('should handle getUrl when URL does not contain userAchievements folder', () => {
      const urlWithoutFolder = 'https://storage.googleapis.com/bucket/other-path/cert.pdf'

      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, {})
      const result = component.getUrl(urlWithoutFolder)

      // Will split by '/userAchievements/' and get undefined for [1], but should still work
      expect(result).toBeDefined()
    })
  })

  describe('Type Safety', () => {
    it('should handle data parameter with any type', () => {
      const anyTypeData: any = {
        certificateUrl: 'https://test.com/any-type-certificate.pdf',
        randomProperty: 'random value',
      }

      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, anyTypeData)
      component.ngOnInit()

      expect(component.certificateUrl).toBe('https://test.com/any-type-certificate.pdf')
    })

    it('should handle certificateUrl with different string formats', () => {
      const stringData = { certificateUrl: 'string-url' }
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, stringData)
      component.ngOnInit()
      expect(component.certificateUrl).toBe('string-url')
    })
  })

  describe('Pipe Transform Integration', () => {
    it('should call transform method with correct path for Google Storage URLs', () => {
      const googleUrl = 'https://storage.googleapis.com/my-bucket/userAchievements/certificate-2024.pdf'
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, {})

      component.getUrl(googleUrl)

      expect(mockPipeCertificateImageURL.transform).toHaveBeenCalledWith('/userAchievements/certificate-2024.pdf')
      expect(mockPipeCertificateImageURL.transform).toHaveBeenCalledTimes(1)
    })

    it('should not call transform method for non-Google Storage URLs', () => {
      const regularUrl = 'https://cdn.example.com/certificates/cert.pdf'
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, {})

      component.getUrl(regularUrl)

      expect(mockPipeCertificateImageURL.transform).not.toHaveBeenCalled()
    })

    it('should use transformed URL from pipe', () => {
      mockPipeCertificateImageURL.transform.mockReturnValue('https://signed-url.com/cert.pdf')
      const googleUrl = 'https://storage.googleapis.com/bucket/userAchievements/cert.pdf'
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, {})

      const result = component.getUrl(googleUrl)

      expect(result).toBe('https://signed-url.com/cert.pdf')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string URL', () => {
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, {})

      const result = component.getUrl('')

      expect(result).toBe('')
    })

    it('should handle URL with only storage.googleapis', () => {
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, {})

      const result = component.getUrl('storage.googleapis')

      expect(result).toBeDefined()
      expect(mockPipeCertificateImageURL.transform).toHaveBeenCalled()
    })

    it('should handle certificateUrl with whitespace', () => {
      const testData = { certificateUrl: '  https://test.com/cert.pdf  ' }
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, testData)

      component.ngOnInit()

      expect(component.certificateUrl).toBe('  https://test.com/cert.pdf  ')
    })

    it('should handle very long URLs', () => {
      const longUrl = `https://storage.googleapis.com/very-long-bucket-name/userAchievements/${'a'.repeat(200)}.pdf`
      component = new CertificateViewPopupComponent(mockDialogRef, mockPipeCertificateImageURL, {})

      const result = component.getUrl(longUrl)

      expect(result).toContain('transformed-')
      expect(mockPipeCertificateImageURL.transform).toHaveBeenCalled()
    })
  })
})
