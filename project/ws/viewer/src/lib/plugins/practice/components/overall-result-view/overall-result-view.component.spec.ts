/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { OverallResultViewComponent } from './overall-result-view.component'
import { NsContent } from '@sunbird-cb/utils-v2'

describe('OverallResultViewComponent', () => {
  let component: OverallResultViewComponent
  let mockTranslateService: any

  const mockResultsDataV7 = {
    pass: true,
    totalPercentage: 85.5,
    totalSectionMarks: 85.5,
    totalMarks: 100,
    correct: 17,
    incorrect: 3,
    blank: 0,
    total: 20,
    timeTakenForAssessment: 3600000,
    children: [
      {
        identifier: 'section1',
        name: 'Section A',
        pass: true,
        result: 90,
        passPercentage: 70,
      },
      {
        identifier: 'section2',
        name: 'Section B',
        pass: false,
        result: 60,
        passPercentage: 70,
      },
    ],
  }

  const mockResultsDataV4 = {
    pass: false,
    overallResult: 65.5,
    passPercentage: 70,
    correct: 13,
    incorrect: 7,
    blank: 0,
    total: 20,
    totalSectionMarks: 65.5,
    totalMarks: 100,
    timeTakenForAssessment: 7200000,
    children: [
      {
        identifier: 'section1',
        pass: false,
        result: 65,
        passPercentage: 70,
      },
    ],
  }

  const mockV4QuestionSet = {
    children: [
      {
        identifier: 'section1',
        name: 'V4 Section Name',
      },
    ],
  }

  const mockPracticeData = {
    pass: true,
    totalPercentage: 90,
    totalSectionMarks: 18,
    totalMarks: 20,
    correct: 18,
    incorrect: 2,
    blank: 0,
    total: 20,
    primaryCategory: NsContent.EPrimaryCategory.PRACTICE_RESOURCE,
    children: [],
  }

  beforeEach(() => {
    // Mock TranslateService
    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    } as any

    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key: string) => {
      if (key === 'websiteLanguage') return 'en'
      return null
    })

    component = new OverallResultViewComponent(mockTranslateService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create the component', () => {
      expect(component).toBeDefined()
    })

    it('should set default language and use stored language', () => {
      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslateService.use).toHaveBeenCalledWith('en')
    })
  })

  describe('ngOnInit', () => {
    it('should call computeUIData', () => {
      const computeSpy = jest.spyOn(component, 'computeUIData')

      component.ngOnInit()

      expect(computeSpy).toHaveBeenCalled()
    })
  })

  describe('ngOnChanges', () => {
    it('should reset and recompute when resultsData changes', () => {
      const resetSpy = jest.spyOn(component, 'resetValues')
      const computeSpy = jest.spyOn(component, 'computeUIData')
      const changes = {
        resultsData: {
          currentValue: mockResultsDataV7,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      }

      component.ngOnChanges(changes)

      expect(resetSpy).toHaveBeenCalled()
      expect(computeSpy).toHaveBeenCalled()
    })

    it('should not reset when resultsData has no current value', () => {
      const resetSpy = jest.spyOn(component, 'resetValues')
      const changes = {
        resultsData: {
          currentValue: null,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      }

      component.ngOnChanges(changes)

      expect(resetSpy).not.toHaveBeenCalled()
    })
  })

  describe('resetValues', () => {
    it('should reset all component values to defaults', () => {
      component.isPassed = true
      component.overallScorePercent = 85.5
      component.marksObtainedText = 'test'
      component.requiredPassPercent = 70
      component.sectionTableData = [{ sectionName: 'test' } as any]
      component.failureInfo = { percentageMore: 5, additionalMarks: 10 }
      component.isDataLoaded = true

      component.resetValues()

      expect(component.isPassed).toBe(false)
      expect(component.overallScorePercent).toBeNull()
      expect(component.marksObtainedText).toBe('')
      expect(component.requiredPassPercent).toBeNull()
      expect(component.sectionTableData).toEqual([])
      expect(component.failureInfo).toBeNull()
      expect(component.isDataLoaded).toBe(false)
    })
  })

  describe('computeUIData', () => {
    it('should return early when resultsData is null', () => {
      component.resultsData = null

      component.computeUIData()

      expect(component.isDataLoaded).toBe(false)
    })

    it('should compute UI data for V7 assessment', () => {
      component.resultsData = mockResultsDataV7
      component.selectedAssessmentCompatibilityLevel = 7
      const computeSummarySpy = jest.spyOn(component, 'computeSummaryCards')
      const computeSectionSpy = jest.spyOn(component, 'computeSectionTableData')
      const computeFailureSpy = jest.spyOn(component, 'computeFailureInfo')

      component.computeUIData()

      expect(component.isPassed).toBe(true)
      expect(component.overallScorePercent).toBe(85.5)
      expect(component.marksObtainedText).toBe('85.5 out of 100 marks')
      expect(component.requiredPassPercent).toBeNull()
      expect(component.isDataLoaded).toBe(true)
      expect(computeSummarySpy).toHaveBeenCalled()
      expect(computeSectionSpy).toHaveBeenCalled()
      expect(computeFailureSpy).toHaveBeenCalled()
    })

    it('should compute UI data for V4 assessment', () => {
      component.resultsData = mockResultsDataV4
      component.selectedAssessmentCompatibilityLevel = 5
      jest.spyOn(component, 'computeSummaryCards').mockImplementation()
      jest.spyOn(component, 'computeSectionTableData').mockImplementation()
      jest.spyOn(component, 'computeFailureInfo').mockImplementation()

      component.computeUIData()

      expect(component.isPassed).toBe(false)
      expect(component.overallScorePercent).toBe(65.5)
      expect(component.requiredPassPercent).toBe(70)
      expect(component.isDataLoaded).toBe(true)
    })

    it('should identify practice assessment', () => {
      component.resultsData = mockPracticeData
      component.selectedAssessmentCompatibilityLevel = 7
      jest.spyOn(component, 'computeSummaryCards').mockImplementation()
      jest.spyOn(component, 'computeSectionTableData').mockImplementation()
      jest.spyOn(component, 'computeFailureInfo').mockImplementation()

      component.computeUIData()

      expect(component.isPracticeAssessment).toBe(true)
    })
  })

  describe('computeSummaryCards', () => {
    it('should compute summary cards with all metrics for V7', () => {
      component.resultsData = mockResultsDataV7
      component.selectedAssessmentCompatibilityLevel = 7
      component.isPracticeAssessment = false
      const millisecondsToHMSSpy = jest.spyOn(component, 'millisecondsToHMS')

      component.computeSummaryCards()

      expect(component.summaryCards.length).toBeGreaterThan(0)
      expect(millisecondsToHMSSpy).toHaveBeenCalled()
      const scoreCard = component.summaryCards.find(c => c.summaryType === 'quizresult.score')
      expect(scoreCard).toBeDefined()
    })

    it('should compute summary cards without score for practice assessment', () => {
      component.resultsData = mockPracticeData
      component.isPracticeAssessment = true

      component.computeSummaryCards()

      const scoreCard = component.summaryCards.find(c => c.summaryType === 'quizresult.score')
      expect(scoreCard).toBeUndefined()
    })

    it('should include correct answers card', () => {
      component.resultsData = mockResultsDataV7

      component.computeSummaryCards()

      const correctCard = component.summaryCards.find(c => c.summaryType === 'quizresult.correct')
      expect(correctCard).toBeDefined()
      expect(correctCard.summary).toContain('17')
    })

    it('should include attempted card', () => {
      component.resultsData = mockResultsDataV7

      component.computeSummaryCards()

      const attemptedCard = component.summaryCards.find(c => c.summaryType === 'quizresult.attempted')
      expect(attemptedCard).toBeDefined()
    })

    it('should include wrong answers card', () => {
      component.resultsData = mockResultsDataV7

      component.computeSummaryCards()

      const wrongCard = component.summaryCards.find(c => c.summaryType === 'quizresult.wrong')
      expect(wrongCard).toBeDefined()
      expect(wrongCard.summary).toBe('3')
    })

    it('should handle missing time taken', () => {
      component.resultsData = { ...mockResultsDataV7, timeTakenForAssessment: null }
      component.isPracticeAssessment = false

      component.computeSummaryCards()

      const timeCard = component.summaryCards.find(c => c.summaryType === 'quizresult.timeTaken')
      expect(timeCard).toBeUndefined()
    })
  })

  describe('millisecondsToHMS', () => {
    it('should convert milliseconds to HH:MM:SS format', () => {
      const result = component.millisecondsToHMS(3661000) // 1 hour, 1 minute, 1 second

      expect(result).toBe('01:01:01')
    })

    it('should handle zero milliseconds', () => {
      const result = component.millisecondsToHMS(0)

      expect(result).toBe('00:00:00')
    })

    it('should handle hours, minutes, and seconds', () => {
      const result = component.millisecondsToHMS(7200000) // 2 hours

      expect(result).toBe('02:00:00')
    })

    it('should pad single digits with zero', () => {
      const result = component.millisecondsToHMS(3661000)

      expect(result).toBe('01:01:01')
    })
  })

  describe('sanitizeNumber', () => {
    it('should return 0 for null', () => {
      const result = component['sanitizeNumber'](null)

      expect(result).toBe(0)
    })

    it('should return 0 for undefined', () => {
      const result = component['sanitizeNumber'](undefined)

      expect(result).toBe(0)
    })

    it('should return 0 for NaN', () => {
      const result = component['sanitizeNumber']('invalid')

      expect(result).toBe(0)
    })

    it('should return number for valid input', () => {
      const result = component['sanitizeNumber'](42)

      expect(result).toBe(42)
    })

    it('should convert string numbers', () => {
      const result = component['sanitizeNumber']('42.5')

      expect(result).toBe(42.5)
    })
  })

  describe('computeSectionTableData', () => {
    it('should compute section table data with names', () => {
      component.resultsData = mockResultsDataV7
      component.selectedAssessmentCompatibilityLevel = 7
      component.requiredPassPercent = 70

      component.computeSectionTableData()

      expect(component.sectionTableData.length).toBe(2)
      expect(component.sectionTableData[0].sectionName).toBe('Section A')
      expect(component.sectionTableData[0].result).toBe('PASSED')
      expect(component.sectionTableData[0].yourScore).toBe(90)
      expect(component.sectionTableData[1].result).toBe('FAILED')
    })

    it('should use V4 question set names for V4 assessments', () => {
      component.resultsData = mockResultsDataV4
      component.v4questionSet = mockV4QuestionSet
      component.selectedAssessmentCompatibilityLevel = 5
      component.requiredPassPercent = 70

      component.computeSectionTableData()

      expect(component.sectionTableData[0].sectionName).toBe('V4 Section Name')
    })

    it('should generate default section names when not provided', () => {
      component.resultsData = {
        children: [
          { identifier: 'sec1', pass: true, result: 80 },
          { identifier: 'sec2', pass: false, result: 60 },
        ],
      }
      component.selectedAssessmentCompatibilityLevel = 7
      component.requiredPassPercent = 70

      component.computeSectionTableData()

      expect(component.sectionTableData[0].sectionName).toBe('Section A')
      expect(component.sectionTableData[1].sectionName).toBe('Section B')
    })

    it('should handle empty children array', () => {
      component.resultsData = { children: [] }
      component.selectedAssessmentCompatibilityLevel = 7

      component.computeSectionTableData()

      expect(component.sectionTableData).toEqual([])
    })
  })

  describe('computeFailureInfo', () => {
    it('should return null when assessment is passed', () => {
      component.isPassed = true
      component.resultsData = mockResultsDataV7

      component.computeFailureInfo()

      expect(component.failureInfo).toBeNull()
    })

    it('should compute failure info when assessment is failed', () => {
      component.isPassed = false
      component.resultsData = mockResultsDataV4
      component.overallScorePercent = 65.5
      component.requiredPassPercent = 70

      component.computeFailureInfo()

      expect(component.failureInfo).not.toBeNull()
      expect(component.failureInfo?.percentageMore).toBeGreaterThan(0)
      expect(component.failureInfo?.additionalMarks).toBeGreaterThan(0)
    })

    it('should return null when required data is missing', () => {
      component.isPassed = false
      component.resultsData = { totalMarks: null, totalSectionMarks: null }
      component.requiredPassPercent = null
      component.overallScorePercent = null

      component.computeFailureInfo()

      expect(component.failureInfo).toBeNull()
    })

    it('should handle edge case where marks are exactly at pass threshold', () => {
      component.isPassed = false
      component.resultsData = { totalMarks: 100, totalSectionMarks: 70 }
      component.overallScorePercent = 70
      component.requiredPassPercent = 70

      component.computeFailureInfo()

      expect(component.failureInfo?.percentageMore).toBe(0)
      expect(component.failureInfo?.additionalMarks).toBe(0)
    })

    it('should calculate additional marks needed correctly', () => {
      component.isPassed = false
      component.resultsData = { totalMarks: 100, totalSectionMarks: 60 }
      component.overallScorePercent = 60
      component.requiredPassPercent = 70

      component.computeFailureInfo()

      expect(component.failureInfo?.percentageMore).toBe(10)
      expect(component.failureInfo?.additionalMarks).toBe(10)
    })
  })

  describe('onViewQuestions', () => {
    it('should emit viewQuestions event with raw section data', () => {
      const section: any = {
        sectionName: 'Section A',
        result: 'PASSED',
        yourScore: 90,
        requiredScore: 70,
        rawSectionData: { identifier: 'section1', pass: true },
      }
      const emitSpy = jest.spyOn(component.viewQuestions, 'emit')

      component.onViewQuestions(section)

      expect(emitSpy).toHaveBeenCalledWith(section.rawSectionData)
    })
  })

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const nextSpy = jest.spyOn(component.destroy$, 'next')
      const completeSpy = jest.spyOn(component.destroy$, 'complete')

      component.ngOnDestroy()

      expect(nextSpy).toHaveBeenCalled()
      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle resultsData with missing properties', () => {
      component.resultsData = {}
      component.selectedAssessmentCompatibilityLevel = 7

      component.computeUIData()

      expect(component.isPassed).toBe(false)
      expect(component.isDataLoaded).toBe(true)
    })

    it('should handle invalid number formats', () => {
      component.resultsData = {
        totalPercentage: 'invalid',
        totalSectionMarks: 'invalid',
        totalMarks: 'invalid',
      }
      component.selectedAssessmentCompatibilityLevel = 7
      jest.spyOn(component, 'computeSummaryCards').mockImplementation()
      jest.spyOn(component, 'computeSectionTableData').mockImplementation()
      jest.spyOn(component, 'computeFailureInfo').mockImplementation()

      component.computeUIData()

      expect(component.overallScorePercent).toBe(0)
    })

    it('should handle sections with missing pass property', () => {
      component.resultsData = {
        children: [{ identifier: 'sec1', result: 80 }],
      }
      component.selectedAssessmentCompatibilityLevel = 7

      component.computeSectionTableData()

      expect(component.sectionTableData[0].result).toBe('FAILED')
    })
  })

  describe('Input/Output properties', () => {
    it('should have default values for inputs', () => {
      expect(component.selectedAssessmentCompatibilityLevel).toBe(1)
      expect(component.hideSectionTable).toBe(false)
    })

    it('should accept resultsData input', () => {
      component.resultsData = mockResultsDataV7

      expect(component.resultsData).toEqual(mockResultsDataV7)
    })

    it('should accept v4questionSet input', () => {
      component.v4questionSet = mockV4QuestionSet

      expect(component.v4questionSet).toEqual(mockV4QuestionSet)
    })
  })

  describe('displayedColumns', () => {
    it('should have correct column definitions', () => {
      expect(component.displayedColumns).toEqual([
        'sectionName',
        'result',
        'yourScore',
        'requiredScore',
        'actions',
      ])
    })
  })
})
