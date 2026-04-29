import { QuestionComponent } from './question.component'

jest.mock('@angular/platform-browser', () => ({
  DomSanitizer: jest.fn(),
}), { virtual: true })
jest.mock('jsplumb', () => ({
  jsPlumb: {
    getInstance: jest.fn().mockReturnValue({
      bind: jest.fn(),
      getSelector: jest.fn().mockReturnValue([]),
      batch: jest.fn(),
      makeSource: jest.fn(),
      makeTarget: jest.fn(),
      getAllConnections: jest.fn().mockReturnValue([]),
      repaintEverything: jest.fn(),
      deleteEveryConnection: jest.fn(),
      connect: jest.fn(),
    }),
  },
  OnConnectionBindInfo: jest.fn(),
}), { virtual: true })

function buildQuestion(overrides: Partial<any> = {}) {
  const mockSanitizer: any = {
    bypassSecurityTrustHtml: jest.fn().mockReturnValue('<safe-html>'),
  }
  const mockElementRef: any = {
    nativeElement: {
      querySelector: jest.fn().mockReturnValue({
        addEventListener: jest.fn(),
        setAttribute: jest.fn(),
        value: 'test-value',
      }),
    },
  }
  const comp = new QuestionComponent(mockSanitizer, mockElementRef)
  comp.question = {
    multiSelection: false,
    question: 'What is 1+1?',
    instructions: '',
    section: '',
    questionType: undefined,
    questionId: 'q1',
    questionLevel: 'easy',
    marks: 1,
    options: [{ optionId: 'o1', text: '2', isCorrect: true }],
    ...overrides,
  }
  return { comp, mockSanitizer, mockElementRef }
}

