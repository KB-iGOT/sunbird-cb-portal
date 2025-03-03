import { CbpPlanComponent } from './cbp-plan.component';
import { of } from 'rxjs';

describe('CbpPlanComponent', () => {
  let component: CbpPlanComponent;
  let mockActivatedRoute: any;
  let mockWidgetSvc: any;
  let mockTranslate: any;
  let mockConfigSvc: any;
  let mockLangtranslations: any;

  beforeEach(() => {
    // Mock dependencies
    mockActivatedRoute = {
      snapshot: {
        data: {
          pageData: {
            data: {
              cbpConfig: {},
              cbpUpcomingStrips: {
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
                customeClass: 'feed-class',
                viewMoreUrl: {
                  stripConfig: {
                    cardSubType: 'card-feed'
                  },
                  loaderConfig: {
                    cardSubType: 'card-portrait-skeleton'
                  }
                }
              },
              cbpFeedMobileStrip: {
                customeClass: 'feed-mobile-class',
                viewMoreUrl: {
                  stripConfig: {
                    cardSubType: 'card-feed-mobile'
                  },
                  loaderConfig: {
                    cardSubType: 'card-portrait-skeleton'
                  }
                }
              }
            }
          }
        }
      }
    };

    mockWidgetSvc = {
      fetchCbpPlanList: jest.fn()
    };

    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    };

    mockConfigSvc = {
      userProfile: {
        userId: 'test-user-id'
      }
    };

    mockLangtranslations = {
      languageSelectedObservable: {
        subscribe: jest.fn(cb => {
          cb();
          return { unsubscribe: jest.fn() };
        })
      }
    };

    // Create component with mocked dependencies
    component = new CbpPlanComponent(
      mockActivatedRoute,
      mockWidgetSvc,
      mockTranslate,
      mockConfigSvc,
      mockLangtranslations
    );

    // Spy on private methods
    jest.spyOn(component as any, 'transformContentsToWidgets');
    jest.spyOn(component as any, 'transformSkeletonToWidgets');
    jest.spyOn(component as any, 'getFeedStrip');
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize language settings in constructor', () => {
    // Setup
    const storageSpy = jest.spyOn(localStorage, 'getItem').mockReturnValue('en');
    
    // Verify
    expect(mockLangtranslations.languageSelectedObservable.subscribe).toHaveBeenCalled();
    expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en');
    expect(mockTranslate.use).toHaveBeenCalledWith('en');
    
    // Cleanup
    storageSpy.mockRestore();
  });

  it('should initialize component data on ngOnInit', () => {
    // Setup
    jest.spyOn(component as any, 'getFeedStrip').mockReturnValue({
      customeClass: 'test-feed',
      viewMoreUrl: {
        stripConfig: { cardSubType: 'test-card' },
        loaderConfig: { cardSubType: 'test-loader' }
      }
    });

    // Act
    component.ngOnInit();

    // Assert
    expect(component.cbpConfig).toBeDefined();
    expect(component.cbpAllConfig).toBeDefined();
    expect(component.upcommingList).toBeDefined();
    expect(component.overDueList).toBeDefined();
    expect(component.contentFeedList).toBeDefined();
    expect(component['transformSkeletonToWidgets']).toHaveBeenCalled();
    expect(component['getFeedStrip']).toHaveBeenCalled();
  });

  it('should fetch CBP plans and process them', async () => {
    // Setup
    const mockCbpData = [
      {
        name: 'Plan 1',
        planDuration: 'overdue',
        endDate: '2023-01-01',
        contentStatus: 1,
        primaryCategory: 'Course',
        competencyArea: ['Area1'],
        competencyTheme: ['Theme1'],
        competencySubTheme: ['SubTheme1'],
        organisation: ['Org1']
      },
      {
        name: 'Plan 2',
        planDuration: 'upcoming',
        endDate: '2025-01-01',
        contentStatus: 2,
        primaryCategory: 'Course',
        competencyArea: ['Area2'],
        competencyTheme: ['Theme2'],
        competencySubTheme: ['SubTheme2'],
        organisation: ['Org2']
      }
    ];

    mockWidgetSvc.fetchCbpPlanList.mockReturnValue(of(mockCbpData));

    jest.spyOn(component as any, 'transformContentsToWidgets').mockReturnValue([]);
    
    // Act
    await component.getCbPlans();

    // Assert
    expect(mockWidgetSvc.fetchCbpPlanList).toHaveBeenCalledWith('test-user-id');
    expect(component.cbpOriginalData).toEqual(mockCbpData);
    expect(component.cbpLoader).toBe(false);
    expect(component.overDueList.length).toBe(1);
    expect(component.upcommingList.length).toBe(1);
    expect(component.completedList.length).toBe(1);
    expect(component.usersCbpCount).toBeDefined();
  });

  it('should handle empty response from fetchCbpPlanList', async () => {
    // Setup
    mockWidgetSvc.fetchCbpPlanList.mockReturnValue(of([]));
    
    // Act
    await component.getCbPlans();
    
    // Assert
    expect(component.upcommingList).toEqual([]);
    expect(component.overDueList).toEqual([]);
    expect(component.contentFeedList).toEqual([]);
    expect(component.completedList).toEqual([]);
    expect(component.cbpLoader).toBe(false);
  });

  it('should toggle filter', () => {
    // Setup
    component.toggleFilter = false;
    
    // Act
    component.toggleFilterEvent(true);
    
    // Assert
    expect(component.toggleFilter).toBe(true);
  });

  it('should apply filter', () => {
    // Setup
    const filterObj = {
      primaryCategory: ['Course'],
      status: [],
      timeDuration: [],
      competencyArea: [],
      competencyTheme: [],
      competencySubTheme: [],
      providers: []
    };
    jest.spyOn(component, 'filterData');
    component.toggleFilter = true;
    
    // Act
    component.applyFilter(filterObj);
    
    // Assert
    expect(component.toggleFilter).toBe(false);
    expect(component.filterObjData).toEqual(filterObj);
    expect(component.filterData).toHaveBeenCalledWith(filterObj);
  });

  it('should clear filter', () => {
    // Setup
    const emptyFilterObj = {
      primaryCategory: [],
      status: [],
      timeDuration: [],
      competencyArea: [],
      competencyTheme: [],
      competencySubTheme: [],
      providers: []
    };
    jest.spyOn(component, 'filterData');
    
    // Act
    component.clearFilterObj(emptyFilterObj);
    
    // Assert
    expect(component.filterObjData).toEqual(emptyFilterObj);
    expect(component.filterData).toHaveBeenCalledWith(emptyFilterObj);
  });

  it('should filter data by primary category', () => {
    // Setup
    component.cbpOriginalData = [
      { primaryCategory: 'Course', name: 'Course 1' },
      { primaryCategory: 'Resource', name: 'Resource 1' }
    ];
    
    const filterObj = {
      primaryCategory: ['Course'],
      status: [],
      timeDuration: [],
      competencyArea: [],
      competencyTheme: [],
      competencySubTheme: [],
      providers: []
    };
    
    jest.spyOn(component as any, 'transformContentsToWidgets').mockReturnValue([]);
    
    // Act
    component.filterData(filterObj);
    
    // Assert
    expect(component.filterApplied).toBe(true);
    expect(component.contentFeedListCopy.length).toBe(1);
    expect(component.contentFeedListCopy[0].primaryCategory).toBe('Course');
  });

  it('should filter data by status', () => {
    // Setup
    component.cbpOriginalData = [
      { contentStatus: 1, name: 'Item 1' },
      { contentStatus: 2, name: 'Item 2' }
    ];
    
    const filterObj = {
      primaryCategory: [],
      status: ['1'],
      timeDuration: [],
      competencyArea: [],
      competencyTheme: [],
      competencySubTheme: [],
      providers: []
    };
    
    jest.spyOn(component as any, 'transformContentsToWidgets').mockReturnValue([]);
    
    // Act
    component.filterData(filterObj);
    
    // Assert
    expect(component.filterApplied).toBe(true);
    expect(component.contentFeedListCopy.length).toBe(1);
    expect(component.contentFeedListCopy[0].contentStatus).toBe(1);
  });

  it('should search data by name', () => {
    // Setup
    component.cbpOriginalData = [
      { name: 'Testing Course', primaryCategory: 'Course' },
      { name: 'Development Course', primaryCategory: 'Course' }
    ];
    
    const searchEvent = { query: 'test' };
    jest.spyOn(component as any, 'transformContentsToWidgets').mockReturnValue([]);
    jest.spyOn(component, 'applyFilter');
    
    // Act
    component.searchData(searchEvent);
    
    // Assert
    expect(component.applyFilter).toHaveBeenCalled();
    expect(component['transformContentsToWidgets']).toHaveBeenCalled();
  });

  it('should remove a filter value', () => {
    // Setup
    component.filterObjData = {
      primaryCategory: ['Course', 'Resource'],
      status: [],
      timeDuration: [],
      competencyArea: [],
      competencyTheme: [],
      competencySubTheme: [],
      providers: []
    };
    
    jest.spyOn(component, 'applyFilter');
    
    // Act
    component.closeFilterKey({ key: 'primaryCategory', value: 'Course' });
    
    // Assert
    expect(component.filterObjData.primaryCategory).toEqual(['Resource']);
    expect(component.applyFilter).toHaveBeenCalled();
  });

  it('should handle filter value emit', () => {
    // Setup
    const newFilterObj = {
      primaryCategory: ['Course'],
      status: ['1'],
      timeDuration: [],
      competencyArea: [],
      competencyTheme: [],
      competencySubTheme: [],
      providers: []
    };
    
    jest.spyOn(component, 'applyFilter');
    
    // Act
    component.filterValueEmitMethod(newFilterObj);
    
    // Assert
    expect(component.filterObjData).toEqual(newFilterObj);
    expect(component.applyFilter).toHaveBeenCalledWith(newFilterObj);
  });

  it('should transform contents to widgets', () => {
    // This tests a private method directly
    const mockContents = [
      { 
        name: 'Test Content',
        batch: { id: '123' }, 
        primaryCategory: 'Course'
      }
    ];
    
    const mockStrip = {
      key: 'test-strip',
      customeClass: 'test-class',
      viewMoreUrl: {
        stripConfig: {
          cardSubType: 'card-test',
          intranetMode: true,
          deletedMode: false,
          contentTags: ['tag1']
        }
      }
    };
    
    // Act
    const result = (component as any).transformContentsToWidgets(mockContents, mockStrip);
    
    // Assert
    expect(result.length).toBe(1);
    expect(result[0].widgetType).toBe('card');
    expect(result[0].widgetSubType).toBe('cardContent');
    expect(result[0].widgetData.content).toBe(mockContents[0]);
    expect(result[0].widgetData.batch).toBeDefined();
    expect(result[0].widgetData.cardSubType).toBe('card-test');
    expect(result[0].widgetData.cardCustomeClass).toBe('test-class');
  });

  it('should transform skeleton to widgets', () => {
    // This tests a private method directly
    const mockStrip = {
      customeClass: 'skeleton-class',
      viewMoreUrl: {
        loaderConfig: {
          cardSubType: 'card-skeleton'
        }
      }
    };
    
    // Act
    const result = (component as any).transformSkeletonToWidgets(mockStrip);
    
    // Assert
    expect(result.length).toBe(11); // [1, 2, 3, 4, 5, 6, 7, 7, 8, 9, 10]
    expect(result[0].widgetType).toBe('card');
    expect(result[0].widgetSubType).toBe('cardContent');
    expect(result[0].cardCustomeClass).toBe('skeleton-class');
    expect(result[0].widgetData.cardSubType).toBe('card-skeleton');
  });

  it('should get the appropriate feed strip based on screen width', () => {
    // Setup
    Object.defineProperty(window.screen, 'width', { value: 1024 });
    component.cbpAllConfig = {
      cbpFeedStrip: { key: 'desktop' },
      cbpFeedMobileStrip: { key: 'mobile' }
    };
    
    // Act
    const result = component.getFeedStrip();
    
    // Assert
    expect(result).toEqual({ key: 'desktop' });
    
    // Change to mobile width
    Object.defineProperty(window.screen, 'width', { value: 480 });
    
    // Act again
    const mobileResult = component.getFeedStrip();
    
    // Assert
    expect(mobileResult).toEqual({ key: 'mobile' });
  });
});
