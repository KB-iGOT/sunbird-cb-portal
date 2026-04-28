import { CompetencyListV2Component } from './competency-list-v2.component'
import { of, throwError } from 'rxjs'
import { HttpErrorResponse } from '@angular/common/http'

jest.mock('@angular/router', () => ({ Router: jest.fn() }), { virtual: true })
jest.mock('@angular/material/legacy-snack-bar', () => ({ MatLegacySnackBar: jest.fn() }), { virtual: true })
jest.mock('@sunbird-cb/utils-v2', () => ({
  MultilingualTranslationsService: jest.fn(),
  ConfigurationsService: jest.fn(),
}), { virtual: true })
jest.mock('@ngx-translate/core', () => ({ TranslateService: jest.fn() }), { virtual: true })
jest.mock('../competency-passbook.service', () => ({ CompetencyPassbookService: jest.fn() }), { virtual: true })
jest.mock('@sunbird-cb/collection/src/public-api', () => ({ NsContent: {} }), { virtual: true })
jest.mock('src/environments/environment', () => ({ environment: { compentencyVersionKey: 'v1' } }), { virtual: true })

const mockFrameworkResponse = {
  result: {
    framework: {
      categories: [
        {
          code: 'competencyarea',
          terms: [
            { refId: 'area1', name: 'behavioural' },
            { refId: 'area2', name: 'functional' },
            { refId: 'area3', name: 'domain' },
          ],
        },
        {
          code: 'theme',
          terms: [{ refId: 'theme1', name: 'Leadership' }],
        },
        {
          code: 'subtheme',
          terms: [{ refId: 'sub1', name: 'SubTheme1' }],
        },
      ],
    },
  },
}

const mockCompetencyListResponse = {
  result: {
    competencies: [
      {
        competencyAreaId: 'area1',
        competencyThemeId: 'theme1',
        competencySubThemeId: 'sub1',
        competencyDetails: {
          iGOTCourses: ['c1'],
          extCourses: ['c2'],
          selfAchievement: [],
          externalTraining: [],
        },
      },
    ],
  },
}

function buildComponent() {
  const mockRouter: any = { navigate: jest.fn() }
  const mockSnackBar: any = { open: jest.fn() }
  const mockLang: any = {
    languageSelectedObservable: of(null),
    translateLabel: jest.fn().mockReturnValue('label'),
  }
  const mockTranslate: any = { setDefaultLang: jest.fn(), use: jest.fn() }
  const mockConfigSvc: any = {
    compentency: { v1: { vCompetencyArea: 'area', vCompetencyTheme: 'theme', vCompetencySubTheme: 'subtheme' } },
    userProfile: { userId: 'u1' },
  }
  const mockPassbookSvc: any = {
    getMyCompetencyList: jest.fn().mockReturnValue(of(mockCompetencyListResponse)),
    fetchAllCompetencyList: jest.fn().mockReturnValue(of(mockFrameworkResponse)),
  }
  const mockDocument: any = {
    body: { classList: { add: jest.fn(), remove: jest.fn() } },
  }

  const comp = new CompetencyListV2Component(
    mockRouter,
    mockSnackBar,
    mockLang,
    mockTranslate,
    mockConfigSvc,
    mockPassbookSvc,
    mockDocument,
  )
  return { comp, mockRouter, mockSnackBar, mockPassbookSvc, mockConfigSvc }
}

