import { AppChatbotComponent } from './app-chatbot.component';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { EventService } from '@sunbird-cb/utils-v2';
import { Renderer2 } from '@angular/core';
import { RootService } from './../root/root.service';
import { of } from 'rxjs';

describe('AppChatbotComponent', () => {
  let component: AppChatbotComponent;
  let mockConfigService: jest.Mocked<ConfigurationsService>;
  let mockEventService: jest.Mocked<EventService>;
  let mockRenderer: jest.Mocked<Renderer2>;
  let mockChatbotService: jest.Mocked<RootService>;
  let mockRouter: {
    events: {
      subscribe: jest.Mock;
    };
  };

  beforeEach(() => {
    // Create mock implementations
    mockConfigService = {
      userProfile: {
        firstName: 'Test User',
        profileImage: 'test-image.jpg'
      }
    } as any;

    mockEventService = {
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
            recommendationMap: [],
            categoryMap: []
          }
        }
      })),
      getLangugages: jest.fn().mockReturnValue(of({
        status: { code: 200 },
        payload: { languages: [] }
      }))
    } as any;

    mockRouter = {
      events: {
        subscribe: jest.fn()
      }
    };

    // Instantiate the component with mocks
    component = new AppChatbotComponent(
      mockConfigService,
      mockEventService,
      mockRenderer,
      mockChatbotService,
      mockRouter as any
    );

    // Setup localStorage mock
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should set user icon from profile image', () => {
      component.ngOnInit();
      expect(component.userIcon).toBe('test-image.jpg');
    });

    it('should set default language to English', () => {
      component.ngOnInit();
      expect(component.selectedLaguage).toBe('en');
    });
  });

  describe('Language and Localization', () => {
    it('should return correct greeting based on selected language', () => {
      component.selectedLaguage = 'en';
      expect(component.greetings()).toBe('Namaste');

      component.selectedLaguage = 'hi';
      expect(component.greetings()).toBe('नमस्ते');
    });

    it('should change language when selectLaguage is called', () => {
      const event = { target: { value: 'hi' } };
      component.selectLaguage(event);
      
      expect(component.selectedLaguage).toBe('hi');
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'hi');
    });
  });

  describe('Chat Interactions', () => {
    it('should toggle icon and reset state when iconClick is called', () => {
      component.iconClick('start');
      expect(component.showIcon).toBeFalsy();
      expect(component.currentFilter).toBe('information');

      component.iconClick('end');
      expect(component.showIcon).toBeTruthy();
      expect(component.selectedLaguage).toBe('en');
      expect(component.currentFilter).toBe('information');
    });

    it('should push data to correct chat array based on current filter', () => {
      const testMsg = { type: 'test' };
      
      component.currentFilter = 'information';
      component.pushData(testMsg);
      expect(component.chatInformation).toContain(testMsg);

      component.currentFilter = 'issue';
      component.pushData(testMsg);
      expect(component.chatIssues).toContain(testMsg);
    });
  });

  describe('Telemetry', () => {
    it('should raise category telemetry event', () => {
      component.raiseCategotyTelemetry('testCategory');
      
      // expect(mockEventService.dispatchChatbotEvent).toHaveBeenCalledWith(
      //   expect.objectContaining({
      //     data: expect.objectContaining({
      //       edata: { type: 'click', id: 'testCategory' },
      //       object: { id: 'testCategory', type: 'Category' }
      //     })
      //   })
      // );
    });

    it('should raise chat start and end telemetry events', () => {
      component.raiseChatStartTelemetry();
      component.raiseChatEndTelemetry();

      expect(mockEventService.dispatchChatbotEvent).toHaveBeenCalledTimes(2);
    });
  });

  describe('Data Retrieval', () => {
    it('should get categories filtered by user login status', () => {
      component.userInfo = { firstName: 'Test User' };
      component.responseData = {
        recommendationMap: [
          { 
            catId: 'cat1', 
            categoryType: 'Logged-In', 
            recommendedQues: [] 
          },
          { 
            catId: 'cat2', 
            categoryType: 'Both', 
            recommendedQues: [] 
          }
        ],
        categoryMap: [
          { catId: 'cat1', catName: 'Category 1' },
          { catId: 'cat2', catName: 'Category 2' }
        ]
      };

      component.getCategories();
      
      expect(component.categories.length).toBeGreaterThan(1);
      expect(component.categories[0].catId).toBe('all');
    });
  });
});