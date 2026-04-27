import { CbpPlanFeedComponent } from './cbp-plan-feed.component'
import { of } from 'rxjs'

// Mock dependencies
jest.mock('@angular/router', () => ({
  ActivatedRoute: class {
    snapshot = {
      data: {
        pageData: {
          data: {
            testConfig: 'testValue'
          }
        }
      }
    };
  }
}))

jest.mock('@ngx-translate/core', () => ({
  TranslateService: class {
    setDefaultLang = jest.fn();
    use = jest.fn();
  }
}))

jest.mock('@sunbird-cb/utils-v2', () => ({
  MultilingualTranslationsService: class {
    languageSelectedObservable = of({});
    translateLabel = jest.fn().mockImplementation((label) => `translated-${label}`);
  }
}))

describe('CbpPlanFeedComponent', () => {
  let component: CbpPlanFeedComponent
  let activatedRoute: any
  let translateService: any
  let multilingualService: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup storage mock
    const localStorageMock = (() => {
      let store: Record<string, string> = {}
      return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value.toString()
        }),
        clear: jest.fn(() => {
          store = {}
        })
      }
    })()

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    })

    // Set a value for websiteLanguage
    localStorage.setItem('websiteLanguage', 'en')

    // Get dependencies
    activatedRoute = new (jest.requireMock('@angular/router').ActivatedRoute)()
    translateService = new (jest.requireMock('@ngx-translate/core').TranslateService)()
    multilingualService = new (jest.requireMock('@sunbird-cb/utils-v2').MultilingualTranslationsService)()

    // Create component
    component = new CbpPlanFeedComponent(
      activatedRoute,
      translateService,
      multilingualService
    )
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should set cbpConfig on initialization', () => {
    // Act
    component.ngOnInit()

    // Assert
    expect(component.cbpConfig).toEqual({ testConfig: 'testValue' })
  })

  it('should set up language translation on constructor', () => {
    // Assert
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en')
    expect(translateService.use).toHaveBeenCalledWith('en')
  })

  it('should emit search event when search value changes', () => {
    // Arrange
    jest.spyOn(component.searchRequest, 'emit')
    component.ngOnInit()

    // Act
    component.searchControl.setValue('test search')

    // Assert
    expect(component.searchRequest.emit).toHaveBeenCalledWith({ query: 'test search' })
  })

  it('should not emit search event when search value does not change', () => {
    // Arrange
    jest.spyOn(component.searchRequest, 'emit')
    component.ngOnInit()
    component.searchControl.setValue('test search')

    // Reset the spy to check if it gets called again
    jest.clearAllMocks()

    // Act
    component.searchControl.setValue('test search') // Same value

    // Assert
    expect(component.searchRequest.emit).not.toHaveBeenCalled()
  })

  it('should emit toggle filter event when openFilter is called', () => {
    // Arrange
    jest.spyOn(component.toggleFilterEvent, 'emit')

    // Act
    component.openFilter()

    // Assert
    expect(component.toggleFilter).toBe(true)
    expect(component.toggleFilterEvent.emit).toHaveBeenCalledWith(true)
  })

  it('should emit closeFilterKey event when closeFilter is called', () => {
    // Arrange
    jest.spyOn(component.closeFilterKey, 'emit')
    const value = 'testValue'
    const key = 'testKey'

    // Act
    component.closeFilter(value, key)

    // Assert
    expect(component.closeFilterKey.emit).toHaveBeenCalledWith({ value, key })
  })

  it('should call translateLabel with correct parameters', () => {
    // Arrange
    const label = 'testLabel'
    const type = 'testType'

    // Act
    const result = component.translateLabel(label, type)

    // Assert
    expect(multilingualService.translateLabel).toHaveBeenCalledWith(label, type, '')
    expect(result).toBe('translated-testLabel')
  })

  it('should have correct initial values', () => {
    // Assert
    expect(component.toggleFilter).toBe(false)
    expect(component.contentDataList).toEqual([])
    expect(component.filterApplied).toBe(false)
    expect(component.searchControl.value).toBe('')
  })

  it('should have correct filter value bindings', () => {
    // Assert for status filter values
    expect(component.filterValuesBinding.status[0]).toBe('Not started')
    expect(component.filterValuesBinding.status[1]).toBe('In progress')
    expect(component.filterValuesBinding.status[2]).toBe('Completed')

    // Assert for timeDuration filter values
    expect(component.filterValuesBinding.timeDuration['7ad']).toBe('Upcoming 7 Days')
    expect(component.filterValuesBinding.timeDuration['30ad']).toBe('Upcoming 30 Days')
    expect(component.filterValuesBinding.timeDuration['90ad']).toBe('Upcoming 3 Months')
    expect(component.filterValuesBinding.timeDuration['182ad']).toBe('Upcoming 6 Months')
    expect(component.filterValuesBinding.timeDuration['1sw']).toBe('Last week')
    expect(component.filterValuesBinding.timeDuration['1sm']).toBe('Last month')
    expect(component.filterValuesBinding.timeDuration['3sm']).toBe('Last 3 month')
    expect(component.filterValuesBinding.timeDuration['6sm']).toBe('Last 6 month')
    expect(component.filterValuesBinding.timeDuration['12sm']).toBe('Last year')
  })
})