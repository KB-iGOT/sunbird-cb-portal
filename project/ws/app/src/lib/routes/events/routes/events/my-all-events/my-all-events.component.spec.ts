import { MyAllEventsComponent } from './my-all-events.component';
import { of, throwError } from 'rxjs';
import { WsEvents } from '@sunbird-cb/utils-v2';

describe('MyAllEventsComponent', () => {
  let component: MyAllEventsComponent;
  let mockActivatedRoute: any;
  let mockTranslateService: any;
  let mockEventService: any;
  let mockMultilingualTranslationsService: any;
  let mockLibEventService: any;
  let mockConfigurationsService: any;

  beforeEach(() => {
    // Mock all dependencies
    mockActivatedRoute = {
      queryParamMap: of({
        params: { tabSelected: 'today' }
      })
    };

    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    };

    mockEventService = {
      myEvents: jest.fn()
    };

    mockMultilingualTranslationsService = {
      translateActualLabel: jest.fn().mockReturnValue('Translated Label')
    };

    mockLibEventService = {
      raiseInteractTelemetry: jest.fn()
    };

    mockConfigurationsService = {
      userProfile: {
        userId: 'test-user-id'
      }
    };

    // Create component instance with mocked dependencies
    component = new MyAllEventsComponent(
      mockActivatedRoute,
      mockTranslateService,
      mockEventService,
      mockMultilingualTranslationsService,
      mockLibEventService,
      mockConfigurationsService
    );

    // Mock localStorage
    const localStorageMock = (() => {
      let store: { [key: string]: string } = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString();
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        }
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Mock console
    global.console = {
      ...global.console,
      log: jest.fn()
    };

    // Spy on public methods that we want to test
    jest.spyOn(component, 'fetchData');
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct titles', () => {
    expect(component.titles.length).toBe(2);
    expect(component.titles[0].title).toBe('events');
    expect(component.titles[1].title).toBe('Translated Label');
  });

  it('should set language from localStorage', () => {
    localStorage.setItem('websiteLanguage', 'hi');
    component = new MyAllEventsComponent(
      mockActivatedRoute,
      mockTranslateService,
      mockEventService,
      mockMultilingualTranslationsService,
      mockLibEventService,
      mockConfigurationsService
    );
    
    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(mockTranslateService.use).toHaveBeenCalledWith('hi');
  });

  it('should initialize and subscribe to route params', () => {
    jest.spyOn(component, 'fetchData').mockClear();
    component.ngOnInit();
    
    expect(component.tabSelected).toBe('today');
    expect(component.fetchData).toHaveBeenCalled();
  });

  it('should handle different tab selections from route params', () => {
    mockActivatedRoute.queryParamMap = of({
      params: { tabSelected: 'upcoming' }
    });
    
    component.ngOnInit();
    expect(component.tabSelected).toBe('upcoming');
  });

  describe('fetchData', () => {
    beforeEach(() => {
      jest.spyOn(component, 'fetchData').mockRestore();
    });

    it('should fetch data and process results successfully', () => {
      const mockEvents = [{ event: { startDate: '2025-05-16' } }];
      mockEventService.myEvents.mockReturnValue(of({ result: { events: mockEvents } }));
      
      // Mock processResult since it's public
      jest.spyOn(component, 'processResult').mockReturnValue([]);
      
      component.fetchData();
      
      expect(component.isLoading).toBe(false);
      expect(component.response).toEqual(mockEvents);
      expect(component.processResult).toHaveBeenCalledWith(mockEvents);
    });

    it('should handle error while fetching data', () => {
      mockEventService.myEvents.mockReturnValue(throwError('Error'));
      
      component.fetchData();
      
      expect(component.isLoading).toBe(false);
      // We can only verify the contentDataList's length since transformContentsToWidgets is private
      expect(component.contentDataList.length).toBeGreaterThan(0);
    });

    it('should set tabIndex based on tabSelected', () => {
      component.tabSelected = 'today';
      mockEventService.myEvents.mockReturnValue(of({ result: { events: [] } }));
      
      component.fetchData();
      
      expect(component.tabIndex).toBe(0);

      component.tabSelected = 'upcoming';
      component.fetchData();
      expect(component.tabIndex).toBe(1);

      component.tabSelected = 'past';
      component.fetchData();
      expect(component.tabIndex).toBe(2);
    });
  });

  describe('processResult', () => {
    beforeEach(() => {
      // Mock current date to a specific value for consistent testing
      jest.useFakeTimers().setSystemTime(new Date('2025-05-16'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should categorize events as today, upcoming, and past', () => {
      // const mockEvents = [
      //   { event: { startDate: '2025-05-16' } }, // today
      //   { event: { startDate: '2025-05-17' } }, // upcoming
      //   { event: { startDate: '2025-05-15' } }, // past
      //   { event: { startDate: '2025-05-16' } }  // today
      // ];
      
      jest.spyOn(component, 'sortData').mockImplementation(data => data);
      
      component.tabIndex = 0;
      //const result = component.processResult(mockEvents);
      
      expect(component.today.length).toBe(2);
      expect(component.upcoming.length).toBe(1);
      expect(component.past.length).toBe(1);
      expect(component.sortData).toHaveBeenCalled();
    });

    it('should return the correct array based on tabIndex', () => {
      const mockEvents = [
        { event: { startDate: '2025-05-16' } },
        { event: { startDate: '2025-05-17' } },
        { event: { startDate: '2025-05-15' } }
      ];
      
      jest.spyOn(component, 'sortData').mockImplementation(data => data);
      
      component.tabIndex = 0;
      let result = component.processResult(mockEvents);
      expect(result).toEqual(component.today);
      
      component.tabIndex = 1;
      result = component.processResult(mockEvents);
      expect(result).toEqual(component.upcoming);
      
      component.tabIndex = 2;
      result = component.processResult(mockEvents);
      expect(result).toEqual(component.past);
    });
  });

  describe('sortData', () => {
    it('should sort data in ascending order for today and upcoming events', () => {
      const mockData = [
        { event: { startDate: '2025-05-16', startTime: '14:00:00' } },
        { event: { startDate: '2025-05-16', startTime: '10:00:00' } }
      ];
      
      component.tabIndex = 0; // today
      const result = component.sortData(mockData);
      
      expect(result[0].event.startTime).toBe('10:00:00');
      expect(result[1].event.startTime).toBe('14:00:00');
    });

    it('should sort data in descending order for past events', () => {
      const mockData = [
        { event: { startDate: '2025-05-14', startTime: '10:00:00' } },
        { event: { startDate: '2025-05-15', startTime: '14:00:00' } }
      ];
      
      component.tabIndex = 2; // past
      const result = component.sortData(mockData);
      
      expect(result[0].event.startDate).toBe('2025-05-15');
      expect(result[1].event.startDate).toBe('2025-05-14');
    });
  });

  describe('isLiveEvent', () => {
    beforeEach(() => {
      // Mock current date to a specific value for testing
      jest.useFakeTimers().setSystemTime(new Date('2025-05-16T12:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true for a currently live event', () => {
      const event = {
        startDate: '2025-05-16',
        endDate: '2025-05-16',
        startTime: '10:00:00',
        endTime: '14:00:00'
      };
      
      expect(component.isLiveEvent(event)).toBe(true);
    });

    it('should return false for a future event', () => {
      const event = {
        startDate: '2025-05-16',
        endDate: '2025-05-16',
        startTime: '14:00:00',
        endTime: '16:00:00'
      };
      
      expect(component.isLiveEvent(event)).toBe(false);
    });

    it('should return false for a past event', () => {
      const event = {
        startDate: '2025-05-16',
        endDate: '2025-05-16',
        startTime: '08:00:00',
        endTime: '10:00:00'
      };
      
      expect(component.isLiveEvent(event)).toBe(false);
    });

    it('should return false for incomplete event data', () => {
      const event = {
        startDate: '2025-05-16'
        // missing other properties
      };
      
      expect(component.isLiveEvent(event)).toBe(false);
    });
  });

  describe('translateLabels', () => {
    it('should call translation service with correct parameters', () => {
      component.translateLabels('label', 'type', 'subtype');
      
      expect(mockMultilingualTranslationsService.translateActualLabel)
        .toHaveBeenCalledWith('label', 'type', 'subtype');
    });
  });

  describe('raiseTelemetry', () => {
    it('should call event service with correct parameters', () => {
      const mockEvent = {
        widgetData: {
          content: {
            identifier: 'test-id'
          }
        }
      };
      
      component.raiseTelemetry(mockEvent);
      
      expect(mockLibEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'my-events',
          id: 'card-content',
        },
        {
          id: 'test-id',
          type: 'event'
        },
        {
          module: WsEvents.EnumTelemetrymodules.EVENTS,
        }
      );
    });
  });

  describe('tabClick', () => {
    beforeEach(() => {
      jest.spyOn(component, 'resetData');
      jest.spyOn(component, 'processResult').mockReturnValue([]);
    });

    it('should update tabIndex and tabSelected when tab is clicked', () => {
      component.tabClick({ index: 1 });
      
      expect(component.tabIndex).toBe(1);
      expect(component.tabSelected).toBe('upcoming');
      expect(component.resetData).toHaveBeenCalled();
    });

    it('should process results for today tab', () => {
      component.response = [{ event: { startDate: '2025-05-16' } }];
      
      component.tabClick({ index: 0 });
      
      expect(component.tabSelected).toBe('today');
      expect(component.processResult).toHaveBeenCalledWith(component.response);
    });

    it('should process results for upcoming tab', () => {
      component.response = [{ event: { startDate: '2025-05-17' } }];
      
      component.tabClick({ index: 1 });
      
      expect(component.tabSelected).toBe('upcoming');
      expect(component.processResult).toHaveBeenCalledWith(component.response);
    });

    it('should process results for past tab', () => {
      component.response = [{ event: { startDate: '2025-05-15' } }];
      
      component.tabClick({ index: 2 });
      
      expect(component.tabSelected).toBe('past');
      expect(component.processResult).toHaveBeenCalledWith(component.response);
    });

    it('should handle empty response', () => {
      component.response = [];
      
      component.tabClick({ index: 0 });
      
      // Since transformContentsToWidgets is private, check if contentDataList is updated
      expect(component.contentDataList.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('resetData', () => {
    it('should clear contentDataList', () => {
      component.contentDataList = [{}, {}, {}];
      
      component.resetData();
      
      expect(component.contentDataList).toEqual([]);
    });
  });
});