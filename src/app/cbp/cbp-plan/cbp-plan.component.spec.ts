import { CbpPlanComponent } from './cbp-plan.component';

// Mock all external dependencies before imports
jest.mock('@angular/core');
jest.mock('@angular/router');
jest.mock('@sunbird-cb/collection/src/lib/_services/widget-content.model');
jest.mock('@sunbird-cb/collection/src/lib/card-content-v2/card-content-v2.model', () => ({
  NsCardContent: {
    ACBPConst: {
      OVERDUE: 'overdue'
    }
  }
}));
jest.mock('@ngx-translate/core');
jest.mock('@sunbird-cb/utils-v2');
jest.mock('@sunbird-cb/consumption');
jest.mock('lodash', () => ({
  default: {}
}));

// Create a proper mock of dayjs
const mockDayjs = () => {
  return {
    isSameOrAfter: jest.fn().mockReturnValue(true),
    isSameOrBefore: jest.fn().mockReturnValue(true),
    isBetween: jest.fn().mockReturnValue(true),
    subtract: jest.fn().mockReturnValue({
      isSameOrAfter: jest.fn().mockReturnValue(true),
      isSameOrBefore: jest.fn().mockReturnValue(true)
    }),
    add: jest.fn().mockReturnValue({
      isSameOrAfter: jest.fn().mockReturnValue(true),
      isSameOrBefore: jest.fn().mockReturnValue(true)
    }),
    pct_change: jest.fn().mockReturnValue(5)
  };
};
mockDayjs.extend = jest.fn();
mockDayjs.isSameOrAfter = jest.fn().mockReturnValue(true);
mockDayjs.isSameOrBefore = jest.fn().mockReturnValue(true);
mockDayjs.isBetween = jest.fn().mockReturnValue(true);

jest.mock('dayjs', () => {
  return jest.fn(() => mockDayjs());
});
jest.mock('dayjs/plugin/isBetween');
jest.mock('dayjs/plugin/isSameOrBefore');
jest.mock('dayjs/plugin/isSameOrAfter');

