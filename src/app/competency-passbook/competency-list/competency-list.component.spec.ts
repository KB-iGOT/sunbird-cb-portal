import { of, throwError } from 'rxjs'
import { CompetencyListComponent } from './competency-list.component'
import { HttpErrorResponse } from '@angular/common/http'

// Mock services and dependencies
const mockWidgetService = {
  fetchInternalEnrollmentData: jest.fn(),
}

const mockConfigService = {
  userProfile: {
    userId: 'test-user-id'
  },
  compentency: {
    v5: {
      vKey: 'competenciesV5',
      vCompetencyArea: 'competencyArea',
      vCompetencyTheme: 'competencyTheme',
      vCompetencySubTheme: 'competencySubTheme'
    }
  },
}

const mockRouter = {
  navigate: jest.fn()
}

const mockMatSnackBar = {
  open: jest.fn()
}

const mockLangTranslations = {
  translateLabel: jest.fn().mockReturnValue('translated-label')
}

const mockTranslate = {
  setDefaultLang: jest.fn(),
  use: jest.fn()
}

const mockDocument = {
  body: {
    classList: {
      add: jest.fn(),
      remove: jest.fn()
    }
  }
}

// Mock environment
jest.mock('src/environments/environment', () => ({
  environment: {
    compentencyVersionKey: 'v5',
  },
}))

