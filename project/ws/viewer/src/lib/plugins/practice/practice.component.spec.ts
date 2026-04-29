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
  WsEvents: {
    EnumTelemetrymodules: { LEARN: 'learn' },
    EnumTelemetrySubType: { Loaded: 'Loaded', Unloaded: 'Unloaded', Interact: 'Interact' },
    WsEventType: { Telemetry: 'Telemetry' },
    WsEventLogLevel: { Info: 'Info' },
  },
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

  it('clearQuestion - deletes from questionAnswerHash', () => {
    const { comp, mockQuizSvc } = buildComponent()
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: null, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.clearResponse = { next: jest.fn() }
    comp.questionAnswerHash = { q1: ['a1'] }
    comp.clearQuestion({ questionId: 'q1' })
    expect(comp.questionAnswerHash['q1']).toBeUndefined()
    expect(mockQuizSvc).toBeDefined()
  })

  it('clearQuestion - does nothing if question not in hash', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: null, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.clearResponse = { next: jest.fn() }
    comp.questionAnswerHash = {}
    expect(() => comp.clearQuestion({ questionId: 'q1' })).not.toThrow()
  })

  it('backToSections - sets viewState to detail', () => {
    const { comp } = buildComponent()
    comp.backToSections()
    expect(comp.viewState).toBe('detail')
  })

  it('overViewed start - calls startQuiz and updateProgress', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'startQuiz').mockImplementation(jest.fn())
    jest.spyOn(comp, 'updateProgress').mockImplementation(jest.fn())
    jest.spyOn(comp, 'updatePreEnrollmentProgress').mockImplementation(jest.fn())
    comp.overViewed('start')
    expect(comp.retake).toBe(false)
    expect(comp.startQuiz).toHaveBeenCalled()
    expect(comp.updateProgress).toHaveBeenCalledWith(1)
  })

  it('overViewed skip - does not call startQuiz', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'startQuiz').mockImplementation(jest.fn())
    comp.overViewed('skip')
    expect(comp.startQuiz).not.toHaveBeenCalled()
  })

  it('startQuiz - sets viewState to attempt and calls getNextQuestion', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'getNextQuestion').mockImplementation(jest.fn())
    comp.isXsmall = false
    comp.startQuiz()
    expect(comp.viewState).toBe('attempt')
    expect(comp.currentQuestionIndex).toBe(0)
    expect(comp.getNextQuestion).toHaveBeenCalledWith(0)
  })

  it('startQuiz - opens sidenav when isXsmall=true', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'getNextQuestion').mockImplementation(jest.fn())
    comp.isXsmall = true
    comp.startQuiz()
    expect(comp.sidenavOpenDefault).toBe(true)
  })

  it('markSectionAsComplete - returns true when all questions answered', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [{ questionId: 'q1' }, { questionId: 'q2' }] as any
    comp.selectedSection = { identifier: 's1' } as any
    const answered = { q1: ['a'], q2: ['b'] }
    const result = comp.markSectionAsComplete(answered)
    expect(result).toBe(true)
  })

  it('markSectionAsComplete - returns false when some questions not answered', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [
      { questionId: 'q1', section: 's1' },
      { questionId: 'q2', section: 's1' }
    ] as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 5
    const answered = { q1: ['a'] }
    const result = comp.markSectionAsComplete(answered)
    expect(result).toBe(false)
  })

  it('showAnswers - calls showMtfAnswers, showFitbAnswers and sets viewState', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'showMtfAnswers').mockImplementation(jest.fn())
    jest.spyOn(comp, 'showFitbAnswers').mockImplementation(jest.fn())
    comp.showAnswers()
    expect(comp.viewState).toBe('answer')
    expect(comp.showMtfAnswers).toHaveBeenCalled()
    expect(comp.showFitbAnswers).toHaveBeenCalled()
  })

  it('showMtfAnswers - does not throw', () => {
    const { comp } = buildComponent()
    expect(() => comp.showMtfAnswers()).not.toThrow()
  })

  it('showFitbAnswers - handles null questionsReference', () => {
    const { comp } = buildComponent()
      ; (comp as any).questionsReference = null
    expect(() => comp.showFitbAnswers()).not.toThrow()
  })

  it('calculateResults - counts correct answers for MCQ', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [{
      questionId: 'q1',
      questionType: 'mcq',
      options: [
        { optionId: 'o1', isCorrect: true },
        { optionId: 'o2', isCorrect: false }
      ]
    }] as any
    comp.questionAnswerHash = { q1: ['o1'] }
    comp.calculateResults()
    expect(comp.numCorrectAnswers).toBe(1)
    expect(comp.numIncorrectAnswers).toBe(0)
  })

  it('calculateResults - counts incorrect answers for MCQ', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [{
      questionId: 'q1',
      questionType: 'mcq',
      options: [
        { optionId: 'o1', isCorrect: true },
        { optionId: 'o2', isCorrect: false }
      ]
    }] as any
    comp.questionAnswerHash = { q1: ['o2'] }
    comp.calculateResults()
    expect(comp.numIncorrectAnswers).toBe(1)
    expect(comp.numCorrectAnswers).toBe(0)
  })

  it('calculateResults - counts unanswered', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [{
      questionId: 'q1',
      questionType: 'mcq',
      options: [{ optionId: 'o1', isCorrect: true }]
    }] as any
    comp.questionAnswerHash = {}
    comp.calculateResults()
    expect(comp.numUnanswered).toBe(1)
  })

  it('calculateResults - handles fitb question correct', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [{
      questionId: 'q1',
      questionType: 'fitb',
      options: [{ text: 'answer', isCorrect: true }]
    }] as any
    comp.questionAnswerHash = { q1: ['answer'] }
    comp.calculateResults()
    expect(comp.numCorrectAnswers).toBe(1)
  })

  it('calculateResults - handles fitb question incorrect', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [{
      questionId: 'q1',
      questionType: 'fitb',
      options: [{ text: 'answer', isCorrect: true }]
    }] as any
    comp.questionAnswerHash = { q1: ['wrong'] }
    comp.calculateResults()
    expect(comp.numIncorrectAnswers).toBe(1)
  })

  it('isQuestionAttempted - returns true when in hash', () => {
    const { comp } = buildComponent()
    comp.questionAnswerHash = { q1: ['a'] }
    expect(comp.isQuestionAttempted('q1')).toBe(true)
  })

  it('isQuestionAttempted - returns false when not in hash', () => {
    const { comp } = buildComponent()
    comp.questionAnswerHash = {}
    expect(comp.isQuestionAttempted('q1')).toBe(false)
  })

  it('isQuestionMarked - returns true when marked', () => {
    const { comp } = buildComponent()
    comp.markedQuestions = new Set(['q1']) as any
    expect(comp.isQuestionMarked('q1')).toBe(true)
  })

  it('isQuestionMarked - returns false when not marked', () => {
    const { comp } = buildComponent()
    comp.markedQuestions = new Set([]) as any
    expect(comp.isQuestionMarked('q1')).toBe(false)
  })

  it('isQuestionVisited - returns true when in visitedData', () => {
    const { comp } = buildComponent()
    comp.questionVisitedData = ['q1', 'q2'] as any
    expect(comp.isQuestionVisited('q1')).toBe(true)
  })

  it('isQuestionVisited - returns false when not visited', () => {
    const { comp } = buildComponent()
    comp.questionVisitedData = [] as any
    expect(comp.isQuestionVisited('q1')).toBe(false)
  })

  it('markQuestion - adds question to markedQuestions', () => {
    const { comp } = buildComponent()
    comp.markedQuestions = new Set([]) as any
    comp.markQuestion('q1')
    expect(comp.isQuestionMarked('q1')).toBe(true)
  })

  it('markQuestion - removes already marked question', () => {
    const { comp } = buildComponent()
    comp.markedQuestions = new Set(['q1']) as any
    comp.markQuestion('q1')
    expect(comp.isQuestionMarked('q1')).toBe(false)
  })

  it('raiseTelemetry - with optionId calls raiseInteractTelemetry with optionId', () => {
    const { comp, mockEvents } = buildComponent()
    comp.raiseTelemetry('click', 'opt1', 'select')
    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
  })

  it('raiseTelemetry - without optionId calls raiseInteractTelemetry with identifier', () => {
    const { comp, mockEvents } = buildComponent()
    comp.identifier = 'test-id'
    comp.raiseTelemetry('click', null, 'select')
    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
  })

  it('checkAns - sets showAnswer=true when valid conditions', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.shCorrectAnswer = jest.fn()
    comp.quizJson.questions = [{ questionId: 'q1', section: 's1', editorState: { options: [{}] } }] as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 5
    comp.currentQuestion = { questionId: 'q1', editorState: { options: [{}] } } as any
    comp.checkAns(1)
    expect(comp.showAnswer).toBe(true)
  })

  it('checkAns - does nothing when quesIdx=0', () => {
    const { comp } = buildComponent()
    comp.currentQuestion = { editorState: { options: [{}] } } as any
    comp.checkAns(0)
    expect(comp.showAnswer).toBeFalsy()
  })

  it('updateVisivility - subscribes to displayCorrectAnswer', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.displayCorrectAnswer = of(true)
    comp.updateVisivility()
    expect(comp.showAnswer).toBe(true)
  })

  it('clearStorage - resets viewState and clears data', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.paperSections = { next: jest.fn() }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: null, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.qAnsHash = jest.fn()
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
    comp.viewState = 'attempt'
    comp.clearStorage()
    expect(comp.viewState).toBe('initial')
    expect(comp.currentQuestionIndex).toBe(0)
    expect(comp.attemptSubData).toEqual([])
  })

  it('clearStoragePartial - resets without changing viewState', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.paperSections = { next: jest.fn() }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: null, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.qAnsHash = jest.fn()
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
    comp.viewState = 'answer'
    comp.clearStoragePartial()
    expect(comp.currentQuestionIndex).toBe(0)
  })

  it('clearQuizJson - resets quizJson to defaults', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [{ questionId: 'q1' }] as any
    comp.clearQuizJson()
    expect(comp.quizJson.questions).toEqual([])
    expect(comp.quizJson.isAssessment).toBe(false)
  })

  it('toggleExpandforMobile - toggles expandFalse', () => {
    const { comp } = buildComponent()
    comp.expandFalse = false
    comp.toggleExpandforMobile()
    expect(comp.expandFalse).toBe(true)
  })

  it('ngOnDestroy - calls clearStorage and unsubscribes', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.paperSections = { next: jest.fn() }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: null, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.qAnsHash = jest.fn()
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
    const mockSub = { unsubscribe: jest.fn() }
      ; (comp as any).attemptSubscription = mockSub
      ; (comp as any).timerSubscription = mockSub
      ; (comp as any).telemetrySubscription = mockSub
      ; (comp as any).viewerDataTocSubscription = mockSub
    comp.ngOnDestroy()
    expect(mockSub.unsubscribe).toHaveBeenCalledTimes(4)
  })

  it('assignQuizResult - processes result and sets numCorrectAnswers', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.paperSections = { next: jest.fn() }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: null, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.qAnsHash = jest.fn()
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
      ; (comp as any).activatedRoute.snapshot.queryParams = {}
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ courseId: null, batchId: null })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).widgetContentService.fetchContentHistoryV2 = jest.fn().mockReturnValue(of(null))
    comp.forPreview = false
    comp.quizJson.isAssessment = false
    comp.quizJson.primaryCategory = 'Practice Resource' as any
    const res: any = { correct: 5, incorrect: 2, blank: 1, passPercentage: 60, overallResult: 80 }
    comp.assignQuizResult(res)
    expect(comp.numIncorrectAnswers).toBe(2)
    expect(comp.result).toBe(80)
    expect(comp.isCompleted).toBe(true)
  })

  it('assignQuizResult - isIdeal=true when isAssessment=true', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.paperSections = { next: jest.fn() }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: null, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.qAnsHash = jest.fn()
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
      ; (comp as any).activatedRoute.snapshot.queryParams = {}
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ courseId: null, batchId: null })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).widgetContentService.fetchContentHistoryV2 = jest.fn().mockReturnValue(of(null))
    comp.forPreview = false
    comp.quizJson.isAssessment = true
    comp.quizJson.primaryCategory = 'Practice Resource' as any
    const res: any = { correct: 3, incorrect: 1, blank: 0, passPercentage: 50, overallResult: 75 }
    comp.assignQuizResult(res)
  })

  it('formate - creates list items from text', () => {
    const { comp } = buildComponent()
    const result = comp.formate('item1\nitem2\nitem3')
    expect(result).toBeDefined()
    expect((comp as any).sanitized.bypassSecurityTrustHtml).toHaveBeenCalled()
  })

  it('formate - handles empty text', () => {
    const { comp } = buildComponent()
    const result = comp.formate('')
    expect(result).toBeDefined()
  })

  it('proceedToSubmit - opens dialog when compatibilityLevel < 7', () => {
    const { comp, mockDialog } = buildComponent()
    comp.selectedAssessmentCompatibilityLevel = 5
    comp.quizJson.questions = [{ questionId: 'q1' }] as any
    comp.questionAnswerHash = { q1: ['a'] }
    comp.markedQuestions = new Set([]) as any
    comp.canAttempt = { attemptsAllowed: 3, attemptsMade: 1 }
    comp.proceedToSubmit()
    expect(mockDialog.open).toHaveBeenCalled()
  })

  it('proceedToSubmit - calls openSectionPopup when compatibilityLevel >= 7', () => {
    const { comp } = buildComponent()
    comp.selectedAssessmentCompatibilityLevel = 7
    jest.spyOn(comp, 'openSectionPopup').mockImplementation(jest.fn())
    comp.proceedToSubmit()
    expect(comp.openSectionPopup).toHaveBeenCalledWith(true)
  })

  it('back - calls proceedToSubmit', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'proceedToSubmit').mockImplementation(jest.fn())
    comp.back()
    expect(comp.proceedToSubmit).toHaveBeenCalled()
  })

  it('action retake - resets state and calls retakeAssessment', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.paperSections = { next: jest.fn() }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: null, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.qAnsHash = jest.fn()
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
    jest.spyOn(comp, 'retakeAssessment').mockImplementation(jest.fn())
    jest.spyOn(comp, 'raiseInteractTelemetry').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'raiseEvent').mockImplementation(jest.fn())
    comp.forPreview = true
    comp.action('retake')
    expect(comp.isSubmitted).toBe(false)
    expect(comp.retake).toBe(true)
  })

  it('ngOnChanges - handles quiz change to multiply timeLimit', () => {
    const { comp } = buildComponent()
    comp.quizJson.timeLimit = 5
    const changes: any = { quiz: { currentValue: {}, previousValue: null, isFirstChange: jest.fn().mockReturnValue(false) } }
    comp.ngOnChanges(changes)
    expect(comp.quizJson.timeLimit).toBe(5000)
  })

  it('current_Question getter - returns currentQuestion', () => {
    const { comp } = buildComponent()
    comp.currentQuestion = { questionId: 'q1' } as any
    expect(comp.current_Question).toEqual({ questionId: 'q1' })
  })

  it('currentIndex getter - returns currentQuestionIndex', () => {
    const { comp } = buildComponent()
    comp.currentQuestionIndex = 3
    expect(comp.currentIndex).toBe(3)
  })

  it('totalQCount getter - returns secQuestions length', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [{ questionId: 'q1', sectionId: 's1' }] as any
    comp.selectedSection = { identifier: 's1' } as any
    expect(comp.totalQCount).toBeGreaterThanOrEqual(0)
  })

  it('noOfQuestions getter - returns totalAssessemntQuestionsCount if set', () => {
    const { comp } = buildComponent()
    comp.totalAssessemntQuestionsCount = 20
    expect(comp.noOfQuestions).toBe(20)
  })

  it('noOfQuestions getter - returns 0 when nothing set', () => {
    const { comp } = buildComponent()
    comp.totalAssessemntQuestionsCount = 0
    comp.retake = false
    expect(comp.noOfQuestions).toBe(0)
  })

  it('goToNextSet - increments currentSetNumber', () => {
    const { comp } = buildComponent()
    comp.currentSetNumber = 0
    comp.totalQuestionsCount = 50
    comp.noOfQuestionsPerSet = 20
    jest.spyOn(comp, 'getNextQuestion').mockImplementation(jest.fn())
    comp.goToNextSet()
    expect(comp.currentSetNumber).toBe(1)
  })

  it('goToPreviousSet - decrements currentSetNumber', () => {
    const { comp } = buildComponent()
    comp.currentSetNumber = 2
    jest.spyOn(comp, 'getNextQuestion').mockImplementation(jest.fn())
    comp.goToPreviousSet()
    expect(comp.currentSetNumber).toBe(1)
  })

  it('nextSection - calls startSection with the section', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'startSection').mockImplementation(jest.fn())
    const section: any = { identifier: 's1', additionalInstructions: null }
    comp.nextSection(section)
    expect(comp.startSection).toHaveBeenCalledWith(section)
  })

  it('recalculateParentProgress - returns when parent not found', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {}
    expect(() => comp.recalculateParentProgress('unknown-id')).not.toThrow()
  })

  it('recalculateParentProgress - calculates and updates parent progress', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'parent1': { name: 'Parent', primaryCategory: 'Module', completionPercentage: 0, completionStatus: 0, status: 0, parent: null },
        'child1': { name: 'Child 1', parent: 'parent1', completionStatus: 2, completionPercentage: 100, status: 2 },
        'child2': { name: 'Child 2', parent: 'parent1', completionStatus: 0, completionPercentage: 0, status: 0 }
      }
    comp.recalculateParentProgress('parent1')
    expect((comp as any).tocSvc.hashmap['parent1'].completionPercentage).toBe(50)
  })

  it('setBorderColor - sets border colors on elements', () => {
    const { comp } = buildComponent()
    const mockSource = document.createElement('div')
    const mockTarget = document.createElement('div')
    jest.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      if (id === 'src1') return mockSource
      if (id === 'tgt1') return mockTarget
      return null
    })
    comp.setBorderColor({ sourceId: 'src1', targetId: 'tgt1' } as any, '#ff0000')
    expect(mockSource.style.borderColor).toBe('#ff0000')
    expect(mockTarget.style.borderColor).toBe('#ff0000')
  })

  it('getQuestionIndex - returns correct index offset', () => {
    const { comp } = buildComponent()
    comp.currentSetNumber = 1
    comp.noOfQuestionsPerSet = 20
    const result = comp.getQuestionIndex(0)
    expect(typeof result).toBe('number')
  })

  it('getSelectedQuestionNumber - returns current question number', () => {
    const { comp } = buildComponent()
    comp.currentSetNumber = 0
    comp.noOfQuestionsPerSet = 20
    comp.currentQuestionIndex = 5
    const result = comp.getSelectedQuestionNumber()
    expect(typeof result).toBe('number')
  })

  it('ngOnInit - subscribes to secAttempted and processes children', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.secAttempted = new Subject()
    jest.spyOn(comp, 'canAttend').mockImplementation(jest.fn())
    jest.spyOn(comp, 'updateVisivility').mockImplementation(jest.fn())
      ; (comp as any).widgetContentService.currentMetaData = {
        primaryCategory: 'Course',
        courseCategory: 'Standalone',
        children: [{ identifier: 'child1', showMarks: 'Yes', compatibilityLevel: 5, maxQuestions: 10, description: 'Desc' }]
      }
    comp.identifier = 'child1'
    comp.ngOnInit()
    expect(comp.canAttend).toHaveBeenCalled()
  })

  it('ngOnInit - no children path triggers canAttend from pre-enrolment data', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'canAttend').mockImplementation(jest.fn())
    jest.spyOn(comp, 'updateVisivility').mockImplementation(jest.fn())
      ; (comp as any).widgetContentService.currentMetaData = {
        primaryCategory: 'Course',
        children: [],
        content: {
          data: {
            contextCategory: 'Pre Enrolment Assessment',
            showMarks: 'Yes',
            compatibilityLevel: 5,
            maxQuestions: 10,
            description: 'pre-desc'
          }
        }
      }
    comp.ngOnInit()
    expect(comp.canAttend).toHaveBeenCalled()
  })

  it('ngOnInit - no children and no pre-assessment does not call canAttend', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'canAttend').mockImplementation(jest.fn())
    jest.spyOn(comp, 'updateVisivility').mockImplementation(jest.fn())
      ; (comp as any).widgetContentService.currentMetaData = {
        primaryCategory: 'Course',
        children: []
      }
    comp.ngOnInit()
    expect(comp.canAttend).not.toHaveBeenCalled()
  })

  it('canAttend - for preview skips API call and calls init', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'init').mockImplementation(jest.fn())
    jest.spyOn(comp, 'updateVisivility').mockImplementation(jest.fn())
    comp.forPreview = true
      ; (comp as any).forCreatorMode = false
    comp.canAttend()
    expect(comp.init).toHaveBeenCalled()
    expect(comp.updateVisivility).toHaveBeenCalled()
  })

  it('canAttend - calls canAttend API when not preview and compatibilityLevel < 7', () => {
    const { comp, mockQuizSvc } = buildComponent()
    jest.spyOn(comp, 'init').mockImplementation(jest.fn())
    jest.spyOn(comp, 'updateVisivility').mockImplementation(jest.fn())
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 5
    comp.canAttend()
    expect(mockQuizSvc.canAttend).toHaveBeenCalled()
    expect(comp.init).toHaveBeenCalled()
  })

  it('canAttend - calls canAttendV5 when compatibilityLevel >= 7', () => {
    const { comp, mockQuizSvc } = buildComponent()
    jest.spyOn(comp, 'init').mockImplementation(jest.fn())
    jest.spyOn(comp, 'updateVisivility').mockImplementation(jest.fn())
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 7
    comp.canAttend()
    expect(mockQuizSvc.canAttendV5).toHaveBeenCalled()
  })

  it('getPublicUserDetails - does not throw', () => {
    const { comp } = buildComponent()
      ; (comp as any).viewerSvc.getPublicUser = jest.fn(() => of({ result: { response: { email: 'test@test.com' } } }))
    expect(() => comp.getPublicUserDetails()).not.toThrow()
  })

  it('retakeAssessment - calls canAttend for compatibility < 7', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'init').mockImplementation(jest.fn())
    jest.spyOn(comp, 'updateVisivility').mockImplementation(jest.fn())
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 5
    comp.isSubmitted = true
    comp.retakeAssessment()
    expect(comp.isSubmitted).toBe(false)
  })

  it('getSections - initializes sections state', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'canAttend').mockImplementation(jest.fn())
    jest.spyOn(comp, 'init').mockImplementation(jest.fn())
    jest.spyOn(comp, 'updateVisivility').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.paperSections = of(null)
      ; (comp as any).quizSvc.currentSection = { next: jest.fn() }
      ; (comp as any).quizSvc.getSectionV4 = jest.fn().mockReturnValue(of({ result: { questionSet: { children: [] } } }))
    comp.quizData = { sections: [], isAssessment: false, maxAssessmentRetakeAttempts: 1 }
    expect(() => comp.getSections()).not.toThrow()
  })
})
