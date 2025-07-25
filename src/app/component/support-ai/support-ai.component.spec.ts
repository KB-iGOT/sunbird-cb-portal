// support-ai.component.spec.ts
import { SupportAIComponent } from './support-ai.component';

// Simple mocks
const mockConfigSvc = {
  userProfile: {
    firstName: 'Test',
    profileImageUrl: '',
    professionalDetails: [{ designation: 'Dev' }],
    departmentName: 'IT'
  }
};

const mockEventSvc = { dispatchChatbotEvent: jest.fn() };
const mockRenderer = { addClass: jest.fn(), removeClass: jest.fn() };
const mockDialog = {
  open: jest.fn(() => ({
    afterClosed: jest.fn(() => ({ subscribe: jest.fn() })),
    close: jest.fn()
  }))
};
const mockSnackBar = { open: jest.fn() };
const mockRouter = { 
  events: { 
    subscribe: jest.fn((callback: any) => {
      // Simulate NavigationEnd event
      callback({ url: '/test' });
      return { unsubscribe: jest.fn() };
    })
  }
};

const mockChatbotService = {
  getChatData: jest.fn(() => ({ 
    subscribe: jest.fn((callback: any) => {
      callback({ payload: { config: { quesMap: [], recommendationMap: [], categoryMap: [] } } });
      return { unsubscribe: jest.fn() };
    })
  })),
  getLangugages: jest.fn(() => ({ 
    subscribe: jest.fn((callback: any) => {
      callback({ status: { code: 200 }, payload: { languages: [] } });
      return { unsubscribe: jest.fn() };
    })
  })),
  aiStartChathForSupport: jest.fn(() => ({ 
    subscribe: jest.fn((callback: any) => {
      callback({ message: 'success' });
      return { unsubscribe: jest.fn() };
    })
  })),
  aiSendChathForSupport: jest.fn(() => ({ 
    subscribe: jest.fn((callback: any) => {
      callback({ text: 'AI response', RetrievedChunks: [] });
      return { unsubscribe: jest.fn() };
    })
  })),
  saveAIChatPositiveContentRating: jest.fn(() => ({ 
    subscribe: jest.fn((callback: any) => {
      callback({ status: 'success' });
      return { unsubscribe: jest.fn() };
    })
  })),
  shareAIFeedback: jest.fn(() => ({ 
    subscribe: jest.fn((callback: any) => {
      callback({ status: 'success' });
      return { unsubscribe: jest.fn() };
    })
  })),
  aiGlobalSearchFromInternet: jest.fn(() => ({ 
    subscribe: jest.fn((callback: any) => {
      callback({ answer: 'Internet answer', query_id: 'q123' });
      return { unsubscribe: jest.fn() };
    })
  }))
};

// Mock globals
// (global as any).localStorage = {
//   getItem: jest.fn(() => null),
//   setItem: jest.fn(),
//   removeItem: jest.fn(),
//   clear: jest.fn()
// };

// (global as any).window = {
//   scrollTo: jest.fn(),
//   open: jest.fn(),
//   getComputedStyle: jest.fn(() => ({ paddingTop: '0px', paddingBottom: '0px' })),
//   requestAnimationFrame: jest.fn(cb => cb())
// };

// (global as any).document = {
//   body: { scrollHeight: 100, appendChild: jest.fn(), removeChild: jest.fn() },
//   createElement: jest.fn(() => ({ style: {}, focus: jest.fn(), select: jest.fn(), value: '' })),
//   execCommand: jest.fn()
// };

// Mock environment
jest.mock('../../../environments/environment', () => ({
  environment: { supportEmail: 'test@example.com' }
}));

// Mock lodash
jest.mock('lodash/cloneDeep', () => jest.fn(val => JSON.parse(JSON.stringify(val))));

