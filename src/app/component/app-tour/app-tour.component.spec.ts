import { AppTourComponent } from './app-tour.component'
import { GuidedTourService, ProgressIndicatorLocation } from 'igot-cb-tour-guide'
import { UtilityService, EventService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { UserProfileService } from '@ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { TranslateService } from '@ngx-translate/core'
import { of } from 'rxjs'

describe('AppTourComponent', () => {
  let component: AppTourComponent
  let mockGuidedTourService: jest.Mocked<GuidedTourService>
  let mockUtilitySvc: jest.Mocked<UtilityService>
  let mockConfigSvc: jest.Mocked<ConfigurationsService>
  let mockEvents: jest.Mocked<EventService>
  let mockUserProfileSvc: jest.Mocked<UserProfileService>
  let mockTranslate: jest.Mocked<TranslateService>

  beforeEach(() => {
    // Mock services
    mockGuidedTourService = {
      startTour: jest.fn(),
      skipTour: jest.fn(),
    } as unknown as jest.Mocked<GuidedTourService>

    mockUtilitySvc = {
      isMobile: false,
    } as unknown as jest.Mocked<UtilityService>

    mockConfigSvc = {
      unMappedUser: { id: 'test-user-id' },
      updateTourGuideMethod: jest.fn(),
    } as unknown as jest.Mocked<ConfigurationsService>

    mockEvents = {
      dispatchGetStartedEvent: jest.fn(),
    } as unknown as jest.Mocked<EventService>

    mockUserProfileSvc = {
      editProfileDetails: jest.fn().mockReturnValue(of({})),
    } as unknown as jest.Mocked<UserProfileService>

    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn().mockImplementation((key) => key),
    } as unknown as jest.Mocked<TranslateService>

    // Set up localStorage mock
    const localStorageMock = (() => {
      let store: Record<string, string> = {}
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value
        },
        clear: () => {
          store = {}
        },
      }
    })()
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })

    // Create component
    component = new AppTourComponent(
      mockGuidedTourService,
      mockUtilitySvc,
      mockConfigSvc,
      mockEvents,
      mockUserProfileSvc,
      mockTranslate
    )

    // Mock DOM manipulation functions
    global.document.getElementsByClassName = jest.fn().mockReturnValue([
      { style: { left: '10px' } },
    ])

    // Mock setTimeout
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with default values', () => {
    expect(component.progressIndicatorLocation).toBe(ProgressIndicatorLocation.TopOfTourBlock)
    expect(component.videoProgressTime).toBe(114)
    expect(component.tourStatus).toEqual({ visited: true, skipped: false })
    expect(component.showpopup).toBe(true)
    expect(component.noScroll).toBe(true)
    expect(component.closePopupIcon).toBe(true)
    expect(component.showCompletePopup).toBe(false)
    expect(component.showVideoTour).toBe(false)
    expect(component.isMobile).toBe(false)
    expect(component.hideCloseBtn).toBe(false)
  })

  it('should set language from localStorage during initialization', () => {
    localStorage.setItem('websiteLanguage', 'hi')

    // Re-initialize component to test language setting
    component = new AppTourComponent(
      mockGuidedTourService,
      mockUtilitySvc,
      mockConfigSvc,
      mockEvents,
      mockUserProfileSvc,
      mockTranslate
    )

    expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en')
    expect(mockTranslate.use).toHaveBeenCalledWith('hi')
  })

  it('should raise start telemetry on initialization', () => {
    expect(mockEvents.dispatchGetStartedEvent).toHaveBeenCalled()
    // expect(mockEvents.dispatchGetStartedEvent).toHaveBeenCalledWith(expect.objectContaining({
    // //   data: expect.objectContaining({
    // //     state: 'Loaded',
    // //     eventSubType: 'GetStarted',
    // //   }),
    // }));
  })

  it('should update tour status correctly', () => {
    const status = { visited: true, skipped: true }
    component.updateTourstatus(status)

    expect(mockUserProfileSvc.editProfileDetails).toHaveBeenCalledWith({
      request: {
        userId: 'test-user-id',
        profileDetails: { get_started_tour: status },
      },
    })
  })

  it('should handle emitFromVideo with skip event', () => {
    const raiseTemeletyInteratSpy = jest.spyOn(component, 'raiseTemeletyInterat')
    component.emitFromVideo('skip')

    expect(raiseTemeletyInteratSpy).toHaveBeenCalledWith('video-skip', 'video')
  })

  it('should handle emitFromVideo with non-skip event', () => {
    const startTourSpy = jest.spyOn(component, 'startTour')
    component.emitFromVideo('start')

    expect(startTourSpy).toHaveBeenCalledWith('welcome-start', 'welcome')
  })

  describe('startTour', () => {
    it('should start desktop tour correctly', () => {
      const raiseTemeletyInteratSpy = jest.spyOn(component, 'raiseTemeletyInterat')
      component.startTour('welcome-test', 'welcome')

      expect(component.showpopup).toBe(false)
      expect(component.showVideoTour).toBe(false)
      expect(raiseTemeletyInteratSpy).toHaveBeenCalledWith('welcome-test', 'welcome')
      expect(mockGuidedTourService.startTour).toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(document.getElementsByClassName).toHaveBeenCalledWith('tour_learn')
    })

    it('should start mobile tour correctly', () => {
      //  mockUtilitySvc.isMobile = true;
      component.isMobile = true

      component.startTour('welcome-mobile', 'welcome')

      expect(mockGuidedTourService.startTour).not.toHaveBeenCalled()
      jest.advanceTimersByTime(2000)
      expect(mockGuidedTourService.startTour).toHaveBeenCalled()
    })
  })

  describe('skipTour', () => {
    it('should skip tour with provided screen and subType', () => {
      const raiseTemeletyInteratSpy = jest.spyOn(component, 'raiseTemeletyInterat')
      const raiseGetStartedEndTelemetrySpy = jest.spyOn(component, 'raiseGetStartedEndTelemetry')

      component.skipTour('test-screen', 'test-subtype')

      expect(mockUserProfileSvc.editProfileDetails).toHaveBeenCalled()
      expect(mockConfigSvc.updateTourGuideMethod).toHaveBeenCalledWith(true)
      expect(raiseTemeletyInteratSpy).toHaveBeenCalledWith('test-screen', 'test-subtype')
      expect(raiseGetStartedEndTelemetrySpy).toHaveBeenCalled()
      expect(component.noScroll).toBe(false)
      expect(component.showpopup).toBe(false)
      expect(component.showVideoTour).toBe(false)
      expect(component.showCompletePopup).toBe(false)
      expect(component.closePopupIcon).toBe(false)

      jest.advanceTimersByTime(2000)
      expect(mockGuidedTourService.skipTour).toHaveBeenCalled()
    })

    it('should skip tour with current window info', () => {
      const raiseTemeletyInteratSpy = jest.spyOn(component, 'raiseTemeletyInterat')
      component.currentWindow = { title: 'Test Window' }

      component.skipTour('', '')

      expect(raiseTemeletyInteratSpy).toHaveBeenCalledWith('test-window-skip', 'test window')
    })

    it('should skip tour without screen, subType, or current window', () => {
      const raiseTemeletyInteratSpy = jest.spyOn(component, 'raiseTemeletyInterat')
      component.currentWindow = undefined

      component.skipTour('', '')

      expect(raiseTemeletyInteratSpy).toHaveBeenCalledWith('welcome-skip', 'welcome')
    })
  })

  it('should handle completeTour correctly', () => {
    const raiseGetStartedEndTelemetrySpy = jest.spyOn(component, 'raiseGetStartedEndTelemetry')
    const onCongratsSpy = jest.spyOn(component, 'onCongrats')

    component.completeTour()

    expect(component.hideCloseBtn).toBe(false)
    expect(component.showpopup).toBe(false)
    expect(component.showCompletePopup).toBe(true)
    expect(raiseGetStartedEndTelemetrySpy).toHaveBeenCalled()
    expect(mockUserProfileSvc.editProfileDetails).toHaveBeenCalledWith({
      request: {
        userId: 'test-user-id',
        profileDetails: { get_started_tour: { visited: true, skipped: false } },
      },
    })

    jest.advanceTimersByTime(3000)
    expect(onCongratsSpy).toHaveBeenCalled()
  })

  it('should handle onCongrats correctly', () => {
    component.onCongrats()

    expect(component.showCompletePopup).toBe(false)
    expect(localStorage.getItem('tourGuide')).toBe(JSON.stringify({ 'disable': true }))
    expect(mockConfigSvc.updateTourGuideMethod).toHaveBeenCalledWith(true)
  })

  it('should handle startApp correctly', () => {
    component.showpopup = false
    component.startApp()
    expect(component.showpopup).toBe(true)
  })

  it('should handle starVideoPlayer correctly', () => {
    component.starVideoPlayer()
    expect(component.showpopup).toBe(false)
    expect(component.showVideoTour).toBe(true)
  })

  it('should handle nextCb correctly', () => {
    const raiseTemeletyInteratSpy = jest.spyOn(component, 'raiseTemeletyInterat')
    const stepObject = { title: 'My Profile' }

    component.nextCb(4, stepObject)

    expect(component.hideCloseBtn).toBe(true)
    expect(component.currentWindow).toBe(stepObject)
    expect(raiseTemeletyInteratSpy).toHaveBeenCalled()
  })

  it('should handle prevCb correctly', () => {
    const raiseTemeletyInteratSpy = jest.spyOn(component, 'raiseTemeletyInterat')
    const stepObject = { title: 'Test Step' }

    component.prevCb(2, stepObject)

    expect(component.hideCloseBtn).toBe(false)
    expect(component.currentWindow).toBe(stepObject)
    expect(raiseTemeletyInteratSpy).toHaveBeenCalled()
  })

  it('should handle closeModal correctly', () => {
    const skipTourSpy = jest.spyOn(component, 'skipTour')

    component.closeModal()

    expect(skipTourSpy).toHaveBeenCalledWith('', '')
  })

  it('should handle translateTo correctly', () => {
    const result = component.translateTo('testKey')

    expect(result).toBeDefined()
    expect(mockTranslate.instant).toHaveBeenCalledWith('tour.testKey')
  })

  it('should handle Escape key press', () => {
    const skipTourSpy = jest.spyOn(component, 'skipTour')
    const event = new KeyboardEvent('keydown', { key: 'Escape' })

    component.onKeydownHandler(event)

    expect(skipTourSpy).toHaveBeenCalledWith('', '')
  })

  it('should handle non-Escape key press', () => {
    const skipTourSpy = jest.spyOn(component, 'skipTour')
    const event = new KeyboardEvent('keydown', { key: 'Enter' })

    component.onKeydownHandler(event)

    expect(skipTourSpy).not.toHaveBeenCalled()
  })
})