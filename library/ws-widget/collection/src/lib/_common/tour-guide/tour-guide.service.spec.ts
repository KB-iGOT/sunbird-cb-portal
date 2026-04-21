/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { CustomTourService } from './tour-guide.service'
import { NavigationEnd } from '@angular/router'
import { of } from 'rxjs'

describe('CustomTourService', () => {
  let service: CustomTourService
  let mockRouter: any
  let mockConfigSvc: any
  let mockTour: any
  let mockShepherd: any

  beforeEach(() => {
    // Mock Router
    mockRouter = {
      events: of(new NavigationEnd(1, '/test', '/test')),
      navigate: jest.fn(),
    } as any

    // Mock ConfigurationsService
    mockConfigSvc = {
      userPreference: {
        isDarkMode: false,
      },
    } as any

    // Mock Shepherd Tour
    mockTour = {
      addStep: jest.fn(),
      start: jest.fn(),
      cancel: jest.fn(),
      back: jest.fn(),
      next: jest.fn(),
      on: jest.fn(),
    } as any

    // Mock Shepherd global
    mockShepherd = {
      Tour: jest.fn(() => mockTour),
    }
      ; (global as any).Shepherd = mockShepherd

    service = new CustomTourService(mockRouter, mockConfigSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create the service', () => {
      expect(service).toBeDefined()
    })
  })

  describe('startTour', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="step1">
          <span>Content</span>
        </div>
        <div id="step2">
          <span>Content</span>
        </div>
      `
      service.data = [
        ['#step1', 'Step 1 Title', 'Step 1 Description'],
        ['#step2', 'Step 2 Title', 'Step 2 Description'],
      ]
    })

    it('should create and start tour with light mode classes when isDarkMode is false', () => {
      mockConfigSvc.userPreference = { isDarkMode: false }

      const result = service.startTour()

      const tourCall = (mockShepherd.Tour as any).mock.calls[0][0]
      expect(tourCall.defaultStepOptions.classes).toBe('class-1 class-2')
      expect(mockTour.addStep).toHaveBeenCalled()
      expect(mockTour.start).toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it('should create tour with dark mode classes when isDarkMode is true', () => {
      mockConfigSvc.userPreference = { isDarkMode: true }

      service.startTour()

      const tourCall = (mockShepherd.Tour as any).mock.calls[0][0]
      expect(tourCall.defaultStepOptions.classes).toBe('tour-darkmode')
    })

    it('should use dark mode classes when userPreference is null', () => {
      mockConfigSvc.userPreference = null

      service.startTour()

      const tourCall = (mockShepherd.Tour as any).mock.calls[0][0]
      expect(tourCall.defaultStepOptions.classes).toBe('tour-darkmode')
    })

    it('should add steps for each data item with valid DOM element', () => {
      service.startTour()

      expect(mockTour.addStep).toHaveBeenCalledTimes(2)
    })

    it('should add Back button for steps after the first one', () => {
      service.startTour()

      const addStepMock = mockTour.addStep as any
      const secondStepCall = addStepMock.mock.calls[1][0]
      const hasBackButton = secondStepCall.buttons.some((btn: any) => btn.text === 'Back')

      expect(hasBackButton).toBe(true)
    })

    it('should add Next button for all steps except the last', () => {
      service.startTour()

      const addStepMock = mockTour.addStep as any
      const firstStepCall = addStepMock.mock.calls[0][0]
      const hasNextButton = firstStepCall.buttons.some((btn: any) => btn.text === 'Next')

      expect(hasNextButton).toBe(true)
    })

    it('should add Close button for the last step', () => {
      service.startTour()

      const addStepMock = mockTour.addStep as any
      const lastStepCall = addStepMock.mock.calls[1][0]
      const hasCloseButton = lastStepCall.buttons.some((btn: any) => btn.text === 'Close')

      expect(hasCloseButton).toBe(true)
    })

    it('should set up cancel event listener and emit isTourComplete', () => {
      let cancelCallback: any
      mockTour.on = jest.fn((event: string, callback: any) => {
        if (event === 'cancel') {
          cancelCallback = callback
        }
      })

      service.startTour()

      const emitSpy = jest.spyOn(service.isTourComplete, 'emit')
      service.tour = mockTour

      const result = cancelCallback()

      expect(emitSpy).toHaveBeenCalledWith(true)
      expect(result).toBe(true)
    })

    it('should return false from cancel callback when tour is null', () => {
      let cancelCallback: any
      mockTour.on = jest.fn((event: string, callback: any) => {
        if (event === 'cancel') {
          cancelCallback = callback
        }
      })

      service.startTour()
      service.tour = null

      const result = cancelCallback()

      expect(result).toBe(false)
    })

    it('should skip steps with invalid DOM elements', () => {
      service.data = [
        ['#nonexistent', 'Title', 'Description'],
        ['#step1', 'Step 1 Title', 'Step 1 Description'],
      ]

      service.startTour()

      expect(mockTour.addStep).toHaveBeenCalledTimes(1)
    })
  })

  describe('cancelTour', () => {
    it('should cancel tour and emit isTourComplete when tour exists', () => {
      service.tour = mockTour
      const emitSpy = jest.spyOn(service.isTourComplete, 'emit')

      service.cancelTour()

      expect(mockTour.cancel).toHaveBeenCalled()
      expect(emitSpy).toHaveBeenCalledWith(true)
    })

    it('should not throw error when tour is null', () => {
      service.tour = null

      expect(() => service.cancelTour()).not.toThrow()
    })

    it('should not emit when tour is null', () => {
      service.tour = null
      const emitSpy = jest.spyOn(service.isTourComplete, 'emit')

      service.cancelTour()

      expect(emitSpy).not.toHaveBeenCalled()
    })
  })

  describe('createPopupTour', () => {
    beforeEach(() => {
      document.body.innerHTML = `<div id="Profile_link">Profile</div>`
    })

    it('should create popup tour with light mode classes', () => {
      mockConfigSvc.userPreference = { isDarkMode: false }

      const tour = service.createPopupTour()

      expect(mockShepherd.Tour).toHaveBeenCalled()
      expect(tour).toBe(mockTour)
    })

    it('should create popup tour with dark mode classes when isDarkMode is true', () => {
      mockConfigSvc.userPreference = { isDarkMode: true }

      service.createPopupTour()

      const tourCall = (mockShepherd.Tour as any).mock.calls[0][0]
      expect(tourCall.defaultStepOptions.classes).toBe('tour-darkmode')
    })

    it('should use dark mode classes when userPreference is null', () => {
      mockConfigSvc.userPreference = null

      service.createPopupTour()

      const tourCall = (mockShepherd.Tour as any).mock.calls[0][0]
      expect(tourCall.defaultStepOptions.classes).toBe('tour-darkmode')
    })

    it('should add step with Profile_link element', () => {
      service.createPopupTour()

      const addStepMock = mockTour.addStep as any
      const stepCall = addStepMock.mock.calls[0][0]
      expect(stepCall.attachTo.element).toBe('#Profile_link')
      expect(stepCall.attachTo.on).toBe('bottom')
    })

    it('should set up cancel event listener for popup tour', () => {
      let cancelCallback: any
      mockTour.on = jest.fn((event: string, callback: any) => {
        if (event === 'cancel') {
          cancelCallback = callback
        }
      })

      service.createPopupTour()

      const emitSpy = jest.spyOn(service.isTourComplete, 'emit')
      service.tour = mockTour

      const result = cancelCallback()

      expect(emitSpy).toHaveBeenCalledWith(true)
      expect(result).toBe(true)
    })

    it('should return false from cancel callback when tour is null', () => {
      let cancelCallback: any
      mockTour.on = jest.fn((event: string, callback: any) => {
        if (event === 'cancel') {
          cancelCallback = callback
        }
      })

      service.createPopupTour()
      service.tour = null

      const result = cancelCallback()

      expect(result).toBe(false)
    })

    it('should store tour in popupTour property', () => {
      const tour = service.createPopupTour()

      expect(service.popupTour).toBe(tour)
    })
  })

  describe('startPopupTour', () => {
    it('should start popup tour when popupTour exists', () => {
      service.popupTour = mockTour

      service.startPopupTour()

      expect(mockTour.start).toHaveBeenCalled()
    })

    it('should not throw error when popupTour is null', () => {
      service.popupTour = null

      expect(() => service.startPopupTour()).not.toThrow()
    })

    it('should not call start when popupTour is undefined', () => {
      service.popupTour = undefined

      service.startPopupTour()

      expect(mockTour.start).not.toHaveBeenCalled()
    })
  })

  describe('cancelPopupTour', () => {
    it('should cancel popup tour when popupTour exists', () => {
      service.popupTour = mockTour

      service.cancelPopupTour()

      expect(mockTour.cancel).toHaveBeenCalled()
    })

    it('should not throw error when popupTour is null', () => {
      service.popupTour = null

      expect(() => service.cancelPopupTour()).not.toThrow()
    })

    it('should not call cancel when popupTour is undefined', () => {
      service.popupTour = undefined

      service.cancelPopupTour()

      expect(mockTour.cancel).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle empty data array', () => {
      service.data = []

      expect(() => service.startTour()).not.toThrow()
      expect(mockTour.addStep).not.toHaveBeenCalled()
    })

    it('should handle data with empty children elements', () => {
      document.body.innerHTML = `<div id="empty-step"></div>`
      service.data = [['#empty-step', 'Title', 'Description']]

      service.startTour()

      expect(mockTour.addStep).not.toHaveBeenCalled()
    })

    it('should store tour reference in tour property', () => {
      document.body.innerHTML = `<div id="step1"><span>Content</span></div>`
      service.data = [['#step1', 'Title', 'Description']]

      service.startTour()

      expect(service.tour).toBe(mockTour)
    })
  })
})
