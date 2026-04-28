import { of, throwError } from 'rxjs'
import { ShowAllComponent } from './show-all.component'

describe('ShowAllComponent', () => {
  let component: ShowAllComponent
  let gbSvc: any

  beforeEach(() => {
    localStorage.clear()
    gbSvc = {
      exploreContent: jest.fn(() => of({
        result: {
          content: [
            { name: 'Beta', primaryCategory: 'Course', avgRating: 4, createdOn: '2024-01-01' },
            { name: 'Alpha', primaryCategory: 'Course', avgRating: 5, createdOn: '2025-01-01' },
            { name: 'Other', primaryCategory: 'Resource' },
          ],
        },
      })),
    }
    component = new ShowAllComponent(
      gbSvc,
      { snapshot: { queryParams: { name: 'Courses' } } } as any,
      { setDefaultLang: jest.fn(), use: jest.fn() } as any,
    )
  })

  it('loads courses from query context and filters non-courses', () => {
    component.ngOnInit()
    expect(component.contentName).toBe('Courses')
    expect(component.courses.map(c => c.name)).toEqual(['Alpha', 'Beta'])
    expect(component.pagedCourses).toHaveLength(2)
    expect(component.loading).toBe(false)
  })

  it('sorts by toggled key and known dropdown values', () => {
    component.courses = [
      { name: 'Beta', avgRating: 4, createdOn: '2024-01-01' },
      { name: 'Alpha', avgRating: 5, createdOn: '2025-01-01' },
    ]

    component.setSort('name')
    expect(component.sortOrder).toBe('desc')
    expect(component.pagedCourses[0].name).toBe('Beta')

    component.setSort('avgRating')
    expect(component.sortKey).toBe('avgRating')
    expect(component.sortOrder).toBe('asc')
    component.onChangeSortSearch('highest_rated')
    expect(component.pagedCourses[0].avgRating).toBe(5)
    component.onChangeSortSearch('recently_added_newest')
    expect(component.pagedCourses[0].createdOn).toBe('2025-01-01')
    component.onChangeSortSearch('a-z')
    expect(component.pagedCourses[0].name).toBe('Alpha')
    component.onChangeSortSearch('z-a')
    expect(component.pagedCourses[0].name).toBe('Beta')
    component.onChangeSortSearch('most_relevant')
  })

  it('paginates and handles fetch errors and saved language', () => {
    component.courses = Array.from({ length: 25 }, (_, i) => ({ name: `Course ${i}` }))
    component.setPage(2)
    expect(component.currentPage).toBe(2)
    expect(component.totalPages).toBe(3)
    expect(component.pagedCourses).toHaveLength(10)

    component.onPageChange({ currentPage: 1, limit: 20 })
    expect(component.pagedCourses).toHaveLength(20)

    gbSvc.exploreContent.mockReturnValueOnce(throwError(() => new Error('fail')))
    component.fetchCourses()
    expect(component.loading).toBe(false)

    localStorage.setItem('websiteLanguage', 'hi')
    const translate = { setDefaultLang: jest.fn(), use: jest.fn() }
    const translated = new ShowAllComponent(gbSvc, { snapshot: { queryParams: {} } } as any, translate as any)
    expect(translated).toBeTruthy()
    expect(translate.use).toHaveBeenCalledWith('hi')
  })
})
