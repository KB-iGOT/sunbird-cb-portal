import { AppChatbotComponent } from './app-chatbot.component'
import { of, Subject } from 'rxjs'

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn(),
  EventService: jest.fn(),
  WsEvents: {
    WsEventType: { Telemetry: 'Telemetry' },
    WsEventLogLevel: { Info: 'Info' },
    EnumTelemetrySubType: { Interact: 'Interact', Chatbot: 'Chatbot', Loaded: 'Loaded', Unloaded: 'Unloaded' },
  },
}), { virtual: true })

jest.mock('lodash', () => {
  const _get = (obj: any, path: string, def?: any) => { try { const p = path.split('.'); let r: any = obj; for (const k of p) { r = r ? r[k] : def }; return r !== undefined ? r : def } catch { return def } }
  return {
    default: { get: _get, startCase: (s: string) => s, isEmpty: (v: any) => !v, find: (a: any[], p: any) => a.find(p), filter: (a: any[], p: any) => a.filter(p) },
    get: _get, startCase: (s: string) => s, isEmpty: (v: any) => !v, find: (a: any[], p: any) => a.find(p), filter: (a: any[], p: any) => a.filter(p),
  }
})

jest.mock('./../root/root.service', () => ({
  RootService: jest.fn(),
}), { virtual: true })

jest.mock('src/environments/environment', () => ({
  environment: { supportEmail: 'test@test.com' },
}), { virtual: true })

jest.mock('@angular/router', () => ({
  NavigationEnd: class NavigationEnd { constructor(public id: number, public url: string, public urlAfterRedirects: string) {} },
  Router: jest.fn(),
}), { virtual: true })

jest.mock('@angular/cdk/drag-drop', () => ({ CdkDragEnd: jest.fn() }), { virtual: true })
jest.mock('@angular/common/http', () => ({ HttpClient: jest.fn() }), { virtual: true })
jest.mock('@angular/platform-browser', () => ({ DomSanitizer: jest.fn() }), { virtual: true })
jest.mock('@angular/material/legacy-dialog', () => ({ MatLegacyDialog: jest.fn() }), { virtual: true })
jest.mock('@ws/app/src/lib/routes/profile-v3/components/dialog-box/dialog-box.component', () => ({
  DialogBoxComponent: jest.fn(),
}), { virtual: true })

function buildComponent() {
  const openSupportSubject = new Subject<any>()
  const routerEventsSubject = new Subject<any>()

  const mockConfigSvc: any = {
    userProfile: { profileImage: '/img.png', professionalDetails: [{ designation: 'Officer' }] },
    iGOTAIConfig: {
      issuesTab: { all: true },
      informationTab: { all: true },
      supportAI: { all: true },
      iGOTAI: { all: true, allDesignation: true, forDesignation: ['Officer'], forOrg: ['org1'] },
    },
    unMappedUser: { userId: 'user1' },
  }
  const mockEventSvc: any = { dispatchChatbotEvent: jest.fn() }
  const mockRenderer: any = {
    listen: jest.fn(),
    addClass: jest.fn(),
    removeClass: jest.fn(),
    setStyle: jest.fn(),
    setAttribute: jest.fn(),
    removeAttribute: jest.fn(),
    createElement: jest.fn(),
    appendChild: jest.fn(),
  }
  const openSupportAIChatbot = openSupportSubject.asObservable()
  const mockChatbotService: any = {
    openSupportAIChatbot,
    getChatData: jest.fn().mockReturnValue(of({ payload: { config: {} } })),
    getLangugages: jest.fn().mockReturnValue(of({ languages: [] })),
    iGOTAIChatHistory: [],
  }
  const mockHttp: any = { get: jest.fn().mockReturnValue(of('<html></html>')) }
  const mockSanitizer: any = { bypassSecurityTrustHtml: jest.fn().mockReturnValue('<safe>') }
  const mockDialog: any = { open: jest.fn().mockReturnValue({ afterClosed: () => of(true) }) }
  const events$ = routerEventsSubject.asObservable()
  const mockRouter: any = { events: events$ }

  const comp = new AppChatbotComponent(
    mockConfigSvc,
    mockEventSvc,
    mockRenderer,
    mockChatbotService,
    mockHttp,
    mockSanitizer,
    mockDialog,
    mockRouter,
  )

  return { comp, mockConfigSvc, mockEventSvc, mockChatbotService, mockHttp, mockSanitizer, openSupportSubject, routerEventsSubject }
}

