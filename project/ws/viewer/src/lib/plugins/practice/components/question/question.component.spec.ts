import { BehaviorSubject } from 'rxjs'
import { QuestionComponent } from './question.component'

describe('QuestionComponent', () => {
  let component: QuestionComponent
  let practiceSvc: any
  let snackBar: any

  beforeEach(() => {
    practiceSvc = {
      questionAnswerHash: new BehaviorSubject({ q1: ['o1'] }),
      shCorrectAnswer: jest.fn(),
    }
    snackBar = { open: jest.fn() }
    component = new QuestionComponent(practiceSvc, snackBar)
    component.question = {
      questionId: 'q1',
      question: '<p>Q</p><img src="/img.png">',
      multiSelection: false,
      section: '',
      instructions: '',
      editorState: { options: [{ optionId: 'o1' }] },
      questionLevel: '',
      options: [{ optionId: 'o1', text: 'One', isCorrect: true }],
      choices: { options: [] },
    } as any
    component.artifactUrl = '/content/path/question.json'
    component.currentQuestion = component.question
    component.totalQCount = 2
    component.itemSelectedList = ['o1']
  })

  it('initializes mobile state, rewrites image urls and reads answer hash', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 })
    component.ngOnInit()

    expect(component.isMobile).toBe(true)
    expect(component.question.question).toContain('/content/path/img.png')
    expect(component.itemSelectedList1).toEqual(['o1'])
  })

  it('handles change inputs and emits selections', () => {
    const update = jest.spyOn(component.itemSelected, 'emit')
    const init = jest.spyOn(component, 'init')

    component.ngOnChanges({ questionNumber: { currentValue: 2 }, itemSelectedList: { currentValue: ['o1'] } } as any)
    expect(init).toHaveBeenCalled()

    component.update({ answer: 'o1' })
    expect(update).toHaveBeenCalledWith({ answer: 'o1' })
  })

  it('reports selected and marked state and toggles review marks', () => {
    const next = jest.spyOn(component.getNextQuestion, 'emit')
    expect(component.isSelected({ optionId: 'o1' } as any)).toBe(true)
    expect(component.selectedList).toEqual(['o1'])
    expect(component.isQuestionMarked()).toBe(false)

    component.selectedAssessmentCompatibilityLevel = 7
    component.markQuestion()
    expect(component.isQuestionMarked()).toBe(true)
    expect(next).toHaveBeenCalledWith(true)
    component.markQuestion()
    expect(component.isQuestionMarked()).toBe(false)
  })

  it('clears response and sets border color', () => {
    const clear = jest.spyOn(component.clearQuestion, 'emit')
    document.body.innerHTML = '<div id="option"></div>'

    component.clearResponse()
    component.setBorderColorById('option', 'red')
    component.setBorderColorById('missing', 'red')
    component.setBorderColorById('option', null)

    expect(clear).toHaveBeenCalledWith(true)
    expect(document.getElementById('option')?.style.borderColor).toBe('red')
  })

  it('shows answer when valid and opens snackbar when no answer selected', () => {
    component.checkAns(1)
    expect(component.showAnswer).toBe(true)
    expect(practiceSvc.shCorrectAnswer).toHaveBeenCalledWith(true)

    component.itemSelectedList = null as any
    component.checkAns(1)
    expect(snackBar.open).toHaveBeenCalledWith('Please give your answer before showing the answer', '', expect.objectContaining({
      panelClass: ['show-answer-alert-class'],
    }))
  })

  it('uses desktop snackbar config and handles empty selected list', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1400 })
    component.itemSelectedList = []
    expect(component.selectedList).toEqual([])
    component.itemSelectedList = null as any
    component.checkAns(1)
    expect(snackBar.open).toHaveBeenCalledWith('Please give your answer before showing the answer', '', expect.objectContaining({
      duration: 5000,
    }))
  })
})