describe('SupportAIComponent - Basic Tests', () => {
  let component: SupportAIComponent;

  beforeEach(() => {
    component = new SupportAIComponent(
      mockConfigSvc as any,
      mockEventSvc as any,
      mockRenderer as any,
      mockChatbotService as any,
      mockDialog as any,
      mockSnackBar as any,
      mockRouter as any
    );
    
    // Mock ViewChild
    component.textArea = { nativeElement: { style: { height: '30px' }, scrollHeight: 50 } } as any;
    component.myScrollContainer = { nativeElement: { scrollTop: 0, scrollHeight: 100 } } as any;
  });

  test('Component creation', () => {
    expect(component).toBeTruthy();
    expect(component.showIcon).toBe(true);
    expect(component.currentFilter).toBe('information');
    expect(component.selectedLaguage).toBe('en');
    expect(component.categories).toEqual([]);
    expect(component.language).toEqual([]);
    expect(component.more).toBe(false);
    expect(component.displayLoader).toBe(false);
    expect(component.expanded).toBe(false);
    expect(component.copiedIndex).toBe(-1);
    expect(component.resultFetch).toBe(false);
    expect(component.startNewChat).toBe(false);
    expect(component.initiateSupportNewChat).toBe(false);
    expect(component.containerHeight).toBe(36);
  });

  test('ngOnInit basic functionality', () => {
    component.ngOnInit();
    expect(component.userInfo).toBe(mockConfigSvc.userProfile);
    expect(component.aiSearchResultArr).toHaveLength(3);
    expect(component.userIcon).toBe('');
    expect(component.callText).toContain('Teams Call');
    expect(component.emailText).toContain('test@example.com');
  });

  test('Language methods', () => {
    component.selectedLaguage = 'hi';
    expect(component.greetings()).toBe('नमस्ते');
    expect(component.getInfoText('information')).toBe('जानकारी');
    expect(component.showMore()).toBe('और दिखाओ');
    
    component.selectedLaguage = 'en';
    expect(component.greetings()).toBe('Namaste');
    expect(component.getInfoText('information')).toBe('Information');
    expect(component.showMore()).toBe('Show More');
  });

  test('getData method', () => {
    component.currentFilter = 'information';
    component.selectedLaguage = 'en';
    component.getData();
    expect(mockChatbotService.getChatData).toHaveBeenCalledWith({ lang: 'en', config_type: 'IN' });
    
    component.currentFilter = 'issue';
    component.getData();
    expect(mockChatbotService.getChatData).toHaveBeenCalledWith({ lang: 'en', config_type: 'IS' });
  });

  test('setDataToLocalStorage', () => {
    const data = { test: 'data' };
    component.selectedLaguage = 'en';
    component.currentFilter = 'information';
    component.setDataToLocalStorage(data);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  test('initData', () => {
    const data = { quesMap: [{ quesId: '1', quesValue: 'Q1' }], recommendationMap: [] };
    component.initData(data);
    expect(component.userJourney).toEqual([]);
  });

  test('getQns', () => {
    component.responseData = { quesMap: [{ quesId: '1', quesValue: 'Q1' }] };
    component.getQns();
    expect(component.questionsAndAns['1']).toBeDefined();
  });

  test('selectLaguage', () => {
    const event = { target: { value: 'hi' } };
    component.selectLaguage(event);
    expect(component.selectedLaguage).toBe('hi');
    expect(localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'hi');
    expect(component.chatInformation).toEqual([]);
    expect(component.chatIssues).toEqual([]);
  });

  test('readFromLocalStorage', () => {
    const data = { en: { information: { test: 'data' } } };
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(data));
    component.selectedLaguage = 'en';
    component.currentFilter = 'information';
    component.readFromLocalStorage();
    expect(component.responseData).toEqual({ test: 'data' });
  });

  test('goToBottom', () => {
    component.goToBottom();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 100);
  });

  test('iconClick start', () => {
    component.iconClick('start');
    expect(component.showIcon).toBe(false);
    expect(component.currentFilter).toBe('information');
    expect(component.expanded).toBe(false);
    expect(mockRenderer.addClass).toHaveBeenCalled();
  });

  test('iconClick end', () => {
    component.iconClick('end');
    expect(component.showIcon).toBe(false);
    expect(component.userJourney).toEqual([]);
    expect(component.chatInformation).toEqual([]);
    expect(component.chatIssues).toEqual([]);
    expect(component.selectedLaguage).toBe('en');
    expect(component.currentFilter).toBe('information');
    expect(component.more).toBe(false);
    expect(mockRenderer.removeClass).toHaveBeenCalled();
  });

  test('toggleFilter', () => {
    component.toggleFilter('issue');
    expect(component.currentFilter).toBe('issue');
    expect(component.more).toBe(false);
  });

  test('selectedQuestion', () => {
    component.questionsAndAns = { '1': { quesValue: 'Q1', ansVal: 'A1' } };
    component.callText = 'call';
    component.emailText = 'email';
    component.currentFilter = 'information';
    const question = { quesID: '1' };
    const data = { selectedValue: '' };
    
    component.selectedQuestion(question, data);
    expect(data.selectedValue).toBe('1');
  });

  test('pushData information', () => {
    const msg = { type: 'test', message: 'test' };
    component.currentFilter = 'information';
    component.pushData(msg);
    expect(component.chatInformation).toContain(msg);
    expect(component.userJourney).toContain(msg);
  });

  test('pushData issue', () => {
    const msg = { type: 'test', message: 'test' };
    component.currentFilter = 'issue';
    component.pushData(msg);
    expect(component.chatIssues).toContain(msg);
    expect(component.userJourney).toContain(msg);
  });

  test('getuserjourney', () => {
    component.userJourney = [
    ];
    const result = component.getuserjourney('information');
    expect(result).toHaveLength(2);
    // expect(result[0].msg).toBe('1');
    // expect(result[1].msg).toBe('3');
  });

  test('getPriorityQuestion with user', () => {
    component.userInfo = { firstName: 'Test' };
    component.responseData = {
      recommendationMap: [
        {
          categoryType: 'Logged-In',
          recommendedQues: [{ priority: 1, question: 'Q1' }]
        },
        {
          categoryType: 'Both',
          recommendedQues: [{ priority: 1, question: 'Q2' }]
        }
      ]
    };
    const result = component.getPriorityQuestion(1);
    expect(result).toHaveLength(2);
  });

  test('getPriorityQuestion without user', () => {
    component.userInfo = null;
    component.responseData = {
      recommendationMap: [
        {
          categoryType: 'Not Logged-In',
          recommendedQues: [{ priority: 1, question: 'Q1' }]
        },
        {
          categoryType: 'Both',
          recommendedQues: [{ priority: 1, question: 'Q2' }]
        }
      ]
    };
    const result = component.getPriorityQuestion(1);
    expect(result).toHaveLength(2);
  });

  test('showMoreQuestion', () => {
    component.responseData = { recommendationMap: [] };
    component.showMoreQuestion();
    expect(component.userJourney).toHaveLength(1);
  });

  test('showCategory all', () => {
    const catItem = { catId: 'all', catName: 'All' };
    component.categories = [{ catId: '1', catName: 'Cat1' }];
    component.showCategory(catItem);
    expect(component.more).toBe(false);
  });

  test('showCategory specific', () => {
    const catItem = { catId: '1', catName: 'Cat1' };
    component.responseData = {
      recommendationMap: [{ catId: '1', recommendedQues: [] }]
    };
    component.showCategory(catItem);
    expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
  });

  test('Telemetry methods', () => {
    component.raiseCategotyTelemetry('cat1');
    expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    
    component.raiseChatStartTelemetry();
    expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    
    component.raiseChatEndTelemetry();
    expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    
    component.currentFilter = 'information';
    component.raiseTemeletyInterat('id1');
    expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
    
    component.raiseTelemetryForResource({ identifier: 'id1', contentType: 'video' });
    expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
  });

  test('checkForApiCalls with localStorage', () => {
    const faqData = { en: { information: { quesMap: [], recommendationMap: [], categoryMap: [] } } };
    const langData = [{ code: 'en', name: 'English' }];
    
    (localStorage.getItem as jest.Mock)
      .mockReturnValueOnce('en')
      .mockReturnValueOnce(JSON.stringify(faqData))
      .mockReturnValueOnce(JSON.stringify(langData));
    
    component.checkForApiCalls();
    expect(component.selectedLaguage).toBe('en');
    expect(component.language).toEqual(langData);
  });

  test('checkForApiCalls without localStorage', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    component.checkForApiCalls();
    expect(mockChatbotService.getLangugages).toHaveBeenCalled();
  });

  test('getCategories', () => {
    component.userInfo = { firstName: 'Test' };
    component.selectedLaguage = 'en';
    component.responseData = {
      recommendationMap: [{ catId: '1', categoryType: 'Logged-In', priority: 1 }],
      categoryMap: [{ catId: '1', catName: 'Cat1' }]
    };
    component.getCategories();
    expect(component.categories).toHaveLength(2);
    expect(component.categories[0].catId).toBe('all');
  });

  test('sortCategory', () => {
    component.categories = [
      { priority: 3, catName: 'C' },
      { priority: 1, catName: 'A' },
      { priority: 2, catName: 'B' }
    ];
    const result = component.sortCategory();
    expect(result[0].catName).toBe('A');
    expect(result[1].catName).toBe('B');
    expect(result[2].catName).toBe('C');
  });

  test('getLanguages', () => {
    component.getLanguages();
    expect(component.displayLoader).toBe(false);
    expect(mockChatbotService.getLangugages).toHaveBeenCalled();
  });

  test('scrollToBottom with container', () => {
    component.scrollToBottom();
    expect(component.myScrollContainer?.nativeElement.scrollTop).toBe(100);
  });

  test('scrollToBottom without container', () => {
    component.myScrollContainer = undefined;
    expect(() => component.scrollToBottom()).not.toThrow();
  });

  test('clickOutside', () => {
    const iconClickSpy = jest.spyOn(component, 'iconClick').mockImplementation();
    component.clickOutside();
    expect(iconClickSpy).toHaveBeenCalledWith('end');
  });

  test('disableScroll and enableScroll', () => {
    (component as any).disableScroll();
    expect(mockRenderer.addClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
    
    (component as any).enableScroll();
    expect(mockRenderer.removeClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
  });

  test('submitSearchQuery empty', () => {
    const event = { preventDefault: jest.fn() };
    component.searchQuery = '   ';
    component.submitSearchQuery({} as any, event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  test('submitSearchQuery valid', () => {
    const event = { preventDefault: jest.fn() };
    component.searchQuery = 'test query';
    component.aiSearchResultArr = [];
    component.submitSearchQuery({} as any, event);
    expect(component.cloneSearchQuery).toBe('test query');
    expect(component.searchQuery).toBe('');
    expect(component.resultFetch).toBe(false);
    expect(component.aiSearchResultArr).toHaveLength(2);
  });

  test('startNewSupportAISearch', () => {
    component.startNewChat = true;
    component.userId = 'user1';
    component.startNewSupportAISearch();
    expect(component.iGOTAISearchResultArr).toEqual([]);
    expect(component.resultFetch).toBe(true);
    expect(component.initiateSupportNewChat).toBe(true);
    expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
  });

  test('supportAISearch', () => {
    component.initiateSupportNewChat = true;
    component.userId = 'user1';
    component.supportAISearch();
    expect(mockChatbotService.aiSendChathForSupport).toHaveBeenCalled();
    expect(component.resultFetch).toBe(true);
  });

  test('sharePositiveContentRating success', () => {
    const item = { query_id: 'q1' };
    component.chatId = 'chat1';
    component.userId = 'user1';
    component.aiSearchResultArr = [{ result: [{ feedback: '' }] }];
    
    component.sharePositiveContentRating(item, 0, 0);
    expect(mockChatbotService.saveAIChatPositiveContentRating).toHaveBeenCalled();
    expect(component.aiSearchResultArr[0].result[0].feedback).toBe('up');
    expect(mockSnackBar.open).toHaveBeenCalled();
  });

  test('openAIFeedbackPopup valid feedback', () => {
    const item = { query_id: 'q1' };
    component.aiSearchResultArr = [{ result: [{ feedback: '' }] }];
    component.openAIFeedbackPopup(item, 0, 0);
    expect(mockDialog.open).toHaveBeenCalled();
  });

  test('openAIFeedbackPopup already submitted', () => {
    const item = { query_id: 'q1' };
    component.aiSearchResultArr = [{ result: [{ feedback: 'down' }] }];
    component.openAIFeedbackPopup(item, 0, 0);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'You have already submitted feedback', 'X',
      { duration: 5000, panelClass: ['error'] }
    );
  });

  test('shareAIFeedback', () => {
    const item = { query_id: 'q1' };
    component.chatId = 'chat1';
    component.userId = 'user1';
    component.aiSearchResultArr = [{ result: [{ feedback: '' }] }];
    
    component.shareAIFeedback(item, 'feedback', 0, 0);
    expect(mockChatbotService.shareAIFeedback).toHaveBeenCalled();
    expect(component.aiSearchResultArr[0].result[0].feedback).toBe('down');
  });

  test('callFromInternet', () => {
    const item = { answer: null };
    component.userInfo = {
      professionalDetails: [{ designation: 'Dev' }],
      departmentName: 'IT'
    };
    component.aiSearchResultArr = [{ showFromInternet: true }];
    component.callFromInternet(item, 0);
    expect(mockChatbotService.aiGlobalSearchFromInternet).toHaveBeenCalled();
    expect(component.aiSearchResultArr[0].showFromInternet).toBe(false);
  });

  test('rejectFromInternet', () => {
    component.aiSearchResultArr = [
      { showFromInternet: true },
      { newMessage: '' }
    ];
    component.rejectFromInternet(0);
    expect(component.aiSearchResultArr[0].showFromInternet).toBe(false);
    expect(component.resultFetch).toBe(true);
    expect(component.aiSearchResultArr).toHaveLength(1);
  });

  test('copyPath PDF', () => {
    const item = { mimeType: 'application/pdf', identifier: 'id1', pageNumber: 1 };
    component.copyPath(item, 0);
    expect(document.createElement).toHaveBeenCalledWith('textarea');
    expect(component.copiedIndex).toBe(0);
  });

  test('copyPath video', () => {
    const item = { mimeType: 'video/mp4', identifier: 'id1', contentStart: 10, contentEnd: 20 };
    component.copyPath(item, 1);
    expect(component.copiedIndex).toBe(1);
  });

  test('redirectToResource PDF', () => {
    const item = { mimeType: 'application/pdf', identifier: 'id1', pageNumber: 1 };
    component.redirectToResource(item);
    expect(window.open).toHaveBeenCalled();
  });

  test('redirectToResource video', () => {
    const item = { mimeType: 'video/mp4', identifier: 'id1', contentStart: 10, contentEnd: 20 };
    component.redirectToResource(item);
    expect(window.open).toHaveBeenCalled();
  });

  test('redirectToToc', () => {
    const chat = { identifier: 'id1', contentType: 'course' };
    component.redirectToToc(chat);
    expect(window.open).toHaveBeenCalledWith(
      'https://portal.igotkarmayogi.gov.in/app/toc/id1/overview',
      '_blank'
    );
    expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalled();
  });

  test('splitParagraphByWords default', () => {
    const paragraph = 'This is a test paragraph with many words to test splitting';
    const result = component.splitParagraphByWords(paragraph);
    const words = result.split(' ');
    expect(words.length).toBeLessThanOrEqual(30);
  });

  test('splitParagraphByWords custom chunk size', () => {
    const paragraph = 'This is a test paragraph';
    const result = component.splitParagraphByWords(paragraph, 3);
    expect(result).toBe('This is a');
  });

  test('toggleShow less', () => {
    component.aiSearchResultArr = [{ showLess: false }];
    component.toggleShow(0, 'less');
    expect(component.aiSearchResultArr[0].showLess).toBe(true);
  });

  test('toggleShow more', () => {
    component.aiSearchResultArr = [{ showLess: true }];
    component.toggleShow(0, 'more');
    expect(component.aiSearchResultArr[0].showLess).toBe(false);
  });

  test('userInitials getter', () => {
    component.initials = 'TU';
    expect(component.userInitials).toBe('TU');
  });

  test('createInititals full name', () => {
    const name = 'John Doe';
    (component as any).createInititals(name);
    expect(component.initials).toBe('JD');
    expect(component.circleColor).toBeDefined();
  });

  test('createInititals single name', () => {
    const name = 'John';
    (component as any).createInititals(name);
    expect(component.initials).toBe('JO');
  });

  test('resizeTextarea', () => {
    const textArea = { style: { height: '30px' }, scrollHeight: 60 } as HTMLTextAreaElement;
    component.resizeTextarea(textArea, '');
    expect(textArea.style.height).toBe('auto');
    expect(textArea.style.height).toBe('60px');
    expect(component.containerHeight).toBe(70);
  });

  test('resizeTextarea null', () => {
    expect(() => component.resizeTextarea(null as any, '')).not.toThrow();
  });

  test('resetTextAreaHeight', () => {
    component.searchQuery = '  test  ';
    component.textArea = { nativeElement: { style: { height: '60px' } } } as any;
    component.resetTextAreaHeight({} as any);
    expect(component.searchQuery.trim()).toBe('test');
  });

  test('resetTextAreaHeight no textArea', () => {
    component.textArea = undefined as any;
    expect(() => component.resetTextAreaHeight({} as any)).not.toThrow();
  });

  test('ngOnChanges chatId changed', () => {
    const changes = {
      chatId: {
        previousValue: 'old',
        currentValue: 'new',
        firstChange: false,
        isFirstChange: () => false
      }
    };
    const spy = jest.spyOn(component, 'startNewSupportAISearch').mockImplementation();
    component.ngOnChanges(changes as any);
    expect(component.startNewChat).toBe(true);
    expect(spy).toHaveBeenCalled();
  });

  test('ngOnChanges chatId unchanged', () => {
    const changes = {
      chatId: {
        previousValue: 'same',
        currentValue: 'same',
        firstChange: false,
        isFirstChange: () => false
      }
    };
    const spy = jest.spyOn(component, 'startNewSupportAISearch').mockImplementation();
    component.ngOnChanges(changes as any);
    expect(component.startNewChat).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  test('ngAfterViewInit', () => {
    const spy = jest.spyOn(component, 'resizeTextarea').mockImplementation();
    component.ngAfterViewInit();
    expect(spy).toHaveBeenCalledWith(component.textArea.nativeElement, '');
  });

  test('ngAfterViewChecked', () => {
    expect(() => component.ngAfterViewChecked()).not.toThrow();
  });

  test('ngOnDestroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  test('checkForAIQuestionResponse', () => {
    expect(() => component.checkForAIQuestionResponse()).not.toThrow();
  });

  // Line 464: createInititals with undefined array element
  test('createInititals with undefined name parts', () => {
    const name = 'John '; // Space at end creates undefined second element
    (component as any).createInititals(name);
    expect(component.initials).toBeDefined();
  });

  // Lines 498-500: Error response in sharePositiveContentRating
  test('sharePositiveContentRating error response', () => {
    const item = { query_id: 'q1' };
    component.chatId = 'chat1';
    component.userId = 'user1';
    component.aiSearchResultArr = [{ result: [{ feedback: '' }] }];
    
    // Mock error response
    mockChatbotService.saveAIChatPositiveContentRating = jest.fn(() => ({ 
      subscribe: jest.fn((callback: any) => {
        callback({ status: 'error' });
        return { unsubscribe: jest.fn() };
      })
    }));
    
    component.sharePositiveContentRating(item, 0, 0);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Something is wrong. Please try again later.', 'X',
      { duration: 5000, panelClass: ['error'] }
    );
  });

  // Lines 513-522: Dialog afterClosed with result vs no result
  test('openAIFeedbackPopup with dialog result', () => {
    const item = { query_id: 'q1' };
    component.aiSearchResultArr = [{ result: [{ feedback: '' }] }];
    
    // Mock dialog with result
    const mockDialogRef = {
      afterClosed: jest.fn(() => ({ 
        subscribe: jest.fn((callback: any) => {
          callback('some feedback result');
          return { unsubscribe: jest.fn() };
        })
      })),
      close: jest.fn()
    };
    mockDialog.open = jest.fn(() => mockDialogRef);
    
    const shareAIFeedbackSpy = jest.spyOn(component, 'shareAIFeedback').mockImplementation();
    
    component.openAIFeedbackPopup(item, 0, 0);
    expect(shareAIFeedbackSpy).toHaveBeenCalledWith(item, 'some feedback result', 0, 0);
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  test('openAIFeedbackPopup without dialog result', () => {
    const item = { query_id: 'q1' };
    component.aiSearchResultArr = [{ result: [{ feedback: '' }] }];
    
    // Mock dialog without result (null/undefined)
    const mockDialogRef = {
      afterClosed: jest.fn(() => ({ 
        subscribe: jest.fn((callback: any) => {
          callback(null); // No result
          return { unsubscribe: jest.fn() };
        })
      })),
      close: jest.fn()
    };
    mockDialog.open = jest.fn(() => mockDialogRef);
    
    component.openAIFeedbackPopup(item, 0, 0);
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  // Line 547: Error response in shareAIFeedback
  test('shareAIFeedback error response', () => {
    const item = { query_id: 'q1' };
    component.chatId = 'chat1';
    component.userId = 'user1';
    component.aiSearchResultArr = [{ result: [{ feedback: '' }] }];
    
    // Mock error response
    mockChatbotService.shareAIFeedback = jest.fn(() => ({ 
      subscribe: jest.fn((callback: any) => {
        callback({ status: 'error' });
        return { unsubscribe: jest.fn() };
      })
    }));
    
    component.shareAIFeedback(item, 'feedback', 0, 0);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Something is wrong. Please try again later.', 'X',
      { duration: 5000, panelClass: ['error'] }
    );
  });

  // Line 622: callFromInternet with item that has answer
  test('callFromInternet with existing answer - should not call API', () => {
    const item = { answer: 'existing answer' }; // Has answer, should not call internet
    component.aiSearchResultArr = [{ showFromInternet: true }];
    
    const internetSpy = jest.spyOn(mockChatbotService, 'aiGlobalSearchFromInternet');
    
    component.callFromInternet(item, 0);
    
    // Should not call internet search when answer exists
    expect(internetSpy).not.toHaveBeenCalled();
    expect(component.aiSearchResultArr[0].showFromInternet).toBe(false);
  });

  // Line 670: User with empty professionalDetails array
  test('callFromInternet with empty professionalDetails', () => {
    const item = { answer: null };
    component.userInfo = {
      professionalDetails: [], // Empty array
      departmentName: 'IT'
    };
    component.aiSearchResultArr = [{ showFromInternet: true }];
    
    component.callFromInternet(item, 0);
    expect(mockChatbotService.aiGlobalSearchFromInternet).toHaveBeenCalledWith(
      expect.objectContaining({ designation: '' }),
      expect.any(String),
      expect.any(String)
    );
  });

  // Lines 683-688: User without departmentName
  test('callFromInternet without departmentName', () => {
    const item = { answer: null };
    component.userInfo = {
      professionalDetails: [{ designation: 'Dev' }]
      // No departmentName property
    };
    component.aiSearchResultArr = [{ showFromInternet: true }];
    
    component.callFromInternet(item, 0);
    expect(mockChatbotService.aiGlobalSearchFromInternet).toHaveBeenCalledWith(
      expect.objectContaining({ department: '' }),
      expect.any(String),
      expect.any(String)
    );
  });

  // Line 714: Missing aiSearchResultArr index in rejectFromInternet
  test('rejectFromInternet with invalid index', () => {
    component.aiSearchResultArr = [{ showFromInternet: true }];
    
    // Try to reject from index that doesn't exist
    component.rejectFromInternet(5); // Index 5 doesn't exist
    
    expect(component.resultFetch).toBe(true);
    // Should not crash when accessing non-existent index
  });

  // Line 765: copyPath with undefined contentStart/contentEnd
  test('copyPath video with undefined timing', () => {
    const item = { 
      mimeType: 'video/mp4', 
      identifier: 'id1', 
      contentStart: undefined, 
      contentEnd: undefined 
    };
    component.copyPath(item, 0);
    expect(document.createElement).toHaveBeenCalledWith('textarea');
    expect(component.copiedIndex).toBe(0);
  });

  // Lines 797-800: submitSearchQuery with aiSearchResultArr length > 2
  test('submitSearchQuery with scroll emit timing', (done) => {
    const event = { preventDefault: jest.fn() };
    component.searchQuery = 'test query';
    component.aiSearchResultArr = [{ msg: '1' }, { msg: '2' }, { msg: '3' }]; // Length > 2
    
    // Mock scrollToBottomEvent emit
    component.scrollToBottomEvent = { emit: jest.fn() } as any;
    
    component.submitSearchQuery({} as any, event);
    
    // Check that setTimeout was called for scroll
    setTimeout(() => {
      expect(component.scrollToBottomEvent.emit).toHaveBeenCalled();
      done();
    }, 1);
  });

  // Lines 859-866: startNewSupportAISearch with no message in response
  test('startNewSupportAISearch without message in response', () => {
    component.startNewChat = true;
    component.userId = 'user1';
    
    // Mock response without message property
    mockChatbotService.aiStartChathForSupport = jest.fn(() => ({ 
      subscribe: jest.fn((callback: any) => {
        callback({ data: 'some data but no message' }); // No message property
        return { unsubscribe: jest.fn() };
      })
    }));
    
    component.startNewSupportAISearch();
    expect(component.initiateSupportNewChat).toBe(false);
  });

  // Lines 894-899: supportAISearch when initiateSupportNewChat is false
  test('supportAISearch when initiateSupportNewChat is false', () => {
    component.initiateSupportNewChat = false; // Set to false
    
    const aiSendSpy = jest.spyOn(mockChatbotService, 'aiSendChathForSupport');
    
    component.supportAISearch();
    
    // Should not call AI search when initiate flag is false
    expect(aiSendSpy).not.toHaveBeenCalled();
  });

  // Lines 906-913: Different branches in checkForApiCalls
  test('checkForApiCalls with existing chat data for information filter', () => {
    const faqData = { 
      en: { 
        information: { 
          quesMap: [{ quesId: '1', quesValue: 'Q1' }],
          recommendationMap: [],
          categoryMap: []
        } 
      } 
    };
    const langData = [{ code: 'en', name: 'English' }];
    
    (localStorage.getItem as jest.Mock)
      .mockReturnValueOnce('en')
      .mockReturnValueOnce(JSON.stringify(faqData))
      .mockReturnValueOnce(JSON.stringify(langData));
    
    component.currentFilter = 'information';
    component.chatInformation = []; // Empty chat information
    
    const initDataSpy = jest.spyOn(component, 'initData').mockImplementation();
    const getQnsSpy = jest.spyOn(component, 'getQns').mockImplementation();
    const getCategoriesSpy = jest.spyOn(component, 'getCategories').mockImplementation();
    
    component.checkForApiCalls();
    
    expect(initDataSpy).toHaveBeenCalled();
    expect(getQnsSpy).toHaveBeenCalled();
    expect(getCategoriesSpy).toHaveBeenCalled();
  });

  test('checkForApiCalls with existing chat data for issue filter', () => {
    const faqData = { 
      en: { 
        issue: { 
          quesMap: [{ quesId: '1', quesValue: 'Q1' }],
          recommendationMap: [],
          categoryMap: []
        } 
      } 
    };
    const langData = [{ code: 'en', name: 'English' }];
    
    (localStorage.getItem as jest.Mock)
      .mockReturnValueOnce('en')
      .mockReturnValueOnce(JSON.stringify(faqData))
      .mockReturnValueOnce(JSON.stringify(langData));
    
    component.currentFilter = 'issue';
    component.chatIssues = []; // Empty chat issues
    
    const initDataSpy = jest.spyOn(component, 'initData').mockImplementation();
    
    component.checkForApiCalls();
    
    expect(initDataSpy).toHaveBeenCalled();
  });

  test('checkForApiCalls with existing chat data and non-empty chat arrays', () => {
    const faqData = { 
      en: { 
        information: { 
          quesMap: [{ quesId: '1', quesValue: 'Q1' }],
          recommendationMap: [],
          categoryMap: []
        } 
      } 
    };
    const langData = [{ code: 'en', name: 'English' }];
    
    (localStorage.getItem as jest.Mock)
      .mockReturnValueOnce('en')
      .mockReturnValueOnce(JSON.stringify(faqData))
      .mockReturnValueOnce(JSON.stringify(langData));
    
    component.currentFilter = 'information';
    component.chatInformation = [{ msg: 'existing message' }]; // Non-empty
    
    const initDataSpy = jest.spyOn(component, 'initData').mockImplementation();
    
    component.checkForApiCalls();
    
    // Should not call initData when chat array is not empty
    expect(initDataSpy).not.toHaveBeenCalled();
    expect(component.userJourney).toBe(component.chatInformation);
  });

  // Additional edge cases for better coverage
  test('createInititals with single character name', () => {
    const name = 'A';
    (component as any).createInititals(name);
    expect(component.initials).toBe('A');
  });

  test('createInititals with multiple spaces', () => {
    const name = 'John    Doe'; // Multiple spaces
    (component as any).createInititals(name);
    expect(component.initials).toBe('JD');
  });

  test('splitParagraphByWords with empty paragraph', () => {
    const paragraph = '';
    const result = component.splitParagraphByWords(paragraph, 5);
    expect(result).toBe('');
  });

  test('splitParagraphByWords with whitespace only', () => {
    const paragraph = '   ';
    const result = component.splitParagraphByWords(paragraph, 5);
    expect(result).toBe('');
  });

  test('toggleFilter with same filter', () => {
    component.currentFilter = 'information';
    component.toggleFilter('information');
    expect(component.currentFilter).toBe('information');
  });

  test('showCategory with all categories when less than 6', () => {
    const catItem = { catId: 'all', catName: 'All Categories' };
    component.categories = [
      { catId: '1', catName: 'Cat1' },
      { catId: '2', catName: 'Cat2' }
    ]; // Less than 6 categories
    
    const sortCategorySpy = jest.spyOn(component, 'sortCategory').mockReturnValue([]);
    
    component.showCategory(catItem);
    expect(sortCategorySpy).toHaveBeenCalled();
  });
});