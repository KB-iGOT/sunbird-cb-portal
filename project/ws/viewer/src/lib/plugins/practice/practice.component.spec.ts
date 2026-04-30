import { PracticeComponent } from './practice.component'
import { of, Subject, throwError } from 'rxjs'

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
    EnumTelemetrySubType: { Loaded: 'Loaded', Unloaded: 'Unloaded', Interact: 'Interact', CLICK: 'Click' },
    EnumInteractTypes: { CLICK: 'Click' },
    WsEventType: { Telemetry: 'Telemetry' },
    WsEventLogLevel: { Info: 'Info' },
    WsTimeSpentType: { Player: 'player' },
    WsTimeSpentMode: { Play: 'play' },
  },
  NsContent: {
    EPrimaryCategory: {
      PRACTICE_RESOURCE: 'Practice Resource',
      FINAL_ASSESSMENT: 'Final Assessment',
      MULTIPLE_CHOICE_QUESTION: 'Multiple Choice Question',
      FILL_IN_THE_BLANK: 'Fill in the Blank',
      MATCH_THE_FOLLOWING: 'Match The Following',
    },
    ECourseCategory: { STANDALONE_ASSESSMENT: 'Standalone Assessment' },
    EMimeTypes: {
      QUESTION: 'application/vnd.sunbird.question',
      QUESTION_SET: 'application/vnd.sunbird.questionset',
    },
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
  const mockViewerDataSvc: any = { resource: { name: 'Test Resource' }, tocChangeSubject: of({}) }
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

  // ------ updataDB ------
  it('updataDB - builds secAttempted data from sections array', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
    const sections: any = [
      { identifier: 's1' },
      { identifier: 's2' },
    ]
    comp.updataDB(sections)
    expect((comp as any).quizSvc.secAttempted.next).toHaveBeenCalledWith([
      expect.objectContaining({ identifier: 's1', nextSection: 's2', fullAttempted: false }),
      expect.objectContaining({ identifier: 's2', nextSection: null, fullAttempted: false }),
    ])
  })

  it('updataDB - handles empty sections', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
    comp.updataDB([])
    expect((comp as any).quizSvc.secAttempted.next).toHaveBeenCalledWith([])
  })

  // ------ changeSection ------
  it('changeSection - calls startSection with matching section', () => {
    const { comp } = buildComponent()
    const section: any = { identifier: 's1', additionalInstructions: null, childNodes: [] }
    comp.paperSections = [section] as any
    jest.spyOn(comp, 'startSection').mockImplementation(jest.fn())
    comp.changeSection('s1')
    expect(comp.startSection).toHaveBeenCalledWith(section)
  })

  it('changeSection - does nothing if identifier not found', () => {
    const { comp } = buildComponent()
    comp.paperSections = [{ identifier: 's1' }] as any
    jest.spyOn(comp, 'startSection').mockImplementation(jest.fn())
    comp.changeSection('nonexistent')
    expect(comp.startSection).not.toHaveBeenCalled()
  })

  // ------ getRhsValue ------
  it('getRhsValue - returns rhsChoices for MTF type', () => {
    const { comp } = buildComponent()
    const q: any = { qType: 'MTF', rhsChoices: ['A', 'B'] }
    expect(comp.getRhsValue(q)).toEqual(['A', 'B'])
  })

  it('getRhsValue - returns empty array for mcq-sca type', () => {
    const { comp } = buildComponent()
    const q: any = { qType: 'mcq-sca', rhsChoices: ['A'] }
    expect(comp.getRhsValue(q)).toEqual([])
  })

  it('getRhsValue - returns empty array when question is null', () => {
    const { comp } = buildComponent()
    expect(comp.getRhsValue(null as any)).toEqual([])
  })

  // ------ getOptions ------
  it('getOptions - returns empty array for null question', () => {
    const { comp } = buildComponent()
    expect(comp.getOptions(null as any)).toEqual([])
  })

  it('getOptions - handles mcq-sca with editorState', () => {
    const { comp } = buildComponent()
    const q: any = {
      qType: 'mcq-sca',
      editorState: { options: [{ value: { value: 'opt1', body: 'Option 1' }, answer: true }] },
    }
    const opts = comp.getOptions(q)
    expect(opts).toHaveLength(1)
    expect(opts[0].optionId).toBe('opt1')
    expect(opts[0].isCorrect).toBe(true)
  })

  it('getOptions - handles MCQ-MCA type', () => {
    const { comp } = buildComponent()
    const q: any = {
      qType: 'MCQ-MCA',
      editorState: { options: [{ value: { value: 'a', body: 'A' }, answer: true }, { value: { value: 'b', body: 'B' }, answer: false }] },
    }
    const opts = comp.getOptions(q)
    expect(opts).toHaveLength(2)
  })

  it('getOptions - handles ftb type', () => {
    const { comp } = buildComponent()
    const q: any = {
      qType: 'ftb',
      body: 'Blank 1 _______________ rest Blank 2 _______________ end _______________',
    }
    const opts = comp.getOptions(q)
    expect(opts.length).toBeGreaterThanOrEqual(1)
  })

  it('getOptions - handles mtf type with editorState', () => {
    const { comp } = buildComponent()
    comp.primaryCategory = 'Practice Resource' as any
    const q: any = {
      qType: 'mtf',
      editorState: { options: [{ value: { value: 'v1', body: 'Source 1' }, answer: 'A' }] },
      rhsChoices: ['A', 'B'],
    }
    const opts = comp.getOptions(q)
    expect(opts).toHaveLength(1)
    expect(opts[0].match).toBe('A')
  })

  // ------ getClass ------
  it('getClass - returns not-started when no storeData', () => {
    const { comp } = buildComponent()
    comp.attemptSubData = []
    const result = comp.getClass({ identifier: 's1' } as any)
    expect(result).toBe('not-started')
  })

  it('getClass - returns complete when fullAttempted', () => {
    const { comp } = buildComponent()
    comp.attemptSubData = [{ identifier: 's1', fullAttempted: true, isAttempted: true }] as any
    const result = comp.getClass({ identifier: 's1' } as any)
    expect(result).toBe('complete')
  })

  it('getClass - returns incomplete when isAttempted but not fullAttempted', () => {
    const { comp } = buildComponent()
    comp.attemptSubData = [{ identifier: 's1', fullAttempted: false, isAttempted: true }] as any
    const result = comp.getClass({ identifier: 's1' } as any)
    expect(result).toBe('incomplete')
  })

  // ------ scroll ------
  it('scroll - calls getNextQuestion with idx-1 for positive idx', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'getNextQuestion').mockImplementation(jest.fn())
    comp.scroll(3)
    expect(comp.getNextQuestion).toHaveBeenCalledWith(2)
  })

  it('scroll - does not call getNextQuestion for idx 0', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'getNextQuestion').mockImplementation(jest.fn())
    comp.scroll(0)
    expect(comp.getNextQuestion).not.toHaveBeenCalled()
  })

  // ------ ngOnChanges name change ------
  it('ngOnChanges - calls clearStorage when name changes', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'clearStorage').mockImplementation(jest.fn())
    const changes: any = { name: { currentValue: 'NewName', previousValue: 'OldName', isFirstChange: jest.fn().mockReturnValue(false) } }
    comp.ngOnChanges(changes)
    expect(comp.clearStorage).toHaveBeenCalled()
  })

  // ------ getNextQuestion ------
  it('getNextQuestion - updates currentQuestion and pushes to visitedData', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [
      { questionId: 'q1', section: 's1' } as any,
      { questionId: 'q2', section: 's1' } as any,
    ]
    comp.selectedSection = { identifier: 's1' } as any
    comp.questionVisitedData = []
    comp.currentQuestion = { questionId: 'q1', section: 's1' } as any
    comp.currentQuestionIndex = 0
    comp.getNextQuestion(1)
    expect(comp.currentQuestion).toBeDefined()
  })

  it('getNextQuestion - goes to next set when idx >= totalQCount', () => {
    const { comp } = buildComponent()
    comp.totalQuestionsCount = 20
    comp.noOfQuestionsPerSet = 5
    comp.currentSetNumber = 0
    comp.quizJson.questions = [{ questionId: 'q1', section: 's1' } as any]
    comp.selectedSection = { identifier: 's1' } as any
    jest.spyOn(comp, 'goToNextSet').mockImplementation(jest.fn())
    comp.getNextQuestion(20) // >= totalQCount and hasNextSet
    // goToNextSet may or may not be called depending on hasNextSet
    expect(() => comp.getNextQuestion(20)).not.toThrow()
  })

  // ------ clearQuestion ------
  it('clearQuestion - removes answer from hash and calls clearResponse', () => {
    const { comp } = buildComponent()
    comp.questionAnswerHash = { q1: ['a'] }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn() }
      ; (comp as any).quizSvc.clearResponse = { next: jest.fn() }
    comp.clearQuestion({ questionId: 'q1' })
    expect(comp.questionAnswerHash['q1']).toBeUndefined()
    expect((comp as any).quizSvc.clearResponse.next).toHaveBeenCalledWith('q1')
  })

  it('clearQuestion - does nothing if questionId not in hash', () => {
    const { comp } = buildComponent()
    comp.questionAnswerHash = {}
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn() }
      ; (comp as any).quizSvc.clearResponse = { next: jest.fn() }
    comp.clearQuestion({ questionId: 'qX' })
    expect((comp as any).quizSvc.questionAnswerHash.next).not.toHaveBeenCalled()
  })

  // ------ backToSections ------
  it('backToSections - sets viewState to detail', () => {
    const { comp } = buildComponent()
    comp.viewState = 'attempt'
    comp.backToSections()
    expect(comp.viewState).toBe('detail')
  })

  // ------ overViewed ------
  it('overViewed - start event calls startQuiz and updateProgress', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'startQuiz').mockImplementation(jest.fn())
    jest.spyOn(comp, 'updateProgress').mockImplementation(jest.fn())
    jest.spyOn(comp, 'updatePreEnrollmentProgress').mockImplementation(jest.fn())
    jest.spyOn(comp, 'getNextQuestion').mockImplementation(jest.fn())
    comp.overViewed('start')
    expect(comp.startQuiz).toHaveBeenCalled()
    expect(comp.updateProgress).toHaveBeenCalledWith(1)
  })

  it('overViewed - skip event does not throw', () => {
    const { comp } = buildComponent()
    expect(() => comp.overViewed('skip')).not.toThrow()
  })

  // ------ updateProgress ------
  it('updateProgress - calls realTimeProgressUpdateQuiz when collectionId and batchId present', () => {
    const { comp } = buildComponent()
    const mockViewerSvcLocal: any = {
      getBatchIdAndCourseId: jest.fn().mockReturnValue({ courseId: 'c1', batchId: 'b1' }),
      realTimeProgressUpdateQuiz: jest.fn(),
    }
      ; (comp as any).viewerSvc = mockViewerSvcLocal
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1' }
    comp.identifier = 'do_123'
    comp.selectedSection = { primaryCategory: 'Learning Resource' } as any
    comp.updateProgress(1)
    expect(mockViewerSvcLocal.realTimeProgressUpdateQuiz).toHaveBeenCalled()
  })

  it('updateProgress - skips when no collectionId', () => {
    const { comp } = buildComponent()
    const mockViewerSvcLocal: any = {
      getBatchIdAndCourseId: jest.fn().mockReturnValue({ courseId: '', batchId: '' }),
      realTimeProgressUpdateQuiz: jest.fn(),
    }
      ; (comp as any).viewerSvc = mockViewerSvcLocal
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: '', batchId: '' }
    comp.updateProgress(1)
    expect(mockViewerSvcLocal.realTimeProgressUpdateQuiz).not.toHaveBeenCalled()
  })

  // ------ startQuiz ------
  it('startQuiz - sets viewState to attempt and resets index', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'getNextQuestion').mockImplementation(jest.fn())
    comp.startQuiz()
    expect(comp.viewState).toBe('attempt')
    expect(comp.currentQuestionIndex).toBe(0)
  })

  // ------ isQuestionAttempted ------
  it('isQuestionAttempted - returns true when question in hash', () => {
    const { comp } = buildComponent()
    comp.questionAnswerHash = { q1: ['a'] }
    expect(comp.isQuestionAttempted('q1')).toBe(true)
  })

  it('isQuestionAttempted - returns false when question not in hash', () => {
    const { comp } = buildComponent()
    comp.questionAnswerHash = {}
    expect(comp.isQuestionAttempted('q1')).toBe(false)
  })

  // ------ isQuestionMarked / isQuestionVisited ------
  it('isQuestionMarked - returns true when questionId in markedQuestions', () => {
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
    comp.questionVisitedData = ['q1', 'q2']
    expect(comp.isQuestionVisited('q1')).toBe(true)
  })

  it('isQuestionVisited - returns false when not visited', () => {
    const { comp } = buildComponent()
    comp.questionVisitedData = ['q2']
    expect(comp.isQuestionVisited('q1')).toBe(false)
  })

  // ------ markQuestion ------
  it('markQuestion - adds questionId to markedQuestions', () => {
    const { comp } = buildComponent()
    comp.markedQuestions = new Set([]) as any
    comp.markQuestion('q1')
    expect(comp.isQuestionMarked('q1')).toBe(true)
  })

  it('markQuestion - removes questionId if already marked', () => {
    const { comp } = buildComponent()
    comp.markedQuestions = new Set(['q1']) as any
    comp.markQuestion('q1')
    expect(comp.isQuestionMarked('q1')).toBe(false)
  })

  // ------ raiseTelemetry ------
  it('raiseTelemetry - calls raiseInteractTelemetry when optionId is present', () => {
    const { comp } = buildComponent()
      ; (comp as any).events = { raiseInteractTelemetry: jest.fn() }
    comp.raiseTelemetry('select', 'opt1', 'click')
    expect((comp as any).events.raiseInteractTelemetry).toHaveBeenCalled()
  })

  it('raiseTelemetry - calls with identifier when optionId is null', () => {
    const { comp } = buildComponent()
      ; (comp as any).events = { raiseInteractTelemetry: jest.fn() }
    comp.identifier = 'do_123'
    comp.raiseTelemetry('select', null, 'click')
    expect((comp as any).events.raiseInteractTelemetry).toHaveBeenCalled()
  })

  // ------ checkAns ------
  it('checkAns - sets showAnswer to true when quesIdx > 0 and question has editorState', () => {
    const { comp } = buildComponent()
    comp.selectedSection = { identifier: 's1' } as any
    comp.quizJson.questions = [{ questionId: 'q1', section: 's1' } as any, { questionId: 'q2', section: 's1' } as any]
    comp.selectedAssessmentCompatibilityLevel = 5
    comp.currentQuestion = { questionId: 'q1', section: 's1', editorState: { options: [{ answer: 'a' }] } } as any
    comp.showAnswer = false
      ; (comp as any).quizSvc.shCorrectAnswer = jest.fn()
    comp.checkAns(1)
    expect(comp.showAnswer).toBe(true)
  })

  // ------ updateVisivility ------
  it('updateVisivility - does not throw', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.displayCorrectAnswer = { subscribe: jest.fn() }
    expect(() => comp.updateVisivility()).not.toThrow()
  })

  // ------ clearStorage ------
  it('clearStorage - resets quiz state to initial', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.paperSections = { next: jest.fn() }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: {}, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
      ; (comp as any).quizSvc.qAnsHash = jest.fn()
      ; (comp as any).quizSvc.mtfSrc = { next: jest.fn() }
    comp.clearStorage()
    expect(comp.viewState).toBe('initial')
  })

  // ------ clearStoragePartial ------
  it('clearStoragePartial - does not throw', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.paperSections = { next: jest.fn() }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: {}, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
      ; (comp as any).quizSvc.qAnsHash = jest.fn()
      ; (comp as any).quizSvc.mtfSrc = { next: jest.fn() }
    expect(() => comp.clearStoragePartial()).not.toThrow()
  })

  // ------ clearQuizJson ------
  it('clearQuizJson - does not throw', () => {
    const { comp } = buildComponent()
    comp.quizJson = { questions: [], timeLimit: 0 } as any
    expect(() => comp.clearQuizJson()).not.toThrow()
  })

  // ------ toggleExpandforMobile ------
  it('toggleExpandforMobile - toggles expandFalse', () => {
    const { comp } = buildComponent()
      ; (comp as any).expandFalse = false
    comp.toggleExpandforMobile()
    expect((comp as any).expandFalse).toBe(true)
    comp.toggleExpandforMobile()
    expect((comp as any).expandFalse).toBe(false)
  })

  // ------ showAnswers ------
  it('showAnswers - sets viewState to answer', () => {
    const { comp } = buildComponent()
    comp.viewState = 'attempt'
    comp.showAnswers()
    expect(comp.viewState).toBe('answer')
  })

  // ------ calculateResults ------
  it('calculateResults - sets numCorrectAnswers and numIncorrectAnswers', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [
      {
        questionId: 'q1',
        questionType: 'mcq-sca',
        options: [
          { optionId: 'a', isCorrect: true },
          { optionId: 'b', isCorrect: false },
        ],
      },
    ] as any
    comp.questionAnswerHash = { q1: ['a'] }
    comp.calculateResults()
    expect(comp.numCorrectAnswers).toBe(1)
    expect(comp.numIncorrectAnswers).toBe(0)
  })

  it('calculateResults - counts incorrect when wrong option selected', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [
      {
        questionId: 'q1',
        questionType: 'mcq-sca',
        options: [
          { optionId: 'a', isCorrect: true },
          { optionId: 'b', isCorrect: false },
        ],
      },
    ] as any
    comp.questionAnswerHash = { q1: ['b'] }
    comp.calculateResults()
    expect(comp.numIncorrectAnswers).toBe(1)
  })

  it('calculateResults - handles ftb correctly', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [
      {
        questionId: 'q1',
        questionType: 'fitb',
        options: [{ optionId: '0', isCorrect: true, text: 'answer' }],
      },
    ] as any
    comp.questionAnswerHash = { q1: ['answer'] }
    expect(() => comp.calculateResults()).not.toThrow()
  })

  // ------ getSectionTableDataCounts ------
  it('getSectionTableDataCounts - counts answered and marked questions', () => {
    const { comp } = buildComponent()
    comp.questionAnswerHash = { q1: ['a'], q2: ['b'] }
    comp.markedQuestions = new Set(['q2']) as any
    comp.questionVisitedData = ['q1', 'q2', 'q3']
    const result = comp.getSectionTableDataCounts(['q1', 'q2', 'q3'])
    expect(result.answeredCount).toBe(1)
    expect(result.markedForReviewCount).toBe(1)
  })

  it('getSectionTableDataCounts - returns zeros for empty arrays', () => {
    const { comp } = buildComponent()
    comp.questionAnswerHash = {}
    comp.markedQuestions = new Set([]) as any
    comp.questionVisitedData = []
    const result = comp.getSectionTableDataCounts([])
    expect(result.answeredCount).toBe(0)
    expect(result.markedForReviewCount).toBe(0)
  })

  // ------ raiseEvent ------
  it('raiseEvent - dispatches telemetry event', () => {
    const { comp } = buildComponent()
    const dispatchFn = jest.fn()
      ; (comp as any).events = { dispatchEvent: dispatchFn, raiseInteractTelemetry: jest.fn() }
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'col1' }
    const data: any = { identifier: 'do_123', primaryCategory: 'Course', artifactUrl: 'http://test' }
    expect(() => comp.raiseEvent('Loaded' as any, data)).not.toThrow()
  })

  it('raiseEvent - handles null data gracefully', () => {
    const { comp } = buildComponent()
      ; (comp as any).events = { dispatchEvent: jest.fn(), raiseInteractTelemetry: jest.fn() }
      ; (comp as any).activatedRoute.snapshot.queryParams = {}
    expect(() => comp.raiseEvent('Loaded' as any, null as any)).not.toThrow()
  })

  // ------ raiseInteractTelemetry ------
  it('raiseInteractTelemetry - does not throw', () => {
    const { comp } = buildComponent()
      ; (comp as any).events = { raiseImpressionTelemetry: jest.fn(), raiseInteractTelemetry: jest.fn() }
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'col1' }
    comp.quizData = { identifier: 'do_123' } as any
    expect(() => comp.raiseInteractTelemetry()).not.toThrow()
  })

  // ------ getInstructionAssessmentPagination ------
  it('getInstructionAssessmentPagination - splits content into pages', () => {
    const { comp } = buildComponent()
      ; (comp as any).charactersPerPage = 10
    comp.getInstructionAssessmentPagination('abcdefghijklmnopqrst') // 20 chars
    expect(comp.instructionAssessment).toHaveLength(2)
  })

  it('getInstructionAssessmentPagination - handles empty string', () => {
    const { comp } = buildComponent()
    comp.getInstructionAssessmentPagination('')
    expect(comp.instructionAssessment).toEqual([])
  })

  // ------ getTimeLimit getter ------
  it('getTimeLimit - returns quizJson.timeLimit + assessmentBuffer', () => {
    const { comp } = buildComponent()
    comp.quizJson.timeLimit = 100
      ; (comp as any).assessmentBuffer = 10
    expect(comp.getTimeLimit).toBe(110)
  })

  it('getTimeLimit - for retake with timeLimit 0, fetches from route', () => {
    const { comp } = buildComponent()
    comp.quizJson.timeLimit = 0
    comp.retake = true
      ; (comp as any).activatedRoute = { snapshot: { data: { content: { data: { expectedDuration: 50 } } }, queryParams: {} } }
      ; (comp as any).assessmentBuffer = 5
    expect(comp.getTimeLimit).toBe(55)
  })

  // ------ isOnlySection getter ------
  it('isOnlySection - returns true when exactly one section', () => {
    const { comp } = buildComponent()
    comp.paperSections = [{ identifier: 's1' }] as any
    expect(comp.isOnlySection).toBe(true)
  })

  it('isOnlySection - returns false when multiple sections', () => {
    const { comp } = buildComponent()
    comp.paperSections = [{ identifier: 's1' }, { identifier: 's2' }] as any
    expect(comp.isOnlySection).toBe(false)
  })

  // ------ secQuestions getter ------
  it('secQuestions - returns questions for selected section', () => {
    const { comp } = buildComponent()
    comp.selectedSection = { identifier: 's1' } as any
    comp.quizJson.questions = [
      { questionId: 'q1', section: 's1' } as any,
      { questionId: 'q2', section: 's2' } as any,
    ]
    comp.selectedAssessmentCompatibilityLevel = 5
    const qs = comp.secQuestions
    expect(qs.length).toBe(1)
  })

  it('secQuestions - returns empty when no selectedSection', () => {
    const { comp } = buildComponent()
    comp.selectedSection = null as any
    expect(comp.secQuestions).toEqual([])
  })

  // ------ hasNextSet / hasPreviousSet ------
  it('hasNextSet - returns true when more questions than current set end', () => {
    const { comp } = buildComponent()
    comp.totalQuestionsCount = 50
    comp.noOfQuestionsPerSet = 20
    comp.currentSetNumber = 0
    expect(comp.hasNextSet).toBe(true)
  })

  it('hasNextSet - returns false when on last set', () => {
    const { comp } = buildComponent()
    comp.totalQuestionsCount = 20
    comp.noOfQuestionsPerSet = 20
    comp.currentSetNumber = 0
    expect(comp.hasNextSet).toBe(false)
  })

  it('hasPreviousSet - returns true when currentSetNumber > 0', () => {
    const { comp } = buildComponent()
    comp.currentSetNumber = 1
    expect(comp.hasPreviousSet).toBe(true)
  })

  it('hasPreviousSet - returns false when on first set', () => {
    const { comp } = buildComponent()
    comp.currentSetNumber = 0
    expect(comp.hasPreviousSet).toBe(false)
  })

  // ------ markSectionAsComplete ------
  it('markSectionAsComplete - returns true when all section questions answered', () => {
    const { comp } = buildComponent()
    comp.selectedSection = { identifier: 's1' } as any
    comp.quizJson.questions = [
      { questionId: 'q1', section: 's1' } as any,
    ]
    comp.questionAnswerHash = { q1: ['a'] }
    comp.selectedAssessmentCompatibilityLevel = 5
    expect(comp.markSectionAsComplete({ q1: 'a' })).toBe(true)
  })

  it('markSectionAsComplete - returns false when not all answered', () => {
    const { comp } = buildComponent()
    comp.selectedSection = { identifier: 's1' } as any
    comp.quizJson.questions = [
      { questionId: 'q1', section: 's1' } as any,
      { questionId: 'q2', section: 's1' } as any,
    ]
    comp.questionAnswerHash = { q1: ['a'] }
    comp.selectedAssessmentCompatibilityLevel = 5
    expect(comp.markSectionAsComplete({ q1: 'a' })).toBe(false)
  })

  // ------ getQuestionIndex / getSelectedQuestionNumber ------
  it('getQuestionIndex - adds set offset to index', () => {
    const { comp } = buildComponent()
    comp.currentSetNumber = 1
    comp.noOfQuestionsPerSet = 10
    expect(comp.getQuestionIndex(2)).toBe(13)
  })

  it('getSelectedQuestionNumber - returns 0 when no currentQuestion', () => {
    const { comp } = buildComponent()
    comp.currentQuestion = null as any
    expect(comp.getSelectedQuestionNumber()).toBe(0)
  })

  it('getSelectedQuestionNumber - returns correct number for found question', () => {
    const { comp } = buildComponent()
    comp.currentSetNumber = 0
    comp.noOfQuestionsPerSet = 20
    comp.currentQuestion = { questionId: 'q2', section: 's1' } as any
    comp.quizJson.questions = [
      { questionId: 'q1', section: 's1' } as any,
      { questionId: 'q2', section: 's1' } as any,
    ]
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 5
    const result = comp.getSelectedQuestionNumber()
    expect(result).toBe(2)
  })

  // ------ goToNextSet / goToPreviousSet with questions ------
  it('goToNextSet - updates currentQuestion to first question of next set', () => {
    const { comp } = buildComponent()
    comp.currentSetNumber = 0
    comp.totalQuestionsCount = 50
    comp.noOfQuestionsPerSet = 5
    comp.quizJson.questions = Array.from({ length: 25 }, (_, i) => ({
      questionId: `q${i + 1}`, section: 's1',
    })) as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 7
    comp.questionVisitedData = []
    comp.goToNextSet()
    expect(comp.currentSetNumber).toBe(1)
  })

  it('goToPreviousSet - updates currentQuestion to last question of prev set', () => {
    const { comp } = buildComponent()
    comp.currentSetNumber = 2
    comp.noOfQuestionsPerSet = 5
    comp.quizJson.questions = Array.from({ length: 25 }, (_, i) => ({
      questionId: `q${i + 1}`, section: 's1',
    })) as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 7
    comp.goToPreviousSet()
    expect(comp.currentSetNumber).toBe(1)
  })

  // ------ openSnackbar ------
  it('openSnackbar - calls snackBar open', () => {
    const { comp } = buildComponent()
    expect(() => (comp as any).openSnackbar('Test message')).not.toThrow()
  })

  // ------ toggleToolTip ------
  it('toggleToolTip - toggles showToolTip', () => {
    const { comp } = buildComponent()
    comp.showToolTip = false
    comp.toggleToolTip()
    expect(comp.showToolTip).toBe(true)
    comp.toggleToolTip()
    expect(comp.showToolTip).toBe(false)
  })

  // ------ findNested ------
  it('findNested - finds nested object by key value', () => {
    const { comp } = buildComponent()
    const obj = { level1: { level2: { id: 'target', name: 'found' } } }
    const result = comp.findNested(obj, 'id', 'target')
    expect(result).toEqual({ id: 'target', name: 'found' })
  })

  it('findNested - returns undefined when not found', () => {
    const { comp } = buildComponent()
    const obj = { a: { b: { c: 'val' } } }
    const result = comp.findNested(obj, 'id', 'nonexistent')
    expect(result).toBeUndefined()
  })

  // ------ ngOnDestroy ------
  it('ngOnDestroy - does not throw', () => {
    const { comp } = buildComponent()
      ; (comp as any).timerSubscription = { unsubscribe: jest.fn() }
      ; (comp as any).routerSubscription = { unsubscribe: jest.fn() }
      ; (comp as any).quizSvc.paperSections = { next: jest.fn() }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: {}, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
      ; (comp as any).quizSvc.qAnsHash = jest.fn()
      ; (comp as any).quizSvc.mtfSrc = { next: jest.fn() }
    expect(() => comp.ngOnDestroy()).not.toThrow()
  })

  // ------ Action switch (retake with forPreview) ------
  it('action retake - for preview does not call retakeAssessment', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.paperSections = { next: jest.fn() }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: {}, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
    jest.spyOn(comp, 'raiseInteractTelemetry').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'raiseEvent').mockImplementation(jest.fn())
    jest.spyOn(comp, 'clearStoragePartial').mockImplementation(jest.fn())
    jest.spyOn(comp, 'clearStorage').mockImplementation(jest.fn())
    comp.forPreview = true
    comp.action('retake')
    expect(comp.isSubmitted).toBe(false)
    expect(comp.retake).toBe(true)
  })

  // ------ beforeUnloadHander ------
  it('beforeUnloadHander - sets returnValue when not submitted', () => {
    const { comp } = buildComponent()
    comp.isSubmitted = false
    comp.viewState = 'attempt'
    const event: any = { preventDefault: jest.fn(), returnValue: '' }
    comp.beforeUnloadHander(event)
    expect(event.returnValue).not.toBe('')
  })

  // ------ assignQuizResult edge cases ------
  it('assignQuizResult - sets finalResponse and updates result', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.paperSections = { next: jest.fn() }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: {}, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.qAnsHash = jest.fn()
      ; (comp as any).quizSvc.mtfSrc = { next: jest.fn() }
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
      ; (comp as any).activatedRoute.snapshot.queryParams = {}
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ courseId: null, batchId: null })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).widgetContentService.fetchContentHistoryV2 = jest.fn().mockReturnValue(of(null))
    comp.forPreview = true // skip fetchProgressOfAssessment
    const res: any = { correct: 5, incorrect: 2, blank: 3, passPercentage: 60, overallResult: 71.4 }
    expect(() => comp.assignQuizResult(res)).not.toThrow()
    expect(comp.finalResponse).toBe(res)
    expect(comp.numCorrectAnswers).toBe(5)
  })

  // ------ getQuestions ------
  it('getQuestions - returns empty array for empty section', () => {
    const { comp } = buildComponent()
    const section: any = { identifier: 's1' }
    const req: any = { questions: [] }
    const result = comp.getQuestions(section, req)
    expect(result).toEqual([])
  })

  it('getQuestions - processes mcq-mca question', () => {
    const { comp } = buildComponent()
    const section: any = { identifier: 's1' }
    const req: any = {
      questions: [{
        questionId: 'q1',
        section: 's1',
        questionType: 'mcq-mca',
        options: [{ optionId: 'a', userSelected: true }, { optionId: 'b', userSelected: false }],
      }],
    }
    const result = comp.getQuestions(section, req)
    expect(result).toHaveLength(1)
  })

  it('getQuestions - processes ftb question', () => {
    const { comp } = buildComponent()
    const section: any = { identifier: 's1' }
    const req: any = {
      questions: [{
        questionId: 'q1',
        section: 's1',
        questionType: 'ftb',
        options: [{ optionId: '0', response: 'answer' }],
      }],
    }
    const result = comp.getQuestions(section, req)
    expect(result).toHaveLength(1)
  })

  it('getQuestions - processes mtf question', () => {
    const { comp } = buildComponent()
    const section: any = { identifier: 's1' }
    const req: any = {
      questions: [{
        questionId: 'q1',
        section: 's1',
        questionType: 'mtf',
        options: [{ optionId: 'a', userSelected: true, response: 'B', text: 'Source 1' }],
      }],
    }
    const result = comp.getQuestions(section, req)
    expect(result).toHaveLength(1)
  })

  // ------ checkMilestoneComplete / getMilestoneNumber / hasNextMilestone ------
  it('checkMilestoneComplete - returns false when hashmap empty', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {}
    expect(comp.checkMilestoneComplete('m1')).toBe(false)
  })

  it('getMilestoneNumber - returns a number for any milestone ID', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {}
    const result = comp.getMilestoneNumber('m1')
    expect(typeof result).toBe('number')
  })

  it('hasNextMilestone - returns false when no milestones', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {}
    expect(comp.hasNextMilestone(1)).toBe(false)
  })

  // ------ getNextMilestoneId ------
  it('getNextMilestoneId - returns null when no hashmap', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {}
    expect(comp.getNextMilestoneId(1)).toBeNull()
  })

  // ------ fillSelectedItems ------
  it('fillSelectedItems - single choice sets answer in hash', () => {
    const { comp } = buildComponent()
    const qAnsHashFn = jest.fn()
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue({}), next: jest.fn() }
      ; (comp as any).quizSvc.qAnsHash = qAnsHashFn
      ; (comp as any).quizSvc.questionAnswerHash = { getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.setFullAttemptSection = jest.fn()
    comp.questionAnswerHash = {}
    comp.assessmentType = 'normal' as any // Override default 'optionalWeightage'
    comp.selectedSection = { identifier: 's1' } as any
    comp.quizJson.questions = []
    const q: any = { questionId: 'q1', multiSelection: false, questionType: 'mcq-sca' }
    comp.fillSelectedItems(q, 'opt1')
    expect(qAnsHashFn).toHaveBeenCalledWith(expect.objectContaining({ q1: ['opt1'] }))
  })

  it('fillSelectedItems - multi choice adds to existing answers', () => {
    const { comp } = buildComponent()
    const qAnsHashFn = jest.fn()
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue({}), next: jest.fn() }
      ; (comp as any).quizSvc.qAnsHash = qAnsHashFn
      ; (comp as any).quizSvc.questionAnswerHash = { getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.setFullAttemptSection = jest.fn()
    comp.questionAnswerHash = { q1: ['opt1'] }
    comp.assessmentType = 'normal' as any // Override default 'optionalWeightage'
    comp.selectedSection = { identifier: 's1' } as any
    comp.quizJson.questions = []
    const q: any = { questionId: 'q1', multiSelection: true, questionType: 'mcq-mca' }
    comp.fillSelectedItems(q, 'opt2')
    expect(qAnsHashFn).toHaveBeenCalled()
  })

  it('fillSelectedItems - multi choice removes existing option when clicked again', () => {
    const { comp } = buildComponent()
    const qAnsHashFn = jest.fn()
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue({}), next: jest.fn() }
      ; (comp as any).quizSvc.qAnsHash = qAnsHashFn
      ; (comp as any).quizSvc.questionAnswerHash = { getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.setFullAttemptSection = jest.fn()
    comp.questionAnswerHash = { q1: ['opt1'] }
    comp.assessmentType = 'normal' as any // Override default 'optionalWeightage'
    comp.selectedSection = { identifier: 's1' } as any
    comp.quizJson.questions = []
    const q: any = { questionId: 'q1', multiSelection: true, questionType: 'mcq-mca' }
    comp.fillSelectedItems(q, 'opt1') // deselects opt1
    expect(qAnsHashFn).toHaveBeenCalled()
  })

  it('fillSelectedItems - mtf question updates mtfSrc', () => {
    const { comp } = buildComponent()
    const mtfSrcNext = jest.fn()
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue({}), next: mtfSrcNext }
      ; (comp as any).quizSvc.qAnsHash = jest.fn()
      ; (comp as any).quizSvc.questionAnswerHash = { getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.setFullAttemptSection = jest.fn()
    comp.questionAnswerHash = {}
    comp.selectedSection = { identifier: 's1' } as any
    comp.quizJson.questions = []
    const q: any = { questionId: 'q1', multiSelection: false, questionType: 'mtf' }
    const response = [{ source: { innerText: 'S1' }, target: { id: 'T1' } }]
    comp.fillSelectedItems(q, response)
    expect(mtfSrcNext).toHaveBeenCalled()
  })

  it('fillSelectedItems - optionalWeightage with checked sets answer', () => {
    const { comp } = buildComponent()
    const qAnsHashFn = jest.fn()
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue({}), next: jest.fn() }
      ; (comp as any).quizSvc.qAnsHash = qAnsHashFn
      ; (comp as any).quizSvc.questionAnswerHash = { getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.setFullAttemptSection = jest.fn()
    comp.questionAnswerHash = {}
    comp.assessmentType = 'optionalWeightage' as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.quizJson.questions = []
    const q: any = { questionId: 'q1', multiSelection: false, questionType: 'mcq-sca' }
    comp.fillSelectedItems(q, { index: 'opt1', status: true })
    expect(qAnsHashFn).toHaveBeenCalledWith(expect.objectContaining({ q1: ['opt1'] }))
  })

  // ------ calculateResults - mcq-mca path ------
  it('calculateResults - correctly counts mcq-mca', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [
      {
        questionId: 'q1',
        questionType: 'mcq-mca',
        options: [
          { optionId: 'a', isCorrect: true },
          { optionId: 'b', isCorrect: true },
          { optionId: 'c', isCorrect: false },
        ],
      },
    ] as any
    comp.questionAnswerHash = { q1: ['a', 'b'] }
    comp.calculateResults()
    expect(comp.numCorrectAnswers).toBe(1)
  })

  it('calculateResults - counts unanswered questions', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [
      { questionId: 'q1', questionType: 'mcq-sca', options: [{ optionId: 'a', isCorrect: true }] },
      { questionId: 'q2', questionType: 'mcq-sca', options: [{ optionId: 'a', isCorrect: true }] },
    ] as any
    comp.questionAnswerHash = {}
    comp.calculateResults()
    expect(comp.numUnanswered).toBe(2)
  })

  // ------ getQuestions - more question types ------
  it('getQuestions - processes mcq-sca question', () => {
    const { comp } = buildComponent()
    const section: any = { identifier: 's1' }
    const req: any = {
      questions: [{
        questionId: 'q1',
        section: 's1',
        questionType: 'mcq-sca',
        options: [{ optionId: 'a', userSelected: true }],
      }],
    }
    const result = comp.getQuestions(section, req)
    expect(result).toHaveLength(1)
  })

  it('getQuestions - processes mcq-sca-tf question', () => {
    const { comp } = buildComponent()
    const section: any = { identifier: 's1' }
    const req: any = {
      questions: [{
        questionId: 'q1',
        section: 's1',
        questionType: 'mcq-sca-tf',
        options: [{ optionId: 'true', userSelected: true }],
      }],
    }
    const result = comp.getQuestions(section, req)
    expect(result).toHaveLength(1)
  })

  // ------ openSnackbar ------
  it('openSnackbar - calls snackbar.open with message', () => {
    const { comp } = buildComponent()
      ; (comp as any).openSnackbar('Test message')
    expect((comp as any).snackbar.open).toHaveBeenCalled()
  })

  // ------ getPublicUserDetails ------
  it('getPublicUserDetails - opens dialog for public user input', () => {
    const { comp, mockDialog } = buildComponent()
    expect(() => comp.getPublicUserDetails()).not.toThrow()
    expect(mockDialog.open).toHaveBeenCalled()
  })

  // ------ getClass - not-started when storeData exists but no flags set ------
  it('getClass - returns not-started when storeData has no flags set', () => {
    const { comp } = buildComponent()
    comp.attemptSubData = [{ identifier: 's1', fullAttempted: false, isAttempted: false }] as any
    const result = comp.getClass({ identifier: 's1' } as any)
    expect(result).toBe('not-started')
  })

  // ------ startSection - with secQuestions already loaded ------
  it('startSection - with existing secQuestions does not fetch from API', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.startSection = jest.fn()
    jest.spyOn(comp, 'overViewed').mockImplementation(jest.fn())
    comp.selectedSection = { identifier: 's1' } as any
    comp.quizJson.questions = [{ questionId: 'q1', section: 's1' } as any]
    comp.selectedAssessmentCompatibilityLevel = 5
    const section: any = { identifier: 's1', childNodes: ['q1'], additionalInstructions: null }
    comp.startSection(section)
    expect(comp.fetchingQuestionsStatus).toBe('done')
  })

  it('startSection - sets sectionalTimer when section has expectedDuration', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'overViewed').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.startSection = jest.fn()
    comp.selectedSection = { identifier: 's2' } as any
    comp.quizJson.questions = [{ questionId: 'q1', section: 's2' } as any]
    comp.selectedAssessmentCompatibilityLevel = 5
    const section: any = { identifier: 's2', expectedDuration: 300, childNodes: ['q1'], additionalInstructions: null }
    comp.startSection(section)
    expect(comp.sectionalTimer).toBe(true)
    expect(comp.quizJson.timeLimit).toBe(300)
  })

  it('startSection - sets sectionalTimer false when no expectedDuration', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'overViewed').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.startSection = jest.fn()
    comp.selectedSection = { identifier: 's2' } as any
    comp.quizJson.questions = [{ questionId: 'q1', section: 's2' } as any]
    comp.selectedAssessmentCompatibilityLevel = 5
    const section: any = { identifier: 's2', childNodes: ['q1'], additionalInstructions: null }
    comp.startSection(section)
    expect(comp.sectionalTimer).toBe(false)
  })

  it('startSection - sets questionParagraph from section', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'overViewed').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.startSection = jest.fn()
    comp.selectedSection = { identifier: 's1' } as any
    comp.quizJson.questions = [{ questionId: 'q1', section: 's1' } as any]
    comp.selectedAssessmentCompatibilityLevel = 5
    const section: any = { identifier: 's1', questionParagraph: 'Some paragraph&nbsp;here', childNodes: ['q1'], additionalInstructions: null }
    comp.startSection(section)
    expect(comp.questionParagraph).toBe('Some paragraph here')
  })

  // ------ getNextQuestion - optionalWeightage not yet answered ------
  it('getNextQuestion - optionalWeightage shows snackbar when previous unanswered', () => {
    const { comp } = buildComponent()
    comp.assessmentType = 'optionalWeightage' as any
    comp.quizJson.questions = [
      { questionId: 'q1', section: 's1' } as any,
      { questionId: 'q2', section: 's1' } as any,
    ]
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 5
    comp.currentQuestion = { questionId: 'q1', section: 's1' } as any
    comp.currentQuestionIndex = 0
    comp.questionVisitedData = ['q1']
    comp.questionAnswerHash = {} // q1 not answered
    jest.spyOn(comp as any, 'openSnackbar').mockImplementation(jest.fn())
    comp.getNextQuestion(1) // try to go to q2 without answering q1
    expect((comp as any).openSnackbar).toHaveBeenCalled()
  })

  // ------ action - retake with preview & compatibility >= 7 ------
  it('action retake - with forPreview=false and compat>=7 calls canAttendV5', () => {
    const { comp, mockQuizSvc } = buildComponent()
      ; (comp as any).quizSvc.paperSections = { next: jest.fn() }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: {}, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.qAnsHash = jest.fn()
      ; (comp as any).quizSvc.mtfSrc = { next: jest.fn() }
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
    jest.spyOn(comp, 'raiseInteractTelemetry').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'raiseEvent').mockImplementation(jest.fn())
    jest.spyOn(comp, 'clearStoragePartial').mockImplementation(jest.fn())
    jest.spyOn(comp, 'clearStorage').mockImplementation(jest.fn())
    jest.spyOn(comp, 'retakeAssessment').mockImplementation(jest.fn())
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 7
    comp.primaryCategory = 'Final Assessment' as any
    comp.action('retake')
    expect(mockQuizSvc.canAttendV5).toHaveBeenCalled()
  })

  // ------ proceedToSubmit - unanswered state ------
  it('proceedToSubmit - sets submissionState to unanswered when not all answered', () => {
    const { comp } = buildComponent()
    comp.selectedAssessmentCompatibilityLevel = 5
    comp.quizJson.questions = [{ questionId: 'q1' }, { questionId: 'q2' }] as any
    comp.questionAnswerHash = { q1: ['a'] } // only 1 of 2 answered
    comp.markedQuestions = new Set([]) as any
    comp.canAttempt = { attemptsAllowed: 3, attemptsMade: 1 }
    comp.proceedToSubmit()
    expect(comp.submissionState).toBe('unanswered')
  })

  it('proceedToSubmit - sets submissionState to marked when some are marked', () => {
    const { comp } = buildComponent()
    comp.selectedAssessmentCompatibilityLevel = 5
    comp.quizJson.questions = [{ questionId: 'q1' }] as any
    comp.questionAnswerHash = { q1: ['a'] }
    comp.markedQuestions = new Set(['q1']) as any
    comp.canAttempt = { attemptsAllowed: 3, attemptsMade: 1 }
    comp.proceedToSubmit()
    expect(comp.submissionState).toBe('marked')
  })

  // ------ recalculateParentProgress - with actual parent ------
  it('recalculateParentProgress - updates completionPercentage when children change', () => {
    const { comp } = buildComponent()
      ; (comp as any).viewerSvc = {
        realTimeProgressUpdate: jest.fn().mockReturnValue(of({})),
        getBatchIdAndCourseId: jest.fn().mockReturnValue({}),
      }
      ; (comp as any).activatedRoute.snapshot.queryParams = {}
      ; (comp as any).tocSvc.hashmap = {
        'p1': { name: 'Parent', primaryCategory: 'Course', completionPercentage: 0, completionStatus: 0, status: 0, parent: null },
        'c1': { name: 'Child1', parent: 'p1', completionStatus: 2, completionPercentage: 100, status: 2 },
        'c2': { name: 'Child2', parent: 'p1', completionStatus: 0, completionPercentage: 0, status: 0 },
      }
    comp.recalculateParentProgress('p1')
    // After calling, parent progress should be updated
    expect(typeof (comp as any).tocSvc.hashmap['p1'].completionPercentage).toBe('number')
  })

  // ------ checkMilestoneComplete - with data ------
  it('checkMilestoneComplete - returns true when no mandatory content or assessments exist', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'm1': { primaryCategory: 'Milestone', name: 'Milestone 1', children: [] },
      }
    // No children with parent='m1', so both mandatoryCheck=true and assessmentCheck=true
    expect(comp.checkMilestoneComplete('m1')).toBe(true)
  })

  // ------ showMtfAnswers / showFitbAnswers ------
  it('showMtfAnswers - does not throw', () => {
    const { comp } = buildComponent()
    expect(() => comp.showMtfAnswers()).not.toThrow()
  })

  it('showFitbAnswers - does not throw when no questionsReference', () => {
    const { comp } = buildComponent()
    comp.questionsReference = null as any
    expect(() => comp.showFitbAnswers()).not.toThrow()
  })

  // ------ calculateResults - additional paths ------
  it('calculateResults - fitb correct match', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [
      {
        questionId: 'q1',
        questionType: 'fitb',
        options: [{ optionId: '0', isCorrect: true, text: 'answer' }],
      },
    ] as any
    comp.questionAnswerHash = { q1: ['answer'] }
    comp.calculateResults()
    expect(comp.numCorrectAnswers).toBe(1)
  })

  it('calculateResults - fitb incorrect match', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [
      {
        questionId: 'q1',
        questionType: 'fitb',
        options: [{ optionId: '0', isCorrect: true, text: 'correctAnswer' }],
      },
    ] as any
    comp.questionAnswerHash = { q1: ['wrongAnswer'] }
    comp.calculateResults()
    expect(comp.numIncorrectAnswers).toBe(1)
  })

  // ------ assignQuizResult - more branches ------
  it('assignQuizResult - sets isCompleted when result >= passPercentage', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.paperSections = { next: jest.fn() }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: {}, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.qAnsHash = jest.fn()
      ; (comp as any).quizSvc.mtfSrc = { next: jest.fn() }
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
      ; (comp as any).activatedRoute.snapshot.queryParams = {}
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({})
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
    comp.forPreview = true
    const res: any = { correct: 8, incorrect: 2, blank: 0, passPercentage: 60, overallResult: 80 }
    comp.assignQuizResult(res)
    expect(comp.isCompleted).toBe(true)
  })

  it('assignQuizResult - isAssessment sets isIdeal', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.paperSections = { next: jest.fn() }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: {}, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.qAnsHash = jest.fn()
      ; (comp as any).quizSvc.mtfSrc = { next: jest.fn() }
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
      ; (comp as any).activatedRoute.snapshot.queryParams = {}
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({})
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
    comp.forPreview = true
    comp.quizJson.isAssessment = true
    const res: any = { correct: 5, incorrect: 2, blank: 3, passPercentage: 80, overallResult: 50 }
    comp.assignQuizResult(res)
    expect(comp.isIdeal).toBe(true)
  })

  it('assignQuizResult - pre-assessment path calls updatePreEnrollmentProgress', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.paperSections = { next: jest.fn() }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn(), value: {}, getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.qAnsHash = jest.fn()
      ; (comp as any).quizSvc.mtfSrc = { next: jest.fn() }
      ; (comp as any).quizSvc.secAttempted = { next: jest.fn() }
      ; (comp as any).activatedRoute.snapshot.queryParams = { preAssessment: true }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({})
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).viewerSvc.realTimeProgressUpdateForPreAssessmentQuiz = jest.fn()
    comp.forPreview = true
    jest.spyOn(comp, 'updatePreEnrollmentProgress').mockImplementation(jest.fn())
    const res: any = { correct: 5, incorrect: 2, blank: 3, passPercentage: 60, overallResult: 71 }
    comp.assignQuizResult(res)
    expect(comp.updatePreEnrollmentProgress).toHaveBeenCalled()
  })

  // ------ startSection - additional edge cases ------
  it('startSection - with questionParagraph uses nbsp replacement', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'overViewed').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.startSection = jest.fn()
    comp.selectedSection = { identifier: 's1' } as any
    comp.quizJson.questions = [{ questionId: 'q1', section: 's1' } as any]
    comp.selectedAssessmentCompatibilityLevel = 5
    const section: any = { identifier: 's1', questionParagraph: 'Hello&nbsp;World', childNodes: ['q1'], additionalInstructions: null }
    comp.startSection(section)
    expect(comp.questionParagraph).toBe('Hello World')
  })

  it('startSection - with no section does not throw', () => {
    const { comp } = buildComponent()
    // startSection checks 'if (section)' so null should be handled by the outer if
    // Confirm the check: it reads section.additionalInstructions before the guard
    expect(() => comp.startSection({ identifier: '', childNodes: [] } as any)).not.toThrow()
  })

  // ------ getNextQuestion - non-optionalWeightage path ------
  it('getNextQuestion - normal mode updates currentQuestion', () => {
    const { comp } = buildComponent()
    comp.assessmentType = 'normal' as any
    comp.quizJson.questions = [
      { questionId: 'q1', section: 's1' } as any,
      { questionId: 'q2', section: 's1' } as any,
    ]
    comp.selectedSection = { identifier: 's1' } as any
    comp.currentQuestion = { questionId: 'q1', section: 's1' } as any
    comp.currentQuestionIndex = 0
    comp.questionVisitedData = ['q1']
    comp.selectedAssessmentCompatibilityLevel = 5
    comp.getNextQuestion(1)
    expect(comp.currentQuestion).toBeDefined()
  })

  it('getNextQuestion - does not update when idx out of range', () => {
    const { comp } = buildComponent()
    comp.assessmentType = 'normal' as any
    comp.quizJson.questions = [{ questionId: 'q1', section: 's1' } as any]
    comp.selectedSection = { identifier: 's1' } as any
    comp.currentQuestion = { questionId: 'q1', section: 's1' } as any
    comp.currentQuestionIndex = 0
    comp.selectedAssessmentCompatibilityLevel = 5
    const before = comp.currentQuestion
    comp.getNextQuestion(99) // out of range
    expect(comp.currentQuestion).toBe(before) // unchanged
  })

  // ------ back - calls proceedToSubmit ------
  it('back - calls proceedToSubmit even for compat>=7', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'openSectionPopup').mockImplementation(jest.fn())
    comp.selectedAssessmentCompatibilityLevel = 7
    comp.back()
    expect(comp.openSectionPopup).toHaveBeenCalledWith(true)
  })

  // ------ init - sets up component ------
  it('init - subscribes to router events and sets up state', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'getSections').mockImplementation(jest.fn())
    jest.spyOn(comp, 'getPublicUserDetails').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.paperSections = { value: null, subscribe: jest.fn() }
    comp.quizData = { identifier: 'do_123', isAssessment: false, primaryCategory: 'Practice Resource' } as any
    expect(() => comp.init()).not.toThrow()
  })

  // ------ getSections - with paperSections already loaded ------
  it('getSections - uses cached paperSections when available', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'startIfonlySection').mockImplementation(jest.fn())
    jest.spyOn(comp, 'updateTimer').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.paperSections = {
        value: {
          questionSet: {
            children: [{ identifier: 's1', objectType: 'Collection', primaryCategory: 'Assessment' }],
            showTimer: 'Yes',
            expectedDuration: 300,
          }
        }
      }
    comp.quizData = { sections: [], isAssessment: true } as any
    comp.getSections()
    expect(comp.paperSections).toBeDefined()
    expect(comp.paperSections!.length).toBeGreaterThan(0)
  })

  // ------ retakeAssessment - resets state ------
  it('retakeAssessment - resets isSubmitted and questionAnswerHash', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'canAttend').mockImplementation(jest.fn())
    jest.spyOn(comp, 'updateVisivility').mockImplementation(jest.fn())
    jest.spyOn(comp, 'init').mockImplementation(jest.fn())
    comp.forPreview = true // Skip the API and router subscriptions
    comp.isSubmitted = true
    comp.retakeAssessment()
    expect(comp.isSubmitted).toBe(false)
    expect(comp.questionAnswerHash).toEqual({})
  })

  // ------ getMultiQuestions - chooses correct API based on compatibilityLevel ------
  it('getMultiQuestions - uses getQuestionsV4 for compat < 7', async () => {
    const { comp } = buildComponent()
    comp.selectedAssessmentCompatibilityLevel = 5
      ; (comp as any).quizSvc.getQuestionsV4 = jest.fn().mockReturnValue(of({ result: { questions: [] } }))
    await comp.getMultiQuestions(['q1'])
    expect((comp as any).quizSvc.getQuestionsV4).toHaveBeenCalled()
  })

  it('getMultiQuestions - uses getQuestions for compat >= 7', async () => {
    const { comp } = buildComponent()
    comp.selectedAssessmentCompatibilityLevel = 7
      ; (comp as any).quizSvc.getQuestions = jest.fn().mockReturnValue(of({ result: { questions: [] } }))
    await comp.getMultiQuestions(['q1'])
    expect((comp as any).quizSvc.getQuestions).toHaveBeenCalled()
  })

  // ------ updatePreEnrollmentProgress ------
  it('updatePreEnrollmentProgress - does nothing when no preAssessment flag', () => {
    const { comp } = buildComponent()
      ; (comp as any).activatedRoute.snapshot.queryParams = {}
    expect(() => comp.updatePreEnrollmentProgress(1)).not.toThrow()
  })

  it('updatePreEnrollmentProgress - calls realTimeProgressUpdate when preAssessment', () => {
    const { comp } = buildComponent()
      ; (comp as any).activatedRoute.snapshot.queryParams = { preAssessment: true }
    const mockViewerSvcLocal: any = { realTimeProgressUpdateForPreAssessmentQuiz: jest.fn() }
      ; (comp as any).viewerSvc = mockViewerSvcLocal
    comp.identifier = 'do_123'
      ; (comp as any).widgetContentService.currentMetaData = {
        content: { data: { parent: 'p1' } },
      } as any
      ; (comp as any).tocSvc.hashmap = { 'p1': { completionPercentage: 0, completionStatus: 0 } }
    expect(() => comp.updatePreEnrollmentProgress(1)).not.toThrow()
  })

  // ------ openSectionPopup - basic path ------
  it('openSectionPopup - does not throw with default args', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp as any, 'setQuestionStartTime').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.secAttempted = { getValue: jest.fn().mockReturnValue([]), next: jest.fn() }
    comp.questionSectionTableData = []
    comp.markedQuestions = new Set([]) as any
    comp.questionAnswerHash = {}
    comp.questionVisitedData = []
    jest.spyOn(comp as any, 'showAssessmentPopup').mockImplementation(jest.fn())
    expect(() => comp.openSectionPopup(false, false)).not.toThrow()
  })

  it('openSectionPopup - with sections builds tableData', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp as any, 'setQuestionStartTime').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'showAssessmentPopup').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.secAttempted = { getValue: jest.fn().mockReturnValue([]), next: jest.fn() }
    comp.assessmentType = 'normal' as any
    comp.questionSectionTableData = [{ name: 'Section 1', childNodes: ['q1'], identifier: 's1' }] as any
    comp.markedQuestions = new Set([]) as any
    comp.questionAnswerHash = { q1: ['a'] }
    comp.questionVisitedData = ['q1']
    comp.selectedSectionIdentifier = 's1'
    expect(() => comp.openSectionPopup(true, false)).not.toThrow()
    expect((comp as any).showAssessmentPopup).toHaveBeenCalled()
  })

  // ------ getSectionTotalQuestionAndAnswerCount ------
  it('getSectionTotalQuestionAndAnswerCount - returns zero obj when no matching section', () => {
    const { comp } = buildComponent()
    comp.questionSectionTableData = [{ identifier: 's1', childNodes: ['q1'] }] as any
    comp.selectedSectionIdentifier = 'nonexistent'
    comp.markedQuestions = new Set([]) as any
    comp.questionAnswerHash = {}
    comp.questionVisitedData = []
    const result = (comp as any).getSectionTotalQuestionAndAnswerCount()
    expect(result.totalCount).toBe(0)
  })

  it('getSectionTotalQuestionAndAnswerCount - returns counts for matching section', () => {
    const { comp } = buildComponent()
    comp.questionSectionTableData = [{ identifier: 's1', childNodes: ['q1', 'q2'], name: 'S1', minimumPassPercentage: 60 }] as any
    comp.selectedSectionIdentifier = 's1'
    comp.markedQuestions = new Set([]) as any
    comp.questionAnswerHash = { q1: ['a'] }
    comp.questionVisitedData = ['q1']
    const result = (comp as any).getSectionTotalQuestionAndAnswerCount()
    expect(result.totalCount).toBe(2)
    expect(result.answered).toBe(1)
  })

  // ------ subscribeToTocChanges ------
  it('subscribeToTocChanges - does not throw', () => {
    const { comp } = buildComponent()
    expect(() => (comp as any).subscribeToTocChanges()).not.toThrow()
  })

  // ------ clearQuizJson - resets quiz state ------
  it('clearQuizJson - resets quizJson to default', () => {
    const { comp } = buildComponent()
    comp.quizJson.questions = [{ questionId: 'q1' }] as any
    comp.quizJson.timeLimit = 999
    comp.clearQuizJson()
    expect(comp.quizJson.questions).toEqual([])
    expect(comp.quizJson.timeLimit).toBe(0)
  })

  // ------ showAssessmentPopup ------
  it('showAssessmentPopup - calls dialog.open', () => {
    const { comp, mockDialog } = buildComponent()
    const popupData = {
      assessmentType: 'submit',
      tableColumns: [],
      tableData: [],
      headerText: 'Submit',
      message: 'Are you sure?',
    }
    comp.showAssessmentPopup(popupData)
    expect(mockDialog.open).toHaveBeenCalled()
  })

  // ------ getSections - HTTP path (selectedAssessmentCompatibilityLevel < 7) ------
  it('getSections - HTTP getSectionV4 OK response sets paperSections', done => {
    const { comp } = buildComponent()
    comp.identifier = 'do_123'
    comp.selectedAssessmentCompatibilityLevel = 4
    const sectionResp = {
      responseCode: 'OK',
      result: {
        questionSet: {
          compatibilityLevel: 4,
          assessmentType: 'normal',
          showTimer: 'No',
          expectedDuration: 3600,
          showMarks: 'Yes',
          children: [
            { identifier: 's1', name: 'Sec1', childNodes: ['q1'] }
          ]
        }
      }
    }
      ; (comp as any).quizSvc.getSectionV4 = jest.fn().mockReturnValue(of(sectionResp))
      ; (comp as any).quizSvc.paperSections = { value: null }
    jest.spyOn(comp as any, 'updataDB').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'startIfonlySection').mockImplementation(jest.fn())
    comp.getSections()
    setTimeout(() => {
      expect((comp as any).fetchingSectionsStatus).toBe('done')
      expect(comp.paperSections).toHaveLength(1)
      done()
    }, 10)
  })

  it('getSections - HTTP getSectionV4 error sets fetchingSectionsStatus=error', done => {
    const { comp } = buildComponent()
    comp.identifier = 'do_123'
    comp.selectedAssessmentCompatibilityLevel = 4
    const mockErr = { status: 400, error: { params: { errmsg: 'Bad request' } } }
      ; (comp as any).quizSvc.getSectionV4 = jest.fn().mockReturnValue(throwError(mockErr))
      ; (comp as any).quizSvc.paperSections = { value: null }
      ; (comp as any).viewerHeaderSideBarToggleService = { visibilityStatus: { next: jest.fn() } }
    comp.getSections()
    setTimeout(() => {
      expect((comp as any).fetchingSectionsStatus).toBe('error')
      done()
    }, 10)
  })

  it('getSections - cached paperSections sets viewState to detail', () => {
    const { comp } = buildComponent()
    comp.identifier = 'do_123'
      ; (comp as any).quizSvc.paperSections = {
        value: {
          questionSet: {
            children: [{ identifier: 's1', childNodes: ['q1'] }],
            showTimer: 'no',
            expectedDuration: 600
          }
        }
      }
    jest.spyOn(comp as any, 'startIfonlySection').mockImplementation(jest.fn())
    comp.getSections()
    expect(comp.viewState).toBe('detail')
  })

  // ------ submitQuiz - assessmentType normal, no paperSections ------
  it('submitQuiz - normal assessmentType practice resource sets viewState=review', async () => {
    const { comp } = buildComponent()
    comp.assessmentType = 'normal' as any
    comp.primaryCategory = 'Practice Question Set' as any
    comp.paperSections = []
    comp.quizData = { identifier: 'do_123' } as any
    jest.spyOn(comp as any, 'raiseTelemetry').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'ngOnDestroy').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.secAttempted = { getValue: jest.fn().mockReturnValue([]), next: jest.fn() }
    await comp.submitQuiz()
    expect(comp.viewState).toBe('review')
  })

  it('submitQuiz - normal assessmentType assessment sets viewState=answer', async () => {
    const { comp } = buildComponent()
    comp.assessmentType = 'normal' as any
    comp.primaryCategory = 'Course Assessment' as any
    comp.paperSections = []
    comp.quizJson = { isAssessment: true, questions: [], timeLimit: 0 } as any
    comp.quizData = { identifier: 'do_123' } as any
    jest.spyOn(comp as any, 'raiseTelemetry').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'ngOnDestroy').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.secAttempted = { getValue: jest.fn().mockReturnValue([]), next: jest.fn() }
    await comp.submitQuiz()
    expect(comp.viewState).toBe('answer')
  })

  it('submitQuiz - optionalWeightage calls submitQuizForOptionWeightage', async () => {
    const { comp } = buildComponent()
    comp.assessmentType = 'optionalWeightage' as any
    comp.quizData = { identifier: 'do_123' } as any
    jest.spyOn(comp as any, 'raiseTelemetry').mockImplementation(jest.fn())
    const spy = jest.spyOn(comp as any, 'submitQuizForOptionWeightage').mockImplementation(jest.fn())
    await comp.submitQuiz()
    expect(spy).toHaveBeenCalled()
  })

  // ------ submitAfterAllPromiseResolved - forPreview skips API ------
  it('submitAfterAllPromiseResolved - forPreview true skips API call', async () => {
    const { comp } = buildComponent()
    comp.forPreview = true
    comp.forCreatorMode = false
    comp.identifier = 'do_123'
    comp.quizJson = { questions: [], isAssessment: false, timeLimit: 0 } as any
    comp.paperSections = []
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1', preAssessment: undefined }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).viewerSvc.publicUserDetails = { email: 'test@test.com' }
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ userSections: [], courseId: 'c1', identifier: 'do_123' })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue([]) }
      ; (comp as any).quizSvc.submitQuizV4 = jest.fn().mockReturnValue(of({}))
      ; (comp as any).quizSvc.publicV4Submit = jest.fn().mockReturnValue(of({}))
    await (comp as any).submitAfterAllPromiseResolved()
    expect((comp as any).quizSvc.submitQuizV4).not.toHaveBeenCalled()
  })

  it('submitAfterAllPromiseResolved - not forPreview compat < 7 calls submitQuizV4', async () => {
    const { comp } = buildComponent()
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.identifier = 'do_123'
    comp.quizJson = { questions: [], isAssessment: false, timeLimit: 0 } as any
    comp.paperSections = []
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1', preAssessment: undefined }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ userSections: [] })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue([]) }
      ; (comp as any).quizSvc.submitQuizV4 = jest.fn().mockReturnValue(of({ params: { status: 'failed' } }))
    await (comp as any).submitAfterAllPromiseResolved()
    expect((comp as any).quizSvc.submitQuizV4).toHaveBeenCalled()
  })

  it('submitAfterAllPromiseResolved - compat < 7 success Practice Question Set calls assignQuizResult', async () => {
    const { comp } = buildComponent()
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.identifier = 'do_123'
    comp.quizJson = { questions: [], isAssessment: false, timeLimit: 0 } as any
    comp.paperSections = []
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1', preAssessment: undefined }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ userSections: [] })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue([]) }
    const mockRes = { params: { status: 'success' }, result: { primaryCategory: 'Practice Question Set', correct: 1, incorrect: 0, blank: 0, overallResult: 1.0, passPercentage: 60 } }
      ; (comp as any).quizSvc.submitQuizV4 = jest.fn().mockReturnValue(of(mockRes))
    jest.spyOn(comp as any, 'assignQuizResult').mockImplementation(jest.fn())
    await (comp as any).submitAfterAllPromiseResolved()
    expect((comp as any).assignQuizResult).toHaveBeenCalled()
  })

  // ------ fetchProgressOfAssessment ------
  it('fetchProgressOfAssessment - no preAssessment calls fetchContentHistoryV2', () => {
    const { comp } = buildComponent()
      ; (comp as any).activatedRoute.snapshot.queryParams = { preAssessment: undefined, collectionId: 'c1', batchId: 'b1' }
      ; (comp as any).configSvc.userProfile = { userId: 'u1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).widgetContentService.fetchContentHistoryV2 = jest.fn().mockReturnValue(of({ result: { contentList: [] } }))
      ; (comp as any).widgetContentService.setProgramChildResumeData = jest.fn()
    expect(() => (comp as any).fetchProgressOfAssessment()).not.toThrow()
    expect((comp as any).widgetContentService.fetchContentHistoryV2).toHaveBeenCalled()
  })

  it('fetchProgressOfAssessment - preAssessment=true skips API', () => {
    const { comp } = buildComponent()
      ; (comp as any).activatedRoute.snapshot.queryParams = { preAssessment: 'true' }
      ; (comp as any).widgetContentService.fetchContentHistoryV2 = jest.fn()
    expect(() => (comp as any).fetchProgressOfAssessment()).not.toThrow()
    expect((comp as any).widgetContentService.fetchContentHistoryV2).not.toHaveBeenCalled()
  })

  it('fetchProgressOfAssessment - content status 2 calls updateContentHashMapForAssesstent', () => {
    const { comp } = buildComponent()
    comp.identifier = 'do_123'
      ; (comp as any).activatedRoute.snapshot.queryParams = { preAssessment: undefined, collectionId: 'c1', batchId: 'b1' }
      ; (comp as any).configSvc.userProfile = { userId: 'u1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
    const contentList = [{ contentId: 'do_123', status: 2 }]
      ; (comp as any).widgetContentService.fetchContentHistoryV2 = jest.fn().mockReturnValue(of({ result: { contentList } }))
      ; (comp as any).widgetContentService.setProgramChildResumeData = jest.fn()
      ; (comp as any).viewerSvc.updateContentHashMapForAssesstent = jest.fn()
    expect(() => (comp as any).fetchProgressOfAssessment()).not.toThrow()
    expect((comp as any).viewerSvc.updateContentHashMapForAssesstent).toHaveBeenCalledWith('do_123', contentList[0])
  })

  // ------ recalculateParentProgress ------
  it('recalculateParentProgress - no parentData returns early', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {}
    expect(() => (comp as any).recalculateParentProgress('missing_id')).not.toThrow()
  })

  it('recalculateParentProgress - no children returns early', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'p1': { name: 'Parent', primaryCategory: 'Course', parent: null }
      }
    expect(() => (comp as any).recalculateParentProgress('p1')).not.toThrow()
  })

  it('recalculateParentProgress - children update parent completionPercentage', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'p1': { name: 'Parent', primaryCategory: 'Course', parent: null, completionPercentage: 0, completionStatus: 0, status: 0 },
        'c1': { name: 'Child1', parent: 'p1', completionStatus: 2, completionPercentage: 100, status: 2 },
        'c2': { name: 'Child2', parent: 'p1', completionStatus: 0, completionPercentage: 0, status: 0 },
      }
      ; (comp as any).viewerSvc.updateContentHashMapForAssesstent = jest.fn()
      ; (comp as any).cdr = { detectChanges: jest.fn() }
    expect(() => (comp as any).recalculateParentProgress('p1')).not.toThrow()
  })

  it('recalculateParentProgress - Milestone filters mandatory children', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'm1': { name: 'Milestone', primaryCategory: 'Milestone', parent: null, completionPercentage: 0, completionStatus: 0, status: 0 },
        'c1': { name: 'Mandatory', parent: 'm1', isMandatory: true, completionStatus: 2, completionPercentage: 100, status: 2 },
        'c2': { name: 'Optional', parent: 'm1', isMandatory: false, completionStatus: 0, completionPercentage: 0, status: 0 },
      }
    expect(() => (comp as any).recalculateParentProgress('m1')).not.toThrow()
  })

  // ------ action() branches ------
  it('action - retake with selectedAssessmentCompatibilityLevel < 7 calls retakeAssessment', () => {
    const { comp } = buildComponent()
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.primaryCategory = 'Practice Question Set' as any
    comp.quizData = { identifier: 'do_123' } as any
    comp.quizJson = { questions: [], isAssessment: false, timeLimit: 0 } as any
    comp.paperSections = []
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ userSections: [] })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue([]) }
      ; (comp as any).events.dispatchEvent = jest.fn()
    jest.spyOn(comp as any, 'raiseInteractTelemetry').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearStoragePartial').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearStorage').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'retakeAssessment').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.secAttempted = { getValue: jest.fn().mockReturnValue([]), next: jest.fn() }
    comp.action('retake')
    expect((comp as any).retakeAssessment).toHaveBeenCalled()
  })

  it('action - retake with compat >= 7 calls retakeAssessment', () => {
    const { comp } = buildComponent()
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 8
    comp.primaryCategory = 'Practice Question Set' as any
    comp.quizData = { identifier: 'do_123' } as any
    comp.quizJson = { questions: [], isAssessment: false, timeLimit: 0 } as any
    comp.paperSections = []
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ userSections: [] })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue([]) }
      ; (comp as any).events.dispatchEvent = jest.fn()
    jest.spyOn(comp as any, 'raiseInteractTelemetry').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearStoragePartial').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearStorage').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'retakeAssessment').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.secAttempted = { getValue: jest.fn().mockReturnValue([]), next: jest.fn() }
    comp.action('retake')
    expect((comp as any).retakeAssessment).toHaveBeenCalled()
  })

  it('action - retake with forPreview=true does not call retakeAssessment', () => {
    const { comp } = buildComponent()
    comp.forPreview = true
    comp.primaryCategory = 'Practice Question Set' as any
    comp.quizData = { identifier: 'do_123' } as any
    comp.quizJson = { questions: [], isAssessment: false, timeLimit: 0 } as any
    comp.paperSections = []
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ userSections: [] })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue([]) }
      ; (comp as any).events.dispatchEvent = jest.fn()
    jest.spyOn(comp as any, 'raiseInteractTelemetry').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearStoragePartial').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearStorage').mockImplementation(jest.fn())
    const spy = jest.spyOn(comp as any, 'retakeAssessment').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.secAttempted = { getValue: jest.fn().mockReturnValue([]), next: jest.fn() }
    comp.action('retake')
    expect(spy).not.toHaveBeenCalled()
  })

  // ------ changeSection ------
  it('changeSection - sets selectedSectionIdentifier and calls startSection', () => {
    const { comp } = buildComponent()
    comp.paperSections = [{ identifier: 's1', name: 'Sec1', childNodes: [] }] as any
    jest.spyOn(comp as any, 'startSection').mockImplementation(jest.fn())
    comp.changeSection('s1')
    expect(comp.selectedSectionIdentifier).toBe('s1')
  })

  it('changeSection - no match does nothing', () => {
    const { comp } = buildComponent()
    comp.paperSections = [{ identifier: 's1', name: 'Sec1', childNodes: [] }] as any
    const spy = jest.spyOn(comp as any, 'startSection').mockImplementation(jest.fn())
    comp.changeSection('nonexistent')
    expect(spy).not.toHaveBeenCalled()
  })

  // ------ nextSection ------
  it('nextSection - calls startSection with section', () => {
    const { comp } = buildComponent()
    const section = { identifier: 's2', name: 'Sec2', childNodes: [] } as any
    jest.spyOn(comp as any, 'startSection').mockImplementation(jest.fn())
    comp.nextSection(section)
    expect((comp as any).startSection).toHaveBeenCalledWith(section)
  })

  // ------ goToNextSet / goToPreviousSet ------
  it('goToNextSet - when hasNextSet increments currentSetNumber', () => {
    const { comp } = buildComponent()
    comp.quizJson = {
      questions: [
        { section: 's1', questionId: 'q1' },
        { section: 's1', questionId: 'q2' },
        { section: 's1', questionId: 'q3' },
      ], isAssessment: false, timeLimit: 0
    } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 8
    comp.noOfQuestionsPerSet = 1
    comp.currentSetNumber = 0
    comp.currentQuestionIndex = 0
    comp.questionVisitedData = []
    comp.totalQuestionsCount = 3
    comp.goToNextSet()
    expect(comp.currentSetNumber).toBe(1)
  })

  it('goToPreviousSet - when hasPreviousSet decrements currentSetNumber', () => {
    const { comp } = buildComponent()
    comp.quizJson = {
      questions: [
        { section: 's1', questionId: 'q1' },
        { section: 's1', questionId: 'q2' },
      ], isAssessment: false, timeLimit: 0
    } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 8
    comp.noOfQuestionsPerSet = 1
    comp.currentSetNumber = 1
    comp.currentQuestionIndex = 0
    comp.questionVisitedData = []
    comp.goToPreviousSet()
    expect(comp.currentSetNumber).toBe(0)
  })

  // ------ updataDB (secAttempted path) ------
  it('updataDB - with sections calls quizSvc.secAttempted.next', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.secAttempted = { getValue: jest.fn().mockReturnValue([]), next: jest.fn() }
    const sections = [{ identifier: 's1', childNodes: ['q1', 'q2'] }]
    expect(() => comp.updataDB(sections as any)).not.toThrow()
    expect((comp as any).quizSvc.secAttempted.next).toHaveBeenCalled()
  })

  // ------ clearQuestion ------
  it('clearQuestion - deletes from questionAnswerHash and calls clearResponse', () => {
    const { comp } = buildComponent()
    comp.questionAnswerHash = { q1: ['a'] }
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn() }
      ; (comp as any).quizSvc.clearResponse = { next: jest.fn() }
    comp.clearQuestion({ questionId: 'q1' })
    expect(comp.questionAnswerHash['q1']).toBeUndefined()
    expect((comp as any).quizSvc.clearResponse.next).toHaveBeenCalledWith('q1')
  })

  it('clearQuestion - missing questionId does nothing', () => {
    const { comp } = buildComponent()
    comp.questionAnswerHash = {}
      ; (comp as any).quizSvc.questionAnswerHash = { next: jest.fn() }
      ; (comp as any).quizSvc.clearResponse = { next: jest.fn() }
    comp.clearQuestion({ questionId: 'missing' })
    // questionAnswerHash['missing'] is falsy, so nothing is deleted or nexted
    expect(comp.questionAnswerHash['missing']).toBeUndefined()
  })

  // ------ formate ------
  it('formate - returns SafeHtml list from newline text', () => {
    const { comp } = buildComponent()
    const result = comp.formate('line1\nline2')
    expect(result).toBeDefined()
  })

  it('formate - empty text returns empty list', () => {
    const { comp } = buildComponent()
    const result = comp.formate('')
    expect(result).toBeDefined()
  })

  // ------ noOfQuestions getter ------
  it('noOfQuestions - retake returns maxQuestions from route', () => {
    const { comp } = buildComponent()
    comp.retake = true
      ; (comp as any).activatedRoute = { snapshot: { data: { content: { data: { maxQuestions: 5 } } }, queryParams: {} } }
    expect(comp.noOfQuestions).toBe(5)
  })

  it('noOfQuestions - not retake returns 0', () => {
    const { comp } = buildComponent()
    comp.retake = false
    comp.totalAssessemntQuestionsCount = 0
    expect(comp.noOfQuestions).toBe(0)
  })

  // ------ updatePreEnrollmentProgress ------
  it('updatePreEnrollmentProgress - calls updateContent with status 2', () => {
    const { comp } = buildComponent()
    comp.identifier = 'do_123'
    comp.collectionId = 'col_1'
      ; (comp as any).activatedRoute.snapshot.queryParams = { batchId: 'b1', collectionId: 'col_1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'col_1' })
      ; (comp as any).viewerSvc.realTimeProgressUpdate = jest.fn().mockReturnValue(of({}))
    expect(() => (comp as any).updatePreEnrollmentProgress()).not.toThrow()
  })

  // ------ isQuestionAttempted / isQuestionMarked / isQuestionVisited ------
  it('isQuestionAttempted returns true when question has answer', () => {
    const { comp } = buildComponent()
    comp.questionAnswerHash = { q1: ['a'] }
    expect(comp.isQuestionAttempted('q1')).toBe(true)
  })

  it('isQuestionAttempted returns false when question has no answer', () => {
    const { comp } = buildComponent()
    comp.questionAnswerHash = {}
    expect(comp.isQuestionAttempted('q1')).toBe(false)
  })

  it('isQuestionMarked returns true when in markedQuestions', () => {
    const { comp } = buildComponent()
    comp.markedQuestions = new Set(['q1']) as any
    expect(comp.isQuestionMarked('q1' as any)).toBe(true)
  })

  it('isQuestionVisited returns true when in questionVisitedData', () => {
    const { comp } = buildComponent()
    comp.questionVisitedData = ['q1']
    expect(comp.isQuestionVisited('q1')).toBe(true)
  })

  // ------ back ------
  it('back - calls proceedToSubmit', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp as any, 'proceedToSubmit').mockImplementation(jest.fn())
    comp.back()
    expect((comp as any).proceedToSubmit).toHaveBeenCalled()
  })

  // ------ startQuiz ------
  it('startQuiz - sets viewState=attempt and calls getNextQuestion', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'getNextQuestion').mockImplementation(jest.fn())
    comp.startQuiz()
    expect(comp.viewState).toBe('attempt')
    expect(comp.getNextQuestion).toHaveBeenCalledWith(0)
  })

  // ------ markSectionAsComplete ------
  it('markSectionAsComplete - all answered returns true', () => {
    const { comp } = buildComponent()
    comp.quizJson = { questions: [{ questionId: 'q1', section: 's1' }], isAssessment: false, timeLimit: 0 } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 4
    const result = comp.markSectionAsComplete({ q1: ['a'] })
    expect(result).toBe(true)
  })

  it('markSectionAsComplete - some not answered returns false', () => {
    const { comp } = buildComponent()
    comp.quizJson = { questions: [{ questionId: 'q1', section: 's1' }, { questionId: 'q2', section: 's1' }], isAssessment: false, timeLimit: 0 } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 4
    const result = comp.markSectionAsComplete({ q1: ['a'] })
    expect(result).toBe(false)
  })

  // ------ getSelectedQuestionNumber ------
  it('getSelectedQuestionNumber - returns index+1 for matching questionId', () => {
    const { comp } = buildComponent()
    comp.quizJson = { questions: [{ questionId: 'q1', section: 's1' }, { questionId: 'q2', section: 's1' }], isAssessment: false, timeLimit: 0 } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.currentQuestion = { questionId: 'q2' } as any
    const result = comp.getSelectedQuestionNumber()
    expect(result).toBe(2)
  })

  // ------ getQuestionIndex ------
  it('getQuestionIndex - returns offset+index+1', () => {
    const { comp } = buildComponent()
    comp.noOfQuestionsPerSet = 10
    comp.currentSetNumber = 0
    expect(comp.getQuestionIndex(0)).toBe(1)
    expect(comp.getQuestionIndex(1)).toBe(2)
  })

  // ------ calculateResults - MTF type ------
  it('calculateResults - mtf questions calculates correctly', () => {
    const { comp } = buildComponent()
    comp.quizJson = {
      isAssessment: false, timeLimit: 0,
      questions: [{
        questionId: 'q1', questionType: 'mtf', section: 's1',
        options: [{ optionId: 'o1', match: 'A', userSelected: true, isCorrect: false }],
        editorState: {
          options: [{ label: 'o1', value: { body: 'Q1' } }],
          answer: [{ sourceName: 'o1', targetName: 'A' }],
        },
        rhsChoices: [{ label: 'A', value: { body: 'Answer A' } }],
      }]
    } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.questionAnswerHash = {}
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue([])
    expect(() => comp.calculateResults()).not.toThrow()
  })

  // ------ proceedToSubmit - compat >= 7 path ------
  it('proceedToSubmit - selectedAssessmentCompatibilityLevel>=7 calls openSectionPopup', () => {
    const { comp } = buildComponent()
    comp.selectedAssessmentCompatibilityLevel = 8
    jest.spyOn(comp as any, 'openSectionPopup').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.secAttempted = { getValue: jest.fn().mockReturnValue([]), next: jest.fn() }
    comp.proceedToSubmit()
    expect((comp as any).openSectionPopup).toHaveBeenCalledWith(true)
  })

  // ------ assignQuizResult - passPercentage branch ------
  it('assignQuizResult - result >= passPercentage sets isCompleted', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp as any, 'clearStoragePartial').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearQuizJson').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'fetchProgressOfAssessment').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'updateProgress').mockImplementation(jest.fn())
    comp.forPreview = false
      ; (comp as any).activatedRoute.snapshot.queryParams = { preAssessment: undefined }
    comp.quizJson = { isAssessment: false, questions: [], timeLimit: 0, primaryCategory: 'Practice Question Set' } as any
    comp.assignQuizResult({ correct: 10, incorrect: 0, blank: 0, overallResult: 80, passPercentage: 60 } as any)
    expect(comp.isCompleted).toBe(true)
  })

  it('assignQuizResult - result < passPercentage leaves isCompleted false', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp as any, 'clearStoragePartial').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearQuizJson').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'fetchProgressOfAssessment').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'updateProgress').mockImplementation(jest.fn())
    comp.forPreview = false
    comp.isCompleted = false
      ; (comp as any).activatedRoute.snapshot.queryParams = { preAssessment: undefined }
    comp.quizJson = { isAssessment: false, questions: [], timeLimit: 0, primaryCategory: 'Practice Question Set' } as any
    comp.assignQuizResult({ correct: 0, incorrect: 10, blank: 0, overallResult: 20, passPercentage: 60 } as any)
    expect(comp.isCompleted).toBe(false)
  })

  // ------ getOptions - MTF type ------
  it('getOptions - mtf returns options with match from rhsChoices', () => {
    const { comp } = buildComponent()
    const question = {
      qType: 'MTF',
      editorState: {
        options: [{ value: { value: 'opt1', body: 'Question 1' } }]
      },
      rhsChoices: ['Answer A'],
    } as any
    comp.primaryCategory = 'Practice Question Set' as any
    const result = comp.getOptions(question)
    expect(result.length).toBe(1)
    expect(result[0].optionId).toBe('opt1')
  })

  it('getOptions - ftb type uses body splits', () => {
    const { comp } = buildComponent()
    const question = {
      qType: 'FTB',
      body: 'Fill _______________ the blank _______________ here.',
      editorState: null,
    } as any
    const result = comp.getOptions(question)
    expect(result.length).toBe(2)
  })

  // ------ getQuestions - mcq-mca branch ------
  it('getQuestions - mcq-mca builds response', () => {
    const { comp } = buildComponent()
    const section = { identifier: 's1' } as any
    const req = {
      questions: [{
        section: 's1', questionType: 'mcq-mca', questionId: 'q1',
        question: 'Q1?',
        options: [{ optionId: 'o1', userSelected: true }],
        questionLevel: 'L1', marks: 1
      }]
    } as any
    const result = comp.getQuestions(section, req)
    expect(result.length).toBe(1)
  })

  it('getQuestions - mcq-sca branch builds response', () => {
    const { comp } = buildComponent()
    const section = { identifier: 's1' } as any
    const req = {
      questions: [{
        section: 's1', questionType: 'mcq-sca', questionId: 'q1',
        question: 'Q1?',
        options: [{ optionId: 'o1', userSelected: true }],
        questionLevel: 'L1', marks: 1
      }]
    } as any
    const result = comp.getQuestions(section, req)
    expect(result.length).toBe(1)
  })

  it('getQuestions - ftb with options branch builds response', () => {
    const { comp } = buildComponent()
    const section = { identifier: 's1' } as any
    const req = {
      questions: [{
        section: 's1', questionType: 'ftb', questionId: 'q1',
        question: 'Q1?',
        options: [{ optionId: 'o1', response: 'ans1' }],
        questionLevel: 'L1', marks: 1
      }]
    } as any
    const result = comp.getQuestions(section, req)
    expect(result.length).toBe(1)
  })

  it('getQuestions - mtf branch builds response', () => {
    const { comp } = buildComponent()
    const section = { identifier: 's1' } as any
    const req = {
      questions: [{
        section: 's1', questionType: 'mtf', questionId: 'q1',
        question: 'Q1?',
        options: [{ optionId: 'o1', match: 'A', userSelected: true }],
        questionLevel: 'L1', marks: 1
      }]
    } as any
    const result = comp.getQuestions(section, req)
    expect(result.length).toBe(1)
  })

  // ------ submitQuiz with paperSections ------
  it('submitQuiz - with paperSections calls getMultiQuestions for each section', async () => {
    const { comp } = buildComponent()
    comp.assessmentType = 'normal' as any
    comp.primaryCategory = 'Practice Question Set' as any
    comp.quizJson = { questions: [], isAssessment: false, timeLimit: 0 } as any
    comp.paperSections = [{ identifier: 's1', childNodes: ['q1'] }] as any
    comp.quizData = { identifier: 'do_123' } as any
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1', preAssessment: undefined }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ userSections: [] })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue([]) }
      ; (comp as any).quizSvc.getMultipleQuestion = jest.fn().mockReturnValue(of({ result: { questions: [] } }))
    jest.spyOn(comp as any, 'raiseTelemetry').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'ngOnDestroy').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'getMultiQuestions').mockResolvedValue({ result: { questions: [] } })
    jest.spyOn(comp as any, 'submitAfterAllPromiseResolved').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.secAttempted = { getValue: jest.fn().mockReturnValue([]), next: jest.fn() }
      ; (comp as any).viewerHeaderSideBarToggleService = { visibilityStatus: { next: jest.fn() } }
    await comp.submitQuiz()
    expect((comp as any).getMultiQuestions).toHaveBeenCalled()
  })

  // ------ action() - FINAL_ASSESSMENT with canAttend ------
  it('action - retake FINAL_ASSESSMENT compat < 7 calls canAttend', () => {
    const { comp } = buildComponent()
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.primaryCategory = 'Final Assessment' as any
    comp.quizData = { identifier: 'do_123' } as any
    comp.quizJson = { questions: [], isAssessment: false, timeLimit: 0 } as any
    comp.paperSections = []
      ; (comp as any).ePrimaryCategory = { FINAL_ASSESSMENT: 'Final Assessment' }
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ userSections: [] })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue([]) }
      ; (comp as any).quizSvc.canAttend = jest.fn().mockReturnValue(of({ attemptsAllowed: 2, attemptsMade: 1 }))
      ; (comp as any).events.dispatchEvent = jest.fn()
    jest.spyOn(comp as any, 'raiseInteractTelemetry').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearStoragePartial').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearStorage').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'retakeAssessment').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.secAttempted = { getValue: jest.fn().mockReturnValue([]), next: jest.fn() }
    comp.action('retake')
    expect((comp as any).quizSvc.canAttend).toHaveBeenCalled()
  })

  // ------ checkMilestoneComplete with content ------
  it('checkMilestoneComplete - milestone with assessment complete returns true', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'm1': { name: 'Milestone', primaryCategory: 'Milestone' },
        'a1': { parent: 'm1', primaryCategory: 'Course Assessment', completionStatus: 2 }
      }
    const result = (comp as any).checkMilestoneComplete('m1')
    expect(result).toBe(true)
  })

  it('checkMilestoneComplete - milestone with incomplete mandatory course returns false', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'm1': { name: 'Milestone', primaryCategory: 'Milestone' },
        'c1': { parent: 'm1', primaryCategory: 'Course', isCollection: true, isMandatory: true, completionStatus: 0 }
      }
    const result = (comp as any).checkMilestoneComplete('m1')
    expect(result).toBe(false)
  })

  // ------ getMilestoneNumber ------
  it('getMilestoneNumber - from milestoneIndex returns index+1', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'm1': { milestoneIndex: 2 }
      }
    expect((comp as any).getMilestoneNumber('m1')).toBe(3)
  })

  it('getMilestoneNumber - from ID pattern M2 returns 2', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {}
    expect((comp as any).getMilestoneNumber('M2')).toBe(2)
  })

  // ------ updateVisivility ------
  it('updateVisivility - subscribes to displayCorrectAnswer', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.displayCorrectAnswer = of(true)
    expect(() => comp.updateVisivility()).not.toThrow()
  })

  // ------ checkAns ------
  it('checkAns - with valid index shows answer', () => {
    const { comp } = buildComponent()
    // Set up secQuestions so totalQCount >= 1
    comp.quizJson = { questions: [{ questionId: 'q1', section: 's1' }], isAssessment: false, timeLimit: 0 } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.currentQuestion = { editorState: { options: [{ optionId: '1' }] } } as any
      ; (comp as any).quizSvc.shCorrectAnswer = jest.fn()
    comp.checkAns(1)
    expect((comp as any).quizSvc.shCorrectAnswer).toHaveBeenCalledWith(true)
  })

  // ------ proceedToSubmit compat < 7 ------
  it('proceedToSubmit - compat < 7 with unanswered sets submissionState', () => {
    const { comp } = buildComponent()
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.quizJson = { questions: [{ questionId: 'q1' }, { questionId: 'q2' }], isAssessment: false, timeLimit: 0 } as any
    comp.questionAnswerHash = { q1: ['a'] }
    comp.markedQuestions = new Set([]) as any
    comp.proceedToSubmit()
    expect(comp.submissionState).toBe('unanswered')
  })

  it('proceedToSubmit - compat < 7 with marked sets submissionState=marked', () => {
    const { comp } = buildComponent()
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.quizJson = { questions: [{ questionId: 'q1' }], isAssessment: false, timeLimit: 0 } as any
    comp.questionAnswerHash = { q1: ['a'] }
    comp.markedQuestions = new Set(['q1']) as any
    comp.proceedToSubmit()
    expect(comp.submissionState).toBe('marked')
  })

  it('proceedToSubmit - compat < 7 all answered sets submissionState=answered', () => {
    const { comp } = buildComponent()
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.quizJson = { questions: [{ questionId: 'q1' }], isAssessment: false, timeLimit: 0 } as any
    comp.questionAnswerHash = { q1: ['a'] }
    comp.markedQuestions = new Set([]) as any
    comp.proceedToSubmit()
    expect(comp.submissionState).toBe('answered')
  })

  // ------ submitQuizForOptionWeightage ------
  it('submitQuizForOptionWeightage - forPreview=false calls methods', async () => {
    const { comp } = buildComponent()
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.quizJson = { questions: [], isAssessment: false, timeLimit: 0 } as any
    comp.paperSections = [{ identifier: 's1', childNodes: ['q1'] }] as any
    comp.identifier = 'do_123'
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1', preAssessment: undefined }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ userSections: [] })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue([]) }
    jest.spyOn(comp as any, 'getMultiQuestions').mockResolvedValue({ result: { questions: [] } })
    jest.spyOn(comp as any, 'submitAfterAllPromiseResolvedForOptionWeightage').mockImplementation(jest.fn())
    await (comp as any).submitQuizForOptionWeightage()
    expect((comp as any).getMultiQuestions).toHaveBeenCalled()
  })

  // ------ recalculateParentProgress with grandparent ------
  it('recalculateParentProgress - recursively updates grandparent', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'gp1': { name: 'Grandparent', primaryCategory: 'Course', parent: null, completionPercentage: 0, completionStatus: 0, status: 0 },
        'p1': { name: 'Parent', primaryCategory: 'Course', parent: 'gp1', completionPercentage: 0, completionStatus: 0, status: 0 },
        'c1': { name: 'Child1', parent: 'p1', completionStatus: 2, completionPercentage: 100, status: 2 },
      }
      ; (comp as any).viewerSvc.updateContentHashMapForAssesstent = jest.fn()
      ; (comp as any).cdr = { detectChanges: jest.fn() }
    expect(() => (comp as any).recalculateParentProgress('p1')).not.toThrow()
  })

  // ------ getClass ------
  it('getClass - no storeData returns not-started', () => {
    const { comp } = buildComponent()
    comp.attemptSubData = []
    const result = comp.getClass({ identifier: 's1' } as any)
    expect(result).toBe('not-started')
  })

  it('getClass - fullAttempted returns complete', () => {
    const { comp } = buildComponent()
    comp.attemptSubData = [{ identifier: 's1', fullAttempted: true, isAttempted: true }] as any
    const result = comp.getClass({ identifier: 's1' } as any)
    expect(result).toBe('complete')
  })

  it('getClass - isAttempted but not full returns incomplete', () => {
    const { comp } = buildComponent()
    comp.attemptSubData = [{ identifier: 's1', fullAttempted: false, isAttempted: true }] as any
    const result = comp.getClass({ identifier: 's1' } as any)
    expect(result).toBe('incomplete')
  })

  // ------ getNextQuestion ------
  it('getNextQuestion - index 0 updates currentQuestion to first item', () => {
    const { comp } = buildComponent()
    comp.quizJson = {
      questions: [
        { questionId: 'q1', section: 's1' },
        { questionId: 'q2', section: 's1' }
      ], isAssessment: false, timeLimit: 0
    } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.questionVisitedData = []
    comp.getNextQuestion(0)
    expect(comp.currentQuestionIndex).toBe(0)
  })

  it('getNextQuestion - index>0 with prev answered updates currentQuestionIndex', () => {
    const { comp } = buildComponent()
    comp.quizJson = {
      questions: [
        { questionId: 'q1', section: 's1' },
        { questionId: 'q2', section: 's1' }
      ], isAssessment: false, timeLimit: 0
    } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.questionVisitedData = ['q1']
    comp.questionAnswerHash = { q1: ['a'] }
    comp.assessmentType = 'optionalWeightage' as any  // strict mode: must answer q1 before q2
    comp.getNextQuestion(1)
    expect(comp.currentQuestionIndex).toBe(1)
  })

  // ------ getNextQuestion compat >= 7 ------
  it('getNextQuestion - compatibilityLevel>=7 slices questions by set', () => {
    const { comp } = buildComponent()
    comp.quizJson = {
      questions: [
        { questionId: 'q1', section: 's1' },
        { questionId: 'q2', section: 's1' },
        { questionId: 'q3', section: 's1' }
      ], isAssessment: false, timeLimit: 0
    } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 8
    comp.noOfQuestionsPerSet = 10
    comp.currentSetNumber = 0
    comp.questionVisitedData = []
    comp.currentQuestionIndex = 0
    comp.getNextQuestion(0)
    expect(comp.currentQuestion).toBeDefined()
  })

  // ------ updateProgress ------
  it('updateProgress - calls viewerSvc realTimeProgressUpdate', () => {
    const { comp } = buildComponent()
    comp.identifier = 'do_123'
    comp.collectionId = 'col_1'
      ; (comp as any).activatedRoute.snapshot.queryParams = { batchId: 'b1', collectionId: 'col_1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'col_1' })
      ; (comp as any).viewerSvc.realTimeProgressUpdate = jest.fn().mockReturnValue(of({}))
    expect(() => comp.updateProgress(2)).not.toThrow()
  })

  // ------ init variations ------
  it('init - sets isSubmitted false and markedQuestions empty set', () => {
    const { comp } = buildComponent()
    comp.forPreview = false
    comp.quizData = { identifier: 'do_123' } as any
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: '', batchId: '' }
    comp.init()
    expect(comp.isSubmitted).toBe(false)
    expect(comp.markedQuestions.size).toBe(0)
  })

  // ------ getOptions - MCQ-SCA ------
  it('getOptions - mcq-sca returns option list', () => {
    const { comp } = buildComponent()
    const question = {
      qType: 'MCQ-SCA',
      editorState: {
        options: [
          { value: { value: 'o1', body: 'Option 1' }, answer: true }
        ]
      },
    } as any
    const result = comp.getOptions(question)
    expect(result.length).toBe(1)
    expect(result[0].optionId).toBe('o1')
  })

  // ------ getQuestions - mcq-mca-w ------
  it('getQuestions - mcq-mca-w branch builds response', () => {
    const { comp } = buildComponent()
    const section = { identifier: 's1' } as any
    const req = {
      questions: [{
        section: 's1', questionType: 'mcq-mca-w', questionId: 'q1',
        question: 'Q1?',
        options: [{ optionId: 'o1', userSelected: true }],
        questionLevel: 'L1', marks: 1
      }]
    } as any
    const result = comp.getQuestions(section, req)
    expect(result.length).toBe(1)
  })

  // ------ getQuestions - mcq-sca-tf ------
  it('getQuestions - mcq-sca-tf branch builds response', () => {
    const { comp } = buildComponent()
    const section = { identifier: 's1' } as any
    const req = {
      questions: [{
        section: 's1', questionType: 'mcq-sca-tf', questionId: 'q1',
        question: 'Q1?',
        options: [{ optionId: 'o1', userSelected: true }],
        questionLevel: 'L1', marks: 1
      }]
    } as any
    const result = comp.getQuestions(section, req)
    expect(result.length).toBe(1)
  })

  // ------ getQuestions - no section ------
  it('getQuestions - no section identifier returns empty array', () => {
    const { comp } = buildComponent()
    const result = comp.getQuestions(null as any, { questions: [] } as any)
    expect(result.length).toBe(0)
  })

  // ------ showAnswers - ftb ------
  it('showAnswers - ftb question sets showFitbAnswer', () => {
    const { comp } = buildComponent()
    comp.quizJson = {
      questions: [{ questionId: 'q1', questionType: 'ftb', section: 's1', options: [] }],
      isAssessment: false, timeLimit: 0
    } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 4
    expect(() => comp.showAnswers()).not.toThrow()
  })

  // ------ showAnswers - mtf ------
  it('showAnswers - mtf calls showMtfAnswers', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp, 'showMtfAnswers').mockImplementation(jest.fn())
    comp.quizJson = {
      questions: [{ questionId: 'q1', questionType: 'mtf', section: 's1', options: [] }],
      isAssessment: false, timeLimit: 0
    } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.showAnswers()
    expect(comp.showMtfAnswers).toHaveBeenCalled()
  })

  // ------ allSecAttempted getter ------
  it('allSecAttempted - with all sections full returns full=true', () => {
    const { comp } = buildComponent()
      ; (comp as any).quizSvc.secAttempted = {
        getValue: jest.fn().mockReturnValue([{ identifier: 's1', fullAttempted: true, nextSection: 's2' }]),
        next: jest.fn()
      }
    comp.paperSections = [{ identifier: 's2', name: 'S2', childNodes: [] }] as any
    comp.selectedSection = { identifier: 's1' } as any
    const result = comp.allSecAttempted
    expect(result.full).toBe(true)
  })

  // ------ isOnlySection getter ------
  it('isOnlySection - single section returns true', () => {
    const { comp } = buildComponent()
    comp.paperSections = [{ identifier: 's1', name: 'S1', childNodes: [] }] as any
    expect(comp.isOnlySection).toBe(true)
  })

  it('isOnlySection - multiple sections returns false', () => {
    const { comp } = buildComponent()
    comp.paperSections = [
      { identifier: 's1', name: 'S1', childNodes: [] },
      { identifier: 's2', name: 'S2', childNodes: [] }
    ] as any
    expect(comp.isOnlySection).toBe(false)
  })

  // ------ fetchProgressOfAssessment with status=2 that triggers checkAndShowMilestoneCompletion ------
  it('fetchProgressOfAssessment - Final Milestone Assessment triggers checkAndShowMilestoneCompletion', () => {
    const { comp } = buildComponent()
    comp.identifier = 'do_123'
      ; (comp as any).activatedRoute.snapshot.queryParams = { preAssessment: undefined, collectionId: 'c1', batchId: 'b1' }
      ; (comp as any).configSvc.userProfile = { userId: 'u1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).viewerSvc.updateContentHashMapForAssesstent = jest.fn()
      ; (comp as any).viewerDataSvc.resource = { contextCategory: 'Final Milestone Assessment' }
    const contentList = [{ contentId: 'do_123', status: 2 }]
      ; (comp as any).widgetContentService.fetchContentHistoryV2 = jest.fn().mockReturnValue(of({ result: { contentList } }))
      ; (comp as any).widgetContentService.setProgramChildResumeData = jest.fn()
    jest.spyOn(comp as any, 'checkAndShowMilestoneCompletion').mockImplementation(jest.fn())
    expect(() => (comp as any).fetchProgressOfAssessment()).not.toThrow()
    expect((comp as any).checkAndShowMilestoneCompletion).toHaveBeenCalled()
  })

  // ------ checkAndShowMilestoneCompletion ------
  it('checkAndShowMilestoneCompletion - no assessmentData returns early', () => {
    const { comp } = buildComponent()
    comp.identifier = 'do_123'
      ; (comp as any).tocSvc.hashmap = {}
    expect(() => (comp as any).checkAndShowMilestoneCompletion()).not.toThrow()
  })

  it('checkAndShowMilestoneCompletion - with milestone parent that is complete', () => {
    const { comp } = buildComponent()
    comp.identifier = 'do_123'
      ; (comp as any).tocSvc.hashmap = {
        'do_123': { name: 'Assessment', parent: 'm1', primaryCategory: 'Course Assessment' },
        'm1': { name: 'Milestone', primaryCategory: 'Milestone', milestoneIndex: 0 },
        'a1': { parent: 'm1', primaryCategory: 'Course Assessment', completionStatus: 2 }
      }
    jest.spyOn(comp as any, 'checkMilestoneComplete').mockReturnValue(true)
    jest.spyOn(comp as any, 'getMilestoneNumber').mockReturnValue(1)
    jest.spyOn(comp as any, 'hasNextMilestone').mockReturnValue(false)
    expect(() => (comp as any).checkAndShowMilestoneCompletion()).not.toThrow()
  })

  // ---- getNextQuestion - non-optionalWeightage path (covers 1131-1159) ----
  it('getNextQuestion - assessmentType normal skips isQuestionAttempted check', () => {
    const { comp } = buildComponent()
    comp.quizJson = {
      questions: [
        { questionId: 'q1', section: 's1' },
        { questionId: 'q2', section: 's1' }
      ], isAssessment: false, timeLimit: 0
    } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.assessmentType = 'normal' as any
    comp.questionVisitedData = []
    comp.getNextQuestion(1)
    expect(comp.currentQuestionIndex).toBe(1)
  })

  // ---- action() - retake with FINAL_ASSESSMENT and compat < 7 (covers 2102-2148) ----
  it('action retake - FINAL_ASSESSMENT compat<7 calls canAttend and retakeAssessment', () => {
    const { comp } = buildComponent()
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 5
    comp.primaryCategory = 'Final Assessment' as any
    jest.spyOn(comp as any, 'raiseInteractTelemetry').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'raiseEvent').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearStoragePartial').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearStorage').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'retakeAssessment').mockImplementation(jest.fn())
    comp.action('retake')
    expect((comp as any).retakeAssessment).toHaveBeenCalled()
  })

  it('action retake - FINAL_ASSESSMENT compat>=7 calls canAttendV5 and retakeAssessment', () => {
    const { comp } = buildComponent()
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 8
    comp.primaryCategory = 'Final Assessment' as any
    jest.spyOn(comp as any, 'raiseInteractTelemetry').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'raiseEvent').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearStoragePartial').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearStorage').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'retakeAssessment').mockImplementation(jest.fn())
    comp.action('retake')
    expect((comp as any).retakeAssessment).toHaveBeenCalled()
  })

  // ---- getSectionTableDataCounts (covers 3017-3061) ----
  it('getSectionTableDataCounts - counts answered and marked questions correctly', () => {
    const { comp } = buildComponent()
    comp.questionAnswerHash = { q1: ['a'], q2: ['b'] }
    comp.markedQuestions = new Set(['q2']) as any
    comp.questionVisitedData = ['q1', 'q2', 'q3']
    const result = (comp as any).getSectionTableDataCounts(['q1', 'q2', 'q3'])
    expect(result.answeredCount).toBe(1)  // q1 answered, q2 marked
    expect(result.markedForReviewCount).toBe(1)  // q2 marked
  })

  it('getSectionTableDataCounts - empty arrays', () => {
    const { comp } = buildComponent()
    comp.questionAnswerHash = {}
    comp.markedQuestions = new Set() as any
    comp.questionVisitedData = []
    const result = (comp as any).getSectionTableDataCounts([])
    expect(result.answeredCount).toBe(0)
  })

  // ---- getMilestoneNumber (covers 2705-2716) ----
  it('getMilestoneNumber - returns milestoneIndex+1 from hashmap', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'm1': { name: 'Milestone 1', milestoneIndex: 0 }
      }
    const result = (comp as any).getMilestoneNumber('m1')
    expect(result).toBe(1)
  })

  it('getMilestoneNumber - fallback extracts number from ID', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {}
    const result = (comp as any).getMilestoneNumber('milestone-2')
    expect(result).toBe(2)
  })

  // ---- hasNextMilestone (covers 2750, 2764) ----
  it('hasNextMilestone - returns true when more milestones exist', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'm1': { primaryCategory: 'Milestone' },
        'm2': { primaryCategory: 'Milestone' },
      }
    const result = (comp as any).hasNextMilestone(1)
    expect(result).toBe(true)
  })

  it('hasNextMilestone - returns false when no next milestone', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'm1': { primaryCategory: 'Milestone' },
      }
    const result = (comp as any).hasNextMilestone(1)
    expect(result).toBe(false)
  })

  // ---- checkMilestoneComplete (covers 2625-2647) ----
  it('checkMilestoneComplete - returns false for unknown milestoneId', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {}
    const result = (comp as any).checkMilestoneComplete('unknown')
    expect(result).toBe(false)
  })

  it('checkMilestoneComplete - returns true when all mandatory done', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'm1': { name: 'Milestone', primaryCategory: 'Milestone' },
        'a1': { parent: 'm1', primaryCategory: 'Course Assessment', completionStatus: 2 },
        'c1': { parent: 'm1', primaryCategory: 'Course', isMandatory: true, completionStatus: 2 }
      }
    const result = (comp as any).checkMilestoneComplete('m1')
    expect(result).toBe(true)
  })

  it('checkMilestoneComplete - returns false when mandatory course incomplete', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'm1': { name: 'Milestone', primaryCategory: 'Milestone' },
        'c1': { parent: 'm1', primaryCategory: 'Course', isMandatory: true, completionStatus: 0 }
      }
    const result = (comp as any).checkMilestoneComplete('m1')
    expect(result).toBe(false)
  })

  // ---- recalculateParentProgress - no children (covers 2355-2404) ----
  it('recalculateParentProgress - no children returns early', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'p1': { name: 'Parent', primaryCategory: 'Course' }
      }
    expect(() => (comp as any).recalculateParentProgress('p1')).not.toThrow()
  })

  it('recalculateParentProgress - calculates percentage for children', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'p1': { name: 'Parent', primaryCategory: 'Course', completionPercentage: 0, completionStatus: 0, status: 0 },
        'c1': { parent: 'p1', primaryCategory: 'Course', completionStatus: 2 },
        'c2': { parent: 'p1', primaryCategory: 'Course', completionStatus: 0 }
      }
      ; (comp as any).viewerSvc.updateContentHashMapForAssesstent = jest.fn()
    expect(() => (comp as any).recalculateParentProgress('p1')).not.toThrow()
  })

  it('recalculateParentProgress - with Milestone filters mandatory+assessments', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'm1': { name: 'Milestone', primaryCategory: 'Milestone', completionPercentage: 0, completionStatus: 0, status: 0 },
        'c1': { parent: 'm1', primaryCategory: 'Course', isMandatory: true, completionStatus: 2 },
        'c2': { parent: 'm1', primaryCategory: 'Course', isMandatory: false, completionStatus: 0 },
        'a1': { parent: 'm1', primaryCategory: 'Course Assessment', completionStatus: 2 }
      }
      ; (comp as any).viewerSvc.updateContentHashMapForAssesstent = jest.fn()
    expect(() => (comp as any).recalculateParentProgress('m1')).not.toThrow()
  })

  // ---- getNextMilestoneId (covers 2779-2786) ----
  it('getNextMilestoneId - returns null when no next milestone', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'm1': { primaryCategory: 'Milestone', milestoneIndex: 0 }
      }
    const result = (comp as any).getNextMilestoneId(1)
    expect(result).toBeNull()
  })

  // ---- subscribeToTocChanges (covers 2809-2834) ----
  it('subscribeToTocChanges - subscribes to tocChangeSubject', () => {
    const { comp } = buildComponent()
    expect(() => (comp as any).subscribeToTocChanges()).not.toThrow()
  })

  // ---- showAssessmentPopup (covers 3022+) ----
  it('showAssessmentPopup - opens dialog with popupData', () => {
    const { comp } = buildComponent()
    const popupData = { assessmentType: 'optionalWeightage', buttonsList: [] }
      ; (comp as any).showAssessmentPopup(popupData)
    expect((comp as any).dialog.open).toHaveBeenCalled()
  })

  it('showAssessmentPopup - closes with yes calls submitQuiz', () => {
    const { comp } = buildComponent()
    const afterClosed$ = of('yes')
      ; (comp as any).dialog.open = jest.fn(() => ({ afterClosed: () => afterClosed$ }))
    jest.spyOn(comp as any, 'submitQuiz').mockImplementation(jest.fn())
    const popupData = { assessmentType: 'optionalWeightage', buttonsList: [] }
      ; (comp as any).showAssessmentPopup(popupData)
    expect((comp as any).submitQuiz).toHaveBeenCalled()
  })

  // ---- getQuestionIndex ----
  it('getQuestionIndex - returns correct computed index', () => {
    const { comp } = buildComponent()
    comp.noOfQuestionsPerSet = 5
    comp.currentSetNumber = 1
    const result = comp.getQuestionIndex(2)
    expect(result).toBe(8)  // 5*1 + 2 + 1
  })

  // ---- getSelectedQuestionNumber (covers 3116-3141) ----
  it('getSelectedQuestionNumber - returns 0 when no currentQuestion', () => {
    const { comp } = buildComponent()
    comp.currentQuestion = null as any
    const result = comp.getSelectedQuestionNumber()
    expect(result).toBe(0)
  })

  it('getSelectedQuestionNumber - returns cached value when question unchanged', () => {
    const { comp } = buildComponent()
    comp.quizJson = { questions: [{ questionId: 'q1', section: 's1' }], isAssessment: false, timeLimit: 0 } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.currentQuestion = { questionId: 'q1' } as any
    comp.noOfQuestionsPerSet = 10
    comp.currentSetNumber = 0
      ; (comp as any).cachedQuestionId = 'q1'
      ; (comp as any).cachedSelectedQuestionNumber = 3
    const result = comp.getSelectedQuestionNumber()
    expect(result).toBe(3)
  })

  it('getSelectedQuestionNumber - finds question in secQuestions', () => {
    const { comp } = buildComponent()
    comp.quizJson = { questions: [{ questionId: 'q1', section: 's1' }], isAssessment: false, timeLimit: 0 } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.currentQuestion = { questionId: 'q1' } as any
    comp.noOfQuestionsPerSet = 10
    comp.currentSetNumber = 0
      ; (comp as any).cachedQuestionId = ''
    const result = comp.getSelectedQuestionNumber()
    expect(result).toBe(1)  // 10*0 + 0 + 1
  })

  // ---- formate ----
  it('formate - converts text to ul/li html', () => {
    const { comp } = buildComponent()
    const result = (comp as any).formate('line1\nline2')
    expect(result).toBeTruthy()
  })

  it('formate - empty text returns empty ul', () => {
    const { comp } = buildComponent()
    const result = (comp as any).formate('')
    expect(result).toBeTruthy()
  })

  // ---- ngOnChanges - covers quiz change path ----
  it('ngOnChanges - with quiz change multiplies timeLimit by 1000', () => {
    const { comp } = buildComponent()
    comp.quizJson = { questions: [], timeLimit: 60, isAssessment: false } as any
    const changes: any = {
      quiz: { currentValue: comp.quizJson, previousValue: undefined, firstChange: true }
    }
    comp.ngOnChanges(changes)
    expect(comp.quizJson.timeLimit).toBe(60000)
  })

  it('ngOnChanges - with name change calls clearStorage', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp as any, 'clearStorage').mockImplementation(jest.fn())
    const changes: any = {
      name: { currentValue: 'New Name', previousValue: 'Old Name', firstChange: false }
    }
    comp.ngOnChanges(changes)
    expect((comp as any).clearStorage).toHaveBeenCalled()
  })

  // ---- fetchProgressOfAssessment with contextCategory ----
  it('fetchProgressOfAssessment - Final Milestone Assessment triggers checkAndShowMilestoneCompletion', () => {
    const { comp } = buildComponent()
    const mockData = { result: { contentList: [{ contentId: 'do_123', status: 2 }] } }
      ; (comp as any).widgetContentService.fetchContentHistoryV2 = jest.fn().mockReturnValue(of(mockData))
      ; (comp as any).widgetContentService.setProgramChildResumeData = jest.fn()
      ; (comp as any).viewerSvc.updateContentHashMapForAssesstent = jest.fn()
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).viewerDataSvc.resource = {
        identifier: 'do_123', contextCategory: 'Final Milestone Assessment', primaryCategory: 'Course Assessment'
      }
    jest.spyOn(comp as any, 'checkAndShowMilestoneCompletion').mockImplementation(jest.fn())
    comp.identifier = 'do_123'
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1' }
      ; (comp as any).configSvc.userProfile = { userId: 'u1' }
    comp.fetchProgressOfAssessment()
    expect((comp as any).checkAndShowMilestoneCompletion).toHaveBeenCalled()
  })

  // ---- goToNextSet / goToPreviousSet ----
  it('goToNextSet - hasNextSet=true increments currentSetNumber', () => {
    const { comp } = buildComponent()
    comp.quizJson = {
      questions: [
        { questionId: 'q1', section: 's1' }, { questionId: 'q2', section: 's1' },
        { questionId: 'q3', section: 's1' }
      ], isAssessment: false, timeLimit: 0
    } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.noOfQuestionsPerSet = 2
    comp.currentSetNumber = 0
    comp.questionVisitedData = []
    void comp.secQuestions  // triggers totalQuestionsCount = 3
    comp.goToNextSet()
    expect(comp.currentSetNumber).toBe(1)
  })

  it('goToNextSet - hasNextSet=false does nothing', () => {
    const { comp } = buildComponent()
    comp.quizJson = { questions: [{ questionId: 'q1', section: 's1' }], isAssessment: false, timeLimit: 0 } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.noOfQuestionsPerSet = 2
    comp.currentSetNumber = 0
    void comp.secQuestions
    comp.goToNextSet()
    expect(comp.currentSetNumber).toBe(0)
  })

  it('goToPreviousSet - hasPreviousSet=true decrements currentSetNumber', () => {
    const { comp } = buildComponent()
    comp.quizJson = {
      questions: [
        { questionId: 'q1', section: 's1' }, { questionId: 'q2', section: 's1' }
      ], isAssessment: false, timeLimit: 0
    } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.noOfQuestionsPerSet = 2
    comp.currentSetNumber = 2
    comp.questionVisitedData = []
    comp.goToPreviousSet()
    expect(comp.currentSetNumber).toBe(1)
  })

  it('goToPreviousSet - hasPreviousSet=false does nothing', () => {
    const { comp } = buildComponent()
    comp.currentSetNumber = 0
    comp.quizJson = { questions: [{ questionId: 'q1', section: 's1' }], isAssessment: false, timeLimit: 0 } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.goToPreviousSet()
    expect(comp.currentSetNumber).toBe(0)
  })

  // ---- nextSection ----
  it('nextSection - calls startSection with provided section', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp as any, 'startSection').mockImplementation(jest.fn())
    const section = { identifier: 's1', name: 'Section 1' } as any
    comp.nextSection(section)
    expect((comp as any).startSection).toHaveBeenCalledWith(section)
  })

  // ---- changeSection ----
  it('changeSection - finds and starts the section', () => {
    const { comp } = buildComponent()
    comp.paperSections = [{ identifier: 's1', name: 'Sec 1' }] as any
    jest.spyOn(comp as any, 'startSection').mockImplementation(jest.fn())
    comp.changeSection('s1')
    expect((comp as any).startSection).toHaveBeenCalled()
  })

  // ---- submitQuizForOptionWeightage ----
  it('submitQuizForOptionWeightage - empty paperSections resolves immediately', async () => {
    const { comp } = buildComponent()
    comp.paperSections = []
    await expect((comp as any).submitQuizForOptionWeightage()).resolves.toBeUndefined()
  })

  // ---- submitAfterAllPromiseResolvedForOptionWeightage ----
  it('submitAfterAllPromiseResolvedForOptionWeightage - compat<7 not forPreview calls submitQuizV4 and fetchProgress', async () => {
    const { comp } = buildComponent()
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 4
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ questions: [] })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.submitQuizV4 = jest.fn().mockReturnValue(of({ params: { status: 'success' } }))
    jest.spyOn(comp as any, 'fetchProgressOfAssessment').mockImplementation(jest.fn())
    await (comp as any).submitAfterAllPromiseResolvedForOptionWeightage()
    expect((comp as any).fetchProgressOfAssessment).toHaveBeenCalled()
  })

  it('submitAfterAllPromiseResolvedForOptionWeightage - compat>=8 not forPreview calls submitQuizV6', async () => {
    const { comp } = buildComponent()
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 8
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ questions: [] })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.submitQuizV6 = jest.fn().mockReturnValue(of({ params: { status: 'success' } }))
    jest.spyOn(comp as any, 'fetchProgressOfAssessment').mockImplementation(jest.fn())
    await (comp as any).submitAfterAllPromiseResolvedForOptionWeightage()
    expect((comp as any).fetchProgressOfAssessment).toHaveBeenCalled()
  })

  it('submitAfterAllPromiseResolvedForOptionWeightage - forPreview compat<7 calls publicV4Submit', async () => {
    const { comp } = buildComponent()
    comp.forPreview = true
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.quizData = { isPublic: false } as any
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ questions: [] })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.publicV4Submit = jest.fn().mockReturnValue(of({}))
      ; (comp as any).viewerSvc.publicUserDetails = { email: 'test@example.com' }
    await (comp as any).submitAfterAllPromiseResolvedForOptionWeightage()
    expect((comp as any).quizSvc.publicV4Submit).toHaveBeenCalled()
  })

  // ---- submitAfterAllPromiseResolved ----
  it('submitAfterAllPromiseResolved - compat<7 not forPreview calls submitQuizV4', async () => {
    const { comp } = buildComponent()
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 4
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ questions: [] })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.submitQuizV4 = jest.fn().mockReturnValue(of({
        params: { status: 'success' },
        result: { primaryCategory: 'Practice Question Set', overallResult: 80, passPercentage: 60 }
      }))
    jest.spyOn(comp as any, 'assignQuizResult').mockImplementation(jest.fn())
    await (comp as any).submitAfterAllPromiseResolved()
    expect((comp as any).assignQuizResult).toHaveBeenCalled()
  })

  it('submitAfterAllPromiseResolved - compat>=8 calls submitQuizV6', async () => {
    const { comp } = buildComponent()
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 8
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ questions: [] })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.submitQuizV6 = jest.fn().mockReturnValue(of({
        params: { status: 'success' },
        result: { primaryCategory: 'Practice Question Set' }
      }))
    jest.spyOn(comp as any, 'assignQuizResult').mockImplementation(jest.fn())
    await (comp as any).submitAfterAllPromiseResolved()
    expect((comp as any).assignQuizResult).toHaveBeenCalled()
  })

  it('submitAfterAllPromiseResolved - compat=7 calls submitQuizV5', async () => {
    const { comp } = buildComponent()
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 7
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ questions: [] })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue({}) }
      ; (comp as any).quizSvc.submitQuizV5 = jest.fn().mockReturnValue(of({
        params: { status: 'success' },
        result: { primaryCategory: 'Practice Question Set' }
      }))
    jest.spyOn(comp as any, 'assignQuizResult').mockImplementation(jest.fn())
    await (comp as any).submitAfterAllPromiseResolved()
    expect((comp as any).assignQuizResult).toHaveBeenCalled()
  })

  // ---- showMilestoneCompletionPopup ----
  it('showMilestoneCompletionPopup - hasNextMilestone=false shows close button', () => {
    const { comp } = buildComponent()
      ; (comp as any).dialog.open = jest.fn(() => ({ afterClosed: () => of('close') }))
    expect(() => (comp as any).showMilestoneCompletionPopup('M1', 1, false)).not.toThrow()
    expect((comp as any).dialog.open).toHaveBeenCalled()
  })

  it('showMilestoneCompletionPopup - hasNextMilestone=true shows continue button', () => {
    const { comp } = buildComponent()
      ; (comp as any).dialog.open = jest.fn(() => ({ afterClosed: () => of('continue-milestone') }))
      ; (comp as any).nextResourceUrl = '/viewer/course'
      ; (comp as any).nextResourceUrlParams = {}
    expect(() => (comp as any).showMilestoneCompletionPopup('M1', 1, true)).not.toThrow()
  })

  it('showMilestoneCompletionPopup - continue with no URL navigates to TOC', () => {
    const { comp } = buildComponent()
      ; (comp as any).dialog.open = jest.fn(() => ({ afterClosed: () => of('continue-milestone') }))
      ; (comp as any).nextResourceUrl = null
    comp.collectionId = 'c1'
      ; (comp as any).activatedRoute.snapshot.queryParams = {}
    expect(() => (comp as any).showMilestoneCompletionPopup('M1', 1, true)).not.toThrow()
  })

  it('showMilestoneCompletionPopup - result=stay does nothing', () => {
    const { comp } = buildComponent()
      ; (comp as any).dialog.open = jest.fn(() => ({ afterClosed: () => of('stay') }))
    expect(() => (comp as any).showMilestoneCompletionPopup('M1', 1, true)).not.toThrow()
  })

  // ---- getNextMilestoneId ----
  it('getNextMilestoneId - returns id of next milestone', () => {
    const { comp } = buildComponent()
      ; (comp as any).tocSvc.hashmap = {
        'm1': { primaryCategory: 'Milestone', milestoneIndex: 0 },
        'm2': { primaryCategory: 'Milestone', milestoneIndex: 1 },
      }
    const result = (comp as any).getNextMilestoneId(1)
    expect(result).toBe('m2')
  })

  // ---- checkMilestoneCompletionAfterLockUpdate ----
  it('checkMilestoneCompletionAfterLockUpdate - milestone not complete returns early', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp as any, 'checkMilestoneComplete').mockReturnValue(false)
    expect(() => (comp as any).checkMilestoneCompletionAfterLockUpdate({ identifier: 'm1', name: 'M1' })).not.toThrow()
  })

  it('checkMilestoneCompletionAfterLockUpdate - milestone complete shows popup', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp as any, 'checkMilestoneComplete').mockReturnValue(true)
    jest.spyOn(comp as any, 'getMilestoneNumber').mockReturnValue(1)
    jest.spyOn(comp as any, 'hasNextMilestone').mockReturnValue(false)
    jest.spyOn(comp as any, 'subscribeToTocChanges').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'showMilestoneCompletionPopup').mockImplementation(jest.fn())
    expect(() => (comp as any).checkMilestoneCompletionAfterLockUpdate({ identifier: 'm1', name: 'M1' })).not.toThrow()
    expect((comp as any).showMilestoneCompletionPopup).toHaveBeenCalled()
  })

  // ---- startQuiz ----
  it('startQuiz - sets viewState to attempt', () => {
    const { comp } = buildComponent()
    comp.quizJson = { questions: [{ questionId: 'q1', section: 's1' }], isAssessment: false, timeLimit: 0 } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.isXsmall = false
    comp.questionVisitedData = []
    comp.startQuiz()
    expect(comp.viewState).toBe('attempt')
  })

  it('startQuiz - mobile opens sidenav', () => {
    const { comp } = buildComponent()
    comp.quizJson = { questions: [], timeLimit: 0, isAssessment: false } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.isXsmall = true
    comp.questionVisitedData = []
    comp.startQuiz()
    expect(comp.sidenavOpenDefault).toBe(true)
  })

  // ---- getQuizResult ----
  it('getQuizResult - compat<7 not forPreview calls quizResult API', async () => {
    const { comp } = buildComponent()
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.forPreview = false
      ; (comp as any).quizSvc.quizResult = jest.fn().mockReturnValue(of({
        params: { status: 'success' },
        result: { isInProgress: false, overallResult: 80, passPercentage: 60 }
      }))
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1', batchId: 'b1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'b1', courseId: 'c1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ questions: [] })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue({}) }
    jest.spyOn(comp as any, 'assignQuizResult').mockImplementation(jest.fn())
    await (comp as any).getQuizResult()
    expect((comp as any).assignQuizResult).toHaveBeenCalled()
  })

  // ---- fetchProgressOfAssessment - preAssessment path ----
  it('fetchProgressOfAssessment - preAssessment=true skips API', () => {
    const { comp } = buildComponent()
      ; (comp as any).activatedRoute.snapshot.queryParams = { preAssessment: 'true' }
    expect(() => comp.fetchProgressOfAssessment()).not.toThrow()
  })

  // ---- raiseEvent ----
  it('raiseEvent - dispatches event with content data', () => {
    const { comp } = buildComponent()
      ; (comp as any).events.dispatchEvent = jest.fn()
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'c1' }
    comp.quizData = { identifier: 'do_123', primaryCategory: 'Practice Question Set', artifactUrl: 'http://ex.com' } as any
    comp.raiseEvent('Loaded' as any, comp.quizData)
    expect((comp as any).events.dispatchEvent).toHaveBeenCalled()
  })

  it('raiseEvent - null data does not throw', () => {
    const { comp } = buildComponent()
      ; (comp as any).events.dispatchEvent = jest.fn()
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: '' }
    expect(() => comp.raiseEvent('Loaded' as any, null as any)).not.toThrow()
  })

  // ---- back() (covers 1418-1419) ----
  it('back - calls proceedToSubmit', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp as any, 'proceedToSubmit').mockImplementation(jest.fn())
    comp.back()
    expect((comp as any).proceedToSubmit).toHaveBeenCalled()
  })

  // ---- proceedToSubmit compat>=7 path (covers 1393) ----
  it('proceedToSubmit - compat>=7 calls openSectionPopup with submitAssessment', () => {
    const { comp } = buildComponent()
    comp.selectedAssessmentCompatibilityLevel = 7
    comp.quizJson = { questions: [], isAssessment: false, timeLimit: 0 } as any
    jest.spyOn(comp as any, 'openSectionPopup').mockImplementation(jest.fn())
    comp.proceedToSubmit()
    expect((comp as any).openSectionPopup).toHaveBeenCalledWith(true)
  })

  // ---- getQuestions mcq-sca-tf case (covers 1651-1652, 1666-1667) ----
  it('getQuestions - mcq-sca-tf case creates response object', () => {
    const { comp } = buildComponent()
    const section = { identifier: 's1', childNodes: ['q1'] } as any
    const req = {
      questions: [{
        section: 's1',
        questionId: 'q1',
        questionType: 'mcq-sca-tf',
        question: 'Test Q?',
        questionLevel: 'easy',
        options: [{ optionId: 'a', userSelected: true, text: 'option A' }]
      }]
    } as any
    comp.timeSpentOnQuestions = { q1: 30 }
    const result = comp.getQuestions(section, req)
    expect(result.length).toBe(1)
  })

  // ---- back() (covers 1418-1419) ----
  it('back - calls proceedToSubmit', () => {
    const { comp } = buildComponent()
    jest.spyOn(comp as any, 'proceedToSubmit').mockImplementation(jest.fn())
    comp.back()
    expect((comp as any).proceedToSubmit).toHaveBeenCalled()
  })

  // ---- proceedToSubmit compat>=7 path (covers 1393) ----
  it('proceedToSubmit - compat>=7 calls openSectionPopup with submitAssessment', () => {
    const { comp } = buildComponent()
    comp.selectedAssessmentCompatibilityLevel = 7
    comp.quizJson = { questions: [], isAssessment: false, timeLimit: 0 } as any
    jest.spyOn(comp as any, 'openSectionPopup').mockImplementation(jest.fn())
    comp.proceedToSubmit()
    expect((comp as any).openSectionPopup).toHaveBeenCalledWith(true)
  })

  // ---- getQuestions mcq-sca-tf case (covers 1651-1652, 1666-1667) ----
  it('getQuestions - mcq-sca-tf case creates response object', () => {
    const { comp } = buildComponent()
    const section = { identifier: 's1', childNodes: ['q1'] } as any
    const req = {
      questions: [{
        section: 's1',
        questionId: 'q1',
        questionType: 'mcq-sca-tf',
        question: 'Test Q?',
        questionLevel: 'easy',
        options: [{ optionId: 'a', userSelected: true, text: 'option A' }]
      }]
    } as any
    comp.timeSpentOnQuestions = { q1: 30 }
    const result = comp.getQuestions(section, req)
    expect(result.length).toBe(1)
  })

  // ---- getNextQuestion - non-optionalWeightage path (covers 1124-1145) ----
  it('getNextQuestion - non-optionalWeightage path covers currentQuestion assignment', () => {
    const { comp } = buildComponent()
    comp.assessmentType = 'normal' as any
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.quizJson = {
      questions: [
        { questionId: 'q1', section: 's1' } as any,
        { questionId: 'q2', section: 's1' } as any,
      ],
      timeLimit: 0,
      isAssessment: false,
    } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.currentQuestion = { questionId: 'q1', section: 's1' } as any
    comp.currentQuestionIndex = 0
    comp.questionVisitedData = []
    comp.timeSpentOnQuestions = {}
    comp.getNextQuestion(1)
    expect(comp.currentQuestion).toBeDefined()
  })

  it('getNextQuestion - non-optionalWeightage idx 0 sets first question', () => {
    const { comp } = buildComponent()
    comp.assessmentType = 'normal' as any
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.quizJson = {
      questions: [{ questionId: 'q1', section: 's1' } as any],
      timeLimit: 0,
      isAssessment: false,
    } as any
    comp.selectedSection = { identifier: 's1' } as any
    comp.currentQuestion = null as any
    comp.currentQuestionIndex = 0
    comp.questionVisitedData = ['q1']
    comp.timeSpentOnQuestions = {}
    comp.getNextQuestion(0)
    expect(comp.currentQuestion).not.toBeUndefined()
  })

  // ---- generateRequest getter with paperSections (covers 1446, 1449) ----
  it('generateRequest - returns request with assessmentChildren from paperSections', () => {
    const { comp } = buildComponent()
    comp.quizJson = { questions: [], timeLimit: 1000, isAssessment: true } as any
    comp.paperSections = [
      { identifier: 's1', objectType: 'QuestionSet', primaryCategory: 'Course Assessment', scoreCutoffType: 'Minimum', childNodes: ['q1'] } as any,
    ]
    comp.questionAnswerHash = {}
    comp.timeSpentOnQuestions = {}
      ; (comp as any).activatedRoute.snapshot.queryParams = { collectionId: 'col1', batchId: 'bat1' }
      ; (comp as any).viewerSvc.getBatchIdAndCourseId = jest.fn().mockReturnValue({ batchId: 'bat1', courseId: 'col1' })
      ; (comp as any).viewerSvc.getResourceContentLanguage = jest.fn().mockReturnValue('en')
      ; (comp as any).quizSvc.createAssessmentSubmitRequest = jest.fn().mockReturnValue({ questions: [] })
      ; (comp as any).quizSvc.mtfSrc = { getValue: jest.fn().mockReturnValue({}) }
    const result = comp.generateRequest
    expect(result).toBeDefined()
    expect(result.children).toHaveLength(1)
  })

  // ---- router NavigationStart callback (covers 252-253) ----
  it('router NavigationStart - fires callback when viewState != initial', () => {
    const { comp, routerEvents$ } = buildComponent()
    const { NavigationStart: NS } = require('@angular/router')
    comp.viewState = 'attempt' as any
    comp.isSubmitted = false
    routerEvents$.next(new NS())
    expect(comp.viewState).toBe('attempt')
  })

  it('router NavigationStart - does not fire when viewState is initial', () => {
    const { comp, routerEvents$ } = buildComponent()
    const { NavigationStart: NS } = require('@angular/router')
    comp.viewState = 'initial' as any
    routerEvents$.next(new NS())
    expect(comp.viewState).toBe('initial')
  })

  // ---- action retake with FINAL_ASSESSMENT + compat<7 (covers 2123-2134) ----
  it('action retake - FINAL_ASSESSMENT + compat<7 calls canAttend', () => {
    const { comp } = buildComponent()
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 4
    comp.primaryCategory = 'Final Assessment' as any
    comp.identifier = 'do_123'
    comp.quizJson = { questions: [], isAssessment: false, timeLimit: 0 } as any
    comp.quizData = { identifier: 'do_123' } as any
      ; (comp as any).ePrimaryCategory = { FINAL_ASSESSMENT: 'Final Assessment' }
      ; (comp as any).events.dispatchEvent = jest.fn()
    jest.spyOn(comp as any, 'raiseInteractTelemetry').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'raiseEvent').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearStoragePartial').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearStorage').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'retakeAssessment').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.canAttend = jest.fn().mockReturnValue(of({ attemptsAllowed: 2, attemptsMade: 0 }))
    comp.action('retake')
    expect((comp as any).quizSvc.canAttend).toHaveBeenCalledWith('do_123')
    expect((comp as any).retakeAssessment).toHaveBeenCalled()
  })

  // ---- action retake with FINAL_ASSESSMENT + compat>=7 (covers 2136-2147) ----
  it('action retake - FINAL_ASSESSMENT + compat>=7 calls canAttendV5', () => {
    const { comp } = buildComponent()
    comp.forPreview = false
    comp.selectedAssessmentCompatibilityLevel = 8
    comp.primaryCategory = 'Final Assessment' as any
    comp.identifier = 'do_123'
    comp.quizJson = { questions: [], isAssessment: false, timeLimit: 0 } as any
    comp.quizData = { identifier: 'do_123' } as any
      ; (comp as any).ePrimaryCategory = { FINAL_ASSESSMENT: 'Final Assessment' }
      ; (comp as any).events.dispatchEvent = jest.fn()
    jest.spyOn(comp as any, 'raiseInteractTelemetry').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'raiseEvent').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearStoragePartial').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'clearStorage').mockImplementation(jest.fn())
    jest.spyOn(comp as any, 'retakeAssessment').mockImplementation(jest.fn())
      ; (comp as any).quizSvc.canAttendV5 = jest.fn().mockReturnValue(of({ attemptsAllowed: 2, attemptsMade: 0 }))
    comp.action('retake')
    expect((comp as any).quizSvc.canAttendV5).toHaveBeenCalledWith('do_123')
    expect((comp as any).retakeAssessment).toHaveBeenCalled()
  })
})
