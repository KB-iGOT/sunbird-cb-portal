import { SupportAIComponent } from './support-ai.component'
import { of, Subject } from 'rxjs'
import { NavigationEnd } from '@angular/router'

describe('SupportAIComponent – High Coverage (No TestBed)', () => {
  let component: SupportAIComponent

  let configSvcMock: any
  let eventSvcMock: any
  let rendererMock: any
  let chatbotServiceMock: any
  let dialogMock: any
  let snackBarMock: any
  let routerMock: any

  beforeEach(() => {
    configSvcMock = {
      userProfile: {
        firstName: 'Test',
        profileImageUrl: '',
        professionalDetails: [],
      },
    }

    eventSvcMock = {
      dispatchChatbotEvent: jest.fn(),
    }

    rendererMock = {
      addClass: jest.fn(),
      removeClass: jest.fn(),
    }

    chatbotServiceMock = {
      getChatData: jest.fn().mockReturnValue(of({})),
      getLangugages: jest.fn().mockReturnValue(
        of({ status: { code: 200 }, payload: { languages: ['en'] } }),
      ),
      aiStartChathForSupport: jest.fn().mockReturnValue(
        of({ message: 'started' }),
      ),
      aiSendChathForSupport: jest.fn().mockReturnValue(
        of({ text: 'answer', RetrievedChunks: [] }),
      ),
      saveAIChatPositiveContentRating: jest.fn().mockReturnValue(
        of({ status: 'success' }),
      ),
      shareAIFeedback: jest.fn().mockReturnValue(
        of({ status: 'success' }),
      ),
      aiGlobalSearchFromInternet: jest.fn().mockReturnValue(
        of({ answer: 'internet answer', query_id: 'q1' }),
      ),
    }

    dialogMock = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of('feedback'),
        close: jest.fn(),
      }),
    }

    snackBarMock = {
      open: jest.fn(),
    }

    routerMock = {
      events: new Subject(),
    } as any

    component = new SupportAIComponent(
      configSvcMock,
      eventSvcMock,
      rendererMock,
      chatbotServiceMock,
      dialogMock,
      snackBarMock,
      routerMock,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // --------------------------------------------------
  // BASIC
  // --------------------------------------------------
  it('should create component', () => {
    expect(component).toBeTruthy()
  })

  // --------------------------------------------------
  // ngOnInit + Router
  // --------------------------------------------------
  it('should init user info', () => {
    component.ngOnInit()
    expect(component.userInfo.firstName).toBe('Test')
  })

  it('should set isHubEnable on navigation', () => {
    component.ngOnInit()
    routerMock.events.next(new NavigationEnd(1, '/home', '/home'))
    expect(component.isHubEnable).toBe(true)
  })

  // --------------------------------------------------
  // ngOnChanges
  // --------------------------------------------------
  it('should restart chat when chatId changes', () => {
    const spy = jest.spyOn(component, 'startNewSupportAISearch')

    component.ngOnChanges({
      chatId: {
        previousValue: '1',
        currentValue: '2',
        firstChange: false,
        isFirstChange: () => false,
      },
    } as any)

    expect(spy).toHaveBeenCalled()
  })

  // --------------------------------------------------
  // Localization
  // --------------------------------------------------
  it('should return greeting text', () => {
    component.selectedLaguage = 'en'
    expect(component.greetings()).toBe('Namaste')
  })

  it('should return localized label', () => {
    expect(component.getInfoText('information')).toBeDefined()
  })

  // --------------------------------------------------
  // Icon toggle
  // --------------------------------------------------
  it('should start chat icon', () => {
    component.iconClick('start')
    expect(rendererMock.addClass).toHaveBeenCalled()
  })

  it('should end chat icon', () => {
    component.iconClick('end')
    expect(rendererMock.removeClass).toHaveBeenCalled()
  })

  // --------------------------------------------------
  // Language change
  // --------------------------------------------------
  it('should change language and reset state', () => {
    jest.spyOn(Storage.prototype, 'setItem')

    component.chatInformation = [{}]
    component.chatIssues = [{}]

    component.selectLaguage({ target: { value: 'hi' } })

    expect(component.selectedLaguage).toBe('hi')
    expect(component.chatInformation.length).toBe(0)
    expect(component.chatIssues.length).toBe(0)
  })

  // --------------------------------------------------
  // pushData
  // --------------------------------------------------
  it('should push data to information tab', () => {
    component.currentFilter = 'information'
    component.pushData({ tab: 'information' })
    expect(component.chatInformation.length).toBe(1)
  })

  it('should push data to issue tab', () => {
    component.currentFilter = 'issue'
    component.pushData({ tab: 'issue' })
    expect(component.chatIssues.length).toBe(1)
  })

  // --------------------------------------------------
  // submitSearchQuery
  // --------------------------------------------------
  it('should return false if support chat not started', () => {
    component.initiateSupportNewChat = false
    const res = component.submitSearchQuery(
      document.createElement('textarea'),
      { preventDefault: jest.fn() },
    )
    expect(res).toBe(false)
  })

  it('should submit search query and call AI search', () => {
    component.initiateSupportNewChat = true
    component.searchQuery = 'test query'
    component.cloneSearchQuery = ''
    component.aiSearchResultArr = []

    jest.spyOn(component, 'supportAISearch')

    component.submitSearchQuery(
      document.createElement('textarea'),
      { preventDefault: jest.fn() },
    )

    expect(component.supportAISearch).toHaveBeenCalled()
    expect(component.aiSearchResultArr.length).toBeGreaterThan(0)
  })

  // --------------------------------------------------
  // AI Search
  // --------------------------------------------------
  it('should start new support AI chat', () => {
    component.startNewChat = true
    component.userId = 'u1'
    component.startNewSupportAISearch()
    expect(chatbotServiceMock.aiStartChathForSupport).toHaveBeenCalled()
  })

  it('should perform AI search', () => {
    component.initiateSupportNewChat = true
    component.cloneSearchQuery = 'query'
    component.userId = 'u1'
    component.supportAISearch()
    expect(chatbotServiceMock.aiSendChathForSupport).toHaveBeenCalled()
  })

  // --------------------------------------------------
  // Feedback
  // --------------------------------------------------
  it('should submit positive feedback', () => {
    component.aiSearchResultArr = [{ result: [{}] }]
    component.sharePositiveContentRating({ query_id: 'q1' }, 0, 0)
    expect(chatbotServiceMock.saveAIChatPositiveContentRating).toHaveBeenCalled()
  })

  it('should submit negative feedback', () => {
    component.aiSearchResultArr = [{ result: [{}] }]
    component.shareAIFeedback({ query_id: 'q1' }, 'bad', 0, 0)
    expect(chatbotServiceMock.shareAIFeedback).toHaveBeenCalled()
  })

  // --------------------------------------------------
  // DOM utilities
  // --------------------------------------------------
  it('should resize textarea', () => {
    const textarea = document.createElement('textarea')
    textarea.value = 'test text'
    component.resizeTextarea(textarea, '')
    expect(component.containerHeight).toBeGreaterThan(0)
  })

  it('should reset textarea height', () => {
    const textarea = document.createElement('textarea')
    component.textArea = { nativeElement: textarea } as any
    component.searchQuery = 'test'
    component.resetTextAreaHeight(textarea)
    expect(component.searchQuery).toBe('test')
  })

  // --------------------------------------------------
  // copy & redirect
  // --------------------------------------------------
  it('should copy resource path', () => {
    jest.useFakeTimers()
    document.execCommand = jest.fn()

    component.copyPath(
      { mimeType: 'application/pdf', identifier: 'id1', pageNumber: 1 },
      0,
    )

    expect(document.execCommand).toHaveBeenCalledWith('copy')
    jest.runAllTimers()
    jest.useRealTimers()
  })

  it('should redirect to resource', () => {
    const spy = jest.spyOn(window, 'open').mockImplementation(() => null)

    component.redirectToResource({
      mimeType: 'application/pdf',
      identifier: 'id1',
      pageNumber: 1,
    })

    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('should redirect to toc and raise telemetry', () => {
    const spy = jest.spyOn(window, 'open').mockImplementation(() => null)

    component.redirectToToc({ identifier: 'cid', contentType: 'Course' })

    expect(eventSvcMock.dispatchChatbotEvent).toHaveBeenCalled()
    expect(spy).toHaveBeenCalled()

    spy.mockRestore()
  })

  // --------------------------------------------------
  // Misc
  // --------------------------------------------------
  it('should split paragraph by words', () => {
    const res = component.splitParagraphByWords('one two three four five', 3)
    expect(res.split(' ').length).toBe(3)
  })

  it('should toggle show more/less', () => {
    component.aiSearchResultArr = [{ showLess: false }]
    component.toggleShow(0, 'less')
    expect(component.aiSearchResultArr[0].showLess).toBe(true)
  })

  it('should create initials', () => {
    component['createInititals']('Test User')
    expect(component.userInitials.length).toBeGreaterThan(0)
  })

  it('should destroy safely', () => {
    component.ngOnDestroy()
    expect(true).toBe(true)
  })
})
