import { IGotSarthiComponent } from './igot-sarthi.component';
import { of, throwError } from 'rxjs';

// Extend Jest matchers for proper typing
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveLength(length: number): R;
    }
  }
}

// Mock dependencies
const mockConfigSvc = {
  userProfile: {
    firstName: 'John',
    lastName: 'Doe',
    profileImageUrl: 'http://example.com/image.jpg'
  }
};

const mockEventSvc = {
  dispatchChatbotEvent: jest.fn()
};

const mockRenderer2 = {
  addClass: jest.fn(),
  removeClass: jest.fn()
};

const mockChatbotService = {
  getChatData: jest.fn(),
  getLangugages: jest.fn(),
  aiGlobalSearch: jest.fn()
};

// Create a proper NavigationEnd mock
class MockNavigationEnd {
  constructor(public url: string) {}
}

const mockDialog = {}

const mockSnackBar = {}

const mockRouter = {
  events: of(new MockNavigationEnd('/test'))
};

// Mock NavigationEnd
import { NavigationEnd } from '@angular/router';

// Mock NavigationEnd class
jest.mock('@angular/router', () => ({
  NavigationEnd: class {
    constructor(public url: string) {}
  },
  Router: jest.fn()
}));

// Mock environment
// const mockEnvironment = {
//   supportEmail: 'test@example.com'
// };

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

// Mock global objects
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

Object.defineProperty(window, 'scrollTo', {
  value: jest.fn()
});

Object.defineProperty(document, 'body', {
  value: {
    scrollHeight: 1000,
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
});

Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => ({
    style: {},
    value: '',
    focus: jest.fn(),
    select: jest.fn()
  }))
});

Object.defineProperty(document, 'execCommand', {
  value: jest.fn()
});

