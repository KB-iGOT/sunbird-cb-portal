import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { firstValueFrom, Observable, of, throwError } from 'rxjs'
import {
  CAMPAIGN_MICROSITE_LOCAL_CONFIG,
  CAMPAIGN_MICROSITE_REMOTE_CONFIG,
  campaignMicrositeResolver,
  ICampaignMicrositePageData,
} from './campaign-microsite.resolver'

describe('campaignMicrositeResolver', () => {
  const page = { sectionList: [], individualSection: {} }
  let get: jest.Mock

  const resolve = () => TestBed.runInInjectionContext(() =>
    firstValueFrom(campaignMicrositeResolver({} as any, {} as any) as Observable<ICampaignMicrositePageData>))

  beforeEach(() => {
    get = jest.fn()
    jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    TestBed.configureTestingModule({ providers: [{ provide: HttpClient, useValue: { get } }] })
  })

  afterEach(() => jest.restoreAllMocks())

  it('loads the config from the public API', async () => {
    get.mockReturnValue(of(page))
    expect(await resolve()).toEqual({ data: page, error: null })
    expect(get).toHaveBeenCalledTimes(1)
    expect(get).toHaveBeenCalledWith(CAMPAIGN_MICROSITE_REMOTE_CONFIG)
  })

  it('falls back to the bundled config when the API fails', async () => {
    get.mockImplementation((url: string) => url === CAMPAIGN_MICROSITE_LOCAL_CONFIG ? of(page) : throwError(() => ({ status: 404 })))
    expect(await resolve()).toEqual({ data: page, error: null })
    expect(get.mock.calls.map(call => call[0])).toEqual([CAMPAIGN_MICROSITE_REMOTE_CONFIG, CAMPAIGN_MICROSITE_LOCAL_CONFIG])
  })

  it('falls back when the API does not return a page config (e.g. an HTML error page)', async () => {
    get.mockImplementation((url: string) => of(url === CAMPAIGN_MICROSITE_REMOTE_CONFIG ? '<html></html>' : page))
    expect((await resolve()).data).toEqual(page)
  })

  it('reports an error when nothing loads', async () => {
    get.mockReturnValue(throwError(() => ({ status: 500 })))
    const result = await resolve()
    expect(result.data).toBeNull()
    expect(result.error).toEqual({ status: 500 })
  })
})
