import { of, throwError } from 'rxjs'

import { ShowAllComponent } from './show-all.component'

describe('ShowAllComponent (no TestBed)', () => {
  let component: ShowAllComponent
  let mockGbSvc: any
  let mockActivatedRoute: any
  let mockTranslate: any

  const sampleCourses: any[] = [
    { name: 'Alpha', primaryCategory: 'Course', avgRating: 4.5, createdOn: '2024-01-02T00:00:00Z' },
    { name: 'Bravo', primaryCategory: 'Course', avgRating: 3, createdOn: '2023-12-31T00:00:00Z' },
    { name: 'Zulu', primaryCategory: 'Course', avgRating: 5, createdOn: '2024-02-01T00:00:00Z' },
    { name: 'Other Type', primaryCategory: 'Resource', avgRating: 2, createdOn: '2023-01-01T00:00:00Z' },
  ]

  beforeEach(() => {
    mockGbSvc = {
      exploreContent: jest.fn().mockReturnValue(of({ result: { content: sampleCourses } })),
    }

    mockActivatedRoute = {
      snapshot: {
        queryParams: {
          name: 'Test Content',
        },
      },
    }

    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    }

    // ensure localStorage will not break constructor
    if (localStorage.getItem('websiteLanguage')) {
      localStorage.removeItem('websiteLanguage')
    }

    component = new ShowAllComponent(mockGbSvc, mockActivatedRoute, mockTranslate)
  })

  it('should create component instance', () => {
    expect(component).toBeTruthy()
  })

  it('constructor should set translation when websiteLanguage is present', () => {
    localStorage.setItem('websiteLanguage', 'hi')
    const tMock: any = { setDefaultLang: jest.fn(), use: jest.fn() }

    const instance = new ShowAllComponent(mockGbSvc, mockActivatedRoute, tMock)

    expect(instance).toBeTruthy()
    expect(tMock.setDefaultLang).toHaveBeenCalledWith('en')
    expect(tMock.use).toHaveBeenCalledWith('hi')

    localStorage.removeItem('websiteLanguage')
  })

  it('ngOnInit should read contentName from route and fetch courses', () => {
    component.ngOnInit()

    expect(component.contentName).toBe('Test Content')
    expect(mockGbSvc.exploreContent).toHaveBeenCalled()
    expect(component.courses.length).toBe(3) // only Course category
    expect(component.pagedCourses.length).toBeGreaterThan(0)
    expect(component.loading).toBe(false)
  })

  it('fetchCourses should handle error without throwing and stop loading', () => {
    mockGbSvc.exploreContent.mockReturnValue(throwError(() => new Error('network')))

    component.fetchCourses()

    expect(component.loading).toBe(false)
  })

  it('applySort should sort by name ascending and reset to page 1', () => {
    component.courses = sampleCourses.filter(c => c.primaryCategory === 'Course')
    component.sortKey = 'name'
    component.sortOrder = 'asc'

    component.applySort()

    const names = component.courses.map(c => c.name)
    expect(names).toEqual(['Alpha', 'Bravo', 'Zulu'])
    expect(component.currentPage).toBe(1)
  })

  it('applySort should handle avgRating and createdOn', () => {
    component.courses = sampleCourses.filter(c => c.primaryCategory === 'Course')

    component.sortKey = 'avgRating'
    component.sortOrder = 'desc'
    component.applySort()
    const ratings = component.courses.map(c => c.avgRating)
    expect(ratings).toEqual([5, 4.5, 3])

    component.sortKey = 'createdOn'
    component.sortOrder = 'asc'
    component.applySort()
    const dates = component.courses.map(c => c.createdOn)
    expect(dates).toEqual([
      '2023-12-31T00:00:00Z',
      '2024-01-02T00:00:00Z',
      '2024-02-01T00:00:00Z',
    ])
  })

  it('setSort should toggle sortOrder when key is same, or change key', () => {
    component.sortKey = 'name'
    component.sortOrder = 'asc'
    const applySpy = jest.spyOn(component as any, 'applySort')

    component.setSort('name')
    expect(component.sortOrder).toBe('desc')

    component.setSort('avgRating')
    expect(component.sortKey).toBe('avgRating')
    expect(component.sortOrder).toBe('asc')
    expect(applySpy).toHaveBeenCalledTimes(2)
  })

  it('setPage should calculate pagination and slice pagedCourses', () => {
    component.courses = new Array(25).fill(null).map((_, i) => ({ name: `C${i}`, primaryCategory: 'Course' }))
    component.initialPaginationSize = 10

    component.setPage(2)

    expect(component.currentPage).toBe(2)
    expect(component.totalPages).toBe(3)
    expect(component.pagedCourses.length).toBe(10)
  })

  it('onPageChange should update pagination size and page', () => {
    const setPageSpy = jest.spyOn(component as any, 'setPage')

    component.onPageChange({ currentPage: 3, limit: 20 })

    expect(component.currentPage).toBe(3)
    expect(component.initialPaginationSize).toBe(20)
    expect(setPageSpy).toHaveBeenCalledWith(3)
  })

  it('onChangeSortSearch should set sort options and call applySort', () => {
    const applySpy = jest.spyOn(component as any, 'applySort')

    component.onChangeSortSearch('recently_added_newest')
    expect(component.sortKey).toBe('createdOn')
    expect(component.sortOrder).toBe('desc')

    component.onChangeSortSearch('highest_rated')
    expect(component.sortKey).toBe('avgRating')
    expect(component.sortOrder).toBe('desc')

    component.onChangeSortSearch('a-z')
    expect(component.sortKey).toBe('name')
    expect(component.sortOrder).toBe('asc')

    component.onChangeSortSearch('z-a')
    expect(component.sortKey).toBe('name')
    expect(component.sortOrder).toBe('desc')

    component.onChangeSortSearch('most_relevant')
    // most_relevant should not change the existing sort key/order
    expect(component.sortKey).toBe('name')
    expect(component.sortOrder).toBe('desc')

    // applySort is called once per sort option, including most_relevant
    expect(applySpy).toHaveBeenCalledTimes(5)
  })
})

