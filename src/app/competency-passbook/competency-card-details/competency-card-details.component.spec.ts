import { CompetencyCardDetailsComponent } from './competency-card-details.component'
import { ActivatedRoute, Router } from '@angular/router'
import { CompetencyPassbookService } from '../competency-passbook.service'
import { TranslateService } from '@ngx-translate/core'
import { MultilingualTranslationsService, EventService, WsEvents, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { CertificateDialogComponent } from '@sunbird-cb/collection/src/lib/_common/certificate-dialog/certificate-dialog.component'
import { of, throwError } from 'rxjs'
import { HttpErrorResponse } from '@angular/common/http'
import { environment } from 'src/environments/environment'

// Mock jsPDF
jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    save: jest.fn()
  }))
}))

// Mock environment
jest.mock('src/environments/environment', () => ({
  environment: {
    compentencyVersionKey: 'v1',
    contentHost: 'https://test.com'
  }
}))

describe('CompetencyCardDetailsComponent', () => {
  let component: CompetencyCardDetailsComponent
  let mockActivatedRoute: jest.Mocked<ActivatedRoute>
  let mockRouter: jest.Mocked<Router>
  let mockCpService: jest.Mocked<CompetencyPassbookService>
  let mockTranslate: jest.Mocked<TranslateService>
  let mockLangTranslations: jest.Mocked<MultilingualTranslationsService>
  let mockEvents: jest.Mocked<EventService>
  let mockDialog: jest.Mocked<MatDialog>
  let mockConfigSvc: jest.Mocked<ConfigurationsService>

  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }

  // Mock window
  const mockWindow = {
    innerWidth: 1024,
    open: jest.fn()
  }

  beforeEach(() => {
    // Mock dependencies
    mockActivatedRoute = {
      queryParams: of({ param1: 'value1' })
    } as any

    mockRouter = {
      navigateByUrl: jest.fn()
    } as any

    mockCpService = {
      fetchCertificate: jest.fn()
    } as any

    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    } as any

    mockLangTranslations = {
      languageSelectedObservable: of({})
    } as any

    mockEvents = {
      raiseInteractTelemetry: jest.fn()
    } as any

    mockDialog = {
      open: jest.fn()
    } as any

    mockConfigSvc = {
      compentency: {
        v1: { key: 'value' }
      }
    } as any

    // Setup global mocks
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })
    Object.defineProperty(window, 'innerWidth', { value: mockWindow.innerWidth, configurable: true })
    Object.defineProperty(window, 'open', { value: mockWindow.open })

    // Clear mocks
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Constructor', () => {
    it('should create component and initialize with desktop view', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })

      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )

      expect(component.isMobile).toBe(false)
      expect(mockTranslate.setDefaultLang).not.toHaveBeenCalled()
    })

    it('should create component and initialize with mobile view', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      Object.defineProperty(window, 'innerWidth', { value: 600, configurable: true })

      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )

      expect(component.isMobile).toBe(true)
    })

    it('should set language when websiteLanguage exists in localStorage', () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'websiteLanguage') return 'es'
        return null
      })

      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )

      expect(mockTranslate.use).toHaveBeenCalledWith('es')
    })

    it('should subscribe to queryParams and set params', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )

      expect(component.params).toEqual({ param1: 'value1' })
    })

    it('should process details data when exists in localStorage', () => {
      const mockDetailsData = {
        issuedCertificates: [
          {
            courseName: 'test course',
            identifier: 'cert123',
            lastIssuedOn: '2023-01-01'
          },
          {
            courseName: 'another course',
            identifier: 'cert456',
            lastIssuedOn: '2023-02-01'
          }
        ]
      }

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'details_page') return JSON.stringify(mockDetailsData)
        return null
      })

      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )

      expect(component.certificateData[0].courseName).toBe('Test course')
      expect(component.certificateData[0].loading).toBe(false)
      expect(component.updatedTime).toBe('2023-02-01')
    })

    it('should handle empty or undefined details_page in localStorage', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'details_page') return ''
        return null
      })

      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )

      expect(component.detailsData).toBeUndefined()
    })

    it('should handle undefined details_page in localStorage', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'details_page') return 'undefined'
        return null
      })

      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )

      expect(component.detailsData).toBeUndefined()
    })
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null)
      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )
    })

    it('should set compentencyKey from config service', () => {
      component.ngOnInit()
      expect(component.compentencyKey).toEqual({ key: 'value' })
    })
  })

  describe('ngAfterViewInit', () => {
    beforeEach(() => {
      const mockDetailsData = {
        issuedCertificates: [
          { courseName: 'test course', identifier: 'cert123' },
          { courseName: 'another course', identifier: 'cert456' }
        ]
      }

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'details_page') return JSON.stringify(mockDetailsData)
        return null
      })

      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )
    })

    it('should set courseEllipsis to true when element height >= 48', () => {
      const mockElement1 = {
        nativeElement: {
          getBoundingClientRect: () => ({ height: 50 })
        }
      }
      const mockElement2 = {
        nativeElement: {
          getBoundingClientRect: () => ({ height: 30 })
        }
      }

      component.courseNameDiv = {
        forEach: jest.fn((callback) => {
          callback(mockElement1, 0)
          callback(mockElement2, 1)
        })
      } as any

      component.ngAfterViewInit()

      expect(component.detailsData.issuedCertificates[0]['courseEllipsis']).toBe(true)
      expect(component.detailsData.issuedCertificates[1]['courseEllipsis']).toBeUndefined()
    })
  })

  describe('getCertificateSVG', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null)
      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )
    })

    it('should handle download when printURI exists and type is DOWNLOAD', () => {
      const mockObj: any = { printURI: 'test-uri' }
      const handleDownloadSpy = jest.spyOn(component, 'handleDownloadCertificatePDF').mockImplementation()

      component.getCertificateSVG(mockObj, 'DOWNLOAD')

      expect(handleDownloadSpy).toHaveBeenCalledWith('test-uri')
      expect(mockObj.loading).toBe(false)
    })

    it('should handle share when printURI exists and type is SHARE', () => {
      const mockObj: any = { printURI: 'test-uri', identifier: 'cert123' }
      const shareSpy = jest.spyOn(component, 'shareCertificate').mockImplementation()

      component.getCertificateSVG(mockObj, 'SHARE')

      expect(shareSpy).toHaveBeenCalledWith('cert123')
      expect(mockObj.loading).toBe(false)
    })

    it('should handle printURI exists with no type (neither DOWNLOAD nor SHARE)', () => {
      const mockObj: any = { printURI: 'test-uri', identifier: 'cert123' }
      const handleDownloadSpy = jest.spyOn(component, 'handleDownloadCertificatePDF').mockImplementation()
      const shareSpy = jest.spyOn(component, 'shareCertificate').mockImplementation()

      component.getCertificateSVG(mockObj)

      expect(handleDownloadSpy).not.toHaveBeenCalled()
      expect(shareSpy).not.toHaveBeenCalled()
      expect(mockObj.loading).toBe(false)
    })

    it('should fetch certificate when printURI does not exist', () => {
      const mockObj: any = { identifier: 'cert123' }
      const mockResponse = { result: { printUri: 'fetched-uri' } }
      mockCpService.fetchCertificate.mockReturnValue(of(mockResponse))

      component.getCertificateSVG(mockObj)

      expect(mockCpService.fetchCertificate).toHaveBeenCalledWith('cert123')
      expect(mockObj.printURI).toBe('fetched-uri')
      expect(mockObj.loading).toBe(false)
      expect(mockDialog.open).toHaveBeenCalledWith(CertificateDialogComponent, {
        width: '1200px',
        data: { cet: 'fetched-uri', certId: 'cert123' }
      })
    })

    it('should handle error when fetching certificate fails', () => {
      const mockObj: any = { identifier: 'cert123' }
      const mockError = { ok: false } as HttpErrorResponse
      mockCpService.fetchCertificate.mockReturnValue(throwError(mockError))

      component.getCertificateSVG(mockObj)

      expect(mockObj.loading).toBe(false)
      expect(mockObj.error).toBe('Failed to fetch Certificate')
    })
  })

  describe('handleDownloadCertificatePDF', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null)
      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )
    })

    function setupImageMock() {
      (global as any)._savedOnload = null
      const MockImage = function (this: any) {
        this.src = ''
        this.width = 0
        this.height = 0
        Object.defineProperty(this, 'onload', {
          set(fn: any) { (global as any)._savedOnload = fn },
          configurable: true
        })
      };
      (global as any).Image = MockImage
    }

    it('should create PDF and download when image loads successfully', async () => {
      const mockCtx: any = { drawImage: jest.fn() }
      const mockCanvas: any = {
        width: 0,
        height: 0,
        getContext: jest.fn(() => mockCtx),
        toDataURL: jest.fn(() => 'data:image/png;base64,test')
      }
      jest.spyOn(document, 'createElement').mockReturnValue(mockCanvas)
      setupImageMock()

      const promise = component.handleDownloadCertificatePDF('test-uri')
      if ((global as any)._savedOnload) (global as any)._savedOnload()
      await promise

      expect(mockCtx.drawImage).toHaveBeenCalled()
      expect(mockCanvas.toDataURL).toHaveBeenCalled()
    })

    it('should handle case when canvas context is null', async () => {
      const mockCanvas: any = {
        width: 0,
        height: 0,
        getContext: jest.fn(() => null),
        toDataURL: jest.fn()
      }
      jest.spyOn(document, 'createElement').mockReturnValue(mockCanvas)
      setupImageMock()

      const promise = component.handleDownloadCertificatePDF('test-uri')
      if ((global as any)._savedOnload) (global as any)._savedOnload()
      await promise

      expect(mockCanvas.toDataURL).not.toHaveBeenCalled()
    })
  })

  describe('shareCertificate', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null)
      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )
    })

    it('should raise telemetry and open LinkedIn share URL', () => {
      const raiseTelemetrySpy = jest.spyOn(component, 'raiseShareIntreactTelemetry').mockImplementation()
      const certId = 'cert123'

      component.shareCertificate(certId)

      expect(raiseTelemetrySpy).toHaveBeenCalledWith(certId, 'share')
      expect(mockWindow.open).toHaveBeenCalledWith(
        `https://www.linkedin.com/sharing/share-offsite/?url=${environment.contentHost}/apis/public/v8/cert/download/${certId}`,
        '_blank'
      )
    })
  })

  describe('handleNavigate', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null)
      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )
    })

    it('should navigate to course TOC page', () => {
      const courseObj = { contentId: 'content123', batchId: 'batch456' }

      component.handleNavigate(courseObj)

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(
        'app/toc/content123/overview?batchId=batch456'
      )
    })
  })

  describe('handleViewMore', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null)
      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )
    })

    it('should toggle viewMore to true when no flag provided', () => {
      const obj = { viewMore: false }

      component.handleViewMore(obj)

      expect(obj.viewMore).toBe(true)
    })

    it('should set viewMore to false when flag is provided', () => {
      const obj = { viewMore: true }

      component.handleViewMore(obj, 'any')

      expect(obj.viewMore).toBe(false)
    })
  })

  describe('raiseShareIntreactTelemetry', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null)
      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )
    })

    it('should raise interact telemetry with provided parameters', () => {
      const certId = 'cert123'
      const type = 'share'
      const action = 'click'

      component.raiseShareIntreactTelemetry(certId, type, action)

      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: WsEvents.EnumInteractTypes.CLICK,
          id: `${type}-${WsEvents.EnumInteractSubTypes.CERTIFICATE}`,
          subType: action,
        },
        {
          id: certId,
          type: WsEvents.EnumInteractSubTypes.CERTIFICATE,
        }
      )
    })

    it('should raise interact telemetry with empty subType when action not provided', () => {
      const certId = 'cert123'
      const type = 'share'

      component.raiseShareIntreactTelemetry(certId, type)

      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: WsEvents.EnumInteractTypes.CLICK,
          id: `${type}-${WsEvents.EnumInteractSubTypes.CERTIFICATE}`,
          subType: '',
        },
        {
          id: certId,
          type: WsEvents.EnumInteractSubTypes.CERTIFICATE,
        }
      )
    })
  })

  describe('ngOnDestroy', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null)
      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )
    })

    it('should unsubscribe from destroySubject$', () => {
      const unsubscribeSpy = jest.spyOn(component['destroySubject$'], 'unsubscribe')

      component.ngOnDestroy()

      expect(unsubscribeSpy).toHaveBeenCalled()
    })
  })

  describe('Language translation subscription', () => {
    it('should handle language translation observable when websiteLanguage is not set', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'websiteLanguage') return null
        return null
      })

      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )

      // Observable already emitted via of({}) during construction; websiteLanguage is null so setDefaultLang not called
      expect(mockTranslate.setDefaultLang).not.toHaveBeenCalled()
      expect(mockTranslate.use).not.toHaveBeenCalled()
    })
  })

  describe('Certificate data processing edge cases', () => {
    it('should handle certificate without identifier', () => {
      const mockDetailsData = {
        issuedCertificates: [
          {
            courseName: 'test course',
            lastIssuedOn: '2023-01-01'
            // no identifier
          }
        ]
      }

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'details_page') return JSON.stringify(mockDetailsData)
        return null
      })

      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )

      expect(component.certificateData[0].loading).toBeUndefined()
      expect(component.updatedTime).toBeUndefined()
    })

    it('should handle earlier updatedTime correctly', () => {
      const mockDetailsData = {
        issuedCertificates: [
          {
            courseName: 'test course',
            identifier: 'cert123',
            lastIssuedOn: '2023-01-01'
          },
          {
            courseName: 'another course',
            identifier: 'cert456',
            lastIssuedOn: '2022-12-01'
          }
        ]
      }

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'details_page') return JSON.stringify(mockDetailsData)
        return null
      })

      component = new CompetencyCardDetailsComponent(
        mockActivatedRoute,
        mockRouter,
        mockCpService,
        mockTranslate,
        mockLangTranslations,
        mockEvents,
        mockDialog,
        mockConfigSvc
      )

      expect(component.updatedTime).toBe('2023-01-01')
    })
  })
})