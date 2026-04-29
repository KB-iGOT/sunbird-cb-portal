import { AppChatbotComponent } from './app-chatbot.component'
import { of, Subject } from 'rxjs'
import { NavigationEnd } from '@angular/router'

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
  NavigationEnd: class NavigationEnd { constructor(public id: number, public url: string, public urlAfterRedirects: string) { } },
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

  // Shared component instance for the remaining test suite
  let component: any
  let configSvcMock: any
  let eventSvcMock: any
  let chatbotServiceMock: any
  let httpMock: any
  let sanitizerMock: any
  let rendererMock: any
  let openSupportSubject: Subject<any>
  let routerEventsSubject: Subject<any>
  let dialogMock: any

  beforeEach(() => {
    openSupportSubject = new Subject<any>()
    routerEventsSubject = new Subject<any>()
    configSvcMock = {
      userProfile: { profileImage: '/img.png', professionalDetails: [{ designation: 'Officer' }] },
      iGOTAIConfig: {
        issuesTab: { all: true },
        informationTab: { all: true },
        supportAI: { all: true },
        iGOTAI: { all: true, allDesignation: true, forDesignation: ['Officer'], forOrg: ['org1'] },
      },
      unMappedUser: { userId: 'user123' },
    }
    eventSvcMock = { dispatchChatbotEvent: jest.fn() }
    rendererMock = {
      listen: jest.fn(),
      addClass: jest.fn(),
      removeClass: jest.fn(),
      setStyle: jest.fn(),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      createElement: jest.fn(),
      appendChild: jest.fn(),
    }
    chatbotServiceMock = {
      openSupportAIChatbot: openSupportSubject.asObservable(),
      getChatData: jest.fn().mockReturnValue(of({ payload: { config: {} } })),
      getLangugages: jest.fn().mockReturnValue(of({ languages: [] })),
      iGOTAIChatHistory: [],
    }
    httpMock = { get: jest.fn().mockReturnValue(of('<html>zoho</html>')) }
    sanitizerMock = { bypassSecurityTrustHtml: jest.fn().mockReturnValue('safe-html') }
    dialogMock = { open: jest.fn().mockReturnValue({ afterClosed: () => of(true) }) }
    const mockRouter: any = { events: routerEventsSubject.asObservable() }
    component = new AppChatbotComponent(
      configSvcMock,
      eventSvcMock,
      rendererMock,
      chatbotServiceMock,
      httpMock,
      sanitizerMock,
      dialogMock,
      mockRouter,
    )
  })

  it('should initialize default values', () => {
    expect(component.showIcon).toBe(true)
    expect(component.currentFilter).toBe('information')
    expect(component.expanded).toBe(false)
    expect(component.faqChatBotDisable).toBe(true)
    expect(component.enableIGOTAIFlag).toBe(false)
    expect(component.enableSupportAI).toBe(false)
  })

  describe('ngOnInit', () => {
    it('should subscribe to router events and set isHubEnable based on URL', () => {
      component.ngOnInit()
      routerEventsSubject.next(new NavigationEnd(1, '/app/profile', '/app/profile'))
      expect(component.isHubEnable).toBe(true)
    })

    it('should set isHubEnable to false for /certs URL', () => {
      component.ngOnInit()
      routerEventsSubject.next(new NavigationEnd(1, '/app/certs/view', '/app/certs/view'))
      expect(component.isHubEnable).toBe(false)
    })

    it('should set isHubEnable to false for /public/certs URL', () => {
      component.ngOnInit()
      routerEventsSubject.next(new NavigationEnd(1, '/public/certs/view', '/public/certs/view'))
      expect(component.isHubEnable).toBe(false)
    })

    it('should set userInfo from configSvc.userProfile', () => {
      component.ngOnInit()
      expect(component.userInfo).toEqual(configSvcMock.userProfile)
    })

    it('should fetch zoho html on init', () => {
      component.ngOnInit()
      expect(httpMock.get).toHaveBeenCalledWith('/assets/static-data/zoho-code.html', { responseType: 'text' })
      expect(sanitizerMock.bypassSecurityTrustHtml).toHaveBeenCalledWith('<html>zoho</html>')
      expect(component.zohoHtml).toBe('safe-html')
    })

    it('should call renderer.removeClass for enableScroll on init', () => {
      component.ngOnInit()
      expect(rendererMock.removeClass).toHaveBeenCalledWith(document.body, 'disable-scroll')
    })

    it('should enable issuesTab when iGOTAIConfig.issuesTab.all is true', () => {
      configSvcMock.iGOTAIConfig = { issuesTab: { all: true } }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      component.ngOnInit()
      expect(component.enableIssuesTab).toBe(true)
      expect(component.currentFilter).toBe('issue')
    })

    it('should enable informationTab when iGOTAIConfig.informationTab.all is true', () => {
      configSvcMock.iGOTAIConfig = { informationTab: { all: true } }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      component.ngOnInit()
      expect(component.enableInformationTab).toBe(true)
      expect(component.currentFilter).toBe('information')
    })

    it('should enable issuesTab for forOrg when org matches', () => {
      configSvcMock.iGOTAIConfig = { issuesTab: { all: false, forOrg: ['org1'] } }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      component.ngOnInit()
      expect(component.enableIssuesTab).toBe(true)
    })

    it('should enable supportAI when iGOTAIConfig.supportAI.all is true', () => {
      configSvcMock.iGOTAIConfig = { supportAI: { all: true } }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      component.ngOnInit()
      expect(component.enableSupportAI).toBe(true)
      expect(component.currentFilter).toBe('support-ai')
    })

    it('should enable IGOTAI when iGOTAIConfig.iGOTAI.all and allDesignation is true', () => {
      configSvcMock.iGOTAIConfig = { iGOTAI: { all: true, allDesignation: true } }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      component.ngOnInit()
      expect(component.enableIGOTAIFlag).toBe(true)
      expect(component.currentFilter).toBe('sarthi')
    })

    it('should set faqChatBotDisable true when enableSupportAI or enableIGOTAIFlag', () => {
      configSvcMock.iGOTAIConfig = { iGOTAI: { all: true, allDesignation: true } }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      component.ngOnInit()
      expect(component.faqChatBotDisable).toBe(true)
    })

    it('should set faqChatBotDisable false when neither support nor igotai enabled', () => {
      configSvcMock.iGOTAIConfig = {}
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      component.ngOnInit()
      expect(component.faqChatBotDisable).toBe(false)
    })
  })

  describe('ngOnChanges', () => {
    it('should update userInfo and userDesignation on changes when rootOrgId and iGOTAIConfigLoaded', () => {
      configSvcMock.userProfile = {
        firstName: 'Test',
        professionalDetails: [{ designation: ' Manager ' }],
      }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      component.ngOnChanges()
      expect(component.userDesignation).toBe('Manager')
    })

    it('should not change state when rootOrgId is absent', () => {
      component.rootOrgId = null
      component.iGOTAIConfigLoaded = true
      component.ngOnChanges()
      expect(component.userDesignation).toBe('')
    })
  })

  describe('greetings', () => {
    it('should return Namaste for en locale', () => {
      component.selectedLaguage = 'en'
      expect(component.greetings()).toBe('Namaste')
    })

    it('should return hindi greeting for hi locale', () => {
      component.selectedLaguage = 'hi'
      expect(component.greetings()).toBe('नमस्ते')
    })
  })

  describe('getInfoText', () => {
    it('should return localized text for known label', () => {
      component.selectedLaguage = 'en'
      expect(component.getInfoText('information')).toBe('Information')
    })

    it('should return the label itself for unknown key', () => {
      component.selectedLaguage = 'en'
      expect(component.getInfoText('unknown_key')).toBe('unknown_key')
    })
  })

  describe('showMore', () => {
    it('should return Show More text for en locale', () => {
      component.selectedLaguage = 'en'
      expect(component.showMore()).toBe('Show More')
    })
  })

  describe('toggleFilter', () => {
    it('should set currentFilter to provided tab', () => {
      component.toggleFilter('issue')
      expect(component.currentFilter).toBe('issue')
    })

    it('should reset more to false', () => {
      component.more = true
      component.toggleFilter('information')
      expect(component.more).toBe(false)
    })
  })

  describe('pushData', () => {
    it('should push to chatInformation when currentFilter is information', () => {
      component.currentFilter = 'information'
      component.chatInformation = []
      const msg = { type: 'incoming', tab: 'information' }
      component.pushData(msg)
      expect(component.chatInformation).toContain(msg)
    })

    it('should push to chatIssues when currentFilter is not information', () => {
      component.currentFilter = 'issue'
      component.chatIssues = []
      const msg = { type: 'incoming', tab: 'issue' }
      component.pushData(msg)
      expect(component.chatIssues).toContain(msg)
    })
  })

  describe('selectLaguage', () => {
    it('should update selectedLaguage and clear chat arrays', () => {
      component.chatInformation = [{ msg: 'hi' }]
      component.chatIssues = [{ msg: 'hi' }]
      component.selectLaguage({ target: { value: 'hi' } } as any)
      expect(component.selectedLaguage).toBe('hi')
      expect(component.chatInformation).toEqual([])
      expect(component.chatIssues).toEqual([])
    })
  })

  describe('iconClick', () => {
    it('should toggle showIcon on end action', () => {
      component.showIcon = true
      component.dragEnabled = false
      component.iconClick('end')
      expect(component.showIcon).toBe(false)
    })

    it('should not toggle showIcon when dragEnabled is true', () => {
      component.showIcon = true
      component.dragEnabled = true
      component.iconClick('end')
      expect(component.showIcon).toBe(true)
    })

    it('should set fullScreenChatFlag to false', () => {
      component.fullScreenChatFlag = true
      component.iconClick('end')
      expect(component.fullScreenChatFlag).toBe(false)
    })

    it('should set maximizeChatFlag to true', () => {
      component.maximizeChatFlag = false
      component.iconClick('end')
      expect(component.maximizeChatFlag).toBe(true)
    })
  })

  describe('minimizeChat / maximizeChat / fullScreenChat', () => {
    it('should minimizeChat correctly', () => {
      component.minimizeChat()
      expect(component.maximizeChatFlag).toBe(false)
      expect(component.fullScreenChatFlag).toBe(false)
    })

    it('should maximizeChat correctly', () => {
      component.maximizeChatFlag = false
      component.maximizeChat()
      expect(component.maximizeChatFlag).toBe(true)
      expect(component.fullScreenChatFlag).toBe(false)
    })

    it('should fullScreenChat correctly', () => {
      component.fullScreenChat()
      expect(component.fullScreenChatFlag).toBe(true)
    })

    it('should fullScreenExitChat correctly', () => {
      component.fullScreenExitChat()
      expect(component.fullScreenChatFlag).toBe(false)
      expect(component.maximizeChatFlag).toBe(true)
    })
  })

  describe('clickOutside', () => {
    it('should call iconClick end when not enableIGOTAIFlag and not enableSupportAI', () => {
      component.enableIGOTAIFlag = false
      component.enableSupportAI = false
      const spy = jest.spyOn(component, 'iconClick').mockImplementation(() => { })
      component.clickOutside()
      expect(spy).toHaveBeenCalledWith('end')
    })

    it('should not call iconClick when enableIGOTAIFlag is true', () => {
      component.enableIGOTAIFlag = true
      const spy = jest.spyOn(component, 'iconClick').mockImplementation(() => { })
      component.clickOutside()
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('getuserjourney', () => {
    it('should filter userJourney by tab', () => {
      component.userJourney = [
        { tab: 'information' },
        { tab: 'issue' },
        { tab: 'information' },
      ]
      const result = component.getuserjourney('information')
      expect(result.length).toBe(2)
      expect(result.every((j: any) => j.tab === 'information')).toBe(true)
    })
  })

  describe('sortCategory', () => {
    it('should sort categories by priority ascending', () => {
      component.categories = [
        { catId: '3', priority: 3 },
        { catId: '1', priority: 1 },
        { catId: '2', priority: 2 },
      ]
      const sorted = component.sortCategory()
      expect(sorted[0].priority).toBe(1)
      expect(sorted[2].priority).toBe(3)
    })
  })

  describe('getFooterClass', () => {
    it('should set cb-footer when neither supportAI nor IGOTAI enabled', () => {
      component.enableSupportAI = false
      component.enableIGOTAIFlag = false
      component.getFooterClass()
      expect(component.footerClassName).toBe('cb-footer')
    })

    it('should set cb-footer-with-ai-only when supportAI and no info/issues tabs', () => {
      component.enableSupportAI = true
      component.enableInformationTab = false
      component.enableIssuesTab = false
      component.getFooterClass()
      expect(component.footerClassName).toBe('cb-footer-with-ai-only')
    })

    it('should set cb-footer-with-support-ai-two-tab when supportAI+IGOTAI and no info/issues', () => {
      component.enableSupportAI = true
      component.enableIGOTAIFlag = true
      component.enableInformationTab = false
      component.enableIssuesTab = false
      component.getFooterClass()
      expect(component.footerClassName).toBe('cb-footer-with-support-ai-two-tab')
    })

    it('should set cb-footer-with-ai when supportAI, IGOTAI, and both tabs enabled', () => {
      component.enableSupportAI = true
      component.enableIGOTAIFlag = true
      component.enableInformationTab = true
      component.enableIssuesTab = true
      component.getFooterClass()
      expect(component.footerClassName).toBe('cb-footer-with-ai')
    })

    it('should set cb-footer-with-support-ai-two-tab when supportAI and informationTab only', () => {
      component.enableSupportAI = true
      component.enableIGOTAIFlag = false
      component.enableInformationTab = true
      component.enableIssuesTab = false
      component.getFooterClass()
      expect(component.footerClassName).toBe('cb-footer-with-support-ai-two-tab')
    })

    it('should set cb-footer-with-support-ai-two-tab when supportAI and issuesTab only', () => {
      component.enableSupportAI = true
      component.enableIGOTAIFlag = false
      component.enableInformationTab = false
      component.enableIssuesTab = true
      component.getFooterClass()
      expect(component.footerClassName).toBe('cb-footer-with-support-ai-two-tab')
    })

    it('should set cb-footer-with-ai-support when supportAI and both tabs but no IGOTAI', () => {
      component.enableSupportAI = true
      component.enableIGOTAIFlag = false
      component.enableInformationTab = true
      component.enableIssuesTab = true
      component.getFooterClass()
      expect(component.footerClassName).toBe('cb-footer-with-ai-support')
    })
  })

  describe('raiseChatStartTelemetry', () => {
    it('should dispatch telemetry for non-sarthi filter', () => {
      component.currentFilter = 'information'
      component.raiseChatStartTelemetry()
      expect(eventSvcMock.dispatchChatbotEvent).toHaveBeenCalledTimes(1)
    })

    it('should dispatch telemetry for sarthi filter', () => {
      component.currentFilter = 'sarthi'
      component.enableSupportAI = false
      component.raiseChatStartTelemetry()
      expect(eventSvcMock.dispatchChatbotEvent).toHaveBeenCalledTimes(1)
    })

    it('should dispatch two events for sarthi with enableSupportAI', () => {
      component.currentFilter = 'sarthi'
      component.enableSupportAI = true
      component.raiseChatStartTelemetry()
      expect(eventSvcMock.dispatchChatbotEvent).toHaveBeenCalledTimes(2)
    })
  })

  describe('raiseChatEndTelemetry', () => {
    it('should dispatch end telemetry for non-sarthi filter', () => {
      component.currentFilter = 'information'
      component.raiseChatEndTelemetry()
      expect(eventSvcMock.dispatchChatbotEvent).toHaveBeenCalledTimes(1)
    })

    it('should dispatch end telemetry for sarthi filter', () => {
      component.currentFilter = 'sarthi'
      component.enableSupportAI = false
      component.raiseChatEndTelemetry()
      expect(eventSvcMock.dispatchChatbotEvent).toHaveBeenCalledTimes(1)
    })

    it('should dispatch two end events for sarthi with enableSupportAI', () => {
      component.currentFilter = 'sarthi'
      component.enableSupportAI = true
      component.raiseChatEndTelemetry()
      expect(eventSvcMock.dispatchChatbotEvent).toHaveBeenCalledTimes(2)
    })
  })

  describe('raiseTemeletyInterat', () => {
    it('should dispatch telemetry interact event with given id', () => {
      component.currentFilter = 'information'
      component.raiseTemeletyInterat('qId1')
      const call = eventSvcMock.dispatchChatbotEvent.mock.calls[0][0]
      expect(call.data.edata.id).toBe('qId1')
      expect(call.to).toBe('Telemetry')
    })
  })

  describe('raiseCategotyTelemetry', () => {
    it('should dispatch category telemetry event', () => {
      component.raiseCategotyTelemetry('cat1')
      const call = eventSvcMock.dispatchChatbotEvent.mock.calls[0][0]
      expect(call.data.edata.id).toBe('cat1')
      expect(call.data.object.type).toBe('Category')
    })
  })

  describe('getData', () => {
    it('should call getChatData with correct tabType', () => {
      chatbotServiceMock.getChatData.mockReturnValue(of({}))
      component.selectedLaguage = 'en'
      component.currentFilter = 'information'
      component.getData()
      expect(chatbotServiceMock.getChatData).toHaveBeenCalledWith(
        expect.objectContaining({ lang: 'en', config_type: 'IN' })
      )
    })

    it('should call setDataToLocalStorage when payload.config exists', () => {
      const spy = jest.spyOn(component, 'setDataToLocalStorage').mockImplementation(() => { })
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => { })
      chatbotServiceMock.getChatData.mockReturnValue(of({ payload: { config: { data: 'x' } } }))
      component.getData()
      expect(spy).toHaveBeenCalledWith({ data: 'x' })
    })

    it('should not call setDataToLocalStorage when no payload', () => {
      const spy = jest.spyOn(component, 'setDataToLocalStorage').mockImplementation(() => { })
      chatbotServiceMock.getChatData.mockReturnValue(of({}))
      component.getData()
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('setDataToLocalStorage', () => {
    it('should save data to localStorage under selectedLanguage and currentFilter', () => {
      jest.spyOn(component, 'toggleFilter').mockImplementation(() => { })
      component.currentFilter = 'information'
      component.selectedLaguage = 'en'
      component.setDataToLocalStorage({ key: 'val' })
      const stored = JSON.parse(localStorage.getItem('faq') || '{}')
      expect(stored.en.information).toEqual({ key: 'val' })
    })

    it('should call toggleFilter with current filter when not information', () => {
      const spy = jest.spyOn(component, 'toggleFilter').mockImplementation(() => { })
      component.currentFilter = 'issue'
      component.selectedLaguage = 'en'
      component.setDataToLocalStorage({ x: 1 })
      expect(spy).toHaveBeenCalledWith('issue')
    })

    it('should call toggleFilter with information when currentFilter is information', () => {
      const spy = jest.spyOn(component, 'toggleFilter').mockImplementation(() => { })
      component.currentFilter = 'information'
      component.selectedLaguage = 'en'
      component.setDataToLocalStorage({})
      expect(spy).toHaveBeenCalledWith('information')
    })
  })

  describe('getLanguages', () => {
    it('should set language and call getData on success (status 200)', () => {
      const spy = jest.spyOn(component, 'getData').mockImplementation(() => { })
      chatbotServiceMock.getLangugages.mockReturnValue(of({
        status: { code: 200 },
        payload: { languages: [{ id: 'en', name: 'English' }] },
      }))
      component.getLanguages()
      expect(component.language).toEqual([{ id: 'en', name: 'English' }])
      expect(spy).toHaveBeenCalled()
    })

    it('should not call getData when status code is not 200', () => {
      const spy = jest.spyOn(component, 'getData').mockImplementation(() => { })
      chatbotServiceMock.getLangugages.mockReturnValue(of({ status: { code: 404 } }))
      component.getLanguages()
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('checkForApiCalls', () => {
    beforeEach(() => {
      jest.spyOn(component, 'initData').mockImplementation(() => { })
      jest.spyOn(component, 'getQns').mockImplementation(() => { })
      jest.spyOn(component, 'getCategories').mockImplementation(() => { })
    })

    it('should call getLanguages when no faq-languages in localStorage', () => {
      const spy = jest.spyOn(component, 'getLanguages').mockImplementation(() => { })
      localStorage.clear()
      component.checkForApiCalls()
      expect(spy).toHaveBeenCalled()
    })

    it('should set language from localStorage array', () => {
      jest.spyOn(component, 'getLanguages').mockImplementation(() => { })
      localStorage.setItem('faq-languages', JSON.stringify([{ id: 'en' }]))
      component.checkForApiCalls()
      expect(component.language).toEqual([{ id: 'en' }])
    })

    it('should load from localStorage for information filter (empty chatInformation)', () => {
      jest.spyOn(component, 'getLanguages').mockImplementation(() => { })
      localStorage.setItem('faq-languages', JSON.stringify([{ id: 'en' }]))
      localStorage.setItem('selectedLanguage', 'en')
      component.currentFilter = 'information'
      const faqData = { en: { information: { quesMap: [], recommendationMap: [] } } }
      localStorage.setItem('faq', JSON.stringify(faqData))
      component.chatInformation = []
      component.checkForApiCalls()
      expect(component.responseData).toEqual(faqData.en.information)
    })

    it('should use existing chatInformation when not empty', () => {
      jest.spyOn(component, 'getLanguages').mockImplementation(() => { })
      localStorage.setItem('faq-languages', JSON.stringify([{ id: 'en' }]))
      localStorage.setItem('selectedLanguage', 'en')
      component.currentFilter = 'information'
      const faqData = { en: { information: { quesMap: [], recommendationMap: [] } } }
      localStorage.setItem('faq', JSON.stringify(faqData))
      component.chatInformation = [{ type: 'incoming' }]
      component.checkForApiCalls()
      expect(component.userJourney).toEqual(component.chatInformation)
    })

    it('should load for issue filter (empty chatIssues)', () => {
      jest.spyOn(component, 'getLanguages').mockImplementation(() => { })
      localStorage.setItem('faq-languages', JSON.stringify([{ id: 'en' }]))
      localStorage.setItem('selectedLanguage', 'en')
      component.currentFilter = 'issue'
      const faqData = { en: { issue: { quesMap: [], recommendationMap: [] } } }
      localStorage.setItem('faq', JSON.stringify(faqData))
      component.chatIssues = []
      component.checkForApiCalls()
      expect(component.responseData).toEqual(faqData.en.issue)
    })

    it('should use existing chatIssues when not empty', () => {
      jest.spyOn(component, 'getLanguages').mockImplementation(() => { })
      localStorage.setItem('faq-languages', JSON.stringify([{ id: 'en' }]))
      localStorage.setItem('selectedLanguage', 'en')
      component.currentFilter = 'issue'
      const faqData = { en: { issue: { quesMap: [], recommendationMap: [] } } }
      localStorage.setItem('faq', JSON.stringify(faqData))
      component.chatIssues = [{ type: 'incoming' }]
      component.checkForApiCalls()
      expect(component.userJourney).toEqual(component.chatIssues)
    })

    it('should call getLanguages when no matching faq data', () => {
      const spy = jest.spyOn(component, 'getLanguages').mockImplementation(() => { })
      localStorage.setItem('faq-languages', JSON.stringify([{ id: 'en' }]))
      localStorage.setItem('selectedLanguage', 'en')
      component.currentFilter = 'information'
      localStorage.setItem('faq', JSON.stringify({}))
      component.checkForApiCalls()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('selectedQuestion', () => {
    beforeEach(() => {
      component.questionsAndAns = {
        q1: { quesValue: 'What is this?', ansVal: 'This is the answer.', recommendedQues: [] },
      }
      component.callText = 'call text'
      component.emailText = 'email text'
      jest.spyOn(component, 'scrollToBottom').mockImplementation(() => { })
      jest.spyOn(component, 'raiseTemeletyInterat').mockImplementation(() => { })
    })

    it('should push sendMsg and incomingMsg and call raiseTemeletyInterat', () => {
      const data: any = { selectedValue: '', tab: 'information' }
      const question: any = { quesID: 'q1', recommendedQues: [] }
      component.currentFilter = 'information'
      component.chatInformation = []
      component.selectedQuestion(question, data)
      expect(component.chatInformation.length).toBeGreaterThan(0)
      expect(component.raiseTemeletyInterat).toHaveBeenCalledWith('q1')
    })

    it('should set data.selectedValue to question.quesID', () => {
      const data: any = { selectedValue: '', tab: 'information' }
      component.currentFilter = 'information'
      component.selectedQuestion({ quesID: 'q1', recommendedQues: [] }, data)
      expect(data.selectedValue).toBe('q1')
    })
  })

  describe('showMoreQuestion', () => {
    it('should push new incoming message to chat', () => {
      component.responseData = {
        recommendationMap: [
          { recommendedQues: [{ priority: 1, quesID: 'q1' }], categoryType: 'Logged-In' },
        ],
      }
      component.userInfo = { firstName: 'Test' }
      component.currentFilter = 'information'
      component.chatInformation = []
      component.showMoreQuestion()
      expect(component.chatInformation.length).toBeGreaterThan(0)
      expect(component.chatInformation[0].type).toBe('incoming')
    })
  })

  describe('showCategory', () => {
    beforeEach(() => {
      component.responseData = {
        recommendationMap: [
          { catId: 'cat1', catName: 'Category 1', recommendedQues: [{ quesID: 'q1' }] },
        ],
        categoryMap: [],
      }
      component.categories = [{ catId: 'all', catName: 'All', priority: 0 }]
      jest.spyOn(component, 'raiseCategotyTelemetry').mockImplementation(() => { })
      jest.spyOn(component, 'scrollToBottom').mockImplementation(() => { })
    })

    it('should set more to false', () => {
      component.more = true
      component.showCategory({ catId: 'all', catName: 'All' })
      expect(component.more).toBe(false)
    })

    it('should push category message for catId=all', () => {
      component.currentFilter = 'information'
      component.chatInformation = []
      component.showCategory({ catId: 'all', catName: 'All' })
      expect(component.chatInformation.length).toBeGreaterThan(0)
    })

    it('should call raiseCategotyTelemetry for non-all catId', () => {
      component.currentFilter = 'information'
      component.chatInformation = []
      component.showCategory({ catId: 'cat1', catName: 'Category 1' })
      expect(component.raiseCategotyTelemetry).toHaveBeenCalledWith('cat1')
    })
  })

  describe('getCategories', () => {
    it('should build categories list when < 6 items', () => {
      component.responseData = {
        recommendationMap: [
          { catId: 'c1', priority: 1, categoryType: 'Logged-In' },
        ],
        categoryMap: [{ catId: 'c1', catName: 'Cat 1' }],
      }
      component.userInfo = { firstName: 'Test' }
      component.selectedLaguage = 'en'
      component.getCategories()
      expect(component.categories.length).toBeLessThan(6)
    })

    it('should include all entry when >= 6 items', () => {
      const entries = Array.from({ length: 6 }, (_, i) => ({
        catId: `c${i}`, priority: i, categoryType: 'Both',
      }))
      const catMap = entries.map(e => ({ catId: e.catId, catName: `Cat ${e.catId}` }))
      component.responseData = { recommendationMap: entries, categoryMap: catMap }
      component.userInfo = { firstName: 'Test' }
      component.selectedLaguage = 'en'
      component.getCategories()
      expect(component.categories.some((c: any) => c.catId === 'all')).toBe(true)
    })
  })

  describe('ngAfterViewChecked', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should scroll chatbot-content for information filter', () => {
      component.currentFilter = 'information'
      const mockEl = { scrollTo: jest.fn(), scrollHeight: 500 }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockEl as any)
      component.ngAfterViewChecked()
      expect(mockEl.scrollTo).toHaveBeenCalled()
    })

    it('should not scroll when filter is sarthi', () => {
      component.currentFilter = 'sarthi'
      const spy = jest.spyOn(document, 'getElementById').mockReturnValue(null)
      component.ngAfterViewChecked()
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })

    it('should not scroll when filter is support-ai', () => {
      component.currentFilter = 'support-ai'
      const spy = jest.spyOn(document, 'getElementById').mockReturnValue(null)
      component.ngAfterViewChecked()
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })

    it('should handle null chatbot-content gracefully', () => {
      component.currentFilter = 'information'
      jest.spyOn(document, 'getElementById').mockReturnValue(null)
      expect(() => component.ngAfterViewChecked()).not.toThrow()
    })
  })

  describe('scrollToBottom', () => {
    it('should scroll chatbot-wrapper element', () => {
      const mockEl = { scrollTo: jest.fn(), scrollHeight: 600 }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockEl as any)
      component.scrollToBottom()
      expect(mockEl.scrollTo).toHaveBeenCalled()
    })

    it('should handle null element gracefully', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null)
      expect(() => component.scrollToBottom()).not.toThrow()
    })
  })

  describe('scrollToBottomEvent', () => {
    it('should scroll chatbot-content element', () => {
      const mockEl = { scrollTo: jest.fn(), scrollHeight: 400 }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockEl as any)
      component.scrollToBottomEvent()
      expect(mockEl.scrollTo).toHaveBeenCalled()
    })

    it('should handle null element gracefully', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null)
      expect(() => component.scrollToBottomEvent()).not.toThrow()
    })
  })

  describe('iconClick start path', () => {
    it('should set chatId on start action', () => {
      const spyStart = jest.spyOn(component, 'raiseChatStartTelemetry').mockImplementation(() => { })
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => { })
      component.dragEnabled = false
      component.iconClick('start')
      expect(component.chatId).toContain('user123')
      expect(spyStart).toHaveBeenCalled()
    })

    it('should clear all chat data on end action', () => {
      jest.spyOn(component, 'raiseChatEndTelemetry').mockImplementation(() => { })
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => { })
      component.dragEnabled = false
      component.chatInformation = [{ msg: 'x' }]
      component.chatIssues = [{ msg: 'y' }]
      component.iconClick('end')
      expect(component.chatInformation).toEqual([])
      expect(component.chatIssues).toEqual([])
      expect(component.selectedLaguage).toBe('en')
    })

    it('should set currentFilter to sarthi on end when iGOTAI.all and allDesignation', () => {
      jest.spyOn(component, 'raiseChatEndTelemetry').mockImplementation(() => { })
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => { })
      configSvcMock.iGOTAIConfig = { iGOTAI: { all: true, allDesignation: true } }
      component.dragEnabled = false
      component.iconClick('end')
      expect(component.currentFilter).toBe('sarthi')
    })

    it('should set currentFilter to sarthi when iGOTAI forOrg+allDesignation on end', () => {
      jest.spyOn(component, 'raiseChatEndTelemetry').mockImplementation(() => { })
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => { })
      configSvcMock.iGOTAIConfig = { iGOTAI: { all: false, forOrg: ['org1'], allDesignation: true } }
      component.rootOrgId = 'org1'
      component.dragEnabled = false
      component.iconClick('end')
      expect(component.currentFilter).toBe('sarthi')
    })

    it('should set currentFilter to sarthi when iGOTAI forDesignation matches on end', () => {
      jest.spyOn(component, 'raiseChatEndTelemetry').mockImplementation(() => { })
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => { })
      component.userDesignation = 'Engineer'
      configSvcMock.iGOTAIConfig = { iGOTAI: { all: true, allDesignation: false, forDesignation: ['Engineer'] } }
      component.dragEnabled = false
      component.iconClick('end')
      expect(component.currentFilter).toBe('sarthi')
    })
  })

  describe('openSupportAIChatbot subscription', () => {
    it('should set fromTopNavHelp true and call iconClick start when data is truthy', () => {
      configSvcMock.iGOTAIConfig = { supportAI: { all: true } }
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => { })
      const iconSpy = jest.spyOn(component, 'iconClick').mockImplementation(() => { })
      component.ngOnInit()
      openSupportSubject.next(true)
      expect(component.fromTopNavHelp).toBe(true)
      expect(iconSpy).toHaveBeenCalledWith('start')
    })

    it('should set enableSupportAI via forOrg when data is truthy', () => {
      configSvcMock.iGOTAIConfig = { supportAI: { all: false, forOrg: ['org1'] } }
      component.rootOrgId = 'org1'
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => { })
      jest.spyOn(component, 'iconClick').mockImplementation(() => { })
      component.ngOnInit()
      openSupportSubject.next(true)
      expect(component.enableSupportAI).toBe(true)
      expect(component.currentFilter).toBe('support-ai')
    })

    it('should set fromTopNavHelp false when data is falsy', () => {
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => { })
      component.ngOnInit()
      openSupportSubject.next(false)
      expect(component.fromTopNavHelp).toBe(false)
    })
  })

  describe('goToBottom', () => {
    it('should call window.scrollTo', () => {
      const spy = jest.spyOn(window, 'scrollTo').mockImplementation((() => { }) as any)
      component.goToBottom()
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  describe('readFromLocalStorage', () => {
    it('should set responseData for information filter', () => {
      const data = { en: { information: { data: 'info' } } }
      localStorage.setItem('result', JSON.stringify(data))
      component.currentFilter = 'information'
      component.selectedLaguage = 'en'
      component.readFromLocalStorage()
      expect(component.responseData).toEqual({ data: 'info' })
    })

    it('should set responseData for issue filter', () => {
      const data = { en: { issue: { data: 'iss' } } }
      localStorage.setItem('result', JSON.stringify(data))
      component.currentFilter = 'issue'
      component.selectedLaguage = 'en'
      component.readFromLocalStorage()
      expect(component.responseData).toEqual({ data: 'iss' })
    })

    it('should handle missing localStorage result gracefully', () => {
      localStorage.removeItem('result')
      expect(() => component.readFromLocalStorage()).not.toThrow()
    })
  })

  describe('getZohoForm', () => {
    it('should open dialog with ZohoDialogComponent', () => {
      jest.useFakeTimers()
      component.getZohoForm()
      expect(dialogMock.open).toHaveBeenCalled()
      jest.useRealTimers()
    })

    it('should subscribe to afterClosed', () => {
      jest.useFakeTimers()
      const afterClosedSpy = jest.fn().mockReturnValue(of(null))
      dialogMock.open.mockReturnValue({ afterClosed: afterClosedSpy })
      component.getZohoForm()
      expect(afterClosedSpy).toHaveBeenCalled()
      jest.useRealTimers()
    })
  })

  describe('onDragEnded', () => {
    it('should update iconPosition when chatIconOutside is false', () => {
      jest.useFakeTimers()
      const mockPoint = { x: 10, y: 20 }
      const mockEvent: any = {
        source: {
          getFreeDragPosition: jest.fn().mockReturnValue(mockPoint),
          _dragRef: null,
        },
      }
      component.chatIconOutside = false
      component.onDragEnded(mockEvent)
      expect(component.iconPosition).toEqual(mockPoint)
      jest.runAllTimers()
      expect(component.dragEnabled).toBe(false)
      jest.useRealTimers()
    })

    it('should call dragRef.reset when chatIconOutside is true', () => {
      jest.useFakeTimers()
      const resetMock = jest.fn()
      const mockEvent: any = {
        source: {
          getFreeDragPosition: jest.fn().mockReturnValue({ x: 5, y: 5 }),
          _dragRef: { reset: resetMock },
        },
      }
      component.chatIconOutside = true
      component.onDragEnded(mockEvent)
      expect(resetMock).toHaveBeenCalled()
      jest.useRealTimers()
    })
  })

  describe('onDragMoved', () => {
    it('should set dragEnabled to true and chatIconOutside false when rect is inside', () => {
      const mockRect = { top: 10, left: 10, bottom: 100, right: 100 }
        ; (component as any).dragElement = {
          nativeElement: { getBoundingClientRect: jest.fn().mockReturnValue(mockRect) },
        }
      component.onDragMoved()
      expect(component.dragEnabled).toBe(true)
      expect(component.chatIconOutside).toBe(false)
    })

    it('should set chatIconOutside true when rect goes outside viewport (top < 0)', () => {
      const mockRect = { top: -10, left: 10, bottom: 100, right: 100 }
        ; (component as any).dragElement = {
          nativeElement: { getBoundingClientRect: jest.fn().mockReturnValue(mockRect) },
        }
      component.onDragMoved()
      expect(component.chatIconOutside).toBe(true)
    })

    it('should set chatIconOutside true when rect goes outside on right', () => {
      const mockRect = { top: 10, left: 10, bottom: 100, right: 9999 }
        ; (component as any).dragElement = {
          nativeElement: { getBoundingClientRect: jest.fn().mockReturnValue(mockRect) },
        }
      component.onDragMoved()
      expect(component.chatIconOutside).toBe(true)
    })
  })

  describe('ngOnInit additional branches', () => {
    it('should set iGOTAI for forDesignation in ngOnInit', () => {
      configSvcMock.userProfile = {
        firstName: 'Test',
        professionalDetails: [{ designation: 'Manager' }],
      }
      configSvcMock.iGOTAIConfig = {
        iGOTAI: { all: true, allDesignation: false, forDesignation: ['Manager'] },
      }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => { })
      component.ngOnInit()
      expect(component.enableIGOTAIFlag).toBe(true)
    })

    it('should enable iGOTAI for forOrg+allDesignation in ngOnInit', () => {
      configSvcMock.iGOTAIConfig = {
        iGOTAI: { all: false, forOrg: ['org1'], allDesignation: true },
      }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => { })
      component.ngOnInit()
      expect(component.enableIGOTAIFlag).toBe(true)
    })

    it('should enable iGOTAI for forOrg+forDesignation in ngOnInit', () => {
      configSvcMock.userProfile = {
        firstName: 'Test',
        professionalDetails: [{ designation: 'Engineer' }],
      }
      configSvcMock.iGOTAIConfig = {
        iGOTAI: { all: false, forOrg: ['org1'], allDesignation: false, forDesignation: ['Engineer'] },
      }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => { })
      component.ngOnInit()
      expect(component.enableIGOTAIFlag).toBe(true)
    })

    it('should set supportAI for forOrg in ngOnInit', () => {
      configSvcMock.iGOTAIConfig = { supportAI: { all: false, forOrg: ['org1'] } }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      component.fromTopNavHelp = true
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => { })
      component.ngOnInit()
      expect(component.enableSupportAI).toBe(true)
    })

    it('should set informationTab for forOrg in ngOnInit', () => {
      configSvcMock.iGOTAIConfig = { informationTab: { all: false, forOrg: ['org1'] } }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => { })
      component.ngOnInit()
      expect(component.enableInformationTab).toBe(true)
    })

    it('should set issuesTab for forOrg in ngOnInit', () => {
      configSvcMock.iGOTAIConfig = { issuesTab: { all: false, forOrg: ['org1'] } }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => { })
      component.ngOnInit()
      expect(component.enableIssuesTab).toBe(true)
    })
  })

  describe('ngOnChanges additional branches', () => {
    it('should enable issuesTab for forOrg', () => {
      configSvcMock.iGOTAIConfig = { issuesTab: { all: false, forOrg: ['org1'] } }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      component.ngOnChanges()
      expect(component.enableIssuesTab).toBe(true)
    })

    it('should enable informationTab for forOrg', () => {
      configSvcMock.iGOTAIConfig = { informationTab: { all: false, forOrg: ['org1'] } }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      component.ngOnChanges()
      expect(component.enableInformationTab).toBe(true)
    })

    it('should enable supportAI for forOrg when fromTopNavHelp', () => {
      configSvcMock.iGOTAIConfig = { supportAI: { all: false, forOrg: ['org1'] } }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      component.fromTopNavHelp = true
      component.ngOnChanges()
      expect(component.enableSupportAI).toBe(true)
    })

    it('should enable iGOTAI for forOrg+allDesignation', () => {
      configSvcMock.iGOTAIConfig = { iGOTAI: { all: false, forOrg: ['org1'], allDesignation: true } }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      component.ngOnChanges()
      expect(component.enableIGOTAIFlag).toBe(true)
    })

    it('should enable iGOTAI for forDesignation match', () => {
      configSvcMock.userProfile = {
        ...configSvcMock.userProfile,
        professionalDetails: [{ designation: 'Manager' }],
      }
      component.userDesignation = 'Manager'
      configSvcMock.iGOTAIConfig = {
        iGOTAI: { all: true, allDesignation: false, forDesignation: ['Manager'] },
      }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      component.ngOnChanges()
      expect(component.enableIGOTAIFlag).toBe(true)
    })

    it('should enable iGOTAI for forOrg+forDesignation in ngOnChanges', () => {
      configSvcMock.userProfile = {
        firstName: 'Test',
        professionalDetails: [{ designation: 'Engineer' }],
      }
      configSvcMock.iGOTAIConfig = {
        iGOTAI: { all: false, forOrg: ['org1'], allDesignation: false, forDesignation: ['Engineer'] },
      }
      component.rootOrgId = 'org1'
      component.iGOTAIConfigLoaded = true
      component.ngOnChanges()
      expect(component.enableIGOTAIFlag).toBe(true)
    })
  })
})