describe('QuestionComponent', () => {
  it('should create', () => {
    const { comp } = buildQuestion()
    expect(comp).toBeTruthy()
  })

  it('should have default input values', () => {
    const { comp } = buildQuestion()
    expect(comp.questionNumber).toBe(0)
    expect(comp.total).toBe(0)
    expect(comp.viewState).toBe('initial')
    expect(comp.itemSelectedList).toEqual([])
  })

  it('ngOnInit - normal question without images', () => {
    const { comp } = buildQuestion()
    comp.question.question = 'Simple question text'
    expect(() => comp.ngOnInit()).not.toThrow()
  })

  it('ngOnInit - fitb question type creates inputs', () => {
    const { comp, mockSanitizer: sanitizer } = buildQuestion({ questionType: 'fitb' })
    comp.question.question = 'Fill <input type="text"> blank'
    comp.ngOnInit()
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalled()
  })

  it('ngOnInit - mtf question type shuffles matches', () => {
    const { comp } = buildQuestion({ questionType: 'mtf' })
    comp.question.options = [
      { optionId: 'o1', text: 'A', isCorrect: true, match: 'Match A', matchForView: 'Match A', hint: 'Match A' },
      { optionId: 'o2', text: 'B', isCorrect: false, match: 'Match B', matchForView: 'Match B', hint: 'Match B' },
    ]
    expect(() => comp.ngOnInit()).not.toThrow()
    expect(comp.matchHintDisplay.length).toBeGreaterThan(0)
  })

  it('ngOnInit - with image src in question', () => {
    const { comp } = buildQuestion()
    comp.artifactUrl = 'http://example.com/content/file.pdf'
    comp.question.question = '<img src="/content/image.png">'
    expect(() => comp.ngOnInit()).not.toThrow()
  })

  it('isSelected - returns true when option in list', () => {
    const { comp } = buildQuestion()
    comp.itemSelectedList = ['o1']
    expect(comp.isSelected({ optionId: 'o1', text: '', isCorrect: false })).toBe(true)
  })

  it('isSelected - returns false when option not in list', () => {
    const { comp } = buildQuestion()
    comp.itemSelectedList = ['o2']
    expect(comp.isSelected({ optionId: 'o1', text: '', isCorrect: false })).toBe(false)
  })

  it('isQuestionMarked - returns true if in markedQuestions', () => {
    const { comp } = buildQuestion()
    comp.markedQuestions = new Set(['q1'])
    expect(comp.isQuestionMarked()).toBe(true)
  })

  it('isQuestionMarked - returns false if not marked', () => {
    const { comp } = buildQuestion()
    comp.markedQuestions = new Set()
    expect(comp.isQuestionMarked()).toBe(false)
  })

  it('markQuestion - adds to markedQuestions', () => {
    const { comp } = buildQuestion()
    comp.markedQuestions = new Set()
    comp.markQuestion()
    expect(comp.markedQuestions.has('q1')).toBe(true)
  })

  it('markQuestion - removes if already marked', () => {
    const { comp } = buildQuestion()
    comp.markedQuestions = new Set(['q1'])
    comp.markQuestion()
    expect(comp.markedQuestions.has('q1')).toBe(false)
  })

  it('shuffle - returns array of same length', () => {
    const { comp } = buildQuestion()
    const arr = ['a', 'b', 'c', 'd']
    const result = comp.shuffle([...arr])
    expect(result.length).toBe(4)
  })

  it('shuffle - handles empty array', () => {
    const { comp } = buildQuestion()
    expect(comp.shuffle([])).toEqual([])
  })

  it('numConnections - returns 0 when jsPlumbInstance not set', () => {
    const { comp } = buildQuestion()
    comp.jsPlumbInstance = null
    expect(comp.numConnections).toBe(0)
  })

  it('numConnections - returns connection count when instance set', () => {
    const { comp } = buildQuestion()
    comp.jsPlumbInstance = { getAllConnections: jest.fn().mockReturnValue([{}, {}]) }
    expect(comp.numConnections).toBe(2)
  })

  it('setBorderColorById - sets border color on element', () => {
    const mockEl = { style: { borderColor: '' } }
    jest.spyOn(document, 'getElementById').mockReturnValue(mockEl as any)
    const { comp } = buildQuestion()
    comp.setBorderColorById('some-id', 'red')
    expect(mockEl.style.borderColor).toBe('red')
  })

  it('setBorderColorById - null color does not throw', () => {
    const { comp } = buildQuestion()
    jest.spyOn(document, 'getElementById').mockReturnValue(null)
    expect(() => comp.setBorderColorById('id', 'red')).not.toThrow()
  })

  it('setBorderColor - sets border on source and target', () => {
    const mockEl = { style: { borderColor: '' } }
    jest.spyOn(document, 'getElementById').mockReturnValue(mockEl as any)
    const { comp } = buildQuestion()
    comp.setBorderColor({ sourceId: 's1', targetId: 't1' } as any, 'blue')
    expect(mockEl.style.borderColor).toBe('blue')
  })

  it('setBorderColor - handles null elements', () => {
    jest.spyOn(document, 'getElementById').mockReturnValue(null)
    const { comp } = buildQuestion()
    expect(() => comp.setBorderColor({ sourceId: 's1', targetId: 't1' } as any, 'blue')).not.toThrow()
  })

  it('onResize - calls repaintEverything for mtf', () => {
    const { comp } = buildQuestion({ questionType: 'mtf' })
    comp.jsPlumbInstance = { repaintEverything: jest.fn() }
    comp.onResize(null)
    expect(comp.jsPlumbInstance.repaintEverything).toHaveBeenCalled()
  })

  it('onResize - does nothing for non-mtf', () => {
    const { comp } = buildQuestion()
    comp.jsPlumbInstance = { repaintEverything: jest.fn() }
    comp.onResize(null)
    expect(comp.jsPlumbInstance.repaintEverything).not.toHaveBeenCalled()
  })

  it('repaintEveryThing - calls repaintEverything for mtf', () => {
    const { comp } = buildQuestion({ questionType: 'mtf' })
    comp.jsPlumbInstance = { repaintEverything: jest.fn() }
    comp.repaintEveryThing()
    expect(comp.jsPlumbInstance.repaintEverything).toHaveBeenCalled()
  })

  it('reset - fitb calls resetBlankBorder', () => {
    const { comp } = buildQuestion({ questionType: 'fitb' })
    comp.question.question = 'Fill <input> blank'
    const spy = jest.spyOn(comp, 'resetBlankBorder')
    comp.reset()
    expect(spy).toHaveBeenCalled()
  })

  it('reset - mtf resets connections', () => {
    const { comp } = buildQuestion({ questionType: 'mtf' })
    comp.jsPlumbInstance = {
      getAllConnections: jest.fn().mockReturnValue([]),
      setPaintStyle: jest.fn(),
      deleteEveryConnection: jest.fn(),
    }
    expect(() => comp.reset()).not.toThrow()
  })

  it('resetMtf - deletes connections', () => {
    const { comp } = buildQuestion({ questionType: 'mtf' })
    comp.jsPlumbInstance = { deleteEveryConnection: jest.fn() }
    comp.resetMtf()
    expect(comp.jsPlumbInstance.deleteEveryConnection).toHaveBeenCalled()
  })

  it('resetMtf - non-mtf does nothing', () => {
    const { comp } = buildQuestion()
    const mockInstance = { deleteEveryConnection: jest.fn() }
    comp.jsPlumbInstance = mockInstance
    comp.resetMtf()
    expect(mockInstance.deleteEveryConnection).not.toHaveBeenCalled()
  })

  it('resetColor - iterates connections and sets paint style', () => {
    const mockConnection = { setPaintStyle: jest.fn() }
    const { comp } = buildQuestion()
    comp.jsPlumbInstance = { getAllConnections: jest.fn().mockReturnValue([mockConnection]) }
    comp.resetColor()
    expect(mockConnection.setPaintStyle).toHaveBeenCalled()
  })

  it('changeColor - alerts if fewer connections than options', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { })
    const { comp } = buildQuestion({ questionType: 'mtf' })
    comp.question.options = [{} as any, {} as any]
    comp.jsPlumbInstance = { getAllConnections: jest.fn().mockReturnValue([{}]) }
    comp.changeColor()
    expect(alertSpy).toHaveBeenCalled()
  })

  it('onEntryInBlank - emits joined values', () => {
    const { comp } = buildQuestion({ questionType: 'fitb' })
    comp.question.question = 'Fill <input> blank'
    // Mock elementRef to return input element with value
    comp['elementRef'] = {
      nativeElement: {
        querySelector: jest.fn().mockReturnValue({ value: 'answer', style: { border: '' } }),
      },
    }
    // Prevent DOM-dependent method from running
    jest.spyOn(comp, 'ifFillInTheBlankCorrect').mockImplementation(() => { })
    const emitSpy = jest.spyOn(comp.itemSelected, 'emit')
    comp.onEntryInBlank('q1')
    expect(emitSpy).toHaveBeenCalled()
  })

  it('functionChangeBlankBorder - correct option green border', () => {
    const { comp, mockElementRef } = buildQuestion({ questionType: 'fitb' })
    comp.question.question = 'Fill <input> blank'
    comp.correctOption = [true]
    comp.unTouchedBlank = [false]
    comp.functionChangeBlankBorder()
    expect(mockElementRef.nativeElement.querySelector).toHaveBeenCalled()
  })

  it('functionChangeBlankBorder - incorrect option red border', () => {
    const { comp, mockElementRef } = buildQuestion({ questionType: 'fitb' })
    comp.question.question = 'Fill <input> blank'
    comp.correctOption = [false]
    comp.unTouchedBlank = [false]
    comp.functionChangeBlankBorder()
    expect(mockElementRef.nativeElement.querySelector).toHaveBeenCalled()
  })

  it('functionChangeBlankBorder - untouched blank neutral style', () => {
    const { comp, mockElementRef } = buildQuestion({ questionType: 'fitb' })
    comp.question.question = 'Fill <input> blank'
    comp.correctOption = [false]
    comp.unTouchedBlank = [true]
    comp.functionChangeBlankBorder()
    expect(mockElementRef.nativeElement.querySelector).toHaveBeenCalled()
  })

  it('resetBlankBorder - resets style for each input', () => {
    const { comp, mockElementRef } = buildQuestion({ questionType: 'fitb' })
    comp.question.question = 'Fill <input> blank'
    comp.resetBlankBorder()
    expect(mockElementRef.nativeElement.querySelector).toHaveBeenCalled()
  })

  it('ngAfterViewInit - mtf type sets up jsPlumb', () => {
    const { comp } = buildQuestion({ questionType: 'mtf' })
    comp.ngAfterViewInit()
    expect(comp.jsPlumbInstance).toBeDefined()
  })

  it('ngAfterViewInit - fitb type attaches event listeners', () => {
    const { comp, mockElementRef } = buildQuestion({ questionType: 'fitb' })
    comp.question.question = 'Fill <input> the blank'
    comp.ngAfterViewInit()
    expect(mockElementRef.nativeElement.querySelector).toHaveBeenCalled()
  })

  it('onChange - calls onEntryInBlank', () => {
    const { comp } = buildQuestion({ questionType: 'fitb' })
    comp.question.question = 'Fill <input> blank'
    jest.spyOn(comp, 'onEntryInBlank').mockImplementation(() => { })
    comp.onChange('q10', {})
    expect(comp.onEntryInBlank).toHaveBeenCalledWith('q10')
  })

  it('ifFillInTheBlankCorrect - marks correct when answer matches', () => {
    const { comp } = buildQuestion({ questionType: 'fitb' })
    comp.question.options = [{ optionId: 'o1', text: '2', isCorrect: true }]
    comp.correctOption = [false]
    comp.unTouchedBlank = [true]
    jest.spyOn(document, 'getElementById').mockReturnValue({ value: '2' } as any)
    comp.ifFillInTheBlankCorrect('q10')
    expect(comp.correctOption[0]).toBe(true)
    expect(comp.unTouchedBlank[0]).toBe(false)
    jest.restoreAllMocks()
  })

  it('ifFillInTheBlankCorrect - marks incorrect when answer does not match', () => {
    const { comp } = buildQuestion({ questionType: 'fitb' })
    comp.question.options = [{ optionId: 'o1', text: '2', isCorrect: true }]
    comp.correctOption = [true]
    comp.unTouchedBlank = [false]
    jest.spyOn(document, 'getElementById').mockReturnValue({ value: 'wrong' } as any)
    comp.ifFillInTheBlankCorrect('q10')
    expect(comp.correctOption[0]).toBe(false)
    jest.restoreAllMocks()
  })

  it('ifFillInTheBlankCorrect - marks untouched when blank is empty', () => {
    const { comp } = buildQuestion({ questionType: 'fitb' })
    comp.question.options = [{ optionId: 'o1', text: '2', isCorrect: true }]
    comp.correctOption = [false]
    comp.unTouchedBlank = [false]
    jest.spyOn(document, 'getElementById').mockReturnValue({ value: '' } as any)
    comp.ifFillInTheBlankCorrect('q10')
    expect(comp.unTouchedBlank[0]).toBe(true)
    jest.restoreAllMocks()
  })

  it('matchShowAnswer - calls deleteEveryConnection and connect for mtf', () => {
    const { comp } = buildQuestion({ questionType: 'mtf' })
    const connectMock = jest.fn()
    const getSelector = jest.fn().mockReturnValue([{ innerText: 'Match A' }])
    const setPaintStyle = jest.fn()
    const mockConn = { sourceId: 'src1', target: { innerHTML: 'Match A' }, setPaintStyle }
    comp.jsPlumbInstance = {
      deleteEveryConnection: jest.fn(),
      connect: connectMock,
      getSelector,
      getAllConnections: jest.fn().mockReturnValue([mockConn]),
    }
    comp.question.options = [
      { optionId: 'o1', text: 'A', isCorrect: true, match: 'Match A' },
    ]
    jest.spyOn(document, 'getElementById').mockReturnValue({ style: {} } as any)
    comp.matchShowAnswer()
    expect(comp.jsPlumbInstance.deleteEveryConnection).toHaveBeenCalled()
    jest.restoreAllMocks()
  })

  it('changeColor - iterates connections when count matches options', () => {
    const { comp } = buildQuestion({ questionType: 'mtf' })
    const setPaintStyle = jest.fn()
    const mockConn = {
      sourceId: 'src1',
      target: { innerHTML: 'Match A' },
      setPaintStyle,
    }
    comp.jsPlumbInstance = { getAllConnections: jest.fn().mockReturnValue([mockConn]) }
    comp.question.options = [
      { optionId: 'o1', text: 'A', isCorrect: true, match: 'Match A' },
    ]
    jest.spyOn(document, 'getElementById').mockReturnValue({ style: {} } as any)
    comp.changeColor()
    expect(setPaintStyle).toHaveBeenCalled()
    jest.restoreAllMocks()
  })
})
