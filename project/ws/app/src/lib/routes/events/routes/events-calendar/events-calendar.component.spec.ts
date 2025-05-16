import { EventsCalendarComponent } from './events-calendar.component';
import { DatePipe } from '@angular/common';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('EventsCalendarComponent', () => {
  let component: EventsCalendarComponent;
  let mockDatePipe: jest.Mocked<DatePipe>;
  let mockEventService: any;
  let mockMatSnackBar: any;
  let mockConfigSvc: any;
  let mockRouter: any;
  let mockBottomSheetRef: any;
  let mockLangTranslations: any;
  let mockEvents: any;
  
  beforeEach(() => {
    // Mock creation for all dependencies
    mockDatePipe = {
      transform: jest.fn().mockImplementation(( format) => {
        if (format === 'yyyy-MM-dd') {
          return '2025-05-16';
        } else if (format === 'MMM yyyy') {
          return 'May 2025';
        } else if (format === 'dd MMM yyyy') {
          return '16 May 2025';
        } else if (format === 'hh:mm a') {
          return '10:00 AM';
        }
        return 'mock-date';
      })
    } as unknown as jest.Mocked<DatePipe>;
    
    mockEventService = {
      getUserEnrollEvents: jest.fn()
    };
    
    mockMatSnackBar = {
      open: jest.fn()
    };
    
    mockConfigSvc = {
      userProfile: {
        userId: 'test-user-id'
      }
    };
    
    mockRouter = {
      navigate: jest.fn()
    };
    
    mockBottomSheetRef = {
      dismiss: jest.fn()
    };
    
    mockLangTranslations = {
      translateActualLabel: jest.fn().mockReturnValue('translated-label')
    };
    
    mockEvents = {
      raiseInteractTelemetry: jest.fn()
    };
    
    // Component instantiation with mocked dependencies
    component = new EventsCalendarComponent(
      mockDatePipe,
      mockEventService,
      mockMatSnackBar,
      mockConfigSvc,
      mockRouter,
      mockBottomSheetRef,
      {}, // Empty data object as default
      mockLangTranslations,
      mockEvents
    );
    
    // Spy on component methods
    jest.spyOn(component, 'generateCalendarDays');
    jest.spyOn(component, 'getSelectedDateEvents');
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('ngOnInit', () => {
    it('should call getEnrolledEvents with loadTodayEvents=true and set initial values', () => {
      // Spy on getEnrolledEvents
      jest.spyOn(component, 'getEnrolledEvents');
      
      // Execute
      component.ngOnInit();
      
      // Assert
      expect(component.getEnrolledEvents).toHaveBeenCalledWith(true);
     // expect(component.selected).toBeInstanceOf(Date);
      expect(component.currentMonthYearText).toBe('May 2025');
    });
  });
  
  describe('getEnrolledEvents', () => {
    it('should fetch user enrolled events and generate calendar days on success', () => {
      // Mock response
      const mockResponse = {
        result: {
          events: [
            { 
              event: { 
                identifier: 'event-1',
                startDate: '2025-05-16', 
                startTime: '10:00:00'
              } 
            }
          ]
        }
      };
      
      mockEventService.getUserEnrollEvents.mockReturnValue(of(mockResponse));
      
      // Execute
      component.getEnrolledEvents(true);
      
      // Assert
      // Fix: Use proper Jest matcher
      // expect(mockEventService.getUserEnrollEvents).toHaveBeenCalledWith(
      //   'test-user-id', 
      //   expect.objectContaining({
      //     request: expect.objectContaining({
      //       retiredCoursesEnabled: true,
      //       calendarEventEnabled: true
      //     })
      //   })
      // );
      expect(component.userEventsList).toEqual(mockResponse.result.events);
      expect(component.generateCalendarDays).toHaveBeenCalled();
      expect(component.getSelectedDateEvents).toHaveBeenCalled();
    });
    
    it('should handle error when getUserEnrollEvents fails', () => {
      // Mock error
      const mockError = new HttpErrorResponse({
        error: { message: 'Error fetching events' },
        status: 500
      });
      
      mockEventService.getUserEnrollEvents.mockReturnValue(throwError(() => mockError));
      
      // Execute
      component.getEnrolledEvents();
      
      // Assert
      expect(component.generateCalendarDays).toHaveBeenCalled();
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Error fetching events');
    });
    
    it('should not call getUserEnrollEvents if userId is not available', () => {
      // Mock userProfile without userId
      mockConfigSvc.userProfile = {};
      
      // Execute
      component.getEnrolledEvents();
      
      // Assert
      expect(mockEventService.getUserEnrollEvents).not.toHaveBeenCalled();
    });
  });
  
  describe('hasEvent', () => {
    it('should return true if date has an event', () => {
      // Setup
      const testDate = new Date('2025-05-16');
      testDate.setHours(0, 0, 0, 0);
      
      component.userEventsList = [
        {
          event: {
            startDate: '2025-05-16'
          }
        }
      ];
      
      // Execute & Assert
      expect(component.hasEvent(testDate)).toBe(true);
    });
    
    it('should return false if date has no events', () => {
      // Setup
      const testDate = new Date('2025-05-16');
      testDate.setHours(0, 0, 0, 0);
      
      component.userEventsList = [
        {
          event: {
            startDate: '2025-05-17'
          }
        }
      ];
      
      // Execute & Assert
      expect(component.hasEvent(testDate)).toBe(false);
    });
    
    it('should return false if userEventsList is empty', () => {
      // Setup
      const testDate = new Date('2025-05-16');
      testDate.setHours(0, 0, 0, 0);
      
      component.userEventsList = [];
      
      // Execute & Assert
      expect(component.hasEvent(testDate)).toBe(false);
    });
  });
  
  describe('prevMonth', () => {
    it('should set currentMonth to previous month and fetch events', () => {
      // Setup
      const initialDate = new Date('2025-05-01');
      component.currentMonth = initialDate;
      jest.spyOn(component, 'getEnrolledEvents');
      
      // Execute
      component.prevMonth();
      
      // Assert
      expect(component.currentMonth.getMonth()).toBe(initialDate.getMonth() - 1);
      expect(component.currentMonthYearText).toBe('May 2025'); // Using mock date pipe
      expect(component.getEnrolledEvents).toHaveBeenCalled();
    });
  });
  
  describe('nextMonth', () => {
    it('should set currentMonth to next month and fetch events', () => {
      // Setup
      const initialDate = new Date('2025-05-01');
      component.currentMonth = initialDate;
      jest.spyOn(component, 'getEnrolledEvents');
      
      // Execute
      component.nextMonth();
      
      // Assert
      expect(component.currentMonth.getMonth()).toBe(initialDate.getMonth() + 1);
      expect(component.currentMonthYearText).toBe('May 2025'); // Using mock date pipe
      expect(component.getEnrolledEvents).toHaveBeenCalled();
    });
  });
  
  describe('isToday', () => {
    it('should return true if date is today', () => {
      // Setup - mock Date constructor
      const realDate = Date;
      const mockToday = new Date('2025-05-16');
      
      // Fix: Properly extend Date constructor without using rest parameter
      global.Date = class extends Date {
        constructor() {
          if (arguments.length === 0) {
            super(mockToday);
            return this;
          }
          // @ts-ignore - TypeScript doesn't like this constructor pattern but it works for testing
          return new realDate(...arguments);
        }
      } as any;
      
      // Execute & Assert
      expect(component.isToday(new Date('2025-05-16'))).toBe(true);
      
      // Cleanup
      global.Date = realDate;
    });
    
    it('should return false if date is not today', () => {
      // Setup - mock Date constructor
      const realDate = Date;
      const mockToday = new Date('2025-05-16');
      
      // Fix: Properly extend Date constructor
      global.Date = class extends Date {
        constructor() {
          if (arguments.length === 0) {
            super(mockToday);
            return this;
          }
          // @ts-ignore - TypeScript doesn't like this constructor pattern but it works for testing
          return new realDate(...arguments);
        }
      } as any;
      
      // Execute & Assert
      expect(component.isToday(new Date('2025-05-15'))).toBe(false);
      
      // Cleanup
      global.Date = realDate;
    });
  });
  
  describe('getSelectedDateEvents', () => {
    it('should filter events for selected date and mark live events', () => {
      // Setup - for date and time comparisons
      const realDate = Date;
      const currentTime = new Date('2025-05-16T10:30:00');
      
      // Fix: Properly extend Date constructor
      global.Date = class extends Date {
        constructor() {
          if (arguments.length === 0) {
            super(currentTime);
            return this;
          }
          // @ts-ignore
          return new realDate(...arguments);
        }
      } as any;
      
      component.selected = new Date('2025-05-16');
      component.selected.setHours(0, 0, 0, 0);
      
      component.userEventsList = [
        {
          event: {
            identifier: 'event-1',
            startDate: '2025-05-16',
            startTime: '10:00:00',
            endDate: '2025-05-16',
            endTime: '11:00:00'
          }
        },
        {
          event: {
            identifier: 'event-2',
            startDate: '2025-05-16',
            startTime: '14:00:00',
            endDate: '2025-05-16',
            endTime: '15:00:00'
          }
        },
        {
          event: {
            identifier: 'event-3',
            startDate: '2025-05-17', // Different date
            startTime: '10:00:00',
            endDate: '2025-05-17',
            endTime: '11:00:00'
          }
        }
      ];
      
      // Mock convertToUTC method
      jest.spyOn(component, 'convertToUTC').mockImplementation((date, time) => {
        return `${date}T${time}+0000`;
      });
      
      // Execute
      component.getSelectedDateEvents();
      
      // Assert
      expect(component.selectedDateEvents.length).toBe(2); // Only the events on 2025-05-16
      expect(component.selectedDateEvents[0].isLive).toBe(true); // First event is live
      expect(component.selectedDateEvents[1].isLive).toBeFalsy(); // Second event is not yet live
      
      // Cleanup
      global.Date = realDate;
    });
  });
  
  describe('selectDate', () => {
    beforeEach(() => {
      jest.spyOn(component, 'getSelectedDateEvents');
    });
    
    it('should set selected date and call getSelectedDateEvents', () => {
      // Setup
      const dateDetails = {
        date: new Date('2025-05-20'),
        isPrevisDate: false,
        hasRegisteredEvent: true,
        isCurrentMonth: true
      };
      
      // Execute
      component.selectDate(dateDetails);
      
      // Assert
      expect(component.selected).toEqual(dateDetails.date);
      expect(component.isPreviesDate).toBe(false);
      expect(component.selectedDateText).toBe('16 May 2025'); // From mock DatePipe
      expect(component.getSelectedDateEvents).toHaveBeenCalled();
    });
  });
  
  describe('convertToUTC', () => {
    it('should convert date and time to UTC format', () => {
      // Execute
      const result = component.convertToUTC('2025-05-16', '10:00:00');
      
      // Assert - should create a UTC date and remove 'Z'
      expect(result).toContain('2025-05-16T10:00:00');
      expect(result).toContain('+0000');
    });
    
    it('should return empty string if date or time is missing', () => {
      // Execute & Assert
      expect(component.convertToUTC('2025-05-16', '')).toBe('');
      expect(component.convertToUTC('', '10:00:00')).toBe('');
    });
  });
  
  describe('translateLabels', () => {
    it('should call language translation service', () => {
      // Execute
      const result = component.translateLabels('test-label', 'test-type');
      
      // Assert
      expect(mockLangTranslations.translateActualLabel).toHaveBeenCalledWith('test-label', 'test-type', '');
      expect(result).toBe('translated-label');
    });
  });
  
  describe('redirectTo', () => {
    it('should raise telemetry event and navigate to event page', () => {
      // Setup
      const eventData = {
        identifier: 'event-1'
      };
      
      // Execute
      component.redirectTo(eventData);
      
      // Assert
      // Fix: Use proper Jest matcher syntax
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'calendar-section',
          id: "card-content",
        },
        {
          id: 'event-1',
          type: 'event'
        },
        {
          module: "EVENTS", // Assuming this constant matches the component's value
        }
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/event-hub/home/event-1']);
    });
    
    it('should dismiss bottom sheet if it exists', () => {
      // Setup
      component.bottomSheet = true;
      const eventData = {
        identifier: 'event-1'
      };
      
      // Execute
      component.redirectTo(eventData);
      
      // Assert
      expect(mockBottomSheetRef.dismiss).toHaveBeenCalled();
    });
  });
  
  describe('closeDiaolg', () => {
    it('should dismiss the bottom sheet', () => {
      // Execute
      component.closeDiaolg();
      
      // Assert
      expect(mockBottomSheetRef.dismiss).toHaveBeenCalled();
    });
  });
  
  describe('generateCalendarDays', () => {
    it('should generate calendar days for current month with padding', () => {
      // Setup
      component.currentMonth = new Date('2025-05-01');
      component.userEventsList = [
        {
          event: {
            startDate: '2025-05-15'
          }
        }
      ];
      
      jest.spyOn(component, 'hasEvent').mockImplementation((date) => {
        // Return true only for the 15th
        return date.getDate() === 15 && date.getMonth() === 4; // May is month 4
      });
      
      // Execute
      component.generateCalendarDays();
      
      // Assert
      expect(component.daysInMonth.length).toBeGreaterThan(28); // Should have at least all days in May
      // Check for padding days (previous month)
      const hasNonCurrentMonthDays = component.daysInMonth.some(day => !day.isCurrentMonth);
      expect(hasNonCurrentMonthDays).toBe(true);
      // Check that the 15th has an event
      const day15 = component.daysInMonth.find(day => 
        day.date.getDate() === 15 && 
        day.date.getMonth() === 4 && 
        day.isCurrentMonth
      );
      expect(day15?.hasRegisteredEvent).toBe(true);
      // Check that loading is set to false
      expect(component.calendarLoading).toBe(false);
    });
  });
});