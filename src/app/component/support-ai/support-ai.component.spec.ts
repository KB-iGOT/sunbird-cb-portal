import { SupportAIComponent } from './support-ai.component';
import { NavigationEnd } from '@angular/router';
import { of, Subject } from 'rxjs';

// Optimize mocks to prevent memory leaks
const createMockRouter = () => ({
  events: new Subject()
});

const createMockConfigService = () => ({
  userProfile: {
    firstName: 'John',
    lastName: 'Doe',
    profileImageUrl: 'test-image.jpg',
    professionalDetails: [{ designation: 'Developer' }],
    departmentName: 'IT'
  }
});

const createMockEventService = () => ({
  dispatchChatbotEvent: jest.fn()
});

const createMockRootService = () => ({
  getChatData: jest.fn(),
  getLangugages: jest.fn(),
  aiStartChathForSupport: jest.fn(),
  aiSendChathForSupport: jest.fn(),
  saveAIChatPositiveContentRating: jest.fn(),
  shareAIFeedback: jest.fn(),
  aiGlobalSearchFromInternet: jest.fn()
});

const createMockDialog = () => ({
  open: jest.fn()
});

const createMockSnackBar = () => ({
  open: jest.fn()
});

const createMockRenderer = () => ({
  addClass: jest.fn(),
  removeClass: jest.fn()
});

const createMockElementRef = () => ({
  nativeElement: {
    scrollTop: 0,
    scrollHeight: 100,
    style: { height: 'auto' }
  }
});

// Minimal mock data to reduce memory usage
const createMockFaqData = () => ({
  quesMap: [{ quesId: '1', quesValue: 'Test question', ansVal: 'Test answer' }],
  recommendationMap: [{ catId: 'cat1', categoryType: 'Both', priority: 1, recommendedQues: [{ quesID: '1', priority: 1 }] }],
  categoryMap: [{ catId: 'cat1', catName: 'Test Category' }]
});

// Setup global mocks once
const setupGlobalMocks = () => {
  // Object.defineProperty(global, 'window', {
  //   value: {
  //     scrollTo: jest.fn(),
  //     localStorage: {
  //       getItem: jest.fn(),
  //       setItem: jest.fn(),
  //       removeItem: jest.fn()
  //     },
  //     getComputedStyle: jest.fn(() => ({ paddingTop: '5px', paddingBottom: '5px' })),
  //     requestAnimationFrame: jest.fn((callback) => callback())
  //   },
  //   writable: true
  // });

  // Object.defineProperty(global, 'document', {
  //   value: {
  //     body: { scrollHeight: 1000, appendChild: jest.fn(), removeChild: jest.fn() },
  //     createElement: jest.fn(() => ({
  //       style: {},
  //       value: '',
  //       focus: jest.fn(),
  //       select: jest.fn()
  //     })),
  //     execCommand: jest.fn()
  //   },
  //   writable: true
  // });
};

