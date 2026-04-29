import { FilterService } from './filter.service'
import { of } from 'rxjs'

describe('FilterService', () => {
  let service: FilterService
  let mockHttp: any

  beforeEach(() => {
    localStorage.clear()
    mockHttp = { get: jest.fn(() => of({ en: { key: 'value' } })) }
    service = new FilterService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('defaultFiltersTranslated returns en and all keys', () => {
    const result = service.defaultFiltersTranslated
    expect(result).toHaveProperty('en')
    expect(result).toHaveProperty('all')
  })

  it('translateSearchFilters returns en data when lang is single and not cached', async () => {
    mockHttp.get.mockReturnValue(of({ hello: 'world' }))
    const result = await service.translateSearchFilters('fr')
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('fr'))
    expect(result).toEqual({ hello: 'world' })
  })

  it('translateSearchFilters uses cached data when lang already translated', async () => {
    const cached = { en: {}, all: {}, hi: { greeting: 'namaste' } }
    localStorage.setItem('filtersTranslation', JSON.stringify(cached))
    const result = await service.translateSearchFilters('hi')
    expect(mockHttp.get).not.toHaveBeenCalled()
    expect(result).toEqual({ greeting: 'namaste' })
  })

  it('translateSearchFilters returns en fallback for multi-lang string', async () => {
    const result = await service.translateSearchFilters('en,hi')
    expect(result).toEqual({})
  })

  it('translateSearchFilters returns en translation from cache for multi-lang', async () => {
    const cached = { en: { key: 'enValue' }, all: {} }
    localStorage.setItem('filtersTranslation', JSON.stringify(cached))
    const result = await service.translateSearchFilters('en,hi')
    expect(result).toEqual({ key: 'enValue' })
  })
})
