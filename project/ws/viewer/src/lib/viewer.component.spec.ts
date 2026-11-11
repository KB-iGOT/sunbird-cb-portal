import { of, throwError } from 'rxjs'

// The component's library imports (`@sunbird-cb/toc`, `@sunbird-cb/consumption`, `@sunbird-cb/utils-v2`,
// `@sunbird-cb/collection`) pull in transitive deps (ckeditor5, telemetry SDK, ...) that Jest cannot load.
// The methods under test only use the injected services, so lightweight stubs keep this spec isolated
// (same approach as learn-search.component.spec.ts).
jest.mock('@sunbird-cb/collection', () => ({
  NsContent: { ECourseCategory: { LEARNING_PATHWAY: 'Learning Pathway' } },
}), { virtual: true })
jest.mock('@sunbird-cb/resolver', () => ({}), { virtual: true })
jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn(),
  UtilityService: jest.fn(),
  ValueService: jest.fn(),
}), { virtual: true })
jest.mock('@sunbird-cb/consumption', () => ({
  ContentLanguageService: jest.fn(),
  WidgetContentLibService: jest.fn(),
  WidgetUserServiceLib: jest.fn(),
}), { virtual: true })
jest.mock('@sunbird-cb/toc', () => ({
  AppTocService: jest.fn(),
  AppTocV2Service: jest.fn(),
  TocConfigService: jest.fn(),
  ViewerUtilService: jest.fn(),
  WidgetContentService: jest.fn(),
  ViewerDataService: jest.fn(),
  TStatus: {},
}), { virtual: true })
jest.mock('@ngx-translate/core', () => ({ TranslateService: jest.fn() }))
jest.mock('./services/root.service', () => ({ RootService: jest.fn() }))
jest.mock('./services/mobile-apps.service', () => ({ MobileAppsService: jest.fn() }))
jest.mock('./viewer-header-side-bar-toggle.service', () => ({ ViewerHeaderSideBarToggleService: jest.fn() }))
jest.mock('./pdf-scorm-data-service', () => ({ PdfScormDataService: jest.fn() }))

import { ViewerComponent } from './viewer.component'

