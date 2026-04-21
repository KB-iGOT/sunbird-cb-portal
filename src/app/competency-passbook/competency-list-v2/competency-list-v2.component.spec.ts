/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { CompetencyListV2Component } from './competency-list-v2.component'
import { of, throwError } from 'rxjs'
import { HttpErrorResponse } from '@angular/common/http'

describe('CompetencyListV2Component', () => {
  let component: CompetencyListV2Component
  let mockRouter: any
  let mockMatSnackBar: any
  let mockLangtranslations: any
  let mockTranslate: any
  let mockConfigSvc: any
  let mockCompetencyPassbookSvc: any
  let mockDocument: any

  const mockCompetencyData = {
    result: {
      competencies: [
        {
          competencyAreaId: 'area1',
          competencyThemeId: 'theme1',
          competencySubThemeId: 'subtheme1',
          competencyDetails: {
            iGOTCourses: [{ id: 'course1' }, { id: 'course2' }],
            extCourses: [{ id: 'ext1' }],
            selfAchievement: [],
            externalTraining: [{ id: 'train1' }],
          },
        },
        {
          competencyAreaId: 'area2',
          competencyThemeId: 'theme2',
          competencySubThemeId: 'subtheme2',
          competencyDetails: {
            iGOTCourses: [],
            extCourses: [],
            selfAchievement: [{ id: 'self1' }],
            externalTraining: [],
          },
        },
      ],
    },
  }

  const mockAllCompetencyData = {
    result: {
      framework: {
        categories: [
          {
            code: 'competencyarea',
            terms: [
              { refId: 'area1', name: 'Behavioral' },
              { refId: 'area2', name: 'Functional' },
            ],
          },
          {
            code: 'theme',
            terms: [
              { refId: 'theme1', name: 'Theme 1' },
              { refId: 'theme2', name: 'Theme 2' },
            ],
          },
          {
            code: 'subtheme',
            terms: [
              { refId: 'subtheme1', name: 'SubTheme 1' },
              { refId: 'subtheme2', name: 'SubTheme 2' },
            ],
          },
        ],
      },
    },
  }

  beforeEach(() => {
    // Mock Router
    mockRouter = {
      navigate: jest.fn(),
    } as any

    // Mock MatSnackBar
    mockMatSnackBar = {
      open: jest.fn(),
    } as any

    // Mock MultilingualTranslationsService
    mockLangtranslations = {
      translateLabel: jest.fn((label: string) => label),
    } as any

    // Mock TranslateService
    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    } as any

    // Mock ConfigurationsService
    mockConfigSvc = {
      compentency: {
        v1: 'v1CompetencyKey',
      },
    } as any

    // Mock CompetencyPassbookService
    mockCompetencyPassbookSvc = {
      getMyCompetencyList: jest.fn().mockReturnValue(of(mockCompetencyData)),
      fetchAllCompetencyList: jest.fn().mockReturnValue(of(mockAllCompetencyData)),
    } as any

    // Mock Document
    mockDocument = {
      body: {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
        },
      },
    } as any

    // Mock window and localStorage
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    Storage.prototype.getItem = jest.fn((key: string) => {
      if (key === 'websiteLanguage') return 'en'
      return null
    })

    Storage.prototype.setItem = jest.fn()

    component = new CompetencyListV2Component(
      mockRouter,
      mockMatSnackBar,
      mockLangtranslations,
      mockTranslate,
      mockConfigSvc,
      mockCompetencyPassbookSvc,
      mockDocument
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create the component', () => {
      expect(component).toBeDefined()
    })

    it('should set mobile mode when window width is less than 768', () => {
      Object.defineProperty(window, 'innerWidth', { value: 500, writable: true })

      component = new CompetencyListV2Component(
        mockRouter,
        mockMatSnackBar,
        mockLangtranslations,
        mockTranslate,
        mockConfigSvc,
        mockCompetencyPassbookSvc,
        mockDocument
      )

      expect(component.isMobile).toBe(true)
      expect(component.skeletonArr).toEqual([1, 2, 3])
    })

    it('should set desktop mode when window width is 768 or more', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })

      component = new CompetencyListV2Component(
        mockRouter,
        mockMatSnackBar,
        mockLangtranslations,
        mockTranslate,
        mockConfigSvc,
        mockCompetencyPassbookSvc,
        mockDocument
      )

      expect(component.isMobile).toBe(false)
      expect(component.showAll).toBe(true)
      expect(component.skeletonArr).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('should set default language and use stored language', () => {
      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslate.use).toHaveBeenCalledWith('en')
    })
  })

  describe('ngOnInit', () => {
    it('should initialize filter objects and fetch data', () => {
      jest.useFakeTimers()
      const getAllCompetencySpy = jest.spyOn(component, 'getAllCompetencyList')
      const getMyCompetencySpy = jest.spyOn(component, 'getMyCompetencyList')

      component.ngOnInit()

      expect(component.filterObjData).toBeDefined()
      expect(component.filterObjData2).toBeDefined()
      expect(getAllCompetencySpy).toHaveBeenCalled()

      jest.advanceTimersByTime(1000)
      expect(getMyCompetencySpy).toHaveBeenCalled()

      jest.useRealTimers()
    })
  })

  describe('getAllCompetencyList', () => {
    it('should fetch and process all competency list successfully', () => {
      component.getAllCompetencyList()

      expect(mockCompetencyPassbookSvc.fetchAllCompetencyList).toHaveBeenCalled()
      expect(component.allCompetencies.length).toBe(2)
      expect(component.allThemeData.length).toBe(2)
      expect(component.allSubThemeData.length).toBe(2)
    })

    it('should handle error when fetching competency list fails', () => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
      mockCompetencyPassbookSvc.fetchAllCompetencyList = jest.fn().mockReturnValue(throwError(errorResponse))

      component.getAllCompetencyList()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to pull Competency list details!')
    })
  })

  describe('getMyCompetencyList', () => {
    it('should fetch and process my competency list successfully', () => {
      const buildMyCompetencySpy = jest.spyOn(component, 'buildMyCompetency').mockImplementation()

      component.getMyCompetencyList()

      expect(mockCompetencyPassbookSvc.getMyCompetencyList).toHaveBeenCalled()
      expect(component.myCompetencyList.length).toBe(2)
      expect(buildMyCompetencySpy).toHaveBeenCalled()
      expect(component.competency.skeletonLoading).toBe(false)
    })

    it('should handle error when fetching my competency list fails', () => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
      mockCompetencyPassbookSvc.getMyCompetencyList = jest.fn().mockReturnValue(throwError(errorResponse))

      component.getMyCompetencyList()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to pull My Competency list details!')
      expect(component.competency.skeletonLoading).toBe(false)
    })
  })

  describe('getSubThemeName', () => {
    it('should return sub theme name from allSubThemeData', () => {
      component.allSubThemeData = [
        { refId: 'sub1', name: 'Sub Theme 1' },
        { refId: 'sub2', name: 'Sub Theme 2' },
      ]

      const result = component.getSubThemeName('sub1')

      expect(result).toBe('Sub Theme 1')
    })

    it('should return subThemeId if not found in allSubThemeData', () => {
      component.allSubThemeData = []

      const result = component.getSubThemeName('unknown')

      expect(result).toBe('unknown')
    })
  })

  describe('buildMyCompetency', () => {
    beforeEach(() => {
      component.allCompetencies = mockAllCompetencyData.result.framework.categories[0].terms
      component.allThemeData = mockAllCompetencyData.result.framework.categories[1].terms
      component.allSubThemeData = mockAllCompetencyData.result.framework.categories[2].terms
      component.myCompetencyList = mockCompetencyData.result.competencies
    })

    it('should build myCompetencies structure correctly', () => {
      const findCountsSpy = jest.spyOn(component, 'findCounts').mockImplementation()
      const updateShuffledThemesSpy = jest.spyOn(component, 'updateShuffledThemes').mockImplementation()

      component.buildMyCompetency()

      expect(component.myCompetencies.length).toBeGreaterThan(0)
      expect(findCountsSpy).toHaveBeenCalled()
      expect(updateShuffledThemesSpy).toHaveBeenCalled()
    })

    it('should calculate counts correctly for themes', () => {
      jest.spyOn(component, 'findCounts').mockImplementation()
      jest.spyOn(component, 'updateShuffledThemes').mockImplementation()

      component.buildMyCompetency()

      const firstArea = component.myCompetencies[0]
      expect(firstArea.counts.total).toBeGreaterThanOrEqual(0)
    })

    it('should add subThemes to area and theme entries', () => {
      jest.spyOn(component, 'findCounts').mockImplementation()
      jest.spyOn(component, 'updateShuffledThemes').mockImplementation()

      component.buildMyCompetency()

      const firstArea = component.myCompetencies[0]
      expect(firstArea.subThemes).toBeDefined()
      expect(firstArea.themes[0].subThemes).toBeDefined()
    })
  })

  describe('findCounts', () => {
    beforeEach(() => {
      component.allCompetencies = mockAllCompetencyData.result.framework.categories[0].terms
      component.myCompetencies = [
        {
          id: 'area1',
          name: 'Behavioral',
          subThemes: [{ id: 'sub1', name: 'Sub 1' }],
          counts: { iGOTCourses: 2, extCourses: 1, selfAchievement: 0, externalTraining: 1, total: 4 },
          themes: [
            {
              id: 'theme1',
              name: 'Theme 1',
              areaId: 'area1',
              areaName: 'Behavioral',
              subThemes: [],
              competencyDetails: [],
              viewMore: false,
              counts: { iGOTCourses: 2, extCourses: 1, selfAchievement: 0, externalTraining: 1, total: 4 },
            },
          ],
        },
      ]
    })

    it('should calculate total competency count', () => {
      component.findCounts()

      expect(component.totalCompetencyCount).toBe(1)
    })

    it('should update leftCardDetails with correct values', () => {
      component.findCounts()

      const behavioralCard = component.leftCardDetails.find((card: any) => card.name === 'behavioural')
      expect(behavioralCard.contentConsumed).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getAllCompetenciesCount', () => {
    it('should return total count of all themes', () => {
      component.myCompetencies = [
        {
          id: 'area1',
          name: 'Area 1',
          themes: [
            { id: 't1', name: 'Theme 1', areaId: 'area1', areaName: 'Area 1', subThemes: [], competencyDetails: [], viewMore: false, counts: {} as any },
            { id: 't2', name: 'Theme 2', areaId: 'area1', areaName: 'Area 1', subThemes: [], competencyDetails: [], viewMore: false, counts: {} as any }
          ],
          subThemes: [],
          counts: {} as any
        },
        {
          id: 'area2',
          name: 'Area 2',
          themes: [
            { id: 't3', name: 'Theme 3', areaId: 'area2', areaName: 'Area 2', subThemes: [], competencyDetails: [], viewMore: false, counts: {} as any }
          ],
          subThemes: [],
          counts: {} as any
        },
      ]

      const count = component.getAllCompetenciesCount()

      expect(count).toBe(3)
    })

    it('should return 0 when no competencies exist', () => {
      component.myCompetencies = []

      const count = component.getAllCompetenciesCount()

      expect(count).toBe(0)
    })
  })

  describe('mapEnrollmentData', () => {
    it('should map course data to enrollment object', () => {
      const courseData = {
        courses: [
          { courseId: 'c1', content: { name: 'Course 1' } },
          { courseId: 'c2', content: { name: 'Course 2' } },
        ],
      }

      const result = component.mapEnrollmentData(courseData)

      expect(result.c1).toBeDefined()
      expect(result.c1.courseName).toBe('Course 1')
      expect(result.c2).toBeDefined()
    })

    it('should return empty object when no courses', () => {
      const result = component.mapEnrollmentData({ courses: [] })

      expect(result).toEqual({})
    })
  })

  describe('handleLeftFilter', () => {
    it('should update showFilterIndicator', () => {
      component.handleLeftFilter('threeMonths')

      expect(component.showFilterIndicator).toBe('threeMonths')
    })
  })

  describe('filterCompetencyByTab', () => {
    beforeEach(() => {
      component.myCompetencies = [
        { id: 'area1', name: 'Behavioral', themes: [], subThemes: [], counts: {} as any },
        { id: 'area2', name: 'Functional', themes: [], subThemes: [], counts: {} as any },
        { id: 'area3', name: 'Domain', themes: [], subThemes: [], counts: {} as any },
      ]
    })

    it('should show all competencies when tab is "all"', () => {
      const updateShuffledThemesSpy = jest.spyOn(component, 'updateShuffledThemes').mockImplementation()

      component.filterCompetencyByTab('all')

      expect(component.filteredCompetencyArray.length).toBe(3)
      expect(updateShuffledThemesSpy).toHaveBeenCalled()
    })

    it('should filter by behavioral competencies', () => {
      jest.spyOn(component, 'updateShuffledThemes').mockImplementation()

      component.filterCompetencyByTab('behavioral')

      expect(component.filteredCompetencyArray.length).toBe(1)
      expect(component.filteredCompetencyArray[0].name).toBe('Behavioral')
    })

    it('should filter by functional competencies', () => {
      jest.spyOn(component, 'updateShuffledThemes').mockImplementation()

      component.filterCompetencyByTab('functional')

      expect(component.filteredCompetencyArray.length).toBe(1)
      expect(component.filteredCompetencyArray[0].name).toBe('Functional')
    })
  })

  describe('handleTabChange', () => {
    it('should filter competency by tab and update tabValue', () => {
      const event = {
        tab: { textLabel: 'Functional' },
      } as any
      const filterCompetencySpy = jest.spyOn(component, 'filterCompetencyByTab').mockImplementation()

      component.handleTabChange(event)

      expect(component.tabValue).toBe('functional')
      expect(filterCompetencySpy).toHaveBeenCalledWith('functional')
    })

    it('should re-apply filters if filterApplied is true', () => {
      const event = {
        tab: { textLabel: 'Domain' },
      } as any
      component.filterApplied = true
      jest.spyOn(component, 'filterCompetencyByTab').mockImplementation()
      const filterDataSpy = jest.spyOn(component, 'filterData').mockImplementation()

      component.handleTabChange(event)

      expect(filterDataSpy).toHaveBeenCalled()
    })
  })

  describe('handleShowAll', () => {
    beforeEach(() => {
      component.myCompetencies = [
        { id: '1', name: 'Area 1', themes: [], subThemes: [], counts: {} as any },
        { id: '2', name: 'Area 2', themes: [], subThemes: [], counts: {} as any },
        { id: '3', name: 'Area 3', themes: [], subThemes: [], counts: {} as any },
        { id: '4', name: 'Area 4', themes: [], subThemes: [], counts: {} as any },
      ]
    })

    it('should toggle showAll to true and show all competencies', () => {
      component.showAll = false
      jest.spyOn(component, 'updateShuffledThemes').mockImplementation()

      component.handleShowAll()

      expect(component.showAll).toBe(true)
      expect(component.filteredCompetencyArray.length).toBe(4)
    })

    it('should toggle showAll to false and show only 3 competencies', () => {
      component.showAll = true
      jest.spyOn(component, 'updateShuffledThemes').mockImplementation()

      component.handleShowAll()

      expect(component.showAll).toBe(false)
      expect(component.filteredCompetencyArray.length).toBe(3)
    })
  })

  describe('handleClick', () => {
    it('should call filterCompetencyByTab with the provided param', () => {
      const filterCompetencySpy = jest.spyOn(component, 'filterCompetencyByTab').mockImplementation()

      component.handleClick('functional')

      expect(filterCompetencySpy).toHaveBeenCalledWith('functional')
    })
  })

  describe('handleViewMore', () => {
    it('should set viewMore to true when no flag provided', () => {
      const obj = { viewMore: false }

      component.handleViewMore(obj)

      expect(obj.viewMore).toBe(true)
    })

    it('should set viewMore to false when flag is provided', () => {
      const obj = { viewMore: true }

      component.handleViewMore(obj, 'hide')

      expect(obj.viewMore).toBe(false)
    })
  })

  describe('handleNavigate', () => {
    it('should save competency details to localStorage and navigate', () => {
      const obj = { id: 'comp1', name: 'Competency 1' }

      component.handleNavigate(obj)

      expect(localStorage.setItem).toHaveBeenCalledWith('details_page_competency', JSON.stringify(obj))
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/competency-passbook/details'])
    })
  })

  describe('handleSearch', () => {
    beforeEach(() => {
      component.myCompetencies = [
        {
          id: 'area1',
          name: 'Behavioral',
          themes: [
            { id: 't1', name: 'Leadership', areaId: 'area1', areaName: 'Behavioral', subThemes: [], competencyDetails: [], viewMore: false, counts: {} as any },
            { id: 't2', name: 'Communication', areaId: 'area1', areaName: 'Behavioral', subThemes: [], competencyDetails: [], viewMore: false, counts: {} as any },
          ],
          subThemes: [],
          counts: {} as any,
        },
      ]
    })

    it('should filter themes by search term', () => {
      jest.spyOn(component, 'updateShuffledThemes').mockImplementation()

      component.handleSearch('leader', 'behavioral')

      expect(component.filteredCompetencyArray[0].themes.length).toBe(1)
      expect(component.filteredCompetencyArray[0].themes[0].name).toBe('Leadership')
    })

    it('should show all themes when search is empty', () => {
      jest.spyOn(component, 'filterCompetencyByTab').mockImplementation(() => {
        component.filteredCompetencyArray = component.myCompetencies
      })
      jest.spyOn(component, 'updateShuffledThemes').mockImplementation()

      component.handleSearch('', 'behavioral')

      expect(component.filteredCompetencyArray[0].themes.length).toBe(2)
    })
  })

  describe('handleFilter', () => {
    it('should toggle filter and add overflow-hidden class', () => {
      component.handleFilter(true)

      expect(component.toggleFilter).toBe(true)
      expect(mockDocument.body.classList.add).toHaveBeenCalledWith('overflow-hidden')
    })

    it('should toggle filter and remove overflow-hidden class', () => {
      component.handleFilter(false)

      expect(component.toggleFilter).toBe(false)
      expect(mockDocument.body.classList.remove).toHaveBeenCalledWith('overflow-hidden')
    })
  })

  describe('handleApplyFilter', () => {
    it('should close filter panel and apply filters', () => {
      const event = { competencyarea: ['Behavioral'], theme: [], subtheme: [] }
      const filterDataSpy = jest.spyOn(component, 'filterData').mockImplementation()

      component.handleApplyFilter(event)

      expect(component.toggleFilter).toBe(false)
      expect(mockDocument.body.classList.remove).toHaveBeenCalledWith('overflow-hidden')
      expect(component.appliedFilter).toEqual(event)
      expect(filterDataSpy).toHaveBeenCalled()
    })
  })

  describe('handleClearFilterObj', () => {
    it('should clear filters and reset to tab view', () => {
      const event = { competencyarea: [], theme: [], subtheme: [] }
      const filterCompetencySpy = jest.spyOn(component, 'filterCompetencyByTab').mockImplementation()

      component.handleClearFilterObj(event)

      expect(component.filterObjData2).toEqual(event)
      expect(component.appliedFilter).toEqual({ competencyarea: [], theme: [], subtheme: [] })
      expect(component.filterApplied).toBe(false)
      expect(filterCompetencySpy).toHaveBeenCalled()
    })
  })

  describe('filterData', () => {
    beforeEach(() => {
      component.myCompetencies = [
        {
          id: 'area1',
          name: 'Behavioral',
          themes: [
            {
              id: 't1',
              name: 'Leadership',
              areaId: 'area1',
              areaName: 'Behavioral',
              subThemes: [{ id: 'st1', name: 'Strategic Leadership' }],
              competencyDetails: [],
              viewMore: false,
              counts: {} as any,
            },
          ],
          subThemes: [],
          counts: {} as any,
        },
        {
          id: 'area2',
          name: 'Functional',
          themes: [
            {
              id: 't2',
              name: 'Technical Skills',
              areaId: 'area2',
              areaName: 'Functional',
              subThemes: [{ id: 'st2', name: 'Programming' }],
              competencyDetails: [],
              viewMore: false,
              counts: {} as any,
            },
          ],
          subThemes: [],
          counts: {} as any,
        },
      ]
    })

    it('should reset to tab view when no filters are applied', () => {
      component.appliedFilter = { competencyarea: [], theme: [], subtheme: [] }
      const filterCompetencySpy = jest.spyOn(component, 'filterCompetencyByTab').mockImplementation()

      component.filterData()

      expect(component.filterApplied).toBe(false)
      expect(filterCompetencySpy).toHaveBeenCalled()
    })

    it('should filter by competency area', () => {
      component.appliedFilter = { competencyarea: ['Behavioral'], theme: [], subtheme: [] }
      jest.spyOn(component, 'filterCompetencyByTab').mockImplementation(() => {
        component.filteredCompetencyArray = [...component.myCompetencies]
      })
      jest.spyOn(component, 'updateShuffledThemes').mockImplementation()

      component.filterData()

      expect(component.filterApplied).toBe(true)
      expect(component.filteredCompetencyArray.length).toBe(1)
      expect(component.filteredCompetencyArray[0].name).toBe('Behavioral')
    })

    it('should filter by theme', () => {
      component.appliedFilter = { competencyarea: [], theme: ['Leadership'], subtheme: [] }
      jest.spyOn(component, 'filterCompetencyByTab').mockImplementation(() => {
        component.filteredCompetencyArray = [...component.myCompetencies]
      })
      jest.spyOn(component, 'updateShuffledThemes').mockImplementation()

      component.filterData()

      expect(component.filteredCompetencyArray.length).toBe(1)
      expect(component.filteredCompetencyArray[0].themes[0].name).toBe('Leadership')
    })

    it('should filter by subtheme', () => {
      component.appliedFilter = { competencyarea: [], theme: [], subtheme: ['Strategic Leadership'] }
      jest.spyOn(component, 'filterCompetencyByTab').mockImplementation(() => {
        component.filteredCompetencyArray = [...component.myCompetencies]
      })
      jest.spyOn(component, 'updateShuffledThemes').mockImplementation()

      component.filterData()

      expect(component.filteredCompetencyArray[0].themes[0].subThemes[0].name).toBe('Strategic Leadership')
    })
  })

  describe('updateShuffledThemes', () => {
    it('should create shuffled flat array of themes', () => {
      component.filteredCompetencyArray = [
        {
          id: 'area1',
          name: 'Behavioral',
          themes: [
            { id: 't1', name: 'Theme 1', areaId: 'area1', areaName: 'Behavioral', subThemes: [], competencyDetails: [], viewMore: false, counts: {} as any },
            { id: 't2', name: 'Theme 2', areaId: 'area1', areaName: 'Behavioral', subThemes: [], competencyDetails: [], viewMore: false, counts: {} as any },
          ],
          subThemes: [],
          counts: {} as any,
        },
      ]

      component.updateShuffledThemes()

      expect(component.shuffledThemes.length).toBe(2)
      expect(component.shuffledThemes[0]).toHaveProperty('areaName')
      expect(component.shuffledThemes[0]).toHaveProperty('theme')
    })

    it('should handle empty filteredCompetencyArray', () => {
      component.filteredCompetencyArray = []

      component.updateShuffledThemes()

      expect(component.shuffledThemes).toEqual([])
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from destroySubject$', () => {
      const unsubscribeSpy = jest.spyOn(component['destroySubject$'], 'unsubscribe')

      component.ngOnDestroy()

      expect(unsubscribeSpy).toHaveBeenCalled()
    })
  })

  describe('translateLabels', () => {
    it('should call translateLabel with correct parameters', () => {
      const result = component.translateLabels('testLabel', 'testType')

      expect(mockLangtranslations.translateLabel).toHaveBeenCalledWith('testLabel', 'testType', '')
      expect(result).toBe('testLabel')
    })
  })
})
