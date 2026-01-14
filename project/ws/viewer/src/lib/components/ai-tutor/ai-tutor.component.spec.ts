import { of, Subject } from 'rxjs'
import { AiTutorComponent } from './ai-tutor.component'

// High coverage Jest tests without Angular TestBed

describe('AiTutorComponent (no TestBed)', () => {
  let routeMock: any
  let configSvcMock: any
  let eventSvcMock: any
  let rendererMock: any
  let rootServiceMock: any
  let websocketServiceMock: any
  let dialogMock: any
  let snackBarMock: any
  let utilitySvcMock: any
  let routerMock: any
  let component: AiTutorComponent

  beforeEach(() => {
    routeMock = {
      snapshot: {
        queryParams: {},
      },
    }

    configSvcMock = {
      userProfile: {
        firstName: 'John',
        profileImageUrl: '',
      },
      unMappedUser: {
        userId: 'user-1',
      },
    }

    eventSvcMock = {
      dispatchChatbotEvent: jest.fn(),
    }

    rendererMock = {
      addClass: jest.fn(),
      removeClass: jest.fn(),
    }

    rootServiceMock = {
      getChatData: jest.fn().mockReturnValue(of({ payload: { config: {} } })),
      getLangugages: jest.fn().mockReturnValue(of({ status: { code: 200 }, payload: { languages: [] } })),
      saveAIChatPositiveContentRating: jest.fn().mockReturnValue(of({ status: 'success' })),
      shareAIFeedback: jest.fn().mockReturnValue(of({ status: 'success' })),
      aiGlobalSearchFromInternet: jest.fn().mockReturnValue(of({ answer: 'from internet', query_id: 'q1' })),
    }

    websocketServiceMock = {
      getJWTToken: jest.fn().mockReturnValue(of({ 'x-authenticated-user-token': 'token' })),
      connect: jest.fn(),
      sendMessage: jest.fn(),
      getMessages: jest.fn().mockReturnValue(of({ answer: 'hello', retrievedChunks: [] })),
      closeConnection: jest.fn(),
    }

    dialogMock = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of('reason'),
        close: jest.fn(),
      }),
    }

    snackBarMock = {
      open: jest.fn(),
    }

    utilitySvcMock = {
      isMobile: false,
    }

    routerMock = {
      events: new Subject<any>().asObservable(),
      navigateByUrl: jest.fn(),
    }

    component = new AiTutorComponent(
      routeMock,
      configSvcMock,
      eventSvcMock,
      rendererMock,
      rootServiceMock,
      websocketServiceMock,
      dialogMock,
      snackBarMock,
      utilitySvcMock,
      routerMock,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create component and set default learning style', () => {
    expect(component).toBeTruthy()
    expect(component.selectedLearningStyle.title).toBe('None')
  })

  it('should return localized greetings and labels', () => {
    component.selectedLaguage = 'hi'

    const greet = component.greetings()
    const info = component.getInfoText('information')
    const more = component.showMore()

    expect(greet).toBe('नमस्ते')
    expect(info).toBe('जानकारी')
    expect(more).toBe('और दिखाओ')
  })

  it('setDataToLocalStorage should persist config and call toggleFilter', () => {
    component.selectedLaguage = 'en'
    component.currentFilter = 'information'
    const data = { some: 'config' }

    const toggleSpy = jest.spyOn(component as any, 'toggleFilter').mockImplementation(() => { })

    localStorage.setItem('faq', JSON.stringify({}))

    component.setDataToLocalStorage(data)

    const stored = JSON.parse(localStorage.getItem('faq') || '{}')
    expect(stored.en.information).toEqual(data)
    expect(toggleSpy).toHaveBeenCalled()
  })

  it('iconClick start should hide icon, disable scroll and raise start telemetry', () => {
    const disableSpy = jest.spyOn<any, any>(component as any, 'disableScroll').mockImplementation(() => { })
    const telemetrySpy = jest.spyOn<any, any>(component as any, 'raiseChatStartTelemetry').mockImplementation(() => { })

    component.showIcon = true
    component.iconClick('start')

    expect(component.showIcon).toBe(false)
    expect(disableSpy).toHaveBeenCalled()
    expect(telemetrySpy).toHaveBeenCalled()
  })

  it('iconClick end should reset state, enable scroll and raise end telemetry', () => {
    const enableSpy = jest.spyOn<any, any>(component as any, 'enableScroll').mockImplementation(() => { })
    const telemetrySpy = jest.spyOn<any, any>(component as any, 'raiseChatEndTelemetry').mockImplementation(() => { })

    component.showIcon = false
    component.selectedLaguage = 'hi'
    component.currentFilter = 'issue'
    component.chatInformation = [{}]
    component.chatIssues = [{}]

    component.iconClick('end')

    expect(component.showIcon).toBe(true)
    expect(component.selectedLaguage).toBe('en')
    expect(component.currentFilter).toBe('information')
    expect(component.chatInformation.length).toBe(0)
    expect(component.chatIssues.length).toBe(0)
    expect(enableSpy).toHaveBeenCalled()
    expect(telemetrySpy).toHaveBeenCalled()
  })

  it('toggleFilter should change currentFilter and reset more flag', () => {
    const checkSpy = jest.spyOn<any, any>(component as any, 'checkForApiCalls').mockImplementation(() => { })

    component.more = true
    component.toggleFilter('issue')

    expect(component.currentFilter).toBe('issue')
    expect(component.more).toBe(false)
    expect(checkSpy).toHaveBeenCalled()
  })

  it('pushData should route messages based on currentFilter', () => {
    const msgInfo = { type: 'incoming', tab: 'information' }
    const msgIssue = { type: 'incoming', tab: 'issue' }

    component.currentFilter = 'information'
    component.pushData(msgInfo)
    expect(component.chatInformation.length).toBe(1)
    expect(component.userJourney).toBe(component.chatInformation)

    component.currentFilter = 'issue'
    component.pushData(msgIssue)
    expect(component.chatIssues.length).toBe(1)
    expect(component.userJourney).toBe(component.chatIssues)
  })

  it('getPriorityQuestion should filter by priority and category type', () => {
    component.userInfo = { id: 'u1' }
    component.responseData = {
      recommendationMap: [
        {
          categoryType: 'Logged-In',
          recommendedQues: [
            { priority: 1 },
            { priority: 2 },
          ],
        },
        {
          categoryType: 'Both',
          recommendedQues: [
            { priority: 1 },
          ],
        },
      ],
    }

    const result = component.getPriorityQuestion(1)
    expect(result.length).toBe(2)
  })

  it('showMoreQuestion should push incoming message with priority questions', () => {
    component.userInfo = { id: 'u1' }
    component.responseData = {
      recommendationMap: [
        {
          categoryType: 'Logged-In',
          recommendedQues: [
            { priority: 1 },
          ],
        },
      ],
    }

    component.showMoreQuestion()

    expect(component.userJourney.length).toBe(1)
    const first: any = component.userJourney[0]
    expect(first.recommendedQues.length).toBe(1)
  })

  it('sortCategory should sort by priority', () => {
    component.categories = [
      { catId: '1', priority: 3 },
      { catId: '2', priority: 1 },
      { catId: '3', priority: 2 },
    ]

    const sorted = component.sortCategory()
    expect(sorted[0].priority).toBe(1)
    expect(sorted[2].priority).toBe(3)
  })

  it('splitParagraphByWords should return first N words', () => {
    const paragraph = 'one two three four five'
    const result = component.splitParagraphByWords(paragraph, 3)
    expect(result).toBe('one two three')
  })

  it('createInititals should derive initials from name', () => {
    ;(component as any).createInititals('John Doe')
    expect(component.userInitials).toBe('JD')
  })

  it('toggleShow should flip showLess for given index', () => {
    component.aiTutorResultArr = [
      { showLess: true },
      { showLess: false },
    ]

    component.toggleShow(0, 'more')
    expect(component.aiTutorResultArr[0].showLess).toBe(false)

    component.toggleShow(1, 'less')
    expect(component.aiTutorResultArr[1].showLess).toBe(true)
  })

  it('closeAITutorPopup should emit close event', done => {
    component.closeAIPopup.subscribe(value => {
      expect(value).toBe(true)
      done()
    })

    component.closeAITutorPopup()
  })

  it('minimizeAITutor and maximizeAITutor should toggle flag', () => {
    component.maximizeAITutor()
    expect(component.maximize).toBe(true)

    component.minimizeAITutor()
    expect(component.maximize).toBe(false)
  })
})