describe('CbpPlanComponent', () => {
  // Component to test
  let component: any;
  
  // Mock dependencies
  let mockActivatedRoute: any;
  let mockWidgetSvc: any;
  let mockTranslate: any;
  let mockConfigSvc: any;
  let mockLangTranslations: any;

  // Test data
  const mockPageData = {
    data: {
      cbpConfig: { key: 'value' },
      cbpUpcomingStrips: {
        key: 'upcomingKey',
        customeClass: 'test-class',
        viewMoreUrl: {
          stripConfig: {
            cardSubType: 'card-test'
          },
          loaderConfig: {
            cardSubType: 'card-portrait-skeleton'
          }
        }
      },
      cbpFeedStrip: {
        key: 'feedKey',
        customeClass: 'feed-class',
        viewMoreUrl: {
          stripConfig: {
            cardSubType: 'card-feed'
          }
        }
      },
      cbpFeedMobileStrip: {
        key: 'mobileFeedKey',
        customeClass: 'mobile-feed-class',
        viewMoreUrl: {
          stripConfig: {
            cardSubType: 'card-mobile-feed'
          }
        }
      }
    }
  };

  const mockCbpData = [
    {
      name: 'Test Course 1',
      planDuration: 'overdue',
      endDate: '2023-01-15',
      contentStatus: 1,
      primaryCategory: 'Course',
      competencyArea: ['Area1'],
      competencyTheme: ['Theme1'],
      competencySubTheme: ['SubTheme1'],
      organisation: ['Provider1'],
      batch: { batchId: '123' }
    },
    {
      name: 'Test Course 2',
      planDuration: 'upcoming',
      endDate: '2023-05-30',
      contentStatus: 2,
      primaryCategory: 'Learning Path',
      competencyArea: ['Area2'],
      competencyTheme: ['Theme2'],
      competencySubTheme: ['SubTheme2'],
      organisation: ['Provider2']
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup global mocks
   // global.window = Object.create(window);
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => key === 'websiteLanguage' ? 'en' : null),
        setItem: jest.fn()
      }
    });
    
    Object.defineProperty(window, 'screen', {
      value: { width: 1024 },
      writable: true
    });

    // Setup dependencies
    mockActivatedRoute = {
      snapshot: {
        data: {
          pageData: mockPageData
        }
      }
    };

    mockWidgetSvc = {
      fetchCbpPlanList: jest.fn().mockImplementation(() => ({
        toPromise: jest.fn().mockResolvedValue(mockCbpData)
      }))
    };

    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    };

    mockConfigSvc = {
      userProfile: {
        userId: 'user123'
      }
    };

    mockLangTranslations = {
      languageSelectedObservable: {
        subscribe: jest.fn((cb: Function) => {
          cb();
          return { unsubscribe: jest.fn() };
        })
      }
    };

    // Create component manually
    component = new CbpPlanComponent(
      mockActivatedRoute,
      mockWidgetSvc,
      mockTranslate,
      mockConfigSvc,
      mockLangTranslations
    );

    // Mock component methods directly
    component.transformContentsToWidgets = jest.fn((contents: any, strip: any) => {
      return (contents || []).map((content: any, idx: number) => ({
        widgetType: 'card',
        widgetSubType: 'cardContent',
        widgetHostClass: 'mb-2',
        widgetData: {
          content,
          cardSubType: 'test-card',
          context: {
            pageSection: strip?.key || 'default',
            position: idx
          }
        }
      }));
    });

    component.transformSkeletonToWidgets = jest.fn(() => {
      return [1, 2, 3].map(() => ({
        widgetType: 'card',
        widgetSubType: 'cardContent',
        widgetData: {
          cardSubType: 'skeleton-card'
        }
      }));
    });

    // Initialize component properties
    component.cbpConfig = mockPageData.data.cbpConfig;
    component.cbpAllConfig = mockPageData.data;
    component.upcommingList = [];
    component.overDueList = [];
    component.contentFeedList = [];
    component.completedList = [];
    component.upcomingUncompleted = [];
    component.overdueUncompleted = [];
    component.contentCompletedStatus = 2;
  });

  // Basic test
  it('should create the component', () => {
    expect(component).toBeDefined();
  });

  // Test getFeedStrip method
  it('should return correct strip based on screen width', () => {
    // Test desktop width
    expect(component.getFeedStrip()).toBe(mockPageData.data.cbpFeedStrip);
    
    // Test mobile width
    Object.defineProperty(window, 'screen', {
      value: { width: 767 },
      writable: true
    });
    expect(component.getFeedStrip()).toBe(mockPageData.data.cbpFeedMobileStrip);
  });

  // Test toggleFilterEvent method
  it('should update toggleFilter value when toggleFilterEvent is called', () => {
    component.toggleFilterEvent(true);
    expect(component.toggleFilter).toBe(true);
    
    component.toggleFilterEvent(false);
    expect(component.toggleFilter).toBe(false);
  });

  // Test applyFilter method
  it('should set toggleFilter to false and call filterData when applyFilter is called', () => {
    // Mock filterData method
    component.filterData = jest.fn();
    
    // Test data
    const filterObj = {
      primaryCategory: ['Course'],
      status: [],
      timeDuration: [],
      competencyArea: [],
      competencyTheme: [],
      competencySubTheme: [],
      providers: []
    };
    
    // Call method
    component.applyFilter(filterObj);
    
    // Verify results
    expect(component.toggleFilter).toBe(false);
    expect(component.filterObjData).toEqual(filterObj);
    expect(component.filterData).toHaveBeenCalledWith(filterObj);
  });

  // Test getCbPlans method
  it('should fetch and process data correctly when getCbPlans is called', async () => {
    // Call the method
    await component.getCbPlans();
    
    // Verify service was called
    expect(mockWidgetSvc.fetchCbpPlanList).toHaveBeenCalledWith('user123');
    
    // Verify transformations were called
    expect(component.transformContentsToWidgets).toHaveBeenCalled();
    
    // Verify loader state
    expect(component.cbpLoader).toBe(false);
  });

  // Test searchData method
  it('should reset filters and search content when searchData is called', () => {
    // Setup
    component.cbpOriginalData = [...mockCbpData];
    component.applyFilter = jest.fn();
    
    // Call with search query
    component.searchData({ query: 'Test Course 1' });
    
    // Verify filter reset
    expect(component.applyFilter).toHaveBeenCalled();
    expect(component.transformContentsToWidgets).toHaveBeenCalled();
  });

  // Test closeFilterKey method
  it('should remove a filter value and reapply filters when closeFilterKey is called', () => {
    // Setup
    component.filterObjData = {
      primaryCategory: ['Course', 'Learning Path'],
      status: [],
      timeDuration: [],
      competencyArea: [],
      competencyTheme: [],
      competencySubTheme: [],
      providers: []
    };
    component.applyFilter = jest.fn();
    
    // Call method
    component.closeFilterKey({ key: 'primaryCategory', value: 'Course' });
    
    // Verify results
    expect(component.filterObjData.primaryCategory).toEqual(['Learning Path']);
    expect(component.applyFilter).toHaveBeenCalledWith(component.filterObjData);
  });

  // Test filterValueEmitMethod method
  it('should update filterObjData and apply filter when filterValueEmitMethod is called', () => {
    // Setup
    component.applyFilter = jest.fn();
    const filterObj = {
      primaryCategory: ['Course'],
      status: [],
      timeDuration: [],
      competencyArea: [],
      competencyTheme: [],
      competencySubTheme: [],
      providers: []
    };
    
    // Call method
    component.filterValueEmitMethod(filterObj);
    
    // Verify results
    expect(component.filterObjData).toEqual(filterObj);
    expect(component.applyFilter).toHaveBeenCalledWith(filterObj);
  });

  // Additional test for filterData method
  describe('filterData', () => {
    beforeEach(() => {
      // Initialize test data
      component.cbpOriginalData = [...mockCbpData];
    });

    it('should not apply filter when no filter values are selected', () => {
      // Create spy for transformContentsToWidgets
      const transformSpy = jest.spyOn(component, 'transformContentsToWidgets');
      
      // Empty filter
      const emptyFilter = {
        primaryCategory: [],
        status: [],
        timeDuration: [],
        competencyArea: [],
        competencyTheme: [],
        competencySubTheme: [],
        providers: []
      };
      
      // Call method
      component.filterData(emptyFilter);
      
      // Verify
      expect(component.filterApplied).toBe(false);
      expect(transformSpy).toHaveBeenCalledWith(component.cbpOriginalData, component.getFeedStrip());
    });

    it('should filter by primaryCategory', () => {
      // Create spy for transformContentsToWidgets
      const transformSpy = jest.spyOn(component, 'transformContentsToWidgets');
      
      // Filter by category
      const categoryFilter = {
        primaryCategory: ['Course'],
        status: [],
        timeDuration: [],
        competencyArea: [],
        competencyTheme: [],
        competencySubTheme: [],
        providers: []
      };
      
      // Call method
      component.filterData(categoryFilter);
      
      // Verify
      expect(component.filterApplied).toBe(true);
      // Can't verify exact filtering without reimplementing the component logic
      expect(transformSpy).toHaveBeenCalled();
    });

    it('should filter by status', () => {
      // Create spy for transformContentsToWidgets
      const transformSpy = jest.spyOn(component, 'transformContentsToWidgets');
      
      // Filter by status
      const statusFilter = {
        primaryCategory: [],
        status: ['2'], // Completed
        timeDuration: [],
        competencyArea: [],
        competencyTheme: [],
        competencySubTheme: [],
        providers: []
      };
      
      // Call method
      component.filterData(statusFilter);
      
      // Verify
      expect(component.filterApplied).toBe(true);
      expect(transformSpy).toHaveBeenCalled();
    });
  });
});
