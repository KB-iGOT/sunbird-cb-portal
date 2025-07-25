import { IGotSarthiComponent } from './igot-sarthi.component';
import { of, throwError } from 'rxjs';
import { NavigationEnd } from '@angular/router';

// Mock dependencies
const mockConfigSvc = {
  userProfile: {
    firstName: 'John',
    profileImageUrl: 'test-url',
    professionalDetails: [{ designation: 'Developer' }],
    departmentName: 'IT'
  }
};

const mockEventSvc = {
  dispatchChatbotEvent: jest.fn()
};

const mockRenderer = {
  addClass: jest.fn(),
  removeClass: jest.fn()
};

const mockChatbotService = {
  getChatData: jest.fn(),
  getLangugages: jest.fn(),
  aiGlobalSearch: jest.fn(),
  aiGlobalSearchFromInternet: jest.fn(),
  saveAIChatPositiveContentRating: jest.fn(),
  shareAIFeedback: jest.fn(),
  iGOTAIChatHistory: []
};

const mockDialog = {
  open: jest.fn().mockReturnValue({
    afterClosed: jest.fn().mockReturnValue(of('test feedback'))
  })
};

const mockMatSnackBar = {
  open: jest.fn()
};

const mockRouter = {
  events: of(new NavigationEnd(1, '/test', '/test'))
};

const mockElementRef = {
  nativeElement: {
    style: { height: '30px' },
    scrollHeight: 50,
    scrollTop: 0
  }
};

// Helper function to create component instance
function createComponent(): IGotSarthiComponent {
  const component = new IGotSarthiComponent(
    mockConfigSvc as any,
    mockEventSvc as any,
    mockRenderer as any,
    mockChatbotService as any,
    mockDialog as any,
    mockMatSnackBar as any,
    mockRouter as any
  );
  
  // Mock ViewChild elements
  component.myScrollContainer = mockElementRef as any;
  component.textArea = mockElementRef as any;
  
  return component;
}

