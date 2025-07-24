// mobile-filters.component.spec.ts
import { MobileFiltersComponent } from './mobile-filters.component';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2';

describe('MobileFiltersComponent', () => {
  let component: MobileFiltersComponent;
  let mockBottomSheetRef: jest.Mocked<MatBottomSheetRef<any>>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  let mockDatePipe: jest.Mocked<DatePipe>;
  let mockTranslateService: jest.Mocked<TranslateService>;
  let mockMultilingualService: jest.Mocked<MultilingualTranslationsService>;
  let mockData: any;

  beforeEach(() => {
    // Mock all dependencies
    mockBottomSheetRef = {
      dismiss: jest.fn()
    } as unknown as jest.Mocked<MatBottomSheetRef<any>>;
    
    mockSnackBar = {
      open: jest.fn()
    } as unknown as jest.Mocked<MatSnackBar>;
    
    mockDatePipe = {
      transform: jest.fn().mockImplementation((date, format) => {
        if (!date) return null;
        // Simple mock implementation for date pipe
        if (format === 'yyyy-MM-dd') {
          return date instanceof Date ? 
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : 
            date;
        }
        return date;
      })
    } as unknown as jest.Mocked<DatePipe>;
    
    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    } as unknown as jest.Mocked<TranslateService>;
    
    mockMultilingualService = {
      translateActualLabel: jest.fn().mockImplementation((label) => label)
    } as unknown as jest.Mocked<MultilingualTranslationsService>;
    
    mockData = {
      facetsData: [
        { 
          key: 'resourceType',
          values: [{ name: 'Course' }, { name: 'Resource' }]
        },
        {
          key: 'eventDate',
          values: [{ name: 'Upcoming' }, { name: 'Ongoing' }, { name: 'Past' }]
        },
        {
          key: 'eventStatus',
          values: [{ name: 'Live' }, { name: 'Upcoming' }]
        }
      ],
      selectedFilters: {
        resourceType: ['Course'],
        eventDate: ['Upcoming']
      },
      clonedFilters: {
        resourceType: ['Course'],
        eventDate: ['Upcoming']
      }
    };

    // Storage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockImplementation(key => {
          if (key === 'websiteLanguage') return 'en';
          return null;
        }),
        setItem: jest.fn()
      },
      writable: true
    });

    // Create component instance
    component = new MobileFiltersComponent(
      mockData,
      mockSnackBar,
      mockDatePipe,
      mockTranslateService,
      mockMultilingualService,
      mockBottomSheetRef
    );
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with provided data', () => {
    // Call ngOnInit manually since we're not using TestBed
    component.ngOnInit();
    
    expect(component.facetsData).toEqual(mockData.facetsData);
    expect(component.selectedFilters).toEqual(mockData.selectedFilters);
    expect(component.clonedFilters).toEqual(mockData.clonedFilters);
  });

  it('should set language from localStorage during construction', () => {
    // This happens in constructor, no need to call ngOnInit
    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(mockTranslateService.use).toHaveBeenCalledWith('en');
  });

  it('should correctly check if filter is selected', () => {
    component.ngOnInit();
    
    expect(component.canCheck('resourceType', { name: 'Course' })).toBeTruthy();
    expect(component.canCheck('resourceType', { name: 'Resource' })).toBeFalsy();
    expect(component.canCheck('nonExistentKey', { name: 'Value' })).toBeUndefined();
  });

  it('should add filter when changeSelection is called with true', () => {
    component.ngOnInit();
    
    component.changeSelection(true, 'resourceType', { name: 'Resource' }, []);
    
    expect(component.selectedFilters.resourceType).toContain('Resource');
    expect(component.selectedFilters.resourceType.length).toBe(2);
  });

  it('should remove filter when changeSelection is called with false', () => {
    component.ngOnInit();
    
    component.changeSelection(false, 'resourceType', { name: 'Course' }, []);
    
    expect(component.selectedFilters.resourceType).toBeUndefined();
  });

  it('should handle date range selection for fromDate', () => {
    component.ngOnInit();
    const mockDate = new Date('2023-01-15');
    
    component.onDateChange({ value: mockDate }, { key: 'fromDate' }, {});
    
    expect(component.startDate).toBe('2023-01-15');
    expect(component.selectedFilters.dateRange).toEqual({ fromDate: '2023-01-15' });
    expect(component.selectedValue).toEqual({});
  });

  it('should handle date range selection for toDate', () => {
    component.ngOnInit();
    const mockDate = new Date('2023-01-20');
    
    component.onDateChange({ value: mockDate }, { key: 'toDate' }, {});
    
    expect(component.endDate).toBe('2023-01-20');
    expect(component.selectedFilters.dateRange).toEqual({ toDate: '2023-01-20' });
  });

  it('should clear all filters', () => {
    component.ngOnInit();
    
    component.clearAll();
    
    expect(component.selectedFilters).toEqual({});
    expect(component.startDate).toBe('');
    expect(component.endDate).toBe('');
    expect(component.selectedValue).toEqual({});
  });

  it('should handle event status change', () => {
    component.ngOnInit();
    const mockStatus = { name: 'Live' };
    
    component.changeStatus(mockStatus, 'eventStatus');
    
    expect(component.selectedValue).toEqual(mockStatus);
    expect(component.selectedFilters.eventStatus).toEqual(['Live']);
    expect(component.selectedFilters.dateRange).toBeUndefined();
    expect(component.selectedFilters.eventDate).toBeUndefined();
    expect(component.startDate).toBe('');
    expect(component.endDate).toBe('');
  });

  it('should dismiss sheet with selected filters when apply is called', () => {
    component.ngOnInit();
    
    component.applyFilter('apply');
    
    expect(mockBottomSheetRef.dismiss).toHaveBeenCalledWith({
      selectedFilters: component.selectedFilters,
      action: 'apply'
    });
  });

  it('should dismiss sheet with cloned filters when cancel is called', () => {
    component.ngOnInit();
    
    component.applyFilter('cancel');
    
    expect(mockBottomSheetRef.dismiss).toHaveBeenCalledWith({
      selectedFilters: component.clonedFilters,
      action: 'cancel'
    });
  });

  it('should validate date range before applying filter', () => {
    component.ngOnInit();
    component.startDate = '2023-01-20';
    component.endDate = '2023-01-15';
    component.selectedFilters.dateRange = {};
    
    component.applyFilter('apply');
    
    expect(mockSnackBar.open).toHaveBeenCalledWith('Start date should not greater than end date.');
    expect(mockBottomSheetRef.dismiss).not.toHaveBeenCalled();
  });

  it('should show error if date range is incomplete', () => {
    component.ngOnInit();
    component.startDate = '2023-01-15';
    component.endDate = '';
    component.selectedFilters.dateRange = {};
    
    component.applyFilter('apply');
    
    expect(mockSnackBar.open).toHaveBeenCalledWith('Choose a valid date range.');
    expect(mockBottomSheetRef.dismiss).not.toHaveBeenCalled();
  });

  it('should handle valid date range correctly', () => {
    component.ngOnInit();
    const startDate = new Date('2023-01-15');
    const endDate = new Date('2023-01-20');
    component.startDate = '2023-01-15';
    component.endDate = '2023-01-20';
    component.selectedFilters.dateRange = {};
    component.selectedFilters.eventDate = ['Upcoming'];
    component.selectedFilters.eventStatus = ['Live'];
    
    component.applyFilter('apply');
    
    expect(component.selectedFilters.eventDate).toBeUndefined();
    expect(component.selectedFilters.eventStatus).toBeUndefined();
    expect(component.selectedFilters.dateRange).toEqual({ 
      fromDate: startDate, 
      toDate: endDate 
    });
    expect(mockBottomSheetRef.dismiss).toHaveBeenCalledWith({
      selectedFilters: component.selectedFilters,
      action: 'apply'
    });
  });

  it('should translate labels correctly', () => {
    component.ngOnInit();
    const label = 'testLabel';
    const type = 'testType';
    
    const result = component.translateLabels(label, type);
    
    expect(mockMultilingualService.translateActualLabel).toHaveBeenCalledWith(label, type, '');
    expect(result).toBe(label);
  });

  it('should handle date initialization when dateRange is present', () => {
    const dateRangeData = {
      ...mockData,
      selectedFilters: {
        ...mockData.selectedFilters,
        dateRange: {
          fromDate: new Date('2023-01-15'),
          toDate: new Date('2023-01-20')
        }
      }
    };
    
    // mockDatePipe.transform.mockImplementation((date, format) => {
    //   if (format === 'yyyy-MM-dd') {
    //     if (date instanceof Date) {
    //       return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    //     }
    //   }
    //   return date;
    // });
    
    const componentWithDateRange = new MobileFiltersComponent(
      dateRangeData,
      mockSnackBar,
      mockDatePipe,
      mockTranslateService,
      mockMultilingualService,
      mockBottomSheetRef
    );
    
    componentWithDateRange.ngOnInit();
    
    expect(componentWithDateRange.startDate).toBe('2023-01-15');
    expect(componentWithDateRange.endDate).toBe('2023-01-20');
  });

  it('should initialize with eventStatus when present', () => {
    const statusData = {
      ...mockData,
      selectedFilters: {
        ...mockData.selectedFilters,
        eventStatus: ['Live']
      }
    };
    
    const componentWithStatus = new MobileFiltersComponent(
      statusData,
      mockSnackBar,
      mockDatePipe,
      mockTranslateService,
      mockMultilingualService,
      mockBottomSheetRef
    );
    
    componentWithStatus.ngOnInit();
    
    expect(componentWithStatus.selectedValue).toEqual({ name: 'Live' });
  });

  it('should return zero when returnZero is called', () => {
    expect(component.returnZero()).toBe(0);
  });
});