describe('SupportAIComponent', () => {
  let component: SupportAIComponent;
  let mockRouter: any;
  let mockConfigService: any;
  let mockEventService: any;
  let mockRootService: any;
  let mockDialog: any;
  let mockSnackBar: any;
  let mockRenderer: any;

  beforeAll(() => {
    setupGlobalMocks();
  });

  beforeEach(() => {
    // Create fresh mocks for each test
    mockRouter = createMockRouter();
    mockConfigService = createMockConfigService();
    mockEventService = createMockEventService();
    mockRootService = createMockRootService();
    mockDialog = createMockDialog();
    mockSnackBar = createMockSnackBar();
    mockRenderer = createMockRenderer();

    // Setup localStorage mock
    // (global.window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
    //   const mockData = {
    //     'selectedLanguage': 'en',
    //     'faq': JSON.stringify({ en: { information: createMockFaqData(), issue: createMockFaqData() } }),
    //     'faq-languages': JSON.stringify([{ code: 'en', name: 'English' }])
    //   };
    //   return mockData[key] || null;
    // });

    // Create component
    component = new SupportAIComponent(
      mockConfigService,
      mockEventService,
      mockRenderer,
      mockRootService,
      mockDialog,
      mockSnackBar,
      mockRouter
    );

    // Setup component properties
    component.myScrollContainer = createMockElementRef() as any;
    component.textArea = createMockElementRef() as any;
  });

  afterEach(() => {
    // Clean up to prevent memory leaks
    jest.clearAllMocks();
    component = null as any;
    mockRouter.events.complete();
  });

  describe('Component Initialization', () => {
    test('should initialize with default values', () => {
      expect(component.showIcon).toBe(true);
      expect(component.currentFilter).toBe('information');
      expect(component.selectedLaguage).toBe('en');
    });

    test('should setup router subscription in ngOnInit', () => {
      component.ngOnInit();
      
      const navigationEnd = new NavigationEnd(1, '/test', '/test');
      mockRouter.events.next(navigationEnd);
      
      expect(component.userInfo).toBe(mockConfigService.userProfile);
      expect(component.isHubEnable).toBe(true);
    });

    test('should handle certs page navigation', () => {
      component.ngOnInit();
      
      const navigationEnd = new NavigationEnd(1, '/certs', '/certs');
      mockRouter.events.next(navigationEnd);
      
      expect(component.isHubEnable).toBe(false);
    });
  });

  describe('Language Functions', () => {
    test('should return correct greeting', () => {
      component.selectedLaguage = 'en';
      expect(component.greetings()).toBe('Namaste');
      
      component.selectedLaguage = 'hi';
      expect(component.greetings()).toBe('नमस्ते');
    });

    test('should handle language selection', () => {
      const event = { target: { value: 'hi' } };
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => {});
      
      component.selectLaguage(event);
      
      expect(component.selectedLaguage).toBe('hi');
     // expect(global.window.localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'hi');
    });
  });

  describe('Data Management', () => {
    test('should fetch data from service', () => {
      const mockResponse = { payload: { config: createMockFaqData() } };
      mockRootService.getChatData.mockReturnValue(of(mockResponse));
      jest.spyOn(component, 'setDataToLocalStorage').mockImplementation(() => {});
      
      component.getData();
      
      expect(mockRootService.getChatData).toHaveBeenCalled();
    });

    test('should handle languages API call', () => {
      const mockLanguages = { status: { code: 200 }, payload: { languages: [] } };
      mockRootService.getLangugages.mockReturnValue(of(mockLanguages));
      jest.spyOn(component, 'getData').mockImplementation(() => {});
      
      component.getLanguages();
      
      expect(mockRootService.getLangugages).toHaveBeenCalled();
    });
  });

  describe('Chat Operations', () => {
    test('should handle icon click start', () => {
      jest.spyOn(component as any, 'disableScroll').mockImplementation(() => {});
      jest.spyOn(component, 'raiseChatStartTelemetry').mockImplementation(() => {});
      
      component.iconClick('start');
      
      expect(component.showIcon).toBe(false);
    });

    test('should handle icon click end', () => {
      jest.spyOn(component as any, 'enableScroll').mockImplementation(() => {});
      jest.spyOn(component, 'raiseChatEndTelemetry').mockImplementation(() => {});
      jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => {});
      
      component.iconClick('end');
      
      expect(component.showIcon).toBe(false);
    });

    test('should submit search query', () => {
      const mockTextArea = { style: { height: '30px' } };
      const mockEvent = { preventDefault: jest.fn() };
      component.searchQuery = 'test query';
      jest.spyOn(component, 'supportAISearch').mockImplementation(() => {});
      jest.spyOn(component, 'resetTextAreaHeight').mockImplementation(() => {});
      
      component.submitSearchQuery(mockTextArea as any, mockEvent);
      
      expect(component.aiSearchResultArr.some((item:any) => 
        item.type === 'sendMsg' && item.question === 'test query'
      )).toBe(true);
    });
  });

  describe('AI Search Functions', () => {
    test('should start new support AI search', () => {
      component.startNewChat = true;
      component.userId = 'user123';
      component.cloneSearchQuery = 'test query';
      component.activeLaguage = 'en';
      
      mockRootService.aiStartChathForSupport.mockReturnValue(of({ message: 'success' }));
      
      component.startNewSupportAISearch();
      
      expect(mockRootService.aiStartChathForSupport).toHaveBeenCalled();
      expect(component.initiateSupportNewChat).toBe(true);
    });

    test('should handle positive content rating', () => {
      const mockItem = { query_id: 'query123' };
      mockRootService.saveAIChatPositiveContentRating.mockReturnValue(of({ status: 'success' }));
      
      component.sharePositiveContentRating(mockItem, 0, 0);
      
      expect(mockRootService.saveAIChatPositiveContentRating).toHaveBeenCalled();
    });
  });

  describe('Helper Functions', () => {
    test('should create user initials', () => {
      (component as any).createInititals('John Doe');
      
      expect(component.initials).toBe('JD');
      expect(component.circleColor).toBeDefined();
    });

    test('should split paragraph by words', () => {
      const paragraph = 'This is a test paragraph with multiple words';
      const result = component.splitParagraphByWords(paragraph, 5);
      const words = result.split(' ');
      
      expect(words.length).toBe(5);
    });

    test('should toggle show state', () => {
      component.aiSearchResultArr = [{ showLess: true }];
      
      component.toggleShow(0, 'more');
      expect(component.aiSearchResultArr[0].showLess).toBe(false);
    });
  });

  describe('Question Handling', () => {
    test('should select question', () => {
      component.responseData = createMockFaqData();
      component.getQns();
      
      const question = { quesID: '1', recommendedQues: [] };
      const data = { selectedValue: '' };
      jest.spyOn(component, 'pushData').mockImplementation(() => {});
      jest.spyOn(component, 'raiseTemeletyInterat').mockImplementation(() => {});
      
      component.selectedQuestion(question, data);
      
      expect(data.selectedValue).toBe('1');
    });

    test('should get priority questions', () => {
      component.responseData = createMockFaqData();
      component.userInfo = mockConfigService.userProfile;
      
      const result = component.getPriorityQuestion(1);
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Telemetry', () => {
    test('should raise chat start telemetry', () => {
      component.raiseChatStartTelemetry();
      
      expect(mockEventService.dispatchChatbotEvent).toHaveBeenCalled();
    });

    test('should raise interaction telemetry', () => {
      component.raiseTemeletyInterat('test-id');
      
      expect(mockEventService.dispatchChatbotEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            edata: expect.objectContaining({ id: 'test-id' })
          })
        })
      );
    });
  });

  describe('Lifecycle', () => {
    test('should handle ngOnChanges', () => {
      jest.spyOn(component, 'startNewSupportAISearch').mockImplementation(() => {});
      
      const changes = {
        chatId: {
          previousValue: 'old-id',
          currentValue: 'new-id',
          firstChange: false,
          isFirstChange: () => false
        }
      };

      component.ngOnChanges(changes);

      expect(component.startNewChat).toBe(true);
    });

    test('should handle ngAfterViewInit', () => {
      jest.spyOn(component, 'resizeTextarea').mockImplementation(() => {});
      
      component.ngAfterViewInit();
      
      expect(component.resizeTextarea).toHaveBeenCalled();
    });

    test('should handle ngOnDestroy', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});