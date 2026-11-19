import { of } from 'rxjs'

jest.mock('@sunbird-cb/consumption', () => ({
  WidgetContentLibService: class { },
  WidgetUserServiceLib: class { },
}))
jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: class { },
  EventService: class { },
  MultilingualTranslationsService: class { },
  WsEvents: {},
}))
jest.mock('../../services/see-all.service', () => ({
  SeeAllService: class { },
}))

import { SeeAllHomeComponent } from './see-all-home.component'

describe('SeeAllHomeComponent', () => {
  let component: any
  let mocks: any

  const DEFAULT_NOTE = 'Use your Karma Coins to enrol in paid courses from providers marked with this badge.'

  const ciosStrip = (key = 'extContent') => ({
    key,
    title: 'Providers',
    request: { ciosContent: { pageNumber: 0, pageSize: 20 } },
  })

  const plainStrip = (key = 'trendingOnIgot') => ({ key, title: 'Trending' })

  const buildMocks = () => ({
    activated: { queryParams: of({}) },
    router: { navigate: jest.fn() },
    seeAllSvc: { getSeeAllFormsConfigJson: jest.fn().mockResolvedValue({}) },
    configSvc: { userProfile: { userId: 'user-1' } },
    userSvc: { fetchUserBatchList: jest.fn() },
    eventSvc: { raiseInteractTelemetry: jest.fn() },
    langtranslations: { translateLabel: jest.fn() },
    consumWidgetSvc: { postApiMethod: jest.fn() },
  })

  beforeEach(() => {
    mocks = buildMocks()
    component = new SeeAllHomeComponent(
      mocks.activated,
      mocks.router,
      mocks.seeAllSvc,
      mocks.configSvc,
      mocks.userSvc,
      mocks.eventSvc,
      mocks.langtranslations,
      mocks.consumWidgetSvc,
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(component.isCoisContent).toBe(false)
  })

  describe('karmaCoinsNote', () => {
    it('returns an empty string for non-CIOS content, even when the tab has a note', () => {
      component.isCoisContent = false

      expect(component.karmaCoinsNote({})).toBe('')
      expect(component.karmaCoinsNote({ karmaCoinsNote: 'Custom note' })).toBe('')
    })

    it('returns the default note for CIOS content when the tab has no note configured', () => {
      component.isCoisContent = true

      expect(component.karmaCoinsNote({ label: 'Providers' })).toBe(DEFAULT_NOTE)
    })

    it('returns the default note for CIOS content when the tab is missing', () => {
      component.isCoisContent = true

      expect(component.karmaCoinsNote(undefined)).toBe(DEFAULT_NOTE)
      expect(component.karmaCoinsNote(null)).toBe(DEFAULT_NOTE)
    })

    it('returns the note configured on the tab for CIOS content', () => {
      component.isCoisContent = true

      expect(component.karmaCoinsNote({ karmaCoinsNote: 'Pay with coins for partner courses.' }))
        .toBe('Pay with coins for partner courses.')
    })

    it('lets the form config hide the note with an empty string', () => {
      component.isCoisContent = true

      expect(component.karmaCoinsNote({ karmaCoinsNote: '' })).toBe('')
    })

    it('reads the note per tab', () => {
      component.isCoisContent = true
      const tabs = [{ karmaCoinsNote: 'First' }, {}, { karmaCoinsNote: 'Third' }]

      expect(tabs.map((tab: any) => component.karmaCoinsNote(tab))).toEqual(['First', DEFAULT_NOTE, 'Third'])
    })
  })

  describe('karmaCoinsNote follows the strip that is loaded', () => {
    const loadStrip = async (strip: any) => {
      mocks.seeAllSvc.getSeeAllFormsConfigJson.mockResolvedValue({ newHomeStrip: [{ strips: [strip] }] })
      component.keyData = strip.key
      await component.loadPage('', '')
    }

    it('shows the note once a CIOS strip has loaded', async () => {
      jest.spyOn(component, 'fetchCiosContentData').mockResolvedValue(undefined)

      await loadStrip(ciosStrip())

      expect(component.isCoisContent).toBe(true)
      expect(component.karmaCoinsNote({})).toBe(DEFAULT_NOTE)
    })

    it('hides the note for a strip without a CIOS request', async () => {
      await loadStrip(plainStrip())

      expect(component.isCoisContent).toBe(false)
      expect(component.karmaCoinsNote({})).toBe('')
    })

    it('drops the note when the page switches from a CIOS strip to another strip', async () => {
      jest.spyOn(component, 'fetchCiosContentData').mockResolvedValue(undefined)

      await loadStrip(ciosStrip())
      expect(component.karmaCoinsNote({})).toBe(DEFAULT_NOTE)

      await loadStrip(plainStrip())
      expect(component.karmaCoinsNote({})).toBe('')
    })

    it('hides the note when no strip matches the key', async () => {
      component.isCoisContent = true
      mocks.seeAllSvc.getSeeAllFormsConfigJson.mockResolvedValue({ newHomeStrip: [{ strips: [plainStrip('other')] }] })
      component.keyData = 'missing'

      await component.loadPage('', '')

      expect(component.isCoisContent).toBe(false)
      expect(component.karmaCoinsNote({})).toBe('')
    })
  })
})
