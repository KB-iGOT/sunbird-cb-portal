import { of, Subscription, throwError } from 'rxjs'
import { HandsOnComponent } from './hands-on.component'

describe('HandsOnComponent', () => {
  let component: HandsOnComponent
  let sanitizer: any
  let handsOnSvc: any
  let dialog: any

  const handsOn = {
    problemStatement: '<img src="/asset.png">',
    starterCodes: ['print(1)'],
    supportedLanguages: [{ id: 'python' }],
    timeLimit: 1,
  }

  beforeEach(() => {
    jest.useFakeTimers()
    sanitizer = { bypassSecurityTrustHtml: jest.fn((html: string) => `safe:${html}`) }
    handsOnSvc = {
      execute: jest.fn(() => of({ output: 'ok', errors: '' })),
      verifyCe: jest.fn(() => of({
        verifyResult: JSON.stringify({
          testCaseOutputs: [
            { type: 'hidden', result: 'Passed' },
            { type: 'hidden', result: 'Failed' },
            { type: 'sample', result: 'Passed' },
          ],
        }),
      })),
      verifyFp: jest.fn(() => of({
        verifyResult: JSON.stringify({
          TestResultData: [
            { Type: 'Structural', SAType: 'Other' },
            { Type: 'Functional', SAType: 'Sample' },
            { Type: 'Functional', SAType: 'Actual' },
          ],
        }),
      })),
      verifyJavaFp: jest.fn(() => of({ verifyResult: { procedural: ['sample', 'actual'] } })),
      submitCe: jest.fn(() => of({ submitResult: { submitionStatus: true } })),
      submitFp: jest.fn(() => of({ submitResult: { submitionStatus: true } })),
      submitJavaFp: jest.fn(() => of({ submitResult: { submitionStatus: true } })),
      viewLastSubmission: jest.fn(() => of('last code')),
    }
    dialog = { open: jest.fn(() => ({ afterClosed: () => of('submit') })) }
    component = new HandsOnComponent({ error: jest.fn() } as any, sanitizer, handsOnSvc, dialog, {
      raiseInteractTelemetry: jest.fn(),
    } as any)
    component.handsOn = handsOn as any
    component.artifactUrl = '/content/path/exercise.json'
    component.ngOnInit()
  })

  afterEach(() => {
    component.ngOnDestroy()
    jest.useRealTimers()
  })

  it('initializes constants and exercise data on changes', () => {
    component.ngOnInit()
    component.ngOnChanges()

    expect(component.EXECUTION_STATUS).toBeTruthy()
    expect(component.exerciseData).toMatchObject({ starterCodes: ['print(1)'], timeLimit: 1000 })
    expect(component.inputStarterCode).toBe('print(1)')
    expect(component.exerciseTimeRemaining).toBe(1000)
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith("<img src='/content/path/asset.png'>")
  })

  it('clears subscriptions and intervals on destroy', () => {
    const timer = new Subscription()
    const notifier = new Subscription()
    const timerUnsub = jest.spyOn(timer, 'unsubscribe')
    const notifierUnsub = jest.spyOn(notifier, 'unsubscribe')
    component['timerSubscription'] = timer
    component['notifierTimerSubscription'] = notifier
    component.inputInterval = setInterval(jest.fn(), 1000)
    component.clickInterval = setInterval(jest.fn(), 1000)

    component.ngOnDestroy()

    expect(timerUnsub).toHaveBeenCalled()
    expect(notifierUnsub).toHaveBeenCalled()
  })

  it('resets exercise and previous results', () => {
    component.exerciseResult = { old: true }
    component.verifyResult = { old: true }

    component.reset()

    expect(component.exerciseResult).toBeNull()
    expect(component.verifyResult).toBeNull()
    expect(component.exerciseData).toBeTruthy()
  })

  it('opens submit dialog and submits confirmed exercise', () => {
    const submitSpy = jest.spyOn(component, 'submit').mockImplementation()

    component.openExecutionDialog('submit')

    expect(component.executed).toBe(true)
    expect(dialog.open).toHaveBeenCalled()
    expect(submitSpy).toHaveBeenCalledWith(true)
  })

  it('routes post action selections to execute, verify and submit', () => {
    const executeSpy = jest.spyOn(component, 'execute').mockImplementation()
    const verifySpy = jest.spyOn(component, 'verify').mockImplementation()
    const submitSpy = jest.spyOn(component, 'submit').mockImplementation()

    component.showPostActionSection('execute')
    expect(component.postActionSectionContent).toBe('execute')
    expect(component.isPostActionSectionShown).toBe(true)
    component.showPostActionSection('verify')
    component.showPostActionSection('submit')

    expect(executeSpy).toHaveBeenCalled()
    expect(verifySpy).toHaveBeenCalled()
    expect(submitSpy).toHaveBeenCalled()
  })

  it('executes code and stores formatted output', () => {
    component.exerciseData = handsOn as any

    component.execute()

    expect(component.executionInProgress).toBe(false)
    expect(handsOnSvc.execute).toHaveBeenCalledWith({ language: 'python', code: 'print(1)', stdin: '' })
    expect(component.exerciseResult.output).toBe('ok')
    expect(component.exerciseResult.showOutput).toBe('ok')
  })

  it('marks done without throwing', () => {
    expect(() => component.done()).not.toThrow()
  })

  it('sets execution status for warnings and errors', () => {
    component.exerciseData = handsOn as any
    handsOnSvc.execute.mockReturnValueOnce(of({ output: 'Compilation failed', errors: 'syntax' }))
    component.execute()
    expect(component.exerciseResult.status).toBe(component.EXECUTION_STATUS.ERROR)
    expect(component.exerciseResult.showOutput).toContain('Compilation failed')

    handsOnSvc.execute.mockReturnValueOnce(of({ output: 'Compilation succeeded', errors: 'warning' }))
    component.execute()
    expect(component.exerciseResult.status).toBe(component.EXECUTION_STATUS.WARNING)

    handsOnSvc.execute.mockReturnValueOnce(of({ output: 'Runtime', errors: 'boom' }))
    component.execute()
    expect(component.exerciseResult.status).toBe(component.EXECUTION_STATUS.ERROR)
    expect(component.exerciseResult.showOutput).toContain('Runtime Exception')
  })

  it('verifies CE exercise and splits test cases', () => {
    component.identifier = 'lex'
    component.exerciseData = handsOn as any
    document.body.innerHTML = '<div id="verifyCard"></div>'
    ;(document.getElementById('verifyCard') as any).scrollIntoView = jest.fn()

    component.verify()

    expect(handsOnSvc.verifyCe).toHaveBeenCalledWith('lex', {
      language_code: 'python',
      user_solution: 'print(1)',
      user_id_type: 'uuid',
      ignore_error: true,
    })
    expect(component.verifyResult.SamplesPassed).toHaveLength(1)
    expect(component.verifyResult.HiddensFailed).toHaveLength(1)
    expect(component.executionInProgress).toBe(false)
  })

  it('verifies FP and Java FP exercises and handles errors', () => {
    component.identifier = 'lex'
    component.exerciseData = { ...handsOn, supportedLanguages: [{ id: 'python', language: 'python' }] } as any
    component.handsOn = { ...component.exerciseData, forFPCourse: true } as any
    component.verify()
    expect(component.verifyResult.structural).toHaveLength(1)
    expect(component.verifyResult.sample).toHaveLength(1)

    component.exerciseData = { ...handsOn, supportedLanguages: [{ id: 'java', language: 'java' }] } as any
    component.handsOn = { ...component.exerciseData, forFPCourse: true } as any
    component.verify()
    expect(component.verifyJavaResult.sample).toBe('sample')
    expect(component.verifyJavaResult.actual).toBe('actual')

    handsOnSvc.verifyJavaFp.mockReturnValueOnce(throwError(() => new Error('fail')))
    component.verify()
    expect(component.apiErrorOccurred).toBe(true)
    expect(component.executionInProgress).toBe(false)
  })

  it('submits CE, FP and Java FP exercises and handles submit errors', () => {
    const dialogSpy = jest.spyOn(component, 'openExecutionDialog').mockImplementation()
    component.identifier = 'lex'
    component.exerciseData = handsOn as any
    component.submit()
    expect(handsOnSvc.submitCe).toHaveBeenCalledWith('lex', expect.objectContaining({ ignore_error: false }))
    expect(component.submitResult.submitionStatus).toBe(true)

    handsOnSvc.submitCe.mockReturnValueOnce(of({ submitResult: { submitionStatus: false } }))
    component.submit(true)
    expect(dialogSpy).toHaveBeenCalledWith('submit')

    component.exerciseData = { ...handsOn, supportedLanguages: [{ id: 'python', language: 'python' }] } as any
    component.handsOn = { ...component.exerciseData, forFPCourse: true } as any
    component.submit()
    expect(handsOnSvc.submitFp).toHaveBeenCalled()

    component.exerciseData = { ...handsOn, supportedLanguages: [{ id: 'java', language: 'java' }] } as any
    component.handsOn = { ...component.exerciseData, forFPCourse: true } as any
    component.submit()
    expect(handsOnSvc.submitJavaFp).toHaveBeenCalled()

    handsOnSvc.submitJavaFp.mockReturnValueOnce(throwError(() => new Error('fail')))
    component.submit()
    expect(component.apiErrorOccurred).toBe(true)
  })

  it('loads last submission or opens no-submit dialog', () => {
    const dialogSpy = jest.spyOn(component, 'openExecutionDialog').mockImplementation()
    component.identifier = 'lex'
    component.exerciseData = JSON.parse(JSON.stringify(handsOn))

    component.viewLastSubmission()
    expect(component.exerciseData?.starterCodes[0]).toBe('last code')

    handsOnSvc.viewLastSubmission.mockReturnValueOnce(of('---no submission found---'))
    component.viewLastSubmission()
    expect(dialogSpy).toHaveBeenCalledWith('no-submit')

    handsOnSvc.viewLastSubmission.mockReturnValueOnce(throwError(() => new Error('fail')))
    component.viewLastSubmission()
    expect(dialogSpy).toHaveBeenCalledWith('no-submit')
  })

  it('copies code to clipboard and resets tooltip', () => {
    component.exerciseData = JSON.parse(JSON.stringify(handsOn))
    document.body.innerHTML = '<span id="myTooltip"></span>'
    ;(document as any).execCommand = jest.fn(() => true)

    component.copyToClipBoardFunction()
    expect(document.getElementById('myTooltip')?.innerHTML).toBe('Code Copied!')

    component.outFunc()
    expect(document.getElementById('myTooltip')?.innerHTML).toBe('Copy to clipboard')
  })

  it('raises input and click telemetry with timers', () => {
    const eventSvc = component['eventSvc'] as any
    component.identifier = 'lex'
    component.exerciseData = JSON.parse(JSON.stringify(handsOn))
    component.inputStarterCode = 'old code'

    component.raiseInputChange()
    component.raiseClickEvent()
    expect(eventSvc.raiseInteractTelemetry).toHaveBeenCalledWith({ type: 'editor', subType: 'codeinput', id: 'lex' }, { id: 'lex' })
    expect(eventSvc.raiseInteractTelemetry).toHaveBeenCalledWith({ type: 'editor', subType: 'buttonclick', id: 'lex' }, { id: 'lex' })

    component.isInput = true
    component.isClick = true
    jest.advanceTimersByTime(2 * 60000)
    expect(eventSvc.raiseInteractTelemetry).toHaveBeenCalled()
  })
})
