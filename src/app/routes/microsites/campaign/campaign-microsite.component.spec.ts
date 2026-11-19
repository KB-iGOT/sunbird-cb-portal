import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core'
import { ServerClockService, UtilityService } from '@sunbird-cb/utils-v2'
import { CampaignMicrositeComponent, hasContent, pageGate } from './campaign-microsite.component'

describe('CampaignMicrositeComponent', () => {
  const pageConfig = {
    sectionList: [
      { enabled: true, key: 'sectionTopBanner', column: [] },
      { enabled: false, key: 'sectionKeyHighlights', column: [] },
    ],
    individualSection: { caseStudies: { enabled: true } },
    eventDetails: { startDate: '05-07-2026', endDate: '28-11-2026' },
  }

  // server time the component sees; tests that need another moment set it before create()
  let clockNow = Date.parse('2026-11-10T10:00:00+05:30')

  function create(routeData: any, isMobile = false, pageProviders: any[] = [], beforeCreate?: () => void) {
    TestBed.configureTestingModule({
      imports: [CampaignMicrositeComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: routeData } } },
        { provide: UtilityService, useValue: { isMobile } },
        { provide: ServerClockService, useValue: { now: () => clockNow } },
      ],
    })
    // Shared consumption components are not under test here
    TestBed.overrideComponent(CampaignMicrositeComponent, {
      set: { imports: [], schemas: [CUSTOM_ELEMENTS_SCHEMA], providers: pageProviders },
    })
    beforeCreate?.()
    return TestBed.createComponent(CampaignMicrositeComponent).componentInstance
  }

  describe('page TranslateService', () => {
    // Stands in for the isolated service ContentStripWithTabsLibModule's forRoot creates
    const ownService = [TranslateService, { provide: TranslateStore, useClass: TranslateStore }]
    const pageTranslate = (component: CampaignMicrositeComponent) => (component as any).translate as TranslateService

    afterEach(() => localStorage.removeItem('websiteLanguage'))

    it('follows the app language and its changes', () => {
      const component = create({}, false, ownService, () => TestBed.inject(TranslateService).use('hi'))
      expect(pageTranslate(component)).not.toBe(TestBed.inject(TranslateService))
      expect(pageTranslate(component).currentLang).toBe('hi')
      TestBed.inject(TranslateService).use('ta')
      expect(pageTranslate(component).currentLang).toBe('ta')
    })

    it('falls back to the website language when the app has none', () => {
      localStorage.setItem('websiteLanguage', 'bn')
      expect(pageTranslate(create({}, false, ownService)).currentLang).toBe('bn')
    })

    it('leaves the app service alone when the page shares it', () => {
      const component = create({})
      expect(pageTranslate(component)).toBe(TestBed.inject(TranslateService))
      expect(pageTranslate(component).currentLang).toBeUndefined()
    })
  })

  it('should read enabled sections from the resolved page config', () => {
    const component = create({ pageData: { data: pageConfig } })
    expect(component.sectionList().map(s => s.key)).toEqual(['sectionTopBanner'])
    expect(component.individualSection()).toEqual(pageConfig.individualSection)
    expect(component.eventDetails()).toEqual(pageConfig.eventDetails)
  })

  it('should keep defaults when page config is missing', () => {
    const component = create({})
    expect(component.sectionList()).toEqual([])
    expect(component.individualSection()).toEqual({})
    expect(component.eventDetails()).toBeUndefined()
  })

  it('should hide key highlights only when reported empty', () => {
    const component = create({ pageData: { data: pageConfig } })
    component.hideKeyHighlight(false, 'keyHighlightsSection')
    expect(component.isColumnHidden('keyHighlightsSection')).toBe(false)
    component.hideKeyHighlight(true, 'keyHighlightsSection')
    expect(component.isColumnHidden('keyHighlightsSection')).toBe(true)
  })

  describe('contentAreas (mainContentSection)', () => {
    const data = {
      mobileKeys: ['caseStudies', 'programmeMilestones'],
      deskTopKeys: {
        leftContent: { colspan: 8, data: ['programmeMilestones'] },
        rightContent: { colspan: 4, data: ['caseStudies'] },
      },
    } as any

    it('should return the left and right areas on desktop', () => {
      expect(create({}).contentAreas(data)).toEqual([data.deskTopKeys.leftContent, data.deskTopKeys.rightContent])
    })

    it('should drop areas without widget keys', () => {
      const leftOnly = { deskTopKeys: { leftContent: { colspan: 12, data: ['programmeMilestones'] }, rightContent: { data: [] } } } as any
      expect(create({}).contentAreas(leftOnly)).toEqual([leftOnly.deskTopKeys.leftContent])
    })

    it('should stack mobileKeys in one full-width area on mobile', () => {
      expect(create({}, true).contentAreas(data)).toEqual([{ colspan: 12, data: ['caseStudies', 'programmeMilestones'] }])
    })

    it('should fall back to the desktop areas on mobile without mobileKeys', () => {
      const noMobile = { deskTopKeys: data.deskTopKeys }
      expect(create({}, true).contentAreas(noMobile)).toEqual([data.deskTopKeys.leftContent, data.deskTopKeys.rightContent])
    })

    it('should return nothing without data', () => {
      expect(create({}).contentAreas(undefined)).toEqual([])
    })
  })

  describe('caseStudies', () => {
    const content = { identifier: 'do_1', name: 'Case study 1', appIcon: 'https://x/1.jpg', primaryCategory: 'Course' }
    const contentConfig = (extra: any = {}) => ({
      cardType: 'courseCard',
      contents: [content],
      maxCardsToShow: 12,
      showViewAll: true,
      viewMoreUrl: { path: '/app/x' },
      cardClickDetails: { courseCategory: 'Course' },
      ...extra,
    })
    const withCaseStudies = (caseStudies: any) =>
      create({ pageData: { data: { ...pageConfig, individualSection: { caseStudies } } } })

    it('should be null when disabled', () => {
      expect(withCaseStudies({ enabled: false, contentConfig: contentConfig() }).caseStudies()).toBeNull()
    })

    it('should be null without contents or content ids', () => {
      expect(withCaseStudies({ enabled: true, contentConfig: contentConfig({ contents: [] }) }).caseStudies()).toBeNull()
    })

    it('should be null without a content config', () => {
      expect(create({ pageData: { data: pageConfig } }).caseStudies()).toBeNull()
    })

    it('should hand the strip a copy of the config with the metadata from the JSON', () => {
      const config = contentConfig()
      const result = withCaseStudies({ enabled: true, header: 'Case Studies', contentConfig: config }).caseStudies()
      expect(result?.header).toBe('Case Studies')
      expect(result?.contentConfig).toEqual(config)
      expect(result?.contentConfig).not.toBe(config)
      expect(result?.contentConfig.contents?.[0]).not.toBe(content)
    })

    it('should still work with only content ids', () => {
      const result = withCaseStudies({ enabled: true, contentConfig: contentConfig({ contents: undefined, contentIds: ['do_1'] }) }).caseStudies()
      expect(result?.contentConfig.contentIds).toEqual(['do_1'])
    })

    it('should drop View All while its path is a placeholder', () => {
      const config = contentConfig({ viewMoreUrl: { path: '<CASE_STUDIES_VIEW_ALL_URL>' } })
      const result = withCaseStudies({ enabled: true, contentConfig: config }).caseStudies()
      expect(result?.contentConfig.showViewAll).toBe(false)
      expect(config.showViewAll).toBe(true)
    })
  })
  describe('contentPills', () => {
    const content = { identifier: 'do_1', name: 'Course 1', appIcon: 'https://x/1.jpg', primaryCategory: 'Course' }
    const pill = (pillKey: string, contentConfig: any = {}, extra: any = {}) => ({
      pillKey,
      pillLabel: pillKey,
      visibilityMode: 'visible',
      contentConfig: {
        cardType: 'courseCard',
        contentIds: ['do_1'],
        maxCardsToShow: 12,
        showViewAll: true,
        viewMoreUrl: { path: '/app/x' },
        cardClickDetails: { courseCategory: 'Course' },
        ...contentConfig,
      },
      ...extra,
    })
    // homepage pills-section format
    const section = (extra: any = {}) => ({
      header: 'Sectoral/Scheme-Specific Courses',
      sectionKey: 'SectoralCourses',
      displayType: 'pills',
      pillEnlarge: false,
      noDataMessage: 'No courses yet',
      defaultPillKey: 'b',
      visibilityMode: 'visible',
      canShowScrollArrow: true,
      pills: [pill('a'), pill('b')],
      ...extra,
    })
    const withPills = (contentPills: any) =>
      create({ pageData: { data: { ...pageConfig, individualSection: { contentPills } } } })

    it('should take the homepage pills section as-is', () => {
      const result = withPills(section()).contentPills()
      expect(result?.header).toBe('Sectoral/Scheme-Specific Courses')
      expect(result?.defaultPillKey).toBe('b')
      expect(result?.pills.map(p => p.pillKey)).toEqual(['a', 'b'])
      expect(result?.section).toEqual(expect.objectContaining({
        sectionKey: 'SectoralCourses', displayType: 'pills', pillEnlarge: false, canShowScrollArrow: true,
      }))
    })

    it('should be null when hidden', () => {
      expect(withPills(section({ visibilityMode: 'hidden' })).contentPills()).toBeNull()
    })

    it('should be null when switched off', () => {
      expect(withPills(section({ enabled: false })).contentPills()).toBeNull()
    })

    it('should be null when no pill has content', () => {
      expect(withPills(section({ pills: [pill('a', { contentIds: [] })] })).contentPills()).toBeNull()
    })

    it('should drop pills without content and accept metadata (contents) as well as ids', () => {
      const pills = [pill('a', { contentIds: [] }), pill('b', { contentIds: undefined, contents: [content] })]
      const result = withPills(section({ pills })).contentPills()
      expect(result?.pills.map(p => p.pillKey)).toEqual(['b'])
      expect(result?.pills[0].contentConfig.contents).toEqual([content])
    })

    it('should give pills the section empty-state text unless they set their own', () => {
      const pills = [pill('a'), pill('b', {}, { noDataMessage: 'Own text' })]
      const result = withPills(section({ pills })).contentPills()
      expect(result?.pills.map(p => p.noDataMessage)).toEqual(['No courses yet', 'Own text'])
    })

    it('should hand the strip copies and drop a placeholder View All', () => {
      const pills = [pill('a', { viewMoreUrl: { path: '<VIEW_ALL_URL>' } })]
      const result = withPills(section({ pills })).contentPills()
      expect(result?.pills[0].contentConfig.showViewAll).toBe(false)
      expect(pills[0].contentConfig.showViewAll).toBe(true)
    })
  })
  describe('hasContent (courseCategories filter)', () => {
    const base = { cardType: 'courseCard', maxCardsToShow: 4, cardClickDetails: { courseCategory: '' }, viewMoreUrl: { path: '' }, showViewAll: false } as any
    const caseStudy = { identifier: 'do_1', courseCategory: 'Case Study' }
    const course = { identifier: 'do_2', courseCategory: 'Course' }

    it('keeps only Case Study metadata when filtered', () => {
      expect(hasContent({ ...base, courseCategories: ['Case Study'], contents: [course] })).toBe(false)
      expect(hasContent({ ...base, courseCategories: ['Case Study'], contents: [course, caseStudy] })).toBe(true)
    })

    it('shows everything without a filter', () => {
      expect(hasContent({ ...base, contents: [course] })).toBe(true)
    })

    it('leaves content ids to the strip, which filters them once loaded', () => {
      expect(hasContent({ ...base, courseCategories: ['Case Study'], contentIds: ['do_2'] })).toBe(true)
    })

    it('is false without a config', () => {
      expect(hasContent(undefined)).toBe(false)
    })
  })
  describe('pageGate (pageAvailability)', () => {
    const window = { startDateTime: '2026-11-05T00:00:00+05:30', endDateTime: '2026-11-28T23:59:59+05:30' }
    const at = (iso: string) => Date.parse(iso)

    it('is open inside the window, at the start and without a config', () => {
      expect(pageGate(window, at('2026-11-10T10:00:00+05:30'))).toBeNull()
      expect(pageGate(window, at('2026-11-05T00:00:00+05:30'))).toBeNull()
      expect(pageGate(undefined, at('2030-01-01T00:00:00Z'))).toBeNull()
    })

    it('shows "not started" before the start, with the start date', () => {
      const gate = pageGate(window, at('2026-11-04T23:59:00+05:30'))
      expect(gate?.state).toBe('notStarted')
      expect(gate?.title).toBe('This event has not started yet')
      expect(gate?.description).not.toContain('{{')
      expect(gate?.buttonUrl).toBe('/page/home')
    })

    it('shows "closed" from the end on', () => {
      expect(pageGate(window, at('2026-11-28T23:59:59+05:30'))?.state).toBe('closed')
      expect(pageGate(window, at('2026-12-01T00:00:00+05:30'))?.title).toBe('This event has closed')
    })

    it('uses the texts from the config, falling back for blank ones', () => {
      const gate = pageGate({ ...window, closed: { title: 'Event over', description: 'Ended {{ date }}', buttonText: '' } },
        at('2026-12-01T00:00:00+05:30'))
      expect(gate?.title).toBe('Event over')
      expect(gate?.description).toMatch(/^Ended \d{1,2} Nov 2026/)
      expect(gate?.buttonText).toBe('Go to home')
    })

    it('is open when switched off or the dates are invalid', () => {
      expect(pageGate({ ...window, enabled: false }, at('2026-12-01T00:00:00+05:30'))).toBeNull()
      expect(pageGate({ startDateTime: 'soon', endDateTime: '' }, at('2026-12-01T00:00:00+05:30'))).toBeNull()
    })

    it('renders only the closed screen once the window has ended', () => {
      clockNow = at('2026-12-01T00:00:00+05:30')
      const component = create({ pageData: { data: { ...pageConfig, pageAvailability: window } } })
      const fixture = TestBed.createComponent(CampaignMicrositeComponent)
      fixture.detectChanges()
      const el: HTMLElement = fixture.nativeElement
      expect(component.gate()?.state).toBe('closed')
      expect(el.querySelector('.cm-gate__title')?.textContent).toContain('This event has closed')
      expect(el.querySelector('.campaign-microsite')).toBeNull()
      clockNow = at('2026-11-10T10:00:00+05:30')
    })
  })
})
