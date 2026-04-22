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
    ; (component as any).createInititals('John Doe')
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

  describe('ngOnInit', () => {
    it('should initialize with production hosts when sitePath includes portal.igotkarmayogi.gov.in', () => {
      const originalEnv = (global as any).environment
        ; (global as any).environment = { sitePath: 'https://portal.igotkarmayogi.gov.in' }

      component.ngOnInit()

      expect(component.authTokenHost).toBe('learning-ai.prod.karmayogibharat.net')
      expect(component.NoneSocketHost).toBe('learning-ai.prod.karmayogibharat.net')

        ; (global as any).environment = originalEnv
    })

    it('should initialize with UAT hosts by default', () => {
      const originalEnv = (global as any).environment
        ; (global as any).environment = { sitePath: 'https://uat.example.com' }

      component.ngOnInit()

      expect(component.authTokenHost).toBe('learning-ai.uat.karmayogibharat.net')
      expect(component.NoneSocketHost).toBe('learning-ai.uat.karmayogibharat.net')

        ; (global as any).environment = originalEnv
    })

    it('should connect websocket with JWT token', () => {
      component.ngOnInit()

      expect(websocketServiceMock.getJWTToken).toHaveBeenCalled()
      expect(websocketServiceMock.connect).toHaveBeenCalled()
    })

    it('should set userInfo and create initials if no profile image', () => {
      configSvcMock.userProfile.profileImageUrl = ''
      const createInitialsSpy = jest.spyOn<any, any>(component as any, 'createInititals')

      component.ngOnInit()

      expect(component.userInfo).toBeDefined()
      expect(createInitialsSpy).toHaveBeenCalledWith('John')
    })

    it('should dispatch telemetry event on init', () => {
      component.content = 'test-content'

      component.ngOnInit()

      expect(eventSvcMock.dispatchChatbotEvent).toHaveBeenCalled()
    })

    it('should set chatId with timestamp', () => {
      component.ngOnInit()

      expect(component.chatId).toContain('user-1-')
    })
  })

  describe('getData', () => {
    it('should fetch chat data for information tab', () => {
      component.currentFilter = 'information'
      component.selectedLaguage = 'en'

      component.getData()

      expect(rootServiceMock.getChatData).toHaveBeenCalledWith({
        lang: 'en',
        config_type: 'IN'
      })
      expect(component.displayLoader).toBe(true)
    })

    it('should fetch chat data for issue tab', () => {
      component.currentFilter = 'issue'
      component.selectedLaguage = 'hi'

      component.getData()

      expect(rootServiceMock.getChatData).toHaveBeenCalledWith({
        lang: 'hi',
        config_type: 'IS'
      })
    })

    it('should call setDataToLocalStorage on success', () => {
      const mockData = { some: 'config' }
      rootServiceMock.getChatData.mockReturnValue(of({ payload: { config: mockData } }))
      const setDataSpy = jest.spyOn(component, 'setDataToLocalStorage')

      component.getData()

      expect(setDataSpy).toHaveBeenCalledWith(mockData)
      expect(component.displayLoader).toBe(false)
    })
  })

  describe('initData', () => {
    beforeEach(() => {
      component.responseData = {
        quesMap: [{ quesId: 'q1' }, { quesId: 'q2' }]
      }
      jest.spyOn(component, 'getPriorityQuestion').mockReturnValue([])
      jest.spyOn(component, 'pushData').mockImplementation(() => { })
      jest.spyOn(component as any, 'getQns').mockImplementation(() => { })
    })

    it('should initialize with incoming message and recommended questions', () => {
      component.initData({})

      expect(component.getPriorityQuestion).toHaveBeenCalledWith(1)
      expect(component.pushData).toHaveBeenCalled()
    })

    it('should reset userJourney', () => {
      component.userJourney = [{ test: 'data' }] as any

      component.initData({})

      expect(component.userJourney).toEqual([])
    })
  })

  describe('selectLaguage', () => {
    it('should update selected language and reset chats', () => {
      const event = { target: { value: 'hi' } }
      jest.spyOn(component as any, 'checkForApiCalls').mockImplementation(() => { })

      component.selectLaguage(event)

      expect(component.selectedLaguage).toBe('hi')
      expect(component.chatInformation).toEqual([])
      expect(component.chatIssues).toEqual([])
      expect(localStorage.getItem('selectedLanguage')).toBe('hi')
    })
  })

  describe('selectedQuestion', () => {
    beforeEach(() => {
      component.questionsAndAns = {
        'q1': { quesValue: 'What is X?', ansVal: 'X is Y' }
      }
      jest.spyOn(component, 'pushData').mockImplementation(() => { })
      jest.spyOn<any, any>(component as any, 'raiseTemeletyInterat').mockImplementation(() => { })
    })

    it('should push sendMsg and incoming message', () => {
      const question = { quesID: 'q1', recommendedQues: [] }
      const data: any = {}

      component.selectedQuestion(question, data)

      expect(component.pushData).toHaveBeenCalledTimes(2)
      expect(data.selectedValue).toBe('q1')
    })

    it('should raise telemetry event', () => {
      const question = { quesID: 'q1' }

      component.selectedQuestion(question, {})

      expect((component as any).raiseTemeletyInterat).toHaveBeenCalledWith('q1')
    })
  })

  describe('getuserjourney', () => {
    it('should filter userJourney by tab', () => {
      component.userJourney = [
        { tab: 'information' },
        { tab: 'issue' },
        { tab: 'information' }
      ] as any

      const result = component.getuserjourney('information')

      expect(result.length).toBe(2)
    })
  })

  describe('showCategory', () => {
    beforeEach(() => {
      component.responseData = {
        recommendationMap: [
          { catId: 'cat1', recommendedQues: [{ id: 1 }] }
        ]
      }
      jest.spyOn(component, 'pushData').mockImplementation(() => { })
      jest.spyOn(component, 'sortCategory').mockReturnValue([])
      jest.spyOn<any, any>(component as any, 'raiseCategotyTelemetry').mockImplementation(() => { })
    })

    it('should show all categories when catId is all', () => {
      const catItem = { catId: 'all', catName: 'All' }

      component.showCategory(catItem)

      expect(component.sortCategory).toHaveBeenCalled()
      expect(component.more).toBe(false)
    })

    it('should show specific category questions', () => {
      const catItem = { catId: 'cat1', catName: 'Category 1' }

      component.showCategory(catItem)

      expect((component as any).raiseCategotyTelemetry).toHaveBeenCalledWith('cat1')
      expect(component.pushData).toHaveBeenCalledTimes(2)
    })
  })

  describe('telemetry methods', () => {
    it('raiseCategotyTelemetry should dispatch event', () => {
      ; (component as any).raiseCategotyTelemetry('cat-id')

      expect(eventSvcMock.dispatchChatbotEvent).toHaveBeenCalled()
    })

    it('raiseChatStartTelemetry should dispatch loaded event', () => {
      ; (component as any).raiseChatStartTelemetry()

      expect(eventSvcMock.dispatchChatbotEvent).toHaveBeenCalled()
    })

    it('raiseChatEndTelemetry should dispatch unloaded event', () => {
      ; (component as any).raiseChatEndTelemetry()

      expect(eventSvcMock.dispatchChatbotEvent).toHaveBeenCalled()
    })

    it('raiseTemeletyInterat should dispatch interact event', () => {
      ; (component as any).raiseTemeletyInterat('test-id')

      expect(eventSvcMock.dispatchChatbotEvent).toHaveBeenCalled()
    })
  })

  describe('checkForApiCalls', () => {
    it('should load from localStorage if data exists', () => {
      localStorage.setItem('faq', JSON.stringify({ en: { information: { test: 'data' } } }))
      localStorage.setItem('faq-languages', JSON.stringify([{ code: 'en' }]))
      jest.spyOn(component as any, 'initData').mockImplementation(() => { })
      jest.spyOn(component as any, 'getQns').mockImplementation(() => { })
      jest.spyOn(component as any, 'getCategories').mockImplementation(() => { })

      component.checkForApiCalls()

      expect((component as any).getQns).toHaveBeenCalled()
      expect((component as any).getCategories).toHaveBeenCalled()
    })

    it('should call getLanguages if no localStorage data', () => {
      localStorage.clear()
      jest.spyOn(component as any, 'getLanguages').mockImplementation(() => { })

      component.checkForApiCalls()

      expect((component as any).getLanguages).toHaveBeenCalled()
    })
  })

  describe('getCategories', () => {
    it('should build categories list for logged-in users', () => {
      component.userInfo = { id: 'user-1' }
      component.responseData = {
        recommendationMap: [
          { catId: 'c1', categoryType: 'Logged-In', priority: 1 }
        ],
        categoryMap: [
          { catId: 'c1', catName: 'Category 1' }
        ]
      }

        ; (component as any).getCategories()

      expect(component.categories.length).toBeGreaterThan(0)
    })

    it('should include categories with Both type', () => {
      component.userInfo = null
      component.responseData = {
        recommendationMap: [
          { catId: 'c2', categoryType: 'Both', priority: 1 }
        ],
        categoryMap: [
          { catId: 'c2', catName: 'Category 2' }
        ]
      }

        ; (component as any).getCategories()

      expect(component.categories.length).toBeGreaterThan(0)
    })
  })

  describe('getLanguages', () => {
    it('should fetch languages and call getData', () => {
      jest.spyOn(component, 'getData').mockImplementation(() => { })

        ; (component as any).getLanguages()

      expect(rootServiceMock.getLangugages).toHaveBeenCalled()
      expect(component.getData).toHaveBeenCalled()
      expect(component.displayLoader).toBe(false)
    })
  })

  describe('submitSearchQuery', () => {
    let textAreaMock: any

    beforeEach(() => {
      textAreaMock = document.createElement('textarea')
      jest.spyOn(component, 'resetTextAreaHeight').mockImplementation(() => { })
      jest.spyOn(component, 'scrollToBottom').mockImplementation(() => { })
      jest.spyOn(component as any, 'sendAITutorMessage').mockImplementation(() => { })
    })

    it('should return false if search query is empty', () => {
      component.searchQueryAItutor = '  '

      const result = component.submitSearchQuery(textAreaMock, { preventDefault: jest.fn() })

      expect(result).toBe(false)
    })

    it('should push search query and call sendAITutorMessage', () => {
      component.searchQueryAItutor = 'test query'
      component.aiTutorResultArr = []

      component.submitSearchQuery(textAreaMock, { preventDefault: jest.fn() })

      expect(component.aiTutorResultArr.length).toBeGreaterThan(0)
      expect((component as any).sendAITutorMessage).toHaveBeenCalled()
    })

    it('should remove empty messages from array', () => {
      component.searchQueryAItutor = 'test'
      component.aiTutorResultArr = [{ newMessage: '' }, { newMessage: 'valid' }]

      component.submitSearchQuery(textAreaMock, { preventDefault: jest.fn() })

      const emptyMessages = component.aiTutorResultArr.filter((m: any) => m.newMessage === '')
      expect(emptyMessages.length).toBe(0)
    })
  })

  describe('sendAITutorMessage', () => {
    it('should send message via websocket', () => {
      component.cloneSearchQuery = 'test query'
      component.content = 'content-id'
      jest.spyOn(component as any, 'getAiTutorMessage').mockImplementation(() => { })

      jest.useFakeTimers()
        ; (component as any).sendAITutorMessage()

      expect(websocketServiceMock.sendMessage).toHaveBeenCalledWith({
        message: 'test query',
        query: 'test query',
        folder_name: 'content-id'
      })

      jest.advanceTimersByTime(1000)
      expect((component as any).getAiTutorMessage).toHaveBeenCalled()
      jest.useRealTimers()
    })
  })

  describe('getAiTutorMessage', () => {
    it('should subscribe to websocket messages', () => {
      ; (component as any).getAiTutorMessage()

      expect(websocketServiceMock.getMessages).toHaveBeenCalled()
      expect(component.resultFetch).toBe(true)
    })
  })

  describe('aiTutorResultMessage', () => {
    beforeEach(() => {
      component.aiTutorResult = {
        answer: 'Test answer with many words to test the truncation feature and show less functionality',
        query: 'test',
        query_id: 'q1',
        clientId: 'c1',
        retrievedChunks: [
          {
            Name: 'Content 1',
            MimeType: 'application/pdf',
            ContentType: 'Resource',
            ArtifactURL: 'url',
            Description: 'Description',
            Identifier: 'id1',
            ContentStart: '10',
            ContentEnd: '20'
          }
        ]
      }
      component.content = 'test-content'
      routeMock.snapshot.queryParams = { param1: 'value1' }
    })

    it('should process AI tutor results and build result array', () => {
      ; (component as any).aiTutorResultMessage()

      expect(component.iGOTAITutorResultArr.length).toBeGreaterThan(0)
      expect(component.aiTutorResultArr.length).toBeGreaterThan(0)
    })

    it('should set showLess flag for long answers', () => {
      ; (component as any).aiTutorResultMessage()

      const lastResult = component.aiTutorResultArr[component.aiTutorResultArr.length - 1]
      expect(lastResult.showLess).toBeDefined()
    })

    it('should handle empty retrievedChunks', () => {
      component.aiTutorResult.retrievedChunks = null

        ; (component as any).aiTutorResultMessage()

      expect(component.aiTutorResult.retrievedChunks).toEqual([])
    })

    it('should set showFromInternet flag when no answer and no chunks', () => {
      component.aiTutorResult.answer = ''
      component.aiTutorResult.retrievedChunks = []

        ; (component as any).aiTutorResultMessage()

      const lastResult = component.aiTutorResultArr[component.aiTutorResultArr.length - 1]
      expect(lastResult.showFromInternet).toBe(true)
    })
  })

  describe('redirectToResource', () => {
    beforeEach(() => {
      routeMock.snapshot.queryParams = { st: '10', et: '20', other: 'param' }
      utilitySvcMock.isMobile = false
    })

    it('should navigate to PDF resource', () => {
      const item = {
        mimeType: 'application/pdf',
        identifier: 'pdf-id',
        pageNumber: 5
      }

      component.redirectToResource(item)

      expect(routerMock.navigateByUrl).toHaveBeenCalled()
    })

    it('should navigate to video resource with time stamps', () => {
      const item = {
        mimeType: 'video/mp4',
        identifier: 'video-id',
        contentStart: 10,
        contentEnd: 20
      }

      component.redirectToResource(item)

      expect(routerMock.navigateByUrl).toHaveBeenCalled()
    })

    it('should minimize popup on mobile', () => {
      utilitySvcMock.isMobile = true
      const item = { mimeType: 'application/pdf', identifier: 'id', pageNumber: 1 }

      component.redirectToResource(item)

      expect(component.maximize).toBe(false)
    })
  })

  describe('copyPath', () => {
    it('should copy resource path to clipboard', () => {
      ; (document as any).execCommand = jest.fn()
      const item = {
        mimeType: 'application/pdf',
        identifier: 'pdf-id',
        pageNumber: 1
      }

      component.copyPath(item, 0)

      expect(component.copiedIndex).toBe(0)
    })

    it('should reset copiedIndex after timeout', () => {
      jest.useFakeTimers()
        ; (document as any).execCommand = jest.fn()

      component.copyPath({ mimeType: 'application/pdf', identifier: 'id', pageNumber: 1 }, 2)

      jest.advanceTimersByTime(1000)
      expect(component.copiedIndex).toBe(-1)
      jest.useRealTimers()
    })
  })

  describe('redirectToToc', () => {
    it('should open TOC in new window and dispatch telemetry', () => {
      window.open = jest.fn()
      const chat = { identifier: 'content-id', contentType: 'Course' }

      component.redirectToToc(chat)

      expect(window.open).toHaveBeenCalled()
      expect(eventSvcMock.dispatchChatbotEvent).toHaveBeenCalled()
    })
  })

  describe('getLearningStyle', () => {
    beforeEach(() => {
      component.aiTutorResultArr = [{ test: 'data' }]
      component.jwtToken = 'test-token'
    })

    it('should connect to Socratic Style websocket', () => {
      component.selectedLearningStyle = { title: 'Socratic Style' }
      component.SocraticeStyleHost = 'test-host'

      component.getLearningStyle()

      expect(websocketServiceMock.closeConnection).toHaveBeenCalled()
      expect(websocketServiceMock.connect).toHaveBeenCalledWith('wss://test-host/socratic/v1/ws?token=test-token')
      expect(component.aiTutorResultArr).toEqual([])
    })

    it('should connect to None websocket', () => {
      component.selectedLearningStyle = { title: 'None' }
      component.NoneSocketHost = 'none-host'

      component.getLearningStyle()

      expect(websocketServiceMock.connect).toHaveBeenCalledWith('wss://none-host/ws?token=test-token')
    })

    it('should connect to Storytelling websocket', () => {
      component.selectedLearningStyle = { title: 'Storytelling' }
      component.StorytellingHost = 'story-host'

      component.getLearningStyle()

      expect(websocketServiceMock.connect).toHaveBeenCalledWith('wss://story-host/storytelling/v1/ws?token=test-token')
    })

    it('should generate new chatId', () => {
      const oldChatId = component.chatId
      component.selectedLearningStyle = { title: 'None' }

      component.getLearningStyle()

      expect(component.chatId).not.toBe(oldChatId)
    })
  })

  describe('raiseTelemetryForResource', () => {
    it('should dispatch telemetry event for resource', () => {
      component.content = 'test-content'
      const item = { identifier: 'res-id', contentType: 'Resource' }

      component.raiseTelemetryForResource(item)

      expect(eventSvcMock.dispatchChatbotEvent).toHaveBeenCalled()
    })
  })

  describe('feedback methods', () => {
    describe('sharePositiveContentRating', () => {
      beforeEach(() => {
        component.aiTutorResultArr = [
          {
            answer: 'answer',
            result: [{ showLoader: false, feedback: '' }]
          }
        ]
        component.content = 'content-id'
        component.chatId = 'chat-123'
        configSvcMock.unMappedUser.userId = 'user-1'
      })

      it('should save positive rating successfully', () => {
        const item = { query_id: 'q1', query: 'test' }

        component.sharePositiveContentRating(item, 0, 0)

        expect(rootServiceMock.saveAIChatPositiveContentRating).toHaveBeenCalled()
        expect(component.aiTutorResultArr[0].result[0].showLoader).toBe(true)
      })

      it('should show success snackbar', () => {
        component.sharePositiveContentRating({ query_id: 'q1', query: 'test' }, 0, 0)

        expect(snackBarMock.open).toHaveBeenCalledWith(
          'Thank you for your feedback.', 'X',
          { duration: 5000, panelClass: ['success'] }
        )
      })
    })

    describe('openAIFeedbackPopup', () => {
      beforeEach(() => {
        component.aiTutorResultArr = [
          { result: [{ feedback: '' }] }
        ]
      })

      it('should open feedback dialog', () => {
        component.openAIFeedbackPopup({ query_id: 'q1' }, 0, 0)

        expect(dialogMock.open).toHaveBeenCalled()
      })

      it('should not open dialog if feedback already given', () => {
        component.aiTutorResultArr[0].result[0].feedback = 'down'

        component.openAIFeedbackPopup({ query_id: 'q1' }, 0, 0)

        expect(snackBarMock.open).toHaveBeenCalledWith(
          'You have already submitted feedback', 'X',
          { duration: 5000, panelClass: ['error'] }
        )
      })
    })

    describe('shareAIFeedback', () => {
      beforeEach(() => {
        component.aiTutorResultArr = [
          {
            answer: 'answer',
            result: [{ showLoader: false }]
          }
        ]
        component.content = 'content-id'
        component.chatId = 'chat-123'
      })

      it('should submit negative feedback', () => {
        component.shareAIFeedback({ query_id: 'q1', query: 'test' }, 'Bad answer', 0, 0)

        expect(rootServiceMock.shareAIFeedback).toHaveBeenCalled()
      })
    })

    describe('sharePositiveContentRatingForAnswer', () => {
      it('should save positive rating for answer', () => {
        component.aiTutorResultArr = [{ answer: 'ans', showLoader: false }]
        component.content = 'content-id'
        component.chatId = 'chat-123'
        const item = { query_id: 'q1', query: 'test', answer: 'ans' }

        component.sharePositiveContentRatingForAnswer(item, 0)

        expect(rootServiceMock.saveAIChatPositiveContentRating).toHaveBeenCalled()
      })
    })

    describe('openAIFeedbackPopupForAnswer', () => {
      it('should open dialog for answer feedback', () => {
        component.aiTutorResultArr = [{ feedback: '' }]

        component.openAIFeedbackPopupForAnswer({ query_id: 'q1' }, 0)

        expect(dialogMock.open).toHaveBeenCalled()
      })
    })
  })

  describe('callFromInternet', () => {
    beforeEach(() => {
      component.cloneSearchQuery = 'test query'
      component.userInfo = {
        professionalDetails: [{ designation: 'Manager' }],
        departmentName: 'IT',
        userId: 'user-1'
      }
      component.aiTutorResultArr = [{ showFromInternet: true }]
    })

    it('should call internet search API when no answer', () => {
      const item = { answer: null }

      component.callFromInternet(item, 0)

      expect(rootServiceMock.aiGlobalSearchFromInternet).toHaveBeenCalled()
    })

    it('should hide showFromInternet flag', () => {
      component.callFromInternet({ answer: null }, 0)

      expect(component.aiTutorResultArr[0].showFromInternet).toBe(false)
    })

    it('should process internet search result', () => {
      component.callFromInternet({ answer: null }, 0)

      expect(component.resultFetch).toBe(true)
    })
  })

  describe('rejectFromInternet', () => {
    it('should hide internet option and remove empty messages', () => {
      component.aiTutorResultArr = [
        { showFromInternet: true },
        { newMessage: '' }
      ]

      component.rejectFromInternet(0)

      expect(component.aiTutorResultArr[0].showFromInternet).toBe(false)
      expect(component.resultFetch).toBe(true)
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from message subscription', () => {
      const mockSubscription = {
        unsubscribe: jest.fn()
      }
      component['messageSubscription'] = mockSubscription as any

      component.ngOnDestroy()

      expect(mockSubscription.unsubscribe).toHaveBeenCalled()
    })

    it('should dispatch telemetry unload event', () => {
      component.content = 'test-content'

      component.ngOnDestroy()

      expect(eventSvcMock.dispatchChatbotEvent).toHaveBeenCalled()
    })
  })

  describe('resizeTextarea', () => {
    it('should resize textarea based on content', () => {
      const textArea = document.createElement('textarea')
      Object.defineProperty(textArea, 'scrollHeight', { value: 100, configurable: true })

      component.resizeTextarea(textArea, '')

      expect(textArea.style.height).toBe('auto')
    })
  })

  describe('resetTextAreaHeight', () => {
    it('should reset textarea to default height', () => {
      const textArea = document.createElement('textarea')
      component.textArea = { nativeElement: textArea } as any
      component.searchQueryAItutor = '  test  '

      jest.useFakeTimers()
      component.resetTextAreaHeight(textArea)
      jest.advanceTimersByTime(0)

      expect(component.searchQueryAItutor).toBe('test')
      jest.useRealTimers()
    })
  })

  describe('ngAfterViewInit', () => {
    it('should call resizeTextarea', () => {
      const textArea = document.createElement('textarea')
      component.textArea = { nativeElement: textArea } as any
      jest.spyOn(component, 'resizeTextarea')

      component.ngAfterViewInit()

      expect(component.resizeTextarea).toHaveBeenCalled()
    })
  })

  describe('scrollToBottom', () => {
    it('should scroll message container to bottom', () => {
      const container = document.createElement('div')
      container.id = 'container-none'
      container.scrollTo = jest.fn()
      document.body.appendChild(container)

      component.scrollToBottom()

      expect(container.scrollTo).toHaveBeenCalled()
      container.remove()
    })
  })

  describe('clickOutside', () => {
    it('should call iconClick with end', () => {
      jest.spyOn(component, 'iconClick')

      component.clickOutside()

      expect(component.iconClick).toHaveBeenCalledWith('end')
    })
  })

  describe('readFromLocalStorage', () => {
    it('should read information data from localStorage', () => {
      const mockData = { en: { information: { test: 'info' } } }
      localStorage.setItem('result', JSON.stringify(mockData))
      component.currentFilter = 'information'
      component.selectedLaguage = 'en'

        ; (component as any).readFromLocalStorage()

      expect(component.responseData.test).toBe('info')
    })

    it('should read issue data from localStorage', () => {
      const mockData = { en: { issue: { test: 'issue' } } }
      localStorage.setItem('result', JSON.stringify(mockData))
      component.currentFilter = 'issue'

        ; (component as any).readFromLocalStorage()

      expect(component.responseData.test).toBe('issue')
    })
  })

  describe('edge cases', () => {
    it('should handle empty aiTutorResult gracefully', () => {
      component.aiTutorResult = null

      expect(() => (component as any).aiTutorResultMessage()).not.toThrow()
    })

    it('should handle undefined websocket response', () => {
      websocketServiceMock.getMessages.mockReturnValue(of(undefined))

      expect(() => (component as any).getAiTutorMessage()).not.toThrow()
    })

    it('should handle null userInfo in createInitials', () => {
      expect(() => (component as any).createInititals(null)).not.toThrow()
    })
  })
})
