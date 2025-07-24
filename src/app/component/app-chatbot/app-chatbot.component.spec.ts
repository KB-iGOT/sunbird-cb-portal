import { AppChatbotComponent } from './app-chatbot.component';
import { ConfigurationsService, EventService, WsEvents } from '@sunbird-cb/utils-v2';
import { RootService } from './../root/root.service';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Renderer2, ElementRef } from '@angular/core';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { of, Subject } from 'rxjs';

describe('AppChatbotComponent', () => {
  let component: AppChatbotComponent;
  let mockConfigSvc: jest.Mocked<ConfigurationsService>;
  let mockEventSvc: jest.Mocked<EventService>;
  let mockRenderer: jest.Mocked<Renderer2>;
  let mockChatbotService: jest.Mocked<RootService>;
  let mockHttp: jest.Mocked<HttpClient>;
  let mockSanitizer: jest.Mocked<DomSanitizer>;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockRouter: jest.Mocked<Router>;
  let routerEventsSubject: Subject<any>;

  beforeEach(() => {
    // Mock services
    mockConfigSvc = {
      userProfile: {
        firstName: 'John',
        profileImage: 'test-image.jpg'
      },
      iGOTAIConfig: {
        supportAI: false,
        iGOTAI: false
      },
      unMappedUser: {
        userId: 'user123'
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

    // Create component instance
    component = new AppChatbotComponent(
      mockConfigSvc,
      mockEventSvc,
      mockRenderer,
      mockChatbotService,
      mockHttp,
      mockSanitizer,
      mockDialog,
      mockRouter
    );

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
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
      writable: true
    });

    Object.defineProperty(document, 'getElementsByName', {
      value: jest.fn().mockReturnValue([{ value: '' }]),
      writable: true
    });

    // Mock Date.now
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.showIcon).toBe(true);
      expect(component.currentFilter).toBe('information');
      expect(component.selectedLaguage).toBe('en');
      expect(component.displayLoader).toBe(false);
      expect(component.expanded).toBe(false);
      expect(component.enableIGOTAIFlag).toBe(false);
      expect(component.dragEnabled).toBe(false);
    });

    it('should set user info and icon on init', () => {
      mockHttp.get.mockReturnValue(of('<div>test html</div>'));
      mockSanitizer.bypassSecurityTrustHtml.mockReturnValue('sanitized html' as any);
      
      component.ngOnInit();
      
      expect(component.userInfo).toEqual(mockConfigSvc.userProfile);
      expect(component.userIcon).toBe('test-image.jpg');
    });

    it('should set default user icon when no profile image', () => {
      // mockConfigSvc.userProfile = { firstName: 'John', profileImage: '' };
      mockHttp.get.mockReturnValue(of('<div>test html</div>'));
      
      component.ngOnInit();
      
      expect(component.userIcon).toBe('/assets/icons/chatbot-default-user.svg');
    });

    it('should handle router navigation events', () => {
      component.ngOnInit();
      
      const navigationEndEvent = new NavigationEnd(1, '/certs', '/certs');
      routerEventsSubject.next(navigationEndEvent);
      
      expect(component.isHubEnable).toBe(false);
    });
  });

  describe('Configuration Handling', () => {
    it('should enable support AI when configured', () => {
      mockConfigSvc.iGOTAIConfig = { supportAI: true, iGOTAI: false };
      component.rootOrgId = 'test-org';
      component.iGOTAIConfigLoaded = true;
      
      component.ngOnInit();
      
      expect(component.enableSupportAI).toBe(true);
      expect(component.currentFilter).toBe('support-ai');
      expect(component.faqChatBotDisable).toBe(true);
    });

    it('should enable iGOTAI when configured', () => {
      mockConfigSvc.iGOTAIConfig = { supportAI: false, iGOTAI: true };
      component.rootOrgId = 'test-org';
      component.iGOTAIConfigLoaded = true;
      
      component.ngOnInit();
      
      expect(component.enableIGOTAIFlag).toBe(true);
      expect(component.currentFilter).toBe('sarthi');
      expect(component.faqChatBotDisable).toBe(true);
    });

    it('should handle ngOnChanges correctly', () => {
      mockConfigSvc.iGOTAIConfig = { supportAI: true, iGOTAI: false };
      component.rootOrgId = 'test-org';
      component.iGOTAIConfigLoaded = true;
      
      component.ngOnChanges();
      
      expect(component.enableSupportAI).toBe(true);
      expect(component.currentFilter).toBe('support-ai');
    });
  });

  describe('Localization', () => {
    it('should return correct greeting for English', () => {
      component.selectedLaguage = 'en';
      expect(component.greetings()).toBe('Namaste');
    });

    it('should return correct greeting for Hindi', () => {
      component.selectedLaguage = 'hi';
      expect(component.greetings()).toBe('नमस्ते');
    });

    it('should return localized text', () => {
      component.selectedLaguage = 'en';
      expect(component.getInfoText('information')).toBe('Information');
      
      component.selectedLaguage = 'hi';
      expect(component.getInfoText('information')).toBe('जानकारी');
    });

    it('should return show more text', () => {
      component.selectedLaguage = 'en';
      expect(component.showMore()).toBe('Show More');
    });
  });

  describe('Data Management', () => {
    it('should get data and call chat service', () => {
      const mockResponse = {
        payload: {
          config: { test: 'data' }
        }
      };
      mockChatbotService.getChatData.mockReturnValue(of(mockResponse));
      jest.spyOn(component, 'setDataToLocalStorage');
      jest.spyOn(component, 'checkForApiCalls');
      
      component.getData();
      
      expect(mockChatbotService.getChatData).toHaveBeenCalledWith({
        lang: 'en',
        config_type: 'IN'
      });
      expect(component.setDataToLocalStorage).toHaveBeenCalledWith({ test: 'data' });
    });

    it('should set data to local storage', () => {
      const testData = { test: 'data' };
      (localStorage.getItem as jest.Mock).mockReturnValue('{}');
      jest.spyOn(component, 'toggleFilter');
      
      component.setDataToLocalStorage(testData);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'faq',
        JSON.stringify({ en: { information: testData } })
      );
      expect(component.toggleFilter).toHaveBeenCalledWith('information');
    });

    it('should initialize data correctly', () => {
      const testData = { quesMap: [] };
      jest.spyOn(component, 'getPriorityQuestion').mockReturnValue([]);
      jest.spyOn(component, 'pushData');
      jest.spyOn(component, 'getQns');
      
      component.initData(testData);
      
      expect(component.userJourney).toEqual([]);
      expect(component.pushData).toHaveBeenCalled();
      expect(component.getQns).toHaveBeenCalled();
    });
  });

  describe('Language Selection', () => {
    it('should select language and update data', () => {
      const event = { target: { value: 'hi' } };
      jest.spyOn(component, 'checkForApiCalls');
      
      component.selectLaguage(event);
      
      expect(component.selectedLaguage).toBe('hi');
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'hi');
      expect(component.chatInformation).toEqual([]);
      expect(component.chatIssues).toEqual([]);
      expect(component.checkForApiCalls).toHaveBeenCalled();
    });
  });

  describe('Chat Icon Interaction', () => {
    it('should toggle chat on icon click start', () => {
      jest.spyOn(component, 'raiseChatStartTelemetry');
      jest.spyOn(component, 'disableScroll');
      
      component.iconClick('start');
      
      expect(component.showIcon).toBe(false);
      expect(component.chatId).toBe('user123-1234567890');
      expect(mockChatbotService.iGOTAIChatHistory).toEqual([]);
      expect(component.raiseChatStartTelemetry).toHaveBeenCalled();
      expect(component.disableScroll).toHaveBeenCalled();
    });

    it('should close chat on icon click end', () => {
      jest.spyOn(component, 'raiseChatEndTelemetry');
      jest.spyOn(component, 'checkForApiCalls');
      jest.spyOn(component, 'enableScroll');
      
      component.iconClick('end');
      
      expect(component.showIcon).toBe(false);
      expect(component.chatId).toBe('');
      expect(component.userJourney).toEqual([]);
      expect(component.more).toBe(false);
      expect(component.raiseChatEndTelemetry).toHaveBeenCalled();
      expect(component.enableScroll).toHaveBeenCalled();
    });

    it('should not toggle when drag is enabled', () => {
      component.dragEnabled = true;
      const initialShowIcon = component.showIcon;
      
      component.iconClick('start');
      
      expect(component.showIcon).toBe(initialShowIcon);
    });
  });

  describe('Filter Toggle', () => {
    it('should toggle filter and check for API calls', () => {
      jest.spyOn(component, 'checkForApiCalls');
      
      component.toggleFilter('issue');
      
      expect(component.currentFilter).toBe('issue');
      expect(component.more).toBe(false);
      expect(component.checkForApiCalls).toHaveBeenCalled();
    });
  });

  describe('Question Selection', () => {
    it('should handle selected question', () => {
      const question = { quesID: 'q1', recommendedQues: [] };
      const data = { selectedValue: '' };
      component.questionsAndAns = {
        q1: {
          quesValue: 'Test Question',
          ansVal: 'Test Answer'
        }
      };
      component.callText = 'call link';
      component.emailText = 'email link';
      
      jest.spyOn(component, 'pushData');
      jest.spyOn(component, 'scrollToBottom');
      jest.spyOn(component, 'raiseTemeletyInterat');
      
      component.selectedQuestion(question, data);
      
      expect(data.selectedValue).toBe('q1');
      expect(component.pushData).toHaveBeenCalledTimes(2);
      expect(component.raiseTemeletyInterat).toHaveBeenCalledWith('q1');
    });
  });

  describe('Data Push', () => {
    it('should push data to information chat', () => {
      component.currentFilter = 'information';
      const testMsg = { type: 'test', message: 'test message' };
      
      component.pushData(testMsg);
      
      expect(component.chatInformation).toContain(testMsg);
      expect(component.userJourney).toContain(testMsg);
    });

    it('should push data to issues chat', () => {
      component.currentFilter = 'issue';
      const testMsg = { type: 'test', message: 'test message' };
      
      component.pushData(testMsg);
      
      expect(component.chatIssues).toContain(testMsg);
      expect(component.userJourney).toContain(testMsg);
    });
  });

  describe('User Journey', () => {
    it('should get user journey for specific tab', () => {
      component.userJourney = [
        { tab: 'information', message: 'info1' },
        { tab: 'issue', message: 'issue1' },
        { tab: 'information', message: 'info2' }
      ];
      
      const infoJourney = component.getuserjourney('information');
      
      expect(infoJourney).toHaveLength(2);
      expect(infoJourney[0].message).toBe('info1');
      expect(infoJourney[1].message).toBe('info2');
    });
  });

  describe('Priority Questions', () => {
    it('should get priority questions for logged-in user', () => {
      component.userInfo = { firstName: 'John' };
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
          }
        ]
      };
      
      const priorityQuestions = component.getPriorityQuestion(1);
      
      expect(priorityQuestions).toHaveLength(1);
      expect(priorityQuestions[0].question).toBe('Q1');
    });

    it('should get priority questions for not logged-in user', () => {
      component.userInfo = null;
      component.responseData = {
        recommendationMap: [
          {
            categoryType: 'Not Logged-In',
            recommendedQues: [
              { priority: 1, question: 'Q1' }
            ]
          }
        ]
      };
      
      const priorityQuestions = component.getPriorityQuestion(1);
      
      expect(priorityQuestions).toHaveLength(1);
      expect(priorityQuestions[0].question).toBe('Q1');
    });
  });

  describe('Show More Questions', () => {
    it('should show more questions', () => {
      jest.spyOn(component, 'getPriorityQuestion').mockReturnValue(['q1', 'q2']);
      jest.spyOn(component, 'pushData');
      
      component.showMoreQuestion();
      
      expect(component.pushData).toHaveBeenCalledWith({
        type: 'incoming',
        message: '',
        recommendedQues: ['q1', 'q2'],
        selectedValue: '',
        title: ''
      });
    });
  });

  describe('Category Display', () => {
    it('should show all categories', () => {
      const catItem = { catId: 'all', catName: 'All Categories' };
      jest.spyOn(component, 'sortCategory').mockReturnValue(['cat1', 'cat2']);
      jest.spyOn(component, 'pushData');
      jest.spyOn(component, 'scrollToBottom');
      
      component.showCategory(catItem);
      
      expect(component.more).toBe(false);
      expect(component.pushData).toHaveBeenCalledTimes(2);
    });

    it('should show specific category questions', () => {
      const catItem = { catId: 'cat1', catName: 'Category 1' };
      component.responseData = {
        recommendationMap: [
          { catId: 'cat1', recommendedQues: ['q1', 'q2'] }
        ]
      };
      jest.spyOn(component, 'pushData');
      jest.spyOn(component, 'raiseCategotyTelemetry');
      
      component.showCategory(catItem);
      
      expect(component.raiseCategotyTelemetry).toHaveBeenCalledWith('cat1');
      expect(component.pushData).toHaveBeenCalledTimes(2);
    });
  });

  describe('Telemetry Events', () => {
    it('should raise category telemetry', () => {
      component.raiseCategotyTelemetry('cat1');
      
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledWith({
        eventType: WsEvents.WsEventType.Telemetry,
        eventLogLevel: WsEvents.WsEventLogLevel.Info,
        data: {
          edata: { type: 'click', id: 'cat1' },
          object: { id: 'cat1', type: 'Category' },
          state: WsEvents.EnumTelemetrySubType.Interact,
          eventSubType: WsEvents.EnumTelemetrySubType.Chatbot,
          mode: 'view'
        },
        pageContext: { pageId: '/chatbot', module: 'Assistant' },
        from: '',
        to: 'Telemetry'
      });
    });

    it('should raise chat start telemetry for non-sarthi', () => {
      component.currentFilter = 'information';
      
      component.raiseChatStartTelemetry();
      
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            state: WsEvents.EnumTelemetrySubType.Loaded
          })
        })
      );
    });

    it('should raise chat start telemetry for sarthi', () => {
      component.currentFilter = 'sarthi';
      
      component.raiseChatStartTelemetry();
      
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            edata: expect.objectContaining({
              id: 'ai-global-search'
            })
          })
        })
      );
    });

    it('should raise interaction telemetry', () => {
      component.currentFilter = 'information';
      
      component.raiseTemeletyInterat('q1');
      
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledWith({
        eventType: WsEvents.WsEventType.Telemetry,
        eventLogLevel: WsEvents.WsEventLogLevel.Info,
        data: {
          edata: { type: 'click', id: 'q1' },
          object: { id: 'q1', type: 'Information' },
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

  describe('Scroll Functionality', () => {
    it('should disable scroll', () => {
      component.disableScroll();
      
      expect(mockRenderer.addClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
    });

    it('should enable scroll', () => {
      component.enableScroll();
      
      expect(mockRenderer.removeClass).toHaveBeenCalledWith(document.body, 'disable-scroll');
    });

    it('should scroll to bottom', () => {
      const mockElement = { scrollTo: jest.fn(), scrollHeight: 1000 };
      (document.getElementById as jest.Mock).mockReturnValue(mockElement);
      
      component.scrollToBottom();
      
      expect(mockElement.scrollTo).toHaveBeenCalledWith({
        top: 1000,
        behavior: 'smooth'
      });
    });
  });

  describe('Drag Functionality', () => {
    it('should handle drag ended', () => {
      const mockDragRef = { reset: jest.fn() };
      const mockSource = {
        getFreeDragPosition: jest.fn().mockReturnValue({ x: 10, y: 20 }),
        _dragRef: mockDragRef
      };
      const mockEvent = { source: mockSource } as unknown as CdkDragEnd;
      
      component.chatIconOutside = false;
      
      component.onDragEnded(mockEvent);
      
      expect(component.iconPosition).toEqual({ x: 10, y: 20 });
      
      setTimeout(() => {
        expect(component.dragEnabled).toBe(false);
      }, 0);
    });

    it('should handle drag moved', () => {
      const mockElement = {
        getBoundingClientRect: jest.fn().mockReturnValue({
          top: -10,
          left: 0,
          bottom: 100,
          right: 100
        })
      };
      component.dragElement = { nativeElement: mockElement } as ElementRef;
      
      Object.defineProperty(window, 'innerHeight', { value: 500, writable: true });
      Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
      
      component.onDragMoved();
      
      expect(component.dragEnabled).toBe(true);
      expect(component.chatIconOutside).toBe(true);
    });
  });

  describe('Chat Controls', () => {
    it('should minimize chat', () => {
      component.minimizeChat();
      
      expect(component.maximizeChatFlag).toBe(false);
      expect(component.fullScreenChatFlag).toBe(false);
    });

    it('should maximize chat', () => {
      component.maximizeChat();
      
      expect(component.maximizeChatFlag).toBe(true);
      expect(component.fullScreenChatFlag).toBe(false);
    });

    it('should full screen chat', () => {
      component.fullScreenChat();
      
      expect(component.fullScreenChatFlag).toBe(true);
    });

    it('should exit full screen chat', () => {
      component.fullScreenExitChat();
      
      expect(component.fullScreenChatFlag).toBe(false);
      expect(component.maximizeChatFlag).toBe(true);
    });
  });

  describe('Footer Class', () => {
    it('should set footer class for both support AI and iGOTAI', () => {
      component.enableSupportAI = true;
      component.enableIGOTAIFlag = true;
      
      component.getFooterClass();
      
      expect(component.footerClassName).toBe('cb-footer-with-support-ai');
    });

    it('should set footer class for only iGOTAI', () => {
      component.enableSupportAI = false;
      component.enableIGOTAIFlag = true;
      
      component.getFooterClass();
      
      expect(component.footerClassName).toBe('cb-footer-with-ai');
    });

    it('should set footer class for only support AI', () => {
      component.enableSupportAI = true;
      component.enableIGOTAIFlag = false;
      
      component.getFooterClass();
      
      expect(component.footerClassName).toBe('cb-footer-with-ai');
    });

    it('should set default footer class', () => {
      component.enableSupportAI = false;
      component.enableIGOTAIFlag = false;
      
      component.getFooterClass();
      
      expect(component.footerClassName).toBe('cb-footer');
    });
  });

  describe('Click Outside', () => {
    it('should not close chat when AI features are enabled', () => {
      component.enableIGOTAIFlag = true;
      jest.spyOn(component, 'iconClick');
      
      component.clickOutside();
      
      expect(component.iconClick).not.toHaveBeenCalled();
    });

    it('should close chat when AI features are disabled', () => {
      component.enableIGOTAIFlag = false;
      component.enableSupportAI = false;
      jest.spyOn(component, 'iconClick');
      
      component.clickOutside();
      
      expect(component.iconClick).toHaveBeenCalledWith('end');
    });
  });

  describe('Zoho Form', () => {
    it('should open zoho form dialog', () => {
      const mockDialogRef:any = {
        afterClosed: jest.fn().mockReturnValue(of({}))
      };
      mockDialog.open.mockReturnValue(mockDialogRef);
      jest.spyOn(component, 'callXMLRequest');
      
      component.getZohoForm();
      
      expect(mockDialog.open).toHaveBeenCalled();
      
      setTimeout(() => {
        expect(component.callXMLRequest).toHaveBeenCalled();
      }, 0);
    });
  });

  describe('Languages API', () => {
    it('should get languages and call getData', () => {
      const mockResponse = {
        status: { code: 200 },
        payload: { languages: ['en', 'hi'] }
      };
      mockChatbotService.getLangugages.mockReturnValue(of(mockResponse));
      jest.spyOn(component, 'getData');
      
      component.getLanguages();
      
      expect(component.language).toEqual(['en', 'hi']);
      expect(localStorage.setItem).toHaveBeenCalledWith('faq-languages', JSON.stringify(['en', 'hi']));
      expect(component.getData).toHaveBeenCalled();
    });
  });

  describe('Categories Management', () => {
    it('should get categories for logged-in user', () => {
      component.userInfo = { firstName: 'John' };
      component.selectedLaguage = 'en';
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
      
      component.getCategories();
      
      expect(component.categories).toHaveLength(2); // includes 'all' category
      expect(component.categories[1].catName).toBe('Category 1');
    });

    it('should sort categories by priority', () => {
      component.categories = [
        { priority: 2, catName: 'Cat B' },
        { priority: 1, catName: 'Cat A' },
        { priority: 3, catName: 'Cat C' }
      ];
      
      const sorted = component.sortCategory();
      
      expect(sorted[0].catName).toBe('Cat A');
      expect(sorted[1].catName).toBe('Cat B');
      expect(sorted[2].catName).toBe('Cat C');
    });
  });
});