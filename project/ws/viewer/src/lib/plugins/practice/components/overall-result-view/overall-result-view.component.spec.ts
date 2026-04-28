import { OverallResultViewComponent } from './overall-result-view.component'

describe('OverallResultViewComponent', () => {
  let component: OverallResultViewComponent
  let translate: any

  beforeEach(() => {
    localStorage.clear()
    translate = { setDefaultLang: jest.fn(), use: jest.fn() }
    component = new OverallResultViewComponent(translate)
  })

  it('computes v7 result UI data and emits section questions', () => {
    const emit = jest.spyOn(component.viewQuestions, 'emit')
    component.selectedAssessmentCompatibilityLevel = 7
    component.resultsData = {
      pass: false,
      totalPercentage: '70.234',
      totalSectionMarks: '14',
      totalMarks: '20',
      correct: 7,
      incorrect: 2,
      blank: 1,
      total: 10,
      timeTakenForAssessment: 3661000,
      children: [{ name: 'Section A', pass: true, result: 80, passPercentage: 50 }],
    }

    component.ngOnInit()
    component.onViewQuestions(component.sectionTableData[0])

    expect(component.isPassed).toBe(false)
    expect(component.overallScorePercent).toBe(70.23)
    expect(component.requiredPassPercent).toBeNull()
    expect(component.marksObtainedText).toBe('14 out of 20 marks')
    expect(component.summaryCards).toHaveLength(5)
    expect(component.sectionTableData[0]).toMatchObject({ sectionName: 'Section A', result: 'PASSED', yourScore: 80 })
    expect(component.failureInfo).toBeNull()
    expect(emit).toHaveBeenCalledWith(component.resultsData.children[0])
  })

  it('computes legacy failed result, section fallback names and failure info', () => {
    component.selectedAssessmentCompatibilityLevel = 2
    component.v4questionSet = { children: [{ identifier: 's1', name: 'Basics' }] }
    component.resultsData = {
      pass: false,
      overallResult: 40.456,
      passPercentage: 60,
      totalSectionMarks: 4,
      totalMarks: 10,
      correct: 2,
      incorrect: 3,
      blank: 5,
      children: [{ identifier: 's1', pass: false, result: '40' }, { identifier: 's2', pass: false, result: null }],
    }

    component.computeUIData()

    expect(component.requiredPassPercent).toBe(60)
    expect(component.overallScorePercent).toBe(40.46)
    expect(component.failureInfo).toEqual({ percentageMore: 19.54, additionalMarks: 2 })
    expect(component.sectionTableData[0].sectionName).toBe('Basics')
    expect(component.sectionTableData[1].sectionName).toBe('Section B')
  })

  it('resets, reacts to changes, handles empty data and cleanup', () => {
    component.resultsData = null
    component.computeUIData()
    expect(component.isDataLoaded).toBe(false)

    component.resultsData = { pass: true, overallResult: 'bad', passPercentage: undefined, children: [] }
    component.ngOnChanges({ resultsData: { currentValue: component.resultsData } } as any)
    expect(component.isPassed).toBe(true)
    expect(component.overallScorePercent).toBe(0)
    expect(component.failureInfo).toBeNull()

    component.resetValues()
    expect(component.isDataLoaded).toBe(false)
    expect(component.sectionTableData).toEqual([])
    expect(component.millisecondsToHMS(3661000)).toBe('01:01:01')

    const next = jest.spyOn(component.destroy$, 'next')
    const complete = jest.spyOn(component.destroy$, 'complete')
    component.ngOnDestroy()
    expect(next).toHaveBeenCalled()
    expect(complete).toHaveBeenCalled()
  })

  it('uses saved website language', () => {
    localStorage.setItem('websiteLanguage', 'hi')
    const translated = new OverallResultViewComponent(translate)
    expect(translated).toBeTruthy()
    expect(translate.setDefaultLang).toHaveBeenCalledWith('en')
    expect(translate.use).toHaveBeenCalledWith('hi')
  })
})
