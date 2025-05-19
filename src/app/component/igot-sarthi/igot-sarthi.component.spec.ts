// igot-sarthi.component.spec.ts
import { IGotSarthiComponent } from './igot-sarthi.component';
import { NavigationEnd} from '@angular/router';
import { of } from 'rxjs';

describe('IGotSarthiComponent', () => {
  let component: IGotSarthiComponent;
  let eventServiceMock: any;
  let chatbotServiceMock: any;
  let configSvcMock: any;
  let routerMock: any;
  let rendererMock: any;
  
  const mockUserProfile = {
    firstName: 'Test',
    lastName: 'User',
    profileImageUrl: 'test-url.jpg'
  };

  const mockLanguages = {
    status: { code: 200 },
    payload: {
      languages: [
        { value: 'en', label: 'English' },
        { value: 'hi', label: 'Hindi' }
      ]
    }
  };

  const mockChatData = {
    payload: {
      config: {
        quesMap: [
          { quesId: 'q1', quesValue: 'Question 1', ansVal: 'Answer 1' },
          { quesId: 'q2', quesValue: 'Question 2', ansVal: 'Answer 2' }
        ],
        recommendationMap: [
          { 
            catId: 'cat1', 
            categoryType: 'Logged-In',
            recommendedQues: [
              { quesID: 'q1', priority: 1 },
              { quesID: 'q2', priority: 2 }
            ],
            priority: 1
          }
        ],
        categoryMap: [
          { catId: 'cat1', catName: 'Category 1' }
        ]
      }
    }
  };

  const mockAiSearchResult = {
    answer: 'AI search answer',
    RetrievedChunks: [
      {
        Name: 'Content 1',
        ContentType: 'pdf',
        mimeType: 'application/pdf',
        ArtifactURL: 'test-url',
        Description: 'Test description',
        Identifier: 'test-id',
        contentStart: 1,
        ContentEnd: 2
      }
    ]
  };

  beforeEach(() => {
    // Create mocks for all dependencies
    eventServiceMock = {
      dispatchChatbotEvent: jest.fn()
    };
    
    chatbotServiceMock = {
      getLangugages: jest.fn().mockReturnValue(of(mockLanguages)),
      getChatData: jest.fn().mockReturnValue(of(mockChatData)),
      aiGlobalSearch: jest.fn().mockReturnValue(of(mockAiSearchResult))
    };
    
    configSvcMock = {
      userProfile: mockUserProfile
    };
    
    routerMock = {
      events: {
        subscribe: jest.fn((fn) => {
          fn(new NavigationEnd(1, '/home', '/home'));
          return { unsubscribe: jest.fn() };
        })
      }
    };
    
    rendererMock = {
      addClass: jest.fn(),
      removeClass: jest.fn()
    };
    
    // Local storage mock setup
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        setItem: jest.fn((key: string, value: string): void => {
          store[key] = value.toString();
        }),
        clear: jest.fn((): void => {
          store = {};
        })
      };
    })();
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
    
    // Mock Element.scrollHeight
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      value: 100
    });
    
    // Create component
    component = new IGotSarthiComponent(
      configSvcMock,
      eventServiceMock,
      rendererMock,
      chatbotServiceMock,
      routerMock
    );
 

    // Mock window.scrollTo
    global.scrollTo = jest.fn();
    
    // Mock console.log to avoid polluting test output
    console.log = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showIcon).toBe(true);
    expect(component.categories).toEqual([]);
    expect(component.currentFilter).toBe('information');
    expect(component.selectedLaguage).toBe('en');
  });



  it('should return greetings based on selected language', () => {
    component.selectedLaguage = 'en';
    expect(component.greetings()).toBe('Namaste');
    
    component.selectedLaguage = 'hi';
    expect(component.greetings()).toBe('नमस्ते');
  });

  it('should get text based on localization', () => {
    component.selectedLaguage = 'en';
    expect(component.getInfoText('information')).toBe('Information');
    
    component.selectedLaguage = 'hi';
    expect(component.getInfoText('information')).toBe('जानकारी');
  });

  it('should show more text based on localization', () => {
    component.selectedLaguage = 'en';
    expect(component.showMore()).toBe('Show More');
    
    component.selectedLaguage = 'hi';
    expect(component.showMore()).toBe('और दिखाओ');
  });

  it('should fetch chat data with correct parameters', () => {
    component.currentFilter = 'information';
    component.selectedLaguage = 'en';
    component.getData();
    
    expect(chatbotServiceMock.getChatData).toHaveBeenCalledWith({
      lang: 'en',
      config_type: 'IN'
    });
    expect(component.displayLoader).toBe(true);
  });


  it('should handle icon click for start type', () => {
    component.iconClick('start');
    
    expect(component.showIcon).toBe(false);
    expect(component.currentFilter).toBe('information');
    expect(component.expanded).toBe(false);
    expect(rendererMock.addClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
    expect(eventServiceMock.dispatchChatbotEvent).toHaveBeenCalled();
  });

  it('should push data to the correct array based on currentFilter', () => {
    // Information
    component.currentFilter = 'information';
    const msgInfo = { type: 'test', message: 'test message' };
    component.pushData(msgInfo);
    
    expect(component.chatInformation).toContain(msgInfo);
    expect(component.userJourney).toEqual(component.chatInformation);
    
    // Issue
    component.currentFilter = 'issue';
    const msgIssue = { type: 'test', message: 'test issue' };
    component.pushData(msgIssue);
    
    expect(component.chatIssues).toContain(msgIssue);
    expect(component.userJourney).toEqual(component.chatIssues);
  });


  it('should handle show category', () => {
    // Setup
    component.responseData = {
      recommendationMap: [
        { 
          catId: 'cat1', 
          recommendedQues: [{ quesID: 'q1' }] 
        }
      ],
      categoryMap: [
        { catId: 'cat1', catName: 'Category 1' }
      ]
    };
    
    // Execute - Normal category
    const catItem = { catId: 'cat1', catName: 'Category 1' };
    component.showCategory(catItem);
    
    // Verify
    
    expect(eventServiceMock.dispatchChatbotEvent).toHaveBeenCalled();
    
    // Reset
    component.userJourney = [];
    eventServiceMock.dispatchChatbotEvent.mockClear();
    
    // Execute - 'all' category
    const allCatItem = { catId: 'all', catName: 'Show All Categories' };
    const sortCategorySpy = jest.spyOn(component, 'sortCategory').mockReturnValue([
      { catId: 'cat1', catName: 'Category 1' }
    ]);
    
    component.showCategory(allCatItem);
    
    // Verify
    expect(sortCategorySpy).toHaveBeenCalled();
   
  });

  it('should raise category telemetry', () => {
    component.raiseCategotyTelemetry('cat1');
    
 
  });

  it('should raise chat start telemetry', () => {
    component.raiseChatStartTelemetry();
    
   
  });

  it('should raise chat end telemetry', () => {
    component.raiseChatEndTelemetry();
    
      });

  it('should raise telemetry interact', () => {
    component.currentFilter = 'information';
    component.raiseTemeletyInterat('q1');
    
   
  });

  it('should enable and disable scroll', () => {
    component['disableScroll']();
    expect(rendererMock.addClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
    
    component['enableScroll']();
    expect(rendererMock.removeClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
  });

  it('should perform AI global search', () => {
    component.searchQuery = 'test query';
    component.aiGlobalSearch();
    
    expect(chatbotServiceMock.aiGlobalSearch).toHaveBeenCalledWith(
      { query: 'test query' },
      component.chatId,
      component.userId
    );
    
    // Check that results are processed correctly
    expect(component.aiSearchResultArr.length).toBeGreaterThan(0);
    const lastResult = component.aiSearchResultArr[component.aiSearchResultArr.length - 1];
    expect(lastResult.answer).toBe('AI search answer');
  });

  it('should redirect to ToC', () => {
    // Mock window.open
    window.open = jest.fn();
    
    const chat = { identifier: 'test-id' };
    component.redirectToToc(chat);
    
    expect(window.open).toHaveBeenCalledWith(
      'https://portal.igotkarmayogi.gov.in/app/toc/test-id/overview',
      '_blank'
    );
  });

  it('should split paragraph by words', () => {
    const paragraph = 'This is a test paragraph with more than thirty words. It should be split into chunks of thirty words each. This sentence adds more words to exceed the thirty word limit.';
    const result = component.splitParagraphByWords(paragraph);
    
    expect(result.split(' ').length).toBe(30);
    expect(result).toBe('This is a test paragraph with more than thirty words. It should be split into chunks of thirty words each. This sentence adds more words to exceed the thirty word');
  });

  it('should toggle show less/more', () => {
    component.aiSearchResultArr = [{ showLess: true }];
    
    component.toggleShow(0, 'more');
    expect(component.aiSearchResultArr[0].showLess).toBe(false);
    
    component.toggleShow(0, 'less');
    expect(component.aiSearchResultArr[0].showLess).toBe(true);
  });

  it('should create initials', () => {
    component['createInititals']('Test User');
    expect(component.initials).toBe('TU');
    
    component['createInititals']('SingleName');
    expect(component.initials).toBe('S');
  });
  it('should get languages', () => {
    component.getLanguages();
    
    expect(chatbotServiceMock.getLangugages).toHaveBeenCalled();
    expect(component.displayLoader).toBe(false);
    
    // Check after observable is resolved
    expect(component.language).toEqual(mockLanguages.payload.languages);
    
  });

  it('should filter user journey by tab', () => {
    component.userJourney = [
      { tab: 'information', message: 'Info message' },
      { tab: 'issue', message: 'Issue message' }
    ] as any;
    
    const infoJourney = component.getuserjourney('information');
    expect(infoJourney.length).toBe(1);
    
    const issueJourney = component.getuserjourney('issue');
    expect(issueJourney.length).toBe(1);
  });

  
});