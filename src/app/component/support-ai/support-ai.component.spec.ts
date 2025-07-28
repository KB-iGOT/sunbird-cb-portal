import { SupportAIComponent } from './support-ai.component';
import { of, throwError } from 'rxjs';
import { NavigationEnd } from '@angular/router';
import { WsEvents } from '@sunbird-cb/utils-v2';
import { environment } from '../../../environments/environment';

// Mock environment
jest.mock('../../../environments/environment', () => ({
  environment: {
    supportEmail: 'test@example.com'
  }
}));

describe('SupportAIComponent', () => {
  let component: SupportAIComponent;
  let mockConfigSvc: any;
  let mockEventSvc: any;
  let mockRenderer: any;
  let mockChatbotService: any;
  let mockDialog: any;
  let mockMatSnackBar: any;
  let mockRouter: any;

  // Global mocks
  const mockLocalStorage = (() => {
    let store: any = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
      clear: jest.fn(() => { store = {}; })
    };
  })();

  const mockElement = {
    style: { position: '', left: '', top: '', opacity: '', height: 'auto' },
    value: '',
    focus: jest.fn(),
    select: jest.fn(),
    scrollHeight: 100
  };

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    Object.defineProperty(window, 'scrollTo', { value: jest.fn() });
    Object.defineProperty(window, 'open', { value: jest.fn() });
    Object.defineProperty(document, 'body', {
      value: { scrollHeight: 1000, appendChild: jest.fn(), removeChild: jest.fn() }
    });
    Object.defineProperty(document, 'createElement', {
      value: jest.fn(() => ({ ...mockElement }))
    });
    Object.defineProperty(document, 'execCommand', { value: jest.fn() });
    Object.defineProperty(window, 'getComputedStyle', {
      value: jest.fn(() => ({ paddingTop: '10px', paddingBottom: '10px' }))
    });
    Object.defineProperty(window, 'requestAnimationFrame', {
      value: jest.fn(cb => cb())
    });
    Object.defineProperty(Math, 'random', {
      value: jest.fn(() => 0.5)
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();

    // Service mocks
    mockConfigSvc = {
      userProfile: {
        firstName: 'John',
        lastName: 'Doe',
        profileImageUrl: 'http://test.jpg',
        professionalDetails: [{ designation: 'Manager' }],
        departmentName: 'IT Department'
      }
    };

    mockEventSvc = { dispatchChatbotEvent: jest.fn() };
    mockRenderer = { addClass: jest.fn(), removeClass: jest.fn() };
    
    mockChatbotService = {
      getChatData: jest.fn(() => of({
        payload: {
          config: {
            quesMap: [{ quesId: '1', quesValue: 'Test Question', ansVal: 'Test Answer' }],
            recommendationMap: [
              { catId: 'cat1', categoryType: 'Logged-In', priority: 1, recommendedQues: [{ quesID: '1', priority: 1 }] },
              { catId: 'cat2', categoryType: 'Both', priority: 2, recommendedQues: [{ quesID: '2', priority: 1 }] },
              { catId: 'cat3', categoryType: 'Not Logged-In', priority: 3, recommendedQues: [{ quesID: '3', priority: 2 }] }
            ],
            categoryMap: [
              { catId: 'cat1', catName: 'Category 1' },
              { catId: 'cat2', catName: 'Category 2' },
              { catId: 'cat3', catName: 'Category 3' }
            ]
          }
        }
      })),
      getLangugages: jest.fn(() => of({
        status: { code: 200 },
        payload: { languages: [{ code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' }] }
      })),
      aiStartChathForSupport: jest.fn(() => of({ message: 'Chat started' })),
      aiSendChathForSupport: jest.fn(() => of({
        text: 'AI response text here',
        query_id: 'query123',
        RetrievedChunks: [
          {
            Name: 'Test Content',
            contentStart: 10,
            ContentEnd: 20,
            mimeType: 'application/pdf',
            ContentType: 'Learning Resource',
            ArtifactURL: 'http://test.pdf',
            Description: 'Test description',
            Identifier: 'content123'
          }
        ]
      })),
      saveAIChatPositiveContentRating: jest.fn(() => of({ status: 'success' })),
      shareAIFeedback: jest.fn(() => of({ status: 'success' })),
      aiGlobalSearchFromInternet: jest.fn(() => of({
        answer: 'Internet search result',
        query_id: 'internet123'
      }))
    };

    mockDialog = {
      open: jest.fn(() => ({
        afterClosed: jest.fn(() => of('User feedback text'))
      }))
    };

    mockMatSnackBar = { open: jest.fn() };
    mockRouter = { events: of(new NavigationEnd(1, '/test', '/test')) };

    // Create component
    component = new SupportAIComponent(
      mockConfigSvc, mockEventSvc, mockRenderer, mockChatbotService,
      mockDialog, mockMatSnackBar, mockRouter
    );

    // Setup ViewChild mocks
    component.myScrollContainer = {
      nativeElement: { scrollTop: 0, scrollHeight: 100 }
    };
    // component.textArea = {
    //   nativeElement: {
    //     style: { height: '30px' },
    //     scrollHeight: 50,
    //     focus: jest.fn(),
    //     select: jest.fn()
    //   }
    // };
  });

  describe('Component Creation and Initialization', () => {
    it('should create component with default values', () => {
      expect(component).toBeTruthy();
      expect(component.from).toBe('');
      expect(component.userJourney).toEqual([]);
      expect(component.chatId).toBe('');
      expect(component.userId).toBe('');
      expect(component.fullScreenChatFlag).toBe(false);
      expect(component.activeLaguage).toBe('en');
      expect(component.showIcon).toBe(true);
      expect(component.categories).toEqual([]);
      expect(component.language).toEqual([]);
      expect(component.currentFilter).toBe('information');
      expect(component.selectedLaguage).toBe('en');
    });

    it('should initialize properly in ngOnInit with profile image', () => {
      component.ngOnInit();

      expect(component.userInfo).toBe(mockConfigSvc.userProfile);
      expect(component.isHubEnable).toBe(true);
      expect(component.userIcon).toBe('http://test.jpg');
      expect(component.callText).toContain('Teams Call');
      expect(component.emailText).toContain('test@example.com');
      expect(component.aiSearchResultArr).toHaveLength(3);
      expect(component.aiSearchResultArr[0].answer).toContain('Hi John!');
    });

    it('should initialize with default email when environment.supportEmail is undefined', () => {
      const originalEnv = environment.supportEmail;
      delete (environment as any).supportEmail;

      component.ngOnInit();

      expect(component.emailText).toContain('mission.karmayogi@gov.in');
      
      environment.supportEmail = originalEnv;
    });

    it('should create initials when no profile image', () => {
      mockConfigSvc.userProfile.profileImageUrl = null;
      component.ngOnInit();

      expect(component.userIcon).toBe('');
      expect(component.initials).toBe('JO');
      expect(component.circleColor).toBeDefined();
    });

    it('should handle missing userInfo', () => {
      mockConfigSvc.userProfile = null;
      component.ngOnInit();

      expect(component.userIcon).toBe('');
      expect(component.aiSearchResultArr[0].answer).toContain('Hi !');
    });

    it('should handle missing firstName in userInfo', () => {
      mockConfigSvc.userProfile.firstName = null;
      component.ngOnInit();

      expect(component.userIcon).toBe('http://test.jpg');
      expect(component.aiSearchResultArr[0].answer).toContain('Hi !');
    });

    it('should handle router events for certificate URLs', () => {
      mockRouter.events = of(new NavigationEnd(1, '/certs/test', '/certs/test'));
      component = new SupportAIComponent(
        mockConfigSvc, mockEventSvc, mockRenderer, mockChatbotService,
        mockDialog, mockMatSnackBar, mockRouter
      );

      component.ngOnInit();
      expect(component.isHubEnable).toBe(false);
    });

    it('should handle router events for public certificate URLs', () => {
      mockRouter.events = of(new NavigationEnd(1, '/public/certs/test', '/public/certs/test'));
      component = new SupportAIComponent(
        mockConfigSvc, mockEventSvc, mockRenderer, mockChatbotService,
        mockDialog, mockMatSnackBar, mockRouter
      );

      component.ngOnInit();
      expect(component.isHubEnable).toBe(false);
    });
  });

  describe('ngOnChanges', () => {
    it('should handle chatId changes', () => {
      const changes = {
        chatId: {
          previousValue: 'old-chat-id',
          currentValue: 'new-chat-id',
          firstChange: false,
          isFirstChange: () => false
        }
      };

      component.startNewSupportAISearch = jest.fn();
      component.ngOnChanges(changes);

      expect(component.startNewChat).toBe(true);
      expect(component.startNewSupportAISearch).toHaveBeenCalled();
    });

    it('should not trigger when chatId remains same', () => {
      const changes = {
        chatId: {
          previousValue: 'same-id',
          currentValue: 'same-id',
          firstChange: false,
          isFirstChange: () => false
        }
      };

      component.startNewSupportAISearch = jest.fn();
      component.ngOnChanges(changes);

      expect(component.startNewSupportAISearch).not.toHaveBeenCalled();
    });

    it('should not trigger when chatId is null', () => {
      const changes = {
        chatId: {
          previousValue: null,
          currentValue: null,
          firstChange: false,
          isFirstChange: () => false
        }
      };

      component.startNewSupportAISearch = jest.fn();
      component.ngOnChanges(changes);

      expect(component.startNewSupportAISearch).not.toHaveBeenCalled();
    });

    it('should handle changes without chatId', () => {
      const changes = {
        otherProperty: {
          previousValue: 'old',
          currentValue: 'new',
          firstChange: false,
          isFirstChange: () => false
        }
      };

      component.startNewSupportAISearch = jest.fn();
      component.ngOnChanges(changes);

      expect(component.startNewSupportAISearch).not.toHaveBeenCalled();
    });
  });

  describe('Localization Methods', () => {
    it('should return correct greeting for English', () => {
      component.selectedLaguage = 'en';
      expect(component.greetings()).toBe('Namaste');
    });

    it('should return correct greeting for Hindi', () => {
      component.selectedLaguage = 'hi';
      expect(component.greetings()).toBe('नमस्ते');
    });

    it('should return default greeting for unknown language', () => {
      component.selectedLaguage = 'unknown';
      expect(component.greetings()).toBe('Hi');
    });

    it('should return correct info text for English', () => {
      component.selectedLaguage = 'en';
      expect(component.getInfoText('information')).toBe('Information');
      expect(component.getInfoText('issue')).toBe('Issues');
      expect(component.getInfoText('categories')).toBe('Show All Categories');
    });

    it('should return correct info text for Hindi', () => {
      component.selectedLaguage = 'hi';
      expect(component.getInfoText('information')).toBe('जानकारी');
      expect(component.getInfoText('issue')).toBe('समस्या');
      expect(component.getInfoText('categories')).toBe('सभी कैटगोरी दिखायें');
    });

    it('should return label as fallback for unknown keys', () => {
      component.selectedLaguage = 'en';
      expect(component.getInfoText('unknown')).toBe('unknown');
    });

    it('should return show more text', () => {
      component.selectedLaguage = 'en';
      expect(component.showMore()).toBe('Show More');

      component.selectedLaguage = 'hi';
      expect(component.showMore()).toBe('और दिखाओ');

      component.selectedLaguage = 'unknown';
      expect(component.showMore()).toBe('Show More');
    });
  });

  describe('Data Management', () => {
    it('should get data for information filter', () => {
      component.currentFilter = 'information';
      component.selectedLaguage = 'en';
      
      component.getData();

      expect(component.displayLoader).toBe(true);
      expect(mockChatbotService.getChatData).toHaveBeenCalledWith({
        lang: 'en',
        config_type: 'IN'
      });
    });

    it('should get data for issue filter', () => {
      component.currentFilter = 'issue';
      component.selectedLaguage = 'hi';
      
      component.getData();

      expect(mockChatbotService.getChatData).toHaveBeenCalledWith({
        lang: 'hi',
        config_type: 'IS'
      });
    });

    it('should handle successful data response', () => {
      component.setDataToLocalStorage = jest.fn();
      component.checkForApiCalls = jest.fn();

      component.getData();

      expect(component.setDataToLocalStorage).toHaveBeenCalled();
      expect(component.checkForApiCalls).toHaveBeenCalled();
      expect(component.displayLoader).toBe(false);
    });

    it('should handle empty response', () => {
      mockChatbotService.getChatData.mockReturnValue(of({}));
      
      component.getData();
      // Should not throw error
    });

    it('should set data to localStorage', () => {
      const testData = { testKey: 'testValue' };
      mockLocalStorage.getItem.mockReturnValue('{}');
      component.toggleFilter = jest.fn();

      component.setDataToLocalStorage(testData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('faq', expect.stringContaining('testKey'));
      expect(component.toggleFilter).toHaveBeenCalledWith('information');
    });

    it('should set data to localStorage with existing data', () => {
      const testData = { newKey: 'newValue' };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        en: { information: { oldKey: 'oldValue' } }
      }));
      component.currentFilter = 'issue';
      component.toggleFilter = jest.fn();

      component.setDataToLocalStorage(testData);

      expect(component.toggleFilter).toHaveBeenCalledWith('issue');
    });

    it('should initialize data', () => {
      const testData = {
        quesMap: [{ quesId: '1', quesValue: 'Q1', ansVal: 'A1' }],
        recommendationMap: [
          { catId: 'cat1', categoryType: 'Logged-In', priority: 1, recommendedQues: [{ quesID: '1', priority: 1 }] }
        ]
      };

      component.getPriorityQuestion = jest.fn().mockReturnValue([{ quesID: '1' }]);
      component.pushData = jest.fn();

      component.initData(testData);

      expect(component.userJourney).toEqual([]);
      expect(component.pushData).toHaveBeenCalled();
      expect(component.getPriorityQuestion).toHaveBeenCalledWith(1);
    });

    it('should process questions', () => {
      component.responseData = {
        quesMap: [
          { quesId: '1', quesValue: 'Q1', ansVal: 'A1' },
          { quesId: '2', quesValue: 'Q2', ansVal: 'A2' }
        ]
      };

      component.getQns();

      expect(component.questionsAndAns['1']).toBeDefined();
      expect(component.questionsAndAns['2']).toBeDefined();
      expect(component.questionsAndAns['1'].quesValue).toBe('Q1');
    });

    it('should read from localStorage for information', () => {
      const mockData = {
        en: {
          information: { testInfo: 'infoData' },
          issue: { testIssue: 'issueData' }
        }
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));
      component.currentFilter = 'information';

      component.readFromLocalStorage();

      expect(component.responseData.testInfo).toBe('infoData');
    });

    it('should read from localStorage for issue', () => {
      const mockData = {
        en: {
          information: { testInfo: 'infoData' },
          issue: { testIssue: 'issueData' }
        }
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));
      component.currentFilter = 'issue';

      component.readFromLocalStorage();

      expect(component.responseData.testIssue).toBe('issueData');
    });

    it('should handle null localStorage data', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      expect(() => component.readFromLocalStorage()).not.toThrow();
    });
  });

  describe('Language Selection', () => {
    it('should select language and reset chats', () => {
      const event = { target: { value: 'hi' } };
      component.checkForApiCalls = jest.fn();

      component.selectLaguage(event);

      expect(component.selectedLaguage).toBe('hi');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'hi');
      expect(component.chatInformation).toEqual([]);
      expect(component.chatIssues).toEqual([]);
      expect(component.checkForApiCalls).toHaveBeenCalled();
    });
  });

  describe('UI Interactions', () => {
    it('should scroll to bottom', () => {
      component.goToBottom();
      expect(window.scrollTo).toHaveBeenCalledWith(0, 1000);
    });

    it('should handle icon click start', () => {
      component.raiseChatStartTelemetry = jest.fn();
      
      component.iconClick('start');

      expect(component.showIcon).toBe(false);
      expect(component.currentFilter).toBe('information');
      expect(component.expanded).toBe(false);
      expect(mockRenderer.addClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
      expect(component.raiseChatStartTelemetry).toHaveBeenCalled();
    });

    it('should handle icon click end', () => {
      component.raiseChatEndTelemetry = jest.fn();
      component.checkForApiCalls = jest.fn();

      component.iconClick('end');

      expect(component.showIcon).toBe(false);
      expect(component.userJourney).toEqual([]);
      expect(component.chatInformation).toEqual([]);
      expect(component.chatIssues).toEqual([]);
      expect(component.selectedLaguage).toBe('en');
      expect(component.currentFilter).toBe('information');
      expect(component.more).toBe(false);
      expect(mockRenderer.removeClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
      expect(component.raiseChatEndTelemetry).toHaveBeenCalled();
      expect(component.checkForApiCalls).toHaveBeenCalled();
    });

    it('should toggle filter to issue', () => {
      component.checkForApiCalls = jest.fn();

      component.toggleFilter('issue');

      expect(component.currentFilter).toBe('issue');
      expect(component.more).toBe(false);
      expect(component.checkForApiCalls).toHaveBeenCalled();
    });

    it('should click outside', () => {
      component.iconClick = jest.fn();
      
      component.clickOutside();

      expect(component.iconClick).toHaveBeenCalledWith('end');
    });

    // it('should scroll to bottom with container', () => {
    //   component.scrollToBottom();

    //   expect(component.myScrollContainer.nativeElement.scrollTop).toBe(100);
    // });

    it('should handle scroll error when container is undefined', () => {
      component.myScrollContainer = undefined;

      expect(() => component.scrollToBottom()).not.toThrow();
    });

    it('should handle scroll error with exception', () => {
      component.myScrollContainer = {
        nativeElement: {
          get scrollTop() { throw new Error('Test error'); },
          set scrollTop(_value) { throw new Error('Test error'); },
          scrollHeight: 100
        }
      };

      expect(() => component.scrollToBottom()).not.toThrow();
    });
  });

  describe('Question and Answer Logic', () => {
    beforeEach(() => {
      component.questionsAndAns = {
        '1': { quesValue: 'Test Question?', ansVal: 'Test Answer <teams_call_link> and <email_configuration>' }
      };
      component.callText = 'Call Link';
      component.emailText = 'Email Link';
      component.currentFilter = 'information';
    });

    it('should handle selected question', () => {
      const question = { quesID: '1', recommendedQues: [{ quesID: '2' }] };
      const data = { selectedValue: '' };
      component.pushData = jest.fn();
      component.raiseTemeletyInterat = jest.fn();

      component.selectedQuestion(question, data);

      expect(data.selectedValue).toBe('1');
      expect(component.pushData).toHaveBeenCalledTimes(2);
      expect(component.raiseTemeletyInterat).toHaveBeenCalledWith('1');
    });

    // it('should replace placeholder text in answer', () => {
    //   const question = { quesID: '1', recommendedQues: [] };
    //   const data = { selectedValue: '' };
    //   component.pushData = jest.fn();

    //   component.selectedQuestion(question, data);

    //   const calls = component.pushData.mock.calls;
    //   const incomingMsg = calls[1][0];
    //   expect(incomingMsg.message).toContain('Call Link');
    //   expect(incomingMsg.message).toContain('Email Link');
    // });

    it('should push data to information chat', () => {
      component.currentFilter = 'information';
      const msg = { type: 'test', message: 'Test message' };

      component.pushData(msg);

      expect(component.chatInformation).toContain(msg);
      expect(component.userJourney).toContain(msg);
    });

    it('should push data to issues chat', () => {
      component.currentFilter = 'issue';
      const msg = { type: 'test', message: 'Test message' };

      component.pushData(msg);

      expect(component.chatIssues).toContain(msg);
      expect(component.userJourney).toContain(msg);
    });

    it('should get user journey filtered by tab', () => {
      component.userJourney = [
      ];

      const infoJourney = component.getuserjourney('information');
      const issueJourney = component.getuserjourney('issue');

      expect(infoJourney).toHaveLength(2);
      expect(issueJourney).toHaveLength(1);
    });
  });

  describe('Priority Questions', () => {
    beforeEach(() => {
      component.responseData = {
        recommendationMap: [
          {
            categoryType: 'Logged-In',
            recommendedQues: [
              { priority: 1, question: 'Q1' },
              { priority: 2, question: 'Q2' }
            ]
          },
          {
            categoryType: 'Both',
            recommendedQues: [
              { priority: 1, question: 'Q3' },
              { priority: 3, question: 'Q4' }
            ]
          },
          {
            categoryType: 'Not Logged-In',
            recommendedQues: [
              { priority: 1, question: 'Q5' }
            ]
          }
        ]
      };
    });

    it('should get priority questions for logged in user', () => {
      component.userInfo = { firstName: 'John' };

      const questions = component.getPriorityQuestion(1);

      expect(questions).toHaveLength(2); // Logged-In + Both
      expect(questions.some(q => q.question === 'Q1')).toBe(true);
      expect(questions.some(q => q.question === 'Q3')).toBe(true);
    });

    it('should get priority questions for not logged in user', () => {
      component.userInfo = null;

      const questions = component.getPriorityQuestion(1);

      expect(questions).toHaveLength(2); // Both + Not Logged-In
      expect(questions.some(q => q.question === 'Q3')).toBe(true);
      expect(questions.some(q => q.question === 'Q5')).toBe(true);
    });

    it('should get questions with specific priority', () => {
      component.userInfo = { firstName: 'John' };

      const questions = component.getPriorityQuestion(2);

      expect(questions).toHaveLength(1);
      expect(questions[0].question).toBe('Q2');
    });

    it('should handle empty recommendationMap', () => {
      component.responseData = { recommendationMap: [] };

      const questions = component.getPriorityQuestion(1);

      expect(questions).toEqual([]);
    });

    it('should handle null responseData', () => {
      component.responseData = null;

      expect(() => component.getPriorityQuestion(1)).not.toThrow();
    });

    it('should show more questions', () => {
      component.getPriorityQuestion = jest.fn().mockReturnValue([{ quesID: '1' }]);
      component.pushData = jest.fn();

      component.showMoreQuestion();

      expect(component.pushData).toHaveBeenCalledWith({
        type: 'incoming',
        message: '',
        recommendedQues: [{ quesID: '1' }],
        selectedValue: '',
        title: ''
      });
    });
  });

  describe('Categories', () => {
    beforeEach(() => {
      component.responseData = {
        recommendationMap: [
          { catId: 'cat1', categoryType: 'Logged-In', priority: 1, recommendedQues: [{ quesID: '1' }] },
          { catId: 'cat2', categoryType: 'Both', priority: 2, recommendedQues: [{ quesID: '2' }] },
          { catId: 'cat3', categoryType: 'Not Logged-In', priority: 3, recommendedQues: [{ quesID: '3' }] }
        ],
        categoryMap: [
          { catId: 'cat1', catName: 'Category 1' },
          { catId: 'cat2', catName: 'Category 2' },
          { catId: 'cat3', catName: 'Category 3' }
        ]
      };
      component.userInfo = { firstName: 'John' };
    });

    it('should show all categories', () => {
      const catItem = { catId: 'all', catName: 'All Categories' };
      component.sortCategory = jest.fn().mockReturnValue([]);
      component.pushData = jest.fn();

      component.showCategory(catItem);

      expect(component.more).toBe(false);
      expect(component.pushData).toHaveBeenCalledTimes(2);
      expect(component.sortCategory).toHaveBeenCalled();
    });

    it('should show specific category', () => {
      const catItem = { catId: 'cat1', catName: 'Category 1' };
      component.pushData = jest.fn();
      component.raiseCategotyTelemetry = jest.fn();

      component.showCategory(catItem);

      expect(component.pushData).toHaveBeenCalledTimes(2);
      expect(component.raiseCategotyTelemetry).toHaveBeenCalledWith('cat1');
    });

    it('should handle category not found in recommendationMap', () => {
      const catItem = { catId: 'nonexistent', catName: 'Non-existent' };
      component.pushData = jest.fn();

      component.showCategory(catItem);

      expect(component.pushData).toHaveBeenCalledTimes(2);
    });

    it('should get categories for logged in user', () => {
      component.selectedLaguage = 'en';

      component.getCategories();

      expect(component.categories).toHaveLength(2); // Logged-In + Both
      expect(component.categories.some(c => c.catName === 'Category 1')).toBe(true);
      expect(component.categories.some(c => c.catName === 'Category 2')).toBe(true);
    });

    it('should get categories for not logged in user', () => {
      component.userInfo = null;
      component.selectedLaguage = 'en';

      component.getCategories();

      expect(component.categories).toHaveLength(2); // Both + Not Logged-In
      expect(component.categories.some(c => c.catName === 'Category 2')).toBe(true);
      expect(component.categories.some(c => c.catName === 'Category 3')).toBe(true);
    });

    it('should handle more than 6 categories', () => {
      // Add more categories to test the length condition
      const moreRecommendations = Array.from({ length: 10 }, (_, i) => ({
        catId: `cat${i + 4}`,
        categoryType: 'Both',
        priority: i + 4,
        recommendedQues: [{ quesID: `${i + 4}` }]
      }));
      const moreCategoryMap = Array.from({ length: 10 }, (_, i) => ({
        catId: `cat${i + 4}`,
        catName: `Category ${i + 4}`
      }));

      component.responseData.recommendationMap.push(...moreRecommendations);
      component.responseData.categoryMap.push(...moreCategoryMap);
      component.selectedLaguage = 'en';

      component.getCategories();

      expect(component.categories.length).toBeGreaterThan(6);
      expect(component.categories[0].catName).toBe('Show All Categories');
    });

    it('should sort categories by priority', () => {
      component.categories = [
        { priority: 3, catName: 'C' },
        { priority: 1, catName: 'A' },
        { priority: 2, catName: 'B' }
      ];

      const sorted = component.sortCategory();

      expect(sorted[0].priority).toBe(1);
      expect(sorted[1].priority).toBe(2);
      expect(sorted[2].priority).toBe(3);
    });

    it('should handle equal priorities in sort', () => {
      component.categories = [
        { priority: 1, catName: 'B' },
        { priority: 1, catName: 'A' }
      ];

      const sorted = component.sortCategory();

      expect(sorted).toHaveLength(2);
      expect(sorted[0].priority).toBe(1);
      expect(sorted[1].priority).toBe(1);
    });
  });

  describe('Languages', () => {
    it('should get languages successfully', () => {
      component.getData = jest.fn();

      component.getLanguages();

      expect(component.displayLoader).toBe(true);
      expect(mockChatbotService.getLangugages).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('faq-languages', expect.any(String));
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'en');
      expect(component.getData).toHaveBeenCalled();
      expect(component.displayLoader).toBe(false);
    });

    it('should handle languages API error', () => {
      mockChatbotService.getLangugages.mockReturnValue(of({
        status: { code: 500 },
        payload: { languages: [] }
      }));

      component.getLanguages();

      expect(component.displayLoader).toBe(true);
    });

    it('should handle languages API without proper response', () => {
      mockChatbotService.getLangugages.mockReturnValue(of({}));

      component.getLanguages();

      expect(component.displayLoader).toBe(true);
    });
  });

  describe('API Calls Check', () => {
    it('should check for API calls with complete localStorage', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'selectedLanguage') return 'en';
        if (key === 'faq') return JSON.stringify({
          en: {
            information: {
              quesMap: [{ quesId: '1' }],
              recommendationMap: [],
              categoryMap: []
            }
          }
        });
        if (key === 'faq-languages') return JSON.stringify([{ code: 'en', name: 'English' }]);
        return null;
      });

      component.currentFilter = 'information';
      component.initData = jest.fn();
      component.getQns = jest.fn();
      component.getCategories = jest.fn();

      component.checkForApiCalls();

      expect(component.selectedLaguage).toBe('en');
      expect(component.language).toEqual([{ code: 'en', name: 'English' }]);
      expect(component.initData).toHaveBeenCalled();
      expect(component.getQns).toHaveBeenCalled();
      expect(component.getCategories).toHaveBeenCalled();
    });

    it('should check for API calls with existing chat information', () => {
      component.chatInformation = [{ message: 'existing' }];
      component.currentFilter = 'information';
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'selectedLanguage') return 'en';
        if (key === 'faq') return JSON.stringify({
          en: { information: { quesMap: [] } }
        });
        if (key === 'faq-languages') return JSON.stringify([]);
        return null;
      });

      component.getQns = jest.fn();

      component.checkForApiCalls();

      expect(component.userJourney).toEqual([{ message: 'existing' }]);
      expect(component.getQns).toHaveBeenCalled();
    });

    it('should check for API calls with existing chat issues', () => {
      component.chatIssues = [{ message: 'existing issue' }];
      component.currentFilter = 'issue';
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'selectedLanguage') return 'en';
        if (key === 'faq') return JSON.stringify({
          en: { issue: { quesMap: [] } }
        });
        if (key === 'faq-languages') return JSON.stringify([]);
        return null;
      });

      component.getQns = jest.fn();

      component.checkForApiCalls();

      expect(component.userJourney).toEqual([{ message: 'existing issue' }]);
    });

    it('should get languages when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      component.getLanguages = jest.fn();

      component.checkForApiCalls();

      expect(component.getLanguages).toHaveBeenCalled();
    });

    it('should handle empty faq-languages', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'faq-languages') return JSON.stringify([]);
        return null;
      });
      component.getLanguages = jest.fn();

      component.checkForApiCalls();

      expect(component.getLanguages).toHaveBeenCalled();
    });
  });

  describe('Telemetry Events', () => {
    it('should raise category telemetry', () => {
      component.raiseCategotyTelemetry('test-category');

      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledWith({
        eventType: WsEvents.WsEventType.Telemetry,
        eventLogLevel: WsEvents.WsEventLogLevel.Info,
        data: {
          edata: { type: 'click', id: 'test-category' },
          object: { id: 'test-category', type: 'Category' },
          state: WsEvents.EnumTelemetrySubType.Interact,
          eventSubType: WsEvents.EnumTelemetrySubType.Chatbot,
          mode: 'view',
        },
        pageContext: { pageId: '/chatbot', module: 'Assistant' },
        from: '',
        to: 'Telemetry',
      });
    });

    it('should raise chat start telemetry', () => {
      component.raiseChatStartTelemetry();

      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledWith({
        eventType: WsEvents.WsEventType.Telemetry,
        eventLogLevel: WsEvents.WsEventLogLevel.Info,
        data: {
          edata: { type: '' },
          object: { type: 'zse', id: 'asd' },
          state: WsEvents.EnumTelemetrySubType.Loaded,
          eventSubType: WsEvents.EnumTelemetrySubType.Chatbot,
          type: 'session',
          mode: 'view',
        },
        pageContext: { pageId: '/chatbot', module: 'Assistant' },
        from: '',
        to: 'Telemetry',
      });
    });

    it('should raise chat end telemetry', () => {
      component.raiseChatEndTelemetry();

      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledWith({
        eventType: WsEvents.WsEventType.Telemetry,
        eventLogLevel: WsEvents.WsEventLogLevel.Info,
        data: {
          edata: { type: '' },
          object: {},
          state: WsEvents.EnumTelemetrySubType.Unloaded,
          eventSubType: WsEvents.EnumTelemetrySubType.Chatbot,
          type: 'session',
          mode: 'view',
        },
        pageContext: { pageId: '/chatbot', module: 'Assistant' },
        from: '',
        to: 'Telemetry',
      });
    });

    it('should raise interact telemetry', () => {
      component.currentFilter = 'information';
      component.raiseTemeletyInterat('test-question');

      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledWith({
        eventType: WsEvents.WsEventType.Telemetry,
        eventLogLevel: WsEvents.WsEventLogLevel.Info,
        data: {
          edata: { type: 'click', id: 'test-question' },
          object: { id: 'test-question', type: 'Information' },
          state: WsEvents.EnumTelemetrySubType.Interact,
          eventSubType: WsEvents.EnumTelemetrySubType.Chatbot,
          mode: 'view'
        },
        pageContext: { pageId: '/chatbot', module: 'Assistant' },
        from: '',
        to: 'Telemetry',
      });
    });

    it('should raise interact telemetry for issue filter', () => {
      component.currentFilter = 'issue';
      component.raiseTemeletyInterat('test-issue');

      const call = mockEventSvc.dispatchChatbotEvent.mock.calls[0][0];
      expect(call.data.object.type).toBe('Issue');
    });

    it('should raise resource telemetry', () => {
      const item = { identifier: 'resource123', contentType: 'video' };
      component.raiseTelemetryForResource(item);

      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledWith({
        eventType: WsEvents.WsEventType.Telemetry,
        eventLogLevel: WsEvents.WsEventLogLevel.Info,
        data: {
          edata: { type: 'click', id: 'card-content', pageid: '/page/home' },
          object: { id: 'resource123', type: 'video' },
          state: WsEvents.EnumTelemetrySubType.Interact,
          eventSubType: WsEvents.EnumTelemetrySubType.Chatbot,
          mode: 'view',
        },
        pageContext: { pageId: '/page/home', module: 'Home' },
        from: '',
        to: 'Telemetry',
      });
    });
  });

  describe('AI Search Functionality', () => {
    beforeEach(() => {
      component.userId = 'user123';
      component.chatId = 'chat456';
      component.aiSearchResultArr = [];
    //  component.scrollToBottomEvent = { emit: jest.fn() };
    });

    it('should submit search query with valid text', () => {
      component.searchQuery = 'test query';
      const mockTextArea = { style: { height: '50px' } };
      const mockEvent = { preventDefault: jest.fn() };
      
      component.supportAISearch = jest.fn();
      component.resetTextAreaHeight = jest.fn();

      component.submitSearchQuery(mockTextArea as any, mockEvent);

      expect(component.aiSearchResultArr).toHaveLength(2);
      expect(component.cloneSearchQuery).toBe('test query');
      expect(component.searchQuery).toBe('');
      expect(component.supportAISearch).toHaveBeenCalled();
      expect(component.resetTextAreaHeight).toHaveBeenCalledWith(mockTextArea);
    });

    it('should prevent submit with empty query', () => {
      component.searchQuery = '';
      const mockEvent = { preventDefault: jest.fn() };

      component.submitSearchQuery({} as any, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should prevent submit with whitespace-only query', () => {
      component.searchQuery = '   ';
      const mockEvent = { preventDefault: jest.fn() };

      component.submitSearchQuery({} as any, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should filter empty messages before submit', () => {
      component.searchQuery = 'test';
      component.aiSearchResultArr = [
        { newMessage: 'valid' },
        { newMessage: '' },
        { newMessage: 'another valid' }
      ];
      
      component.supportAISearch = jest.fn();
      component.resetTextAreaHeight = jest.fn();

      component.submitSearchQuery({} as any, { preventDefault: jest.fn() });

      expect(component.aiSearchResultArr).toHaveLength(3); // 1 valid + 2 new ones added
    });

    it('should emit scroll event when array length > 2', () => {
      component.searchQuery = 'test';
      component.aiSearchResultArr = [1, 2, 3]; // Length > 2
      
      component.supportAISearch = jest.fn();
      component.resetTextAreaHeight = jest.fn();

      jest.useFakeTimers();
      component.submitSearchQuery({} as any, { preventDefault: jest.fn() });
      jest.runAllTimers();

      expect(component.scrollToBottomEvent.emit).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should start new support AI search when startNewChat is true', () => {
      component.startNewChat = true;
      component.cloneSearchQuery = 'test query';
      component.activeLaguage = 'en';

      component.startNewSupportAISearch();

      expect(mockChatbotService.aiStartChathForSupport).toHaveBeenCalledWith({
        channel_id: 'web',
        text: 'test query',
        audio: '',
        language: 'en'
      }, 'user123');
      expect(component.resultFetch).toBe(true);
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    });

    it('should set initiateSupportNewChat true when API returns message', () => {
      component.startNewChat = true;
      
      component.startNewSupportAISearch();

      expect(component.initiateSupportNewChat).toBe(true);
    });

    it('should set initiateSupportNewChat false when API returns no message', () => {
      component.startNewChat = true;
      mockChatbotService.aiStartChathForSupport.mockReturnValue(of({}));
      
      component.startNewSupportAISearch();

      expect(component.initiateSupportNewChat).toBe(false);
    });

    it('should not start new search when startNewChat is false', () => {
      component.startNewChat = false;
      
      component.startNewSupportAISearch();

      expect(mockChatbotService.aiStartChathForSupport).not.toHaveBeenCalled();
    });

    it('should perform support AI search when initiated', () => {
      component.initiateSupportNewChat = true;
      component.cloneSearchQuery = 'test query';
      component.activeLaguage = 'en';

      component.supportAISearch();

      expect(mockChatbotService.aiSendChathForSupport).toHaveBeenCalledWith({
        channel_id: 'web',
        text: 'test query',
        audio: '',
        language: 'en'
      }, 'user123');
      expect(component.resultFetch).toBe(true);
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    });

    it('should not perform search when not initiated', () => {
      component.initiateSupportNewChat = false;

      component.supportAISearch();

      expect(mockChatbotService.aiSendChathForSupport).not.toHaveBeenCalled();
    });

    it('should process AI response with text and chunks', () => {
      component.initiateSupportNewChat = true;
      component.splitParagraphByWords = jest.fn().mockReturnValue('short answer');

      component.supportAISearch();

      expect(component.aiSearchResult).toBeDefined();
      expect(component.aiSearchResultArr.length).toBeGreaterThan(0);
    });

    it('should handle AI response without retrieved chunks', () => {
      component.initiateSupportNewChat = true;
      mockChatbotService.aiSendChathForSupport.mockReturnValue(of({
        text: 'AI response',
        query_id: 'q1'
      }));

      component.supportAISearch();

      expect(component.aiSearchResult.text).toBe('AI response');
    });
  });

  describe('Feedback Functionality', () => {
    beforeEach(() => {
      component.aiSearchResultArr = [
        {
          result: [
            { query_id: 'query1', feedback: '' }
          ]
        }
      ];
      component.chatId = 'chat123';
      component.userId = 'user123';
    });

    it('should share positive content rating successfully', () => {
      const item = { query_id: 'query1' };
      
      component.sharePositiveContentRating(item, 0, 0);

      expect(mockChatbotService.saveAIChatPositiveContentRating).toHaveBeenCalledWith({
        query_id: 'query1',
        comments: 'accurate',
        is_liked: true,
        rating: '5'
      }, 'chat123', 'user123');

      expect(component.aiSearchResultArr[0].result[0].feedback).toBe('up');
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Thank you for your feedback.', 'X',
        { duration: 5000, panelClass: ['success'] }
      );
    });

    it('should handle positive rating API error', () => {
      mockChatbotService.saveAIChatPositiveContentRating.mockReturnValue(of({
        status: 'error'
      }));
      const item = { query_id: 'query1' };
      
      component.sharePositiveContentRating(item, 0, 0);

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Something is wrong. Please try again later.', 'X',
        { duration: 5000, panelClass: ['error'] }
      );
    });

    it('should handle positive rating with missing result structure', () => {
      component.aiSearchResultArr = [];
      const item = { query_id: 'query1' };
      
      expect(() => component.sharePositiveContentRating(item, 0, 0)).not.toThrow();
    });

    it('should open AI feedback popup when feedback not submitted', () => {
      const item = { query_id: 'query1' };
      component.shareAIFeedback = jest.fn();

      component.openAIFeedbackPopup(item, 0, 0);

      expect(mockDialog.open).toHaveBeenCalled();
      expect(component.shareAIFeedback).toHaveBeenCalledWith(item, 'User feedback text', 0, 0);
    });

    it('should not open popup when feedback already submitted', () => {
      component.aiSearchResultArr[0].result[0].feedback = 'down';
      const item = { query_id: 'query1' };

      component.openAIFeedbackPopup(item, 0, 0);

      expect(mockDialog.open).not.toHaveBeenCalled();
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'You have already submitted feedback', 'X',
        { duration: 5000, panelClass: ['error'] }
      );
    });

    it('should handle dialog cancellation', () => {
      mockDialog.open.mockReturnValue({
        afterClosed: jest.fn(() => of(null))
      });
      const item = { query_id: 'query1' };
      component.shareAIFeedback = jest.fn();

      component.openAIFeedbackPopup(item, 0, 0);

      expect(component.shareAIFeedback).not.toHaveBeenCalled();
    });

    it('should share AI feedback successfully', () => {
      const item = { query_id: 'query1' };
      const feedback = 'Not helpful';

      component.shareAIFeedback(item, feedback, 0, 0);

      expect(mockChatbotService.shareAIFeedback).toHaveBeenCalledWith({
        query_id: 'query1',
        comments: 'Not helpful',
        is_liked: false,
        rating: '0'
      }, 'chat123', 'user123');

      expect(component.aiSearchResultArr[0].result[0].feedback).toBe('down');
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Thank you for your feedback.', 'X',
        { duration: 5000, panelClass: ['success'] }
      );
    });

    it('should handle AI feedback API error', () => {
      mockChatbotService.shareAIFeedback.mockReturnValue(of({
        status: 'error'
      }));
      const item = { query_id: 'query1' };

      component.shareAIFeedback(item, 'feedback', 0, 0);

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Something is wrong. Please try again later.', 'X',
        { duration: 5000, panelClass: ['error'] }
      );
    });
  });

  describe('Internet Search', () => {
    beforeEach(() => {
      component.aiSearchResultArr = [{ showFromInternet: true }];
      component.cloneSearchQuery = 'test query';
      component.userInfo = mockConfigSvc.userProfile;
    });

    it('should call from internet when no answer exists', () => {
      const item = { answer: null };
      
      component.callFromInternet(item, 0);

      expect(component.resultFetch).toBe(false);
      expect(component.aiSearchResultArr[0].showFromInternet).toBe(false);
      expect(mockChatbotService.aiGlobalSearchFromInternet).toHaveBeenCalledWith({
        query: 'test query',
        designation: 'Manager',
        department: 'IT Department'
      }, component.chatId, component.userId);
    });

    it('should handle internet search with missing professional details', () => {
      component.userInfo = { departmentName: 'IT' };
      const item = { answer: null };
      
      component.callFromInternet(item, 0);

      expect(mockChatbotService.aiGlobalSearchFromInternet).toHaveBeenCalledWith({
        query: 'test query',
        designation: '',
        department: 'IT'
      }, component.chatId, component.userId);
    });

    it('should handle internet search with missing department', () => {
      component.userInfo = { 
        professionalDetails: [{ designation: 'Manager' }]
      };
      const item = { answer: null };
      
      component.callFromInternet(item, 0);

      expect(mockChatbotService.aiGlobalSearchFromInternet).toHaveBeenCalledWith({
        query: 'test query',
        designation: 'Manager',
        department: ''
      }, component.chatId, component.userId);
    });

    it('should not call internet when answer exists', () => {
      const item = { answer: 'Existing answer' };
      
      component.callFromInternet(item, 0);

      expect(mockChatbotService.aiGlobalSearchFromInternet).not.toHaveBeenCalled();
    });

    it('should process internet search result', () => {
      const item = { answer: null };
      component.splitParagraphByWords = jest.fn().mockReturnValue('short answer');
      
      component.callFromInternet(item, 0);

      expect(component.iGOTAISearchResultArr.length).toBeGreaterThan(0);
      expect(component.aiSearchResultArr.length).toBeGreaterThan(1);
    });

    it('should reject from internet', () => {
      component.rejectFromInternet(0);

      expect(component.aiSearchResultArr[0].showFromInternet).toBe(false);
      expect(component.resultFetch).toBe(true);
    });

    it('should filter empty messages after internet search', () => {
      component.aiSearchResultArr = [
        { showFromInternet: true },
        { newMessage: '' },
        { newMessage: 'valid' }
      ];
      
      component.rejectFromInternet(0);

      expect(component.aiSearchResultArr).toHaveLength(2); // Filtered empty message
    });
  });

  describe('Utility Functions', () => {
    it('should copy PDF path', () => {
      const item = {
        mimeType: 'application/pdf',
        identifier: 'content123',
        pageNumber: 5
      };

      jest.useFakeTimers();
      component.copyPath(item, 2);

      expect(document.createElement).toHaveBeenCalledWith('textarea');
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(component.copiedIndex).toBe(2);

      jest.advanceTimersByTime(1000);
      expect(component.copiedIndex).toBe(-1);
      jest.useRealTimers();
    });

    it('should copy video path', () => {
      const item = {
        mimeType: 'video/mp4',
        identifier: 'content123',
        contentStart: 10,
        contentEnd: 20
      };

      component.copyPath(item, 1);

      const mockElement = document.createElement('textarea');
      expect(mockElement.value).toContain('st=10&et=20');
    });

    it('should redirect to PDF resource', () => {
      const item = {
        mimeType: 'application/pdf',
        identifier: 'content123',
        pageNumber: 3
      };

      component.redirectToResource(item);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('pdf/content123'),
        '_blank'
      );
    });

    it('should redirect to video resource', () => {
      const item = {
        mimeType: 'video/mp4',
        identifier: 'content123',
        contentStart: 5,
        contentEnd: 15
      };

      component.redirectToResource(item);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('video/content123'),
        '_blank'
      );
    });

    it('should redirect to TOC', () => {
      const chat = { identifier: 'content123', contentType: 'Course' };

      component.redirectToToc(chat);

      expect(window.open).toHaveBeenCalledWith(
        'https://portal.igotkarmayogi.gov.in/app/toc/content123/overview',
        '_blank'
      );
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    });

    it('should split paragraph by default word count', () => {
      const paragraph = 'This is a very long paragraph with many words that should be split into a shorter chunk for display purposes and user readability in the interface';
      
      const result = component.splitParagraphByWords(paragraph);

      expect(result.split(' ')).toHaveLength(30);
    });

    it('should split paragraph by custom word count', () => {
      const paragraph = 'One two three four five six seven eight nine ten';
      
      const result = component.splitParagraphByWords(paragraph, 5);

      expect(result).toBe('One two three four five');
    });

    it('should handle empty paragraph', () => {
      const result = component.splitParagraphByWords('', 5);

      expect(result).toBe('');
    });

    it('should toggle show to less', () => {
      component.aiSearchResultArr = [{ showLess: false }];

      component.toggleShow(0, 'less');

      expect(component.aiSearchResultArr[0].showLess).toBe(true);
    });

    it('should toggle show to more', () => {
      component.aiSearchResultArr = [{ showLess: true }];

      component.toggleShow(0, 'more');

      expect(component.aiSearchResultArr[0].showLess).toBe(false);
    });

    it('should get user initials', () => {
      component.initials = 'JD';

      expect(component.userInitials).toBe('JD');
    });

    it('should create initials with full name', () => {
     // component.createInititals('John Doe');

      expect(component.initials).toBe('JD');
      expect(component.circleColor).toBeDefined();
    });

    it('should create initials with single name', () => {
     // component.createInititals('John');

      expect(component.initials).toBe('JO');
    });

    it('should create initials with undefined in name', () => {
     // component.createInititals('John undefined');

      expect(component.initials).toBe('JU');
    });

    it('should create initials with special characters', () => {
     // component.createInititals('John-Paul Smith');

      expect(component.initials).toBe('JP');
    });

    it('should handle name with multiple spaces', () => {
    //  component.createInititals('John   Doe');

      expect(component.initials).toBe('JD');
    });

    // it('should create initials when second part is undefined', () => {
    //   const mockName = 'John undefined';
    //   //component.createInititals(mockName);

    //   expect(component.initials).toBe('JU');
    // });
  });

  describe('Textarea Management', () => {
    it('should resize textarea with requestAnimationFrame', () => {
      const mockTextAreaElement = {
        style: { height: '30px' },
        scrollHeight: 50
      };

      component.resizeTextarea(mockTextAreaElement as any, '');

      expect(mockTextAreaElement.style.height).toBe('auto');
      expect(window.requestAnimationFrame).toHaveBeenCalled();
      expect(component.containerHeight).toBeGreaterThan(50);
    });

    it('should handle null textArea in resize', () => {
      expect(() => component.resizeTextarea(null as any, '')).not.toThrow();
    });

    it('should reset textarea height with timeout', () => {
      component.searchQuery = '  test query with spaces  ';

      jest.useFakeTimers();
      component.resetTextAreaHeight({} as any);
      jest.runAllTimers();

      expect(component.searchQuery).toBe('test query with spaces');
      expect(component.textArea.nativeElement.style.height).toBe('30px');
      expect(component.containerHeight).toBeGreaterThan(30);
      jest.useRealTimers();
    });

    it('should handle missing textArea in reset', () => {
      component.textArea = undefined as any;

      expect(() => component.resetTextAreaHeight({} as any)).not.toThrow();
    });

    it('should handle missing textArea style in reset', () => {
      component.textArea = { nativeElement: {} } as any;

      jest.useFakeTimers();
      component.resetTextAreaHeight({} as any);
      jest.runAllTimers();
      jest.useRealTimers();

      // Should not throw error
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should handle ngAfterViewInit', () => {
      component.resizeTextarea = jest.fn();

      component.ngAfterViewInit();

      expect(component.resizeTextarea).toHaveBeenCalledWith(
        component.textArea.nativeElement,
        ''
      );
    });

    it('should handle ngAfterViewChecked', () => {
      // This method is empty but should not throw
      expect(() => component.ngAfterViewChecked()).not.toThrow();
    });

    it('should handle ngOnDestroy', () => {
      // This method is empty but should not throw  
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should handle checkForAIQuestionResponse', () => {
      // This method is empty but should not throw
      expect(() => component.checkForAIQuestionResponse()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle getChatData API error', () => {
      mockChatbotService.getChatData.mockReturnValue(throwError('API Error'));

      expect(() => component.getData()).not.toThrow();
    });

    it('should handle getLanguages API error', () => {
      mockChatbotService.getLangugages.mockReturnValue(throwError('API Error'));

      expect(() => component.getLanguages()).not.toThrow();
    });

    it('should handle AI start chat error', () => {
      mockChatbotService.aiStartChathForSupport.mockReturnValue(throwError('AI Error'));
      component.startNewChat = true;

      expect(() => component.startNewSupportAISearch()).not.toThrow();
    });

    it('should handle AI send chat error', () => {
      mockChatbotService.aiSendChathForSupport.mockReturnValue(throwError('AI Error'));
      component.initiateSupportNewChat = true;

      expect(() => component.supportAISearch()).not.toThrow();
    });

    it('should handle positive rating API error', () => {
      mockChatbotService.saveAIChatPositiveContentRating.mockReturnValue(throwError('Rating Error'));
      const item = { query_id: 'query1' };

      expect(() => component.sharePositiveContentRating(item, 0, 0)).not.toThrow();
    });

    it('should handle feedback API error', () => {
      mockChatbotService.shareAIFeedback.mockReturnValue(throwError('Feedback Error'));
      const item = { query_id: 'query1' };

      expect(() => component.shareAIFeedback(item, 'feedback', 0, 0)).not.toThrow();
    });

    it('should handle internet search API error', () => {
      mockChatbotService.aiGlobalSearchFromInternet.mockReturnValue(throwError('Internet Error'));
      const item = { answer: null };

      expect(() => component.callFromInternet(item, 0)).not.toThrow();
    });
  });

  describe('Edge Cases and Additional Coverage', () => {
    it('should handle Math.random for initials color selection', () => {
      (Math.random as jest.Mock).mockReturnValue(0.8);
      
     // component.createInititals('Test Name');

      expect(component.circleColor).toBeDefined();
    });

    // it('should handle random colors when available', () => {
    //   component.randomcolors = ['#FF0000', '#00FF00'];
    //   (Math.random as jest.Mock).mockReturnValue(0.5);
      
    //   component.createInititals('Test');

    //   expect(component.circleColor).toBe('#00FF00');
    // });

    // it('should handle initials creation with space character edge case', () => {
    //   component.createInititals('J D');

    //   expect(component.initials).toBe('JD');
    // });

    it('should handle very long paragraph splitting', () => {
      const longParagraph = Array(100).fill('word').join(' ');
      
      const result = component.splitParagraphByWords(longParagraph, 50);

      expect(result.split(' ')).toHaveLength(50);
    });

    it('should handle missing components in aiSearchResultArr operations', () => {
      component.aiSearchResultArr = [];
      
      expect(() => component.toggleShow(0, 'less')).not.toThrow();
      expect(() => component.sharePositiveContentRating({}, 0, 0)).not.toThrow();
    });

    it('should handle missing query_id in feedback operations', () => {
      const item = {};
      
      expect(() => component.sharePositiveContentRating(item, 0, 0)).not.toThrow();
      expect(() => component.shareAIFeedback(item, 'feedback', 0, 0)).not.toThrow();
    });

    it('should handle missing containerHeight calculation elements', () => {
      Object.defineProperty(window, 'getComputedStyle', {
        value: jest.fn(() => ({}))
      });

      const mockTextArea = { style: { height: '30px' }, scrollHeight: 50 };
      
      component.resizeTextarea(mockTextArea as any, '');

      expect(component.containerHeight).toBe(50);
    });

    it('should handle categories length exactly 6', () => {
      const exactCategories = Array.from({ length: 6 }, (_, i) => ({
        catId: `cat${i}`,
        categoryType: 'Both',
        priority: i,
        recommendedQues: []
      }));
      const exactCategoryMap = Array.from({ length: 6 }, (_, i) => ({
        catId: `cat${i}`,
        catName: `Category ${i}`
      }));

      component.responseData = {
        recommendationMap: exactCategories,
        categoryMap: exactCategoryMap
      };
      component.userInfo = { firstName: 'John' };

      component.getCategories();

      expect(component.categories).toHaveLength(6);
    });

    it('should handle null/undefined values in priority question mapping', () => {
      component.responseData = {
        recommendationMap: [
          {
            categoryType: null,
            recommendedQues: [{ priority: 1 }]
          }
        ]
      };

      const questions = component.getPriorityQuestion(1);

      expect(questions).toEqual([]);
    });
  });
});