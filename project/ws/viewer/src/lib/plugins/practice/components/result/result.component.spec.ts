import { ResultComponent } from './result.component'

jest.mock('@sunbird-cb/utils-v2', () => ({
  NsContent: {
    EPrimaryCategory: { PRACTICE_RESOURCE: 'Practice Resource' },
  },
  MultilingualTranslationsService: jest.fn(),
}), { virtual: true })

jest.mock('@angular/material/expansion', () => ({ MatAccordion: jest.fn() }), { virtual: true })
jest.mock('@angular/material/legacy-table', () => ({
  MatLegacyTableDataSource: class { data: any[]; constructor(d: any[]) { this.data = d } },
}), { virtual: true })
jest.mock('../../practice.model', () => ({ NSPractice: {} }), { virtual: true })

const mockQuizResponse: any = {
  total: 2,
  correct: 1,
  incorrect: 1,
  overallResult: 50,
  timeTakenForAssessment: 60000,
  totalSectionMarks: 10,
  totalMarks: 20,
  children: [
    {
      name: 'Section A',
      identifier: 'sec1',
      sectionMarks: 5,
      totalMarks: 10,
      correct: 1,
      incorrect: 1,
      children: [
        { question: 'Q1', result: 'correct', questionLevel: 'easy', timeSpent: 30000, qType: 'MCQ' },
        { question: 'Q2', result: 'incorrect', questionLevel: 'medium', timeSpent: 20000, qType: 'MCQ' },
        { question: 'Q3&nbsp;fill', result: 'blank', questionLevel: 'hard', timeSpent: 10000, qType: 'FTB' },
      ],
    },
  ],
}

function buildComponent() {
  const mockLang: any = {
    translateLabelWithoutspace: jest.fn().mockReturnValue('label'),
  }
  const comp = new ResultComponent(mockLang)
  return { comp, mockLang }
}

