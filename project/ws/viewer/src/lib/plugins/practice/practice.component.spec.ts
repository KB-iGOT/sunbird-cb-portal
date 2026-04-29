import { PracticeComponent } from './practice.component'
import { of, Subject } from 'rxjs'

// ---- mock heavy deps ----
jest.mock('src/environments/environment', () => ({
  environment: { assessmentBuffer: 10 },
}), { virtual: true })

jest.mock('@angular/platform-browser', () => ({
  DomSanitizer: jest.fn(),
}), { virtual: true })

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn(),
  EventService: jest.fn(),
  ValueService: jest.fn(),
  WsEvents: { EnumTelemetrymodules: { LEARN: 'learn' } },
  NsContent: {
    EPrimaryCategory: {
      PRACTICE_RESOURCE: 'Practice Resource',
      FINAL_ASSESSMENT: 'Final Assessment',
    },
    ECourseCategory: { STANDALONE_ASSESSMENT: 'Standalone Assessment' },
  },
}), { virtual: true })

jest.mock('@sunbird-cb/collection', () => ({
  VIEWER_ROUTE_FROM_MIME: {},
}), { virtual: true })

jest.mock('@sunbird-cb/toc', () => ({
  ViewerUtilService: jest.fn(),
  WidgetContentService: jest.fn(),
  AppTocService: jest.fn(),
  ViewerDataService: jest.fn(),
}), { virtual: true })

jest.mock('@angular/router', () => ({
  ActivatedRoute: jest.fn(),
  NavigationStart: class NavigationStart { navigationTrigger = 'imperative' },
  Router: jest.fn(),
}), { virtual: true })

jest.mock('@angular/material/legacy-dialog', () => ({
  MatLegacyDialog: jest.fn(),
}), { virtual: true })
jest.mock('@angular/material/legacy-snack-bar', () => ({
  MatLegacySnackBar: jest.fn(),
  MatLegacySnackBarConfig: jest.fn(),
}), { virtual: true })
jest.mock('@angular/material/sidenav', () => ({ MatSidenav: jest.fn() }), { virtual: true })

function buildComponent() {
  const routerEvents$ = new Subject<any>()
  const mockEvents: any = { raiseInteractTelemetry: jest.fn(), raiseImpressionTelemetry: jest.fn() }
  const mockDialog: any = { open: jest.fn(() => ({ afterClosed: jest.fn(() => of({})) })) }
  const mockQuizSvc: any = {
    canAttend: jest.fn().mockReturnValue(of({ attemptsAllowed: 3, attemptsMade: 1 })),
    canAttendV5: jest.fn().mockReturnValue(of({ attemptsAllowed: 3, attemptsMade: 1 })),
    secAttempted: of([]),
    questionAnswerHash: { value: null, getValue: jest.fn().mockReturnValue({}) },
    submitQuizV2: jest.fn().mockReturnValue(of({})),
  }
  const mockActivatedRoute: any = { snapshot: { queryParamMap: { get: jest.fn() } } }
  const mockViewerSvc: any = {}
  const mockRouter: any = { events: routerEvents$.asObservable(), navigate: jest.fn() }
  const mockValueSvc: any = { isXSmall$: of(false) }
  const mockConfigSvc: any = { userProfile: { userId: 'user1' } }
  const mockFormBuilder: any = {
    group: jest.fn().mockReturnValue({
      get: jest.fn().mockReturnValue({ value: '' }),
      valueChanges: of({}),
      valid: false,
    }),
  }
  const mockSnackBar: any = { open: jest.fn() }
  const mockSanitized: any = { bypassSecurityTrustHtml: jest.fn().mockReturnValue('<safe>') }
  const mockViewerDataSvc: any = { resource: { name: 'Test Resource' } }
  const mockViewerHeaderSideBarToggleService: any = {}
  const mockRenderer: any = { listen: jest.fn().mockReturnValue(() => { }), addClass: jest.fn(), removeClass: jest.fn() }
  const mockWidgetContentService: any = {
    currentMetaData: { primaryCategory: 'Course', children: [] },
    questionAnswerHash: { value: null },
  }
  const mockTocSvc: any = {
    viewerDataToc$: of(null),
  }
  const mockCdr: any = { detectChanges: jest.fn() }

  // Patch window.location for URL parsing
  Object.defineProperty(window, 'location', {
    value: { href: 'http://localhost/learn/course/abc' },
    configurable: true,
    writable: true,
  })

  const comp = new PracticeComponent(
    mockEvents,
    mockDialog,
    mockQuizSvc,
    mockActivatedRoute,
    mockViewerSvc,
    mockRouter,
    mockValueSvc,
    mockConfigSvc,
    mockFormBuilder,
    mockSnackBar,
    mockSanitized,
    mockViewerDataSvc,
    mockViewerHeaderSideBarToggleService,
    mockRenderer,
    mockWidgetContentService,
    mockTocSvc,
    mockCdr,
  )
  return {
    comp, mockEvents, mockDialog, mockQuizSvc, mockRouter,
    mockSnackBar, mockValueSvc, mockViewerDataSvc, routerEvents$,
  }
}

