import { ViewAllComponent } from './view-all.component';
import { of, throwError, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2';
import { EventService } from '../../services/events.service';

describe('ViewAllComponent', () => {
  let component: ViewAllComponent;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let mockEventSvc: Partial<EventService>;
  let mockDatePipe: Partial<DatePipe>;
  let mockBottomSheet: Partial<MatBottomSheet>;
  let mockSnackbar: Partial<MatSnackBar>;
  let mockTranslate: Partial<TranslateService>;
  let mockRouter: Partial<Router>;
  let mockLangTranslations: Partial<MultilingualTranslationsService>;

  beforeEach(() => {
    // Define interfaces for mocks
    mockActivatedRoute = {
      snapshot: {
        data: {
          pageData: {
            data: {
              version2: {
                filterFacetsData: {}
              }
            }
          }
        }
      } as any,
      queryParamMap: {
        subscribe: jest.fn().mockImplementation(callback => {
          callback({ params: {} });
          return { unsubscribe: jest.fn() };
        })
      } as any
    };

    mockEventSvc = {
      getEventsList: jest.fn().mockReturnValue(of({
        result: {
          Event: [],
          count: 0
        }
      }))
    };

    mockDatePipe = {
      transform: jest.fn().mockImplementation(() => '2025-05-16')
    };

    mockBottomSheet = {
      open: jest.fn().mockReturnValue({
        afterDismissed: jest.fn().mockReturnValue(of({ action: 'apply', selectedFilters: {} }))
      })
    };

    mockSnackbar = {
      open: jest.fn()
    };

    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    };

    mockRouter = {
      navigate: jest.fn()
    };

    mockLangTranslations = {
      translateActualLabel: jest.fn().mockReturnValue('Translated Label')
    };

    // Create component with mocks
    component = new ViewAllComponent(
      mockActivatedRoute as ActivatedRoute,
      mockEventSvc as EventService,
      mockDatePipe as DatePipe,
      mockBottomSheet as MatBottomSheet,
      mockSnackbar as MatSnackBar,
      mockTranslate as TranslateService,
      mockRouter as Router,
      mockLangTranslations as MultilingualTranslationsService
    );

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue('en'),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Mock window/document for scroll events
    Object.defineProperty(window, 'innerHeight', { value: 500 });
    Object.defineProperty(window, 'scrollY', { value: 500 });
    Object.defineProperty(document.body, 'offsetHeight', { value: 1000 });
    
    // Enable fake timers for debounce testing
    jest.useFakeTimers();
    
    // Since scrollSubject is private, we'll spy on onDebouncedScroll instead
    jest.spyOn(component, 'onDebouncedScroll').mockImplementation(() => {});
    
    // Initialize component
    component.ngOnInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  test('should set language from localStorage on constructor', () => {
    expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en');
    expect(mockTranslate.use).toHaveBeenCalledWith('en');
  });

  test('should initialize titles in constructor', () => {
    expect(component.titles.length).toBe(2);
    expect(component.titles[0].title).toBe('Events');
  });

  test('should handle scroll events when conditions are met', () => {
    // Setup conditions for scroll to trigger fetchData
    component.isLoading = false;
    component.showNextPage = true;
    
    // Mock fetchData to check if it's called by onDebouncedScroll
    jest.spyOn(component, 'fetchData').mockImplementation(() => {});
    
    // Replace the mock with one that calls fetchData directly
    component.onDebouncedScroll = jest.fn().mockImplementation(() => {
      component.fetchData();
    });
    
    // Trigger scroll event
    component.onScroll(new Event('scroll'));
    
    // Wait for debounce time
    jest.advanceTimersByTime(600);
    
    // Check if onDebouncedScroll was called (this happens via the private scrollSubject)
    expect(component.onDebouncedScroll).toHaveBeenCalled();
    expect(component.fetchData).toHaveBeenCalled();
  });

  test('should not call onDebouncedScroll when isLoading is true', () => {
    component.isLoading = true;
    component.showNextPage = true;
    
    // Replace the mock
    component.onDebouncedScroll = jest.fn();
    
    component.onScroll(new Event('scroll'));
    
    // Wait for debounce time
    jest.advanceTimersByTime(600);
    
    expect(component.onDebouncedScroll).not.toHaveBeenCalled();
  });

  test('should not call onDebouncedScroll when showNextPage is false', () => {
    component.isLoading = false;
    component.showNextPage = false;
    
    // Replace the mock
    component.onDebouncedScroll = jest.fn();
    
    component.onScroll(new Event('scroll'));
    
    // Wait for debounce time
    jest.advanceTimersByTime(600);
    
    expect(component.onDebouncedScroll).not.toHaveBeenCalled();
  });

  test('should trigger fetchData on search control value change', () => {
    jest.spyOn(component, 'resetData').mockImplementation(() => {});
    jest.spyOn(component, 'fetchData').mockImplementation(() => {});
    
    component.searchControl.setValue('test search');
    
    expect(mockRouter.navigate).toHaveBeenCalled();
    expect(component.resetData).toHaveBeenCalled();
    expect(component.fetchData).toHaveBeenCalled();
  });

  test('should generate request body correctly with basic filters', () => {
    component.searchControl.setValue('test search');
    component.pageLimit = 9;
    component.currentPage = 0;
    
    const requestBody = component.generateRequestBody();
    
    expect(requestBody.request.query).toBe('test search');
    expect(requestBody.request.filters.contentType).toBe('Event');
    expect(requestBody.request.limit).toBe(9);
    expect(requestBody.request.offset).toBe(0);
  });

  test('should generate request body with Today filter correctly', () => {
    component.selectedFilters = {
      eventDate: ['Today']
    };
    
    const requestBody = component.generateRequestBody();
    
    expect(requestBody.request.filters.startDate).toEqual({ '>=': ['2025-05-16'] });
    expect(requestBody.request.filters.endDate).toEqual({ '<=': ['2025-05-16'] });
  });

  test('should generate request body with Tomorrow filter correctly', () => {
    component.selectedFilters = {
      eventDate: ['Tomorrow']
    };
    
    const requestBody = component.generateRequestBody();
    
    expect(requestBody.request.filters.startDate).toEqual({ '>=': ['2025-05-16'] });
    expect(requestBody.request.filters.endDate).toEqual({ '<=': ['2025-05-16'] });
  });

  test('should generate request body with custom date range correctly', () => {
    component.selectedFilters = {
      dateRange: {
        fromDate: new Date('2025-05-10'),
        toDate: new Date('2025-05-20')
      }
    };
    
    const requestBody = component.generateRequestBody();
    
    expect(requestBody.request.filters.startDate).toEqual({ '>=': ['2025-05-16'] });
    expect(requestBody.request.filters.endDate).toEqual({ '<=': ['2025-05-16'] });
  });

  test('should generate request body with Upcoming events filter correctly', () => {
    component.selectedFilters = {
      eventStatus: ['Upcoming']
    };
    
    const requestBody = component.generateRequestBody();
    
    expect(requestBody.request.filters.startDateTimeInEpoch).toBeDefined();
    expect(Object.keys(requestBody.request.filters.startDateTimeInEpoch)[0]).toBe('>=');
  });

  test('should process Live events correctly', () => {
    const mockEvent = {
      startDate: '2025-05-16',
      endDate: '2025-05-16',
      startTime: '00:00:00',
      endTime: '23:59:59'
    };
    
    // Mock Date.now to return a time within the event timeframe
    const originalDate = global.Date;
    const mockNow = jest.fn(() => new Date('2025-05-16T12:00:00').getTime());
    
    // Mock Date constructor and methods
    // global.Date = class extends originalDate {
    //   constructor(...args: any[]) {
    //     super(...args);
    //   }
    //   static now() {
    //     return mockNow();
    //   }
    // } as any;
    
    // Mock the getTime method for all Date instances
    Date.prototype.getTime = function() {
      return mockNow();
    };
    
    expect(component.isLiveEvent(mockEvent)).toBe(true);
    
    // Restore original Date
    global.Date = originalDate;
  });

  test('should identify non-Live events correctly', () => {
    const mockEvent = {
      startDate: '2025-05-20',
      endDate: '2025-05-21',
      startTime: '00:00:00',
      endTime: '23:59:59'
    };
    
    expect(component.isLiveEvent(mockEvent)).toBe(false);
  });

  test('should process result with Past Events filter correctly', () => {
    component.selectedFilters = {
      eventStatus: ['Past Events']
    };
    
    const mockEvents = [
      {
        startDate: '2025-05-10',
        endDate: '2025-05-11',
        startTime: '00:00:00',
        endTime: '23:59:59'
      }
    ];
    
    // Mock Date to return a time after the event
    const originalDate = global.Date;
    const mockNow = jest.fn(() => new Date('2025-05-12T12:00:00').getTime());
    
    // Mock Date constructor and methods
    // global.Date = class extends originalDate {
    //   constructor(...args: any[]) {
    //     super(...args);
    //   }
    //   static now() {
    //     return mockNow();
    //   }
    // } as any;
    
    // Mock the getTime method for all Date instances
    Date.prototype.getTime = function() {
      return mockNow();
    };
    
    const result = component.processResult(mockEvents);
    
    expect(result.length).toBe(1);
    
    // Restore original Date
    global.Date = originalDate;
  });

  test('fetchData should handle successful response', () => {
    // Spy on methods we don't want to actually execute
    jest.spyOn(component, 'resetData').mockImplementation(() => {});
    
    // Set up initial state
    component.contentDataList = [];
    component.contnet = []; // This is likely a typo in the component, but we'll match it
    component.currentPage = 0;
    component.isLoading = false;
    
    // Setup a mock for getEventsList with a successful response
    mockEventSvc.getEventsList = jest.fn().mockReturnValue(of({
      result: {
        Event: [
          { id: 1, name: 'Test Event 1' },
          { id: 2, name: 'Test Event 2' }
        ],
        count: 2
      }
    }));
    
    // Call fetchData
    component.fetchData();
    
    // Verify the expected changes to component state
    expect(component.isLoading).toBe(false); // Should be false after completion
    expect(component.currentPage).toBe(1); // Should increment
    expect(mockEventSvc.getEventsList).toHaveBeenCalled();
  });

  test('fetchData should handle error response', () => {
    // Spy on methods we don't want to actually execute
    jest.spyOn(component, 'resetData').mockImplementation(() => {});
    
    // Set up initial state
    component.contentDataList = [];
    component.contnet = [];
    component.currentPage = 0;
    component.isLoading = false;
    
    // Setup a mock for getEventsList with an error response
    mockEventSvc.getEventsList = jest.fn().mockReturnValue(throwError('Error fetching data'));
    
    // Call fetchData
    component.fetchData();
    
    // Verify the expected changes to component state
    expect(component.isLoading).toBe(false); // Should be false after error
    expect(mockEventSvc.getEventsList).toHaveBeenCalled();
  });

  test('should open bottom sheet for mobile filters', () => {
    component.openBottomSheet();
    
    expect(mockBottomSheet.open).toHaveBeenCalled();
  });

  test('should clear all filters', () => {
    // Setup spies
    jest.spyOn(component, 'resetData').mockImplementation(() => {});
    jest.spyOn(component, 'fetchData').mockImplementation(() => {});
    
    // Setup initial state
    component.selectedFilters = { resourceType: ['Workshop'] };
    component.startDate = '2025-05-10';
    component.endDate = '2025-05-20';
    component.selectedValue = 'someValue';
    
    component.clearAll();
    
    expect(component.selectedFilters).toEqual({});
    expect(component.startDate).toBe('');
    expect(component.endDate).toBe('');
    expect(component.selectedValue).toBeNull();
    expect(component.resetData).toHaveBeenCalled();
    expect(component.fetchData).toHaveBeenCalled();
  });

  test('should remove date range filter correctly', () => {
    // Setup spies
    jest.spyOn(component, 'resetData').mockImplementation(() => {});
    jest.spyOn(component, 'fetchData').mockImplementation(() => {});
    
    // Setup initial state
    component.selectedFilters = { dateRange: { fromDate: new Date(), toDate: new Date() } };
    component.startDate = '2025-05-10';
    component.endDate = '2025-05-20';
    
    component.removeFilter('dateRange', null);
    
    expect(component.selectedFilters.dateRange).toBeUndefined();
    expect(component.startDate).toBe('');
    expect(component.endDate).toBe('');
    expect(component.resetData).toHaveBeenCalled();
    expect(component.fetchData).toHaveBeenCalled();
  });

  test('should remove resourceType filter correctly', () => {
    // Setup spies
    jest.spyOn(component, 'resetData').mockImplementation(() => {});
    jest.spyOn(component, 'fetchData').mockImplementation(() => {});
    
    // Setup initial state
    component.selectedFilters = { resourceType: ['Workshop', 'Webinar'] };
    
    component.removeFilter('resourceType', 'Workshop');
    
    expect(component.selectedFilters.resourceType).toEqual(['Webinar']);
    expect(component.resetData).toHaveBeenCalled();
    expect(component.fetchData).toHaveBeenCalled();
  });

  // Since transformContentsToWidgets is private, we test its functionality indirectly
  test('should populate contentDataList from fetchData', () => {
    // This test indirectly tests transformContentsToWidgets functionality
    // by checking if contentDataList is populated correctly after fetchData
    
    // Set up initial state
    component.contentDataList = [];
    component.contnet = [];
    component.currentPage = 0;
    component.isLoading = false;
    
    // Setup a mock for getEventsList with a successful response
    mockEventSvc.getEventsList = jest.fn().mockReturnValue(of({
      result: {
        Event: [
          { 
            id: 1, 
            name: 'Test Event 1',
            startDate: '2025-05-16',
            endDate: '2025-05-16',
            startTime: '00:00:00',
            endTime: '23:59:59'
          }
        ],
        count: 1
      }
    }));
    
    // Call fetchData
    component.fetchData();
    
    // Check that contentDataList has been populated
    expect(component.contentDataList.length).toBeGreaterThan(0);
    // The exact structure can't be verified since it depends on private methods,
    // but we can check that some content was added
  });

  test('should reset data correctly', () => {
    // Setup initial state
    component.dataScription = { unsubscribe: jest.fn() } as unknown as Subscription;
    component.contentDataList = [{ id: 1 }, { id: 2 }];
    component.currentPage = 2;
    component.pageLimit = 15;
    component.totalCount = 30;
    component.total = 30;
    
    component.resetData();
    
    expect(component.dataScription!.unsubscribe).toHaveBeenCalled();
    expect(component.dataScription).toBeNull();
    expect(component.contentDataList).toEqual([]);
    expect(component.currentPage).toBe(0);
    expect(component.pageLimit).toBe(9);
    expect(component.totalCount).toBe(0);
    expect(component.total).toBe(0);
  });

  test('should handle date change correctly', () => {
    // Setup spies
    jest.spyOn(component, 'resetData').mockImplementation(() => {});
    jest.spyOn(component, 'fetchData').mockImplementation(() => {});
    
    const mockFacet = { key: 'dateRange' };
    
    // Test start date change
    component.onDateChange({ value: new Date('2025-05-10') }, { key: 'fromDate' }, mockFacet);
    expect(component.startDate).toBe('2025-05-16');
    
    // Test end date change
    component.onDateChange({ value: new Date('2025-05-20') }, { key: 'toDate' }, mockFacet);
    
    // Both dates are set, should update filters
    expect(component.selectedFilters.dateRange).toBeDefined();
    expect(component.selectedFilters.eventDate).toBeUndefined();
    expect(component.selectedFilters.eventStatus).toBeUndefined();
    expect(component.resetData).toHaveBeenCalled();
    expect(component.fetchData).toHaveBeenCalled();
  });

  test('should handle date change with invalid dates', () => {
    // Set up an invalid date scenario (start date > end date)
    mockDatePipe.transform = jest.fn()
      .mockImplementationOnce(() => '2025-05-20')  // Start date
      .mockImplementationOnce(() => '2025-05-10'); // End date
    
    component.startDate = '2025-05-20';
    component.onDateChange({ value: new Date('2025-05-10') }, { key: 'toDate' }, { key: 'dateRange' });
    
    expect(mockSnackbar.open).toHaveBeenCalledWith('Start date should not greater than end date.');
  });

  test('should handle event status change correctly', () => {
    // Setup spies
    jest.spyOn(component, 'resetData').mockImplementation(() => {});
    jest.spyOn(component, 'fetchData').mockImplementation(() => {});
    
    // Setup initial state
    component.selectedFilters = {
      dateRange: { fromDate: new Date(), toDate: new Date() },
      eventDate: ['Today']
    };
    component.startDate = '2025-05-10';
    component.endDate = '2025-05-20';
    
    component.changeStatus({ name: 'Live Events' }, 'eventStatus');
    
    expect(component.selectedFilters.eventStatus).toEqual(['Live Events']);
    expect(component.selectedFilters.dateRange).toBeUndefined();
    expect(component.selectedFilters.eventDate).toBeUndefined();
    expect(component.startDate).toBe('');
    expect(component.endDate).toBe('');
    expect(component.resetData).toHaveBeenCalled();
    expect(component.fetchData).toHaveBeenCalled();
  });

  test('should handle filter selection change correctly', () => {
    // Setup spies
    jest.spyOn(component, 'resetData').mockImplementation(() => {});
    jest.spyOn(component, 'fetchData').mockImplementation(() => {});
    
    // Test adding a new filter
    component.selectedFilters = {};
    component.changeSelection(true, 'resourceType', { name: 'Workshop' });
    
    expect(component.selectedFilters.resourceType).toEqual(['Workshop']);
    expect(component.resetData).toHaveBeenCalled();
    expect(component.fetchData).toHaveBeenCalled();
    
    // Test adding to existing filters
    jest.clearAllMocks();
    component.selectedFilters = { resourceType: ['Workshop'] };
    component.changeSelection(true, 'resourceType', { name: 'Webinar' });
    
    expect(component.selectedFilters.resourceType).toEqual(['Workshop', 'Webinar']);
    expect(component.resetData).toHaveBeenCalled();
    expect(component.fetchData).toHaveBeenCalled();
    
    // Test removing filter
    jest.clearAllMocks();
    component.selectedFilters = { resourceType: ['Workshop', 'Webinar'] };
    component.changeSelection(false, 'resourceType', { name: 'Workshop' });
    
    expect(component.selectedFilters.resourceType).toEqual(['Webinar']);
    expect(component.resetData).toHaveBeenCalled();
    expect(component.fetchData).toHaveBeenCalled();
    
    // Test removing last filter in category
    jest.clearAllMocks();
    component.selectedFilters = { resourceType: ['Webinar'] };
    component.changeSelection(false, 'resourceType', { name: 'Webinar' });
    
    expect(component.selectedFilters.resourceType).toBeUndefined();
    expect(component.resetData).toHaveBeenCalled();
    expect(component.fetchData).toHaveBeenCalled();
  });

  test('should translate labels correctly', () => {
    component.translateLabels('testLabel', 'events');
    
    expect(mockLangTranslations.translateActualLabel).toHaveBeenCalledWith('testLabel', 'events', '');
  });

  test('should convert to camel case correctly', () => {
    const result = component.toCamelCase('Past Events');
    
    expect(result).toBe('pastEvents');
  });
});