import { CaResultsViewComponent } from './ca-results-view.component'

jest.mock('@sunbird-cb/utils-v2', () => ({
  NsContent: {
    EPrimaryCategory: {
      PRACTICE_RESOURCE: 'Practice Resource',
      FINAL_ASSESSMENT: 'Final Assessment',
    },
  },
}))

function buildComponent() {
  const mockToggleService: any = { someMethod: jest.fn() }
  const comp = new CaResultsViewComponent(mockToggleService)
  return { comp, mockToggleService }
}

describe('CaResultsViewComponent', () => {
  it('should create', () => {
    const { comp } = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('should have default state values', () => {
    const { comp } = buildComponent()
    expect(comp.showOverallView).toBe(true)
    expect(comp.selectedSection).toBeNull()
    expect(comp.isSingleSection).toBe(false)
    expect(comp.isPracticeAssessment).toBe(false)
  })

  it('ngOnInit should not throw', () => {
    const { comp } = buildComponent()
    expect(() => comp.ngOnInit()).not.toThrow()
  })

  it('ngOnChanges - single section results sets isSingleSection true and selectedSection', () => {
    const { comp } = buildComponent()
    const section = { sectionId: 's1', title: 'Section 1' }
    comp.results = { children: [section], primaryCategory: 'Practice Resource' }
    comp.ngOnChanges()
    expect(comp.isSingleSection).toBe(true)
    expect(comp.selectedSection).toBe(section)
    expect(comp.showOverallView).toBe(true)
  })

  it('ngOnChanges - multiple sections sets isSingleSection false', () => {
    const { comp } = buildComponent()
    comp.results = {
      children: [{ sectionId: 's1' }, { sectionId: 's2' }],
      primaryCategory: 'Final Assessment',
    }
    comp.ngOnChanges()
    expect(comp.isSingleSection).toBe(false)
    expect(comp.selectedSection).toBeNull()
  })

  it('ngOnChanges - empty children', () => {
    const { comp } = buildComponent()
    comp.results = { children: [], primaryCategory: 'Final Assessment' }
    comp.ngOnChanges()
    expect(comp.isSingleSection).toBe(false)
  })

  it('ngOnChanges - no children property', () => {
    const { comp } = buildComponent()
    comp.results = { primaryCategory: 'Practice Resource' }
    comp.ngOnChanges()
    expect(comp.isSingleSection).toBe(false)
  })

  it('ngOnChanges - sets isPracticeAssessment true for practice resource', () => {
    const { comp } = buildComponent()
    comp.results = { children: [], primaryCategory: 'Practice Resource' }
    comp.ngOnChanges()
    expect(comp.isPracticeAssessment).toBe(true)
  })

  it('ngOnChanges - sets isPracticeAssessment false for non-practice', () => {
    const { comp } = buildComponent()
    comp.results = { children: [], primaryCategory: 'Course' }
    comp.ngOnChanges()
    expect(comp.isPracticeAssessment).toBe(false)
  })

  it('onViewQuestions sets selectedSection and showOverallView false', () => {
    const { comp } = buildComponent()
    const section: any = { sectionId: 'sec1' }
    comp.onViewQuestions(section)
    expect(comp.selectedSection).toBe(section)
    expect(comp.showOverallView).toBe(false)
  })

  it('onBackFromSection resets selectedSection and shows overall view', () => {
    const { comp } = buildComponent()
    comp.selectedSection = { sectionId: 'sec1' } as any
    comp.showOverallView = false
    comp.onBackFromSection()
    expect(comp.selectedSection).toBeNull()
    expect(comp.showOverallView).toBe(true)
  })

  it('retakeTest emits retake event', () => {
    const { comp } = buildComponent()
    const emitSpy = jest.spyOn(comp.userSelection, 'emit')
    comp.retakeTest()
    expect(emitSpy).toHaveBeenCalledWith('retake')
  })

  it('ngOnDestroy should complete destroy$ subject', () => {
    const { comp } = buildComponent()
    const nextSpy = jest.spyOn(comp.destroy$, 'next')
    const completeSpy = jest.spyOn(comp.destroy$, 'complete')
    comp.ngOnDestroy()
    expect(nextSpy).toHaveBeenCalled()
    expect(completeSpy).toHaveBeenCalled()
  })

  it('should store viewerHeaderSideBarToggleService', () => {
    const { comp, mockToggleService } = buildComponent()
    expect(comp.viewerHeaderSideBarToggleService).toBe(mockToggleService)
  })
})
