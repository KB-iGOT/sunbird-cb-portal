/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { CompetencyCardDetailsV2Component } from './competency-card-details-v2.component'
import { of, throwError } from 'rxjs'
import { HttpErrorResponse } from '@angular/common/http'

describe('CompetencyCardDetailsV2Component', () => {
  let component: CompetencyCardDetailsV2Component
  let mockActRouter: any
  let mockRouter: any
  let mockCpService: any
  let mockTranslate: any
  let mockLangtranslations: any
  let mockEvents: any
  let mockDialog: any
  let mockMatSnackBar: any
  let mockPipeImgUrl: any

  const mockCompetencyData = {
    result: {
      competencies: [
        {
          competencyAreaId: 'area1',
          competencyThemeId: 'theme1',
          competencySubThemeId: 'subtheme1',
          competencyDetails: {
            iGOTCourses: [
              { acquiredContextId: 'igot1', certificateId: 'cert1' },
              { acquiredContextId: 'igot2', certificateId: 'cert2' },
            ],
            extCourses: [
              { acquiredContextId: 'ext1', certificateId: 'cert3' },
            ],
            selfAchievement: [
              { acquiredContextId: 'self1', certificateId: 'cert4' },
            ],
            externalTraining: [
              { acquiredContextId: 'train1', certificateId: 'cert5' },
            ],
          },
        },
      ],
    },
  }

  const mockCertificateResponse = {
    result: {
      printUri: 'https://example.com/certificate.svg',
    },
  }

  beforeEach(() => {
    // Mock ActivatedRoute
    mockActRouter = {
      queryParams: of({ tab: 'iGOTCourses' }),
    } as any

    // Mock Router
    mockRouter = {
      navigateByUrl: jest.fn(),
    } as any

    // Mock CompetencyPassbookService
    mockCpService = {
      getMyCompetencyList: jest.fn().mockReturnValue(of(mockCompetencyData)),
      getIGOTCourseList: jest.fn().mockReturnValue(of({ result: { content: [] } })),
      getExternalCourseList: jest.fn().mockReturnValue(of({ data: [] })),
      getAcheivementsList: jest.fn().mockReturnValue(of({ result: { search_results: { data: [] } } })),
      fetchCertificate: jest.fn().mockReturnValue(of(mockCertificateResponse)),
    } as any

    // Mock TranslateService
    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    } as any

    // Mock MultilingualTranslationsService
    mockLangtranslations = {
      languageSelectedObservable: of('en'),
    } as any

    // Mock EventService
    mockEvents = {
      raiseInteractTelemetry: jest.fn(),
    } as any

    // Mock MatDialog
    mockDialog = {
      open: jest.fn(),
    } as any

    // Mock MatSnackBar
    mockMatSnackBar = {
      open: jest.fn(),
    } as any

    // Mock PipeCertificateImageURL
    mockPipeImgUrl = {
      transform: jest.fn((url: string) => url),
    } as any

    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key: string) => {
      if (key === 'websiteLanguage') return 'en'
      if (key === 'details_page_competency') {
        return JSON.stringify({
          id: 'theme1',
          name: 'Test Theme',
          subThemes: [
            { id: 'subtheme1', name: 'SubTheme 1' },
            { id: 'subtheme2', name: 'SubTheme 2' },
          ],
        })
      }
      return null
    })

    Storage.prototype.setItem = jest.fn()

    component = new CompetencyCardDetailsV2Component(
      mockActRouter,
      mockRouter,
      mockCpService,
      mockTranslate,
      mockLangtranslations,
      mockEvents,
      mockDialog,
      mockMatSnackBar,
      mockPipeImgUrl
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create the component', () => {
      expect(component).toBeDefined()
    })

    it('should subscribe to language changes and set default language', () => {
      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslate.use).toHaveBeenCalledWith('en')
    })

    it('should parse detailsData from localStorage', () => {
      expect(component.detailsData).toBeDefined()
      expect(component.detailsData.name).toBe('Test Theme')
    })

    it('should subscribe to query params', () => {
      expect(component.params).toEqual({ tab: 'iGOTCourses' })
    })
  })

  describe('ngOnInit', () => {
    it('should call getMyCompetencyList', () => {
      const getMyCompetencySpy = jest.spyOn(component, 'getMyCompetencyList')

      component.ngOnInit()

      expect(getMyCompetencySpy).toHaveBeenCalled()
    })
  })

  describe('getMyCompetencyList', () => {
    it('should fetch and process my competency list successfully', () => {
      const filterCompetenciesSpy = jest.spyOn(component, 'filterCompetenciesBySubThemes').mockImplementation()

      component.getMyCompetencyList()

      expect(mockCpService.getMyCompetencyList).toHaveBeenCalled()
      expect(component.myCompetencyList.length).toBe(1)
      expect(filterCompetenciesSpy).toHaveBeenCalled()
    })

    it('should handle error when fetching competency list fails', () => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
      mockCpService.getMyCompetencyList = jest.fn().mockReturnValue(throwError(errorResponse))

      component.getMyCompetencyList()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to pull My Competency list details!')
    })
  })

  describe('filterCompetenciesBySubThemes', () => {
    beforeEach(() => {
      component.myCompetencyList = mockCompetencyData.result.competencies
      component.detailsData = {
        subThemes: [
          { id: 'subtheme1', name: 'SubTheme 1' },
        ],
      }
    })

    it('should filter and group competencies by subthemes', () => {
      const fetchIGOTSpy = jest.spyOn(component, 'fetchIGOTCourseDetails').mockImplementation()
      const fetchExtSpy = jest.spyOn(component, 'fetchExtCourseDetails').mockImplementation()
      const fetchSelfSpy = jest.spyOn(component, 'fetchSelfAchievementCourseDetails').mockImplementation()
      const fetchExternalTrainingSpy = jest.spyOn(component, 'fetchExternalTrainingDetails').mockImplementation()

      component.filterCompetenciesBySubThemes()

      expect(component.filteredIGOTCourses.length).toBeGreaterThan(0)
      expect(component.filteredExtCourses.length).toBeGreaterThan(0)
      expect(component.filteredSelfAchievements.length).toBeGreaterThan(0)
      expect(component.filteredexternalTrainings.length).toBeGreaterThan(0)
      expect(fetchIGOTSpy).toHaveBeenCalled()
      expect(fetchExtSpy).toHaveBeenCalled()
      expect(fetchSelfSpy).toHaveBeenCalled()
      expect(fetchExternalTrainingSpy).toHaveBeenCalled()
    })

    it('should set activeTab to iGOTCourses when available', () => {
      jest.spyOn(component, 'fetchIGOTCourseDetails').mockImplementation()
      jest.spyOn(component, 'fetchExtCourseDetails').mockImplementation()
      jest.spyOn(component, 'fetchSelfAchievementCourseDetails').mockImplementation()
      jest.spyOn(component, 'fetchExternalTrainingDetails').mockImplementation()

      component.filterCompetenciesBySubThemes()

      expect(component.activeTab).toBe('iGOTCourses')
    })

    it('should return early when no competencies or subthemes', () => {
      component.myCompetencyList = []

      component.filterCompetenciesBySubThemes()

      expect(component.filteredIGOTCourses.length).toBe(0)
    })
  })

  describe('fetchExternalTrainingDetails', () => {
    beforeEach(() => {
      component.filteredexternalTrainings = [
        { acquiredContextId: 'train1', certificateId: 'cert1', subThemes: [] },
      ]
    })

    it('should fetch external training details successfully', () => {
      const mockResponse = {
        result: {
          Event: [
            { identifier: 'train1', name: 'External Training 1' },
          ],
        },
      }
      mockCpService.getIGOTCourseList = jest.fn().mockReturnValue(of(mockResponse))
      const assignDataSpy = jest.spyOn(component, 'assignData').mockImplementation()
      component.activeTab = 'externalTraining'

      component.fetchExternalTrainingDetails()

      expect(component.filteredexternalTrainings[0].name).toBe('External Training 1')
      expect(assignDataSpy).toHaveBeenCalledWith('externalTraining')
    })

    it('should handle error when fetching external training details fails', () => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
      mockCpService.getIGOTCourseList = jest.fn().mockReturnValue(throwError(errorResponse))

      component.fetchExternalTrainingDetails()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to fetch external training details!')
    })
  })

  describe('fetchIGOTCourseDetails', () => {
    beforeEach(() => {
      component.filteredIGOTCourses = [
        { acquiredContextId: 'igot1', certificateId: 'cert1', subThemes: [] },
      ]
    })

    it('should fetch iGOT course details successfully', () => {
      const mockResponse = {
        result: {
          content: [
            { identifier: 'igot1', name: 'iGOT Course 1' },
          ],
        },
      }
      mockCpService.getIGOTCourseList = jest.fn().mockReturnValue(of(mockResponse))
      const assignDataSpy = jest.spyOn(component, 'assignData').mockImplementation()
      component.activeTab = 'iGOTCourses'

      component.fetchIGOTCourseDetails()

      expect(component.filteredIGOTCourses[0].name).toBe('iGOT Course 1')
      expect(assignDataSpy).toHaveBeenCalledWith('iGOTCourses')
    })

    it('should handle error when fetching iGOT course details fails', () => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
      mockCpService.getIGOTCourseList = jest.fn().mockReturnValue(throwError(errorResponse))

      component.fetchIGOTCourseDetails()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to fetch iGOT course details!')
    })
  })

  describe('fetchSelfAchievementCourseDetails', () => {
    beforeEach(() => {
      component.filteredSelfAchievements = [
        { acquiredContextId: 'self1', certificateId: 'cert1', subThemes: [] },
      ]
    })

    it('should fetch self achievement details successfully', () => {
      const mockResponse = {
        result: {
          search_results: {
            data: [
              { id: 'self1', contextData: { title: 'Achievement 1' } },
            ],
          },
        },
      }
      mockCpService.getAcheivementsList = jest.fn().mockReturnValue(of(mockResponse))
      const assignDataSpy = jest.spyOn(component, 'assignData').mockImplementation()
      component.activeTab = 'selfAchievement'

      component.fetchSelfAchievementCourseDetails()

      expect(component.filteredSelfAchievements[0].name).toBe('Achievement 1')
      expect(assignDataSpy).toHaveBeenCalledWith('selfAchievement')
    })

    it('should handle error when fetching self achievement details fails', () => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
      mockCpService.getAcheivementsList = jest.fn().mockReturnValue(throwError(errorResponse))

      component.fetchSelfAchievementCourseDetails()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to fetch self achievement details!')
    })
  })

  describe('fetchExtCourseDetails', () => {
    beforeEach(() => {
      component.filteredExtCourses = [
        { acquiredContextId: 'ext1', certificateId: 'cert1', subThemes: [] },
      ]
    })

    it('should fetch external course details successfully', () => {
      const mockResponse = {
        data: [
          { contentId: 'ext1', name: 'External Course 1' },
        ],
      }
      mockCpService.getExternalCourseList = jest.fn().mockReturnValue(of(mockResponse))
      const assignDataSpy = jest.spyOn(component, 'assignData').mockImplementation()
      component.activeTab = 'extCourses'

      component.fetchExtCourseDetails()

      expect(component.filteredExtCourses[0].name).toBe('External Course 1')
      expect(assignDataSpy).toHaveBeenCalledWith('extCourses')
    })

    it('should handle error when fetching external course details fails', () => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
      mockCpService.getExternalCourseList = jest.fn().mockReturnValue(throwError(errorResponse))

      component.fetchExtCourseDetails()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to fetch external course details!')
    })
  })

  describe('viewCertificate', () => {
    it('should fetch and display certificate', () => {
      const obj = { certificateId: 'cert123' }

      component.viewCertificate(obj)

      expect(mockCpService.fetchCertificate).toHaveBeenCalledWith('cert123')
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should handle error when fetching certificate fails', () => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
      mockCpService.fetchCertificate = jest.fn().mockReturnValue(throwError(errorResponse))
      const obj: any = { certificateId: 'cert123' }

      component.viewCertificate(obj)

      expect(obj.loading).toBe(false)
      expect(obj.error).toBe('Failed to fetch Certificate')
    })
  })

  describe('getCertificateSVG', () => {
    it('should download certificate PDF when type is DOWNLOAD', () => {
      const obj = { certificateId: 'cert123', printURI: 'https://example.com/cert.svg' }
      const downloadSpy = jest.spyOn(component, 'handleDownloadCertificatePDF').mockImplementation()

      component.getCertificateSVG(obj, 'DOWNLOAD')

      expect(downloadSpy).toHaveBeenCalledWith(obj.printURI)
    })

    it('should share certificate when type is SHARE', () => {
      const obj = { certificateId: 'cert123', printURI: 'https://example.com/cert.svg' }
      const shareSpy = jest.spyOn(component, 'shareCertificate').mockImplementation()

      component.getCertificateSVG(obj, 'SHARE')

      expect(shareSpy).toHaveBeenCalledWith(obj.certificateId)
    })

    it('should fetch certificate when printURI is not available', () => {
      const obj = { certificateId: 'cert123' }

      component.getCertificateSVG(obj)

      expect(mockCpService.fetchCertificate).toHaveBeenCalledWith('cert123')
    })

    it('should handle error when fetching certificate fails', () => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
      mockCpService.fetchCertificate = jest.fn().mockReturnValue(throwError(errorResponse))
      const obj: any = { certificateId: 'cert123' }

      component.getCertificateSVG(obj)

      expect(obj.loading).toBe(false)
      expect(obj.error).toBe('Failed to fetch Certificate')
    })
  })

  describe('handleDownloadCertificatePDF', () => {
    it('should create and download PDF from image', async () => {
      const uriData = 'data:image/png;base64,test'
      const createElementSpy = jest.spyOn(document, 'createElement')

      await component.handleDownloadCertificatePDF(uriData)

      expect(createElementSpy).toHaveBeenCalledWith('canvas')
    })
  })

  describe('shareCertificate', () => {
    it('should open LinkedIn share window and raise telemetry', () => {
      const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation()

      component.shareCertificate('cert123')

      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
      expect(windowOpenSpy).toHaveBeenCalled()
    })
  })

  describe('handleNavigate', () => {
    it('should navigate to external course TOC', () => {
      component.activeTab = 'extCourses'
      const courseObj = { acquiredContextId: 'ext123' }

      component.handleNavigate(courseObj)

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/toc/ext/ext123')
    })

    it('should navigate to iGOT course overview', () => {
      component.activeTab = 'iGOTCourses'
      const courseObj = { acquiredContextId: 'igot123' }

      component.handleNavigate(courseObj)

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/toc/igot123/overview')
    })
  })

  describe('handleViewMore', () => {
    it('should set viewMore to true when no flag provided', () => {
      const obj = { viewMore: false }

      component.handleViewMore(obj)

      expect(obj.viewMore).toBe(true)
    })

    it('should set viewMore to false when flag is provided', () => {
      const obj = { viewMore: true }

      component.handleViewMore(obj, 'hide')

      expect(obj.viewMore).toBe(false)
    })
  })

  describe('raiseShareIntreactTelemetry', () => {
    it('should raise interact telemetry with correct parameters', () => {
      component.raiseShareIntreactTelemetry('cert123', 'share', 'click')

      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
    })
  })

  describe('assignData', () => {
    beforeEach(() => {
      component.filteredIGOTCourses = [{ name: 'Course 1' }]
      component.filteredExtCourses = [{ name: 'Course 2' }]
      component.filteredSelfAchievements = [{ name: 'Achievement 1' }]
      component.filteredexternalTrainings = [{ name: 'Training 1' }]
    })

    it('should assign iGOTCourses data', () => {
      component.assignData('iGOTCourses')

      expect(component.currentTabData).toEqual(component.filteredIGOTCourses)
    })

    it('should assign extCourses data', () => {
      component.assignData('extCourses')

      expect(component.currentTabData).toEqual(component.filteredExtCourses)
    })

    it('should assign selfAchievement data', () => {
      component.assignData('selfAchievement')

      expect(component.currentTabData).toEqual(component.filteredSelfAchievements)
    })

    it('should assign externalTraining data', () => {
      component.assignData('externalTraining')

      expect(component.currentTabData).toEqual(component.filteredexternalTrainings)
    })
  })

  describe('resetAllViewMore', () => {
    it('should reset viewMore flag for all items', () => {
      component.filteredIGOTCourses = [{ viewMore: true }, { viewMore: true }]
      component.filteredExtCourses = [{ viewMore: true }]
      component.filteredSelfAchievements = [{ viewMore: true }]
      component.filteredexternalTrainings = [{ viewMore: true }]

      component.resetAllViewMore()

      expect(component.filteredIGOTCourses.every(item => !item.viewMore)).toBe(true)
      expect(component.filteredExtCourses.every(item => !item.viewMore)).toBe(true)
      expect(component.filteredSelfAchievements.every(item => !item.viewMore)).toBe(true)
      expect(component.filteredexternalTrainings.every(item => !item.viewMore)).toBe(true)
    })
  })

  describe('handleActiveTab', () => {
    it('should reset viewMore and assign data for new tab', () => {
      const resetSpy = jest.spyOn(component, 'resetAllViewMore')
      const assignSpy = jest.spyOn(component, 'assignData').mockImplementation()

      component.handleActiveTab('iGOTCourses')

      expect(resetSpy).toHaveBeenCalled()
      expect(component.activeTab).toBe('iGOTCourses')
      expect(assignSpy).toHaveBeenCalledWith('iGOTCourses')
    })
  })

  describe('handleView', () => {
    it('should open certificate in new window', () => {
      const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation()
      const eachCert = { certificateId: 'cert123' }

      component.handleView(eachCert)

      expect(windowOpenSpy).toHaveBeenCalled()
    })
  })

  describe('getUrl', () => {
    it('should transform Google Storage URL', () => {
      const url = 'https://storage.googleapis.com/bucket/userAchievements/test.pdf'
      mockPipeImgUrl.transform = jest.fn().mockReturnValue('transformed-url')

      const result = component.getUrl(url)

      expect(mockPipeImgUrl.transform).toHaveBeenCalled()
      expect(result).toBe('transformed-url')
    })

    it('should return original URL when not Google Storage', () => {
      const url = 'https://example.com/certificate.pdf'

      const result = component.getUrl(url)

      expect(result).toBe(url)
    })
  })

  describe('openDocument', () => {
    it('should open certificate view popup dialog', () => {
      const url = 'https://example.com/document.pdf'

      component.openDocument(url)

      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should not open dialog when url is empty', () => {
      component.openDocument('')

      expect(mockDialog.open).not.toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from destroySubject$', () => {
      const unsubscribeSpy = jest.spyOn(component.destroySubject$, 'unsubscribe')

      component.ngOnDestroy()

      expect(unsubscribeSpy).toHaveBeenCalled()
    })
  })
})
