import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { firstValueFrom, Observable, of, throwError } from 'rxjs'
import {
  CAMPAIGN_MICROSITE_LOCAL_CONFIG,
  CAMPAIGN_MICROSITE_REMOTE_CONFIG,
  campaignMicrositeLocalConfig,
  campaignMicrositeResolver,
  ICampaignMicrositePageData,
} from './campaign-microsite.resolver'

describe('campaignMicrositeLocalConfig', () => {
  const dir = '/assets/configurations/feature'

  it.each([
    ['portal.igotkarmayogi.gov.in', 'campaign-microsite.json'],
    ['portal.qa.karmayogibharat.net', 'campaign-microsite-qa.json'],
    ['portal.dev.karmayogibharat.net', 'campaign-microsite-dev.json'],
    ['portal.uat.karmayogibharat.net', 'campaign-microsite-uat.json'],
    ['PORTAL.QA.KARMAYOGIBHARAT.NET', 'campaign-microsite-qa.json'],
    ['iiidem-portal.dev.karmayogibharat.net', 'campaign-microsite-dev.json'],
    ['localhost', 'campaign-microsite.json'],
    ['', 'campaign-microsite.json'],
  ])('%s -> %s', (host, file) => {
    expect(campaignMicrositeLocalConfig(host)).toBe(`${dir}/${file}`)
  })

  it('does not mistake a host that merely contains "qa" for QA', () => {
    expect(campaignMicrositeLocalConfig('qaportal.example.com')).toBe(`${dir}/campaign-microsite.json`)
  })
})

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

  it('loads the published config, the same file on every portal', async () => {
    get.mockReturnValue(of(page))
    expect(await resolve()).toEqual({ data: page, error: null })
    expect(get).toHaveBeenCalledTimes(1)
    expect(get).toHaveBeenCalledWith(CAMPAIGN_MICROSITE_REMOTE_CONFIG)
  })

  it('falls back to the bundled config for this portal when the published one is missing', async () => {
    const local = campaignMicrositeLocalConfig(window.location.hostname)
    get.mockImplementation((url: string) => url === local ? of(page) : throwError(() => ({ status: 404 })))
    expect(await resolve()).toEqual({ data: page, error: null })
    expect(get).toHaveBeenLastCalledWith(local)
  })

  it('falls back when the published file is not a page config (e.g. an HTML error page)', async () => {
    get.mockImplementation((url: string) => of(url === CAMPAIGN_MICROSITE_REMOTE_CONFIG ? '<html></html>' : page))
    expect((await resolve()).data).toEqual(page)
  })

  it('uses the plain bundled file when the portal one is missing too', async () => {
    Object.defineProperty(window, 'location', { value: { ...window.location, hostname: 'portal.qa.karmayogibharat.net' }, configurable: true })
    get.mockImplementation((url: string) => url === CAMPAIGN_MICROSITE_LOCAL_CONFIG ? of(page) : throwError(() => ({ status: 404 })))
    expect(await resolve()).toEqual({ data: page, error: null })
    expect(get.mock.calls.map(call => call[0])).toEqual([
      CAMPAIGN_MICROSITE_REMOTE_CONFIG,
      '/assets/configurations/feature/campaign-microsite-qa.json',
      CAMPAIGN_MICROSITE_LOCAL_CONFIG,
    ])
  })

  it('reports an error when nothing loads', async () => {
    get.mockReturnValue(throwError(() => ({ status: 500 })))
    const result = await resolve()
    expect(result.data).toBeNull()
    expect(result.error).toEqual({ status: 500 })
  })
})
