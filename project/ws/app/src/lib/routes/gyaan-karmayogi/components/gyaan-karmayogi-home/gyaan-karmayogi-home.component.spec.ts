import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { of } from 'rxjs'
import * as fs from 'fs'
import * as path from 'path'

import { GyaanKarmayogiHomeComponent } from './gyaan-karmayogi-home.component'
import { GyaanKarmayogiService } from '../../services/gyaan-karmayogi.service'
import { gyaanConstants } from '../../models/gyaan-contants.model'

// the real service drags in unrelated route services whose imports do not resolve under jest
jest.mock('../../services/gyaan-karmayogi.service', () => ({
  GyaanKarmayogiService: class GyaanKarmayogiService {},
}))

const buildStripConfig = () => ({
  strips: [{
    title: '',
    key: '',
    titleDescription: '',
    viewMoreUrl: { queryParams: { key: '' } },
    request: { searchV6: { request: { filters: {} } } },
  }],
})

const buildRouteData = () => ({
  pageData: {
    data: {
      sliderData: { sliders: [] },
      stripConfig: buildStripConfig(),
      allowedCategories: ['case study'],
    },
  },
  gyaanData: {
    facets: {
      data: [
        { name: gyaanConstants.requestSectorName, values: [{ name: 'Health' }] },
        { name: gyaanConstants.resourceCategory, values: [{ name: 'case study' }, { name: 'not allowed' }] },
      ],
    },
    sector: { data: [{ name: 'health' }] },
  },
})

describe('GyaanKarmayogiHomeComponent', () => {
  let component: GyaanKarmayogiHomeComponent
  let fixture: ComponentFixture<GyaanKarmayogiHomeComponent>

  const translateMock = { setDefaultLang: jest.fn(), use: jest.fn(), instant: jest.fn((key: string) => key) }
  const routerMock = { navigate: jest.fn() }
  const gyaanSvcMock = { searchV6: jest.fn().mockReturnValue(of({ result: { facets: [] } })) }

  beforeEach(async () => {
    jest.useFakeTimers()
    await TestBed.configureTestingModule({
      declarations: [GyaanKarmayogiHomeComponent],
      providers: [
        { provide: TranslateService, useValue: translateMock },
        { provide: ActivatedRoute, useValue: { parent: { snapshot: { data: buildRouteData() } } } },
        { provide: Router, useValue: routerMock },
        { provide: GyaanKarmayogiService, useValue: gyaanSvcMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      // template rendering is not under test here; it pulls in pipes/widgets from other modules
      .overrideTemplate(GyaanKarmayogiHomeComponent, '')
      .compileComponents()

    fixture = TestBed.createComponent(GyaanKarmayogiHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should read banner/page config and facets from the route on init', () => {
    expect(component.pageConfigData).toEqual(buildRouteData().pageData.data)
    expect(component.sectorNames).toEqual(['Health'])
    expect(component.categories).toEqual([{ name: 'case study' }])
    expect(component.stripData.length).toBe(1)
  })

  it('should build a strip per allowed category filtered by sector', () => {
    component.callStrips({ [gyaanConstants.requestSectorName]: ['Health'] })
    const filters = component.stripData[0].strips[0].request.searchV6.request.filters
    expect(filters.resourceCategory).toBe('case study')
    expect(filters[gyaanConstants.requestSectorName]).toEqual(['Health'])
    expect(filters.contentType).toEqual(['Resource', 'Course'])
    expect(component.hideAllStrip).toBe(true)
    jest.advanceTimersByTime(gyaanConstants.timeOutDuration)
    expect(component.hideAllStrip).toBe(false)
  })

  it('should reset the selected sector and pass the query on searchFilter', () => {
    component.selectedSector = 'Health'
    component.searchControl.setValue('water')
    component.searchFilter()
    expect(component.selectedSector).toBe(gyaanConstants.allSectors)
    expect(component.stripData[0].strips[0].request.searchV6.request.query).toBe('water')
  })

  it('should navigate to the view-all page with the selected sector', () => {
    component.selectedSector = 'Health'
    component.viewAllSector()
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app/amrit-gyaan-kosh/view-all'], {
      queryParams: { sector: 'Health', content: 'agkCaseStudies' },
    })
  })

  it('should count empty content strips', () => {
    component.hideContentStrip(true)
    component.hideContentStrip(false)
    expect(component.contentTabEmptyResponseCount).toBe(1)
  })

  // jest-preset-angular does not apply component styles under jsdom, so the banner
  // sizing contract (KB-15694: banner cropped at 150% display scaling) is asserted
  // against the stylesheet source.
  describe('banner styles', () => {
    const scss = fs.readFileSync(path.join(__dirname, 'gyaan-karmayogi-home.component.scss'), 'utf8')
    const bannerRule = (scss.match(/::ng-deep \.banner-image\s*{([^}]*)}/) || [])[1] || ''

    it('should scale the banner with its aspect ratio instead of a fixed height', () => {
      expect(bannerRule).toMatch(/width:\s*100%/)
      expect(bannerRule).toMatch(/height:\s*auto\s*!important/)
      expect(bannerRule).toMatch(/object-fit:\s*contain/)
    })

    it('should not crop the banner with object-fit cover or fixed heights', () => {
      expect(scss).not.toMatch(/banner-image\s*{[^}]*object-fit:\s*cover/)
      expect(scss).not.toMatch(/height:\s*300px\s*!important/)
      expect(scss).not.toMatch(/max-height:\s*230px/)
    })

    it('should drop the slider min-height so short banners leave no gap', () => {
      expect(scss).toMatch(/::ng-deep \.banner-container\s*{\s*min-height:\s*0;?\s*}/)
      expect(bannerRule).toMatch(/min-height:\s*0\s*!important/)
    })
  })
})
