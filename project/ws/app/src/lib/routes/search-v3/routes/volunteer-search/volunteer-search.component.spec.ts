import { of } from 'rxjs'

jest.mock('@ws/author', () => ({
  SEARCH_SORT_DROPDOWN: [],
}))

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn(),
  EventService: jest.fn(),
  ValueService: jest.fn(),
}), { virtual: true })

jest.mock('@sunbird-cb/consumption', () => ({
  ContentDictionaryService: jest.fn(),
}), { virtual: true })

jest.mock('@sunbird-cb/collection', () => ({
  NsContent: {
    EPrimaryCategory: {
      COURSE: 'Course',
      RESOURCE: 'Learning Resource',
    },
  },
}), { virtual: true })

import { VolunteerSearchComponent } from './volunteer-search.component'

describe('VolunteerSearchComponent', () => {
  const createComponent = (volunteerSearch: any = {}) => {
    const configSvc: any = {
      compentency: {
        '': {
          vKey: 'competencies_v6',
          vCompetencyArea: 'competencyAreaName',
          vCompetencyTheme: 'competencyThemeName',
          vCompetencySubTheme: 'competencySubThemeName',
        },
      },
      instanceConfig: { volunteerSearch },
      userProfile: null,
    }

    return new VolunteerSearchComponent(
      {} as any,
      configSvc,
      { raiseInteractTelemetry: jest.fn() } as any,
      {} as any,
      { isLtMedium$: of(false) } as any,
      {
        setDefaultLang: jest.fn(),
        use: jest.fn(),
        get: jest.fn().mockReturnValue(of('No results found')),
      } as any,
      { navigate: jest.fn() } as any,
      {} as any,
    )
  }

  beforeEach(() => localStorage.clear())

  it('requests Course and Learning Resource without the generic courseCategory filter', () => {
    const component: any = createComponent({ courseCategory: ['course'] })

    component.resetSearchParams()
    const request = component.buildCompositeRequest()

    expect(request.request.filters.primaryCategory).toEqual(['Course', 'Learning Resource'])
    expect(request.request.filters.courseCategory).toBeUndefined()
    expect(request.request.filters.status).toBe('Live')
  })

  it('preserves a specific courseCategory supplied by configuration', () => {
    const component: any = createComponent({ courseCategory: ['Moderated Course'] })

    component.resetSearchParams()
    const request = component.buildCompositeRequest()

    expect(request.request.filters.courseCategory).toEqual(['Moderated Course'])
    expect(request.request.filters.primaryCategory).toEqual(['Course', 'Learning Resource'])
  })

  it('uses configured primary categories without changing the configuration array', () => {
    const primaryCategory = ['Course', 'Learning Resource', 'Case Study']
    const component: any = createComponent({ courseCategory: ['course'], primaryCategory })

    component.resetSearchParams()
    component.searchRequestCourse.request.filters.primaryCategory.push('Program')

    expect(primaryCategory).toEqual(['Course', 'Learning Resource', 'Case Study'])
  })
})
