/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { SectionResultsViewComponent } from './section-results-view.component'
import { NSPractice } from '../../practice.model'

describe('SectionResultsViewComponent', () => {
  let component: SectionResultsViewComponent

  const mockSectionData: NSPractice.IQuizSubmitResSec = {
    sectionId: 'section-1',
    sectionName: 'Section 1',
    children: [
      {
        identifier: 'q1',
        question: 'Question 1',
        result: 'correct',
        timeSpent: '45000', // 45 seconds in ms
        mimeType: 'application/vnd.sunbird.question',
        objectType: 'Question',
        primaryCategory: 'Multiple Choice Question',
        qType: 'mcq',
        questionLevel: 'EASY',
      },
      {
        identifier: 'q2',
        question: 'Question 2',
        result: 'incorrect',
        timeSpent: '120000', // 2 minutes in ms
        mimeType: 'application/vnd.sunbird.question',
        objectType: 'Question',
        primaryCategory: 'Multiple Choice Question',
        qType: 'mcq',
        questionLevel: 'MEDIUM',
      },
      {
        identifier: 'q3',
        question: 'Question 3',
        result: 'blank',
        timeSpent: '0',
        mimeType: 'application/vnd.sunbird.question',
        objectType: 'Question',
        primaryCategory: 'Multiple Choice Question',
        qType: 'mcq',
        questionLevel: 'HARD',
      },
      {
        identifier: 'q4',
        question: 'Question 4',
        result: 'Correct',
        timeSpent: '3660000', // 1 hour 1 minute in ms
        mimeType: 'application/vnd.sunbird.question',
        objectType: 'Question',
        primaryCategory: 'Multiple Choice Question',
        qType: 'mcq',
        questionLevel: 'EASY',
      },
      {
        identifier: 'q5',
        question: 'Question 5',
        result: 'INCORRECT',
        timeSpent: '00:30',
        mimeType: 'application/vnd.sunbird.question',
        objectType: 'Question',
        primaryCategory: 'Multiple Choice Question',
        qType: 'mcq',
        questionLevel: 'MEDIUM',
      },
    ],
  } as any

  beforeEach(() => {
    component = new SectionResultsViewComponent()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create the component', () => {
      expect(component).toBeDefined()
    })

    it('should initialize with default values', () => {
      expect(component.hideSectionHeader).toBe(false)
      expect(component.selectedAssessmentCompatibilityLevel).toBe(0)
      expect(component.allQuestions).toEqual([])
      expect(component.correctQuestions).toEqual([])
      expect(component.incorrectQuestions).toEqual([])
      expect(component.blankQuestions).toEqual([])
      expect(component.expandedRowsMap).toBeInstanceOf(Map)
      expect(component.expandedRowsMap.size).toBe(0)
    })
  })

  describe('ngOnInit', () => {
    it('should call initializeData', () => {
      const initSpy = jest.spyOn(component as any, 'initializeData')
      component.sectionData = mockSectionData

      component.ngOnInit()

      expect(initSpy).toHaveBeenCalled()
    })

    it('should populate question arrays', () => {
      component.sectionData = mockSectionData

      component.ngOnInit()

      expect(component.allQuestions.length).toBe(5)
      expect(component.correctQuestions.length).toBe(2)
      expect(component.incorrectQuestions.length).toBe(2)
      expect(component.blankQuestions.length).toBe(1)
    })
  })

  describe('normalizeResult', () => {
    it('should normalize "correct" to "Correct"', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: '0' }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].result).toBe('Correct')
    })

    it('should normalize "incorrect" to "Incorrect"', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'incorrect', timeSpent: '0' }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].result).toBe('Incorrect')
    })

    it('should normalize "blank" to "Unattempted"', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'blank', timeSpent: '0' }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].result).toBe('Unattempted')
    })

    it('should be case-insensitive', () => {
      component.sectionData = {
        children: [
          { identifier: 'q1', question: 'Q1', result: 'CORRECT', timeSpent: '0' },
          { identifier: 'q2', question: 'Q2', result: 'InCoRrEcT', timeSpent: '0' },
          { identifier: 'q3', question: 'Q3', result: 'BLANK', timeSpent: '0' },
        ],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].result).toBe('Correct')
      expect(component.allQuestions[1].result).toBe('Incorrect')
      expect(component.allQuestions[2].result).toBe('Unattempted')
    })

    it('should handle empty or undefined result', () => {
      component.sectionData = {
        children: [
          { identifier: 'q1', question: 'Q1', result: '', timeSpent: '0' },
          { identifier: 'q2', question: 'Q2', result: undefined, timeSpent: '0' },
        ],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].result).toBe('')
      expect(component.allQuestions[1].result).toBeUndefined()
    })

    it('should return unchanged for unknown result types', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'unknown', timeSpent: '0' }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].result).toBe('unknown')
    })
  })

  describe('initializeData', () => {
    it('should handle empty sectionData', () => {
      component.sectionData = null as any

      component.ngOnInit()

      expect(component.allQuestions).toEqual([])
      expect(component.correctQuestions).toEqual([])
      expect(component.incorrectQuestions).toEqual([])
      expect(component.blankQuestions).toEqual([])
    })

    it('should handle sectionData without children', () => {
      component.sectionData = { sectionId: 'section-1' } as any

      component.ngOnInit()

      expect(component.allQuestions).toEqual([])
      expect(component.correctQuestions).toEqual([])
      expect(component.incorrectQuestions).toEqual([])
      expect(component.blankQuestions).toEqual([])
    })

    it('should handle empty children array', () => {
      component.sectionData = { children: [] } as any

      component.ngOnInit()

      expect(component.allQuestions).toEqual([])
      expect(component.correctQuestions).toEqual([])
      expect(component.incorrectQuestions).toEqual([])
      expect(component.blankQuestions).toEqual([])
    })

    it('should handle non-array children', () => {
      component.sectionData = { children: 'not-an-array' } as any

      component.ngOnInit()

      expect(component.allQuestions).toEqual([])
    })

    it('should format time for each question', () => {
      component.sectionData = mockSectionData

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBeDefined()
      expect(component.allQuestions[1].formattedTime).toBeDefined()
    })

    it('should preserve original question data', () => {
      component.sectionData = mockSectionData

      component.ngOnInit()

      const question = component.allQuestions[0]
      expect(question.identifier).toBe('q1')
      expect(question.question).toBe('Question 1')
      expect(question.qType).toBe('mcq')
      expect(question.questionLevel).toBe('EASY')
    })

    it('should categorize questions correctly', () => {
      component.sectionData = mockSectionData

      component.ngOnInit()

      expect(component.correctQuestions.every(q => q.result === 'Correct')).toBe(true)
      expect(component.incorrectQuestions.every(q => q.result === 'Incorrect')).toBe(true)
      expect(component.blankQuestions.every(q => q.result === 'Unattempted')).toBe(true)
    })
  })

  describe('toggleRowExpansion', () => {
    it('should expand a collapsed row', () => {
      component.toggleRowExpansion('q1')

      expect(component.isRowExpanded('q1')).toBe(true)
    })

    it('should collapse an expanded row', () => {
      component.expandedRowsMap.set('q1', true)

      component.toggleRowExpansion('q1')

      expect(component.isRowExpanded('q1')).toBe(false)
    })

    it('should toggle multiple times', () => {
      component.toggleRowExpansion('q1')
      expect(component.isRowExpanded('q1')).toBe(true)

      component.toggleRowExpansion('q1')
      expect(component.isRowExpanded('q1')).toBe(false)

      component.toggleRowExpansion('q1')
      expect(component.isRowExpanded('q1')).toBe(true)
    })

    it('should handle different question ids independently', () => {
      component.toggleRowExpansion('q1')
      component.toggleRowExpansion('q2')

      expect(component.isRowExpanded('q1')).toBe(true)
      expect(component.isRowExpanded('q2')).toBe(true)
    })
  })

  describe('isRowExpanded', () => {
    it('should return false for untracked rows', () => {
      expect(component.isRowExpanded('unknown-id')).toBe(false)
    })

    it('should return true for expanded rows', () => {
      component.expandedRowsMap.set('q1', true)

      expect(component.isRowExpanded('q1')).toBe(true)
    })

    it('should return false for collapsed rows', () => {
      component.expandedRowsMap.set('q1', false)

      expect(component.isRowExpanded('q1')).toBe(false)
    })

    it('should handle empty string id', () => {
      expect(component.isRowExpanded('')).toBe(false)
    })
  })

  describe('formatTime', () => {
    it('should format time in seconds (less than 1 minute)', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: '45000' }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBe('45s')
    })

    it('should format time in minutes and seconds', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: '90000' }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBe('01:30')
    })

    it('should format time in hours, minutes, and seconds', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: '3661000' }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBe('01:01:01')
    })

    it('should handle zero time', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: '0' }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBe('1s')
    })

    it('should handle time as string number', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: '60000' }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBe('01:00')
    })

    it('should return as-is if time is already formatted (contains colon)', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: '01:30:45' }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBe('01:30:45')
    })

    it('should handle empty string timeSpent', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: '' }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBe('1s')
    })

    it('should pad zeros for single digit values', () => {
      component.sectionData = {
        children: [
          { identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: '65000' }, // 1:05
          { identifier: 'q2', question: 'Q2', result: 'correct', timeSpent: '3665000' }, // 1:01:05
        ],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBe('01:05')
      expect(component.allQuestions[1].formattedTime).toBe('01:01:05')
    })

    it('should not pad zeros for double digit values', () => {
      component.sectionData = {
        children: [
          { identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: '655000' }, // 10:55
          { identifier: 'q2', question: 'Q2', result: 'correct', timeSpent: '36655000' }, // 10:10:55
        ],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBe('10:55')
      expect(component.allQuestions[1].formattedTime).toBe('10:10:55')
    })

    it('should handle exactly 1 minute', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: '60000' }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBe('01:00')
    })

    it('should handle exactly 1 hour', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: '3600000' }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBe('01:00:00')
    })

    it('should handle very large durations', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: '36000000' }], // 10 hours
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBe('10:00:00')
    })
  })

  describe('padZero', () => {
    it('should pad single digit numbers', () => {
      const padZero = (component as any).padZero.bind(component)

      expect(padZero(0)).toBe('00')
      expect(padZero(5)).toBe('05')
      expect(padZero(9)).toBe('09')
    })

    it('should not pad double digit numbers', () => {
      const padZero = (component as any).padZero.bind(component)

      expect(padZero(10)).toBe('10')
      expect(padZero(59)).toBe('59')
      expect(padZero(99)).toBe('99')
    })
  })

  describe('goBack', () => {
    it('should emit back event', () => {
      const emitSpy = jest.spyOn(component.back, 'emit')

      component.goBack()

      expect(emitSpy).toHaveBeenCalled()
    })

    it('should emit without any arguments', () => {
      const emitSpy = jest.spyOn(component.back, 'emit')

      component.goBack()

      expect(emitSpy).toHaveBeenCalledWith()
    })

    it('should be callable multiple times', () => {
      const emitSpy = jest.spyOn(component.back, 'emit')

      component.goBack()
      component.goBack()
      component.goBack()

      expect(emitSpy).toHaveBeenCalledTimes(3)
    })
  })

  describe('input properties', () => {
    it('should accept hideSectionHeader input', () => {
      component.hideSectionHeader = true

      expect(component.hideSectionHeader).toBe(true)
    })

    it('should accept selectedAssessmentCompatibilityLevel input', () => {
      component.selectedAssessmentCompatibilityLevel = 5

      expect(component.selectedAssessmentCompatibilityLevel).toBe(5)
    })

    it('should accept sectionData input', () => {
      component.sectionData = mockSectionData

      expect(component.sectionData).toEqual(mockSectionData)
    })
  })

  describe('edge cases', () => {
    it('should handle undefined timeSpent', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: undefined }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBe('1s')
    })

    it('should handle null timeSpent', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: null }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBe('1s')
    })

    it('should handle negative timeSpent', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: '-5000' }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBe('1s')
    })

    it('should handle NaN timeSpent', () => {
      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: 'invalid' }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions[0].formattedTime).toBe('1s')
    })

    it('should handle questions without identifier', () => {
      component.sectionData = {
        children: [{ question: 'Q1', result: 'correct', timeSpent: '0' }],
      } as any

      component.ngOnInit()

      expect(component.allQuestions.length).toBe(1)
    })

    it('should handle mixed case results consistently', () => {
      component.sectionData = {
        children: [
          { identifier: 'q1', question: 'Q1', result: 'CoRrEcT', timeSpent: '0' },
          { identifier: 'q2', question: 'Q2', result: 'InCoRrEcT', timeSpent: '0' },
        ],
      } as any

      component.ngOnInit()

      expect(component.correctQuestions.length).toBe(1)
      expect(component.incorrectQuestions.length).toBe(1)
    })

    it('should handle reinitializing with different data', () => {
      component.sectionData = mockSectionData
      component.ngOnInit()

      const firstCount = component.allQuestions.length

      component.sectionData = {
        children: [{ identifier: 'q1', question: 'Q1', result: 'correct', timeSpent: '0' }],
      } as any
      component.ngOnInit()

      expect(component.allQuestions.length).not.toBe(firstCount)
      expect(component.allQuestions.length).toBe(1)
    })
  })
})
