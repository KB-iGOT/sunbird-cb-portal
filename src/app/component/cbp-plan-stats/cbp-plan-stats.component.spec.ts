import { CbpPlanStatsComponent } from './cbp-plan-stats.component'
import dayjs from 'dayjs'
import { TranslateService } from '@ngx-translate/core'
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2'

// Mock dependencies
jest.mock('@ngx-translate/core', () => ({
  TranslateService: jest.fn().mockImplementation(() => ({
    setDefaultLang: jest.fn(),
    use: jest.fn(),
  })),
}))

jest.mock('@sunbird-cb/utils-v2', () => ({
  MultilingualTranslationsService: jest.fn().mockImplementation(() => ({
    languageSelectedObservable: { subscribe: jest.fn() },
  })),
}))

describe('CbpPlanStatsComponent', () => {
  let component: CbpPlanStatsComponent
  let translateService: TranslateService
  let langtranslationsService: MultilingualTranslationsService

  beforeEach(() => {
    translateService = new TranslateService(null as any, null as any, null as any,null as any,null as any,null as any,null as any,null as any,null as any)
    langtranslationsService = new MultilingualTranslationsService(null as any,null as any,null as any)

    component = new CbpPlanStatsComponent(translateService, langtranslationsService)
  })

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  
  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize filterList and filterLoaded on init', () => {
    component.ngOnInit()
    expect(component.filterList).toEqual([
      { id: 3, value: 'Last 3 months' },
      { id: 6, value: 'Last 6 months' },
      { id: 12, value: 'Last year' },
    ])
    expect(component.filterLoaded).toBe(false)
  })

  it('should update cbpCount when onfilterChange is called', () => {
    const mockCbpOriginalData = [
      { endDate: dayjs().subtract(2, 'month').toISOString(), planDuration: 'upcoming' },
      { endDate: dayjs().subtract(1, 'month').toISOString(), planDuration: 'overdue' },
    ]
    component.cbpOriginalData = mockCbpOriginalData
    component.cbpLoader = false

    // Mock input data for the filter
    const filterData = { id: 3 } // Last 3 months
    component.onfilterChange(filterData)

    expect(component.cbpCount).toEqual({
      upcoming: 1,
      overdue: 1,
      all: 2,
    })
    expect(component.filterLoaded).toBe(true)
    expect(component.cbpLoader).toBe(false)
  })

  it('should update language on language change', () => {
    const mockLangService = langtranslationsService.languageSelectedObservable
   // const mockLocalStorage = { getItem: jest.fn().mockReturnValue('en') }

    // Simulate the language change
    mockLangService.subscribe()

    // Assert that translate service is called to set the language
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en')
    expect(translateService.use).toHaveBeenCalledWith('en')
  })

  it('should filter data based on the filter criteria', () => {
    const mockCbpOriginalData = [
      { endDate: dayjs().subtract(6, 'month').toISOString(), planDuration: 'upcoming' },
      { endDate: dayjs().subtract(1, 'month').toISOString(), planDuration: 'overdue' },
    ]
    component.cbpOriginalData = mockCbpOriginalData

    const filterData = { id: 6 } // Last 6 months
    component.onfilterChange(filterData)

    const filteredData = component.cbpOriginalData.filter((data: any) => {
      return dayjs(data.endDate).isSameOrAfter(dayjs().subtract(6, 'month')) && dayjs(data.endDate).isSameOrBefore(dayjs())
    })

    expect(filteredData.length).toBe(2)
    expect(component.cbpCount.upcoming).toBe(1)
    expect(component.cbpCount.overdue).toBe(1)
  })
})