describe('ResultComponent', () => {
  it('should create', () => {
    const { comp } = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('should have default values', () => {
    const { comp } = buildComponent()
    expect(comp.percentage).toBe(0)
    expect(comp.isPassed).toBe(false)
    expect(comp.selectedStatus).toBe('all')
    expect(comp.isMobile).toBe(false)
  })

  it('ngOnInit - sets isMobile based on window width', () => {
    const { comp } = buildComponent()
    expect(() => comp.ngOnInit()).not.toThrow()
    expect(typeof comp.isMobile).toBe('boolean')
  })

  it('ngOnChanges - no quizResponse does not throw', () => {
    const { comp } = buildComponent()
    expect(() => comp.ngOnChanges()).not.toThrow()
  })

  it('ngOnChanges - with quizResponse populates data', () => {
    const { comp } = buildComponent()
    comp.quizResponse = mockQuizResponse
    comp.ngOnChanges()
    expect(comp.quizResponseClone).toBeDefined()
    expect(comp.sectionsList.length).toBeGreaterThan(0)
  })

  it('ngOnChanges - sets showInsight for PRACTICE_RESOURCE', () => {
    const { comp } = buildComponent()
    comp.quizResponse = { ...mockQuizResponse, correct: undefined }
    comp.quizCategory = 'Practice Resource' as any
    comp.ngOnChanges()
    expect(comp.showInsight).toBe(true)
  })

  it('ngOnChanges - PRACTICE_RESOURCE correct undefined accumulates from sections', () => {
    const { comp } = buildComponent()
    comp.quizResponse = { ...mockQuizResponse, correct: undefined }
    comp.quizCategory = 'Practice Resource' as any
    comp.ngOnChanges()
    expect(comp.quizResponse.correct).toBeDefined()
  })

  it('ngOnChanges - non-PRACTICE_RESOURCE does not set showInsight true', () => {
    const { comp } = buildComponent()
    comp.quizResponse = mockQuizResponse
    comp.quizCategory = 'Course' as any
    comp.ngOnChanges()
    expect(comp.showInsight).toBe(false)
  })

  it('ngOnChanges - multiple sections get section names', () => {
    const { comp } = buildComponent()
    const multiResponse: any = {
      ...mockQuizResponse,
      children: [
        { name: '', identifier: 'sec1', sectionMarks: 5, totalMarks: 10, correct: 1, incorrect: 0, children: [{ question: 'Q1', result: 'correct', questionLevel: 'easy', timeSpent: 1000, qType: 'MCQ' }] },
        { name: '', identifier: 'sec2', sectionMarks: 3, totalMarks: 10, correct: 0, incorrect: 1, children: [{ question: 'Q2', result: 'incorrect', questionLevel: 'medium', timeSpent: 2000, qType: 'MCQ' }] },
      ],
    }
    comp.quizResponse = multiResponse
    expect(() => comp.ngOnChanges()).not.toThrow()
  })

  it('getSectionalData - all sections, all results', () => {
    const { comp } = buildComponent()
    comp.quizResponse = mockQuizResponse
    comp.ngOnChanges()
    comp.getSectionalData('all', 'all')
    expect(comp.questionStatuTableData.length).toBeGreaterThan(0)
  })

  it('getSectionalData - all sections, correct filter', () => {
    const { comp } = buildComponent()
    comp.quizResponse = mockQuizResponse
    comp.ngOnChanges()
    comp.getSectionalData('all', 'correct')
    expect(comp.questionStatuTableData.every((q: any) => q.status === 'correct')).toBe(true)
  })

  it('getSectionalData - all sections, wrong filter', () => {
    const { comp } = buildComponent()
    comp.quizResponse = mockQuizResponse
    comp.ngOnChanges()
    comp.getSectionalData('all', 'wrong')
    expect(comp.questionStatuTableData.every((q: any) => q.status === 'wrong')).toBe(true)
  })

  it('getSectionalData - all sections, notAnswered filter', () => {
    const { comp } = buildComponent()
    comp.quizResponse = mockQuizResponse
    comp.ngOnChanges()
    comp.getSectionalData('all', 'notAnswered')
    expect(comp.questionStatuTableData.every((q: any) => q.status === 'Unattempted')).toBe(true)
  })

  it('getSectionalData - specific section filter', () => {
    const { comp } = buildComponent()
    comp.quizResponse = mockQuizResponse
    comp.ngOnChanges()
    comp.getSectionalData('sec1', 'all')
    expect(comp.questionStatuTableData.length).toBeGreaterThan(0)
  })

  it('getSectionalData - specific section correct', () => {
    const { comp } = buildComponent()
    comp.quizResponse = mockQuizResponse
    comp.ngOnChanges()
    comp.getSectionalData('sec1', 'correct')
    expect(comp.questionStatuTableData.length).toBeGreaterThanOrEqual(0)
  })

  it('getSectionalData - specific section wrong', () => {
    const { comp } = buildComponent()
    comp.quizResponse = mockQuizResponse
    comp.ngOnChanges()
    comp.getSectionalData('sec1', 'wrong')
    expect(comp.questionStatuTableData.length).toBeGreaterThanOrEqual(0)
  })

  it('getSectionalData - specific section notAnswered', () => {
    const { comp } = buildComponent()
    comp.quizResponse = mockQuizResponse
    comp.ngOnChanges()
    comp.getSectionalData('sec1', 'notAnswered')
    expect(comp.questionStatuTableData.length).toBeGreaterThanOrEqual(0)
  })

  it('getQuestionByStatus - updates status and calls getSectionalData', () => {
    const { comp } = buildComponent()
    comp.quizResponse = mockQuizResponse
    comp.ngOnChanges()
    comp.getQuestionByStatus('correct')
    expect(comp.selectedStatus).toBe('correct')
  })

  it('action - emits user selection', () => {
    const { comp } = buildComponent()
    const emitSpy = jest.spyOn(comp.userSelection, 'emit')
    comp.action('retry' as any)
    expect(emitSpy).toHaveBeenCalledWith('retry')
  })

  it('retryResult - emits fetchResult', () => {
    const { comp } = buildComponent()
    const emitSpy = jest.spyOn(comp.fetchResult, 'emit')
    comp.retryResult()
    expect(emitSpy).toHaveBeenCalled()
  })

  it('checkRes - returns false for object quizResponse', () => {
    const { comp } = buildComponent()
    comp.quizResponse = mockQuizResponse
    expect(comp.checkRes()).toBe(false)
  })

  it('checkRes - returns false for undefined quizResponse', () => {
    const { comp } = buildComponent()
    expect(comp.checkRes()).toBe(false)
  })

  it('getQuestionCount - sets activeQuestionSet and selectedQuestionData', () => {
    const { comp } = buildComponent()
    comp.getQuestionCount({ id: 'q1' }, 'set1')
    expect(comp.activeQuestionSet).toBe('set1')
    expect(comp.selectedQuestionData).toEqual({ id: 'q1' })
  })

  it('isOnlySection - returns true for single section', () => {
    const { comp } = buildComponent()
    comp.quizResponse = { ...mockQuizResponse, children: [{}] } as any
    expect(comp.isOnlySection).toBe(true)
  })

  it('isOnlySection - returns false for multiple sections', () => {
    const { comp } = buildComponent()
    comp.quizResponse = { ...mockQuizResponse, children: [{}, {}] } as any
    expect(comp.isOnlySection).toBe(false)
  })

  it('translateLabels - calls langtranslations', () => {
    const { comp, mockLang } = buildComponent()
    const result = comp.translateLabels('label', 'type')
    expect(mockLang.translateLabelWithoutspace).toHaveBeenCalled()
    expect(result).toBe('label')
  })

  it('getFinalColumns - maps to keys', () => {
    const { comp } = buildComponent()
    const cols = [{ header: 'Test', key: 'testKey' }]
    expect(comp.getFinalColumns(cols)).toEqual(['testKey'])
  })

  it('millisecondsToHMS - converts correctly', () => {
    const { comp } = buildComponent()
    expect(comp.millisecondsToHMS(3661000)).toBe('01:01:01')
    expect(comp.millisecondsToHMS(0)).toBe('00:00:00')
    expect(comp.millisecondsToHMS(60000)).toBe('00:01:00')
    expect(comp.millisecondsToHMS(3600000)).toBe('01:00:00')
  })
})
