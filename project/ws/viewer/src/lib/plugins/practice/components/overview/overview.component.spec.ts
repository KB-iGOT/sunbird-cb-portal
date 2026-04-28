import { BehaviorSubject, of, throwError } from 'rxjs'
import { OverviewComponent } from './overview.component'

describe('OverviewComponent', () => {
  let component: OverviewComponent
  let dialog: any
  let snackbar: any
  let quizSvc: any
  let routeData$: BehaviorSubject<any>
  let sidebar: any

  beforeEach(() => {
    dialog = { open: jest.fn(() => ({ afterClosed: () => of('yes') })) }
    snackbar = { open: jest.fn() }
    quizSvc = {
      canAttend: jest.fn(() => of({ attemptsMade: 1, attemptsAllowed: 3 })),
      canAttendV5: jest.fn(() => of({ attemptsMade: 0, attemptsAllowed: 3 })),
      checkAlreadySubmitAssessment: { next: jest.fn() },
    }
    routeData$ = new BehaviorSubject({
      content: { data: { identifier: 'assessment-1' } },
      pageData: { data: { isretakeAllowed: true } },
    })
    sidebar = { visibilityStatus: { next: jest.fn() } }
    component = new OverviewComponent(
      dialog,
      { data: routeData$ } as any,
      snackbar,
      sidebar,
      quizSvc,
      { translateLabel: jest.fn((label: string) => `t:${label}`) } as any,
    )
    component.primaryCategory = component.questionTYP.FINAL_ASSESSMENT
    component.selectedAssessmentCompatibilityLevel = 7
    component.quizData = { maxAssessmentRetakeAttempts: 2, isPublic: true }
  })

  it('subscribes route data and checks v5 can-attempt state', () => {
    component.ngOnInit()
    expect(component.contentData.identifier).toBe('assessment-1')
    expect(component.isretakeAllowed).toBe(true)
    expect(quizSvc.canAttendV5).toHaveBeenCalledWith('assessment-1')
    expect(quizSvc.checkAlreadySubmitAssessment.next).toHaveBeenCalledWith(false)
    expect(component.canAttempt).toEqual({ attemptsMade: 0, attemptsAllowed: 3 })
  })

  it('uses legacy canAttend for compatibility below 7 and flags existing attempts', () => {
    component.selectedAssessmentCompatibilityLevel = 2
    component.checkForAssessmentSubmitAlready('legacy')
    expect(quizSvc.canAttend).toHaveBeenCalledWith('legacy')
    expect(quizSvc.checkAlreadySubmitAssessment.next).toHaveBeenCalledWith(true)
  })

  it('handles can-attempt errors and exhausted attempts', () => {
    component.handleCanAttendError({ error: { responseCode: 'BAD_REQUEST', params: { errmsg: 'Maximum retry attempts exhausted' } } })
    expect(component.canAttempt).toEqual({ attemptsAllowed: 2, attemptsMade: 2 })
    expect(snackbar.open).toHaveBeenCalledWith('Maximum retry attempts exhausted', 'Close', { duration: 8000 })

    quizSvc.canAttendV5.mockReturnValueOnce(throwError(() => ({ message: 'Unable' })))
    component.checkForAssessmentSubmitAlready('id')
    expect(quizSvc.checkAlreadySubmitAssessment.next).toHaveBeenCalledWith(false)
  })

  it('shows max attempt popup on changes and resets flag when confirmed', () => {
    component.canAttempt = { attemptsMade: 2, attemptsAllowed: 2 }
    component.ngOnChanges()
    expect(dialog.open).toHaveBeenCalled()
    expect(component.maxAttempPopup).toBe(false)
  })

  it('emits overview selection for normal and public preview flows', () => {
    const emit = jest.spyOn(component.userSelection, 'emit')
    component.overviewed('start' as any)
    expect(component.loading).toBe(true)
    expect(emit).toHaveBeenCalledWith('start')
    expect(sidebar.visibilityStatus.next).toHaveBeenCalledWith(false)

    component.forPreview = true
    component.forCreatorMode = false
    component.quizData = { isPublic: false }
    component.overviewed('resume' as any)
    expect(snackbar.open).toHaveBeenCalledWith('The content is not available to access.')
  })

  it('translates, toggles consent, pages instructions and destroys subscription', () => {
    component.instructionAssessment = ['one', 'two']
    component.nextPage()
    expect(component.currentPage).toBe(1)
    component.nextPage()
    expect(component.currentPage).toBe(1)
    component.previousPage()
    expect(component.currentPage).toBe(0)
    component.startTestEnable({})
    expect(component.consentGiven).toBe(true)
    expect(component.translateLabels('label', 'type')).toBe('t:label')

    component.ngOnInit()
    const unsub = jest.spyOn(component.dataSubscription, 'unsubscribe')
    component.ngOnDestroy()
    expect(unsub).toHaveBeenCalled()
  })
})
