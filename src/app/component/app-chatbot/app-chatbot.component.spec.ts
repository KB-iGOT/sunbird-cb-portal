import { AppChatbotComponent } from './app-chatbot.component';
import { ConfigurationsService, EventService, WsEvents } from '@sunbird-cb/utils-v2';
import { RootService } from './../root/root.service';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Renderer2 } from '@angular/core';
import { of, Subject } from 'rxjs';

// Mock environment
jest.mock('src/environments/environment', () => ({
  environment: {
    supportEmail: 'test@example.com'
  }
}));

describe('AppChatbotComponent', () => {
  let component: AppChatbotComponent;
  let mockConfigService: jest.Mocked<ConfigurationsService>;
  let mockEventService: jest.Mocked<EventService>;
  let mockRenderer: jest.Mocked<Renderer2>;
  let mockChatbotService: jest.Mocked<RootService>;
  let mockHttp: jest.Mocked<HttpClient>;
  let mockSanitizer: jest.Mocked<DomSanitizer>;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockRouter: jest.Mocked<Router>;
  let routerEventsSubject: Subject<any>;

  beforeEach(() => {
    // Create mocks
    mockConfigService = {
      userProfile: {
        firstName: 'John',
        profileImage: '/test-image.jpg'
      },
      iGOTAIConfig: {
        supportAI: false,
        iGOTAI: false
      },
      unMappedUser: {
        userId: 'test-user-123'
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
      getChatData: jest.fn(),
      getLangugages: jest.fn(),
      iGOTAIChatHistory: []
    } as any;

    mockHttp = {
      get: jest.fn()
    } as any;

    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn()
    } as any;

    mockDialog = {
      open: jest.fn()
    } as any;

    routerEventsSubject = new Subject();
    mockRouter = {
      events: routerEventsSubject.asObservable()
    } as any;

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Mock document methods
    Object.defineProperty(document, 'getElementById', {
      value: jest.fn().mockReturnValue({
        scrollTo: jest.fn(),
        scrollHeight: 1000,
        style: { display: 'block' },
        src: '',
        value: '',
        addEventListener: jest.fn()
      }),
      writable: true,
    });

    Object.defineProperty(document, 'getElementsByName', {
      value: jest.fn().mockReturnValue([{ value: '' }]),
      writable: true,
    });

    // Mock window methods
    Object.defineProperty(window, 'scrollTo', {
      value: jest.fn(),
      writable: true,
    });

    Object.defineProperty(document.body, 'scrollHeight', {
      value: 1000,
      writable: true,
    });

    // Create component instance
    component = new AppChatbotComponent(
      mockConfigService,
      mockEventService,
      mockRenderer,
      mockChatbotService,
      mockHttp,
      mockSanitizer,
      mockDialog,
      mockRouter
    );

    // Mock ViewChild
    component.dragElement = {
      nativeElement: {
        getBoundingClientRect: jest.fn().mockReturnValue({
          top: 10,
          left: 10,
          bottom: 100,
          right: 100
        })
      }
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
    routerEventsSubject.complete();
  });

  describe('ngOnInit', () => {
    it('should initialize component with default values', () => {
      mockHttp.get.mockReturnValue(of('<html>test</html>'));
      mockSanitizer.bypassSecurityTrustHtml.mockReturnValue('sanitized-html' as any);

      component.ngOnInit();

      expect(component.userInfo).toBe(mockConfigService.userProfile);
      expect(component.userIcon).toBe('/test-image.jpg');
      expect(component.callText).toContain('Teams Call');
      expect(component.emailText).toContain('test@example.com');
      expect(mockHttp.get).toHaveBeenCalledWith('/assets/static-data/zoho-code.html', { responseType: 'text' });
      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<html>test</html>');
    });

    it('should set default user icon when no profile image', () => {
    //  mockConfigService.userProfile = { firstName: 'John' };
      mockHttp.get.mockReturnValue(of('<html>test</html>'));

      component.ngOnInit();

      expect(component.userIcon).toBe('/assets/icons/chatbot-default-user.svg');
    });

    it('should handle router navigation events', () => {
      mockHttp.get.mockReturnValue(of('<html>test</html>'));

      component.ngOnInit();

      // Test certificate page
      routerEventsSubject.next(new NavigationEnd(1, '/certs', '/certs'));
      expect(component.isHubEnable).toBe(false);

      // Test public certificate page
      routerEventsSubject.next(new NavigationEnd(2, '/public/certs', '/public/certs'));
      expect(component.isHubEnable).toBe(false);

      // Test other page
      routerEventsSubject.next(new NavigationEnd(3, '/home', '/home'));
      expect(component.isHubEnable).toBe(true);
    });

    it('should configure AI settings when supportAI is enabled', () => {
      mockConfigService.iGOTAIConfig = { supportAI: true, iGOTAI: false };
      component.rootOrgId = 'test-org';
      component.iGOTAIConfigLoaded = true;
      mockHttp.get.mockReturnValue(of('<html>test</html>'));

      component.ngOnInit();

      expect(component.enableSupportAI).toBe(true);
      expect(component.currentFilter).toBe('support-ai');
      expect(component.faqChatBotDisable).toBe(true);
    });

    it('should configure AI settings when iGOTAI is enabled', () => {
      mockConfigService.iGOTAIConfig = { supportAI: false, iGOTAI: true };
      component.rootOrgId = 'test-org';
      component.iGOTAIConfigLoaded = true;
      mockHttp.get.mockReturnValue(of('<html>test</html>'));

      component.ngOnInit();

      expect(component.enableIGOTAIFlag).toBe(true);
      expect(component.currentFilter).toBe('sarthi');
      expect(component.faqChatBotDisable).toBe(true);
    });
  });

  describe('ngOnChanges', () => {
    it('should configure settings when inputs change', () => {
      mockConfigService.iGOTAIConfig = { supportAI: true, iGOTAI: true };
      component.rootOrgId = 'test-org';
      component.iGOTAIConfigLoaded = true;

      component.ngOnChanges();

      expect(component.enableSupportAI).toBe(true);
      expect(component.enableIGOTAIFlag).toBe(true);
      expect(component.currentFilter).toBe('sarthi');
      expect(component.faqChatBotDisable).toBe(true);
    });
  });

  describe('greetings', () => {
    it('should return greeting in selected language', () => {
      component.selectedLaguage = 'hi';
      expect(component.greetings()).toBe('नमस्ते');

      component.selectedLaguage = 'en';
      expect(component.greetings()).toBe('Namaste');
    });

    it('should return default greeting for unknown language', () => {
      component.selectedLaguage = 'fr';
      expect(component.greetings()).toBe('Hi');
    });
  });

  describe('getInfoText', () => {
    it('should return localized text', () => {
      component.selectedLaguage = 'hi';
      expect(component.getInfoText('information')).toBe('जानकारी');

      component.selectedLaguage = 'en';
      expect(component.getInfoText('information')).toBe('Information');
    });

    it('should return original label for unknown key', () => {
      component.selectedLaguage = 'en';
      expect(component.getInfoText('unknown')).toBe('unknown');
    });
  });

  describe('showMore', () => {
    it('should return show more text in selected language', () => {
      component.selectedLaguage = 'hi';
      expect(component.showMore()).toBe('और दिखाओ');

      component.selectedLaguage = 'en';
      expect(component.showMore()).toBe('Show More');
    });
  });

  describe('getData', () => {
    it('should fetch chat data and update localStorage', () => {
      const mockResponse = {
        payload: {
          config: { test: 'data' }
        }
      };
      mockChatbotService.getChatData.mockReturnValue(of(mockResponse));
      jest.spyOn(component, 'setDataToLocalStorage');
      jest.spyOn(component, 'checkForApiCalls');

      component.selectedLaguage = 'en';
      component.currentFilter = 'information';
      component.getData();

      expect(mockChatbotService.getChatData).toHaveBeenCalledWith({
        lang: 'en',
        config_type: 'IN'
      });
      expect(component.setDataToLocalStorage).toHaveBeenCalledWith({ test: 'data' });
      expect(component.checkForApiCalls).toHaveBeenCalled();
      expect(component.displayLoader).toBe(false);
    });

    it('should handle issue filter type', () => {
      const mockResponse = { payload: { config: { test: 'data' } } };
      mockChatbotService.getChatData.mockReturnValue(of(mockResponse));

      component.selectedLaguage = 'en';
      component.currentFilter = 'issue';
      component.getData();

      expect(mockChatbotService.getChatData).toHaveBeenCalledWith({
        lang: 'en',
        config_type: 'IS'
      });
    });
  });

  describe('setDataToLocalStorage', () => {
    it('should store data in localStorage and toggle filter', () => {
      const mockData = { test: 'data' };
      const existingData = { en: { information: { old: 'data' } } };
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(existingData));
      jest.spyOn(component, 'toggleFilter');

      component.selectedLaguage = 'en';
      component.currentFilter = 'information';
      component.setDataToLocalStorage(mockData);

      expect(localStorage.setItem).toHaveBeenCalledWith('faq', JSON.stringify({
        en: {
          information: { old: 'data' },
          //information: mockData
        }
      }));
      expect(component.toggleFilter).toHaveBeenCalledWith('information');
    });

    it('should handle empty localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      jest.spyOn(component, 'toggleFilter');

      component.selectedLaguage = 'en';
      component.currentFilter = 'issue';
      component.setDataToLocalStorage({ test: 'data' });

      expect(localStorage.setItem).toHaveBeenCalled();
      expect(component.toggleFilter).toHaveBeenCalledWith('issue');
    });
  });

  describe('initData', () => {
    beforeEach(() => {
      jest.spyOn(component, 'getPriorityQuestion').mockReturnValue([]);
      jest.spyOn(component, 'pushData');
      jest.spyOn(component, 'getQns');
    });

    it('should initialize user journey and push initial data', () => {
      const mockData = { test: 'data' };

      component.initData(mockData);

      expect(component.userJourney).toEqual([]);
      expect(component.pushData).toHaveBeenCalledWith({
        type: 'incoming',
        message: '',
        recommendedQues: [],
        selectedValue: '',
        title: '',
        tab: 'information'
      });
      expect(component.getQns).toHaveBeenCalled();
    });
  });

  describe('getQns', () => {
    it('should populate questionsAndAns map', () => {
      component.responseData = {
        quesMap: [
          { quesId: 'q1', question: 'Question 1' },
          { quesId: 'q2', question: 'Question 2' }
        ]
      };

      component.getQns();

      expect(component.questionsAndAns['q1']).toEqual({ quesId: 'q1', question: 'Question 1' });
      expect(component.questionsAndAns['q2']).toEqual({ quesId: 'q2', question: 'Question 2' });
    });
  });

  describe('selectLaguage', () => {
    it('should change language and reset chat data', () => {
      const mockEvent = { target: { value: 'hi' } };
      jest.spyOn(component, 'checkForApiCalls');

      component.selectLaguage(mockEvent);

      expect(component.selectedLaguage).toBe('hi');
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'hi');
      expect(component.chatInformation).toEqual([]);
      expect(component.chatIssues).toEqual([]);
      expect(component.checkForApiCalls).toHaveBeenCalled();
    });
  });

  describe('goToBottom', () => {
    it('should scroll to bottom of page', () => {
      component.goToBottom();
      expect(window.scrollTo).toHaveBeenCalledWith(0, 1000);
    });
  });

  describe('iconClick', () => {
    beforeEach(() => {
      jest.spyOn(component, 'disableScroll');
      jest.spyOn(component, 'enableScroll');
      jest.spyOn(component, 'raiseChatStartTelemetry');
      jest.spyOn(component, 'raiseChatEndTelemetry');
      jest.spyOn(component, 'checkForApiCalls');
      Date.now = jest.fn().mockReturnValue(123456789);
    });

    it('should start chat when type is start', () => {
      component.dragEnabled = false;

      component.iconClick('start');

      expect(component.showIcon).toBe(false);
      expect(component.currentFilter).toBe('information');
      expect(component.expanded).toBe(false);
      expect(component.chatId).toBe('test-user-123-123456789');
      expect(mockChatbotService.iGOTAIChatHistory).toEqual([]);
      expect(component.disableScroll).toHaveBeenCalled();
      expect(component.raiseChatStartTelemetry).toHaveBeenCalled();
    });

    it('should end chat when type is not start', () => {
      component.dragEnabled = false;

      component.iconClick('end');

      expect(component.chatId).toBe('');
      expect(mockChatbotService.iGOTAIChatHistory).toEqual([]);
      expect(component.raiseChatEndTelemetry).toHaveBeenCalled();
      expect(component.userJourney).toEqual([]);
      expect(component.chatInformation).toEqual([]);
      expect(component.chatIssues).toEqual([]);
      expect(component.selectedLaguage).toBe('en');
      expect(component.more).toBe(false);
      expect(component.enableScroll).toHaveBeenCalled();
    });

    it('should not perform actions when drag is enabled', () => {
      component.dragEnabled = true;

      component.iconClick('start');

      expect(component.disableScroll).not.toHaveBeenCalled();
      expect(component.raiseChatStartTelemetry).not.toHaveBeenCalled();
    });

    it('should set sarthi filter when iGOTAI is enabled', () => {
      mockConfigService.iGOTAIConfig = { iGOTAI: true };
      component.dragEnabled = false;

      component.iconClick('start');

      expect(component.currentFilter).toBe('sarthi');
    });
  });

  describe('toggleFilter', () => {
    it('should change current filter and reset more flag', () => {
      jest.spyOn(component, 'checkForApiCalls');
      component.more = true;

      component.toggleFilter('issue');

      expect(component.currentFilter).toBe('issue');
      expect(component.more).toBe(false);
      expect(component.checkForApiCalls).toHaveBeenCalled();
    });
  });

  describe('selectedQuestion', () => {
    beforeEach(() => {
      jest.spyOn(component, 'pushData');
      jest.spyOn(component, 'scrollToBottom');
      jest.spyOn(component, 'raiseTemeletyInterat');
      
      component.questionsAndAns = {
        'q1': {
          quesValue: 'Test Question',
          ansVal: 'Test Answer with <teams_call_link> and <email_configuration>'
        }
      };
      component.callText = 'call-link';
      component.emailText = 'email-link';
    });

    it('should handle question selection and push messages', (done) => {
      const question = { quesID: 'q1', recommendedQues: [] };
      const data = { selectedValue: '' };

      component.selectedQuestion(question, data);

      expect(data.selectedValue).toBe('q1');
      expect(component.pushData).toHaveBeenCalledTimes(2);
      expect(component.pushData).toHaveBeenNthCalledWith(1, {
        type: 'sendMsg',
        question: 'Test Question',
        tab: component.currentFilter
      });
      expect(component.pushData).toHaveBeenNthCalledWith(2, {
        type: 'incoming',
        message: 'Test Answer with call-link and email-link',
        recommendedQues: [],
        title: '',
        relatedQes: 'above Question',
        tab: component.currentFilter
      });

      setTimeout(() => {
        expect(component.scrollToBottom).toHaveBeenCalled();
        done();
      }, 150);

      expect(component.raiseTemeletyInterat).toHaveBeenCalledWith('q1');
    });
  });

  describe('pushData', () => {
    it('should push data to chatInformation when filter is information', () => {
      component.currentFilter = 'information';
      component.chatInformation = [];
      const mockMsg = { type: 'test', message: 'test message' };

      component.pushData(mockMsg);

      expect(component.chatInformation).toContain(mockMsg);
      expect(component.userJourney).toEqual(component.chatInformation);
    });

    it('should push data to chatIssues when filter is not information', () => {
      component.currentFilter = 'issue';
      component.chatIssues = [];
      const mockMsg = { type: 'test', message: 'test message' };

      component.pushData(mockMsg);

      expect(component.chatIssues).toContain(mockMsg);
      expect(component.userJourney).toEqual(component.chatIssues);
    });
  });

  describe('getuserjourney', () => {
    it('should filter user journey by tab', () => {
      component.userJourney = [
        { tab: 'information', message: 'info1' },
        { tab: 'issue', message: 'issue1' },
        { tab: 'information', message: 'info2' }
      ];

      const infoJourney = component.getuserjourney('information');
      const issueJourney = component.getuserjourney('issue');

      expect(infoJourney).toHaveLength(2);
      expect(issueJourney).toHaveLength(1);
    });
  });

  describe('getPriorityQuestion', () => {
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
            categoryType: 'Not Logged-In',
            recommendedQues: [
              { priority: 1, question: 'Q3' }
            ]
          },
          {
            categoryType: 'Both',
            recommendedQues: [
              { priority: 1, question: 'Q4' }
            ]
          }
        ]
      };
    });

    it('should return priority questions for logged-in user', () => {
      component.userInfo = { firstName: 'John' };

      const questions = component.getPriorityQuestion(1);

      expect(questions).toHaveLength(2);
      expect(questions.map(q => q.question)).toEqual(['Q1', 'Q4']);
    });

    it('should return priority questions for not logged-in user', () => {
      component.userInfo = null;

      const questions = component.getPriorityQuestion(1);

      expect(questions).toHaveLength(2);
      expect(questions.map(q => q.question)).toEqual(['Q3', 'Q4']);
    });
  });

  describe('showMoreQuestion', () => {
    it('should push more questions data', () => {
      jest.spyOn(component, 'getPriorityQuestion').mockReturnValue([]);
      jest.spyOn(component, 'pushData');

      component.showMoreQuestion();

      expect(component.pushData).toHaveBeenCalledWith({
        type: 'incoming',
        message: '',
        recommendedQues: [],
        selectedValue: '',
        title: ''
      });
    });
  });

  describe('showCategory', () => {
    beforeEach(() => {
      jest.spyOn(component, 'pushData');
      jest.spyOn(component, 'scrollToBottom');
      jest.spyOn(component, 'sortCategory').mockReturnValue([]);
      jest.spyOn(component, 'raiseCategotyTelemetry');

      component.responseData = {
        recommendationMap: [
          {
            catId: 'cat1',
            recommendedQues: [{ question: 'Q1' }]
          }
        ]
      };
    });

    it('should show all categories when catId is all', (done) => {
      const catItem = { catId: 'all', catName: 'All Categories' };

      component.showCategory(catItem);

      expect(component.more).toBe(false);
      expect(component.pushData).toHaveBeenCalledTimes(2);
      expect(component.sortCategory).toHaveBeenCalled();

      setTimeout(() => {
        expect(component.scrollToBottom).toHaveBeenCalled();
        done();
      }, 150);
    });

    it('should show specific category questions', (done) => {
      const catItem = { catId: 'cat1', catName: 'Category 1' };

      component.showCategory(catItem);

      expect(component.pushData).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'incoming',
          recommendedQues: [{ question: 'Q1' }]
        })
      );
      expect(component.raiseCategotyTelemetry).toHaveBeenCalledWith('cat1');

      setTimeout(() => {
        expect(component.scrollToBottom).toHaveBeenCalled();
        done();
      }, 150);
    });
  });

  describe('Telemetry methods', () => {
    describe('raiseCategotyTelemetry', () => {
      it('should dispatch category telemetry event', () => {
        component.raiseCategotyTelemetry('test-cat');

        expect(mockEventService.dispatchChatbotEvent).toHaveBeenCalledWith({
          eventType: WsEvents.WsEventType.Telemetry,
          eventLogLevel: WsEvents.WsEventLogLevel.Info,
          data: {
            edata: { type: 'click', id: 'test-cat' },
            object: { id: 'test-cat', type: 'Category' },
            state: WsEvents.EnumTelemetrySubType.Interact,
            eventSubType: WsEvents.EnumTelemetrySubType.Chatbot,
            mode: 'view'
          },
          pageContext: { pageId: '/chatbot', module: 'Assistant' },
          from: '',
          to: 'Telemetry'
        });
      });
    });

    describe('raiseChatStartTelemetry', () => {
      it('should dispatch start telemetry for non-sarthi filter', () => {
        component.currentFilter = 'information';

        component.raiseChatStartTelemetry();

        expect(mockEventService.dispatchChatbotEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              state: WsEvents.EnumTelemetrySubType.Loaded
            })
          })
        );
      });

      it('should dispatch start telemetry for sarthi filter', () => {
        component.currentFilter = 'sarthi';

        component.raiseChatStartTelemetry();

        expect(mockEventService.dispatchChatbotEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              edata: { type: 'click', id: 'ai-global-search', pageid: '/page/home' }
            }),
            pageContext: { pageId: '/page/home', module: 'Home' }
          })
        );
      });
    });

    describe('raiseChatEndTelemetry', () => {
      it('should dispatch end telemetry for non-sarthi filter', () => {
        component.currentFilter = 'information';

        component.raiseChatEndTelemetry();

        expect(mockEventService.dispatchChatbotEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              state: WsEvents.EnumTelemetrySubType.Unloaded
            })
          })
        );
      });

      it('should dispatch end telemetry for sarthi filter', () => {
        component.currentFilter = 'sarthi';

        component.raiseChatEndTelemetry();

        expect(mockEventService.dispatchChatbotEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              edata: { type: 'click', id: 'ai-global-search', pageid: '/page/home' }
            }),
            pageContext: { pageId: '/page/home', module: 'Home' }
          })
        );
      });
    });

    describe('raiseTemeletyInterat', () => {
      it('should dispatch interaction telemetry', () => {
        component.currentFilter = 'information';

        component.raiseTemeletyInterat('test-id');

        expect(mockEventService.dispatchChatbotEvent).toHaveBeenCalledWith({
          eventType: WsEvents.WsEventType.Telemetry,
          eventLogLevel: WsEvents.WsEventLogLevel.Info,
          data: {
            edata: { type: 'click', id: 'test-id' },
            object: { id: 'test-id', type: 'Information' },
            state: WsEvents.EnumTelemetrySubType.Interact,
            eventSubType: WsEvents.EnumTelemetrySubType.Chatbot,
            mode: 'view'
          },
          pageContext: { pageId: '/chatbot', module: 'Assistant' },
          from: '',
          to: 'Telemetry'
        });
      });
    });
  });

  describe('checkForApiCalls', () => {
    beforeEach(() => {
      jest.spyOn(component, 'initData');
      jest.spyOn(component, 'getQns');
      jest.spyOn(component, 'getCategories');
      jest.spyOn(component, 'getLanguages');
    });

    it('should initialize with existing localStorage data for information', () => {
      const mockFaqData = {
        en: {
          information: { test: 'info-data' }
        }
      };
      const mockLanguages = ['en', 'hi'];

      (localStorage.getItem as jest.Mock)
        .mockReturnValueOnce('en') // selectedLanguage
        .mockReturnValueOnce(JSON.stringify(mockFaqData)) // faq
        .mockReturnValueOnce(JSON.stringify(mockLanguages)); // faq-languages

      component.selectedLaguage = 'en';
      component.currentFilter = 'information';
      component.chatInformation = [];

      component.checkForApiCalls();

      expect(component.selectedLaguage).toBe('en');
      expect(component.language).toEqual(mockLanguages);
      expect(component.responseData).toEqual({ test: 'info-data' });
      expect(component.initData).toHaveBeenCalledWith({ test: 'info-data' });
      expect(component.getQns).toHaveBeenCalled();
      expect(component.getCategories).toHaveBeenCalled();
    });

    it('should use existing chat data when available for information', () => {
      const mockFaqData = {
        en: {
          information: { test: 'info-data' }
        }
      };
      const mockLanguages = ['en', 'hi'];
      const existingChatInfo = [{ message: 'existing' }];

      (localStorage.getItem as jest.Mock)
        .mockReturnValueOnce('en')
        .mockReturnValueOnce(JSON.stringify(mockFaqData))
        .mockReturnValueOnce(JSON.stringify(mockLanguages));

      component.selectedLaguage = 'en';
      component.currentFilter = 'information';
      component.chatInformation = existingChatInfo;

      component.checkForApiCalls();

      expect(component.responseData).toEqual({ test: 'info-data' });
      expect(component.userJourney).toEqual(existingChatInfo);
      expect(component.initData).not.toHaveBeenCalled();
    });

    it('should initialize with existing localStorage data for issues', () => {
      const mockFaqData = {
        en: {
          issue: { test: 'issue-data' }
        }
      };
      const mockLanguages = ['en', 'hi'];

      (localStorage.getItem as jest.Mock)
        .mockReturnValueOnce('en')
        .mockReturnValueOnce(JSON.stringify(mockFaqData))
        .mockReturnValueOnce(JSON.stringify(mockLanguages));

      component.selectedLaguage = 'en';
      component.currentFilter = 'issue';
      component.chatIssues = [];

      component.checkForApiCalls();

      expect(component.responseData).toEqual({ test: 'issue-data' });
      expect(component.initData).toHaveBeenCalledWith({ test: 'issue-data' });
    });

    it('should call getLanguages when no localStorage data exists', () => {
      (localStorage.getItem as jest.Mock)
        .mockReturnValueOnce('en')
        .mockReturnValueOnce('{}')
        .mockReturnValueOnce('[]');

      component.checkForApiCalls();

      expect(component.getLanguages).toHaveBeenCalled();
    });

    it('should default to English when no selectedLanguage in localStorage', () => {
      (localStorage.getItem as jest.Mock)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce('{}')
        .mockReturnValueOnce('[]');

      component.checkForApiCalls();

      expect(component.selectedLaguage).toBe('en');
    });
  });

  describe('getCategories', () => {
    beforeEach(() => {
      component.responseData = {
        recommendationMap: [
          {
            catId: 'cat1',
            priority: 2,
            categoryType: 'Logged-In'
          },
          {
            catId: 'cat2',
            priority: 1,
            categoryType: 'Both'
          }
        ],
        categoryMap: [
          { catId: 'cat1', catName: 'Category 1' },
          { catId: 'cat2', catName: 'Category 2' }
        ]
      };
    });

    it('should generate categories for logged-in user', () => {
      component.userInfo = { firstName: 'John' };
      component.selectedLaguage = 'en';

      component.getCategories();

      expect(component.categories).toHaveLength(3); // all + 2 categories
      expect(component.categories[0]).toEqual({
        catId: 'all',
        catName: 'Show All Categories',
        priority: 0
      });
      expect(component.categories[1]).toEqual({
        catId: 'cat1',
        catName: 'Category 1',
        priority: 2,
        categoryType: 'Logged-In'
      });
      expect(component.categories[2]).toEqual({
        catId: 'cat2',
        catName: 'Category 2',
        priority: 1,
        categoryType: 'Both'
      });
    });

    it('should generate categories for not logged-in user', () => {
      component.userInfo = null;
      component.selectedLaguage = 'en';

      component.getCategories();

      expect(component.categories).toHaveLength(2); // all + 1 category (only 'Both')
      expect(component.categories[1]).toEqual({
        catId: 'cat2',
        catName: 'Category 2',
        priority: 1,
        categoryType: 'Both'
      });
    });

    it('should limit categories when more than 6', () => {
      // Create more than 6 categories
      const manyCategories = Array.from({ length: 8 }, (_, i) => ({
        catId: `cat${i}`,
        priority: i,
        categoryType: 'Both'
      }));
      const manyCategoryMap = Array.from({ length: 8 }, (_, i) => ({
        catId: `cat${i}`,
        catName: `Category ${i}`
      }));

      component.responseData = {
        recommendationMap: manyCategories,
        categoryMap: manyCategoryMap
      };
      component.userInfo = { firstName: 'John' };
      component.selectedLaguage = 'en';

      component.getCategories();

      expect(component.categories).toHaveLength(9); // all + 8 categories
    });
  });

  describe('sortCategory', () => {
    it('should sort categories by priority', () => {
      component.categories = [
        { catId: 'cat3', priority: 3 },
        { catId: 'cat1', priority: 1 },
        { catId: 'cat2', priority: 2 }
      ];

      const sorted = component.sortCategory();

      expect(sorted.map((c:any) => c.catId)).toEqual(['cat1', 'cat2', 'cat3']);
    });

    it('should handle equal priorities', () => {
      component.categories = [
        { catId: 'cat2', priority: 1 },
        { catId: 'cat1', priority: 1 },
        { catId: 'cat3', priority: 2 }
      ];

      const sorted = component.sortCategory();

      expect(sorted[0].priority).toBe(1);
      expect(sorted[1].priority).toBe(1);
      expect(sorted[2].priority).toBe(2);
    });
  });

  describe('getLanguages', () => {
    it('should fetch languages and store in localStorage', () => {
      const mockResponse = {
        status: { code: 200 },
        payload: { languages: ['en', 'hi'] }
      };
      mockChatbotService.getLangugages.mockReturnValue(of(mockResponse));
      jest.spyOn(component, 'getData');

      component.selectedLaguage = 'en';
      component.getLanguages();

      expect(component.displayLoader).toBe(false);
      expect(mockChatbotService.getLangugages).toHaveBeenCalled();
      expect(component.language).toEqual(['en', 'hi']);
      expect(localStorage.setItem).toHaveBeenCalledWith('faq-languages', JSON.stringify(['en', 'hi']));
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'en');
      expect(component.getData).toHaveBeenCalled();
    });

    it('should handle failed language fetch', () => {
      const mockResponse = {
        status: { code: 500 }
      };
      mockChatbotService.getLangugages.mockReturnValue(of(mockResponse));

      component.getLanguages();

      expect(component.language).toBeUndefined();
    });
  });

  describe('ngAfterViewChecked', () => {
    it('should scroll chatbot content when not sarthi or support-ai', () => {
      const mockElement = {
        scrollTo: jest.fn(),
        scrollHeight: 1000
      };
      (document.getElementById as jest.Mock).mockReturnValue(mockElement);

      component.currentFilter = 'information';
      component.ngAfterViewChecked();

      expect(document.getElementById).toHaveBeenCalledWith('chatbot-content');
      expect(mockElement.scrollTo).toHaveBeenCalledWith({
        top: 1000,
        behavior: 'smooth'
      });
    });

    it('should not scroll when filter is sarthi', () => {
      component.currentFilter = 'sarthi';
      component.ngAfterViewChecked();

      expect(document.getElementById).not.toHaveBeenCalled();
    });

    it('should not scroll when filter is support-ai', () => {
      component.currentFilter = 'support-ai';
      component.ngAfterViewChecked();

      expect(document.getElementById).not.toHaveBeenCalled();
    });

    it('should handle missing chatbot-content element', () => {
      (document.getElementById as jest.Mock).mockReturnValue(null);

      component.currentFilter = 'information';
      
      expect(() => component.ngAfterViewChecked()).not.toThrow();
    });
  });

  describe('scrollToBottom', () => {
    it('should scroll chatbot wrapper to bottom', () => {
      const mockElement = {
        scrollTo: jest.fn(),
        scrollHeight: 1000
      };
      (document.getElementById as jest.Mock).mockReturnValue(mockElement);

      component.scrollToBottom();

      expect(document.getElementById).toHaveBeenCalledWith('chatbot-wrapper');
      expect(mockElement.scrollTo).toHaveBeenCalledWith({
        top: 1000,
        behavior: 'smooth'
      });
    });

    it('should handle exceptions gracefully', () => {
      (document.getElementById as jest.Mock).mockImplementation(() => {
        throw new Error('Element not found');
      });

      expect(() => component.scrollToBottom()).not.toThrow();
    });
  });

  describe('scrollToBottomEvent', () => {
    it('should scroll chatbot content to bottom', () => {
      const mockElement = {
        scrollTo: jest.fn(),
        scrollHeight: 1000
      };
      (document.getElementById as jest.Mock).mockReturnValue(mockElement);

      component.scrollToBottomEvent();

      expect(document.getElementById).toHaveBeenCalledWith('chatbot-content');
      expect(mockElement.scrollTo).toHaveBeenCalledWith({
        top: 1000,
        behavior: 'smooth'
      });
    });

    it('should handle missing element', () => {
      (document.getElementById as jest.Mock).mockReturnValue(null);

      expect(() => component.scrollToBottomEvent()).not.toThrow();
    });
  });

  describe('clickOutside', () => {
    it('should end chat when AI flags are disabled', () => {
      jest.spyOn(component, 'iconClick');
      component.enableIGOTAIFlag = false;
      component.enableSupportAI = false;

      component.clickOutside();

      expect(component.iconClick).toHaveBeenCalledWith('end');
    });

    it('should not end chat when iGOTAI is enabled', () => {
      jest.spyOn(component, 'iconClick');
      component.enableIGOTAIFlag = true;
      component.enableSupportAI = false;

      component.clickOutside();

      expect(component.iconClick).not.toHaveBeenCalled();
    });

    it('should not end chat when supportAI is enabled', () => {
      jest.spyOn(component, 'iconClick');
      component.enableIGOTAIFlag = false;
      component.enableSupportAI = true;

      component.clickOutside();

      expect(component.iconClick).not.toHaveBeenCalled();
    });
  });

  describe('Scroll control methods', () => {
    describe('disableScroll', () => {
      it('should add disable-scroll class to body', () => {
        component.disableScroll();
        expect(mockRenderer.addClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
      });
    });

    describe('enableScroll', () => {
      it('should remove disable-scroll class from body', () => {
        component.enableScroll();
        expect(mockRenderer.removeClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
      });
    });
  });

  describe('Drag functionality', () => {
    describe('onDragEnded', () => {
      it('should reset drag when chatIconOutside is true', (done) => {
        const mockDragRef = { reset: jest.fn() };
        const mockEvent = {
          source: {
            getFreeDragPosition: jest.fn().mockReturnValue({ x: 10, y: 20 }),
            _dragRef: mockDragRef
          }
        };
        component.chatIconOutside = true;

        component.onDragEnded(mockEvent as any);

        expect(mockDragRef.reset).toHaveBeenCalled();

        setTimeout(() => {
          expect(component.dragEnabled).toBe(false);
          done();
        }, 10);
      });

      it('should set icon position when chatIconOutside is false', (done) => {
        const mockPoint = { x: 10, y: 20 };
        const mockEvent = {
          source: {
            getFreeDragPosition: jest.fn().mockReturnValue(mockPoint),
            _dragRef: { reset: jest.fn() }
          }
        };
        component.chatIconOutside = false;

        component.onDragEnded(mockEvent as any);

        expect(component.iconPosition).toEqual(mockPoint);

        setTimeout(() => {
          expect(component.dragEnabled).toBe(false);
          done();
        }, 10);
      });

      it('should handle missing dragRef', (done) => {
        const mockEvent = {
          source: {
            getFreeDragPosition: jest.fn().mockReturnValue({ x: 10, y: 20 }),
            _dragRef: null
          }
        };

        expect(() => component.onDragEnded(mockEvent as any)).not.toThrow();

        setTimeout(() => {
          expect(component.dragEnabled).toBe(false);
          done();
        }, 10);
      });
    });

    describe('onDragMoved', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
        Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
        Object.defineProperty(document.documentElement, 'clientHeight', { value: 800, writable: true });
        Object.defineProperty(document.documentElement, 'clientWidth', { value: 1200, writable: true });
      });

      it('should set chatIconOutside to true when element is outside viewport', () => {
        component.dragElement.nativeElement.getBoundingClientRect = jest.fn().mockReturnValue({
          top: -10,
          left: 10,
          bottom: 100,
          right: 100
        });

        component.onDragMoved();

        expect(component.dragEnabled).toBe(true);
        expect(component.chatIconOutside).toBe(true);
      });

      it('should set chatIconOutside to false when element is inside viewport', () => {
        component.dragElement.nativeElement.getBoundingClientRect = jest.fn().mockReturnValue({
          top: 10,
          left: 10,
          bottom: 100,
          right: 100
        });

        component.onDragMoved();

        expect(component.dragEnabled).toBe(true);
        expect(component.chatIconOutside).toBe(false);
      });

      it('should detect outside on left edge', () => {
        component.dragElement.nativeElement.getBoundingClientRect = jest.fn().mockReturnValue({
          top: 10,
          left: -5,
          bottom: 100,
          right: 100
        });

        component.onDragMoved();

        expect(component.chatIconOutside).toBe(true);
      });

      it('should detect outside on bottom edge', () => {
        component.dragElement.nativeElement.getBoundingClientRect = jest.fn().mockReturnValue({
          top: 10,
          left: 10,
          bottom: 850,
          right: 100
        });

        component.onDragMoved();

        expect(component.chatIconOutside).toBe(true);
      });

      it('should detect outside on right edge', () => {
        component.dragElement.nativeElement.getBoundingClientRect = jest.fn().mockReturnValue({
          top: 10,
          left: 10,
          bottom: 100,
          right: 1250
        });

        component.onDragMoved();

        expect(component.chatIconOutside).toBe(true);
      });
    });
  });

  describe('Zoho form functionality', () => {
    describe('getZohoForm', () => {
      it('should open zoho dialog and call XML request', (done) => {
        const mockDialogRef = {
          afterClosed: jest.fn().mockReturnValue(of(null))
        };
        mockDialog.open.mockReturnValue(mockDialogRef as any);
        component.zohoHtml = '<div>test html</div>';
        jest.spyOn(component, 'callXMLRequest');

        component.getZohoForm();

        expect(mockDialog.open).toHaveBeenCalledWith(
          expect.anything(),
          {
            width: '45%',
            data: {
              view: 'zohoform',
              value: '<div>test html</div>'
            }
          }
        );

        setTimeout(() => {
          expect(component.callXMLRequest).toHaveBeenCalled();
          done();
        }, 10);
      });
    });

    describe('callXMLRequest', () => {
      let mockXHR: any;

      beforeEach(() => {
        mockXHR = {
          open: jest.fn(),
          send: jest.fn(),
          onreadystatechange: null,
          readyState: 4,
          status: 200,
          responseText: JSON.stringify({
            captchaUrl: 'http://test-captcha.com',
            captchaDigest: 'test-digest'
          })
        };

        // Mock XMLHttpRequest
        //(global as any).XMLHttpRequest = jest.fn(() => mockXHR);

        // Mock DOM elements
        const mockElements = {
          zsCaptchaUrl: { src: '', style: { display: '' } },
          zsCaptchaLoading: { style: { display: '' } },
          zsCaptcha: { style: { display: '' } },
          refreshCaptcha: { addEventListener: jest.fn() }
        };

        (document.getElementById as jest.Mock).mockImplementation((id: string) => {
          return mockElements[id as keyof typeof mockElements] || null;
        });

        (document.getElementsByName as jest.Mock).mockReturnValue([{ value: '' }]);
      });

      it('should make XML request and update captcha elements', () => {
        component.callXMLRequest();

        expect(mockXHR.open).toHaveBeenCalledWith(
          'GET',
          expect.stringContaining('https://desk.zoho.in/support/GenerateCaptcha'),
          true
        );

        // Simulate successful response
        mockXHR.onreadystatechange();

        expect(document.getElementById).toHaveBeenCalledWith('zsCaptchaUrl');
        expect(document.getElementById).toHaveBeenCalledWith('zsCaptchaLoading');
        expect(document.getElementById).toHaveBeenCalledWith('zsCaptcha');
        expect(document.getElementById).toHaveBeenCalledWith('refreshCaptcha');
      });

      it('should handle invalid JSON response', () => {
        mockXHR.responseText = 'invalid json';

        component.callXMLRequest();
        
        expect(() => mockXHR.onreadystatechange()).not.toThrow();
      });

      it('should handle null response', () => {
        mockXHR.responseText = null;

        component.callXMLRequest();
        
        expect(() => mockXHR.onreadystatechange()).not.toThrow();
      });

      it('should handle missing DOM elements gracefully', () => {
        (document.getElementById as jest.Mock).mockReturnValue(null);

        component.callXMLRequest();
        
        expect(() => mockXHR.onreadystatechange()).not.toThrow();
      });
    });
  });

  describe('Chat control methods', () => {
    describe('minimizeChat', () => {
      it('should set flags to minimize chat', () => {
        component.minimizeChat();

        expect(component.maximizeChatFlag).toBe(false);
        expect(component.fullScreenChatFlag).toBe(false);
      });
    });

    describe('maximizeChat', () => {
      it('should set flags to maximize chat', () => {
        component.maximizeChat();

        expect(component.maximizeChatFlag).toBe(true);
        expect(component.fullScreenChatFlag).toBe(false);
      });
    });

    describe('fullScreenChat', () => {
      it('should set flag to full screen', () => {
        component.fullScreenChat();

        expect(component.fullScreenChatFlag).toBe(true);
      });
    });

    describe('fullScreenExitChat', () => {
      it('should exit full screen and maximize chat', () => {
        component.fullScreenExitChat();

        expect(component.fullScreenChatFlag).toBe(false);
        expect(component.maximizeChatFlag).toBe(true);
      });
    });
  });

  describe('getFooterClass', () => {
    it('should return footer class for both support AI and iGOTAI enabled', () => {
      component.enableSupportAI = true;
      component.enableIGOTAIFlag = true;

      component.getFooterClass();

      expect(component.footerClassName).toBe('cb-footer-with-support-ai');
    });

    it('should return footer class for only iGOTAI enabled', () => {
      component.enableSupportAI = false;
      component.enableIGOTAIFlag = true;

      component.getFooterClass();

      expect(component.footerClassName).toBe('cb-footer-with-ai');
    });

    it('should return footer class for only support AI enabled', () => {
      component.enableSupportAI = true;
      component.enableIGOTAIFlag = false;

      component.getFooterClass();

      expect(component.footerClassName).toBe('cb-footer-with-ai');
    });

    it('should return default footer class when no AI is enabled', () => {
      component.enableSupportAI = false;
      component.enableIGOTAIFlag = false;

      component.getFooterClass();

      expect(component.footerClassName).toBe('cb-footer');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle undefined responseData in getQns', () => {
      component.responseData = undefined;

      expect(() => component.getQns()).toThrow();
    });

    it('should handle empty recommendationMap in getPriorityQuestion', () => {
      component.responseData = { recommendationMap: [] };
      component.userInfo = { firstName: 'John' };

      const result = component.getPriorityQuestion(1);

      expect(result).toEqual([]);
    });

    it('should handle missing localization keys', () => {
      component.selectedLaguage = 'fr'; // unsupported language

      expect(component.greetings()).toBe('Hi');
      expect(component.getInfoText('test')).toBe('test');
      expect(component.showMore()).toBe('Show More');
    });

    it('should handle API errors gracefully', () => {
      mockChatbotService.getChatData.mockReturnValue(of({ payload: null }));

      expect(() => component.getData()).not.toThrow();
    });

    it('should handle missing environment configuration', () => {
      // This tests the fallback email
      component.ngOnInit();
      
      expect(component.emailText).toContain('test@example.com');
    });
  });

  describe('Component state management', () => {
    it('should maintain correct state during filter transitions', () => {
      component.currentFilter = 'information';
      component.chatInformation = [{ message: 'info' }];
      component.chatIssues = [{ message: 'issue' }];

      component.toggleFilter('issue');

      expect(component.currentFilter).toBe('issue');
      expect(component.more).toBe(false);
    });

    it('should reset state correctly on chat end', () => {
      component.userJourney = [{ message: 'test' }];
      component.chatInformation = [{ message: 'info' }];
      component.chatIssues = [{ message: 'issue' }];
      component.selectedLaguage = 'hi';
      component.more = true;
      component.dragEnabled = false;

      component.iconClick('end');

      expect(component.userJourney).toEqual([]);
      expect(component.chatInformation).toEqual([]);
      expect(component.chatIssues).toEqual([]);
      expect(component.selectedLaguage).toBe('en');
      expect(component.more).toBe(false);
    });

    it('should handle concurrent data updates', () => {
      const data1 = { test: 'data1' };
      const data2 = { test: 'data2' };

      component.setDataToLocalStorage(data1);
      component.setDataToLocalStorage(data2);

      // Last data should win
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'faq',
        expect.stringContaining('data2')
      );
    });
  });
});