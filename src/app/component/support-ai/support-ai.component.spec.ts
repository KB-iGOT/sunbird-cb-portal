import { SupportAIComponent } from './support-ai.component'
import { of, Subject } from 'rxjs'
import { NavigationEnd } from '@angular/router'
import { SimpleChange } from '@angular/core'

jest.mock('lodash/cloneDeep', () => jest.fn((v: any) => v))
jest.mock('../../../environments/environment', () => ({ environment: { supportEmail: 'test@example.com' } }))

const defaultResponseData = {
  quesMap: [{ quesId: 'q1', quesValue: 'Q1?', ansVal: 'A1' }, { quesId: 'q2', quesValue: 'Q2?', ansVal: 'A2 <teams_call_link> <email_configuration>' }],
  recommendationMap: [{ catId: 'cat1', categoryType: 'Both', priority: 1, recommendedQues: [{ quesID: 'q1', priority: 1, recommendedQues: [] }] }],
  categoryMap: [{ catId: 'cat1', catName: 'Category 1' }],
}

describe('SupportAIComponent', () => {
  let component: SupportAIComponent
  let chatbotService: any
  let eventSvc: any
  let router$: Subject<any>

  const createComponent = (overrides: any = {}) => {
    router$ = new Subject()
    const mockConfigSvc = {
      userProfile: {
        firstName: 'John', lastName: 'Doe',
        profileImageUrl: 'http://test.jpg',
        professionalDetails: [{ designation: 'Manager' }],
        departmentName: 'IT'
      }
    }
    eventSvc = { dispatchChatbotEvent: jest.fn() }
    const mockRenderer = { addClass: jest.fn(), removeClass: jest.fn() }
    chatbotService = {
      getChatData: jest.fn(() => of({ payload: { config: { quesMap: [], recommendationMap: [], categoryMap: [] } } })),
      getLangugages: jest.fn(() => of({ status: { code: 200 }, payload: { languages: [{ code: 'en', name: 'English' }] } })),
      aiStartChathForSupport: jest.fn(() => of({ message: 'Started' })),
      aiSendChathForSupport: jest.fn(() => of({ text: 'Response', query_id: 'q1' })),
      saveAIChatPositiveContentRating: jest.fn(() => of({ status: 'success' })),
      shareAIFeedback: jest.fn(() => of({ status: 'success' })),
      aiGlobalSearchFromInternet: jest.fn(() => of({ answer: 'Result' })),
      ...overrides.chatbotService,
    }
    const mockDialog = { open: jest.fn(() => ({ afterClosed: jest.fn(() => of('feedback')) })) }
    const mockMatSnackBar = { open: jest.fn() }
    const mockRouter = { events: router$.asObservable() }
    const comp = new SupportAIComponent(
      mockConfigSvc as any, eventSvc as any, mockRenderer as any,
      chatbotService as any, mockDialog as any, mockMatSnackBar as any, mockRouter as any
    )
    return comp
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    component = createComponent()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have selectedLanguage as en', () => {
    expect(component.selectedLaguage).toBe('en')
  })

  it('should return Namaste for english greeting', () => {
    component.selectedLaguage = 'en'
    expect(component.greetings()).toBe('Namaste')
  })

  it('should return नमस्ते for hindi greeting', () => {
    component.selectedLaguage = 'hi'
    expect(component.greetings()).toBe('नमस्ते')
  })

  it('should get information text', () => {
    component.selectedLaguage = 'en'
    expect(component.getInfoText('information')).toBe('Information')
  })

  it('should return input for unknown key', () => {
    component.selectedLaguage = 'en'
    expect(component.getInfoText('unknown')).toBe('unknown')
  })

  it('ngOnInit - calls checkForApiCalls and sets userInfo', () => {
    jest.spyOn(component, 'checkForApiCalls').mockImplementation(jest.fn())
    component.ngOnInit()
    expect(component.checkForApiCalls).toHaveBeenCalled()
    expect((component as any).userIcon).toBe('http://test.jpg')
  })

  it('ngOnInit - sets isHubEnable on NavigationEnd /certs', () => {
    jest.spyOn(component, 'checkForApiCalls').mockImplementation(jest.fn())
    component.ngOnInit()
    router$.next(new NavigationEnd(1, '/certs/something', '/certs/something'))
    expect(component.isHubEnable).toBe(false)
  })

  it('ngOnInit - sets isHubEnable=true on non-cert route', () => {
    jest.spyOn(component, 'checkForApiCalls').mockImplementation(jest.fn())
    component.ngOnInit()
    router$.next(new NavigationEnd(1, '/page/home', '/page/home'))
    expect(component.isHubEnable).toBe(true)
  })

  it('ngOnInit - no profileImageUrl creates initials', () => {
    const comp = createComponent()
      ; (comp as any).configSvc.userProfile.profileImageUrl = ''
    jest.spyOn(comp, 'checkForApiCalls').mockImplementation(jest.fn())
    comp.ngOnInit()
    expect((comp as any).initials).toBeDefined()
  })

  it('ngOnChanges - chatId change calls startNewSupportAISearch', () => {
    jest.spyOn(component, 'startNewSupportAISearch').mockImplementation(jest.fn())
    const changes = {
      chatId: new SimpleChange('old-id', 'new-id', false)
    }
    component.ngOnChanges(changes)
    expect(component.startNewSupportAISearch).toHaveBeenCalled()
    expect(component.startNewChat).toBe(true)
  })

  it('ngOnChanges - no chatId change does nothing', () => {
    jest.spyOn(component, 'startNewSupportAISearch').mockImplementation(jest.fn())
    const changes = {
      chatId: new SimpleChange('same-id', 'same-id', false)
    }
    component.ngOnChanges(changes)
    expect(component.startNewSupportAISearch).not.toHaveBeenCalled()
  })

  it('showMore - returns show more text', () => {
    component.selectedLaguage = 'en'
    expect(component.showMore()).toBe('Show More')
  })

  it('getData - calls getChatData and processes response', () => {
    chatbotService.getChatData = jest.fn(() => of({
      payload: { config: { quesMap: [], recommendationMap: [], categoryMap: [] } }
    }))
    jest.spyOn(component, 'checkForApiCalls').mockImplementation(jest.fn())
    jest.spyOn(component, 'setDataToLocalStorage').mockImplementation(jest.fn())
    component.getData()
    expect(chatbotService.getChatData).toHaveBeenCalled()
    expect(component.setDataToLocalStorage).toHaveBeenCalled()
  })

  it('getData - handles no payload in response', () => {
    chatbotService.getChatData = jest.fn(() => of({}))
    component.getData()
    expect(chatbotService.getChatData).toHaveBeenCalled()
  })

  it('setDataToLocalStorage - saves to localStorage and calls toggleFilter', () => {
    jest.spyOn(component, 'toggleFilter').mockImplementation(jest.fn())
    component.setDataToLocalStorage({ quesMap: [], recommendationMap: [], categoryMap: [] })
    const stored = JSON.parse(localStorage.getItem('faq') || '{}')
    expect(stored[component.selectedLaguage]).toBeDefined()
    expect(component.toggleFilter).toHaveBeenCalled()
  })

  it('checkForApiCalls - uses cached data from localStorage', () => {
    const faqData = {
      en: {
        information: defaultResponseData
      }
    }
    localStorage.setItem('faq', JSON.stringify(faqData))
    localStorage.setItem('faq-languages', JSON.stringify([{ code: 'en' }]))
    jest.spyOn(component, 'initData').mockImplementation(jest.fn())
    jest.spyOn(component, 'getQns').mockImplementation(jest.fn())
    jest.spyOn(component, 'getCategories').mockImplementation(jest.fn())
    component.currentFilter = 'information'
    component.checkForApiCalls()
    expect(component.initData).toHaveBeenCalled()
  })

  it('checkForApiCalls - uses cached data with existing chatInformation', () => {
    const faqData = { en: { information: defaultResponseData } }
    localStorage.setItem('faq', JSON.stringify(faqData))
    localStorage.setItem('faq-languages', JSON.stringify([{ code: 'en' }]))
    component.currentFilter = 'information'
      ; (component as any).chatInformation = [{ type: 'incoming' }]
    jest.spyOn(component, 'getQns').mockImplementation(jest.fn())
    jest.spyOn(component, 'getCategories').mockImplementation(jest.fn())
    component.checkForApiCalls()
    expect(component.userJourney).toBe((component as any).chatInformation)
  })

  it('checkForApiCalls - uses cached issue data', () => {
    const faqData = { en: { issue: defaultResponseData } }
    localStorage.setItem('faq', JSON.stringify(faqData))
    localStorage.setItem('faq-languages', JSON.stringify([{ code: 'en' }]))
    component.currentFilter = 'issue'
    jest.spyOn(component, 'initData').mockImplementation(jest.fn())
    jest.spyOn(component, 'getQns').mockImplementation(jest.fn())
    jest.spyOn(component, 'getCategories').mockImplementation(jest.fn())
    component.checkForApiCalls()
    expect(component.initData).toHaveBeenCalled()
  })

  it('checkForApiCalls - existing chatIssues uses cached issue', () => {
    const faqData = { en: { issue: defaultResponseData } }
    localStorage.setItem('faq', JSON.stringify(faqData))
    localStorage.setItem('faq-languages', JSON.stringify([{ code: 'en' }]))
    component.currentFilter = 'issue'
      ; (component as any).chatIssues = [{ type: 'incoming' }]
    jest.spyOn(component, 'getQns').mockImplementation(jest.fn())
    jest.spyOn(component, 'getCategories').mockImplementation(jest.fn())
    component.checkForApiCalls()
    expect(component.userJourney).toBe((component as any).chatIssues)
  })

  it('checkForApiCalls - no cached data calls getLanguages', () => {
    localStorage.setItem('faq', '{}')
    localStorage.setItem('faq-languages', '[]')
    jest.spyOn(component, 'getLanguages').mockImplementation(jest.fn())
    component.checkForApiCalls()
    expect(component.getLanguages).toHaveBeenCalled()
  })

  it('getLanguages - calls chatbotService and processes response', () => {
    jest.spyOn(component, 'getData').mockImplementation(jest.fn())
    component.getLanguages()
    expect(chatbotService.getLangugages).toHaveBeenCalled()
    expect(component.getData).toHaveBeenCalled()
  })

  it('getLanguages - non-200 status does not call getData', () => {
    chatbotService.getLangugages = jest.fn(() => of({ status: { code: 404 } }))
    jest.spyOn(component, 'getData').mockImplementation(jest.fn())
    component.getLanguages()
    expect(component.getData).not.toHaveBeenCalled()
  })

  it('initData - builds userJourney with priority questions', () => {
    ; (component as any).responseData = defaultResponseData
      ; (component as any).userInfo = { name: 'John' }
    jest.spyOn(component, 'pushData').mockImplementation(jest.fn())
    jest.spyOn(component, 'getQns').mockImplementation(jest.fn())
    component.initData(defaultResponseData)
    expect(component.pushData).toHaveBeenCalled()
  })

  it('getQns - maps questions to questionsAndAns', () => {
    ; (component as any).responseData = defaultResponseData
    component.getQns()
    expect((component as any).questionsAndAns['q1']).toBeDefined()
  })

  it('selectLaguage - updates language and calls checkForApiCalls', () => {
    jest.spyOn(component, 'checkForApiCalls').mockImplementation(jest.fn())
    component.selectLaguage({ target: { value: 'hi' } })
    expect(component.selectedLaguage).toBe('hi')
    expect(component.checkForApiCalls).toHaveBeenCalled()
  })

  it('readFromLocalStorage - reads information data', () => {
    const stgData = { en: { information: { quesMap: [], recommendationMap: [], categoryMap: [] } } }
    localStorage.setItem('result', JSON.stringify(stgData))
    component.currentFilter = 'information'
    component.readFromLocalStorage()
    expect((component as any).responseData).toBeDefined()
  })

  it('readFromLocalStorage - reads issue data', () => {
    const stgData = { en: { issue: { quesMap: [], recommendationMap: [], categoryMap: [] } } }
    localStorage.setItem('result', JSON.stringify(stgData))
    component.currentFilter = 'issue'
    component.readFromLocalStorage()
    expect((component as any).responseData).toBeDefined()
  })

  it('readFromLocalStorage - no data does nothing', () => {
    localStorage.removeItem('result')
    expect(() => component.readFromLocalStorage()).not.toThrow()
  })

  it('goToBottom - calls window.scrollTo', () => {
    const spy = jest.spyOn(window, 'scrollTo').mockImplementation(jest.fn())
    component.goToBottom()
    expect(spy).toHaveBeenCalled()
  })

  it('iconClick start - shows icon and calls telemetry', () => {
    jest.spyOn(component as any, 'raiseChatStartTelemetry').mockImplementation(jest.fn())
    component.showIcon = true
    component.iconClick('start')
    expect(component.showIcon).toBe(false)
    expect((component as any).raiseChatStartTelemetry).toHaveBeenCalled()
  })

  it('iconClick end - resets state and calls telemetry', () => {
    jest.spyOn(component as any, 'raiseChatEndTelemetry').mockImplementation(jest.fn())
    jest.spyOn(component, 'checkForApiCalls').mockImplementation(jest.fn())
    component.showIcon = false
    component.iconClick('end')
    expect(component.showIcon).toBe(true)
    expect((component as any).raiseChatEndTelemetry).toHaveBeenCalled()
    expect(component.checkForApiCalls).toHaveBeenCalled()
  })

  it('toggleFilter - changes currentFilter and calls checkForApiCalls', () => {
    jest.spyOn(component, 'checkForApiCalls').mockImplementation(jest.fn())
    component.toggleFilter('issue')
    expect(component.currentFilter).toBe('issue')
    expect(component.checkForApiCalls).toHaveBeenCalled()
    expect(component.more).toBe(false)
  })

  it('pushData - pushes to chatInformation when filter=information', () => {
    component.currentFilter = 'information'
    component.pushData({ type: 'sendMsg', message: 'test' })
    expect((component as any).chatInformation.length).toBeGreaterThan(0)
  })

  it('pushData - pushes to chatIssues when filter=issue', () => {
    component.currentFilter = 'issue'
    component.pushData({ type: 'sendMsg', message: 'test' })
    expect((component as any).chatIssues.length).toBeGreaterThan(0)
  })

  it('getuserjourney - filters userJourney by tab', () => {
    component.userJourney = [{ tab: 'information' }, { tab: 'issue' }] as any
    const result = component.getuserjourney('information')
    expect(result.length).toBe(1)
  })

  it('getPriorityQuestion - filters by priority and login status', () => {
    ; (component as any).responseData = defaultResponseData
      ; (component as any).userInfo = { name: 'John' }
    const result = component.getPriorityQuestion(1)
    expect(Array.isArray(result)).toBe(true)
  })

  it('showMoreQuestion - pushes a new msg with priority questions', () => {
    ; (component as any).responseData = defaultResponseData
      ; (component as any).userInfo = { name: 'John' }
    jest.spyOn(component, 'pushData').mockImplementation(jest.fn())
    component.showMoreQuestion()
    expect(component.pushData).toHaveBeenCalled()
  })

  it('showCategory - all categories', () => {
    ; (component as any).responseData = defaultResponseData
    jest.spyOn(component, 'pushData').mockImplementation(jest.fn())
    component.categories = [{ catId: 'all', catName: 'All', priority: 0 }]
    component.showCategory({ catId: 'all', catName: 'All Categories' })
    expect(component.pushData).toHaveBeenCalledTimes(2)
  })

  it('showCategory - specific category', () => {
    ; (component as any).responseData = defaultResponseData
    jest.spyOn(component, 'pushData').mockImplementation(jest.fn())
    jest.spyOn(component, 'raiseCategotyTelemetry').mockImplementation(jest.fn())
    component.showCategory({ catId: 'cat1', catName: 'Category 1' })
    expect(component.pushData).toHaveBeenCalledTimes(2)
    expect(component.raiseCategotyTelemetry).toHaveBeenCalledWith('cat1')
  })

  it('selectedQuestion - pushes sendMsg and incoming messages', () => {
    ; (component as any).responseData = defaultResponseData
      ; (component as any).questionsAndAns = { q1: { quesValue: 'Q1?', ansVal: 'A1' } }
    jest.spyOn(component, 'pushData').mockImplementation(jest.fn())
    jest.spyOn(component, 'raiseTemeletyInterat').mockImplementation(jest.fn())
    const question = { quesID: 'q1', recommendedQues: [] }
    const data = { selectedValue: '' }
    component.selectedQuestion(question, data)
    expect(component.pushData).toHaveBeenCalledTimes(2)
    expect(data.selectedValue).toBe('q1')
  })

  it('raiseCategotyTelemetry - dispatches event', () => {
    component.raiseCategotyTelemetry('cat1')
    expect(eventSvc.dispatchChatbotEvent).toHaveBeenCalled()
  })

  it('raiseChatStartTelemetry - dispatches event', () => {
    component.raiseChatStartTelemetry()
    expect(eventSvc.dispatchChatbotEvent).toHaveBeenCalled()
  })

  it('raiseChatEndTelemetry - dispatches event', () => {
    component.raiseChatEndTelemetry()
    expect(eventSvc.dispatchChatbotEvent).toHaveBeenCalled()
  })

  it('raiseTemeletyInterat - dispatches event', () => {
    component.raiseTemeletyInterat('q1')
    expect(eventSvc.dispatchChatbotEvent).toHaveBeenCalled()
  })

  it('checkForAIQuestionResponse - does nothing (empty method)', () => {
    expect(() => component.checkForAIQuestionResponse()).not.toThrow()
  })

  it('getCategories - builds categories list (under 6)', () => {
    ; (component as any).responseData = defaultResponseData
      ; (component as any).userInfo = { name: 'John' }
    component.getCategories()
    expect(component.categories.length).toBeGreaterThan(0)
  })

  it('getCategories - more than 6 categories adds all prefix', () => {
    const manyCategories: any[] = []
    for (let i = 0; i < 7; i++) {
      manyCategories.push({ catId: `cat${i}`, catName: `Cat ${i}`, priority: i, categoryType: 'Both', recommendedQues: [] })
    }
    const catMap: any[] = manyCategories.map((_c: any, i: number) => ({ catId: `cat${i}`, catName: `Cat ${i}` }))
      ; (component as any).responseData = { ...defaultResponseData, recommendationMap: manyCategories, categoryMap: catMap }
      ; (component as any).userInfo = { name: 'John' }
    component.getCategories()
    expect(component.categories.length).toBeGreaterThan(6)
  })

  it('sortCategory - sorts categories by priority', () => {
    component.categories = [{ catId: 'cat2', priority: 2 }, { catId: 'cat1', priority: 1 }]
    const sorted = component.sortCategory()
    expect(sorted[0].priority).toBe(1)
  })

  it('scrollToBottom - calls scrollTop on scrollContainer', () => {
    const mockEl = { nativeElement: { scrollTop: 0, scrollHeight: 500 } }
      ; (component as any).myScrollContainer = mockEl
    component.scrollToBottom()
    expect(mockEl.nativeElement.scrollTop).toBe(500)
  })

  it('scrollToBottom - no container does not throw', () => {
    ; (component as any).myScrollContainer = undefined
    expect(() => component.scrollToBottom()).not.toThrow()
  })

  it('clickOutside - calls iconClick(end)', () => {
    jest.spyOn(component, 'iconClick').mockImplementation(jest.fn())
    component.clickOutside()
    expect(component.iconClick).toHaveBeenCalledWith('end')
  })

  it('startNewSupportAISearch - calls aiStartChathForSupport when startNewChat=true', () => {
    component.startNewChat = true
    component.userId = 'user1'
    component.activeLaguage = 'en'
      ; (component as any).cloneSearchQuery = 'test query'
    component.startNewSupportAISearch()
    expect(chatbotService.aiStartChathForSupport).toHaveBeenCalled()
  })

  it('startNewSupportAISearch - does nothing when startNewChat=false', () => {
    component.startNewChat = false
    component.startNewSupportAISearch()
    expect(chatbotService.aiStartChathForSupport).not.toHaveBeenCalled()
  })

  it('startNewSupportAISearch - handles response with no message', () => {
    component.startNewChat = true
    chatbotService.aiStartChathForSupport = jest.fn(() => of({}))
    component.startNewSupportAISearch()
    expect(component.initiateSupportNewChat).toBe(false)
  })

  it('supportAISearch - calls aiSendChathForSupport when initiateSupportNewChat=true', () => {
    component.initiateSupportNewChat = true
    component.userId = 'user1'
      ; (component as any).cloneSearchQuery = 'test'
      ; (component as any).aiSearchResultArr = []
    component.supportAISearch()
    expect(chatbotService.aiSendChathForSupport).toHaveBeenCalled()
  })

  it('supportAISearch - does nothing when initiateSupportNewChat=false', () => {
    component.initiateSupportNewChat = false
    component.supportAISearch()
    expect(chatbotService.aiSendChathForSupport).not.toHaveBeenCalled()
  })

  it('sharePositiveContentRating - calls saveAIChatPositiveContentRating', () => {
    ; (component as any).aiSearchResultArr = [{ items: [{ contentId: 'c1', contentTitle: 'T1' }] }]
    component.sharePositiveContentRating({ contentId: 'c1' }, 0, 0)
    expect(chatbotService.saveAIChatPositiveContentRating).toHaveBeenCalled()
  })

  it('openAIFeedbackPopup - opens dialog when result item has no down feedback', () => {
    const mockDialog = (component as any).dialog
      ; (component as any).aiSearchResultArr = [{ result: [{ feedback: 'up' }] }]
    jest.spyOn(component, 'shareAIFeedback').mockImplementation(jest.fn())
    component.openAIFeedbackPopup({ contentId: 'c1' }, 0, 0)
    expect(mockDialog.open).toHaveBeenCalled()
  })

  it('openAIFeedbackPopup - shows snackbar when already submitted feedback', () => {
    ; (component as any).aiSearchResultArr = [{ result: [{ feedback: 'down' }] }]
    component.openAIFeedbackPopup({ contentId: 'c1' }, 0, 0)
    const snackBar = (component as any).matSnackBarNew
    expect(snackBar.open).toHaveBeenCalled()
  })

  it('shareAIFeedback - calls shareAIFeedback service', () => {
    ; (component as any).aiSearchResultArr = [{ items: [{}] }]
    component.shareAIFeedback({ contentId: 'c1' }, 'positive', 0, 0)
    expect(chatbotService.shareAIFeedback).toHaveBeenCalled()
  })

  it('rejectFromInternet - sets showFromInternet=false when present', () => {
    ; (component as any).aiSearchResultArr = [{ showFromInternet: true, newMessage: 'test' }]
    component.rejectFromInternet(0)
    expect(component.resultFetch).toBe(true)
  })

  it('copyPath - sets copiedIndex', () => {
    const mockEl = { style: { position: '', left: '', top: '', opacity: '' }, value: '', focus: jest.fn(), select: jest.fn() }
    jest.spyOn(document, 'createElement').mockReturnValue(mockEl as any)
    jest.spyOn(document.body, 'appendChild').mockImplementation(jest.fn())
    jest.spyOn(document.body, 'removeChild').mockImplementation(jest.fn())
    document.execCommand = jest.fn().mockReturnValue(true)
    component.copyPath({ identifier: 'r1', mimeType: 'video/mp4' }, 0)
    expect((component as any).copiedIndex).toBe(0)
  })

  it('redirectToResource - opens window', () => {
    const spy = jest.spyOn(window, 'open').mockImplementation(jest.fn())
    component.redirectToResource({ identifier: 'r1' })
    expect(spy).toHaveBeenCalled()
  })

  it('redirectToToc - opens window for toc', () => {
    const spy = jest.spyOn(window, 'open').mockImplementation(jest.fn())
    component.redirectToToc({ identifier: 'toc1' })
    expect(spy).toHaveBeenCalled()
  })

  it('splitParagraphByWords - splits paragraph into chunks', () => {
    const para = 'word1 word2 word3 word4 word5'
    const result = component.splitParagraphByWords(para, 3)
    expect(result).toBe('word1 word2 word3')
  })

  it('toggleShow - sets showLess true for less', () => {
    ; (component as any).aiSearchResultArr = [{}]
    component.toggleShow(0, 'less')
    expect((component as any).aiSearchResultArr[0].showLess).toBe(true)
  })

  it('toggleShow - sets showLess false for non-less', () => {
    ; (component as any).aiSearchResultArr = [{}]
    component.toggleShow(0, 'more')
    expect((component as any).aiSearchResultArr[0].showLess).toBe(false)
  })

  it('raiseTelemetryForResource - dispatches event', () => {
    component.raiseTelemetryForResource({ identifier: 'r1', contentType: 'Course' })
    expect(eventSvc.dispatchChatbotEvent).toHaveBeenCalled()
  })

  it('ngOnDestroy - does not throw', () => {
    expect(() => component.ngOnDestroy()).not.toThrow()
  })

  it('ngAfterViewChecked - does not throw', () => {
    expect(() => component.ngAfterViewChecked()).not.toThrow()
  })

  it('resizeTextarea - does nothing when textArea is null', () => {
    expect(() => component.resizeTextarea(null as any, null)).not.toThrow()
  })

  it('resizeTextarea - sets height when textArea exists', () => {
    const mockTA: any = { style: { height: '' }, scrollHeight: 100 }
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: any) => { cb(); return 1 })
    jest.spyOn(window, 'getComputedStyle').mockReturnValue({ paddingTop: '5px', paddingBottom: '5px' } as any)
    component.resizeTextarea(mockTA, null)
    expect(mockTA.style.height).toBeDefined()
  })
})
