import { IGotSarthiComponent } from './igot-sarthi.component'
import { NavigationEnd } from '@angular/router'
import { of, throwError } from 'rxjs'

// Mock environment
jest.mock('../../../environments/environment', () => ({
  environment: { supportEmail: 'test@gov.in' }
}))

// Global mocks setup
// const mockCrypto = { getRandomValues: jest.fn(() => new Uint8Array([1, 2, 3, 4])) };
// Object.defineProperty(global, 'crypto', { value: mockCrypto });

const mockElement = {
  style: { position: 'fixed', left: '0', top: '0', opacity: '0' },
  focus: jest.fn(),
  select: jest.fn(),
  value: ''
}

const mockDocument = {
  createElement: jest.fn(() => mockElement),
  execCommand: jest.fn(),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    scrollHeight: 1000
  }
}
// Object.defineProperty(global, 'document', { value: mockDocument });

const mockWindow = {
  scrollTo: jest.fn(),
  open: jest.fn(),
  getComputedStyle: jest.fn(() => ({ paddingTop: '10px', paddingBottom: '10px' })),
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  requestAnimationFrame: jest.fn(cb => setTimeout(cb, 0))
}
// Object.defineProperty(global, 'window', { value: mockWindow });

describe('IGotSarthiComponent', () => {
  let component: IGotSarthiComponent
  let mockServices: any

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: mockWindow.localStorage, writable: true, configurable: true })
  })

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Setup service mocks
    mockServices = {
      configSvc: {
        userProfile: {
          firstName: 'John',
          profileImageUrl: '',
          professionalDetails: [{ designation: 'Developer' }],
          departmentName: 'IT Department'
        }
      },
      eventSvc: { dispatchChatbotEvent: jest.fn() },
      renderer: { addClass: jest.fn(), removeClass: jest.fn() },
      chatbotService: {
        getChatData: jest.fn(() => of({ payload: { config: { test: 'data' } } })),
        getLangugages: jest.fn(() => of({ status: { code: 200 }, payload: { languages: [{ value: 'en', label: 'English' }] } })),
        aiGlobalSearch: jest.fn(() => of({ answer: 'Test answer', RetrievedChunks: [], query_id: 'test-id', query: 'test query' })),
        aiGlobalSearchFromInternet: jest.fn(() => of({ answer: 'Internet answer', query_id: 'internet-id' })),
        saveAIChatPositiveContentRating: jest.fn(() => of({ status: 'success' })),
        shareAIFeedback: jest.fn(() => of({ status: 'success' })),
        iGOTAIChatHistory: []
      },
      dialog: {
        open: jest.fn(() => ({
          afterClosed: () => of('negative feedback'),
          close: jest.fn()
        }))
      },
      matSnackBarNew: { open: jest.fn() },
      router: { events: of(new NavigationEnd(1, '/test', '/test')) }
    }

    // Mock localStorage default responses
    mockWindow.localStorage.getItem.mockImplementation((key) => {
      const mockData: any = {
        'selectedLanguage': 'en',
        'faq': JSON.stringify({
          'en': {
            'information': {
              quesMap: [{ quesId: '1', quesValue: 'Question 1', ansVal: 'Answer 1' }],
              recommendationMap: [
                {
                  catId: 'cat1',
                  categoryType: 'Logged-In',
                  priority: 1,
                  recommendedQues: [{ priority: 1, quesID: '1' }]
                }
              ],
              categoryMap: [{ catId: 'cat1', catName: 'Category 1' }]
            },
            'issue': {
              quesMap: [{ quesId: '2', quesValue: 'Issue 1', ansVal: 'Issue Answer 1' }],
              recommendationMap: [],
              categoryMap: []
            }
          }
        }),
        'faq-languages': JSON.stringify([{ value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' }])
      }
      return mockData[key] || null
    })

    // Create component instance
    component = new IGotSarthiComponent(
      mockServices.configSvc,
      mockServices.eventSvc,
      mockServices.renderer,
      mockServices.chatbotService,
      mockServices.dialog,
      mockServices.matSnackBarNew,
      mockServices.router
    )

    // Setup ViewChild mocks
    component.textArea = {
      nativeElement: {
        style: { height: '30px' },
        scrollHeight: 50,
        value: ''
      }
    } as any

    component.myScrollContainer = {
      nativeElement: {
        scrollTop: 0,
        scrollHeight: 100
      }
    } as any
  })

  describe('Component Initialization', () => {
    it('should create component with default values', () => {
      expect(component).toBeDefined()
      expect(component.showIcon).toBe(true)
      expect(component.currentFilter).toBe('information')
      expect(component.selectedLaguage).toBe('en')
      expect(component.more).toBe(false)
      expect(component.displayLoader).toBe(false)
      expect(component.expanded).toBe(false)
      expect(component.copiedIndex).toBe(-1)
    })

    it('should handle ngOnInit with profile image URL', () => {
      mockServices.configSvc.userProfile.profileImageUrl = 'http://example.com/image.jpg'
      component.ngOnInit()
      expect(component.userIcon).toBe('http://example.com/image.jpg')
    })

    // it('should handle ngOnInit without profile image URL', () => {
    //   jest.spyOn(component, 'createInititals');
    //   component.ngOnInit();
    //   expect(component.createInititals).toHaveBeenCalledWith('John');
    // });

    it('should handle router navigation to /certs', () => {
      mockServices.router.events = of(new NavigationEnd(1, '/certs', '/certs'))
      component.ngOnInit()
      expect(component.isHubEnable).toBe(false)
    })

    it('should handle router navigation to /public/certs', () => {
      mockServices.router.events = of(new NavigationEnd(1, '/public/certs', '/public/certs'))
      component.ngOnInit()
      expect(component.isHubEnable).toBe(false)
    })

    it('should handle router navigation to other URLs', () => {
      mockServices.router.events = of(new NavigationEnd(1, '/dashboard', '/dashboard'))
      component.ngOnInit()
      expect(component.isHubEnable).toBe(true)
    })

    it('should filter existing chat history on init', () => {
      mockServices.chatbotService.iGOTAIChatHistory = [
        { newMessage: 'valid message' },
        { newMessage: '' },
        { newMessage: 'another valid message' },
        { newMessage: '' }
      ]
      component.ngOnInit()
      expect(component.aiSearchResultArr).toHaveLength(2)
      expect(component.aiSearchResultArr[0].newMessage).toBe('valid message')
      expect(component.aiSearchResultArr[1].newMessage).toBe('another valid message')
    })

    it('should handle ngAfterViewInit', () => {
      jest.spyOn(component, 'resizeTextarea')
      component.ngAfterViewInit()
      expect(component.resizeTextarea).toHaveBeenCalledWith(component.textArea.nativeElement, '')
    })
  })

  describe('Localization Methods', () => {
    it('should return correct greetings for English', () => {
      component.selectedLaguage = 'en'
      expect(component.greetings()).toBe('Namaste')
    })

    it('should return correct greetings for Hindi', () => {
      component.selectedLaguage = 'hi'
      expect(component.greetings()).toBe('नमस्ते')
    })

    it('should return default greeting for unknown language', () => {
      component.selectedLaguage = 'fr'
      expect(() => component.greetings()).toThrow()
    })

    it('should return correct info text for English', () => {
      component.selectedLaguage = 'en'
      expect(component.getInfoText('information')).toBe('Information')
      expect(component.getInfoText('issue')).toBe('Issues')
    })

    it('should return correct info text for Hindi', () => {
      component.selectedLaguage = 'hi'
      expect(component.getInfoText('information')).toBe('जानकारी')
      expect(component.getInfoText('issue')).toBe('समस्या')
    })

    it('should return default text for unknown label', () => {
      component.selectedLaguage = 'en'
      expect(component.getInfoText('unknown')).toBe('unknown')
    })

    it('should return correct show more text', () => {
      component.selectedLaguage = 'en'
      expect(component.showMore()).toBe('Show More')

      component.selectedLaguage = 'hi'
      expect(component.showMore()).toBe('और दिखाओ')
    })
  })

  describe('Data Management', () => {
    it('should get data for information tab', () => {
      jest.spyOn(component, 'setDataToLocalStorage')
      component.currentFilter = 'information'
      component.selectedLaguage = 'en'
      component.getData()

      expect(mockServices.chatbotService.getChatData).toHaveBeenCalledWith({
        lang: 'en',
        config_type: 'IN'
      })
      expect(component.setDataToLocalStorage).toHaveBeenCalled()
      expect(component.displayLoader).toBe(false)
    })

    it('should get data for issue tab', () => {
      jest.spyOn(component, 'setDataToLocalStorage')
      component.currentFilter = 'issue'
      component.selectedLaguage = 'hi'
      component.getData()

      expect(mockServices.chatbotService.getChatData).toHaveBeenCalledWith({
        lang: 'hi',
        config_type: 'IS'
      })
    })

    it('should set data to localStorage and toggle filter', () => {
      jest.spyOn(component, 'toggleFilter')
      const testData = { test: 'configuration data' }
      component.currentFilter = 'information'
      component.selectedLaguage = 'en'

      component.setDataToLocalStorage(testData)

      expect(mockWindow.localStorage.setItem).toHaveBeenCalled()
      expect(component.toggleFilter).toHaveBeenCalledWith('information')
    })

    it('should set data to localStorage for issue filter', () => {
      jest.spyOn(component, 'toggleFilter')
      const testData = { test: 'issue data' }
      component.currentFilter = 'issue'
      component.selectedLaguage = 'hi'

      component.setDataToLocalStorage(testData)

      expect(component.toggleFilter).toHaveBeenCalledWith('issue')
    })

    it('should initialize data with user details', () => {
      const mockData = { test: 'init data' }
      jest.spyOn(component, 'pushData').mockImplementation(jest.fn())
      jest.spyOn(component, 'getPriorityQuestion').mockReturnValue([{ quesID: '1' }])
      jest.spyOn(component, 'getQns').mockImplementation(jest.fn())

      component.initData(mockData)

      expect(component.userJourney).toEqual([])
      expect(component.pushData).toHaveBeenCalled()
      expect(component.getQns).toHaveBeenCalled()
    })

    it('should map questions and answers correctly', () => {
      component.responseData = {
        quesMap: [
          { quesId: '1', quesValue: 'Question 1', ansVal: 'Answer 1' },
          { quesId: '2', quesValue: 'Question 2', ansVal: 'Answer 2' }
        ]
      }

      component.getQns()

      expect(component.questionsAndAns['1']).toEqual({ quesId: '1', quesValue: 'Question 1', ansVal: 'Answer 1' })
      expect(component.questionsAndAns['2']).toEqual({ quesId: '2', quesValue: 'Question 2', ansVal: 'Answer 2' })
    })

    it('should select language and reset chat arrays', () => {
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(jest.fn())
      const event = { target: { value: 'hi' } }
      component.chatInformation = [{ test: 'info' }]
      component.chatIssues = [{ test: 'issue' }]

      component.selectLaguage(event)

      expect(component.selectedLaguage).toBe('hi')
      expect(mockWindow.localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'hi')
      expect(component.chatInformation).toEqual([])
      expect(component.chatIssues).toEqual([])
      expect(component.checkForApiCalls).toHaveBeenCalled()
    })

    it('should read information from localStorage', () => {
      const mockLocalData = {
        en: {
          information: { type: 'info_data' },
          issue: { type: 'issue_data' }
        }
      }
      mockWindow.localStorage.getItem.mockReturnValue(JSON.stringify(mockLocalData))

      component.currentFilter = 'information'
      component.selectedLaguage = 'en'
      component.readFromLocalStorage()

      expect(component.responseData).toEqual({ type: 'info_data' })
    })

    it('should read issue from localStorage', () => {
      const mockLocalData = {
        en: {
          information: { type: 'info_data' },
          issue: { type: 'issue_data' }
        }
      }
      mockWindow.localStorage.getItem.mockReturnValue(JSON.stringify(mockLocalData))

      component.currentFilter = 'issue'
      component.selectedLaguage = 'en'
      component.readFromLocalStorage()

      expect(component.responseData).toEqual({ type: 'issue_data' })
    })

    it('should handle null localStorage data', () => {
      mockWindow.localStorage.getItem.mockReturnValue(null)
      component.readFromLocalStorage()
      expect(component.responseData).toBeUndefined()
    })
  })

  describe('UI Interactions', () => {
    it('should scroll to bottom of document', () => {
      component.goToBottom()
      expect(mockWindow.scrollTo).toHaveBeenCalledWith(0, 1000)
    })

    it('should handle start icon click', () => {
      //  jest.spyOn(component, 'disableScroll');
      jest.spyOn(component, 'raiseChatStartTelemetry')

      component.showIcon = true
      component.iconClick('start')

      expect(component.showIcon).toBe(false)
      expect(component.currentFilter).toBe('information')
      expect(component.expanded).toBe(false)
      //  expect(component.disableScroll).toHaveBeenCalled();
      expect(component.raiseChatStartTelemetry).toHaveBeenCalled()
    })

    it('should handle end icon click', () => {
      jest.spyOn(component, 'raiseChatEndTelemetry')
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(jest.fn())

      component.showIcon = false
      component.chatInformation = [{ test: 'info' }]
      component.chatIssues = [{ test: 'issue' }]
      component.more = true

      component.iconClick('end')

      expect(component.showIcon).toBe(true)
      expect(component.raiseChatEndTelemetry).toHaveBeenCalled()
      expect(component.userJourney).toEqual([])
      expect(component.chatInformation).toEqual([])
      expect(component.chatIssues).toEqual([])
      expect(component.selectedLaguage).toBe('en')
      expect(component.currentFilter).toBe('information')
      expect(component.more).toBe(false)
      // expect(component.enableScroll).toHaveBeenCalled();
    })

    it('should toggle filter to issue', () => {
      jest.spyOn(component, 'checkForApiCalls')
      component.more = true

      component.toggleFilter('issue')

      expect(component.currentFilter).toBe('issue')
      expect(component.more).toBe(false)
      expect(component.checkForApiCalls).toHaveBeenCalled()
    })

    it('should handle selected question with recommendations', () => {
      component.questionsAndAns = {
        '1': {
          quesValue: 'Test Question',
          ansVal: 'Test Answer with <teams_call_link> and <email_configuration>'
        }
      }
      component.currentFilter = 'information'
      component.callText = 'Call Link'
      component.emailText = 'Email Link'

      jest.spyOn(component, 'pushData')
      jest.spyOn(component, 'raiseTemeletyInterat')

      const question = { quesID: '1', recommendedQues: [{ quesID: '2' }] }
      const data = { selectedValue: '' }

      component.selectedQuestion(question, data)

      expect(data.selectedValue).toBe('1')
      expect(component.pushData).toHaveBeenCalledTimes(2)
      expect(component.raiseTemeletyInterat).toHaveBeenCalledWith('1')
    })

    it('should push data to information chat', () => {
      component.currentFilter = 'information'
      component.chatInformation = []
      const msg = { type: 'test', message: 'test message' }

      component.pushData(msg)

      expect(component.chatInformation).toContain(msg)
      expect(component.userJourney).toContain(msg)
    })

    it('should push data to issues chat', () => {
      component.currentFilter = 'issue'
      component.chatIssues = []
      const msg = { type: 'test', message: 'test message' }

      component.pushData(msg)

      expect(component.chatIssues).toContain(msg)
      expect(component.userJourney).toContain(msg)
    })

    it('should filter user journey by tab', () => {
      (component as any).userJourney = [
        { tab: 'information', message: 'info message 1' },
        { tab: 'information', message: 'info message 2' },
        { tab: 'issue', message: 'issue message 1' }
      ]

      const infoJourney = component.getuserjourney('information')
      const issueJourney = component.getuserjourney('issue')

      expect(infoJourney).toHaveLength(2)
      expect(issueJourney).toHaveLength(1)
      expect(infoJourney.every((item: any) => item.tab === 'information')).toBe(true)
    })

    // it('should scroll container to bottom', () => {
    //   component.scrollToBottom();
    //   expect(component.myScrollContainer.nativeElement.scrollTop).toBe(100);
    // });

    // it('should handle scroll error gracefully', () => {
    //   component.myScrollContainer = null;
    //   expect(() => component.scrollToBottom()).not.toThrow();
    // });

    it('should handle clickOutside', () => {
      jest.spyOn(component, 'iconClick')
      component.clickOutside()
      expect(component.iconClick).toHaveBeenCalledWith('end')
    })

    it('should disable scroll', () => {
      (component as any).disableScroll()
      expect(mockServices.renderer.addClass).toHaveBeenCalledWith(document.body, 'disable-scroll')
    })

    it('should enable scroll', () => {
      (component as any).enableScroll()
      expect(mockServices.renderer.removeClass).toHaveBeenCalledWith(document.body, 'disable-scroll')
    })
  })

  describe('Priority Questions and Categories', () => {
    beforeEach(() => {
      component.responseData = {
        recommendationMap: [
          {
            catId: 'cat1',
            categoryType: 'Logged-In',
            priority: 1,
            recommendedQues: [
              { priority: 1, quesID: '1' },
              { priority: 2, quesID: '2' }
            ]
          },
          {
            catId: 'cat2',
            categoryType: 'Not Logged-In',
            priority: 2,
            recommendedQues: [
              { priority: 1, quesID: '3' }
            ]
          },
          {
            catId: 'cat3',
            categoryType: 'Both',
            priority: 3,
            recommendedQues: [
              { priority: 1, quesID: '4' },
              { priority: 1, quesID: '5' }
            ]
          }
        ]
      }
    })

    it('should get priority questions for logged-in user', () => {
      component.userInfo = { firstName: 'John' }
      const result = component.getPriorityQuestion(1)
      expect(result).toHaveLength(3) // Logged-In (1) + Both (2)
    })

    it('should get priority questions for not logged-in user', () => {
      component.userInfo = null
      const result = component.getPriorityQuestion(1)
      expect(result).toHaveLength(3) // Not Logged-In (1) + Both (2)
    })

    it('should get priority questions with different priority levels', () => {
      component.userInfo = { firstName: 'John' }
      const priority2Result = component.getPriorityQuestion(2)
      expect(priority2Result).toHaveLength(1) // Only priority 2 from Logged-In
    })

    it('should show more questions', () => {
      jest.spyOn(component, 'getPriorityQuestion').mockReturnValue([{ quesID: '1' }])
      jest.spyOn(component, 'pushData')

      component.showMoreQuestion()

      expect(component.pushData).toHaveBeenCalledWith({
        type: 'incoming',
        message: '',
        recommendedQues: [{ quesID: '1' }],
        selectedValue: '',
        title: ''
      })
    })

    it('should show all categories', () => {
      jest.spyOn(component, 'pushData')
      jest.spyOn(component, 'sortCategory').mockReturnValue([{ catId: 'all' }])

      const catItem = { catId: 'all', catName: 'All Categories' }
      component.showCategory(catItem)

      expect(component.more).toBe(false)
      expect(component.pushData).toHaveBeenCalledTimes(2)
    })

    it('should show specific category', () => {
      jest.spyOn(component, 'pushData')
      jest.spyOn(component, 'raiseCategotyTelemetry')

      const catItem = { catId: 'cat1', catName: 'Category 1' }
      component.showCategory(catItem)

      expect(component.raiseCategotyTelemetry).toHaveBeenCalledWith('cat1')
      expect(component.pushData).toHaveBeenCalledTimes(2)
    })

    it('should get categories for logged-in user', () => {
      component.responseData.categoryMap = [
        { catId: 'cat1', catName: 'Category 1' },
        { catId: 'cat2', catName: 'Category 2' },
        { catId: 'cat3', catName: 'Category 3' }
      ]
      component.userInfo = { firstName: 'John' }
      component.selectedLaguage = 'en'

      component.getCategories()

      expect(component.categories).toHaveLength(2) // Logged-In + Both = cat1 + cat3
    })

    it('should get categories for not logged-in user', () => {
      component.responseData.categoryMap = [
        { catId: 'cat1', catName: 'Category 1' },
        { catId: 'cat2', catName: 'Category 2' },
        { catId: 'cat3', catName: 'Category 3' }
      ]
      component.userInfo = null
      component.selectedLaguage = 'en'

      component.getCategories()

      expect(component.categories).toHaveLength(2) // Not Logged-In + Both = cat2 + cat3
    })

    it('should handle more than 6 categories', () => {
      // Create 10 categories
      const manyRecommendations = Array.from({ length: 10 }, (_, i) => ({
        catId: `cat${i}`,
        categoryType: 'Both',
        priority: i
      }))
      const manyCategoryMap = Array.from({ length: 10 }, (_, i) => ({
        catId: `cat${i}`,
        catName: `Category ${i}`
      }))

      component.responseData.recommendationMap = manyRecommendations
      component.responseData.categoryMap = manyCategoryMap
      component.userInfo = { firstName: 'John' }

      component.getCategories()

      expect(component.categories.length).toBeGreaterThan(6)
    })

    it('should sort categories by priority', () => {
      component.categories = [
        { priority: 3, catName: 'Third' },
        { priority: 1, catName: 'First' },
        { priority: 2, catName: 'Second' }
      ]

      const sorted = component.sortCategory()

      expect(sorted[0].priority).toBe(1)
      expect(sorted[1].priority).toBe(2)
      expect(sorted[2].priority).toBe(3)
    })

    it('should handle equal priority sorting', () => {
      component.categories = [
        { priority: 1, catName: 'A' },
        { priority: 1, catName: 'B' },
        { priority: 2, catName: 'C' }
      ]

      const sorted = component.sortCategory()

      expect(sorted[0].priority).toBe(1)
      expect(sorted[1].priority).toBe(1)
      expect(sorted[2].priority).toBe(2)
    })
  })

  describe('API Calls and Language Management', () => {
    it('should get languages successfully', () => {
      jest.spyOn(component, 'getData')

      component.getLanguages()

      expect(component.displayLoader).toBe(false)
      expect(mockWindow.localStorage.setItem).toHaveBeenCalledWith('faq-languages', JSON.stringify([{ value: 'en', label: 'English' }]))
      expect(mockWindow.localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'en')
      expect(component.getData).toHaveBeenCalled()
    })

    it('should handle get languages API failure', () => {
      mockServices.chatbotService.getLangugages.mockReturnValue(of({ status: { code: 400 } }))

      component.getLanguages()

      expect(component.displayLoader).toBe(true)
    })

    it('should handle get languages error response', () => {
      mockServices.chatbotService.getLangugages.mockReturnValue(of({}))

      component.getLanguages()

      expect(component.displayLoader).toBe(true)
    })

    it('should check for API calls with existing localStorage data for information', () => {
      jest.spyOn(component, 'initData')
      jest.spyOn(component, 'getQns')
      jest.spyOn(component, 'getCategories')

      component.currentFilter = 'information'
      component.chatInformation = []
      component.checkForApiCalls()

      expect(component.selectedLaguage).toBe('en')
      expect(component.initData).toHaveBeenCalled()
      expect(component.getQns).toHaveBeenCalled()
      expect(component.getCategories).toHaveBeenCalled()
    })

    it('should check for API calls with existing chat information', () => {
      jest.spyOn(component, 'getQns')
      jest.spyOn(component, 'getCategories')

      component.currentFilter = 'information'
      component.chatInformation = [{ test: 'existing chat' }]
      component.checkForApiCalls()

      expect(component.userJourney).toEqual([{ test: 'existing chat' }])
      expect(component.getQns).toHaveBeenCalled()
      expect(component.getCategories).toHaveBeenCalled()
    })

    it('should check for API calls with existing issue data', () => {
      jest.spyOn(component, 'initData')

      component.currentFilter = 'issue'
      component.chatIssues = []
      component.checkForApiCalls()

      expect(component.initData).toHaveBeenCalled()
    })

    it('should check for API calls with existing issue chat', () => {
      component.currentFilter = 'issue'
      component.chatIssues = [{ test: 'existing issue' }]
      component.checkForApiCalls()

      expect(component.userJourney).toEqual([{ test: 'existing issue' }])
    })

    it('should handle missing localStorage data', () => {
      mockWindow.localStorage.getItem.mockImplementation(() => null)
      jest.spyOn(component, 'getLanguages')

      component.checkForApiCalls()

      expect(component.getLanguages).toHaveBeenCalled()
    })

    it('should handle missing language data in localStorage', () => {
      mockWindow.localStorage.getItem.mockImplementation((key) => {
        if (key === 'faq-languages') return null
        if (key === 'faq') return '{}'
        return 'en'
      })
      jest.spyOn(component, 'getLanguages')

      component.checkForApiCalls()

      expect(component.getLanguages).toHaveBeenCalled()
    })

    it('should handle missing filter data in localStorage', () => {
      mockWindow.localStorage.getItem.mockImplementation((key) => {
        if (key === 'faq') return JSON.stringify({ en: {} })
        if (key === 'faq-languages') return JSON.stringify([])
        return 'en'
      })
      jest.spyOn(component, 'getLanguages')

      component.checkForApiCalls()

      expect(component.getLanguages).toHaveBeenCalled()
    })
  })

  describe('Search Functionality', () => {
    beforeEach(() => {
      component.aiSearchResultArr = []
      component.searchAPIResponseInProgress = false
      component.scrollToBottomEvent = { emit: jest.fn() } as any
    })

    it('should prevent empty search submission', () => {
      const event = { preventDefault: jest.fn() }
      const textArea = { value: '' } as HTMLTextAreaElement
      component.searchQuery = ''

      component.submitSearchQuery(textArea, event)

      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should prevent whitespace-only search submission', () => {
      const event = { preventDefault: jest.fn() }
      const textArea = { value: '   ' } as HTMLTextAreaElement
      component.searchQuery = '   '

      component.submitSearchQuery(textArea, event)

      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should submit valid search query', () => {
      jest.spyOn(component, 'aiGlobalSearch')
      jest.spyOn(component, 'resetTextAreaHeight')

      const event = { preventDefault: jest.fn() }
      const textArea = { value: 'test query' } as HTMLTextAreaElement
      component.searchQuery = 'test query'

      component.submitSearchQuery(textArea, event)

      expect(component.aiSearchResultArr).toHaveLength(2)
      expect(component.searchQuery).toBe('')
      expect(component.aiGlobalSearch).toHaveBeenCalled()
      expect(component.resetTextAreaHeight).toHaveBeenCalledWith(textArea)
    })

    it('should not submit when API is in progress', () => {
      jest.spyOn(component, 'aiGlobalSearch')

      const event = { preventDefault: jest.fn() }
      const textArea = { value: 'test query' } as HTMLTextAreaElement
      component.searchQuery = 'test query'
      component.searchAPIResponseInProgress = true

      component.submitSearchQuery(textArea, event)

      expect(component.aiGlobalSearch).not.toHaveBeenCalled()
    })

    it('should filter empty messages before search', () => {
      jest.spyOn(component, 'aiGlobalSearch')

      const event = { preventDefault: jest.fn() }
      const textArea = { value: 'test' } as HTMLTextAreaElement
      component.searchQuery = 'test'
      component.aiSearchResultArr = [
        { newMessage: 'valid' },
        { newMessage: '' },
        { newMessage: 'also valid' }
      ]

      component.submitSearchQuery(textArea, event)

      expect(component.aiSearchResultArr).toHaveLength(4) // 2 valid + 2 new
    })

    it('should emit scroll event for multiple items', (done) => {
      jest.spyOn(component, 'aiGlobalSearch')

      const event = { preventDefault: jest.fn() }
      const textArea = { value: 'test' } as HTMLTextAreaElement
      component.searchQuery = 'test'
      component.aiSearchResultArr = [{ test: 1 }, { test: 2 }, { test: 3 }]

      component.submitSearchQuery(textArea, event)

      setTimeout(() => {
        expect(component.scrollToBottomEvent.emit).toHaveBeenCalled()
        done()
      }, 1)
    })
  })

  describe('AI Global Search', () => {
    beforeEach(() => {
      component.cloneSearchQuery = 'test query'
      component.chatId = 'chat-123'
      component.userId = 'user-123'
      component.aiSearchResultArr = []
      component.iGOTAISearchResultArr = []
    })

    it('should perform successful AI search with answer and chunks', () => {
      const mockResponse = {
        answer: 'This is a test answer with more than thirty words to test the word count functionality and ensure that the showLess feature works correctly in the UI',
        RetrievedChunks: [
          {
            Identifier: 'test-id-1',
            Name: 'Test Resource 1',
            Description: '    Test description with leading spaces    ',
            ContentType: 'Resource',
            mimeType: 'video/mp4',
            contentStart: '10',
            ContentEnd: '20'
          }
        ],
        query_id: 'test-query-id',
        query: 'test query'
      }

      mockServices.chatbotService.aiGlobalSearch.mockReturnValue(of(mockResponse))

      component.aiGlobalSearch()

      expect(component.searchAPIResponseInProgress).toBe(false)
      expect(component.resultFetch).toBe(true)
      expect(component.aiSearchResult).toEqual(mockResponse)
      expect(component.iGOTAISearchResultArr).toHaveLength(1)
      expect(component.aiSearchResultArr).toHaveLength(1)
      expect(component.aiSearchResultArr[0].wordsCount).toBeGreaterThan(30)
      expect(component.aiSearchResultArr[0].showLess).toBe(true)
    })

    it('should handle AI search with short answer', () => {
      const mockResponse = {
        answer: 'Short answer',
        RetrievedChunks: [],
        query_id: 'test-query-id',
        query: 'test query'
      }

      mockServices.chatbotService.aiGlobalSearch.mockReturnValue(of(mockResponse))

      component.aiGlobalSearch()

      expect(component.aiSearchResultArr[0].showLess).toBe(false)
      expect(component.aiSearchResultArr[0].wordsCount).toBeLessThan(30)
    })

    it('should handle AI search with no answer but with chunks', () => {
      const mockResponse = {
        answer: '',
        RetrievedChunks: [{ test: 'chunk' }],
        query_id: 'test-query-id',
        query: 'test query'
      }

      mockServices.chatbotService.aiGlobalSearch.mockReturnValue(of(mockResponse))

      component.aiGlobalSearch()

      expect(component.aiSearchResultArr[0].showSimiliarResultsFlag).toBe(true)
      expect(component.aiSearchResultArr[0].showFromInternet).toBe(true)
      expect(component.aiSearchResultArr[0].showReterivedChunks).toBe(false)
    })

    it('should handle AI search with no answer and no chunks', () => {
      const mockResponse = {
        answer: '',
        RetrievedChunks: [],
        query_id: 'test-query-id',
        query: 'test query'
      }

      mockServices.chatbotService.aiGlobalSearch.mockReturnValue(of(mockResponse))

      component.aiGlobalSearch()

      expect(component.aiSearchResultArr[0].showFromInternet).toBe(true)
    })

    it('should handle PDF resource type correctly', () => {
      const mockResponse = {
        answer: 'Test answer',
        RetrievedChunks: [
          {
            Identifier: 'pdf-id',
            Name: 'Test PDF',
            Description: 'PDF description',
            ContentType: 'Resource',
            mimeType: 'application/pdf',
            contentStart: '5',
            ContentEnd: '10'
          }
        ],
        query_id: 'test-query-id',
        query: 'test query'
      }

      mockServices.chatbotService.aiGlobalSearch.mockReturnValue(of(mockResponse))

      component.aiGlobalSearch()

      const resultObj = component.iGOTAISearchResultArr[0]
      expect(resultObj.resourceLink).toContain('player/pdf')
      expect(resultObj.resourceLink).toContain('pn=5')
    })

    it('should handle video with time range', () => {
      const mockResponse = {
        answer: 'Test answer',
        RetrievedChunks: [
          {
            Identifier: 'video-id',
            Name: 'Test Video',
            Description: 'Video description',
            ContentType: 'Resource',
            mimeType: 'video/mp4',
            contentStart: '30',
            ContentEnd: '60'
          }
        ],
        query_id: 'test-query-id',
        query: 'test query'
      }

      mockServices.chatbotService.aiGlobalSearch.mockReturnValue(of(mockResponse))

      component.aiGlobalSearch()

      const resultObj = component.iGOTAISearchResultArr[0]
      expect(resultObj.resourceLink).toContain('st=30&et=60')
    })

    it('should handle video without time range', () => {
      const mockResponse = {
        answer: 'Test answer',
        RetrievedChunks: [
          {
            Identifier: 'video-id',
            Name: 'Test Video',
            Description: 'Video description',
            ContentType: 'Resource',
            mimeType: 'video/mp4',
            contentStart: '0',
            ContentEnd: '0'
          }
        ],
        query_id: 'test-query-id',
        query: 'test query'
      }

      mockServices.chatbotService.aiGlobalSearch.mockReturnValue(of(mockResponse))

      component.aiGlobalSearch()

      const resultObj = component.iGOTAISearchResultArr[0]
      expect(resultObj.resourceLink).not.toContain('st=')
      expect(resultObj.resourceLink).not.toContain('et=')
    })

    it('should handle contentStart with spaces', () => {
      const mockResponse = {
        answer: 'Test answer',
        RetrievedChunks: [
          {
            Identifier: 'test-id',
            Name: 'Test Resource',
            Description: 'Test description',
            ContentType: 'Resource',
            mimeType: 'video/mp4',
            contentStart: ' ',
            ContentEnd: ' '
          }
        ],
        query_id: 'test-query-id',
        query: 'test query'
      }

      mockServices.chatbotService.aiGlobalSearch.mockReturnValue(of(mockResponse))

      component.aiGlobalSearch()

      const resultObj = component.iGOTAISearchResultArr[0]
      expect(resultObj.pageNumber).toBe(1)
      expect(resultObj.contentStart).toBe(-1)
      expect(resultObj.contentEnd).toBe(-1)
    })

    it('should handle AI search API error', () => {
      mockServices.chatbotService.aiGlobalSearch.mockReturnValue(throwError('API Error'))

      component.aiGlobalSearch()

      expect(component.searchAPIResponseInProgress).toBe(false)
      expect(component.hasError).toBe(true)
      expect(component.isLoading).toBe(false)
    })

    it('should filter empty messages after search', () => {
      const mockResponse = {
        answer: 'Test answer',
        RetrievedChunks: [],
        query_id: 'test-query-id',
        query: 'test query'
      }

      mockServices.chatbotService.aiGlobalSearch.mockReturnValue(of(mockResponse))
      component.aiSearchResultArr = [
        { newMessage: 'valid' },
        { newMessage: '' },
        { newMessage: 'also valid' }
      ]

      component.aiGlobalSearch()

      // Should filter out empty messages and add new result
      expect(component.aiSearchResultArr).toHaveLength(3) // 2 valid + 1 new
    })

    it('should raise telemetry event', () => {
      const mockResponse = {
        answer: 'Test answer',
        RetrievedChunks: [],
        query_id: 'test-query-id',
        query: 'test query'
      }

      mockServices.chatbotService.aiGlobalSearch.mockReturnValue(of(mockResponse))

      component.aiGlobalSearch()

      expect(mockServices.eventSvc.dispatchChatbotEvent).toHaveBeenCalledWith({
        eventType: 'TELEMETRY',
        eventLogLevel: 'Info',
        data: {
          edata: { type: 'click', id: 'ai-global-search', pageid: '/page/home', subType: 'ai-global-search' },
          object: {},
          state: 'INTERACT',
          eventSubType: 'CHATBOT',
          mode: 'view'
        },
        pageContext: { pageId: '/page/home', module: 'Home' },
        from: '',
        to: 'Telemetry'
      })
    })
  })

  describe('Internet Search and Rejection', () => {
    beforeEach(() => {
      component.aiSearchResultArr = [
        {
          showFromInternet: true,
          showSimiliarResultsFlag: true,
          result: []
        }
      ]
      component.cloneSearchQuery = 'test query'
      component.userInfo = {
        professionalDetails: [{ designation: 'Developer' }],
        departmentName: 'IT Department'
      }
      component.chatId = 'chat-123'
      component.userId = 'user-123'
      component.scrollToBottomEvent = { emit: jest.fn() } as any
    })

    it('should call from internet with user details', () => {
      const item = { answer: '' }
      const index = 0

      component.callFromInternet(item, index)

      expect(component.resultFetch).toBe(false)
      expect(component.aiSearchResultArr[0].showFromInternet).toBe(false)
      expect(component.aiSearchResultArr[0].showSimiliarResultsFlag).toBe(false)
      expect(mockServices.chatbotService.aiGlobalSearchFromInternet).toHaveBeenCalledWith({
        query: 'test query',
        designation: 'Developer',
        department: 'IT Department'
      }, 'chat-123', 'user-123')
    })

    it('should call from internet with missing professional details', () => {
      component.userInfo = { departmentName: 'IT Department' }
      const item = { answer: '' }
      const index = 0

      component.callFromInternet(item, index)

      expect(mockServices.chatbotService.aiGlobalSearchFromInternet).toHaveBeenCalledWith({
        query: 'test query',
        designation: '',
        department: 'IT Department'
      }, 'chat-123', 'user-123')
    })

    it('should call from internet with missing department', () => {
      component.userInfo = {
        professionalDetails: [{ designation: 'Developer' }]
      }
      const item = { answer: '' }
      const index = 0

      component.callFromInternet(item, index)

      expect(mockServices.chatbotService.aiGlobalSearchFromInternet).toHaveBeenCalledWith({
        query: 'test query',
        designation: 'Developer',
        department: ''
      }, 'chat-123', 'user-123')
    })

    it('should not call internet API if item has answer', () => {
      const item = { answer: 'existing answer' }
      const index = 0

      component.callFromInternet(item, index)

      expect(mockServices.chatbotService.aiGlobalSearchFromInternet).not.toHaveBeenCalled()
    })

    it('should handle internet search response', () => {
      const mockInternetResponse = {
        answer: 'Internet search result with many words to test word count',
        query_id: 'internet-query-id'
      }

      mockServices.chatbotService.aiGlobalSearchFromInternet.mockReturnValue(of(mockInternetResponse))

      const item = { answer: '' }
      const index = 0

      component.callFromInternet(item, index)

      // Verify the API call was made
      expect(mockServices.chatbotService.aiGlobalSearchFromInternet).toHaveBeenCalled()
    })

    it('should reject from internet', () => {
      component.aiSearchResultArr = [
        { newMessage: '', showFromInternet: true },
        { newMessage: 'valid message' }
      ]

      component.rejectFromInternet(0)

      expect(component.aiSearchResultArr[0].showFromInternet).toBe(false)
      expect(component.resultFetch).toBe(true)
      expect(component.aiSearchResultArr).toHaveLength(1) // Empty message filtered out
    })

    it('should view similar results', () => {
      component.aiSearchResultArr = [
        {
          showReterivedChunks: false,
          showSimiliarResultsFlag: true,
          showFromInternet: true
        }
      ]

      component.viewSimiliarResults(0)

      expect(component.aiSearchResultArr[0].showReterivedChunks).toBe(true)
      expect(component.aiSearchResultArr[0].showSimiliarResultsFlag).toBe(false)
      expect(component.aiSearchResultArr[0].showFromInternet).toBe(false)
    })
  })

  describe('Feedback System', () => {
    beforeEach(() => {
      component.aiSearchResultArr = [
        {
          result: [
            {
              query_id: 'test-query-id',
              showLoader: false,
              showLoaderForUp: false,
              showLoaderForDown: false,
              feedback: ''
            }
          ]
        }
      ]
      component.chatId = 'chat-123'
      component.userId = 'user-123'
    })

    it('should share positive content rating successfully', () => {
      const item = { query_id: 'test-query-id' }
      const index = 0
      const cindex = 0

      component.sharePositiveContentRating(item, index, cindex)

      expect(mockServices.chatbotService.saveAIChatPositiveContentRating).toHaveBeenCalledWith({
        query_id: 'test-query-id',
        comments: 'accurate',
        is_liked: true,
        rating: '5'
      }, 'chat-123', 'user-123')

      expect(component.aiSearchResultArr[0].result[0].feedback).toBe('up')
      expect(component.aiSearchResultArr[0].result[0].showLoader).toBe(false)
      expect(component.aiSearchResultArr[0].result[0].showLoaderForUp).toBe(false)
      expect(mockServices.matSnackBarNew.open).toHaveBeenCalledWith(
        'Thank you for your feedback.', 'X',
        { duration: 5000, panelClass: ['success'] }
      )
    })

    it('should handle positive rating API error', () => {
      mockServices.chatbotService.saveAIChatPositiveContentRating.mockReturnValue(of({ status: 'error' }))
      const item = { query_id: 'test-query-id' }
      const index = 0
      const cindex = 0

      component.sharePositiveContentRating(item, index, cindex)

      expect(component.aiSearchResultArr[0].result[0].showLoader).toBe(false)
      expect(component.aiSearchResultArr[0].result[0].showLoaderForUp).toBe(false)
      expect(mockServices.matSnackBarNew.open).toHaveBeenCalledWith(
        'Something is wrong. Please try again later.', 'X',
        { duration: 5000, panelClass: ['error'] }
      )
    })

    it('should open AI feedback popup for valid feedback', () => {
      jest.spyOn(component, 'shareAIFeedback')
      const item = { query_id: 'test-query-id' }
      const index = 0
      const cindex = 0

      component.openAIFeedbackPopup(item, index, cindex)

      expect(mockServices.dialog.open).toHaveBeenCalled()
      expect(component.shareAIFeedback).toHaveBeenCalledWith(item, 'negative feedback', index, cindex)
    })

    it('should prevent duplicate feedback submission', () => {
      component.aiSearchResultArr[0].result[0].feedback = 'down'
      const item = { query_id: 'test-query-id' }
      const index = 0
      const cindex = 0

      component.openAIFeedbackPopup(item, index, cindex)

      expect(mockServices.matSnackBarNew.open).toHaveBeenCalledWith(
        'You have already submitted feedback', 'X',
        { duration: 5000, panelClass: ['error'] }
      )
    })

    it('should handle dialog close without result', () => {
      mockServices.dialog.open.mockReturnValue({
        afterClosed: () => of(null),
        close: jest.fn()
      })

      jest.spyOn(component, 'shareAIFeedback')
      const item = { query_id: 'test-query-id' }
      const index = 0
      const cindex = 0

      component.openAIFeedbackPopup(item, index, cindex)

      expect(component.shareAIFeedback).not.toHaveBeenCalled()
    })

    it('should share AI feedback successfully', () => {
      const item = { query_id: 'test-query-id' }
      const result = 'Not helpful'
      const index = 0
      const cindex = 0

      component.shareAIFeedback(item, result, index, cindex)

      expect(mockServices.chatbotService.shareAIFeedback).toHaveBeenCalledWith({
        query_id: 'test-query-id',
        comments: 'Not helpful',
        is_liked: false,
        rating: '0'
      }, 'chat-123', 'user-123')

      expect(component.aiSearchResultArr[0].result[0].feedback).toBe('down')
      expect(component.aiSearchResultArr[0].result[0].showLoader).toBe(false)
      expect(component.aiSearchResultArr[0].result[0].showLoaderForDown).toBe(false)
    })

    it('should handle share feedback API error', () => {
      mockServices.chatbotService.shareAIFeedback.mockReturnValue(of({ status: 'error' }))
      const item = { query_id: 'test-query-id' }
      const result = 'Not helpful'
      const index = 0
      const cindex = 0

      component.shareAIFeedback(item, result, index, cindex)

      expect(component.aiSearchResultArr[0].result[0].showLoader).toBe(false)
      expect(component.aiSearchResultArr[0].result[0].showLoaderForDown).toBe(false)
      expect(mockServices.matSnackBarNew.open).toHaveBeenCalledWith(
        'Something is wrong. Please try again later.', 'X',
        { duration: 5000, panelClass: ['error'] }
      )
    })
  })

  describe('Utility Functions', () => {
    it('should copy resource path for video', () => {
      const item = {
        contentType: 'Resource',
        mimeType: 'video/mp4',
        identifier: 'video-123',
        contentStart: 30,
        contentEnd: 60,
        pageNumber: 1
      }
      const cindex = 5

      component.copyPath(item, cindex)

      expect(mockDocument.createElement).toHaveBeenCalledWith('textarea')
      expect(mockElement.value).toContain('player/video/video-123')
      expect(mockElement.value).toContain('st=30&et=60')
      expect(component.copiedIndex).toBe(5)
    })

    it('should copy resource path for PDF', () => {
      const item = {
        contentType: 'Resource',
        mimeType: 'application/pdf',
        identifier: 'pdf-123',
        pageNumber: 10
      }
      const cindex = 3

      component.copyPath(item, cindex)

      expect(mockElement.value).toContain('player/pdf/pdf-123')
      expect(mockElement.value).toContain('pn=10')
      expect(component.copiedIndex).toBe(3)
    })

    it('should copy resource path for video without time range', () => {
      const item = {
        contentType: 'Resource',
        mimeType: 'video/mp4',
        identifier: 'video-123',
        contentStart: 0,
        contentEnd: 0
      }

      component.copyPath(item, 0)

      expect(mockElement.value).toContain('player/video/video-123')
      expect(mockElement.value).not.toContain('st=')
      expect(mockElement.value).not.toContain('et=')
    })

    it('should copy course TOC path', () => {
      const item = {
        contentType: 'Course',
        identifier: 'course-123'
      }

      component.copyPath(item, 0)

      expect(mockElement.value).toContain('/app/toc/course-123/overview')
    })

    it('should reset copied index after timeout', (done) => {
      const item = { contentType: 'Resource', mimeType: 'video/mp4', identifier: 'test' }

      component.copyPath(item, 2)
      expect(component.copiedIndex).toBe(2)

      setTimeout(() => {
        expect(component.copiedIndex).toBe(-1)
        done()
      }, 1100)
    })

    it('should redirect to PDF resource', () => {
      const item = {
        mimeType: 'application/pdf',
        identifier: 'pdf-123',
        pageNumber: 5
      }

      component.redirectToResource(item)

      expect(mockWindow.open).toHaveBeenCalledWith(
        expect.stringContaining('player/pdf/pdf-123'),
        '_blank'
      )
    })

    it('should redirect to video resource with time range', () => {
      const item = {
        mimeType: 'video/mp4',
        identifier: 'video-123',
        contentStart: 15,
        contentEnd: 45
      }

      component.redirectToResource(item)

      expect(mockWindow.open).toHaveBeenCalledWith(
        expect.stringContaining('st=15&et=45'),
        '_blank'
      )
    })

    it('should redirect to video resource without time range', () => {
      const item = {
        mimeType: 'video/mp4',
        identifier: 'video-123',
        contentStart: 0,
        contentEnd: 0
      }

      component.redirectToResource(item)

      expect(mockWindow.open).toHaveBeenCalledWith(
        expect.stringContaining('player/video/video-123'),
        '_blank'
      )
    })

    it('should redirect to TOC and raise telemetry', () => {
      const chat = {
        identifier: 'course-123',
        contentType: 'Course'
      }

      component.redirectToToc(chat)

      expect(mockServices.eventSvc.dispatchChatbotEvent).toHaveBeenCalled()
      expect(mockWindow.open).toHaveBeenCalledWith(
        'https://portal.igotkarmayogi.gov.in/app/toc/course-123/overview',
        '_blank'
      )
    })

    it('should split paragraph by default 30 words', () => {
      const longParagraph = Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ')
      const result = component.splitParagraphByWords(longParagraph)
      const wordCount = result.trim().split(/\s+/).length
      expect(wordCount).toBe(30)
    })

    it('should split paragraph by custom word count', () => {
      const paragraph = 'This is a test paragraph with several words for testing.'
      const result = component.splitParagraphByWords(paragraph, 5)
      const wordCount = result.trim().split(/\s+/).length
      expect(wordCount).toBe(5)
    })

    it('should handle paragraph shorter than chunk size', () => {
      const shortParagraph = 'Short text'
      const result = component.splitParagraphByWords(shortParagraph, 30)
      expect(result).toBe('Short text')
    })

    it('should toggle show to less', () => {
      component.aiSearchResultArr = [{ showLess: false }]
      component.toggleShow(0, 'less')
      expect(component.aiSearchResultArr[0].showLess).toBe(true)
    })

    it('should toggle show to more', () => {
      component.aiSearchResultArr = [{ showLess: true }]
      component.toggleShow(0, 'more')
      expect(component.aiSearchResultArr[0].showLess).toBe(false)
    })

    it('should create initials from first and last name', () => {
      //component.createInititals('John Doe');
      expect(component.initials).toBe('JD')
      expect(component.circleColor).toBeDefined()
    })

    it('should create initials from single name', () => {
      //component.createInititals('John');
      expect(component.initials).toBe('JO')
    })

    it('should handle name with undefined second part', () => {
      // component.createInititals('John ');
      expect(component.initials).toHaveLength(2)
    })

    it('should limit initials to 2 characters', () => {
      // component.createInititals('JohnDoeSmithJones');
      expect(component.initials).toHaveLength(2)
    })

    it('should generate secure random string with default length', () => {
      const result = component.secureRandomString()
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should generate secure random string with custom length', () => {
      const result = component.secureRandomString(20)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should create random number', () => {
      const result = component.createRandomNumber()
      expect(typeof result).toBe('number')
    })

    it('should load failed data by calling aiGlobalSearch', () => {
      jest.spyOn(component, 'aiGlobalSearch')
      component.loadFailedData()
      expect(component.aiGlobalSearch).toHaveBeenCalled()
    })

    it('should return user initials', () => {
      component.initials = 'AB'
      expect(component.userInitials).toBe('AB')
    })
  })

  describe('Telemetry Events', () => {
    it('should raise category telemetry', () => {
      component.raiseCategotyTelemetry('category-1')

      expect(mockServices.eventSvc.dispatchChatbotEvent).toHaveBeenCalledWith({
        eventType: 'TELEMETRY',
        eventLogLevel: 'Info',
        data: {
          edata: { type: 'click', id: 'category-1' },
          object: { id: 'category-1', type: 'Category' },
          state: 'INTERACT',
          eventSubType: 'CHATBOT',
          mode: 'view'
        },
        pageContext: { pageId: '/chatbot', module: 'Assistant' },
        from: '',
        to: 'Telemetry'
      })
    })

    it('should raise chat start telemetry', () => {
      component.raiseChatStartTelemetry()

      expect(mockServices.eventSvc.dispatchChatbotEvent).toHaveBeenCalledWith({
        eventType: 'TELEMETRY',
        eventLogLevel: 'Info',
        data: {
          edata: { type: '' },
          object: { type: 'zse', id: 'asd' },
          state: 'LOADED',
          eventSubType: 'CHATBOT',
          type: 'session',
          mode: 'view'
        },
        pageContext: { pageId: '/chatbot', module: 'Assistant' },
        from: '',
        to: 'Telemetry'
      })
    })

    it('should raise chat end telemetry', () => {
      component.raiseChatEndTelemetry()

      expect(mockServices.eventSvc.dispatchChatbotEvent).toHaveBeenCalledWith({
        eventType: 'TELEMETRY',
        eventLogLevel: 'Info',
        data: {
          edata: { type: '' },
          object: {},
          state: 'UNLOADED',
          eventSubType: 'CHATBOT',
          type: 'session',
          mode: 'view'
        },
        pageContext: { pageId: '/chatbot', module: 'Assistant' },
        from: '',
        to: 'Telemetry'
      })
    })

    it('should raise interact telemetry for information filter', () => {
      component.currentFilter = 'information'
      component.raiseTemeletyInterat('question-123')

      expect(mockServices.eventSvc.dispatchChatbotEvent).toHaveBeenCalledWith({
        eventType: 'TELEMETRY',
        eventLogLevel: 'Info',
        data: {
          edata: { type: 'click', id: 'question-123' },
          object: { id: 'question-123', type: 'Information' },
          state: 'INTERACT',
          eventSubType: 'CHATBOT',
          mode: 'view'
        },
        pageContext: { pageId: '/chatbot', module: 'Assistant' },
        from: '',
        to: 'Telemetry'
      })
    })

    it('should raise interact telemetry for issue filter', () => {
      component.currentFilter = 'issue'
      component.raiseTemeletyInterat('issue-123')

      expect(mockServices.eventSvc.dispatchChatbotEvent).toHaveBeenCalledWith({
        eventType: 'TELEMETRY',
        eventLogLevel: 'Info',
        data: {
          edata: { type: 'click', id: 'issue-123' },
          object: { id: 'issue-123', type: 'Issue' },
          state: 'INTERACT',
          eventSubType: 'CHATBOT',
          mode: 'view'
        },
        pageContext: { pageId: '/chatbot', module: 'Assistant' },
        from: '',
        to: 'Telemetry'
      })
    })

    it('should raise telemetry for resource', () => {
      const item = {
        identifier: 'resource-123',
        contentType: 'Resource'
      }

      component.raiseTelemetryForResource(item)

      expect(mockServices.eventSvc.dispatchChatbotEvent).toHaveBeenCalledWith({
        eventType: 'TELEMETRY',
        eventLogLevel: 'Info',
        data: {
          edata: { type: 'click', id: 'card-content', pageid: '/page/home', subType: 'ai-global-search' },
          object: { id: 'resource-123', type: 'Resource' },
          state: 'INTERACT',
          eventSubType: 'CHATBOT',
          mode: 'view'
        },
        pageContext: { pageId: '/page/home', module: 'Home' },
        from: '',
        to: 'Telemetry'
      })
    })
  })

  describe('Textarea and Container Management', () => {
    it('should resize textarea and update container height', (done) => {
      const mockTextArea = {
        style: { height: '30px' },
        scrollHeight: 80
      } as HTMLTextAreaElement

      component.resizeTextarea(mockTextArea, 'input')

      expect(mockTextArea.style.height).toBe('auto')

      // Test the requestAnimationFrame callback
      setTimeout(() => {
        expect(mockTextArea.style.height).toBe('80px')
        expect(component.containerHeight).toBe(100) // 80 + 10 + 10
        done()
      }, 1)
    })

    it('should handle null textarea in resize', () => {
      expect(() => component.resizeTextarea(null as any, '')).not.toThrow()
    })

    it('should reset textarea height with timeout', (done) => {
      component.searchQuery = '  test query with spaces  '

      component.resetTextAreaHeight({} as HTMLTextAreaElement)

      setTimeout(() => {
        expect(component.searchQuery).toBe('test query with spaces')
        expect(component.textArea.nativeElement.style.height).toBe('30px')
        expect(component.containerHeight).toBe(70) // scrollHeight(50) + paddingTop(10) + paddingBottom(10)
        done()
      }, 1)
    })
  })

  describe('Lifecycle Methods', () => {
    it('should handle ngAfterViewChecked', () => {
      expect(() => component.ngAfterViewChecked()).not.toThrow()
    })

    it('should handle ngOnDestroy', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('should handle checkForAIQuestionResponse', () => {
      expect(() => component.checkForAIQuestionResponse()).not.toThrow()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined responseData in getQns', () => {
      component.responseData = undefined
      expect(() => component.getQns()).toThrow()
    })

    it('should handle undefined userInfo in getPriorityQuestion', () => {
      component.userInfo = undefined
      component.responseData = { recommendationMap: [] }
      const result = component.getPriorityQuestion(1)
      expect(result).toEqual([])
    })

    it('should handle empty aiSearchResultArr in various methods', () => {
      component.aiSearchResultArr = []
      expect(() => component.toggleShow(0, 'less')).not.toThrow()
      expect(() => component.viewSimiliarResults(0)).not.toThrow()
      expect(() => component.rejectFromInternet(0)).not.toThrow()
    })

    it('should handle missing array indices gracefully', () => {
      component.aiSearchResultArr = [{}]
      expect(() => component.sharePositiveContentRating({}, 0, 5)).not.toThrow()
      expect(() => component.shareAIFeedback({}, 'feedback', 0, 5)).not.toThrow()
    })

    it('should handle missing professional details', () => {
      component.userInfo = {}
      const item = { answer: '' }
      component.callFromInternet(item, 0)
      expect(mockServices.chatbotService.aiGlobalSearchFromInternet).toHaveBeenCalledWith({
        query: expect.any(String),
        designation: '',
        department: ''
      }, expect.any(String), expect.any(String))
    })

    it('should handle empty categories in sorting', () => {
      component.categories = []
      const result = component.sortCategory()
      expect(result).toEqual([])
    })

    it('should handle malformed localStorage data', () => {
      mockWindow.localStorage.getItem.mockReturnValue('invalid json')
      expect(() => component.checkForApiCalls()).toThrow()
    })
  })
})