import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { UpcomingTimelineComponent } from './upcoming-timeline.component'
import { of } from 'rxjs'

describe('UpcomingTimelineComponent', () => {
  let component: UpcomingTimelineComponent
  let mockActivatedRoute: jest.Mocked<ActivatedRoute>
  let mockTranslateService: jest.Mocked<TranslateService>
  let mockLanguageTranslations: jest.Mocked<MultilingualTranslationsService>

  beforeEach(() => {
    // Create mock implementations
    mockActivatedRoute = {
      snapshot: {
        data: {
          pageData: {
            Data: { mockConfigData: true }
          }
        }
      }
    } as any

    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    } as any

    mockLanguageTranslations = {
      languageSelectedObservable: of(null)
    } as any

    // Initialize component with mocked dependencies
    component = new UpcomingTimelineComponent(
      mockActivatedRoute,
      mockTranslateService,
      mockLanguageTranslations
    )
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should set cbpConfig from route data', () => {
      component.ngOnInit()
      expect(component.cbpConfig).toEqual({ mockConfigData: true })
    })
  })

  describe('upComingMethod', () => {
    it('should emit upcoming filter when event is "upcoming"', () => {
      const expectedUpcomingData = {
        primaryCategory: [],
        status: ['0', '1', '2'],
        timeDuration: ['30ad'],
        competencyArea: [],
        competencyTheme: [],
        competencySubTheme: [],
        providers: [],
      }

      jest.spyOn(component.filterValueEmit, 'emit')
      component.upComingMethod('upcoming')

      expect(component.filterValueEmit.emit).toHaveBeenCalledWith(expectedUpcomingData)
    })

    it('should emit overdue filter when event is not "upcoming"', () => {
      const expectedOverdueData = {
        primaryCategory: [],
        status: ['0', '1'],
        timeDuration: ['3sm'],
        competencyArea: [],
        competencyTheme: [],
        competencySubTheme: [],
        providers: [],
      }

      jest.spyOn(component.filterValueEmit, 'emit')
      component.upComingMethod('overdue')

      expect(component.filterValueEmit.emit).toHaveBeenCalledWith(expectedOverdueData)
    })
  })

  describe('Language Translation', () => {
    beforeEach(() => {
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn()
        },
        writable: true
      })
    })

    it('should set language when language is selected', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('fr')
      
      // Trigger language selection
      mockLanguageTranslations.languageSelectedObservable.subscribe()

      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslateService.use).toHaveBeenCalledWith('fr')
    })
  })

  describe('scroll method', () => {
    it('should scroll to element smoothly', () => {
      // Create a mock DOM element
      const mockElement = {
        id: 'testElement',
        offsetTop: 500
      }

      // Spy on document.getElementById and window.scroll
      const getElementByIdSpy = jest.spyOn(document, 'getElementById')
        .mockReturnValue(mockElement as any)
      
      const scrollSpy = jest.spyOn(window, 'scroll')

      // Call the scroll method
      component.scroll('testElement')

      // Expectations
      expect(getElementByIdSpy).toHaveBeenCalledWith('testElement')
      expect(scrollSpy).toHaveBeenCalledWith({
        top: 360, // 500 - 140
        behavior: 'smooth'
      })
    })
  })
})