describe('AppChatbotComponent', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should create the component', () => {
    const { comp } = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('should initialize default properties', () => {
    const { comp } = buildComponent()
    expect(comp.showIcon).toBe(true)
    expect(comp.expanded).toBe(false)
    expect(comp.currentFilter).toBe('information')
  })

  it('ngOnInit - should set userInfo and call checkForApiCalls', () => {
    const { comp, mockChatbotService } = buildComponent()
    mockChatbotService.openSupportAIChatbot = of(false)
    localStorage.setItem('faq-languages', '{}')
    localStorage.setItem('faq', '{}')
    comp.rootOrgId = 'org1'
    comp.iGOTAIConfigLoaded = true
    comp.ngOnInit()
    expect(comp.userInfo).toBeDefined()
  })

  it('ngOnInit - with issuesTab.all enables issue tab', () => {
    const { comp, mockConfigSvc } = buildComponent()
    mockConfigSvc.iGOTAIConfig.issuesTab.all = true
    comp.rootOrgId = 'org1'
    comp.iGOTAIConfigLoaded = true
    comp.ngOnInit()
    expect(comp.enableIssuesTab).toBe(true)
  })

  it('ngOnInit - with supportAI.all enables support AI', () => {
    const { comp } = buildComponent()
    comp.rootOrgId = 'org1'
    comp.iGOTAIConfigLoaded = true
    comp.ngOnInit()
    expect(comp.enableSupportAI).toBe(true)
  })

  it('ngOnInit - openSupportAIChatbot emits true should enable support ai', () => {
    const { comp, openSupportSubject } = buildComponent()
    comp.rootOrgId = 'org1'
    comp.iGOTAIConfigLoaded = true
    comp.ngOnInit()
    openSupportSubject.next(true)
    expect(comp.fromTopNavHelp).toBe(true)
  })

  it('ngOnInit - openSupportAIChatbot emits false sets fromTopNavHelp false', () => {
    const { comp, openSupportSubject } = buildComponent()
    comp.rootOrgId = 'org1'
    comp.iGOTAIConfigLoaded = true
    comp.ngOnInit()
    openSupportSubject.next(false)
    expect(comp.fromTopNavHelp).toBe(false)
  })

  it('ngOnChanges - should update flags when rootOrgId and iGOTAIConfigLoaded set', () => {
    const { comp } = buildComponent()
    comp.rootOrgId = 'org1'
    comp.iGOTAIConfigLoaded = true
    comp.ngOnChanges()
    expect(comp.enableIssuesTab).toBe(true)
    expect(comp.enableSupportAI).toBe(true)
  })

  it('ngOnChanges - without rootOrgId should not execute', () => {
    const { comp } = buildComponent()
    comp.rootOrgId = null
    comp.iGOTAIConfigLoaded = false
    expect(() => comp.ngOnChanges()).not.toThrow()
  })

  it('greetings - should return localized greeting', () => {
    const { comp } = buildComponent()
    comp.selectedLaguage = 'en'
    expect(comp.greetings()).toBe('Namaste')
  })

  it('greetings - returns greeting for default language', () => {
    const { comp } = buildComponent()
    comp.selectedLaguage = 'en'
    expect(() => comp.greetings()).not.toThrow()
  })

  it('getInfoText - should return localized text', () => {
    const { comp } = buildComponent()
    comp.selectedLaguage = 'en'
    expect(comp.getInfoText('information')).toBe('Information')
  })

  it('getInfoText - fallback for unknown key', () => {
    const { comp } = buildComponent()
    expect(comp.getInfoText('unknown')).toBe('unknown')
  })

  it('showMore - should return localized show more', () => {
    const { comp } = buildComponent()
    comp.selectedLaguage = 'hi'
    expect(comp.showMore()).toBe('और दिखाओ')
  })

  it('toggleFilter - should update currentFilter', () => {
    const { comp } = buildComponent()
    localStorage.setItem('faq', '{}')
    localStorage.setItem('faq-languages', '{}')
    comp.toggleFilter('issue')
    expect(comp.currentFilter).toBe('issue')
    expect(comp.more).toBe(false)
  })

  it('pushData - information tab', () => {
    const { comp } = buildComponent()
    comp.currentFilter = 'information'
    comp.pushData({ type: 'incoming', tab: 'information' })
    expect(comp.chatInformation.length).toBe(1)
  })

  it('pushData - issue tab', () => {
    const { comp } = buildComponent()
    comp.currentFilter = 'issue'
    comp.pushData({ type: 'incoming', tab: 'issue' })
    expect(comp.chatIssues.length).toBe(1)
  })

  it('getuserjourney - filters by tab', () => {
    const { comp } = buildComponent()
    comp.userJourney = [{ tab: 'information' }, { tab: 'issue' }]
    expect(comp.getuserjourney('information').length).toBe(1)
  })

  it('selectLaguage - updates language', () => {
    const { comp } = buildComponent()
    localStorage.setItem('faq', '{}')
    localStorage.setItem('faq-languages', '{}')
    comp.selectLaguage({ target: { value: 'hi' } })
    expect(comp.selectedLaguage).toBe('hi')
  })

  it('setDataToLocalStorage - stores data to localStorage', () => {
    const { comp } = buildComponent()
    localStorage.setItem('faq', '{}')
    localStorage.setItem('faq-languages', '{}')
    comp.setDataToLocalStorage({ quesMap: [], recommendationMap: [] })
    const stored = JSON.parse(localStorage.getItem('faq') || '{}')
    expect(stored).toBeDefined()
  })

  it('iconClick start - sets chatId', () => {
    const { comp } = buildComponent()
    comp.dragEnabled = false
    localStorage.setItem('faq', '{}')
    localStorage.setItem('faq-languages', '{}')
    comp.iconClick('start')
    expect(comp.chatId).toBeTruthy()
  })

  it('iconClick end - resets chat', () => {
    const { comp } = buildComponent()
    comp.dragEnabled = false
    localStorage.setItem('faq', '{}')
    localStorage.setItem('faq-languages', '{}')
    comp.iconClick('end')
    expect(comp.chatId).toBe('')
    expect(comp.userJourney).toEqual([])
  })

  it('iconClick - dragEnabled true should not toggle', () => {
    const { comp } = buildComponent()
    comp.dragEnabled = true
    comp.showIcon = true
    comp.iconClick('start')
    expect(comp.showIcon).toBe(true)
  })

  it('raiseCategotyTelemetry - dispatches telemetry event', () => {
    const { comp, mockEventSvc } = buildComponent()
    comp.raiseCategotyTelemetry('cat1')
    expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled()
  })

  it('raiseChatStartTelemetry - information filter', () => {
    const { comp, mockEventSvc } = buildComponent()
    comp.currentFilter = 'information'
    comp.raiseChatStartTelemetry()
    expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled()
  })

  it('raiseChatStartTelemetry - sarthi filter', () => {
    const { comp, mockEventSvc } = buildComponent()
    comp.currentFilter = 'sarthi'
    comp.raiseChatStartTelemetry()
    expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled()
  })

  it('raiseChatStartTelemetry - sarthi + enableSupportAI', () => {
    const { comp, mockEventSvc } = buildComponent()
    comp.currentFilter = 'sarthi'
    comp.enableSupportAI = true
    comp.raiseChatStartTelemetry()
    expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledTimes(2)
  })

  it('raiseChatEndTelemetry - information filter', () => {
    const { comp, mockEventSvc } = buildComponent()
    comp.currentFilter = 'information'
    comp.raiseChatEndTelemetry()
    expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled()
  })

  it('raiseChatEndTelemetry - sarthi filter + supportAI', () => {
    const { comp, mockEventSvc } = buildComponent()
    comp.currentFilter = 'sarthi'
    comp.enableSupportAI = true
    comp.raiseChatEndTelemetry()
    expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledTimes(2)
  })

  it('raiseTemeletyInterat - dispatches interact event', () => {
    const { comp, mockEventSvc } = buildComponent()
    comp.currentFilter = 'information'
    comp.raiseTemeletyInterat('q1')
    expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled()
  })

  it('faqChatBotDisable true when supportAI enabled', () => {
    const { comp } = buildComponent()
    comp.rootOrgId = 'org1'
    comp.iGOTAIConfigLoaded = true
    comp.ngOnChanges()
    expect(comp.faqChatBotDisable).toBe(true)
  })

  it('faqChatBotDisable false when neither supportAI nor iGOTAI', () => {
    const { comp, mockConfigSvc } = buildComponent()
    mockConfigSvc.iGOTAIConfig = null
    comp.rootOrgId = 'org1'
    comp.iGOTAIConfigLoaded = true
    comp.ngOnChanges()
    expect(comp.faqChatBotDisable).toBe(false)
  })

  it('checkForApiCalls - reads from localStorage', () => {
    const { comp } = buildComponent()
    localStorage.setItem('faq', JSON.stringify({ en: { information: { quesMap: [], recommendationMap: [] } } }))
    localStorage.setItem('faq-languages', '[{"name":"English","code":"en"}]')
    comp.currentFilter = 'information'
    comp.checkForApiCalls()
    expect(comp.selectedLaguage).toBe('en')
  })
})