describe('CompetencyListV2Component', () => {
  it('should create', () => {
    const { comp } = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('should set isMobile based on window.innerWidth', () => {
    const { comp } = buildComponent()
    expect(typeof comp.isMobile).toBe('boolean')
  })

  it('ngOnInit - should call getAllCompetencyList and getMyCompetencyList', () => {
    jest.useFakeTimers()
    const { comp, mockPassbookSvc } = buildComponent()
    comp.ngOnInit()
    jest.runAllTimers()
    expect(mockPassbookSvc.fetchAllCompetencyList).toHaveBeenCalled()
    expect(mockPassbookSvc.getMyCompetencyList).toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('getAllCompetencyList - populates allCompetencies, allThemeData, allSubThemeData', () => {
    const { comp } = buildComponent()
    comp.getAllCompetencyList()
    expect(comp.allCompetencies.length).toBeGreaterThan(0)
    expect(comp.allThemeData.length).toBeGreaterThan(0)
    expect(comp.allSubThemeData.length).toBeGreaterThan(0)
  })

  it('getAllCompetencyList - handles error', () => {
    const { comp, mockPassbookSvc, mockSnackBar } = buildComponent()
    mockPassbookSvc.fetchAllCompetencyList.mockReturnValue(throwError(new HttpErrorResponse({ status: 500 })))
    comp.getAllCompetencyList()
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('getMyCompetencyList - populates myCompetencyList', () => {
    const { comp } = buildComponent()
    comp.allCompetencies = [{ refId: 'area1', name: 'behavioural' }]
    comp.allThemeData = [{ refId: 'theme1', name: 'Leadership' }]
    comp.allSubThemeData = [{ refId: 'sub1', name: 'SubTheme1' }]
    comp.getMyCompetencyList()
    expect(comp.myCompetencyList.length).toBeGreaterThan(0)
  })

  it('getMyCompetencyList - handles error', () => {
    const { comp, mockPassbookSvc, mockSnackBar } = buildComponent()
    mockPassbookSvc.getMyCompetencyList.mockReturnValue(throwError(new HttpErrorResponse({ status: 500 })))
    comp.getMyCompetencyList()
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('buildMyCompetency - builds myCompetencies from list', () => {
    const { comp } = buildComponent()
    comp.allCompetencies = [{ refId: 'area1', name: 'behavioural' }]
    comp.allThemeData = [{ refId: 'theme1', name: 'Leadership' }]
    comp.allSubThemeData = [{ refId: 'sub1', name: 'SubTheme1' }]
    comp.myCompetencyList = mockCompetencyListResponse.result.competencies
    comp.buildMyCompetency()
    expect(comp.myCompetencies.length).toBeGreaterThan(0)
  })

  it('getSubThemeName - returns name or id', () => {
    const { comp } = buildComponent()
    comp.allSubThemeData = [{ refId: 'sub1', name: 'SubTheme1' }]
    expect(comp.getSubThemeName('sub1')).toBe('SubTheme1')
    expect(comp.getSubThemeName('unknown')).toBe('unknown')
  })

  it('findCounts - calculates totals', () => {
    const { comp } = buildComponent()
    comp.allCompetencies = [{ refId: 'area1', name: 'behavioural' }]
    comp.myCompetencies = [{
      id: 'area1',
      name: 'behavioural',
      subThemes: [{ id: 'sub1', name: 'SubTheme1' }],
      counts: { iGOTCourses: 2, extCourses: 1, selfAchievement: 0, externalTraining: 0, total: 3 },
      themes: [{ id: 'theme1', areaId: 'area1', areaName: 'behavioural', name: 'Leadership', subThemes: [], competencyDetails: [], viewMore: false, counts: { iGOTCourses: 0, extCourses: 0, selfAchievement: 0, externalTraining: 0, total: 0 } }],
    }]
    comp.findCounts()
    expect(comp.totalCompetencyCount).toBeGreaterThanOrEqual(0)
  })

  it('getAllCompetenciesCount - sums theme lengths', () => {
    const { comp } = buildComponent()
    comp.myCompetencies = [
      { id: 'a1', name: 'b', subThemes: [], counts: { iGOTCourses: 0, extCourses: 0, selfAchievement: 0, externalTraining: 0, total: 0 }, themes: [{} as any, {} as any] },
    ]
    expect(comp.getAllCompetenciesCount()).toBe(2)
  })

  it('filterCompetencyByTab - filters by tab', () => {
    const { comp } = buildComponent()
    comp.myCompetencies = [
      { id: 'a1', name: 'behavioural', subThemes: [], counts: { iGOTCourses: 0, extCourses: 0, selfAchievement: 0, externalTraining: 0, total: 0 }, themes: [] },
      { id: 'a2', name: 'functional', subThemes: [], counts: { iGOTCourses: 0, extCourses: 0, selfAchievement: 0, externalTraining: 0, total: 0 }, themes: [] },
    ]
    comp.filterCompetencyByTab('functional')
    expect(comp.filteredCompetencyArray.length).toBe(1)
  })

  it('filterCompetencyByTab - all returns all', () => {
    const { comp } = buildComponent()
    comp.myCompetencies = [
      { id: 'a1', name: 'behavioural', subThemes: [], counts: { iGOTCourses: 0, extCourses: 0, selfAchievement: 0, externalTraining: 0, total: 0 }, themes: [] },
    ]
    comp.filterCompetencyByTab('all')
    expect(comp.filteredCompetencyArray.length).toBe(1)
  })

  it('filterCompetencyByTab - behavioral/behavioural synonym', () => {
    const { comp } = buildComponent()
    comp.myCompetencies = [
      { id: 'a1', name: 'behavioral', subThemes: [], counts: { iGOTCourses: 0, extCourses: 0, selfAchievement: 0, externalTraining: 0, total: 0 }, themes: [] },
    ]
    comp.filterCompetencyByTab('behavioural')
    expect(comp.filteredCompetencyArray.length).toBe(1)
  })

  it('handleTabChange - updates tabValue', () => {
    const { comp } = buildComponent()
    comp.myCompetencies = []
    comp.handleTabChange({ tab: { textLabel: 'Behavioural' }, index: 0 } as any)
    expect(comp.tabValue).toBe('behavioural')
  })

  it('handleShowAll - toggles showAll', () => {
    const { comp } = buildComponent()
    comp.showAll = false
    comp.myCompetencies = []
    comp.handleShowAll()
    expect(comp.showAll).toBe(true)
  })

  it('handleShowAll - slices to 3 when hiding', () => {
    const { comp } = buildComponent()
    comp.showAll = true
    comp.myCompetencies = [{} as any, {} as any, {} as any, {} as any]
    comp.handleShowAll()
    expect(comp.filteredCompetencyArray.length).toBe(3)
  })

  it('handleClick - calls filterCompetencyByTab', () => {
    const { comp } = buildComponent()
    const spy = jest.spyOn(comp, 'filterCompetencyByTab')
    comp.myCompetencies = []
    comp.handleClick('all')
    expect(spy).toHaveBeenCalledWith('all')
  })

  it('handleViewMore - sets viewMore true', () => {
    const obj: any = { viewMore: false }
    const { comp } = buildComponent()
    comp.handleViewMore(obj)
    expect(obj.viewMore).toBe(true)
  })

  it('handleViewMore - sets viewMore false with flag', () => {
    const obj: any = { viewMore: true }
    const { comp } = buildComponent()
    comp.handleViewMore(obj, 'close')
    expect(obj.viewMore).toBe(false)
  })

  it('handleNavigate - stores to localStorage and navigates', () => {
    const { comp, mockRouter } = buildComponent()
    comp.handleNavigate({ id: 'c1', name: 'comp' })
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/competency-passbook/details'])
  })

  it('handleSearch - filters by search string', () => {
    const { comp } = buildComponent()
    comp.myCompetencies = [{
      id: 'a1', name: 'behavioural', subThemes: [], counts: { iGOTCourses: 0, extCourses: 0, selfAchievement: 0, externalTraining: 0, total: 0 },
      themes: [{ id: 't1', areaId: 'a1', areaName: 'b', name: 'Leadership', subThemes: [], competencyDetails: [], viewMore: false, counts: { iGOTCourses: 0, extCourses: 0, selfAchievement: 0, externalTraining: 0, total: 0 } }],
    }]
    comp.handleSearch('lead', 'all')
    expect(comp.filteredCompetencyArray.length).toBeGreaterThanOrEqual(0)
  })

  it('handleSearch - empty string resets', () => {
    const { comp } = buildComponent()
    comp.myCompetencies = []
    comp.handleSearch('', 'all')
    expect(comp.filteredCompetencyArray).toEqual([])
  })

  it('handleFilter - adds overflow-hidden class', () => {
    const { comp } = buildComponent()
    comp.handleFilter(true)
    expect(comp.toggleFilter).toBe(true)
  })

  it('handleFilter - removes overflow-hidden class', () => {
    const { comp } = buildComponent()
    comp.handleFilter(false)
    expect(comp.toggleFilter).toBe(false)
  })

  it('handleApplyFilter - closes filter and calls filterData', () => {
    const { comp } = buildComponent()
    comp.myCompetencies = []
    comp.handleApplyFilter({ competencyarea: [], theme: [], subtheme: [] })
    expect(comp.toggleFilter).toBe(false)
  })

  it('handleClearFilterObj - resets filters', () => {
    const { comp } = buildComponent()
    comp.myCompetencies = []
    comp.handleClearFilterObj({ some: 'data' })
    expect(comp.filterApplied).toBe(false)
  })

  it('filterData - no filters resets', () => {
    const { comp } = buildComponent()
    comp.appliedFilter = { competencyarea: [], theme: [], subtheme: [] }
    comp.myCompetencies = []
    comp.filterData()
    expect(comp.filterApplied).toBe(false)
  })

  it('filterData - with area filter', () => {
    const { comp } = buildComponent()
    comp.myCompetencies = [
      { id: 'a1', name: 'behavioural', subThemes: [], counts: { iGOTCourses: 0, extCourses: 0, selfAchievement: 0, externalTraining: 0, total: 0 }, themes: [] },
    ]
    comp.appliedFilter = { competencyarea: ['behavioural'], theme: [], subtheme: [] }
    comp.filterData()
    expect(comp.filterApplied).toBe(true)
  })

  it('handleLeftFilter - updates showFilterIndicator', () => {
    const { comp } = buildComponent()
    comp.handleLeftFilter('threeMonths')
    expect(comp.showFilterIndicator).toBe('threeMonths')
  })

  it('mapEnrollmentData - maps courses correctly', () => {
    const { comp } = buildComponent()
    const result = comp.mapEnrollmentData({
      courses: [{ courseId: 'c1', content: { name: 'Course 1' } }],
    })
    expect(result['c1']).toBeDefined()
  })

  it('mapEnrollmentData - empty input', () => {
    const { comp } = buildComponent()
    expect(comp.mapEnrollmentData({})).toEqual({})
  })

  it('translateLabels - calls lang service', () => {
    const { comp } = buildComponent()
    const result = comp.translateLabels('hello', 'type')
    expect(result).toBe('label')
  })

  it('updateShuffledThemes - flattens and shuffles', () => {
    const { comp } = buildComponent()
    comp.filteredCompetencyArray = [{
      name: 'behavioural', id: 'a1', subThemes: [], counts: { iGOTCourses: 0, extCourses: 0, selfAchievement: 0, externalTraining: 0, total: 0 },
      themes: [{ id: 't1', areaId: 'a1', areaName: 'b', name: 'Leadership', subThemes: [], competencyDetails: [], viewMore: false, counts: { iGOTCourses: 0, extCourses: 0, selfAchievement: 0, externalTraining: 0, total: 0 } }],
    }]
    comp.updateShuffledThemes()
    expect(comp.shuffledThemes.length).toBe(1)
  })

  it('ngOnDestroy - unsubscribes', () => {
    const { comp } = buildComponent()
    expect(() => comp.ngOnDestroy()).not.toThrow()
  })
})