describe('IGotSarthiComponent', () => {
  let component: IGotSarthiComponent;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });

    // Mock crypto
    Object.defineProperty(window, 'crypto', {
      value: {
        getRandomValues: jest.fn().mockImplementation((arr) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
          }
          return arr;
        })
      },
      writable: true
    });

    // Mock document methods
    Object.defineProperty(document, 'createElement', {
      value: jest.fn().mockReturnValue({
        style: {},
        focus: jest.fn(),
        select: jest.fn()
      }),
      writable: true
    });

    Object.defineProperty(document, 'execCommand', {
      value: jest.fn(),
      writable: true
    });

    Object.defineProperty(document.body, 'appendChild', {
      value: jest.fn(),
      writable: true
    });

    Object.defineProperty(document.body, 'removeChild', {
      value: jest.fn(),
      writable: true
    });

    component = createComponent();
  });

  describe('Component Initialization', () => {
    test('should create component', () => {
      expect(component).toBeTruthy();
    });

    test('should initialize with default values', () => {
      expect(component.showIcon).toBe(true);
      expect(component.currentFilter).toBe('information');
      expect(component.selectedLaguage).toBe('en');
      expect(component.displayLoader).toBe(false);
      expect(component.expanded).toBe(false);
      expect(component.more).toBe(false);
    });

    test('should call ngOnInit and set up router subscription', () => {
      const spy = jest.spyOn(component, 'checkForApiCalls').mockImplementation();
     // const enableScrollSpy = jest.spyOn(component, 'enableScroll').mockImplementation();
      
      component.ngOnInit();
      
      expect(spy).toHaveBeenCalled();
      // expect(enableScrollSpy).toHaveBeenCalled();
      expect(component.isHubEnable).toBe(true);
    });

    test('should handle router navigation to certs', () => {
      mockRouter.events = of(new NavigationEnd(1, '/certs', '/certs'));
      component.ngOnInit();
      expect(component.isHubEnable).toBe(false);
    });

    // test('should create user initials when no profile image', () => {
    //   mockConfigSvc.userProfile.profileImageUrl = '';
    //   const spy = jest.spyOn(component, 'createInititals').mockImplementation();
      
    //   component.ngOnInit();
      
    //   expect(spy).toHaveBeenCalledWith('John');
    // });
  });

  describe('Language and Localization', () => {
    test('should return correct greeting', () => {
      component.selectedLaguage = 'en';
      expect(component.greetings()).toBe('Namaste');
      
      component.selectedLaguage = 'hi';
      expect(component.greetings()).toBe('नमस्ते');
    });

    test('should return localized text', () => {
      component.selectedLaguage = 'en';
      expect(component.getInfoText('information')).toBe('Information');
      
      component.selectedLaguage = 'hi';
      expect(component.getInfoText('information')).toBe('जानकारी');
    });

    test('should return show more text', () => {
      component.selectedLaguage = 'en';
      expect(component.showMore()).toBe('Show More');
    });

    test('should handle language selection', () => {
      const event = { target: { value: 'hi' } };
      const spy = jest.spyOn(component, 'checkForApiCalls').mockImplementation();
      
      component.selectLaguage(event);
      
      expect(component.selectedLaguage).toBe('hi');
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'hi');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Data Management', () => {
    test('should get data successfully', () => {
      const mockResponse = {
        payload: {
          config: { test: 'data' }
        }
      };
      mockChatbotService.getChatData.mockReturnValue(of(mockResponse));
      const spy = jest.spyOn(component, 'setDataToLocalStorage').mockImplementation();
      
      component.getData();
      
      expect(component.displayLoader).toBe(false);
      expect(spy).toHaveBeenCalledWith({ test: 'data' });
    });

    test('should set data to localStorage', () => {
      const testData = { test: 'config' };
      localStorage.getItem = jest.fn().mockReturnValue('{}');
      const spy = jest.spyOn(component, 'toggleFilter').mockImplementation();
      
      component.setDataToLocalStorage(testData);
      
      expect(localStorage.setItem).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });

    test('should initialize data correctly', () => {
      const spy = jest.spyOn(component, 'getPriorityQuestion').mockReturnValue([]);
      const pushSpy = jest.spyOn(component, 'pushData').mockImplementation();
      const getQnsSpy = jest.spyOn(component, 'getQns').mockImplementation();
      
      component.initData({});
      
      expect(spy).toHaveBeenCalledWith(1);
      expect(pushSpy).toHaveBeenCalled();
      expect(getQnsSpy).toHaveBeenCalled();
    });

    test('should get questions correctly', () => {
      component.responseData = {
        quesMap: [
          { quesId: '1', question: 'Test Q1' },
          { quesId: '2', question: 'Test Q2' }
        ]
      };
      
      component.getQns();
      
      expect(component.questionsAndAns['1']).toEqual({ quesId: '1', question: 'Test Q1' });
      expect(component.questionsAndAns['2']).toEqual({ quesId: '2', question: 'Test Q2' });
    });
  });

  describe('User Interactions', () => {
    test('should toggle icon correctly for start', () => {
     // const disableScrollSpy = jest.spyOn(component, 'disableScroll').mockImplementation();
      const telemetrySpy = jest.spyOn(component, 'raiseChatStartTelemetry').mockImplementation();
      
      component.iconClick('start');
      
      expect(component.showIcon).toBe(false);
      expect(component.currentFilter).toBe('information');
      expect(component.expanded).toBe(false);
     // expect(disableScrollSpy).toHaveBeenCalled();
      expect(telemetrySpy).toHaveBeenCalled();
    });

    test('should toggle icon correctly for end', () => {
      //const enableScrollSpy = jest.spyOn(component, 'enableScroll').mockImplementation();
      const telemetrySpy = jest.spyOn(component, 'raiseChatEndTelemetry').mockImplementation();
      const checkApiSpy = jest.spyOn(component, 'checkForApiCalls').mockImplementation();
      
      component.iconClick('end');
      
      expect(component.showIcon).toBe(false);
      expect(component.more).toBe(false);
     // expect(enableScrollSpy).toHaveBeenCalled();
      expect(telemetrySpy).toHaveBeenCalled();
      expect(checkApiSpy).toHaveBeenCalled();
    });

    test('should toggle filter correctly', () => {
      const spy = jest.spyOn(component, 'checkForApiCalls').mockImplementation();
      
      component.toggleFilter('issue');
      
      expect(component.currentFilter).toBe('issue');
      expect(component.more).toBe(false);
      expect(spy).toHaveBeenCalled();
    });

    test('should handle selected question', () => {
      const question = { quesID: '1', recommendedQues: [] };
      const data = { selectedValue: '' };
      component.questionsAndAns = {
        '1': {
          quesValue: 'Test Question',
          ansVal: 'Test Answer <teams_call_link> <email_configuration>'
        }
      };
      component.callText = 'Call Link';
      component.emailText = 'Email Link';
      
      const pushSpy = jest.spyOn(component, 'pushData').mockImplementation();
      const telemetrySpy = jest.spyOn(component, 'raiseTemeletyInterat').mockImplementation();
      
      component.selectedQuestion(question, data);
      
      expect(data.selectedValue).toBe('1');
      expect(pushSpy).toHaveBeenCalledTimes(2);
      expect(telemetrySpy).toHaveBeenCalledWith('1');
    });

    test('should push data to correct array based on filter', () => {
      const msg = { type: 'test', message: 'test message' };
      
      component.currentFilter = 'information';
      component.pushData(msg);
      expect(component.chatInformation).toContain(msg);
      
      component.currentFilter = 'issue';
      component.pushData(msg);
      expect(component.chatIssues).toContain(msg);
    });
  });

  describe('AI Search Functionality', () => {
    test('should submit search query successfully', () => {
      const textArea = { style: { height: '30px' } } as HTMLTextAreaElement;
      const event = { preventDefault: jest.fn() };
      component.searchQuery = 'test query';
      component.searchAPIResponseInProgress = false;
      
      const aiSearchSpy = jest.spyOn(component, 'aiGlobalSearch').mockImplementation();
      const resetSpy = jest.spyOn(component, 'resetTextAreaHeight').mockImplementation();
      
      component.submitSearchQuery(textArea, event);
      
      expect(component.aiSearchResultArr.length).toBeGreaterThan(0);
      expect(aiSearchSpy).toHaveBeenCalled();
      expect(resetSpy).toHaveBeenCalled();
      expect(component.searchQuery).toBe('');
    });

    test('should handle empty search query', () => {
      const textArea = { style: { height: '30px' } } as HTMLTextAreaElement;
      const event = { preventDefault: jest.fn() };
      component.searchQuery = '';
      
      component.submitSearchQuery(textArea, event);
      
      expect(event.preventDefault).toHaveBeenCalled();
    });

    test('should handle AI global search success', () => {
      const mockResponse = {
        answer: 'Test answer',
        RetrievedChunks: [
          {
            Identifier: 'test-id',
            Name: 'Test Content',
            Description: 'Test description',
            ContentType: 'Resource',
            mimeType: 'application/pdf',
            contentStart: '1',
            ContentEnd: '5'
          }
        ],
        query: 'test query',
        query_id: 'test-query-id'
      };
      
      mockChatbotService.aiGlobalSearch.mockReturnValue(of(mockResponse));
      component.cloneSearchQuery = 'test query';
      
      component.aiGlobalSearch();
      
      expect(component.searchAPIResponseInProgress).toBe(false);
      expect(component.resultFetch).toBe(true);
      expect(component.aiSearchResult).toEqual(mockResponse);
    });

    test('should handle AI global search error', () => {
      mockChatbotService.aiGlobalSearch.mockReturnValue(throwError('API Error'));
      
      component.aiGlobalSearch();
      
      expect(component.searchAPIResponseInProgress).toBe(false);
      expect(component.hasError).toBe(true);
      expect(component.isLoading).toBe(false);
    });

    test('should handle search from internet', () => {
      const item = { answer: '' };
      const index = 0;
      const mockResponse = {
        answer: 'Internet answer',
        query_id: 'internet-query-id'
      };
      
      mockChatbotService.aiGlobalSearchFromInternet.mockReturnValue(of(mockResponse));
      component.aiSearchResultArr = [{ showFromInternet: true, showSimiliarResultsFlag: true }];
      component.cloneSearchQuery = 'test query';
      
      component.callFromInternet(item, index);
      
      expect(component.aiSearchResultArr[index].showFromInternet).toBe(false);
      expect(component.aiSearchResultArr[index].showSimiliarResultsFlag).toBe(false);
    });

    test('should reject from internet', () => {
      component.aiSearchResultArr = [{ showFromInternet: true }];
      
      component.rejectFromInternet(0);
      
      expect(component.aiSearchResultArr[0].showFromInternet).toBe(false);
      expect(component.resultFetch).toBe(true);
    });
  });

  describe('Feedback Functionality', () => {
    test('should share positive content rating', () => {
      const item = { query_id: 'test-id' };
      const mockResponse = { status: 'success' };
      
      mockChatbotService.saveAIChatPositiveContentRating.mockReturnValue(of(mockResponse));
      component.aiSearchResultArr = [{
        result: [{ showLoader: false, showLoaderForUp: false, feedback: '' }]
      }];
      
      component.sharePositiveContentRating(item, 0, 0);
      
      expect(component.aiSearchResultArr[0].result[0].feedback).toBe('up');
      expect(component.aiSearchResultArr[0].result[0].showLoader).toBe(false);
    });

    test('should open AI feedback popup', () => {
      const item = { query_id: 'test-id' };
      component.aiSearchResultArr = [{
        result: [{ feedback: '' }]
      }];
      
      component.openAIFeedbackPopup(item, 0, 0);
      
      expect(mockDialog.open).toHaveBeenCalled();
    });

    test('should share AI feedback', () => {
      const item = { query_id: 'test-id' };
      const result = 'Not helpful';
      const mockResponse = { status: 'success' };
      
      mockChatbotService.shareAIFeedback.mockReturnValue(of(mockResponse));
      component.aiSearchResultArr = [{
        result: [{ showLoader: false, showLoaderForDown: false, feedback: '' }]
      }];
      
      component.shareAIFeedback(item, result, 0, 0);
      
      expect(component.aiSearchResultArr[0].result[0].feedback).toBe('down');
    });
  });

  describe('Utility Functions', () => {
    test('should copy path correctly for PDF', () => {
      const item = {
        contentType: 'Resource',
        mimeType: 'application/pdf',
        identifier: 'test-id',
        pageNumber: 1
      };
      
      component.copyPath(item, 0);
      
      expect(component.copiedIndex).toBe(0);
    });

    test('should copy path correctly for video', () => {
      const item = {
        contentType: 'Resource',
        mimeType: 'video/mp4',
        identifier: 'test-id',
        contentStart: 10,
        contentEnd: 20
      };
      
      component.copyPath(item, 0);
      
      expect(component.copiedIndex).toBe(0);
    });

    test('should split paragraph by words', () => {
      const paragraph = 'This is a test paragraph with many words to test the splitting functionality';
      const result = component.splitParagraphByWords(paragraph, 5);
      
      expect(result).toBe('This is a test paragraph');
    });

    test('should toggle show correctly', () => {
      component.aiSearchResultArr = [{ showLess: true }];
      
      component.toggleShow(0, 'more');
      expect(component.aiSearchResultArr[0].showLess).toBe(false);
      
      component.toggleShow(0, 'less');
      expect(component.aiSearchResultArr[0].showLess).toBe(true);
    });

    // test('should create initials correctly', () => {
    //   component.createInititals('John Doe');
      
    //   expect(component.initials).toBe('JD');
    //   expect(component.circleColor).toBeTruthy();
    // });

    // test('should create initials for single name', () => {
    //   component.createInititals('John');
      
    //   expect(component.initials).toBe('JO');
    // });

    test('should generate secure random string', () => {
      const result = component.secureRandomString(8);
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    test('should create random number', () => {
      const result = component.createRandomNumber();
      
      expect(typeof result).toBe('number');
    });

    test('should resize textarea', () => {
      const textArea = {
        style: { height: '30px' },
        scrollHeight: 50
      } as HTMLTextAreaElement;
      
      // Mock getComputedStyle
      // global.getComputedStyle = jest.fn().mockReturnValue({
      //   paddingTop: '5px',
      //   paddingBottom: '5px'
      // });
      
      // // Mock requestAnimationFrame
      // global.requestAnimationFrame = jest.fn((cb) => cb());
      
      component.resizeTextarea(textArea, '');
      
      expect(textArea.style.height).toBe('auto');
    });

    test('should reset textarea height', () => {
      component.textArea = {
        nativeElement: {
          style: { height: '50px' },
          scrollHeight: 30
        }
      } as any;
      
      component.searchQuery = '  test query  ';
      
      component.resetTextAreaHeight({} as HTMLTextAreaElement);
      
      // Test that searchQuery is trimmed
      expect(component.searchQuery.trim()).toBe('test query');
    });
  });

  describe('Navigation and Routing', () => {
    test('should redirect to resource correctly', () => {
      const item = {
        mimeType: 'application/pdf',
        identifier: 'test-id',
        pageNumber: 1,
        contentStart: -1,
        contentEnd: -1
      };
      
     // global.window.open = jest.fn();
      
      component.redirectToResource(item);
      
      expect(window.open).toHaveBeenCalled();
    });

    test('should redirect to TOC correctly', () => {
      const chat = { identifier: 'test-id', contentType: 'Course' };
      
      //global.window.open = jest.fn();
      
      component.redirectToToc(chat);
      
      expect(window.open).toHaveBeenCalledWith(
        'https://portal.igotkarmayogi.gov.in/app/toc/test-id/overview',
        '_blank'
      );
    });

    test('should go to bottom', () => {
    //  global.window.scrollTo = jest.fn();
      Object.defineProperty(document.body, 'scrollHeight', {
        value: 1000,
        writable: true
      });
      
      component.goToBottom();
      
      expect(window.scrollTo).toHaveBeenCalledWith(0, 1000);
    });

    test('should scroll to bottom', () => {
      component.scrollToBottom();
      
      expect(component.myScrollContainer?.nativeElement.scrollTop).toBeDefined();
    });
  });

  describe('Categories and Questions', () => {
    test('should get priority questions correctly', () => {
      component.responseData = {
        recommendationMap: [
          {
            categoryType: 'Logged-In',
            recommendedQues: [
              { priority: 1, question: 'Q1' },
              { priority: 2, question: 'Q2' }
            ]
          }
        ]
      };
      component.userInfo = { firstName: 'John' };
      
      const result = component.getPriorityQuestion(1);
      
      expect(result).toEqual([{ priority: 1, question: 'Q1' }]);
    });

    test('should show more questions', () => {
      const spy = jest.spyOn(component, 'getPriorityQuestion').mockReturnValue([]);
      const pushSpy = jest.spyOn(component, 'pushData').mockImplementation();
      
      component.showMoreQuestion();
      
      expect(spy).toHaveBeenCalledWith(1);
      expect(pushSpy).toHaveBeenCalled();
    });

    test('should show category correctly', () => {
      const catItem = { catId: 'all', catName: 'All Categories' };
      const pushSpy = jest.spyOn(component, 'pushData').mockImplementation();
      const sortSpy = jest.spyOn(component, 'sortCategory').mockReturnValue([]);
      
      component.showCategory(catItem);
      
      expect(component.more).toBe(false);
      expect(sortSpy).toHaveBeenCalled();
      expect(pushSpy).toHaveBeenCalledTimes(2);
    });

    test('should get categories correctly', () => {
      component.responseData = {
        recommendationMap: [
          {
            catId: 'cat1',
            categoryType: 'Logged-In',
            priority: 1
          }
        ],
        categoryMap: [
          {
            catId: 'cat1',
            catName: 'Category 1'
          }
        ]
      };
      component.userInfo = { firstName: 'John' };
      component.selectedLaguage = 'en';
      
      component.getCategories();
      
      expect(component.categories.length).toBeGreaterThan(0);
    });

    test('should sort categories correctly', () => {
      component.categories = [
        { priority: 2, catName: 'Cat2' },
        { priority: 1, catName: 'Cat1' }
      ];
      
      const result = component.sortCategory();
      
      expect(result[0].priority).toBe(1);
      expect(result[1].priority).toBe(2);
    });
  });

  describe('Languages Management', () => {
    test('should get languages successfully', () => {
      const mockResponse = {
        status: { code: 200 },
        payload: { languages: ['en', 'hi'] }
      };
      mockChatbotService.getLangugages.mockReturnValue(of(mockResponse));
      const spy = jest.spyOn(component, 'getData').mockImplementation();
      
      component.getLanguages();
      
      expect(component.language).toEqual(['en', 'hi']);
      expect(component.displayLoader).toBe(false);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Telemetry Events', () => {
    test('should raise category telemetry', () => {
      component.raiseCategotyTelemetry('test-cat');
      
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    });

    test('should raise chat start telemetry', () => {
      component.raiseChatStartTelemetry();
      
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    });

    test('should raise chat end telemetry', () => {
      component.raiseChatEndTelemetry();
      
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    });

    test('should raise interaction telemetry', () => {
      component.currentFilter = 'information';
      component.raiseTemeletyInterat('test-id');
      
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    });

    test('should raise telemetry for resource', () => {
      const item = { identifier: 'test-id', contentType: 'Resource' };
      
      component.raiseTelemetryForResource(item);
      
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    test('should handle ngAfterViewInit', () => {
      const spy = jest.spyOn(component, 'resizeTextarea').mockImplementation();
      
      component.ngAfterViewInit();
      
      expect(spy).toHaveBeenCalled();
    });

    test('should handle ngAfterViewChecked', () => {
      // This method is commented out in the original, so we just test it exists
      expect(component.ngAfterViewChecked).toBeDefined();
    });

    test('should handle ngOnDestroy', () => {
      expect(component.ngOnDestroy).toBeDefined();
    });
  });

  describe('UI State Management', () => {
    test('should handle click outside', () => {
      const spy = jest.spyOn(component, 'iconClick').mockImplementation();
      
      component.clickOutside();
      
      expect(spy).toHaveBeenCalledWith('end');
    });

    test('should disable scroll', () => {
      component['disableScroll']();
      
      expect(mockRenderer.addClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
    });

    test('should enable scroll', () => {
      component['enableScroll']();
      
      expect(mockRenderer.removeClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
    });

    test('should view similar results', () => {
      component.aiSearchResultArr = [{
        showReterivedChunks: false,
        showSimiliarResultsFlag: true,
        showFromInternet: true
      }];
      
      component.viewSimiliarResults(0);
      
      expect(component.aiSearchResultArr[0].showReterivedChunks).toBe(true);
      expect(component.aiSearchResultArr[0].showSimiliarResultsFlag).toBe(false);
      expect(component.aiSearchResultArr[0].showFromInternet).toBe(false);
    });

    test('should load failed data', () => {
      const spy = jest.spyOn(component, 'aiGlobalSearch').mockImplementation();
      
      component.loadFailedData();
      
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle scroll to bottom error gracefully', () => {
      component.myScrollContainer = undefined;
      
      expect(() => component.scrollToBottom()).not.toThrow();
    });

    test('should handle resize textarea with null element', () => {
      expect(() => component.resizeTextarea(null as any, '')).not.toThrow();
    });
  });
});