describe('IGotSarthiComponent', () => {
  let component: IGotSarthiComponent;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockLocalStorage.clear();
    
    // Create component instance
    component = new IGotSarthiComponent(
      mockConfigSvc as any,
      mockEventSvc as any,
      mockRenderer2 as any,
      mockChatbotService as any,
      mockDialog as any,
      mockSnackBar as any,
      mockRouter as any
    );

    // Initialize component properties to prevent undefined errors
    component.categories = [];
    component.language = [];
    component.userJourney = [];
    component.chatInformation = [];
    component.chatIssues = [];
    component.questionsAndAns = {};
    component.aiSearchResultArr = [];
    component.responseData = {
      quesMap: [],
      recommendationMap: [],
      categoryMap: []
    };

    // Mock ViewChild
    component.myScrollContainer = {
      nativeElement: {
        scrollTop: 0,
        scrollHeight: 1000
      }
    } as any;
  });

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize default values', () => {
      expect(component.showIcon).toBe(true);
      expect(component.currentFilter).toBe('information');
      expect(component.selectedLaguage).toBe('en');
      expect(component.displayLoader).toBe(false);
      expect(component.expanded).toBe(false);
      expect(component.more).toBe(false);
      expect(component.copiedIndex).toBe(-1);
    });

    it('should set user info on ngOnInit', () => {
      // Mock router events subscription
      const mockEvent = new (NavigationEnd as any)('/test');
      mockRouter.events = of(mockEvent);
      
      component.ngOnInit();
      expect(component.userInfo).toEqual(mockConfigSvc.userProfile);
    });

    it('should create initials when no profile image', () => {
      const mockUserProfile = { ...mockConfigSvc.userProfile, profileImageUrl: '' };
      mockConfigSvc.userProfile = mockUserProfile;
      
      const mockEvent = new (NavigationEnd as any)('/test');
      mockRouter.events = of(mockEvent);
      
      component.ngOnInit();
      expect(component.initials).toBe('JD');
    });

    it('should set email and call text on ngOnInit', () => {
      const mockEvent = new (NavigationEnd as any)('/test');
      mockRouter.events = of(mockEvent);
      
      component.ngOnInit();
      expect(component.emailText).toContain('mission.karmayogi@gov.in');
      expect(component.callText).toContain('Teams Call');
    });
  });

  describe('Language Methods', () => {
    it('should return greeting based on selected language', () => {
      component.selectedLaguage = 'en';
      expect(component.greetings()).toBe('Namaste');
      
      component.selectedLaguage = 'hi';
      expect(component.greetings()).toBe('नमस्ते');
    });

    it('should return info text based on selected language', () => {
      component.selectedLaguage = 'en';
      expect(component.getInfoText('information')).toBe('Information');
      
      component.selectedLaguage = 'hi';
      expect(component.getInfoText('information')).toBe('जानकारी');
    });

    it('should return show more text based on selected language', () => {
      component.selectedLaguage = 'en';
      expect(component.showMore()).toBe('Show More');
      
      component.selectedLaguage = 'hi';
      expect(component.showMore()).toBe('और दिखाओ');
    });
  });

  describe('Data Management', () => {
    it('should call getChatData when getData is called', () => {
      const mockResponse = {
        payload: {
          config: { test: 'data' }
        }
      };
      mockChatbotService.getChatData.mockReturnValue(of(mockResponse));
      
      // Initialize required data
      component.selectedLaguage = 'en';
      component.currentFilter = 'information';
      
      component.getData();
      
      expect(mockChatbotService.getChatData).toHaveBeenCalled();
      expect(component.displayLoader).toBe(true);
    });

    it('should set data to localStorage', () => {
      const testData = { test: 'config' };
      component.selectedLaguage = 'en';
      component.currentFilter = 'information';
      
      // Mock the toggleFilter method to prevent errors
      jest.spyOn(component, 'toggleFilter').mockImplementation();
      
      component.setDataToLocalStorage(testData);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('faq', '');
    });

    it('should select language and update localStorage', () => {
      const mockEvent = { target: { value: 'hi' } };
      
      // Mock checkForApiCalls to prevent errors
      jest.spyOn(component, 'checkForApiCalls').mockImplementation();
      
      component.selectLaguage(mockEvent);
      
      expect(component.selectedLaguage).toBe('hi');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'hi');
      expect(component.chatInformation).toEqual([]);
      expect(component.chatIssues).toEqual([]);
    });
  });

  describe('Navigation and UI', () => {
    it('should toggle icon and handle start type', () => {
      // Mock methods that might be called
      jest.spyOn(component, 'raiseChatStartTelemetry').mockImplementation();
      
      component.iconClick('start');
      
      expect(component.showIcon).toBe(false);
      expect(component.currentFilter).toBe('information');
      expect(component.expanded).toBe(false);
      expect(mockRenderer2.addClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
    });

    it('should toggle icon and handle end type', () => {
      // Mock methods that might be called
      jest.spyOn(component, 'raiseChatEndTelemetry').mockImplementation();
      jest.spyOn(component, 'checkForApiCalls').mockImplementation();
      
      component.iconClick('end');
      
      expect(component.showIcon).toBe(false);
      expect(component.userJourney).toEqual([]);
      expect(component.chatInformation).toEqual([]);
      expect(component.chatIssues).toEqual([]);
      expect(component.selectedLaguage).toBe('en');
      expect(component.currentFilter).toBe('information');
      expect(component.more).toBe(false);
      expect(mockRenderer2.removeClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
    });

    it('should toggle filter', () => {
      // Mock checkForApiCalls to prevent errors
      jest.spyOn(component, 'checkForApiCalls').mockImplementation();
      
      component.toggleFilter('issue');
      
      expect(component.currentFilter).toBe('issue');
      expect(component.more).toBe(false);
    });

    it('should scroll to bottom', () => {
      component.goToBottom();
      expect(window.scrollTo).toHaveBeenCalledWith(0, document.body.scrollHeight);
    });
  });

  describe('Question and Answer Handling', () => {
    beforeEach(() => {
      component.questionsAndAns = {
        'Q1': {
          quesValue: 'Test Question',
          ansVal: 'Test Answer <teams_call_link> <email_configuration>'
        }
      };
      component.callText = 'Call Link';
      component.emailText = 'Email Link';
    });

    it('should handle selected question', () => {
      const question = { quesID: 'Q1', recommendedQues: [] };
      const data = { selectedValue: '' };
      
      // Mock required methods
      jest.spyOn(component, 'pushData').mockImplementation();
      jest.spyOn(component, 'raiseTemeletyInterat').mockImplementation();
      
      component.selectedQuestion(question, data);
      
      expect(data.selectedValue).toBe('Q1');
    });

    it('should push data to correct chat array based on current filter', () => {
      const msg = { type: 'test', tab: 'information' };
      
      component.currentFilter = 'information';
      component.pushData(msg);
      expect(component.chatInformation).toContain(msg);
      
      component.currentFilter = 'issue';
      component.pushData(msg);
      expect(component.chatIssues).toContain(msg);
    });

    it('should get user journey filtered by tab', () => {
      component.userJourney = [
      ];
      
      const infoJourney = component.getuserjourney('information');
      expect(infoJourney.length).toBe(2);
      expect(infoJourney.every((j:any) => j.tab === 'information')).toBe(true);
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
              { priority: 1, question: 'Q3' }
            ]
          }
        ]
      };
      component.userInfo = mockConfigSvc.userProfile;
    });

    it('should get priority questions for logged-in user', () => {
      const questions = component.getPriorityQuestion(1);
      expect(questions.length).toBe(2);
    });

    it('should get priority questions for not logged-in user', () => {
      component.userInfo = null;
      const questions = component.getPriorityQuestion(1);
      expect(questions.length).toBe(1);
    });
  });

  describe('Categories', () => {
    beforeEach(() => {
      component.responseData = {
        recommendationMap: [
          { catId: 'cat1', categoryType: 'Both', priority: 1, recommendedQues: [] }
        ],
        categoryMap: [
          { catId: 'cat1', catName: 'Category 1' }
        ]
      };
    });

    it('should show category with all categories', () => {
      const catItem = { catId: 'all', catName: 'All Categories' };
      
      // Mock required methods and data
      jest.spyOn(component, 'pushData').mockImplementation();
      jest.spyOn(component, 'sortCategory').mockReturnValue([]);
      
      component.showCategory(catItem);
      
      expect(component.more).toBe(false);
    });

    it('should show specific category', () => {
      const catItem = { catId: 'cat1', catName: 'Category 1' };
      
      // Mock required methods and data
      jest.spyOn(component, 'pushData').mockImplementation();
      jest.spyOn(component, 'raiseCategotyTelemetry').mockImplementation();
      
      component.showCategory(catItem);
      
      expect(component.more).toBe(false);
    });

    it('should get categories based on user login status', () => {
      component.getCategories();
      expect(component.categories.length).toBeGreaterThan(0);
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
  });

  describe('AI Search', () => {
    it('should submit search query', () => {
      component.searchQuery = 'test query';
      component.chatId = 'chat123';
      component.userId = 'user123';
      
      const mockResponse = {
        answer: 'Test answer',
        RetrievedChunks: [
          {
            Name: 'Test Content',
            mimeType: 'application/pdf',
            Identifier: 'test123',
            contentStart: 10,
            ContentEnd: 20
          }
        ]
      };
      
      mockChatbotService.aiGlobalSearch.mockReturnValue(of(mockResponse));
      
      // Mock scrollToBottomEvent emit
      component.scrollToBottomEvent = { emit: jest.fn() } as any;
      
      component.submitSearchQuery(null as any, null as any);
      
      expect(component.aiSearchResultArr.length).toBeGreaterThan(0);
    });

    it('should handle AI global search', () => {
      component.searchQuery = 'test query';
      component.chatId = 'chat123';
      component.userId = 'user123';
      
      const mockResponse = {
        answer: 'Test answer',
        RetrievedChunks: []
      };
      
      mockChatbotService.aiGlobalSearch.mockReturnValue(of(mockResponse));
      
      // Mock scrollToBottomEvent emit
      component.scrollToBottomEvent = { emit: jest.fn() } as any;
      
      component.aiGlobalSearch();
      
      expect(mockChatbotService.aiGlobalSearch).toHaveBeenCalledWith(
        { query: 'test query' },
        'chat123',
        'user123'
      );
    });

    it('should copy path to clipboard', () => {
      const item = {
        mimeType: 'application/pdf',
        identifier: 'test123',
        pageNumber: 5
      };
      
      component.copyPath(item, 0);
      
      expect(document.createElement).toHaveBeenCalledWith('textarea');
      expect(component.copiedIndex).toBe(0);
    });

    it('should redirect to ToC', () => {
      const chat = { identifier: 'test123', contentType: 'Course' };
      const openSpy = jest.spyOn(window, 'open').mockImplementation();
      
      component.redirectToToc(chat);
      
      expect(openSpy).toHaveBeenCalledWith(
        'https://portal.igotkarmayogi.gov.in/app/toc/test123/overview',
        '_blank'
      );
    });
  });

  describe('Utility Methods', () => {
    it('should split paragraph by words', () => {
      const paragraph = 'This is a test paragraph with more than thirty words to test the splitting functionality that should work correctly and return only the first thirty words';
      const result = component.splitParagraphByWords(paragraph, 10);
      
      expect(result.split(' ').length).toBe(10);
    });

    it('should toggle show less/more', () => {
      component.aiSearchResultArr = [{ showLess: true }];
      
      component.toggleShow(0, 'more');
      expect(component.aiSearchResultArr[0].showLess).toBe(false);
      
      component.toggleShow(0, 'less');
      expect(component.aiSearchResultArr[0].showLess).toBe(true);
    });

    it('should create initials from name', () => {
      component['createInititals']('John Doe');
      expect(component.initials).toBe('JD');
      
      component['createInititals']('John');
      expect(component.initials).toBe('JO');
    });

    it('should return user initials', () => {
      component.initials = 'JD';
      expect(component.userInitials).toBe('JD');
    });
  });

  describe('Telemetry Events', () => {
    it('should raise category telemetry', () => {
      component.raiseCategotyTelemetry('cat1');
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    });

    it('should raise chat start telemetry', () => {
      component.raiseChatStartTelemetry();
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    });

    it('should raise chat end telemetry', () => {
      component.raiseChatEndTelemetry();
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    });

    it('should raise interact telemetry', () => {
      component.raiseTemeletyInterat('Q1');
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    });

    it('should raise telemetry for resource', () => {
      const item = { identifier: 'test123', contentType: 'Course' };
      component.raiseTelemetryForResource(item);
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should handle ngAfterViewChecked', () => {
      expect(() => component.ngAfterViewChecked()).not.toThrow();
    });

    it('should handle ngOnDestroy', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should scroll to bottom', () => {
      component.scrollToBottom();
      expect(component.myScrollContainer?.nativeElement.scrollTop).toBe(1000);
    });

    it('should handle scroll to bottom error gracefully', () => {
      component.myScrollContainer = undefined;
      expect(() => component.scrollToBottom()).not.toThrow();
    });
  });

  describe('API Calls and Error Handling', () => {
    it('should handle language API success', () => {
      const mockResponse = {
        status: { code: 200 },
        payload: { languages: ['en', 'hi'] }
      };
      mockChatbotService.getLangugages.mockReturnValue(of(mockResponse));
      
      component.getLanguages();
      
      expect(component.language).toEqual(['en', 'hi']);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('faq-languages', JSON.stringify(['en', 'hi']));
    });

    it('should handle language API error', () => {
      mockChatbotService.getLangugages.mockReturnValue(throwError('API Error'));
      
      expect(() => component.getLanguages()).not.toThrow();
    });

    it('should check for API calls with existing localStorage data', () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'faq') return JSON.stringify({ en: { information: { test: 'data', quesMap: [], recommendationMap: [], categoryMap: [] } } });
        if (key === 'faq-languages') return JSON.stringify(['en', 'hi']);
        if (key === 'selectedLanguage') return 'en';
        return null;
      });

      // Mock required methods
      jest.spyOn(component, 'initData').mockImplementation();
      jest.spyOn(component, 'getQns').mockImplementation();
      jest.spyOn(component, 'getCategories').mockImplementation();

      component.checkForApiCalls();
      
      expect(component.language).toEqual(['en', 'hi']);
    });
  });

  describe('Event Handlers', () => {
    it('should handle click outside', () => {
      const iconClickSpy = jest.spyOn(component, 'iconClick');
      component.clickOutside();
      expect(iconClickSpy).toHaveBeenCalledWith('end');
    });

    it('should show more questions', () => {
      // Mock required method
      jest.spyOn(component, 'getPriorityQuestion').mockReturnValue([]);
      jest.spyOn(component, 'pushData').mockImplementation();
      
      component.showMoreQuestion();
      
      // Verify pushData was called
      expect(component.getPriorityQuestion).toHaveBeenCalledWith(1);
    });
  });
});