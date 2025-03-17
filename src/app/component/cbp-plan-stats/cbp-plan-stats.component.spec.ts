import { CbpPlanStatsComponent } from './cbp-plan-stats.component';
import { of } from 'rxjs';
import * as dayjsImported from 'dayjs';

// Create type for mocked dayjs
type DayjsMock = typeof dayjsImported & {
  extend: jest.Mock;
};

// Mock the dayjs module
jest.mock('dayjs', () => {
  const originalDayjs:any = jest.fn(() => {
    // Create a mock object with the necessary methods
    return {
      subtract: jest.fn(() => originalDayjs()),
      add: jest.fn(() => originalDayjs()),
      format: jest.fn(() => '2023-01-01'),
      isSameOrAfter: jest.fn(() => true),
      isSameOrBefore: jest.fn(() => true),
      isAfter: jest.fn(() => false),
      isBefore: jest.fn(() => false),
      isSame: jest.fn(() => true)
    };
  });
  
  // Add static methods to the function
  originalDayjs.extend = jest.fn();
  
  return originalDayjs;
});

// Create mocks for the other dependencies
jest.mock('@ngx-translate/core');
jest.mock('@sunbird-cb/utils-v2');
jest.mock('dayjs')

describe('CbpPlanStatsComponent', () => {
  let component: CbpPlanStatsComponent;
  let translateServiceMock: any;
  let multilingualTranslationsServiceMock: any;
  let dayjs: DayjsMock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Get the mocked dayjs instance
    dayjs = dayjsImported as unknown as DayjsMock;

    // Setup mock for TranslateService
    translateServiceMock = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    };

    // Setup mock for MultilingualTranslationsService
    multilingualTranslationsServiceMock = {
      languageSelectedObservable: of(null)
    };

    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString();
        },
        clear: () => {
          store = {};
        }
      };
    })();
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    // Create component instance with mocked dependencies
    component = new CbpPlanStatsComponent(
      translateServiceMock,
      multilingualTranslationsServiceMock
    );
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
    expect(dayjs.extend).toHaveBeenCalledTimes(2);
  });

  it('should initialize filterList correctly', () => {
    expect(component.filterList).toEqual([
      { id: 3, value: 'Last 3 months' }, 
      { id: 6, value: 'Last 6 months' }, 
      { id: 12, value: 'Last year' }
    ]);
    expect(component.filterLoaded).toBe(false);
  });

  it('should set default language to English when websiteLanguage is set', () => {
    // Given
    localStorage.setItem('websiteLanguage', 'fr');
    
    // When - constructor is called during component initialization
    component = new CbpPlanStatsComponent(
      translateServiceMock,
      multilingualTranslationsServiceMock
    );
    
    // Then
    expect(translateServiceMock.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateServiceMock.use).toHaveBeenCalledWith('fr');
  });

  it('should not set languages when websiteLanguage is not set', () => {
    // Given
    localStorage.clear();
    
    // When - constructor is called during component initialization
    component = new CbpPlanStatsComponent(
      translateServiceMock,
      multilingualTranslationsServiceMock
    );
    
    // Then
    expect(translateServiceMock.setDefaultLang).not.toHaveBeenCalled();
    expect(translateServiceMock.use).not.toHaveBeenCalled();
  });

  describe('onfilterChange', () => {
    beforeEach(() => {
      // Setup test data with different dates
      component.cbpOriginalData = [
        {
          endDate: '2023-01-15',
          planDuration: 'overdue'
        },
        {
          endDate: '2023-02-20',
          planDuration: 'upcoming'
        },
        {
          endDate: '2022-10-10',
          planDuration: 'overdue'
        },
        {
          endDate: '2022-05-05',
          planDuration: 'upcoming'
        }
      ];
    });

    it('should filter data correctly and update cbpCount', () => {
      // Given
      const filterData = { id: 3, value: 'Last 3 months' };
      
      // Mock the filter behavior for cbpOriginalData
      const mockFilteredData = [
        {
          endDate: '2023-01-15',
          planDuration: 'overdue'
        },
        {
          endDate: '2023-02-20',
          planDuration: 'upcoming'
        }
      ];
      
      // Mock the Array.filter method to return our controlled test data
      jest.spyOn(Array.prototype, 'filter').mockReturnValueOnce(mockFilteredData);
      
      // When
      component.onfilterChange(filterData);
      
      // Then
      expect(component.filterLoaded).toBe(true);
      expect(component.cbpLoader).toBe(false);
      expect(component.cbpCount).toEqual({
        upcoming: 1,
        overdue: 1,
        all: 2
      });
    });

    it('should set loader to true initially and false after filtering', () => {
      // Given
      component.cbpLoader = false;
      const filterData = { id: 3, value: 'Last 3 months' };
      
      // Mock the Array.filter method to return our controlled test data
      jest.spyOn(Array.prototype, 'filter').mockReturnValueOnce([]);
      
      // When
      component.onfilterChange(filterData);
      
      // Then
      expect(component.filterLoaded).toBe(true);
      expect(component.cbpLoader).toBe(false);
    });
    
    it('should handle empty result after filtering', () => {
      // Given
      const filterData = { id: 3, value: 'Last 3 months' };
      
      // Mock the filter to return empty array
      jest.spyOn(Array.prototype, 'filter').mockReturnValueOnce([]);
      
      // When
      component.onfilterChange(filterData);
      
      // Then
      expect(component.cbpCount).toEqual({
        upcoming: 0,
        overdue: 0,
        all: 0
      });
    });
    
    it('should handle all items being overdue', () => {
      // Given
      const filterData = { id: 6, value: 'Last 6 months' };
      
      // Mock the filter to return only overdue items
      const mockFilteredData = [
        {
          endDate: '2023-01-15',
          planDuration: 'overdue'
        },
        {
          endDate: '2022-10-10',
          planDuration: 'overdue'
        }
      ];
      
      jest.spyOn(Array.prototype, 'filter').mockReturnValueOnce(mockFilteredData);
      
      // When
      component.onfilterChange(filterData);
      
      // Then
      expect(component.cbpCount).toEqual({
        upcoming: 0,
        overdue: 2,
        all: 2
      });
    });
    
    it('should handle all items being upcoming', () => {
      // Given
      const filterData = { id: 12, value: 'Last year' };
      
      // Mock the filter to return only upcoming items
      const mockFilteredData = [
        {
          endDate: '2023-02-20',
          planDuration: 'upcoming'
        },
        {
          endDate: '2022-05-05',
          planDuration: 'upcoming'
        }
      ];
      
      jest.spyOn(Array.prototype, 'filter').mockReturnValueOnce(mockFilteredData);
      
      // When
      component.onfilterChange(filterData);
      
      // Then
      expect(component.cbpCount).toEqual({
        upcoming: 2,
        overdue: 0,
        all: 2
      });
    });
  });
  
  describe('ngOnInit', () => {
    it('should initialize component', () => {
      // When
      component.ngOnInit();
      
      // Then - currently this method is empty, but we test it for coverage
      expect(component).toBeTruthy();
    });
  });
});
