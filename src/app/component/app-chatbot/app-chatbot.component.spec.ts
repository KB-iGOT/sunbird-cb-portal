// app-chatbot.component.spec.ts
import { AppChatbotComponent } from './app-chatbot.component';
import { WsEvents } from '@sunbird-cb/utils-v2';
import {  NavigationEnd } from '@angular/router';
import { of, Subject } from 'rxjs';

// Test setup helpers
const createMockServices = () => ({
  mockConfigurationsService: {
    userProfile: {
      firstName: 'John',
      profileImage: '/path/to/image.jpg',
      userId: 'user123'
    },
    iGOTAIConfig: { iGOTAI: true },
    unMappedUser: { userId: 'user123' }
  },
  mockEventService: { dispatchChatbotEvent: jest.fn() },
  mockRootService: {
    getChatData: jest.fn(),
    getLangugages: jest.fn()
  },
  mockRenderer2: {
    addClass: jest.fn(),
    removeClass: jest.fn()
  },
  mockRouter: { events: new Subject() }
});

const createMockElementRef = () => ({
  nativeElement: {
    scrollTop: 0,
    scrollHeight: 1000,
    getBoundingClientRect: jest.fn(() => ({
      top: 100, left: 100, bottom: 200, right: 200
    }))
  }
});

// Setup global mocks
const setupGlobalMocks = () => {
  // Window mocks
  Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
  Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
  Object.defineProperty(window, 'scrollTo', { value: jest.fn(), writable: true });
  
  // Document mocks
  Object.defineProperty(document, 'body', { 
    value: { scrollHeight: 1000 },
    writable: true 
  });
  Object.defineProperty(document, 'getElementById', {
    value: jest.fn(() => ({ scrollTo: jest.fn() })),
    writable: true
  });
  
  // LocalStorage mock
  const localStorageMock = {
    getItem: jest.fn(() => '{}'),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  
  return { localStorageMock };
};

describe('AppChatbotComponent', () => {
  let component: AppChatbotComponent;
  let services: ReturnType<typeof createMockServices>;
  let mocks: ReturnType<typeof setupGlobalMocks>;

  beforeAll(() => {
    mocks = setupGlobalMocks();
  });

  beforeEach(() => {
    services = createMockServices();
    jest.clearAllMocks();
    
    component = new AppChatbotComponent(
      services.mockConfigurationsService as any,
      services.mockEventService as any,
      services.mockRenderer2 as any,
      services.mockRootService as any,
      services.mockRouter as any
    );
    
    component.myScrollContainer = createMockElementRef() as any;
    component.dragElement = createMockElementRef() as any;
  });

  afterEach(() => {
    // Clean up subjects to prevent memory leaks
    if (services.mockRouter.events instanceof Subject) {
      services.mockRouter.events.complete();
    }
    jest.clearAllMocks();
  });

  describe('Basic Component Tests', () => {
    test('should create component', () => {
      expect(component).toBeTruthy();
    });

    test('should initialize with default values', () => {
      expect(component.showIcon).toBe(true);
      expect(component.currentFilter).toBe('information');
      expect(component.selectedLaguage).toBe('en');
      expect(component.displayLoader).toBe(false);
    });

    test('should set user info on ngOnInit', () => {
      component.ngOnInit();
      expect(component.userInfo).toEqual(services.mockConfigurationsService.userProfile);
      expect(component.userIcon).toBe('/path/to/image.jpg');
    });
  });

  describe('Language Functionality', () => {
    test('should return correct greeting', () => {
      component.selectedLaguage = 'en';
      expect(component.greetings()).toBe('Namaste');
    });

    test('should handle language selection', () => {
      const mockEvent = { target: { value: 'hi' } };
      component.selectLaguage(mockEvent);
      
      expect(component.selectedLaguage).toBe('hi');
      expect(mocks.localStorageMock.setItem).toHaveBeenCalledWith('selectedLanguage', 'hi');
    });
  });

  describe('Chat Operations', () => {
    test('should toggle icon and start chat', () => {
      const spyTelemetry = jest.spyOn(component, 'raiseChatStartTelemetry').mockImplementation();
      const spyScroll = jest.spyOn(component, 'disableScroll').mockImplementation();
      
      component.iconClick('start');
      
      expect(component.showIcon).toBe(false);
      expect(component.chatId).toContain('user123-');
      expect(spyTelemetry).toHaveBeenCalled();
      expect(spyScroll).toHaveBeenCalled();
      
      spyTelemetry.mockRestore();
      spyScroll.mockRestore();
    });

    test('should end chat and reset state', () => {
      const spyTelemetry = jest.spyOn(component, 'raiseChatEndTelemetry').mockImplementation();
      const spyScroll = jest.spyOn(component, 'enableScroll').mockImplementation();
      const spyCheck = jest.spyOn(component, 'checkForApiCalls').mockImplementation();
      
      component.iconClick('end');
      
      expect(component.chatId).toBe('');
      expect(component.userJourney).toEqual([]);
      expect(spyTelemetry).toHaveBeenCalled();
      
      spyTelemetry.mockRestore();
      spyScroll.mockRestore();
      spyCheck.mockRestore();
    });
  });

  describe('Data Management', () => {
    test('should get chat data successfully', () => {
      const mockResponse = { payload: { config: { test: 'data' } } };
      services.mockRootService.getChatData.mockReturnValue(of(mockResponse));
      
      const spySetData = jest.spyOn(component, 'setDataToLocalStorage').mockImplementation();
      const spyCheck = jest.spyOn(component, 'checkForApiCalls').mockImplementation();
      
      component.getData();
      
      expect(services.mockRootService.getChatData).toHaveBeenCalled();
      expect(spySetData).toHaveBeenCalledWith({ test: 'data' });
      
      spySetData.mockRestore();
      spyCheck.mockRestore();
    });

    test('should set data to localStorage', () => {
      const testData = { test: 'data' };
      const spyToggle = jest.spyOn(component, 'toggleFilter').mockImplementation();
      
      component.setDataToLocalStorage(testData);
      
      expect(mocks.localStorageMock.setItem).toHaveBeenCalled();
      expect(spyToggle).toHaveBeenCalled();
      
      spyToggle.mockRestore();
    });
  });

  describe('Telemetry Events', () => {
    test('should raise chat start telemetry', () => {
      component.currentFilter = 'information';
      component.raiseChatStartTelemetry();
      
      expect(services.mockEventService.dispatchChatbotEvent).toHaveBeenCalled();
      const call = services.mockEventService.dispatchChatbotEvent.mock.calls[0][0];
      expect(call.eventType).toBe(WsEvents.WsEventType.Telemetry);
    });

    test('should raise interaction telemetry', () => {
      component.currentFilter = 'information';
      component.raiseTemeletyInterat('test-id');
      
      expect(services.mockEventService.dispatchChatbotEvent).toHaveBeenCalled();
      const call = services.mockEventService.dispatchChatbotEvent.mock.calls[0][0];
      expect(call.data.edata.id).toBe('test-id');
    });
  });

  describe('Scroll Operations', () => {
    test('should scroll to bottom safely', () => {
      expect(() => component.scrollToBottom()).not.toThrow();
    });

    test('should handle scroll operations', () => {
      component.disableScroll();
      expect(services.mockRenderer2.addClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
      
      component.enableScroll();
      expect(services.mockRenderer2.removeClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
    });
  });

  describe('Drag Operations', () => {
    test('should handle drag end', () => {
      const mockDragEnd = {
        source: {
          getFreeDragPosition: jest.fn(() => ({ x: 100, y: 100 })),
          _dragRef: { reset: jest.fn() }
        }
      } as any;
      
      component.chatIconOutside = false;
      component.onDragEnded(mockDragEnd);
      
      expect(component.iconPosition).toEqual({ x: 100, y: 100 });
    });

    test('should detect drag outside viewport', () => {
      component.dragElement.nativeElement.getBoundingClientRect = jest.fn(() => ({
        top: -10, left: 100, bottom: 200, right: 200
      }));
      
      component.onDragMoved();
      
      expect(component.dragEnabled).toBe(true);
      expect(component.chatIconOutside).toBe(true);
    });
  });

  describe('Router Events', () => {
    test('should handle navigation events', () => {
      component.ngOnInit();
      
      const navEvent = new NavigationEnd(1, '/certs/test', '/certs/test');
      services.mockRouter.events.next(navEvent);
      
      expect(component.isHubEnable).toBe(false);
    });
  });

  describe('Question Management', () => {
    beforeEach(() => {
      component.responseData = {
        quesMap: [{ quesId: 'q1', quesValue: 'Question 1', ansVal: 'Answer 1' }],
        recommendationMap: [{
          catId: 'cat1',
          categoryType: 'Both',
          recommendedQues: [{ quesID: 'q1', priority: 1 }]
        }]
      };
      component.questionsAndAns = { q1: component.responseData.quesMap[0] };
    });

    test('should handle question selection', () => {
      const question = { quesID: 'q1' };
      const data = { selectedValue: '' };
      
      const spyPush = jest.spyOn(component, 'pushData').mockImplementation();
      const spyTelemetry = jest.spyOn(component, 'raiseTemeletyInterat').mockImplementation();
      
      component.selectedQuestion(question, data);
      
      expect(data.selectedValue).toBe('q1');
      expect(spyPush).toHaveBeenCalledTimes(2);
      expect(spyTelemetry).toHaveBeenCalledWith('q1');
      
      spyPush.mockRestore();
      spyTelemetry.mockRestore();
    });

    test('should get priority questions', () => {
      component.userInfo = services.mockConfigurationsService.userProfile;
      const questions = component.getPriorityQuestion(1);
      expect(Array.isArray(questions)).toBe(true);
    });
  });

  describe('Filter Operations', () => {
    test('should toggle filter', () => {
      const spyCheck = jest.spyOn(component, 'checkForApiCalls').mockImplementation();
      
      component.toggleFilter('issue');
      
      expect(component.currentFilter).toBe('issue');
      expect(component.more).toBe(false);
      expect(spyCheck).toHaveBeenCalled();
      
      spyCheck.mockRestore();
    });

    test('should handle click outside', () => {
      component.currentFilter = 'information';
      const spyIcon = jest.spyOn(component, 'iconClick').mockImplementation();
      
      component.clickOutside();
      
      expect(spyIcon).toHaveBeenCalledWith('end');
      spyIcon.mockRestore();
    });
  });
});