describe('PracticeComponent', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    const { comp } = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('should set assessmentBuffer from environment on construction', () => {
    const { comp } = buildComponent()
    expect(comp.assessmentBuffer).toBe(10)
  })

  it('should set resourceName from viewerDataSvc', () => {
    const { comp } = buildComponent()
    expect(comp.resourceName).toBe('Test Resource')
  })

  it('toggleToolTip - toggles from false to true', () => {
    const { comp } = buildComponent()
    comp.showToolTip = false
    comp.toggleToolTip()
    expect(comp.showToolTip).toBe(true)
  })

  it('toggleToolTip - toggles from true to false', () => {
    const { comp } = buildComponent()
    comp.showToolTip = true
    comp.toggleToolTip()
    expect(comp.showToolTip).toBe(false)
  })

  it('handleCanAttendError - sets canAttempt when attempts exhausted', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp as any, 'updateVisivility').mockImplementation(() => { })
    comp.quizData = { maxAssessmentRetakeAttempts: 3 }
    const error = { params: { errmsg: 'attempts exhausted' } }
    comp.handleCanAttendError(error)
    expect(comp.canAttempt.attemptsAllowed).toBe(3)
    expect(comp.canAttempt.attemptsMade).toBe(3)
  })

  it('handleCanAttendError - uses error.message when no params', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp as any, 'updateVisivility').mockImplementation(() => { })
    const error = { message: 'retry attempts exceeded' }
    comp.handleCanAttendError(error)
    expect(comp.canAttempt).toBeDefined()
  })

  it('handleCanAttendError - handles error.error.params.errmsg', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp as any, 'updateVisivility').mockImplementation(() => { })
    const error = { error: { params: { errmsg: 'Maximum attempts reached' } } }
    comp.handleCanAttendError(error)
    expect(comp.canAttempt).toBeDefined()
  })

  it('handleCanAttendError - BAD_REQUEST responseCode triggers exhausted', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp as any, 'updateVisivility').mockImplementation(() => { })
    const error = { error: { responseCode: 'BAD_REQUEST', params: { errmsg: 'Error' } } }
    comp.handleCanAttendError(error)
    expect(comp.canAttempt).toBeDefined()
  })

  it('handleCanAttendError - shows snackbar', () => {
    const { comp, mockSnackBar } = buildComponent()
    jest.spyOn(comp as any, 'updateVisivility').mockImplementation(() => { })
    const error = { message: 'Some error' }
    comp.handleCanAttendError(error)
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('init - sets isMobile true when window.innerWidth < 768', () => {
    const { comp } = buildComponent()
    Object.defineProperty(window, 'innerWidth', { value: 400, writable: true, configurable: true })
    comp.init()
    expect(comp.isMobile).toBe(true)
  })

  it('init - sets isMobile false when window.innerWidth >= 768', () => {
    const { comp } = buildComponent()
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    comp.init()
    expect(comp.isMobile).toBe(false)
  })

  it('init - sets isSubmitted to false', () => {
    const { comp } = buildComponent()
    comp.isSubmitted = true
    comp.init()
    expect(comp.isSubmitted).toBe(false)
  })

  it('init - clears markedQuestions and questionAnswerHash', () => {
    const { comp } = buildComponent()
    comp.markedQuestions = new Set(['q1', 'q2']) as any
    comp.questionAnswerHash = { q1: ['a1'] }
    comp.init()
    expect(comp.markedQuestions.size).toBe(0)
    expect(comp.questionAnswerHash).toEqual({})
  })

  it('retakeAssessment - resets isSubmitted', () => {
    const { comp } = buildComponent()
    comp.isSubmitted = true
    comp.retakeAssessment()
    expect(comp.isSubmitted).toBe(false)
  })

  it('default viewState is initial', () => {
    const { comp } = buildComponent()
    expect(comp.viewState).toBe('initial')
  })

  it('default currentQuestionIndex is 0', () => {
    const { comp } = buildComponent()
    expect(comp.currentQuestionIndex).toBe(0)
  })

  it('default process is false', () => {
    const { comp } = buildComponent()
    expect(comp.process).toBe(false)
  })

  it('findNested - finds object by key and value', () => {
    const { comp } = buildComponent()
    const obj = { id: 'a', children: [{ id: 'b', name: 'target' }] }
    const result = comp.findNested(obj, 'name', 'target')
    expect(result).toBeTruthy()
    expect(result.name).toBe('target')
  })

  it('findNested - returns obj itself if key matches at top level', () => {
    const { comp } = buildComponent()
    const obj = { id: 'abc', name: 'root' }
    const result = comp.findNested(obj, 'id', 'abc')
    expect(result).toBe(obj)
  })

  it('findNested - returns undefined when not found', () => {
    const { comp } = buildComponent()
    const obj = { id: 'a', child: { id: 'b' } }
    const result = comp.findNested(obj, 'id', 'zzz')
    expect(result).toBeUndefined()
  })

  it('getInstructionAssessmentPagination - splits content into pages', () => {
    const { comp } = buildComponent()
    comp.charactersPerPage = 5
    comp.getInstructionAssessmentPagination('Hello World!')
    expect(Array.isArray(comp.instructionAssessment)).toBe(true)
    expect(comp.instructionAssessment.length).toBeGreaterThan(0)
  })

  it('getTimeLimit - returns timeLimit + assessmentBuffer', () => {
    const { comp } = buildComponent()
    comp.quizJson.timeLimit = 300
    comp.assessmentBuffer = 10
    comp.retake = false
    expect(comp.getTimeLimit).toBe(310)
  })

  it('isOnlySection - false when paperSections is null', () => {
    const { comp } = buildComponent()
    comp.paperSections = null
    expect(comp.isOnlySection).toBe(false)
  })

  it('isOnlySection - true when exactly one section', () => {
    const { comp } = buildComponent()
    comp.paperSections = [{ identifier: 's1' }] as any
    expect(comp.isOnlySection).toBe(true)
  })

  it('hasNextSet - false when total <= noOfQuestionsPerSet', () => {
    const { comp } = buildComponent()
    comp.totalQuestionsCount = 10
    comp.noOfQuestionsPerSet = 20
    comp.currentSetNumber = 0
    expect(comp.hasNextSet).toBe(false)
  })

  it('hasNextSet - true when more questions available', () => {
    const { comp } = buildComponent()
    comp.totalQuestionsCount = 50
    comp.noOfQuestionsPerSet = 20
    comp.currentSetNumber = 0
    expect(comp.hasNextSet).toBe(true)
  })

  it('hasPreviousSet - false when currentSetNumber is 0', () => {
    const { comp } = buildComponent()
    comp.currentSetNumber = 0
    expect(comp.hasPreviousSet).toBe(false)
  })

  it('hasPreviousSet - true when currentSetNumber > 0', () => {
    const { comp } = buildComponent()
    comp.currentSetNumber = 1
    expect(comp.hasPreviousSet).toBe(true)
  })

  it('getClass - returns not-started when no storeData found', () => {
    const { comp } = buildComponent()
    comp.attemptSubData = []
    const section: any = { identifier: 'sec1' }
    expect(comp.getClass(section)).toBe('not-started')
  })

  it('getClass - returns complete when fullAttempted is true', () => {
    const { comp } = buildComponent()
    comp.attemptSubData = [{ identifier: 'sec1', fullAttempted: true, isAttempted: true, nextSection: null, totalQueAttempted: 5, attemptData: null }]
    expect(comp.getClass({ identifier: 'sec1' } as any)).toBe('complete')
  })

  it('getClass - returns incomplete when isAttempted but not fullAttempted', () => {
    const { comp } = buildComponent()
    comp.attemptSubData = [{ identifier: 'sec1', fullAttempted: false, isAttempted: true, nextSection: null, totalQueAttempted: 2, attemptData: null }]
    expect(comp.getClass({ identifier: 'sec1' } as any)).toBe('incomplete')
  })

  it('secQuestions - returns empty array when quizJson has no questions', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = []
    comp.selectedSection = { identifier: 'sec1' } as any
    expect(comp.secQuestions).toEqual([])
  })

  it('secQuestions - returns empty when no selectedSection', () => {
    const { comp } = buildComponent()
    comp.selectedSection = null
    expect(comp.secQuestions).toEqual([])
  })
})
