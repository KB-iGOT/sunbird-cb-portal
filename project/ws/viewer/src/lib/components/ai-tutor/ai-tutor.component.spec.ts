import { AiTutorComponent } from './ai-tutor.component'
import { of, Subject } from 'rxjs'
import { WsEvents } from '@sunbird-cb/utils-v2'

// Mock cloneDeep
jest.mock('lodash/cloneDeep', () => ({
  default: (val: any) => JSON.parse(JSON.stringify(val)),
}))

describe('AiTutorComponent (no TestBed)', () => {
  let component: AiTutorComponent
  let mockActivatedRoute: any
  let mockConfigSvc: any
  let mockEventSvc: any
  let mockRenderer: any
  let mockChatbotService: any
  let mockWebsocketService: any
  let mockDialog: any
  let mockMatSnackBarNew: any
  let mockUtilitySvc: any
  let mockRouter: any

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: {
        queryParams: { param1: 'value1', param2: 'value2' },
      },
    } as any

    mockConfigSvc = {
      userProfile: {
        firstName: 'John',
        lastName: 'Doe',
        profileImageUrl: 'https://example.com/profile.jpg',
        professionalDetails: [{ designation: 'Developer' }],
        departmentName: 'IT',
      },
      unMappedUser: {
        userId: 'user123',
      },
    } as any

    mockEventSvc = {
      dispatchChatbotEvent: jest.fn(),
    } as any

    mockRenderer = {
      addClass: jest.fn(),
      removeClass: jest.fn(),
    } as any

    mockChatbotService = {
      getChatData: jest.fn().mockReturnValue(of({ payload: { config: {} } })),
      getLangugages: jest.fn().mockReturnValue(
        of({ status: { code: 200 }, payload: { languages: [{ code: 'en' }, { code: 'hi' }] } })
      ),
      aiGlobalSearchFromInternet: jest.fn().mockReturnValue(
        of({ answer: 'Test answer', query_id: 'query123' })
      ),
      saveAIChatPositiveContentRating: jest.fn().mockReturnValue(of({ status: 'success' })),
      shareAIFeedback: jest.fn().mockReturnValue(of({ status: 'success' })),
    } as any

    mockWebsocketService = {
      connect: jest.fn(),
      sendMessage: jest.fn(),
      getMessages: jest.fn().mockReturnValue(of('Test message')),
      getJWTToken: jest.fn().mockReturnValue(of({ 'x-authenticated-user-token': 'test-token' })),
      closeConnection: jest.fn(),
    } as any

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of('Test feedback')),
        close: jest.fn(),
      }),
    } as any

    mockMatSnackBarNew = {
      open: jest.fn(),
    } as any

    mockUtilitySvc = {
      isMobile: false,
    } as any

    mockRouter = {
      events: new Subject(),
      navigateByUrl: jest.fn(),
    } as any

    jest.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should create the component', () => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )

      expect(component).toBeDefined()
      expect(component.selectedLearningStyle).toEqual(component.learningStyle[0])
    })

    it('should initialize with default properties', () => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )

      expect(component.from).toBe('')
      expect(component.showIcon).toBe(true)
      expect(component.currentFilter).toBe('information')
      expect(component.selectedLaguage).toBe('en')
      expect(component.displayLoader).toBe(false)
      expect(component.expanded).toBe(false)
      expect(component.maximize).toBe(true)
    })
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      jest.spyOn(component, 'checkForApiCalls').mockImplementation()
    })

    it('should initialize component on ngOnInit', () => {
      component.ngOnInit()

      expect(component.isMobile).toBe(false)
      expect(component.userInfo).toBe(mockConfigSvc.userProfile)
      expect(mockWebsocketService.getJWTToken).toHaveBeenCalled()
    })

    it('should set authTokenHost for UAT environment', () => {
      component.ngOnInit()

      expect(component.authTokenHost).toBe('learning-ai.uat.karmayogibharat.net')
    })

    it('should create user initials when no profile image', () => {
      mockConfigSvc.userProfile.profileImageUrl = ''
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )

      component.ngOnInit()

      expect(component.initials).toBeDefined()
    })

    it('should connect websocket with JWT token', () => {
      component.ngOnInit()

      expect(mockWebsocketService.getJWTToken).toHaveBeenCalled()
    })

    it('should generate chatId with userId and timestamp', () => {
      component.ngOnInit()

      expect(component.chatId).toContain('user123-')
    })
  })

  describe('greetings', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should return greeting in English', () => {
      component.selectedLaguage = 'en'

      const result = component.greetings()

      expect(result).toBe('Namaste')
    })

    it('should return greeting in Hindi', () => {
      component.selectedLaguage = 'hi'

      const result = component.greetings()

      expect(result).toBe('नमस्ते')
    })
  })

  describe('getInfoText', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should return localized text for English', () => {
      component.selectedLaguage = 'en'

      const result = component.getInfoText('information')

      expect(result).toBe('Information')
    })

    it('should return localized text for Hindi', () => {
      component.selectedLaguage = 'hi'

      const result = component.getInfoText('issue')

      expect(result).toBe('समस्या')
    })

    it('should return label if translation not found', () => {
      component.selectedLaguage = 'en'

      const result = component.getInfoText('unknown')

      expect(result).toBe('unknown')
    })
  })

  describe('showMore', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should return showmore text in English', () => {
      component.selectedLaguage = 'en'

      const result = component.showMore()

      expect(result).toBe('Show More')
    })

    it('should return showmore text in Hindi', () => {
      component.selectedLaguage = 'hi'

      const result = component.showMore()

      expect(result).toBe('और दिखाओ')
    })
  })

  describe('getData', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      jest.spyOn(component, 'setDataToLocalStorage').mockImplementation()
      jest.spyOn(component, 'checkForApiCalls').mockImplementation()
    })

    it('should fetch chat data for information filter', () => {
      component.currentFilter = 'information'

      component.getData()

      expect(mockChatbotService.getChatData).toHaveBeenCalledWith({
        lang: 'en',
        config_type: 'IN',
      })
    })

    it('should fetch chat data for issue filter', () => {
      component.currentFilter = 'issue'

      component.getData()

      expect(mockChatbotService.getChatData).toHaveBeenCalledWith({
        lang: 'en',
        config_type: 'IS',
      })
    })

    it('should call setDataToLocalStorage on success', () => {
      component.getData()

      expect(component.setDataToLocalStorage).toHaveBeenCalled()
    })
  })

  describe('selectLaguage', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      jest.spyOn(component, 'checkForApiCalls').mockImplementation()
      Storage.prototype.setItem = jest.fn()
    })

    it('should change language and clear chat arrays', () => {
      const event = { target: { value: 'hi' } }
      component.chatInformation = [{ message: 'test' }]
      component.chatIssues = [{ message: 'test' }]

      component.selectLaguage(event)

      expect(component.selectedLaguage).toBe('hi')
      expect(component.chatInformation).toEqual([])
      expect(component.chatIssues).toEqual([])
      expect(Storage.prototype.setItem).toHaveBeenCalledWith('selectedLanguage', 'hi')
    })
  })

  describe('toggleFilter', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      jest.spyOn(component, 'checkForApiCalls').mockImplementation()
    })

    it('should toggle filter to information', () => {
      component.toggleFilter('information')

      expect(component.currentFilter).toBe('information')
      expect(component.more).toBe(false)
    })

    it('should toggle filter to issue', () => {
      component.toggleFilter('issue')

      expect(component.currentFilter).toBe('issue')
      expect(component.more).toBe(false)
    })
  })

  describe('iconClick', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      jest.spyOn(component, 'raiseChatStartTelemetry').mockImplementation()
      jest.spyOn(component, 'raiseChatEndTelemetry').mockImplementation()
      jest.spyOn(component, 'checkForApiCalls').mockImplementation()
    })

    it('should start chat and disable scroll', () => {
      component.iconClick('start')

      expect(component.showIcon).toBe(false)
      expect(mockRenderer.addClass).toHaveBeenCalled()
      expect(component.raiseChatStartTelemetry).toHaveBeenCalled()
    })

    it('should end chat and enable scroll', () => {
      component.iconClick('end')

      expect(component.showIcon).toBe(false)
      expect(component.raiseChatEndTelemetry).toHaveBeenCalled()
      expect(component.userJourney).toEqual([])
      expect(mockRenderer.removeClass).toHaveBeenCalled()
    })
  })

  describe('pushData', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should push data to chatInformation for information filter', () => {
      component.currentFilter = 'information'
      const msg = { type: 'incoming', message: 'test' }

      component.pushData(msg)

      expect(component.chatInformation).toContain(msg)
      expect(component.userJourney.length).toBeGreaterThan(0)
    })

    it('should push data to chatIssues for issue filter', () => {
      component.currentFilter = 'issue'
      const msg = { type: 'incoming', message: 'test' }

      component.pushData(msg)

      expect(component.chatIssues).toContain(msg)
      expect(component.userJourney.length).toBeGreaterThan(0)
    })
  })

  describe('submitSearchQuery', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      jest.spyOn(component, 'resetTextAreaHeight').mockImplementation()
      jest.spyOn(component, 'sendAITutorMessage').mockImplementation()
      jest.spyOn(component, 'scrollToBottom').mockImplementation()
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return false for empty search query', () => {
      const textArea = document.createElement('textarea')
      component.searchQueryAItutor = ''
      const event = { preventDefault: jest.fn() }

      const result = component.submitSearchQuery(textArea, event)

      expect(result).toBe(false)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should process valid search query', () => {
      const textArea = document.createElement('textarea')
      component.searchQueryAItutor = 'Test query'
      const event = { preventDefault: jest.fn() }

      component.submitSearchQuery(textArea, event)

      expect(component.cloneSearchQuery).toBe('Test query')
      expect(component.aiTutorResultArr.length).toBe(2)
      expect(component.sendAITutorMessage).toHaveBeenCalled()
    })

    it('should trim search query', () => {
      const textArea = document.createElement('textarea')
      component.searchQueryAItutor = '  Test query  '
      const event = { preventDefault: jest.fn() }

      component.submitSearchQuery(textArea, event)

      expect(component.cloneSearchQuery.trim()).toBe('Test query')
    })

    it('should call scrollToBottom after timeout', () => {
      const textArea = document.createElement('textarea')
      component.searchQueryAItutor = 'Test query'
      const event = { preventDefault: jest.fn() }

      component.submitSearchQuery(textArea, event)
      jest.advanceTimersByTime(0)

      expect(component.scrollToBottom).toHaveBeenCalled()
    })
  })

  describe('sendAITutorMessage', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      jest.spyOn(component, 'getAiTutorMessage').mockImplementation()
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should send message via websocket', () => {
      component.cloneSearchQuery = 'Test query'
      component.content = 'content123'

      component.sendAITutorMessage()

      expect(mockWebsocketService.sendMessage).toHaveBeenCalledWith({
        message: 'Test query',
        query: 'Test query',
        folder_name: 'content123',
      })
    })

    it('should call getAiTutorMessage after timeout', () => {
      component.cloneSearchQuery = 'Test query'

      component.sendAITutorMessage()
      jest.advanceTimersByTime(1000)

      expect(component.getAiTutorMessage).toHaveBeenCalled()
    })

    it('should not send message if cloneSearchQuery is empty', () => {
      component.cloneSearchQuery = ''

      component.sendAITutorMessage()

      expect(mockWebsocketService.sendMessage).not.toHaveBeenCalled()
    })
  })

  describe('getAiTutorMessage', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      jest.spyOn(component, 'aiTutorResultMessage').mockImplementation()
    })

    it('should subscribe to websocket messages', () => {
      component.getAiTutorMessage()

      expect(mockWebsocketService.getMessages).toHaveBeenCalled()
      expect(component.resultFetch).toBe(true)
    })

    it('should call aiTutorResultMessage on receiving message', () => {
      component.getAiTutorMessage()

      expect(component.aiTutorResultMessage).toHaveBeenCalled()
    })
  })

  describe('splitParagraphByWords', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should split paragraph by default 30 words', () => {
      const paragraph = 'word '.repeat(50)

      const result = component.splitParagraphByWords(paragraph)

      const wordCount = result.trim().split(/\s+/).length
      expect(wordCount).toBe(30)
    })

    it('should split paragraph by custom word count', () => {
      const paragraph = 'word '.repeat(50)

      const result = component.splitParagraphByWords(paragraph, 10)

      const wordCount = result.trim().split(/\s+/).length
      expect(wordCount).toBe(10)
    })
  })

  describe('toggleShow', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.aiTutorResultArr = [{ showLess: false }, { showLess: true }]
    })

    it('should toggle showLess to true', () => {
      component.toggleShow(0, 'less')

      expect(component.aiTutorResultArr[0]['showLess']).toBe(true)
    })

    it('should toggle showLess to false', () => {
      component.toggleShow(1, 'more')

      expect(component.aiTutorResultArr[1]['showLess']).toBe(false)
    })
  })

  describe('getLearningStyle', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.jwtToken = 'test-token'
    })

    it('should connect to Socratic Style socket', () => {
      component.selectedLearningStyle = { title: 'Socratic Style' }
      component.SocraticeStyleHost = 'test-host'

      component.getLearningStyle()

      expect(mockWebsocketService.closeConnection).toHaveBeenCalled()
      expect(mockWebsocketService.connect).toHaveBeenCalledWith(
        'wss://test-host/socratic/v1/ws?token=test-token'
      )
      expect(component.aiTutorResultArr).toEqual([])
    })

    it('should connect to None socket', () => {
      component.selectedLearningStyle = { title: 'None' }
      component.NoneSocketHost = 'test-host'

      component.getLearningStyle()

      expect(mockWebsocketService.closeConnection).toHaveBeenCalled()
      expect(mockWebsocketService.connect).toHaveBeenCalledWith('wss://test-host/ws?token=test-token')
    })

    it('should connect to Storytelling socket', () => {
      component.selectedLearningStyle = { title: 'Storytelling' }
      component.StorytellingHost = 'test-host'

      component.getLearningStyle()

      expect(mockWebsocketService.closeConnection).toHaveBeenCalled()
      expect(mockWebsocketService.connect).toHaveBeenCalledWith(
        'wss://test-host/storytelling/v1/ws?token=test-token'
      )
    })
  })

  describe('sharePositiveContentRating', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.content = 'content123'
      component.chatId = 'chat123'
      component.aiTutorResultArr = [
        {
          answer: 'Test answer',
          query_id: 'query123',
          query: 'Test query',
          result: [{ feedback: '' }],
        },
      ]
    })

    it('should submit positive rating successfully', () => {
      const item = { query_id: 'query123', query: 'Test query' }

      component.sharePositiveContentRating(item, 0, 0)

      expect(mockChatbotService.saveAIChatPositiveContentRating).toHaveBeenCalled()
    })

    it('should show success message on successful rating', () => {
      const item = { query_id: 'query123', query: 'Test query' }

      component.sharePositiveContentRating(item, 0, 0)

      expect(mockMatSnackBarNew.open).toHaveBeenCalled()
    })

    it('should handle rating error', () => {
      mockChatbotService.saveAIChatPositiveContentRating.mockReturnValue(
        of({ status: 'error' })
      )
      const item = { query_id: 'query123', query: 'Test query' }

      component.sharePositiveContentRating(item, 0, 0)

      expect(mockMatSnackBarNew.open).toHaveBeenCalled()
    })
  })

  describe('openAIFeedbackPopup', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.aiTutorResultArr = [{ result: [{ feedback: '' }] }]
      jest.spyOn(component, 'shareAIFeedback').mockImplementation()
    })

    it('should open feedback dialog', () => {
      const item = { query_id: 'query123' }

      component.openAIFeedbackPopup(item, 0, 0)

      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should call shareAIFeedback on dialog close with result', () => {
      const item = { query_id: 'query123' }

      component.openAIFeedbackPopup(item, 0, 0)

      expect(component.shareAIFeedback).toHaveBeenCalledWith(item, 'Test feedback', 0, 0)
    })

    it('should show error if feedback already submitted', () => {
      component.aiTutorResultArr[0].result[0]['feedback'] = 'down'
      const item = { query_id: 'query123' }

      component.openAIFeedbackPopup(item, 0, 0)

      expect(mockMatSnackBarNew.open).toHaveBeenCalled()
    })
  })

  describe('redirectToResource', () => {
    beforeEach(() => {
      mockRouter.navigateByUrl.mockClear()
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should redirect to PDF resource', () => {
      const item = {
        mimeType: 'application/pdf',
        identifier: 'pdf123',
        pageNumber: 5,
        contentStart: -1,
        contentEnd: -1,
      }

      component.redirectToResource(item)

      expect(mockRouter.navigateByUrl).toHaveBeenCalled()
      const navigateUrlArg = mockRouter.navigateByUrl.mock.calls[0][0]
      expect(navigateUrlArg).toContain('/viewer/pdf/pdf123')
    })

    it('should redirect to video resource with timestamps', () => {
      const item = {
        mimeType: 'video/mp4',
        identifier: 'video123',
        contentStart: 10,
        contentEnd: 20,
      }

      component.redirectToResource(item)

      const navigateUrlArg = mockRouter.navigateByUrl.mock.calls[0][0]
      expect(navigateUrlArg).toContain('/viewer/video/video123')
    })

    it('should minimize on mobile', () => {
      component.isMobile = true
      const item = { mimeType: 'application/pdf', identifier: 'pdf123', pageNumber: 1 }

      component.redirectToResource(item)

      expect(component.maximize).toBe(false)
    })

    it('should redirect to video without timestamps when contentStart/End <= 0', () => {
      const item = {
        mimeType: 'video/mp4',
        identifier: 'video456',
        contentStart: 0,
        contentEnd: 0,
      }

      component.redirectToResource(item)

      const navigateUrlArg = mockRouter.navigateByUrl.mock.calls[0][0]
      expect(navigateUrlArg).toContain('/viewer/video/video456')
      expect(navigateUrlArg).not.toContain('st=')
      expect(navigateUrlArg).not.toContain('et=')
    })
  })

  describe('callFromInternet', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.cloneSearchQuery = 'Test query'
      component.aiTutorResult = { answer: '', retrievedChunks: [] }
    })

    it('should fetch results from internet', () => {
      const item = { answer: null }

      component.callFromInternet(item, 0)

      expect(mockChatbotService.aiGlobalSearchFromInternet).toHaveBeenCalled()
    })

    it('should update aiTutorResultArr with internet results', () => {
      const item = { answer: null }

      component.callFromInternet(item, 0)

      expect(component.resultFetch).toBe(true)
    })
  })

  describe('rejectFromInternet', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.aiTutorResultArr = [{ showFromInternet: true, newMessage: '' }]
    })

    it('should hide internet search option', () => {
      component.rejectFromInternet(0)

      expect(component.resultFetch).toBe(true)
      expect(component.aiTutorResultArr.length).toBe(0)
    })
  })

  describe('closeAITutorPopup', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.closeAIPopup = { emit: jest.fn() } as any
    })

    it('should emit closeAIPopup event', () => {
      component.closeAITutorPopup()

      expect(component.closeAIPopup.emit).toHaveBeenCalledWith(true)
    })
  })

  describe('minimizeAITutor', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should set maximize to false', () => {
      component.maximize = true
      component.minimizeAITutor()

      expect(component.maximize).toBe(false)
    })
  })

  describe('maximizeAITutor', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should set maximize to true', () => {
      component.maximize = false

      component.maximizeAITutor()

      expect(component.maximize).toBe(true)
    })
  })

  describe('ngOnDestroy', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component['messageSubscription'] = new Subject().subscribe()
    })

    it('should unsubscribe from messageSubscription', () => {
      const unsubscribeSpy = jest.spyOn(component['messageSubscription']!, 'unsubscribe')

      component.ngOnDestroy()

      expect(unsubscribeSpy).toHaveBeenCalled()
    })

    it('should dispatch telemetry event on destroy', () => {
      component.ngOnDestroy()

      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled()
    })
  })

  describe('scrollToBottom', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should scroll message container to bottom', () => {
      const mockContainer = {
        scrollHeight: 1000,
        scrollTo: jest.fn(),
      }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockContainer as any)

      component.scrollToBottom()

      expect(mockContainer.scrollTo).toHaveBeenCalledWith({
        top: 1000,
        behavior: 'smooth',
      })
    })

    it('should handle missing container element', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null)

      expect(() => component.scrollToBottom()).not.toThrow()
    })
  })

  describe('userInitials getter', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.initials = 'JD'
    })

    it('should return user initials', () => {
      expect(component.userInitials).toBe('JD')
    })
  })

  describe('copyPath', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      jest.useFakeTimers()
      Object.assign(document, { execCommand: jest.fn() })
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should copy PDF path to clipboard', () => {
      const item = { mimeType: 'application/pdf', identifier: 'pdf123', pageNumber: 5 }

      component.copyPath(item, 0)

      expect(component.copiedIndex).toBe(0)
    })

    it('should reset copiedIndex after timeout', () => {
      const item = { mimeType: 'application/pdf', identifier: 'pdf123', pageNumber: 5 }

      component.copyPath(item, 0)
      jest.advanceTimersByTime(1000)

      expect(component.copiedIndex).toBe(-1)
    })
  })

  describe('setDataToLocalStorage', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      Storage.prototype.getItem = jest.fn().mockReturnValue('{}')
      Storage.prototype.setItem = jest.fn()
      jest.spyOn(component, 'toggleFilter').mockImplementation()
    })

    it('should store data in localStorage', () => {
      const testData = { config: 'test' }
      component.selectedLaguage = 'en'
      component.currentFilter = 'information'

      component.setDataToLocalStorage(testData)

      expect(Storage.prototype.setItem).toHaveBeenCalled()
      expect(component.toggleFilter).toHaveBeenCalledWith('information')
    })

    it('should merge with existing localStorage data', () => {
      Storage.prototype.getItem = jest.fn().mockReturnValue('{"en":{"issue":{"old":"data"}}}')
      const testData = { config: 'test' }
      component.selectedLaguage = 'en'
      component.currentFilter = 'information'

      component.setDataToLocalStorage(testData)

      expect(Storage.prototype.setItem).toHaveBeenCalled()
    })
  })

  describe('initData', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.responseData = {
        quesMap: [],
        recommendationMap: [
          {
            categoryType: 'Logged-In',
            recommendedQues: [{ priority: 1, quesID: 'q1' }],
          },
        ],
      }
      jest.spyOn(component, 'getPriorityQuestion').mockReturnValue([])
      jest.spyOn(component, 'pushData').mockImplementation()
      jest.spyOn(component, 'getQns').mockImplementation()
    })

    it('should initialize user journey', () => {
      component.initData({})

      expect(component.userJourney).toEqual([])
      expect(component.getPriorityQuestion).toHaveBeenCalledWith(1)
      expect(component.pushData).toHaveBeenCalled()
      expect(component.getQns).toHaveBeenCalled()
    })
  })

  describe('getQns', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should populate questionsAndAns map', () => {
      component.responseData = {
        quesMap: [
          { quesId: 'q1', quesValue: 'Question 1' },
          { quesId: 'q2', quesValue: 'Question 2' },
        ],
      }

      component.getQns()

      expect(component.questionsAndAns['q1']).toBeDefined()
      expect(component.questionsAndAns['q2']).toBeDefined()
    })
  })

  describe('readFromLocalStorage', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should read information data from localStorage', () => {
      const mockData = { en: { information: { test: 'data' }, issue: { test: 'issue' } } }
      Storage.prototype.getItem = jest.fn().mockReturnValue(JSON.stringify(mockData))
      component.selectedLaguage = 'en'
      component.currentFilter = 'information'

      component.readFromLocalStorage()

      expect(component.responseData).toEqual({ test: 'data' })
    })

    it('should read issue data from localStorage', () => {
      const mockData = { en: { information: { test: 'data' }, issue: { test: 'issue' } } }
      Storage.prototype.getItem = jest.fn().mockReturnValue(JSON.stringify(mockData))
      component.selectedLaguage = 'en'
      component.currentFilter = 'issue'

      component.readFromLocalStorage()

      expect(component.responseData).toEqual({ test: 'issue' })
    })
  })

  describe('goToBottom', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      window.scrollTo = jest.fn()
    })

    it('should scroll window to bottom', () => {
      component.goToBottom()

      expect(window.scrollTo).toHaveBeenCalledWith(0, document.body.scrollHeight)
    })
  })

  describe('selectedQuestion', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.questionsAndAns = {
        q1: {
          quesValue: 'Test Question?',
          ansVal: 'Test Answer with <teams_call_link> and <email_configuration>',
        },
      }
      component.callText = 'Call Link'
      component.emailText = 'Email Link'
      jest.spyOn(component, 'pushData').mockImplementation()
      jest.spyOn(component, 'raiseTemeletyInterat').mockImplementation()
    })

    it('should process selected question and push messages', () => {
      const question = { quesID: 'q1', recommendedQues: [] }
      const data = { selectedValue: '' }

      component.selectedQuestion(question, data)

      expect(data.selectedValue).toBe('q1')
      expect(component.pushData).toHaveBeenCalledTimes(2)
      expect(component.raiseTemeletyInterat).toHaveBeenCalledWith('q1')
    })

    it('should replace placeholders in answer', () => {
      const question = { quesID: 'q1', recommendedQues: [] }
      const data = { selectedValue: '' }

      component.selectedQuestion(question, data)

      const pushDataCalls = (component.pushData as jest.Mock).mock.calls
      const incomingMsg = pushDataCalls[1][0]
      expect(incomingMsg.message).toContain('Call Link')
      expect(incomingMsg.message).toContain('Email Link')
    })
  })

  describe('getuserjourney', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should filter user journey by tab', () => {
      const mockJourney: any = [
        { tab: 'information', message: 'msg1' },
        { tab: 'issue', message: 'msg2' },
        { tab: 'information', message: 'msg3' },
      ]
      component['userJourney'] = mockJourney

      const result = component.getuserjourney('information')

      expect(result.length).toBe(2)
      expect((result[0] as any).tab).toBe('information')
    })

    it('should return empty array for non-existent tab', () => {
      const mockJourney: any = [{ tab: 'information', message: 'msg1' }]
      component['userJourney'] = mockJourney

      const result = component.getuserjourney('nonexistent')

      expect(result.length).toBe(0)
    })
  })

  describe('getPriorityQuestion', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.responseData = {
        recommendationMap: [
          {
            categoryType: 'Logged-In',
            recommendedQues: [
              { priority: 1, quesID: 'q1' },
              { priority: 2, quesID: 'q2' },
            ],
          },
          {
            categoryType: 'Both',
            recommendedQues: [{ priority: 1, quesID: 'q3' }],
          },
        ],
      }
    })

    it('should return priority questions for logged in user', () => {
      component.userInfo = mockConfigSvc.userProfile

      const result = component.getPriorityQuestion(1)

      expect(result.length).toBe(2)
      expect(result[0].quesID).toBe('q1')
    })

    it('should return only Both category for not logged in user', () => {
      component.userInfo = null

      const result = component.getPriorityQuestion(1)

      expect(result.length).toBe(1)
      expect(result[0].quesID).toBe('q3')
    })
  })

  describe('showMoreQuestion', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      jest.spyOn(component, 'getPriorityQuestion').mockReturnValue([])
      jest.spyOn(component, 'pushData').mockImplementation()
    })

    it('should push more questions', () => {
      component.showMoreQuestion()

      expect(component.getPriorityQuestion).toHaveBeenCalledWith(1)
      expect(component.pushData).toHaveBeenCalled()
    })
  })

  describe('showCategory', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.responseData = {
        recommendationMap: [{ catId: 'cat1', recommendedQues: [{ quesID: 'q1' }] }],
      }
      jest.spyOn(component, 'pushData').mockImplementation()
      jest.spyOn(component, 'sortCategory').mockReturnValue([])
      jest.spyOn(component, 'raiseCategotyTelemetry').mockImplementation()
    })

    it('should show all categories when catId is all', () => {
      const catItem = { catId: 'all', catName: 'All Categories' }

      component.showCategory(catItem)

      expect(component.sortCategory).toHaveBeenCalled()
      expect(component.more).toBe(false)
      expect(component.pushData).toHaveBeenCalledTimes(2)
    })

    it('should show specific category questions', () => {
      const catItem = { catId: 'cat1', catName: 'Category 1' }

      component.showCategory(catItem)

      expect(component.raiseCategotyTelemetry).toHaveBeenCalledWith('cat1')
      expect(component.pushData).toHaveBeenCalledTimes(2)
    })
  })

  describe('getCategories', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.selectedLaguage = 'en'
      component.responseData = {
        recommendationMap: [
          { catId: 'cat1', categoryType: 'Logged-In', priority: 1 },
          { catId: 'cat2', categoryType: 'Both', priority: 2 },
        ],
        categoryMap: [
          { catId: 'cat1', catName: 'Category 1' },
          { catId: 'cat2', catName: 'Category 2' },
        ],
      }
    })

    it('should populate categories for logged in user without all option when less than 6', () => {
      component.userInfo = mockConfigSvc.userProfile

      component.getCategories()

      expect(component.categories.length).toBeGreaterThan(0)
      // When less than 6 categories, no 'all' option is added
      expect(component.categories[0].catId).toBe('cat1')
    })

    it('should add all option when categories are 6 or more', () => {
      component.userInfo = mockConfigSvc.userProfile
      component.responseData = {
        recommendationMap: Array(10).fill(null).map((_, i) => ({
          catId: `cat${i}`,
          categoryType: 'Logged-In',
          priority: i
        })),
        categoryMap: Array(10).fill(null).map((_, i) => ({
          catId: `cat${i}`,
          catName: `Category ${i}`
        })),
      }

      component.getCategories()

      // When 6 or more categories, 'all' option is added at the beginning
      const hasAllCategory = component.categories.some((cat: any) => cat.catId === 'all')
      expect(hasAllCategory).toBe(true)
      expect(component.categories[0].catId).toBe('all')
    })
  })

  describe('sortCategory', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.categories = [
        { catId: 'cat3', priority: 3 },
        { catId: 'cat1', priority: 1 },
        { catId: 'cat2', priority: 2 },
      ]
    })

    it('should sort categories by priority', () => {
      const result = component.sortCategory()

      expect(result[0].priority).toBe(1)
      expect(result[1].priority).toBe(2)
      expect(result[2].priority).toBe(3)
    })
  })

  describe('getLanguages', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      Storage.prototype.setItem = jest.fn()
      jest.spyOn(component, 'getData').mockImplementation()
    })

    it('should fetch and store languages', () => {
      component.getLanguages()

      expect(mockChatbotService.getLangugages).toHaveBeenCalled()
      expect(component.displayLoader).toBe(false)
      expect(component.language.length).toBe(2)
      expect(component.getData).toHaveBeenCalled()
    })
  })

  describe('ngAfterViewInit', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      jest.spyOn(component, 'resizeTextarea').mockImplementation()
    })

    it('should call resizeTextarea', () => {
      component.textArea = { nativeElement: document.createElement('textarea') } as any

      component.ngAfterViewInit()

      expect(component.resizeTextarea).toHaveBeenCalled()
    })
  })

  describe('resizeTextarea', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should resize textarea and update containerHeight', () => {
      const textarea = document.createElement('textarea')
      Object.defineProperty(textarea, 'scrollHeight', { value: 100, configurable: true })
      const initialHeight = component.containerHeight

      component.resizeTextarea(textarea, '')

      expect(component.containerHeight).toBeGreaterThanOrEqual(initialHeight)
    })

    it('should handle null textarea', () => {
      expect(() => component.resizeTextarea(null as any, '')).not.toThrow()
    })
  })

  describe('resetTextAreaHeight', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should reset textarea height', () => {
      const textarea = document.createElement('textarea')
      textarea.style.height = '100px'
      component.textArea = { nativeElement: textarea } as any
      component.searchQueryAItutor = '  test  '

      component.resetTextAreaHeight(textarea)
      jest.advanceTimersByTime(0)

      expect(component.searchQueryAItutor).toBe('test')
    })
  })

  describe('aiTutorResultMessage', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.aiTutorResult = {
        answer: 'Test answer',
        query: 'Test query',
        query_id: 'query123',
        clientId: 'client123',
        retrievedChunks: [
          {
            Name: 'Test Content',
            MimeType: 'application/pdf',
            ContentType: 'Resource',
            ArtifactURL: 'https://test.com/artifact',
            Description: 'Test description',
            Identifier: 'content123',
            ContentStart: '10',
            ContentEnd: '20',
          },
        ],
      }
      jest.spyOn(component, 'scrollToBottom').mockImplementation()
      jest.spyOn(component, 'splitParagraphByWords').mockReturnValue('Short answer')
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should process AI tutor result and build result array', () => {
      component.aiTutorResultMessage()

      expect(component.aiTutorResultArr.length).toBeGreaterThan(0)
      expect(component.iGOTAITutorResultArr.length).toBeGreaterThan(0)
    })

    it('should handle empty retrievedChunks', () => {
      component.aiTutorResult.retrievedChunks = undefined
      component.aiTutorResult.answer = undefined

      component.aiTutorResultMessage()

      expect(component.aiTutorResult.retrievedChunks).toBeDefined()
    })

    it('should dispatch telemetry event', () => {
      component.content = 'content123'

      component.aiTutorResultMessage()

      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled()
    })
  })

  describe('redirectToToc', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.content = 'content123'
      window.open = jest.fn()
    })

    it('should open TOC in new window', () => {
      const chat = { identifier: 'test123', contentType: 'Course' }

      component.redirectToToc(chat)

      expect(window.open).toHaveBeenCalledWith(
        'https://portal.igotkarmayogi.gov.in/app/toc/test123/overview',
        '_blank'
      )
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled()
    })
  })

  describe('sharePositiveContentRatingForAnswer', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.content = 'content123'
      component.chatId = 'chat123'
      component.aiTutorResultArr = [
        { answer: 'Test answer', query_id: 'query123', query: 'Test query' },
      ]
    })

    it('should submit positive rating for answer', () => {
      const item = { answer: 'Test answer', query_id: 'query123', query: 'Test query' }

      component.sharePositiveContentRatingForAnswer(item, 0)

      expect(mockChatbotService.saveAIChatPositiveContentRating).toHaveBeenCalled()
    })

    it('should show success message', () => {
      const item = { answer: 'Test answer', query_id: 'query123', query: 'Test query' }

      component.sharePositiveContentRatingForAnswer(item, 0)

      expect(mockMatSnackBarNew.open).toHaveBeenCalled()
    })
  })

  describe('openAIFeedbackPopupForAnswer', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.aiTutorResultArr = [{ feedback: '' }]
      jest.spyOn(component, 'shareAIForAnswerFeedback').mockImplementation()
    })

    it('should open feedback dialog for answer', () => {
      const item = { query_id: 'query123' }

      component.openAIFeedbackPopupForAnswer(item, 0)

      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should call shareAIForAnswerFeedback on dialog close', () => {
      const item = { query_id: 'query123' }

      component.openAIFeedbackPopupForAnswer(item, 0)

      expect(component.shareAIForAnswerFeedback).toHaveBeenCalledWith(item, 'Test feedback', 0)
    })
  })

  describe('shareAIForAnswerFeedback', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.content = 'content123'
      component.chatId = 'chat123'
      component.aiTutorResultArr = [{ answer: 'Test answer', query_id: 'query123' }]
    })

    it('should submit negative feedback for answer', () => {
      const item = { query_id: 'query123', answer: 'Test answer', query: 'Test query' }

      component.shareAIForAnswerFeedback(item, 'Not helpful', 0)

      expect(mockChatbotService.shareAIFeedback).toHaveBeenCalled()
    })
  })

  describe('shareAIFeedback', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.content = 'content123'
      component.chatId = 'chat123'
      component.aiTutorResultArr = [{ answer: 'Test', result: [{ feedback: '' }] }]
    })

    it('should submit AI feedback successfully', () => {
      const item = { query_id: 'query123', query: 'Test query' }

      component.shareAIFeedback(item, 'feedback text', 0, 0)

      expect(mockChatbotService.shareAIFeedback).toHaveBeenCalled()
    })
  })

  describe('raiseTelemetryForResource', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.content = 'content123'
      component.selectedLearningStyle = { title: 'None' }
    })

    it('should raise telemetry for resource', () => {
      const item = { identifier: 'resource123', contentType: 'Resource' }

      component.raiseTelemetryForResource(item)

      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled()
    })
  })

  describe('raiseChatStartTelemetry', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should raise chat start telemetry event', () => {
      component.raiseChatStartTelemetry()

      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled()
      const callArg = mockEventSvc.dispatchChatbotEvent.mock.calls[0][0]
      expect(callArg.eventType).toBe(WsEvents.WsEventType.Telemetry)
      expect(callArg.data.state).toBe(WsEvents.EnumTelemetrySubType.Loaded)
    })
  })

  describe('raiseChatEndTelemetry', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should raise chat end telemetry event', () => {
      component.raiseChatEndTelemetry()

      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled()
      const callArg = mockEventSvc.dispatchChatbotEvent.mock.calls[0][0]
      expect(callArg.eventType).toBe(WsEvents.WsEventType.Telemetry)
      expect(callArg.data.state).toBe(WsEvents.EnumTelemetrySubType.Unloaded)
    })
  })

  describe('raiseTemeletyInterat', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.currentFilter = 'recommended'
    })

    it('should raise interact telemetry event', () => {
      component.raiseTemeletyInterat('test-id')

      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled()
      const callArg = mockEventSvc.dispatchChatbotEvent.mock.calls[0][0]
      expect(callArg.data.edata.id).toBe('test-id')
    })
  })

  describe('redirectToToc', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.content = 'content123'
      component.selectedLearningStyle = { title: 'None' }
      global.window = Object.create(window)
      Object.defineProperty(window, 'open', {
        value: jest.fn(),
        writable: true,
      })
    })

    it('should redirect to TOC page', () => {
      const chat = { identifier: 'course123' }

      component.redirectToToc(chat)

      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled()
      expect(window.open).toHaveBeenCalled()
      const windowOpenUrl = (window.open as jest.Mock).mock.calls[0][0]
      expect(windowOpenUrl).toContain('/app/toc/course123/overview')
    })
  })

  describe('checkForApiCalls', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should exist as a method', () => {
      expect(typeof component.checkForApiCalls).toBe('function')
    })
  })

  describe('splitParagraphByWords', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should split paragraph by words with default 30 words', () => {
      const paragraph = 'This is a test paragraph with many words. '.repeat(10)

      const result = component.splitParagraphByWords(paragraph)

      const words = result.trim().split(/\s+/)
      expect(words.length).toBeLessThanOrEqual(30)
    })

    it('should split paragraph by words with custom count', () => {
      const paragraph = 'This is a test paragraph with many words. '.repeat(10)

      const result = component.splitParagraphByWords(paragraph, 10)

      const words = result.trim().split(/\s+/)
      expect(words.length).toBeLessThanOrEqual(10)
    })
  })

  describe('callFromInternet with edge cases', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.aiTutorResult = { answer: '', retrievedChunks: [] }
      component.aiTutorResultArr = []
    })

    it('should handle internet call when both answer and retrievedChunks are missing', () => {
      component.aiTutorResult = {}
      const item = { newMessage: 'test' }

      component.callFromInternet(item, 0)

      expect(component.aiTutorResultArr.length).toBeGreaterThan(0)
    })
  })

  describe('showCategory with specific category', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.responseData = {
        recommendationMap: [
          { catId: 'cat1', recommendedQues: [{ quesID: 'q1', question: 'Question 1' }] },
        ],
      }
      jest.spyOn(component, 'pushData').mockImplementation()
      jest.spyOn(component, 'raiseCategotyTelemetry').mockImplementation()
    })

    it('should call raiseCategotyTelemetry for non-all categories', () => {
      const catItem = { catId: 'cat1', catName: 'Category 1' }

      component.showCategory(catItem)

      expect(component.raiseCategotyTelemetry).toHaveBeenCalledWith('cat1')
      expect(component.pushData).toHaveBeenCalledTimes(2)
    })
  })

  describe('scrollToBottom', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should scroll container to bottom when container exists', () => {
      const mockContainer = {
        scrollTo: jest.fn(),
        scrollHeight: 1000,
      }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockContainer as any)

      component.scrollToBottom()

      expect(document.getElementById).toHaveBeenCalledWith('container-none')
      expect(mockContainer.scrollTo).toHaveBeenCalledWith({
        top: 1000,
        behavior: 'smooth',
      })
    })

    it('should handle when container does not exist', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null)

      component.scrollToBottom()

      expect(document.getElementById).toHaveBeenCalledWith('container-none')
    })
  })

  describe('clickOutside', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      jest.spyOn(component, 'iconClick').mockImplementation()
    })

    it('should call iconClick with end parameter', () => {
      component.clickOutside()

      expect(component.iconClick).toHaveBeenCalledWith('end')
    })
  })

  describe('disableScroll and enableScroll', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
    })

    it('should call disableScroll via iconClick', () => {
      jest.spyOn(mockRenderer, 'addClass')

      component.iconClick('start')

      expect(mockRenderer.addClass).toHaveBeenCalled()
    })
  })

  describe('copyPath', () => {
    beforeEach(() => {
      component = new AiTutorComponent(
        mockActivatedRoute,
        mockConfigSvc,
        mockEventSvc,
        mockRenderer,
        mockChatbotService,
        mockWebsocketService,
        mockDialog,
        mockMatSnackBarNew,
        mockUtilitySvc,
        mockRouter
      )
      component.content = 'content123'
      component.selectedLearningStyle = { title: 'None' }
    })

    it('should copy path to clipboard', () => {
      const item = {
        identifier: 'resource123',
        mimeType: 'application/pdf',
        pageNumber: 5
      }
      const mockAppendChild = jest.spyOn(document.body, 'appendChild')
      const mockRemoveChild = jest.spyOn(document.body, 'removeChild')
      document.execCommand = jest.fn()

      component.copyPath(item, 0)

      expect(mockAppendChild).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalled()
      expect(component.copiedIndex).toBe(0)
    })

    it('should handle video path with timestamps', () => {
      const item = {
        identifier: 'video123',
        mimeType: 'video/mp4',
        contentStart: 10,
        contentEnd: 20
      }
      const mockAppendChild = jest.spyOn(document.body, 'appendChild')
      document.execCommand = jest.fn()

      component.copyPath(item, 1)

      expect(mockAppendChild).toHaveBeenCalled()
      expect(component.copiedIndex).toBe(1)
    })

    it('should handle video path without timestamps', () => {
      const item = {
        identifier: 'video456',
        mimeType: 'video/mp4',
        contentStart: 0,
        contentEnd: 0
      }
      const mockAppendChild = jest.spyOn(document.body, 'appendChild')
      document.execCommand = jest.fn()

      component.copyPath(item, 2)

      expect(mockAppendChild).toHaveBeenCalled()
      expect(component.copiedIndex).toBe(2)
    })
  })
})

