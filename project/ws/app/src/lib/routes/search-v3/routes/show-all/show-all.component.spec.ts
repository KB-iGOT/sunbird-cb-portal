import { ShowAllComponent } from './show-all.component'
import { of, throwError } from 'rxjs'
import { NsContent } from '@sunbird-cb/utils-v2'

describe('ShowAllComponent', () => {
  let component: ShowAllComponent
  let mockGbSearchService: any
  let mockActivatedRoute: any
  let mockTranslateService: any
  let localStorageMock: any

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
      clear: jest.fn(),
      removeItem: jest.fn()
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })

    // Mock GbSearchService
    mockGbSearchService = {
      exploreContent: jest.fn()
    } as any

    // Mock ActivatedRoute
    mockActivatedRoute = {
      snapshot: {
        queryParams: {}
      }
    } as any

    // Mock TranslateService
    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    } as any

    // Create component instance
    component = new ShowAllComponent(
      mockGbSearchService,
      mockActivatedRoute,
      mockTranslateService
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('Constructor', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should set default language and use stored language when websiteLanguage exists in localStorage', () => {
      // Create fresh mocks
      const freshLocalStorage = {
        getItem: jest.fn().mockReturnValue('hi'),
        setItem: jest.fn(),
        clear: jest.fn(),
        removeItem: jest.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: freshLocalStorage,
        writable: true
      })

      const freshTranslateService = {
        setDefaultLang: jest.fn(),
        use: jest.fn()
      } as any

      const newComponent = new ShowAllComponent(
        mockGbSearchService,
        mockActivatedRoute,
        freshTranslateService
      )

      expect(freshTranslateService.setDefaultLang).toHaveBeenCalledWith('en')
      expect(freshLocalStorage.getItem).toHaveBeenCalledWith('websiteLanguage')
      expect(freshTranslateService.use).toHaveBeenCalledWith('hi')
      expect(newComponent).toBeTruthy()
    })

    it('should not set language when websiteLanguage does not exist in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null)

      component = new ShowAllComponent(
        mockGbSearchService,
        mockActivatedRoute,
        mockTranslateService
      )

      expect(mockTranslateService.setDefaultLang).not.toHaveBeenCalled()
      expect(mockTranslateService.use).not.toHaveBeenCalled()
    })

    it('should initialize customOptions with A-Z and Z-A sorting options', () => {
      expect(component.customOptions).toEqual([
        { name: 'A-Z', value: 'a-z' },
        { name: 'Z-A', value: 'z-a' }
      ])
    })

    it('should initialize default values correctly', () => {
      expect(component.courses).toEqual([])
      expect(component.pagedCourses).toEqual([])
      expect(component.initialPaginationSize).toBe(10)
      expect(component.initialPaginationSizeOptions).toEqual([10, 20, 50, 100])
      expect(component.currentPage).toBe(1)
      expect(component.totalPages).toBe(1)
      expect(component.sortKey).toBe('name')
      expect(component.sortOrder).toBe('asc')
      expect(component.loading).toBe(false)
      expect(component.contentName).toBe('')
    })
  })

  describe('ngOnInit', () => {
    it('should get contentName from query params', () => {
      mockActivatedRoute.snapshot.queryParams = { name: 'Test Course' }
      const fetchCoursesSpy = jest.spyOn(component, 'fetchCourses').mockImplementation()

      component.ngOnInit()

      expect(component.contentName).toBe('Test Course')
      expect(fetchCoursesSpy).toHaveBeenCalled()
    })

    it('should set empty contentName when query param name is not present', () => {
      mockActivatedRoute.snapshot.queryParams = {}
      const fetchCoursesSpy = jest.spyOn(component, 'fetchCourses').mockImplementation()

      component.ngOnInit()

      expect(component.contentName).toBe('')
      expect(fetchCoursesSpy).toHaveBeenCalled()
    })

    it('should call fetchCourses on initialization', () => {
      const fetchCoursesSpy = jest.spyOn(component, 'fetchCourses').mockImplementation()

      component.ngOnInit()

      expect(fetchCoursesSpy).toHaveBeenCalled()
    })
  })

  describe('fetchCourses', () => {
    it('should set loading to true before fetching courses', () => {
      mockGbSearchService.exploreContent.mockReturnValue(of({ result: { content: [] } }))

      component.fetchCourses()

      expect(component.loading).toBe(false)
    })

    it('should fetch courses successfully and filter by COURSE primary category', () => {
      const mockResponse = {
        result: {
          content: [
            { identifier: '1', name: 'Course 1', primaryCategory: NsContent.EPrimaryCategory.COURSE },
            { identifier: '2', name: 'Resource 1', primaryCategory: 'Resource' },
            { identifier: '3', name: 'Course 2', primaryCategory: NsContent.EPrimaryCategory.COURSE }
          ]
        }
      }
      mockGbSearchService.exploreContent.mockReturnValue(of(mockResponse))
      const applySortSpy = jest.spyOn(component, 'applySort').mockImplementation()
      const setPageSpy = jest.spyOn(component, 'setPage').mockImplementation()

      component.fetchCourses()

      expect(mockGbSearchService.exploreContent).toHaveBeenCalled()
      expect(component.courses.length).toBe(2)
      expect(component.courses[0].identifier).toBe('1')
      expect(component.courses[1].identifier).toBe('3')
      expect(applySortSpy).toHaveBeenCalled()
      expect(setPageSpy).toHaveBeenCalledWith(1)
      expect(component.loading).toBe(false)
    })

    it('should handle empty response', () => {
      mockGbSearchService.exploreContent.mockReturnValue(of({ result: { content: [] } }))
      const applySortSpy = jest.spyOn(component, 'applySort').mockImplementation()
      const setPageSpy = jest.spyOn(component, 'setPage').mockImplementation()

      component.fetchCourses()

      expect(component.courses).toEqual([])
      expect(applySortSpy).toHaveBeenCalled()
      expect(setPageSpy).toHaveBeenCalledWith(1)
      expect(component.loading).toBe(false)
    })

    it('should handle response without result property', () => {
      mockGbSearchService.exploreContent.mockReturnValue(of({}))
      const applySortSpy = jest.spyOn(component, 'applySort').mockImplementation()
      const setPageSpy = jest.spyOn(component, 'setPage').mockImplementation()

      component.fetchCourses()

      expect(component.courses).toEqual([])
      expect(applySortSpy).toHaveBeenCalled()
      expect(setPageSpy).toHaveBeenCalledWith(1)
      expect(component.loading).toBe(false)
    })

    it('should handle error response and set loading to false', () => {
      const error = { error: 'Failed to fetch courses' }
      mockGbSearchService.exploreContent.mockReturnValue(throwError(() => error))

      component.fetchCourses()

      expect(component.loading).toBe(false)
    })

    it('should filter out non-COURSE content', () => {
      const mockResponse = {
        result: {
          content: [
            { identifier: '1', name: 'Course 1', primaryCategory: NsContent.EPrimaryCategory.COURSE },
            { identifier: '2', name: 'Module 1', primaryCategory: 'Module' },
            { identifier: '3', name: 'Learning Path', primaryCategory: 'Learning Path' }
          ]
        }
      }
      mockGbSearchService.exploreContent.mockReturnValue(of(mockResponse))
      jest.spyOn(component, 'applySort').mockImplementation()
      jest.spyOn(component, 'setPage').mockImplementation()

      component.fetchCourses()

      expect(component.courses.length).toBe(1)
      expect(component.courses[0].primaryCategory).toBe(NsContent.EPrimaryCategory.COURSE)
    })
  })

  describe('applySort', () => {
    beforeEach(() => {
      jest.spyOn(component, 'setPage').mockImplementation()
    })

    it('should sort courses by name in ascending order', () => {
      component.courses = [
        { name: 'Zebra Course', avgRating: 4, createdOn: '2024-01-01' },
        { name: 'Apple Course', avgRating: 5, createdOn: '2024-01-02' },
        { name: 'Mango Course', avgRating: 3, createdOn: '2024-01-03' }
      ]
      component.sortKey = 'name'
      component.sortOrder = 'asc'

      component.applySort()

      expect(component.courses[0].name).toBe('Apple Course')
      expect(component.courses[1].name).toBe('Mango Course')
      expect(component.courses[2].name).toBe('Zebra Course')
      expect(component.setPage).toHaveBeenCalledWith(1)
    })

    it('should sort courses by name in descending order', () => {
      component.courses = [
        { name: 'Apple Course', avgRating: 4, createdOn: '2024-01-01' },
        { name: 'Zebra Course', avgRating: 5, createdOn: '2024-01-02' },
        { name: 'Mango Course', avgRating: 3, createdOn: '2024-01-03' }
      ]
      component.sortKey = 'name'
      component.sortOrder = 'desc'

      component.applySort()

      expect(component.courses[0].name).toBe('Zebra Course')
      expect(component.courses[1].name).toBe('Mango Course')
      expect(component.courses[2].name).toBe('Apple Course')
    })

    it('should sort courses by avgRating in ascending order', () => {
      component.courses = [
        { name: 'Course 1', avgRating: '5', createdOn: '2024-01-01' },
        { name: 'Course 2', avgRating: '3', createdOn: '2024-01-02' },
        { name: 'Course 3', avgRating: '4', createdOn: '2024-01-03' }
      ]
      component.sortKey = 'avgRating'
      component.sortOrder = 'asc'

      component.applySort()

      expect(component.courses[0].avgRating).toBe('3')
      expect(component.courses[1].avgRating).toBe('4')
      expect(component.courses[2].avgRating).toBe('5')
    })

    it('should sort courses by avgRating in descending order', () => {
      component.courses = [
        { name: 'Course 1', avgRating: '3', createdOn: '2024-01-01' },
        { name: 'Course 2', avgRating: '5', createdOn: '2024-01-02' },
        { name: 'Course 3', avgRating: '4', createdOn: '2024-01-03' }
      ]
      component.sortKey = 'avgRating'
      component.sortOrder = 'desc'

      component.applySort()

      expect(component.courses[0].avgRating).toBe('5')
      expect(component.courses[1].avgRating).toBe('4')
      expect(component.courses[2].avgRating).toBe('3')
    })

    it('should sort courses by createdOn date in ascending order', () => {
      component.courses = [
        { name: 'Course 1', avgRating: 4, createdOn: '2024-03-01' },
        { name: 'Course 2', avgRating: 5, createdOn: '2024-01-01' },
        { name: 'Course 3', avgRating: 3, createdOn: '2024-02-01' }
      ]
      component.sortKey = 'createdOn'
      component.sortOrder = 'asc'

      component.applySort()

      expect(component.courses[0].createdOn).toBe('2024-01-01')
      expect(component.courses[1].createdOn).toBe('2024-02-01')
      expect(component.courses[2].createdOn).toBe('2024-03-01')
    })

    it('should sort courses by createdOn date in descending order', () => {
      component.courses = [
        { name: 'Course 1', avgRating: 4, createdOn: '2024-01-01' },
        { name: 'Course 2', avgRating: 5, createdOn: '2024-03-01' },
        { name: 'Course 3', avgRating: 3, createdOn: '2024-02-01' }
      ]
      component.sortKey = 'createdOn'
      component.sortOrder = 'desc'

      component.applySort()

      expect(component.courses[0].createdOn).toBe('2024-03-01')
      expect(component.courses[1].createdOn).toBe('2024-02-01')
      expect(component.courses[2].createdOn).toBe('2024-01-01')
    })

    it('should handle courses with missing avgRating', () => {
      component.courses = [
        { name: 'Course 1', avgRating: null, createdOn: '2024-01-01' },
        { name: 'Course 2', avgRating: '5', createdOn: '2024-01-02' },
        { name: 'Course 3', avgRating: undefined, createdOn: '2024-01-03' }
      ]
      component.sortKey = 'avgRating'
      component.sortOrder = 'asc'

      component.applySort()

      expect(component.courses[0].avgRating).toBe(null)
      expect(component.courses[2].avgRating).toBe('5')
    })

    it('should handle courses with missing createdOn dates', () => {
      component.courses = [
        { name: 'Course 1', avgRating: 4, createdOn: null },
        { name: 'Course 2', avgRating: 5, createdOn: '2024-01-01' },
        { name: 'Course 3', avgRating: 3, createdOn: undefined }
      ]
      component.sortKey = 'createdOn'
      component.sortOrder = 'asc'

      component.applySort()

      expect(component.courses[2].createdOn).toBe('2024-01-01')
    })

    it('should handle case-insensitive name sorting', () => {
      component.courses = [
        { name: 'ZEBRA Course', avgRating: 4, createdOn: '2024-01-01' },
        { name: 'apple Course', avgRating: 5, createdOn: '2024-01-02' },
        { name: 'Mango COURSE', avgRating: 3, createdOn: '2024-01-03' }
      ]
      component.sortKey = 'name'
      component.sortOrder = 'asc'

      component.applySort()

      expect(component.courses[0].name.toLowerCase()).toBe('apple course')
      expect(component.courses[1].name.toLowerCase()).toBe('mango course')
      expect(component.courses[2].name.toLowerCase()).toBe('zebra course')
    })

    it('should handle empty courses array', () => {
      component.courses = []
      component.sortKey = 'name'
      component.sortOrder = 'asc'

      expect(() => component.applySort()).not.toThrow()
      expect(component.courses).toEqual([])
    })
  })

  describe('setSort', () => {
    beforeEach(() => {
      jest.spyOn(component, 'applySort').mockImplementation()
      component.courses = [
        { name: 'Course A', avgRating: 4, createdOn: '2024-01-01' },
        { name: 'Course B', avgRating: 5, createdOn: '2024-01-02' }
      ]
    })

    it('should toggle sort order when same key is selected', () => {
      component.sortKey = 'name'
      component.sortOrder = 'asc'

      component.setSort('name')

      expect(component.sortOrder).toBe('desc')
      expect(component.applySort).toHaveBeenCalled()
    })

    it('should set sort order to asc when different key is selected', () => {
      component.sortKey = 'name'
      component.sortOrder = 'desc'

      component.setSort('avgRating')

      expect(component.sortKey).toBe('avgRating')
      expect(component.sortOrder).toBe('asc')
      expect(component.applySort).toHaveBeenCalled()
    })

    it('should toggle from desc to asc when same key is selected', () => {
      component.sortKey = 'avgRating'
      component.sortOrder = 'desc'

      component.setSort('avgRating')

      expect(component.sortOrder).toBe('asc')
      expect(component.applySort).toHaveBeenCalled()
    })

    it('should handle multiple key changes', () => {
      component.sortKey = 'name'
      component.sortOrder = 'asc'

      component.setSort('avgRating')
      expect(component.sortKey).toBe('avgRating')
      expect(component.sortOrder).toBe('asc')

      component.setSort('createdOn')
      expect(component.sortKey).toBe('createdOn')
      expect(component.sortOrder).toBe('asc')
    })
  })

  describe('setPage', () => {
    beforeEach(() => {
      component.courses = Array.from({ length: 25 }, (_v, i) => ({
        name: `Course ${i + 1}`,
        avgRating: i + 1,
        createdOn: `2024-01-${String(i + 1).padStart(2, '0')}`
      }))
      component.initialPaginationSize = 10
    })

    it('should set the correct page and calculate total pages', () => {
      component.setPage(1)

      expect(component.currentPage).toBe(1)
      expect(component.totalPages).toBe(3)
    })

    it('should slice courses correctly for page 1', () => {
      component.setPage(1)

      expect(component.pagedCourses.length).toBe(10)
      expect(component.pagedCourses[0].name).toBe('Course 1')
      expect(component.pagedCourses[9].name).toBe('Course 10')
    })

    it('should slice courses correctly for page 2', () => {
      component.setPage(2)

      expect(component.pagedCourses.length).toBe(10)
      expect(component.pagedCourses[0].name).toBe('Course 11')
      expect(component.pagedCourses[9].name).toBe('Course 20')
    })

    it('should slice courses correctly for last page', () => {
      component.setPage(3)

      expect(component.pagedCourses.length).toBe(5)
      expect(component.pagedCourses[0].name).toBe('Course 21')
      expect(component.pagedCourses[4].name).toBe('Course 25')
    })

    it('should handle pagination with different page sizes', () => {
      component.initialPaginationSize = 20

      component.setPage(1)

      expect(component.totalPages).toBe(2)
      expect(component.pagedCourses.length).toBe(20)
    })

    it('should handle single page scenario', () => {
      component.courses = Array.from({ length: 5 }, (_v, i) => ({
        name: `Course ${i + 1}`,
        avgRating: i + 1,
        createdOn: '2024-01-01'
      }))
      component.initialPaginationSize = 10

      component.setPage(1)

      expect(component.totalPages).toBe(1)
      expect(component.pagedCourses.length).toBe(5)
    })

    it('should handle empty courses array', () => {
      component.courses = []

      component.setPage(1)

      expect(component.totalPages).toBe(0)
      expect(component.pagedCourses).toEqual([])
    })

    it('should update currentPage property', () => {
      component.setPage(2)

      expect(component.currentPage).toBe(2)
    })
  })

  describe('onPageChange', () => {
    beforeEach(() => {
      jest.spyOn(component, 'setPage').mockImplementation()
      component.courses = Array.from({ length: 50 }, (_v, i) => ({
        name: `Course ${i + 1}`,
        avgRating: i + 1,
        createdOn: '2024-01-01'
      }))
    })

    it('should update currentPage and call setPage', () => {
      const event = { currentPage: 3, limit: 10 }

      component.onPageChange(event)

      expect(component.currentPage).toBe(3)
      expect(component.setPage).toHaveBeenCalledWith(3)
    })

    it('should update initialPaginationSize and call setPage', () => {
      const event = { currentPage: 2, limit: 20 }

      component.onPageChange(event)

      expect(component.initialPaginationSize).toBe(20)
      expect(component.currentPage).toBe(2)
      expect(component.setPage).toHaveBeenCalledWith(2)
    })

    it('should handle page change to first page', () => {
      const event = { currentPage: 1, limit: 10 }

      component.onPageChange(event)

      expect(component.currentPage).toBe(1)
      expect(component.setPage).toHaveBeenCalledWith(1)
    })

    it('should handle different limit values', () => {
      const event = { currentPage: 1, limit: 50 }

      component.onPageChange(event)

      expect(component.initialPaginationSize).toBe(50)
      expect(component.setPage).toHaveBeenCalledWith(1)
    })
  })

  describe('onChangeSortSearch', () => {
    beforeEach(() => {
      jest.spyOn(component, 'applySort').mockImplementation()
      component.courses = [
        { name: 'Course A', avgRating: 4, createdOn: '2024-01-01' },
        { name: 'Course B', avgRating: 5, createdOn: '2024-01-02' }
      ]
    })

    it('should handle most_relevant sorting (no changes)', () => {
      const initialSortKey = component.sortKey
      const initialSortOrder = component.sortOrder

      component.onChangeSortSearch('most_relevant')

      expect(component.sortKey).toBe(initialSortKey)
      expect(component.sortOrder).toBe(initialSortOrder)
      expect(component.applySort).toHaveBeenCalled()
    })

    it('should handle recently_added_newest sorting', () => {
      component.onChangeSortSearch('recently_added_newest')

      expect(component.sortKey).toBe('createdOn')
      expect(component.sortOrder).toBe('desc')
      expect(component.applySort).toHaveBeenCalled()
    })

    it('should handle highest_rated sorting', () => {
      component.onChangeSortSearch('highest_rated')

      expect(component.sortKey).toBe('avgRating')
      expect(component.sortOrder).toBe('desc')
      expect(component.applySort).toHaveBeenCalled()
    })

    it('should handle a-z sorting', () => {
      component.onChangeSortSearch('a-z')

      expect(component.sortKey).toBe('name')
      expect(component.sortOrder).toBe('asc')
      expect(component.applySort).toHaveBeenCalled()
    })

    it('should handle z-a sorting', () => {
      component.onChangeSortSearch('z-a')

      expect(component.sortKey).toBe('name')
      expect(component.sortOrder).toBe('desc')
      expect(component.applySort).toHaveBeenCalled()
    })

    it('should handle unknown sorting option', () => {
      const initialSortKey = component.sortKey
      const initialSortOrder = component.sortOrder

      component.onChangeSortSearch('unknown_option')

      expect(component.sortKey).toBe(initialSortKey)
      expect(component.sortOrder).toBe(initialSortOrder)
      expect(component.applySort).toHaveBeenCalled()
    })

    it('should call applySort for all sorting options', () => {
      const sortOptions = ['most_relevant', 'recently_added_newest', 'highest_rated', 'a-z', 'z-a']

      sortOptions.forEach(option => {
        jest.clearAllMocks()
        component.onChangeSortSearch(option)
        expect(component.applySort).toHaveBeenCalled()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle courses with null or undefined names during sorting', () => {
      component.courses = [
        { name: null, avgRating: 4, createdOn: '2024-01-01' },
        { name: 'Course B', avgRating: 5, createdOn: '2024-01-02' },
        { name: undefined, avgRating: 3, createdOn: '2024-01-03' }
      ]
      component.sortKey = 'name'
      component.sortOrder = 'asc'
      jest.spyOn(component, 'setPage').mockImplementation()

      expect(() => component.applySort()).not.toThrow()
    })

    it('should handle pagination with page size larger than total courses', () => {
      component.courses = [
        { name: 'Course 1', avgRating: 4, createdOn: '2024-01-01' },
        { name: 'Course 2', avgRating: 5, createdOn: '2024-01-02' }
      ]
      component.initialPaginationSize = 100

      component.setPage(1)

      expect(component.totalPages).toBe(1)
      expect(component.pagedCourses.length).toBe(2)
    })

    it('should handle multiple consecutive sort operations', () => {
      component.courses = [
        { name: 'A', avgRating: '1', createdOn: '2024-01-01' },
        { name: 'B', avgRating: '2', createdOn: '2024-01-02' }
      ]
      jest.spyOn(component, 'applySort').mockImplementation()

      component.setSort('name')
      component.setSort('name')
      component.setSort('avgRating')

      expect(component.applySort).toHaveBeenCalledTimes(3)
    })

    it('should handle fetchCourses when exploreContent returns null', () => {
      mockGbSearchService.exploreContent.mockReturnValue(of(null))
      jest.spyOn(component, 'applySort').mockImplementation()
      jest.spyOn(component, 'setPage').mockImplementation()

      component.fetchCourses()

      expect(component.courses).toEqual([])
      expect(component.loading).toBe(false)
    })

    it('should handle special characters in course names during sorting', () => {
      component.courses = [
        { name: '@Course', avgRating: 4, createdOn: '2024-01-01' },
        { name: '#Course', avgRating: 5, createdOn: '2024-01-02' },
        { name: 'ACourse', avgRating: 3, createdOn: '2024-01-03' }
      ]
      component.sortKey = 'name'
      component.sortOrder = 'asc'
      jest.spyOn(component, 'setPage').mockImplementation()

      expect(() => component.applySort()).not.toThrow()
    })

    it('should handle zero courses in pagination', () => {
      component.courses = []
      component.initialPaginationSize = 10

      component.setPage(1)

      expect(component.totalPages).toBe(0)
      expect(component.pagedCourses).toEqual([])
      expect(component.currentPage).toBe(1)
    })
  })

  describe('Integration Tests', () => {
    it('should complete full workflow: fetch, filter, sort, and paginate', () => {
      const mockResponse = {
        result: {
          content: [
            { identifier: '1', name: 'Zebra Course', primaryCategory: NsContent.EPrimaryCategory.COURSE, avgRating: '4', createdOn: '2024-01-01' },
            { identifier: '2', name: 'Apple Course', primaryCategory: NsContent.EPrimaryCategory.COURSE, avgRating: '5', createdOn: '2024-01-02' },
            { identifier: '3', name: 'Mango Resource', primaryCategory: 'Resource', avgRating: '3', createdOn: '2024-01-03' }
          ]
        }
      }
      mockGbSearchService.exploreContent.mockReturnValue(of(mockResponse))

      component.fetchCourses()

      expect(component.courses.length).toBe(2)
      expect(component.courses[0].name).toBe('Apple Course')
      expect(component.pagedCourses.length).toBeLessThanOrEqual(component.initialPaginationSize)
    })

    it('should handle complete sort workflow with page updates', () => {
      component.courses = Array.from({ length: 30 }, (_v, i) => ({
        name: `Course ${String.fromCodePoint(90 - i)}`,
        avgRating: (i + 1).toString(),
        createdOn: `2024-01-${String(i + 1).padStart(2, '0')}`
      }))
      component.initialPaginationSize = 10

      component.onChangeSortSearch('a-z')

      expect(component.sortKey).toBe('name')
      expect(component.sortOrder).toBe('asc')
      expect(component.currentPage).toBe(1)
    })

    it('should handle language change and course fetching together', () => {
      // Create fresh mocks
      const freshLocalStorage = {
        getItem: jest.fn().mockReturnValue('es'),
        setItem: jest.fn(),
        clear: jest.fn(),
        removeItem: jest.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: freshLocalStorage,
        writable: true
      })

      const freshTranslateService = {
        setDefaultLang: jest.fn(),
        use: jest.fn()
      } as any
      const freshGbService = {
        exploreContent: jest.fn()
      } as any

      const mockResponse = {
        result: {
          content: [
            { identifier: '1', name: 'Curso 1', primaryCategory: NsContent.EPrimaryCategory.COURSE }
          ]
        }
      }
      freshGbService.exploreContent.mockReturnValue(of(mockResponse))

      const newComponent = new ShowAllComponent(
        freshGbService,
        mockActivatedRoute,
        freshTranslateService
      )
      newComponent.fetchCourses()

      expect(freshTranslateService.use).toHaveBeenCalledWith('es')
      expect(newComponent.courses.length).toBe(1)
    })
  })
})
