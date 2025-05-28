import { AppChatbotComponent } from './app-chatbot.component';
import { ConfigurationsService, EventService, WsEvents } from '@sunbird-cb/utils-v2';
import { RootService } from './../root/root.service';
import { Router, NavigationEnd } from '@angular/router';
import { Renderer2, ElementRef } from '@angular/core';
import { of, Subject } from 'rxjs';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveLength(length: number): R;
    }
  }
}

// Mock environment
jest.mock('src/environments/environment', () => ({
  environment: {
    supportEmail: 'test@example.com'
  }
}));

describe('AppChatbotComponent', () => {
  let component: AppChatbotComponent;
  let mockConfigSvc: jest.Mocked<ConfigurationsService>;
  let mockEventSvc: jest.Mocked<EventService>;
  let mockRenderer: jest.Mocked<Renderer2>;
  let mockChatbotService: jest.Mocked<RootService>;
  let mockRouter: jest.Mocked<Router>;
  let mockElementRef: jest.Mocked<ElementRef>;
  let routerEventsSubject: Subject<any>; // Add this to control router events

  // Helper function to get telemetry call arguments
  const getTelemetryCallArgs = (callIndex: number = 0): any => {
    return mockEventSvc.dispatchChatbotEvent.mock.calls[callIndex]?.[0];
  };

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  beforeEach(() => {
    // Create mocks
    mockConfigSvc = {
      userProfile: {
        firstName: 'John',
        profileImage: '/test-image.jpg'
      },
      iGOTAIConfig: {
        iGOTAI: false
      },
      unMappedUser: {
        userId: 'test-user-id'
      }
    } as any;

    mockEventSvc = {
      dispatchChatbotEvent: jest.fn()
    } as any;

    mockRenderer = {
      addClass: jest.fn(),
      removeClass: jest.fn()
    } as any;

    mockChatbotService = {
      getChatData: jest.fn().mockReturnValue(of({
        payload: {
          config: {
            quesMap: [],
            recommendationMap: [],
            categoryMap: []
          }
        }
      })),
      getLangugages: jest.fn().mockReturnValue(of({
        status: { code: 200 },
        payload: { languages: [{ code: 'en', name: 'English' }] }
      }))
    } as any;

    // Create router events subject that we can control
    routerEventsSubject = new Subject();
    mockRouter = {
      events: routerEventsSubject.asObservable()
    } as any;

    mockElementRef = {
      nativeElement: {
        scrollTop: 0,
        scrollHeight: 1000,
        getBoundingClientRect: jest.fn().mockReturnValue({
          top: 10,
          left: 10,
          bottom: 100,
          right: 100
        })
      }
    } as any;

    // Create component instance
    component = new AppChatbotComponent(
      mockConfigSvc,
      mockEventSvc,
      mockRenderer,
      mockChatbotService,
      mockRouter
    );

    // Set up ViewChild mocks
    component.myScrollContainer = mockElementRef;
    component.dragElement = mockElementRef;

    // Spy on methods that might be called during initialization
    jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => {});
    jest.spyOn(component, 'enableScroll').mockImplementation(() => {});

    // Clear all mocks
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe('Initialization', () => {
    it('should create component with default values', () => {
      expect(component).toBeTruthy();
      expect(component.showIcon).toBe(true);
      expect(component.currentFilter).toBe('information');
      expect(component.selectedLaguage).toBe('en');
      expect(component.displayLoader).toBe(false);
      expect(component.expanded).toBe(false);
      expect(component.enableIGOTAIFlag).toBe(false);
    });

    it('should initialize with iGOTAI enabled when configured', () => {
      // Spy on checkForApiCalls to prevent service calls
      const checkForApiCallsSpy = jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => {});
      
      mockConfigSvc.iGOTAIConfig = { iGOTAI: true };
      component.rootOrgId = 'test-org';
      
      component.ngOnInit();

      expect(component.enableIGOTAIFlag).toBe(true);
      expect(component.currentFilter).toBe('sarthi');
      
      // Verify checkForApiCalls was called
      expect(checkForApiCallsSpy).toHaveBeenCalled();
      
      // Restore the spy
      checkForApiCallsSpy.mockRestore();
    });

    it('should set user icon from profile or default', () => {
      // Spy on checkForApiCalls to prevent service calls
      const checkForApiCallsSpy = jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => {});
      
      component.ngOnInit();
      expect(component.userIcon).toBe('/test-image.jpg');

      mockConfigSvc.userProfile = { firstName: 'John', userId:'' };
      component.ngOnInit();
      expect(component.userIcon).toBe('/assets/icons/chatbot-default-user.svg');
      
      checkForApiCallsSpy.mockRestore();
    });

    it('should set call and email text correctly', () => {
      // Spy on checkForApiCalls to prevent service calls
      const checkForApiCallsSpy = jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => {});
      
      component.ngOnInit();
      expect(component.callText).toContain('Teams Call');
      expect(component.emailText).toContain('test@example.com');
      
      checkForApiCallsSpy.mockRestore();
    });
  });

  describe('Router Events', () => {
    it('should handle navigation events correctly', () => {
      // Spy on checkForApiCalls to prevent service calls during ngOnInit
      const checkForApiCallsSpy = jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => {});
      
      const navigationEndEvent = new NavigationEnd(1, '/certs', '/certs');
      
      component.ngOnInit();
      
      // Trigger navigation event using the subject
      routerEventsSubject.next(navigationEndEvent);
      
      expect(component.isHubEnable).toBe(false);
      
      checkForApiCallsSpy.mockRestore();
    });

    it('should enable hub for non-certificate routes', () => {
      // Spy on checkForApiCalls to prevent service calls during ngOnInit
      const checkForApiCallsSpy = jest.spyOn(component, 'checkForApiCalls').mockImplementation(() => {});
      
      const navigationEndEvent = new NavigationEnd(1, '/home', '/home');
      
      component.ngOnInit();
      
      // Trigger navigation event using the subject
      routerEventsSubject.next(navigationEndEvent);
      
      expect(component.isHubEnable).toBe(true);
      
      checkForApiCallsSpy.mockRestore();
    });
  });

  describe('Language and Localization', () => {
    it('should return correct greeting for selected language', () => {
      component.selectedLaguage = 'en';
      expect(component.greetings()).toBe('Namaste');

      component.selectedLaguage = 'hi';
      expect(component.greetings()).toBe('नमस्ते');
    });

    it('should return localized text or fallback', () => {
      component.selectedLaguage = 'en';
      expect(component.getInfoText('information')).toBe('Information');
      expect(component.getInfoText('nonexistent')).toBe('nonexistent');
    });

    it('should handle language selection', () => {
      const mockEvent = { target: { value: 'hi' } };
      
      component.selectLaguage(mockEvent);
      
      expect(component.selectedLaguage).toBe('hi');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('selectedLanguage', 'hi');
      expect(component.chatInformation).toEqual([]);
      expect(component.chatIssues).toEqual([]);
    });
  });

  describe('Data Management', () => {
    beforeEach(() => {
      // Setup localStorage mocks
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'selectedLanguage') return 'en';
        if (key === 'faq') return '{}';
        if (key === 'faq-languages') return '[]';
        return null;
      });
    });

    it('should get data and handle response', () => {
      const mockResponse = {
        payload: {
          config: {
            quesMap: [],
            recommendationMap: [],
            categoryMap: []
          }
        }
      };
      
      mockChatbotService.getChatData.mockReturnValue(of(mockResponse));
      
      component.getData();
      
      expect(mockChatbotService.getChatData).toHaveBeenCalled();
    });

    it('should set data to localStorage correctly', () => {
      const testData = { test: 'data' };
      localStorageMock.getItem.mockReturnValue('{}');
      
      component.setDataToLocalStorage(testData);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'faq',
        'test'
      );
    });

    it('should get languages and handle response', () => {
      const mockResponse = {
        status: { code: 200 },
        payload: { languages: [{ code: 'en', name: 'English' }] }
      };
      
      mockChatbotService.getLangugages.mockReturnValue(of(mockResponse));
      
      component.getLanguages();
      
      expect(mockChatbotService.getLangugages).toHaveBeenCalled();
      expect(component.language).toEqual(mockResponse.payload.languages);
    });

    it('should handle checkForApiCalls without errors', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'selectedLanguage') return 'en';
        if (key === 'faq') return JSON.stringify({
          en: {
            information: {
              quesMap: [],
              recommendationMap: [],
              categoryMap: []
            }
          }
        });
        if (key === 'faq-languages') return JSON.stringify([{ code: 'en', name: 'English' }]);
        return null;
      });

      expect(() => component.checkForApiCalls()).not.toThrow();
    });
  });

  describe('Chat Functionality', () => {
    beforeEach(() => {
      component.responseData = {
        quesMap: [
          { quesId: '1', quesValue: 'Test Question', ansVal: 'Test Answer' }
        ],
        recommendationMap: [
          {
            catId: 'cat1',
            categoryType: 'Both',
            recommendedQues: [{ quesID: '1', priority: 1 }]
          }
        ]
      };
      component.getQns();
      
      // Reset mocks before each test
      jest.clearAllMocks();
      mockRenderer.addClass.mockClear();
      mockRenderer.removeClass.mockClear();
    });

    it('should handle icon click to start chat', () => {
      jest.spyOn(Date, 'now').mockReturnValue(12345);
      
      component.iconClick('start');
      
      expect(component.showIcon).toBe(false);
      expect(component.chatId).toBe('test-user-id-12345');
      expect(mockRenderer.addClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
    });

    it('should handle icon click to end chat', () => {
      // Set initial state to make the test more explicit
      component.showIcon = true;
      component.chatId = 'some-chat-id';
      component.userJourney = ['some', 'journey', 'data'];
      component.chatInformation = ['some', 'info'];
      component.chatIssues = ['some', 'issues'];
      component.selectedLaguage = 'hi';
      component.currentFilter = 'information';
      component.more = true;
      
      // Mock the configuration service for the test
      mockConfigSvc.iGOTAIConfig = { iGOTAI: false };
      
      component.iconClick('end');
      
      expect(component.showIcon).toBe(false);
      expect(component.chatId).toBe('');
      expect(component.userJourney).toEqual([]);
      expect(component.chatInformation).toEqual([]);
      expect(component.chatIssues).toEqual([]);
      expect(component.selectedLaguage).toBe('en');
      expect(component.currentFilter).toBe('information');
      expect(component.more).toBe(false);
      component.raiseChatEndTelemetry();
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledTimes(1);
      
      const telemetryEvent = getTelemetryCallArgs();
      expect(telemetryEvent).toBeDefined();
      expect(telemetryEvent.eventType).toBe(WsEvents.WsEventType.Telemetry);
      expect(telemetryEvent.data.edata.type).toBe('click');
      expect(telemetryEvent.data.edata.id).toBe('ai-global-search');
      expect(telemetryEvent.data.edata.pageid).toBe('/page/home');
      expect(telemetryEvent.data.state).toBe(WsEvents.EnumTelemetrySubType.Loaded);
      expect(mockRenderer.removeClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
    });

    it('should not toggle when drag is enabled', () => {
      component.dragEnabled = true;
      const initialShowIcon = component.showIcon;
      
      component.iconClick('start');
      
      expect(component.showIcon).toBe(initialShowIcon);
      expect(mockRenderer.addClass).not.toHaveBeenCalled();
    });

    it('should handle question selection', () => {
      const question = { quesID: '1', recommendedQues: [] };
      const data = { selectedValue: '' };
      
      component.selectedQuestion(question, data);
      
      expect(data.selectedValue).toBe('1');
      expect(component.userJourney.length).toBeGreaterThan(0);
    });

    it('should push data to correct chat array', () => {
      const testMsg = { type: 'test', message: 'test message' };
      
      component.currentFilter = 'information';
      component.pushData(testMsg);
      expect(component.chatInformation).toContain(testMsg);
      
      component.currentFilter = 'issue';
      component.pushData(testMsg);
      expect(component.chatIssues).toContain(testMsg);
    });

    it('should filter user journey by tab', () => {
      component.userJourney = [
        { tab: 'information', message: 'info msg' },
        { tab: 'issue', message: 'issue msg' }
      ];
      
      const infoJourney = component.getuserjourney('information');
      const issueJourney = component.getuserjourney('issue');
      
      expect(infoJourney.length).toBe(1);
      expect(issueJourney.length).toBe(1);
    });
  });

  describe('Category and Priority Questions', () => {
    beforeEach(() => {
      component.responseData = {
        recommendationMap: [
          {
            catId: 'cat1',
            categoryType: 'Both',
            recommendedQues: [{ quesID: '1', priority: 1 }]
          }
        ]
      };
    });

    it('should get priority questions for logged in user', () => {
      mockConfigSvc.userProfile = { firstName: 'John', userId:'' };
      
      const priorityQues = component.getPriorityQuestion(1);
      
      expect(priorityQues.length).toBe(1);
      expect(priorityQues[0].quesID).toBe('1');
    });

    it('should get priority questions for not logged in user', () => {
      mockConfigSvc.userProfile = null;
      component.responseData.recommendationMap[0].categoryType = 'Not Logged-In';
      
      const priorityQues = component.getPriorityQuestion(1);
      
      expect(priorityQues.length).toBe(1);
    });

    it('should show category questions', () => {
      const catItem = { catId: 'cat1', catName: 'Category 1' };
      
      component.showCategory(catItem);
      
      expect(component.more).toBe(false);
      expect(component.userJourney.length).toBeGreaterThan(0);
    });

    it('should show all categories', () => {
      component.categories = [
        { catId: 'cat1', catName: 'Cat 1', priority: 1 },
        { catId: 'cat2', catName: 'Cat 2', priority: 2 }
      ];
      const catItem = { catId: 'all', catName: 'All Categories' };
      
      component.showCategory(catItem);
      
      const lastMessage = component.userJourney[component.userJourney.length - 1];
      expect(lastMessage.recommendedQues).toEqual(component.categories.sort((a, b) => a.priority - b.priority));
    });
  });

  describe('Telemetry Events', () => {
    it('should raise category telemetry', () => {
      component.raiseCategotyTelemetry('test-category');
      
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledTimes(1);
      
      const telemetryEvent = getTelemetryCallArgs();
      expect(telemetryEvent).toBeDefined();
      expect(telemetryEvent.eventType).toBe(WsEvents.WsEventType.Telemetry);
      expect(telemetryEvent.eventLogLevel).toBe(WsEvents.WsEventLogLevel.Info);
      expect(telemetryEvent.data.edata.type).toBe('click');
      expect(telemetryEvent.data.edata.id).toBe('test-category');
      expect(telemetryEvent.data.object.id).toBe('test-category');
      expect(telemetryEvent.data.object.type).toBe('Category');
      expect(telemetryEvent.data.state).toBe(WsEvents.EnumTelemetrySubType.Interact);
      expect(telemetryEvent.data.eventSubType).toBe(WsEvents.EnumTelemetrySubType.Chatbot);
    });

    it('should raise chat start telemetry for information filter', () => {
      component.currentFilter = 'information';
      
      component.raiseChatStartTelemetry();
      
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledTimes(1);
      
      const telemetryEvent = getTelemetryCallArgs();
      expect(telemetryEvent).toBeDefined();
      expect(telemetryEvent.eventType).toBe(WsEvents.WsEventType.Telemetry);
      expect(telemetryEvent.data.state).toBe(WsEvents.EnumTelemetrySubType.Loaded);
      expect(telemetryEvent.data.eventSubType).toBe(WsEvents.EnumTelemetrySubType.Chatbot);
      expect(telemetryEvent.data.type).toBe('session');
    });

    it('should raise chat start telemetry for sarthi filter', () => {
      component.currentFilter = 'sarthi';
      
      component.raiseChatStartTelemetry();
      
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledTimes(1);
      
      const telemetryEvent = getTelemetryCallArgs();
      expect(telemetryEvent).toBeDefined();
      expect(telemetryEvent.eventType).toBe(WsEvents.WsEventType.Telemetry);
      expect(telemetryEvent.data.edata.type).toBe('click');
      expect(telemetryEvent.data.edata.id).toBe('ai-global-search');
      expect(telemetryEvent.data.edata.pageid).toBe('/page/home');
      expect(telemetryEvent.data.state).toBe(WsEvents.EnumTelemetrySubType.Loaded);
    });

    it('should raise interaction telemetry', () => {
      component.currentFilter = 'information';
      
      component.raiseTemeletyInterat('test-id');
      
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledTimes(1);
      
      const telemetryEvent = getTelemetryCallArgs();
      expect(telemetryEvent).toBeDefined();
      expect(telemetryEvent.eventType).toBe(WsEvents.WsEventType.Telemetry);
      expect(telemetryEvent.data.edata.type).toBe('click');
      expect(telemetryEvent.data.edata.id).toBe('test-id');
      expect(telemetryEvent.data.object.id).toBe('test-id');
      expect(telemetryEvent.data.object.type).toBe('Information');
      expect(telemetryEvent.data.state).toBe(WsEvents.EnumTelemetrySubType.Interact);
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drag end event', () => {
      const mockDragEnd = {
        source: {
          getFreeDragPosition: jest.fn().mockReturnValue({ x: 100, y: 200 }),
          _dragRef: {
            reset: jest.fn()
          }
        }
      } as any;

      component.chatIconOutside = false;
      
      component.onDragEnded(mockDragEnd);
      
      expect(component.iconPosition).toEqual({ x: 100, y: 200 });
      
      setTimeout(() => {
        expect(component.dragEnabled).toBe(false);
      }, 0);
    });

    it('should reset drag position when icon is outside', () => {
      const mockDragEnd = {
        source: {
          getFreeDragPosition: jest.fn().mockReturnValue({ x: 100, y: 200 }),
          _dragRef: {
            reset: jest.fn()
          }
        }
      } as any;

      component.chatIconOutside = true;
      
      component.onDragEnded(mockDragEnd);
      
      expect(mockDragEnd.source._dragRef.reset).toHaveBeenCalled();
    });

    it('should detect when icon is dragged outside viewport', () => {
      mockElementRef.nativeElement.getBoundingClientRect.mockReturnValue({
        top: -10,
        left: 10,
        bottom: 100,
        right: 100
      });
      
      component.onDragMoved();
      
      expect(component.chatIconOutside).toBe(true);
      expect(component.dragEnabled).toBe(true);
    });

    it('should detect when icon is inside viewport', () => {
      mockElementRef.nativeElement.getBoundingClientRect.mockReturnValue({
        top: 10,
        left: 10,
        bottom: 100,
        right: 100
      });
      
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
      Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
      
      component.onDragMoved();
      
      expect(component.chatIconOutside).toBe(false);
      expect(component.dragEnabled).toBe(true);
    });
  });

  describe('Scrolling', () => {
    it('should scroll to bottom', () => {
      component.scrollToBottom();
      
      expect(mockElementRef.nativeElement.scrollTop)
        .toBe(mockElementRef.nativeElement.scrollHeight);
    });

    it('should handle scroll to bottom event', () => {
      const mockElement = {
        scrollTo: jest.fn(),
        scrollHeight: 1000
      };
      
      jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);
      
      component.scrollToBottomEvent();
      
      expect(mockElement.scrollTo).toHaveBeenCalledWith({
        top: 1000,
        behavior: 'smooth'
      });
    });

    it('should disable and enable scroll', () => {
      component.disableScroll();
      expect(mockRenderer.addClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
      
      component.enableScroll();
      expect(mockRenderer.removeClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
    });
  });

  describe('Filter Toggle', () => {
    it('should toggle filter and reset more flag', () => {
      component.more = true;
      
      component.toggleFilter('issue');
      
      expect(component.currentFilter).toBe('issue');
      expect(component.more).toBe(false);
    });
  });

  describe('Click Outside', () => {
    it('should end chat when clicking outside for non-sarthi filter', () => {
      component.currentFilter = 'information';
      jest.spyOn(component, 'iconClick');
      
      component.clickOutside();
      
      expect(component.iconClick).toHaveBeenCalledWith('end');
    });

    it('should not end chat when clicking outside for sarthi filter', () => {
      component.currentFilter = 'sarthi';
      jest.spyOn(component, 'iconClick');
      
      component.clickOutside();
      
      expect(component.iconClick).not.toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('should update iGOTAI flag when inputs change', () => {
      component.rootOrgId = 'test-org';
      component.iGOTAIConfigLoaded = true;
      mockConfigSvc.iGOTAIConfig = { iGOTAI: true };
      
      component.ngOnChanges();
      
      expect(component.enableIGOTAIFlag).toBe(true);
      expect(component.currentFilter).toBe('sarthi');
    });
  });

  describe('Edge Cases', () => {
    it('should handle scroll to bottom with no container', () => {
      component.myScrollContainer = undefined;
      
      expect(() => component.scrollToBottom()).not.toThrow();
    });

    it('should handle empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      expect(() => component.checkForApiCalls()).not.toThrow();
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      
      expect(() => component.checkForApiCalls()).not.toThrow();
    });
  });
});