import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core'
import { UtilityService } from '@sunbird-cb/utils-v2'
import { CampaignMicrositeComponent } from './campaign-microsite.component'

describe('CampaignMicrositeComponent', () => {
  const pageConfig = {
    sectionList: [
      { enabled: true, key: 'sectionTopBanner', column: [] },
      { enabled: false, key: 'sectionKeyHighlights', column: [] },
    ],
    individualSection: { caseStudies: { enabled: true } },
    eventDetails: { startDate: '05-07-2026', endDate: '28-11-2026' },
  }

  function create(routeData: any, isMobile = false, pageProviders: any[] = [], beforeCreate?: () => void) {
    TestBed.configureTestingModule({
      imports: [CampaignMicrositeComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: routeData } } },
        { provide: UtilityService, useValue: { isMobile } },
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

  describe('caseStudiesStrip', () => {
    const strip = (path: string) => ({
      key: 'caseStudies',
      viewMoreUrl: { viewMoreText: 'View All', path },
      request: { searchV6: { request: { filters: { identifier: ['do_1'] } } } },
    })
    const withCaseStudies = (caseStudies: any) =>
      create({ pageData: { data: { ...pageConfig, individualSection: { caseStudies } } } })

    it('should be null when disabled', () => {
      expect(withCaseStudies({ enabled: false, contentStrip: { strips: [strip('/app/x')] } }).caseStudiesStrip()).toBeNull()
    })

    it('should be null without strips', () => {
      expect(withCaseStudies({ enabled: true, contentStrip: { strips: [] } }).caseStudiesStrip()).toBeNull()
    })

    it('should be null without a strip config', () => {
      expect(create({ pageData: { data: pageConfig } }).caseStudiesStrip()).toBeNull()
    })

    it('should hand the strip a copy of the config', () => {
      const contentStrip = { strips: [strip('/app/x')] }
      const result = withCaseStudies({ enabled: true, contentStrip }).caseStudiesStrip()
      expect(result).toEqual(contentStrip)
      expect(result).not.toBe(contentStrip)
      expect(result?.strips[0].request).not.toBe(contentStrip.strips[0].request)
    })

    it('should drop View All while its path is a placeholder', () => {
      const contentStrip = { strips: [strip('<CASE_STUDIES_VIEW_ALL_URL>')] }
      const result = withCaseStudies({ enabled: true, contentStrip }).caseStudiesStrip()
      expect(result?.strips[0].viewMoreUrl).toBeUndefined()
      expect(contentStrip.strips[0].viewMoreUrl).toBeDefined()
    })

    it('should hide the section once the strip reports no content', () => {
      const component = withCaseStudies({ enabled: true, contentStrip: { strips: [strip('/app/x')] } })
      component.caseStudiesEmpty.set(true)
      expect(component.caseStudiesStrip()).toBeNull()
    })
  })
})