describe('ViewerComponent (No TestBed)', () => {
  let component: ViewerComponent
  let mockRouter: any
  let mockConfigSvc: any
  let mockTocSvc: any

  const surveyConfig = { enabled: true, startDate: 1000 }
  const completedEnrolment = (extra: any = {}) => ({ completedOn: 2000, ...extra })

  const createComponent = () => {
    const mockActivatedRoute: any = {
      snapshot: {
        queryParamMap: { get: jest.fn().mockReturnValue('do_course_1') },
        queryParams: {},
        data: {},
      },
    }
    mockRouter = { navigateByUrl: jest.fn() }
    mockConfigSvc = { instanceConfig: { completionSurvey: surveyConfig } }
    mockTocSvc = { getApllicationsById: jest.fn() }
    const mockRootSvc: any = { showNavbarDisplay$: { next: jest.fn() } }
    const mockMobileAppsSvc: any = { mobileTopHeaderVisibilityStatus: { next: jest.fn() } }
    const mockValueSvc: any = { isLtMedium$: of(false) }
    const mockTranslate: any = { setDefaultLang: jest.fn(), use: jest.fn() }

    return new ViewerComponent(
      mockActivatedRoute,
      mockRouter,
      mockValueSvc,
      {} as any,
      mockRootSvc,
      {} as any,
      { detectChanges: jest.fn() } as any,
      {} as any,
      {} as any,
      {} as any,
      mockConfigSvc,
      {} as any,
      mockMobileAppsSvc,
      {} as any,
      {} as any,
      mockTranslate,
      mockTocSvc,
      {} as any,
      {} as any,
      {} as any,
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(component.lockCertificate).toBe(false)
  })

  describe('setCertificateObj', () => {
    it('sets the latest issued certificate on hierarchyData and content', () => {
      component.enrolledCourseData = {
        issuedCertificates: [
          { identifier: 'cert_old', lastIssuedOn: '2025-01-01T00:00:00Z' },
          { identifier: 'cert_new', lastIssuedOn: '2026-05-01T00:00:00Z' },
        ],
      }
      component.hierarchyData = {}
      component.content = {} as any

      component.setCertificateObj()

      expect(component.hierarchyData.certificateObj).toEqual({ certId: 'cert_new', certData: '' })
      expect((component.content as any).certificateObj).toEqual({ certId: 'cert_new', certData: '' })
      expect((component.content as any).certificateObj).not.toBe(component.hierarchyData.certificateObj)
    })

    it('does not reorder the enrolment issuedCertificates array', () => {
      const issuedCertificates = [
        { identifier: 'cert_old', lastIssuedOn: '2025-01-01T00:00:00Z' },
        { identifier: 'cert_new', lastIssuedOn: '2026-05-01T00:00:00Z' },
      ]
      component.enrolledCourseData = { issuedCertificates }
      component.hierarchyData = {}

      component.setCertificateObj()

      expect(issuedCertificates[0].identifier).toBe('cert_old')
    })

    it.each([
      ['no enrolment', undefined],
      ['an empty enrolment', {}],
      ['an empty certificate list', { issuedCertificates: [] }],
      ['a null certificate list', { issuedCertificates: null }],
    ])('leaves the certificate unset for %s', (_label, enrolment) => {
      component.enrolledCourseData = enrolment
      component.hierarchyData = {}
      component.content = {} as any

      component.setCertificateObj()

      expect(component.hierarchyData.certificateObj).toBeUndefined()
      expect((component.content as any).certificateObj).toBeUndefined()
    })

    it('does not throw when hierarchyData and content are not loaded', () => {
      component.enrolledCourseData = { issuedCertificates: [{ identifier: 'cert_1', lastIssuedOn: '2026-01-01' }] }
      component.hierarchyData = undefined
      component.content = null

      expect(() => component.setCertificateObj()).not.toThrow()
    })

    it('keeps a certificate whose print data was already fetched', () => {
      component.enrolledCourseData = { issuedCertificates: [{ identifier: 'cert_1', lastIssuedOn: '2026-01-01' }] }
      component.hierarchyData = { certificateObj: { certId: 'cert_1', certData: 'print-uri' } }

      component.setCertificateObj()

      expect(component.hierarchyData.certificateObj.certData).toBe('print-uri')
    })
  })

  describe('checkCertificateLock', () => {
    beforeEach(() => {
      component.contentReadData = {
        identifier: 'do_course_1',
        completionSurveyLink: 'https://portal/surveys/survey_1',
      } as any
      component.enrolledCourseData = completedEnrolment()
    })

    it('locks the certificate when the completion survey is not submitted', () => {
      mockTocSvc.getApllicationsById.mockReturnValue(of({ result: { response: {} } }))

      component.checkCertificateLock()

      expect(mockTocSvc.getApllicationsById).toHaveBeenCalledWith('survey_1', 'do_course_1')
      expect(component.lockCertificate).toBe(true)
    })

    it('unlocks the certificate when the completion survey is submitted', () => {
      mockTocSvc.getApllicationsById.mockReturnValue(of({ result: { response: { id: 'application_1' } } }))

      component.checkCertificateLock()

      expect(component.lockCertificate).toBe(false)
    })

    it('keeps the certificate locked while the survey check is in flight', () => {
      mockTocSvc.getApllicationsById.mockReturnValue({ subscribe: jest.fn() })

      component.checkCertificateLock()

      expect(component.lockCertificate).toBe(true)
    })

    it('unlocks the certificate when the survey check fails', () => {
      mockTocSvc.getApllicationsById.mockReturnValue(throwError({ status: 500 }))

      component.checkCertificateLock()

      expect(component.lockCertificate).toBe(false)
    })

    it.each([
      ['the survey is not configured', () => { mockConfigSvc.instanceConfig = { completionSurvey: undefined } }],
      ['the survey is disabled', () => { mockConfigSvc.instanceConfig = { completionSurvey: { enabled: false, startDate: 0 } } }],
      ['instanceConfig is missing', () => { mockConfigSvc.instanceConfig = null }],
      ['the content has no survey link', () => { (component.contentReadData as any).completionSurveyLink = undefined }],
      ['contentReadData is missing', () => { component.contentReadData = null }],
      ['there is no enrolment', () => { component.enrolledCourseData = undefined }],
      ['the course was completed before the survey start date', () => { component.enrolledCourseData = completedEnrolment({ completedOn: 500 }) }],
      ['the course has not been completed', () => { component.enrolledCourseData = {} }],
    ])('does not lock or call the survey API when %s', (_label, arrange) => {
      arrange()

      component.checkCertificateLock()

      expect(mockTocSvc.getApllicationsById).not.toHaveBeenCalled()
      expect(component.lockCertificate).toBe(false)
    })
  })

  describe('openCompletionSurvey', () => {
    it('navigates to the TOC page, where the survey form opens', () => {
      component.openCompletionSurvey(true)

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/toc/do_course_1/overview')
    })

    it('does nothing when the widget emits false', () => {
      component.openCompletionSurvey(false)

      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled()
    })

    it('does nothing without a collection id', () => {
      component.collectionId = null

      component.openCompletionSurvey(true)

      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled()
    })
  })

  describe('getContentData', () => {
    const activatedResource = (content: any) => ({ activatedRoute: { data: of({ content: { data: content } }) } })

    it('applies the certificate to the resource opened in the player', () => {
      component.enrolledCourseData = { issuedCertificates: [{ identifier: 'cert_1', lastIssuedOn: '2026-01-01' }] }
      const resource = { identifier: 'do_resource_1', mimeType: 'video/mp4' }

      component.getContentData(activatedResource(resource))

      expect((component.content as any).certificateObj).toEqual({ certId: 'cert_1', certData: '' })
      expect(component.contentMIMEType).toBe('video/mp4')
    })

    it('does not apply the certificate in preview mode', () => {
      component.forPreview = true
      component.enrolledCourseData = { issuedCertificates: [{ identifier: 'cert_1', lastIssuedOn: '2026-01-01' }] }

      component.getContentData(activatedResource({ identifier: 'do_resource_1', mimeType: 'video/mp4' }))

      expect((component.content as any).certificateObj).toBeUndefined()
    })
  })
})
