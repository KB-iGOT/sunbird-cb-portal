/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { NonReleventFeedbackDialogComponent } from './non-relevent-feedback-dialog.component'

describe('NonReleventFeedbackDialogComponent', () => {
  let component: NonReleventFeedbackDialogComponent
  let mockMatDialogRef: any
  let mockTranslateService: any

  beforeEach(() => {
    mockMatDialogRef = {
      close: jest.fn(),
    }

    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    }

    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('constructor', () => {
    it('should create an instance', () => {
      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      expect(component).toBeTruthy()
    })

    it('should be defined', () => {
      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      expect(component).toBeDefined()
    })

    it('should initialize matDialogRef', () => {
      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      expect(component.matDialogRef).toBe(mockMatDialogRef)
    })

    it('should not call translate methods when websiteLanguage is not in localStorage', () => {
      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      expect(mockTranslateService.setDefaultLang).not.toHaveBeenCalled()
      expect(mockTranslateService.use).not.toHaveBeenCalled()
    })

    it('should call setDefaultLang with "en" when websiteLanguage exists', () => {
      localStorage.setItem('websiteLanguage', 'hi')

      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledTimes(1)
    })

    it('should call translate.use with language from localStorage', () => {
      localStorage.setItem('websiteLanguage', 'hi')

      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      expect(mockTranslateService.use).toHaveBeenCalledWith('hi')
      expect(mockTranslateService.use).toHaveBeenCalledTimes(1)
    })

    it('should handle English language from localStorage', () => {
      localStorage.setItem('websiteLanguage', 'en')

      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslateService.use).toHaveBeenCalledWith('en')
    })

    it('should handle Hindi language from localStorage', () => {
      localStorage.setItem('websiteLanguage', 'hi')

      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslateService.use).toHaveBeenCalledWith('hi')
    })

    it('should handle any custom language from localStorage', () => {
      localStorage.setItem('websiteLanguage', 'fr')

      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslateService.use).toHaveBeenCalledWith('fr')
    })

    it('should call both setDefaultLang and use in correct order', () => {
      localStorage.setItem('websiteLanguage', 'hi')

      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      const calls = [
        mockTranslateService.setDefaultLang.mock.invocationCallOrder[0],
        mockTranslateService.use.mock.invocationCallOrder[0],
      ]

      expect(calls[0]).toBeLessThan(calls[1])
    })
  })

  describe('saveFeedback', () => {
    beforeEach(() => {
      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )
    })

    it('should call matDialogRef.close with comment', () => {
      const comment = 'This content is not relevant'

      component.saveFeedback(comment)

      expect(mockMatDialogRef.close).toHaveBeenCalledWith(comment)
      expect(mockMatDialogRef.close).toHaveBeenCalledTimes(1)
    })

    it('should call matDialogRef.close with empty string', () => {
      const comment = ''

      component.saveFeedback(comment)

      expect(mockMatDialogRef.close).toHaveBeenCalledWith('')
      expect(mockMatDialogRef.close).toHaveBeenCalledTimes(1)
    })

    it('should call matDialogRef.close with long comment', () => {
      const comment = 'This is a very long comment that contains a lot of text about why the content is not relevant to my needs'

      component.saveFeedback(comment)

      expect(mockMatDialogRef.close).toHaveBeenCalledWith(comment)
    })

    it('should handle comment with special characters', () => {
      const comment = 'Comment with @#$%^&*() special characters'

      component.saveFeedback(comment)

      expect(mockMatDialogRef.close).toHaveBeenCalledWith(comment)
    })

    it('should handle comment with newlines', () => {
      const comment = 'First line\nSecond line\nThird line'

      component.saveFeedback(comment)

      expect(mockMatDialogRef.close).toHaveBeenCalledWith(comment)
    })

    it('should handle comment with HTML tags', () => {
      const comment = '<div>Comment with HTML</div>'

      component.saveFeedback(comment)

      expect(mockMatDialogRef.close).toHaveBeenCalledWith(comment)
    })

    it('should handle comment with unicode characters', () => {
      const comment = 'यह प्रासंगिक नहीं है'

      component.saveFeedback(comment)

      expect(mockMatDialogRef.close).toHaveBeenCalledWith(comment)
    })

    it('should handle comment with only spaces', () => {
      const comment = '     '

      component.saveFeedback(comment)

      expect(mockMatDialogRef.close).toHaveBeenCalledWith(comment)
    })

    it('should handle comment with tabs', () => {
      const comment = '\t\tComment with tabs'

      component.saveFeedback(comment)

      expect(mockMatDialogRef.close).toHaveBeenCalledWith(comment)
    })

    it('should handle null comment', () => {
      const comment = null as any

      component.saveFeedback(comment)

      expect(mockMatDialogRef.close).toHaveBeenCalledWith(null)
    })

    it('should handle undefined comment', () => {
      const comment = undefined as any

      component.saveFeedback(comment)

      expect(mockMatDialogRef.close).toHaveBeenCalledWith(undefined)
    })

    it('should be callable multiple times', () => {
      component.saveFeedback('First comment')
      component.saveFeedback('Second comment')

      expect(mockMatDialogRef.close).toHaveBeenCalledTimes(2)
      expect(mockMatDialogRef.close).toHaveBeenNthCalledWith(1, 'First comment')
      expect(mockMatDialogRef.close).toHaveBeenNthCalledWith(2, 'Second comment')
    })
  })

  describe('cancelFeedbackPopup', () => {
    beforeEach(() => {
      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )
    })

    it('should call matDialogRef.close without arguments', () => {
      component.cancelFeedbackPopup()

      expect(mockMatDialogRef.close).toHaveBeenCalledWith()
      expect(mockMatDialogRef.close).toHaveBeenCalledTimes(1)
    })

    it('should call matDialogRef.close with no parameters', () => {
      component.cancelFeedbackPopup()

      expect(mockMatDialogRef.close).toHaveBeenCalledWith()
      expect(mockMatDialogRef.close.mock.calls[0].length).toBe(0)
    })

    it('should be callable multiple times', () => {
      component.cancelFeedbackPopup()
      component.cancelFeedbackPopup()
      component.cancelFeedbackPopup()

      expect(mockMatDialogRef.close).toHaveBeenCalledTimes(3)
    })

    it('should not pass any data when closing dialog', () => {
      component.cancelFeedbackPopup()

      expect(mockMatDialogRef.close).toHaveBeenCalledWith()
      const callArgs = mockMatDialogRef.close.mock.calls[0]
      expect(callArgs).toEqual([])
    })
  })

  describe('integration tests', () => {
    it('should handle cancel after save attempt', () => {
      localStorage.setItem('websiteLanguage', 'en')

      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      component.saveFeedback('Some feedback')
      component.cancelFeedbackPopup()

      expect(mockMatDialogRef.close).toHaveBeenCalledTimes(2)
      expect(mockMatDialogRef.close).toHaveBeenNthCalledWith(1, 'Some feedback')
      expect(mockMatDialogRef.close).toHaveBeenNthCalledWith(2)
    })

    it('should handle multiple language changes in localStorage', () => {
      localStorage.setItem('websiteLanguage', 'en')
      const component1 = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      expect(mockTranslateService.use).toHaveBeenCalledWith('en')

      jest.clearAllMocks()
      localStorage.setItem('websiteLanguage', 'hi')
      const component2 = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      expect(mockTranslateService.use).toHaveBeenCalledWith('hi')
      expect(component1).toBeDefined()
      expect(component2).toBeDefined()
    })

    it('should work correctly without localStorage', () => {
      localStorage.removeItem('websiteLanguage')

      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      component.saveFeedback('Test feedback')

      expect(mockTranslateService.setDefaultLang).not.toHaveBeenCalled()
      expect(mockTranslateService.use).not.toHaveBeenCalled()
      expect(mockMatDialogRef.close).toHaveBeenCalledWith('Test feedback')
    })
  })

  describe('edge cases', () => {
    it('should handle empty localStorage item', () => {
      localStorage.setItem('websiteLanguage', '')

      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslateService.use).toHaveBeenCalledWith('')
    })

    it('should handle whitespace-only language in localStorage', () => {
      localStorage.setItem('websiteLanguage', '   ')

      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      expect(mockTranslateService.use).toHaveBeenCalledWith('   ')
    })

    it('should handle very long language code', () => {
      const longLang = 'a'.repeat(1000)
      localStorage.setItem('websiteLanguage', longLang)

      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      expect(mockTranslateService.use).toHaveBeenCalledWith(longLang)
    })

    it('should handle language with special characters', () => {
      localStorage.setItem('websiteLanguage', 'en-US')

      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      expect(mockTranslateService.use).toHaveBeenCalledWith('en-US')
    })

    it('should handle save feedback with very long text', () => {
      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      const longComment = 'a'.repeat(10000)
      component.saveFeedback(longComment)

      expect(mockMatDialogRef.close).toHaveBeenCalledWith(longComment)
    })
  })

  describe('mock verification', () => {
    it('should verify mockMatDialogRef structure', () => {
      expect(mockMatDialogRef.close).toBeDefined()
      expect(typeof mockMatDialogRef.close).toBe('function')
    })

    it('should verify mockTranslateService structure', () => {
      expect(mockTranslateService.setDefaultLang).toBeDefined()
      expect(mockTranslateService.use).toBeDefined()
      expect(typeof mockTranslateService.setDefaultLang).toBe('function')
      expect(typeof mockTranslateService.use).toBe('function')
    })

    it('should verify localStorage is available', () => {
      expect(localStorage).toBeDefined()
      expect(typeof localStorage.getItem).toBe('function')
      expect(typeof localStorage.setItem).toBe('function')
      expect(typeof localStorage.removeItem).toBe('function')
    })
  })

  describe('method existence', () => {
    beforeEach(() => {
      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )
    })

    it('should have saveFeedback method', () => {
      expect(component.saveFeedback).toBeDefined()
      expect(typeof component.saveFeedback).toBe('function')
    })

    it('should have cancelFeedbackPopup method', () => {
      expect(component.cancelFeedbackPopup).toBeDefined()
      expect(typeof component.cancelFeedbackPopup).toBe('function')
    })

    it('should have matDialogRef property', () => {
      expect(component.matDialogRef).toBeDefined()
      expect(component.matDialogRef).toBe(mockMatDialogRef)
    })
  })

  describe('state management', () => {
    it('should maintain matDialogRef reference after multiple operations', () => {
      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      const initialRef = component.matDialogRef

      component.saveFeedback('Test')
      component.cancelFeedbackPopup()

      expect(component.matDialogRef).toBe(initialRef)
    })

    it('should not modify component state during saveFeedback', () => {
      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      const refBefore = component.matDialogRef

      component.saveFeedback('Test feedback')

      expect(component.matDialogRef).toBe(refBefore)
    })

    it('should not modify component state during cancelFeedbackPopup', () => {
      component = new NonReleventFeedbackDialogComponent(
        mockMatDialogRef,
        mockTranslateService
      )

      const refBefore = component.matDialogRef

      component.cancelFeedbackPopup()

      expect(component.matDialogRef).toBe(refBefore)
    })
  })
})