describe('CompetencyListComponent', () => {
  let component: CompetencyListComponent

  // Helper function to instantiate component
  function createComponent() {
    return new CompetencyListComponent(
      mockWidgetService as any,
      mockConfigService as any,
      mockRouter as any,
      mockMatSnackBar as any,
      mockLangTranslations as any,
      mockTranslate as any,
      mockConfigService as any,
      mockDocument as any
    )
  }

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()

    // Mock localStorage for language and navigation data
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      if (key === 'websiteLanguage') {
        return 'hi'
      }
      return null
    })
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { })

      // Mock window.innerWidth
      ; (globalThis as any).innerWidth = 1024

    // Set up default successful response for enrollment API
    mockWidgetService.fetchInternalEnrollmentData.mockReturnValue(of({
      result: {
        courses: [],
      },
    }))

    // Create component instance
    component = createComponent()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with correct default values and language', () => {
    component.ngOnInit()

    expect(component.isMobile).toBeFalsy()
    expect(component.showAll).toBeTruthy()
    expect(component.skeletonArr).toEqual([1, 2, 3, 4, 5, 6])
    expect(component.competency.skeletonLoading).toBeFalsy()
    expect(component.filterObjData).toBeDefined()
    expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en')
    expect(mockTranslate.use).toHaveBeenCalledWith('hi')
  })

  it('should not set language when websiteLanguage is not present', () => {
    ; (Storage.prototype.getItem as jest.Mock).mockImplementation(() => null)
    component = createComponent()

    expect(mockTranslate.setDefaultLang).not.toHaveBeenCalled()
    expect(mockTranslate.use).not.toHaveBeenCalled()
  })

  it('should initialize as mobile when window width is small', () => {
    // Mock narrow window
    ; (globalThis as any).innerWidth = 500

    // Create new component with mobile width
    component = createComponent()

    // Verify mobile initialization
    expect(component.isMobile).toBeTruthy()
    expect(component.showAll).toBeFalsy()
    expect(component.skeletonArr).toEqual([1, 2, 3])
  })

  it('should fetch user enrollment list on init', () => {
    component.ngOnInit()

    expect(mockWidgetService.fetchInternalEnrollmentData).toHaveBeenCalled()
    const args = mockWidgetService.fetchInternalEnrollmentData.mock.calls[0]
    expect(args[0]).toBe('test-user-id')
    expect(args[1]).toEqual({ request: { retiredCoursesEnabled: true, status: 'Completed' } })
  })

  it('should handle successful enrollment data', () => {
    // Mock successful response with sample competency data
    const mockResponse = {
      result: {
        courses: [
          {
            courseId: 'course-1',
            contentId: 'course-1',
            courseName: 'Course 1',
            batchId: 'batch-1',
            completedOn: 1615465200000,
            issuedCertificates: [],
            content: {
              competenciesV5: [
                {
                  competencyArea: 'Behavioural',
                  competencyTheme: 'Theme 1',
                  competencySubTheme: 'SubTheme 1',
                },
              ],
            },
          },
        ],
      },
    }

    const mapSpy = jest
      .spyOn(component as any, 'mapEnrollmentData')
      .mockReturnValue({ 'course-1': { status: 2 } })

    mockWidgetService.fetchInternalEnrollmentData.mockReturnValue(of(mockResponse as any))

    component.ngOnInit()

    expect(mapSpy).toHaveBeenCalled()
    expect(component.competency.skeletonLoading).toBeFalsy()
    expect(component.competency.all.length).toBeGreaterThan(0)
    expect(component.competencyArray).toBeDefined()
  })

  it('should handle error from enrollment API', () => {
    // Mock API error
    const errorResponse = new HttpErrorResponse({
      error: 'test error',
      status: 500,
      statusText: 'Internal Server Error',
    })

    mockWidgetService.fetchInternalEnrollmentData.mockReturnValue(throwError(() => errorResponse))

    component.ngOnInit()

    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to pull Enrollment list details!')
    expect(component.competency.skeletonLoading).toBeFalsy()
  })

  it('should map enrollment data correctly', () => {
    const courseData: any = {
      courses: [
        {
          courseId: 'course-1',
          content: { name: 'Course 1' },
        },
        {
          courseId: 'course-2',
          content: { name: 'Course 2' },
        },
      ],
    }

    const result = (component as any).mapEnrollmentData(courseData)

    expect(Object.keys(result)).toEqual(['course-1', 'course-2'])
    expect(result['course-1'].contentId).toBe('course-1')
    expect(result['course-1'].courseName).toBe('Course 1')
  })

  it('should handle tab change', () => {
    // Setup
    component.competency = {
      skeletonLoading: false,
      error: false,
      all: [{ latest: 2 }, { latest: 1 }],
      allValue: 0,
      behavioural: [{ latest: 3 }],
      functional: [{ latest: 4 }],
      domain: [{ latest: 5 }]
    }

    // Simulate tab change event
    const mockEvent = {
      tab: { textLabel: 'Behavioural' }
    }

    component.handleTabChange(mockEvent as any)

    // Verify tab change handling
    expect(component.tabValue).toBe('behavioural')
    expect(component.competencyArray).toEqual(component.competency.behavioural)
  })

  it('should handle left filter and update indicator', () => {
    component.handleLeftFilter('threeMonths')
    expect(component.showFilterIndicator).toBe('threeMonths')
  })

  it('should toggle show all', () => {
    // Setup
    component.showAll = false
    component.competency = {
      all: [1, 2, 3, 4, 5, 6].map(n => ({ id: n }))
    } as any

    // Toggle show all
    component.handleShowAll()

    // Verify toggle
    expect(component.showAll).toBeTruthy()
    expect(component.competencyArray).toEqual(component.competency.all)

    // Toggle again
    component.handleShowAll()

    // Verify second toggle
    expect(component.showAll).toBeFalsy()
    expect(component.competencyArray.length).toBe(3)
  })

  it('should handle click based on device type', () => {
    component.competency = {
      behavioural: [1, 2, 3, 4, 5].map(i => ({ id: i })),
    } as any

    component.isMobile = true
    component.handleClick('behavioural')
    expect(component.competencyArray.length).toBe(3)

    component.isMobile = false
    component.handleClick('behavioural')
    expect(component.competencyArray.length).toBe(5)
  })

  it('should toggle viewMore flag correctly', () => {
    const obj: any = { viewMore: false }

    component.handleViewMore(obj)
    expect(obj.viewMore).toBe(true)

    component.handleViewMore(obj, 'collapse')
    expect(obj.viewMore).toBe(false)
  })

  it('should handle search', () => {
    // Setup
    component.competency = {
      behavioural: [
        { competencyTheme: 'Communication' },
        { competencyTheme: 'Leadership' },
        { competencyTheme: 'Team Building' }
      ]
    } as any
    component.compentencyKey = {
      vCompetencyTheme: 'competencyTheme'
    } as any

    // Search for 'lead'
    component.handleSearch('lead', 'behavioural')

    // Verify search results
    expect(component.competencyArray.length).toBe(1)
    expect(component.competencyArray[0].competencyTheme).toBe('Leadership')

    // Search with empty string should return all
    component.handleSearch('', 'behavioural')
    expect(component.competencyArray.length).toBe(3)
  })

  it('should gracefully handle search when competency array is empty', () => {
    component.competency = {
      behavioural: [],
    } as any
    component.compentencyKey = {
      vCompetencyTheme: 'competencyTheme',
    } as any

    component.handleSearch('test', 'behavioural')
    expect(component.competencyArray).toBeUndefined()
  })

  it('should handle navigation to details page', () => {
    // Setup
    const mockObj = { id: 'test-competency' }

    // Navigate to details
    component.handleNavigate(mockObj)

    // Verify localStorage and navigation
    expect(localStorage.setItem).toHaveBeenCalledWith('details_page', JSON.stringify(mockObj))
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/competency-passbook/details'])
  })

  it('should toggle filter and manage body class', () => {
    // Toggle filter on
    component.handleFilter(true)

    // Verify body class added
    expect(mockDocument.body.classList.add).toHaveBeenCalledWith('overflow-hidden')
    expect(component.toggleFilter).toBeTruthy()

    // Toggle filter off
    component.handleFilter(false)

    // Verify body class removed
    expect(mockDocument.body.classList.remove).toHaveBeenCalledWith('overflow-hidden')
    expect(component.toggleFilter).toBeFalsy()
  })

  it('should handle filter application', () => {
    // Setup
    const mockFilterObj = {
      competencyArea: ['Behavioural'],
      competencyTheme: [],
      competencySubTheme: [],
    }

    component.competency = {
      all: [
        { competencyArea: 'Behavioural', competencyTheme: 'Theme 1', subTheme: ['Sub 1'] },
        { competencyArea: 'Functional', competencyTheme: 'Theme 2', subTheme: ['Sub 2'] },
      ],
    } as any

    component.tabValue = 'all'
    component.competencyArray = component.competency.all
    component.compentencyKey = {
      vCompetencyArea: 'competencyArea',
      vCompetencyTheme: 'competencyTheme',
      vCompetencySubTheme: 'competencySubTheme',
      vKey: '',
      vCompetencyAreaDescription: '',
    }

    component.handleApplyFilter(mockFilterObj)

    expect(component.toggleFilter).toBeFalsy()
    expect(mockDocument.body.classList.remove).toHaveBeenCalledWith('overflow-hidden')
    expect(component.filterObjData).toEqual(mockFilterObj)
  })

  it('should filter data by different criteria', () => {
    component.compentencyKey = {
      vCompetencyArea: 'competencyArea',
      vCompetencyTheme: 'competencyTheme',
      vCompetencySubTheme: 'competencySubTheme',
      vKey: '',
      vCompetencyAreaDescription: '',
    } as any

    component.competency = {
      all: [
        { competencyArea: 'Behavioural', competencyTheme: 'Theme 1', subTheme: ['Sub 1'] },
        { competencyArea: 'Functional', competencyTheme: 'Theme 2', subTheme: ['Sub 2'] },
      ],
    } as any
    component.tabValue = 'all'

    // Filter by area with US spelling mapping
    component.filterData({
      competencyArea: ['behavior'],
      competencyTheme: [],
      competencySubTheme: [],
    } as any)
    expect(component.competencyArray.length).toBe(1)

    // Filter by theme
    component.filterData({
      competencyArea: [],
      competencyTheme: ['Theme 2'],
      competencySubTheme: [],
    } as any)
    expect(component.competencyArray.length).toBe(1)

    // Filter by sub-theme
    component.filterData({
      competencyArea: [],
      competencyTheme: [],
      competencySubTheme: ['Sub 1'],
    } as any)
    expect(component.competencyArray.length).toBe(1)
  })

  it('should reset filter when no filter criteria are provided', () => {
    component.compentencyKey = {
      vCompetencyArea: 'competencyArea',
      vCompetencyTheme: 'competencyTheme',
      vCompetencySubTheme: 'competencySubTheme',
      vKey: '',
      vCompetencyAreaDescription: '',
    } as any

    component.competencyArray = [
      { competencyArea: 'Behavioural', competencyTheme: 'Theme 1', subTheme: ['Sub 1'] },
    ] as any

    component.filterData({
      competencyArea: [],
      competencyTheme: [],
      competencySubTheme: [],
    } as any)

    expect(component.filterApplied).toBeFalsy()
    expect(component.competencyArray.length).toBe(1)
  })

  it('should clear filter object and reset array on handleClearFilter', () => {
    component.compentencyKey = {
      vCompetencyArea: 'competencyArea',
      vCompetencyTheme: 'competencyTheme',
      vCompetencySubTheme: 'competencySubTheme',
      vKey: '',
      vCompetencyAreaDescription: '',
    } as any

    component.tabValue = 'all'
    component.competency = {
      all: [
        { competencyArea: 'Behavioural', competencyTheme: 'Theme 1', subTheme: ['Sub 1'] },
      ],
    } as any

    const event = {
      competencyArea: [],
      competencyTheme: [],
      competencySubTheme: [],
    }

    component.handleClearFilterObj(event as any)

    expect(component.filterObjData2).toEqual(event)
    expect(component.competencyArray).toEqual(component.competency.all)
  })

  it('should translate labels using MultilingualTranslationsService', () => {
    const result = component.translateLabels('label', 'type')
    expect(mockLangTranslations.translateLabel).toHaveBeenCalledWith('label', 'type', '')
    expect(result).toBe('translated-label')
  })

  it('should properly destroy subscriptions on ngOnDestroy', () => {
    const spyUnsubscribe = jest.spyOn((component as any).destroySubject$, 'unsubscribe')

    component.ngOnDestroy()

    expect(spyUnsubscribe).toHaveBeenCalled()
  })
})