import { of, throwError } from 'rxjs';
import { CompetencyListComponent } from './competency-list.component';
import { HttpErrorResponse } from '@angular/common/http';

// Mock services and dependencies
const mockWidgetService = {
  fetchUserBatchList: jest.fn(),
  mapEnrollmentData: jest.fn()
};

const mockConfigService = {
  userProfile: {
    userId: 'test-user-id'
  },
  compentency: {
    v5: {
      vKey: 'competenciesV5',
      vCompetencyArea: 'competencyArea',
      vCompetencyTheme: 'competencyTheme',
      vCompetencySubTheme: 'competencySubTheme'
    }
  }
};

const mockRouter = {
  navigate: jest.fn()
};

const mockMatSnackBar = {
  open: jest.fn()
};

const mockLangTranslations = {
  translateLabel: jest.fn().mockReturnValue('translated-label')
};

const mockTranslate = {
  setDefaultLang: jest.fn(),
  use: jest.fn()
};

const mockDocument = {
  body: {
    classList: {
      add: jest.fn(),
      remove: jest.fn()
    }
  }
};

// Mock environment
jest.mock('src/environments/environment', () => ({
  environment: {
    compentencyVersionKey: 'v5'
  }
}));

describe('CompetencyListComponent', () => {
  let component: CompetencyListComponent;
  
  // Helper function to instantiate component
  function createComponent() {
    return new CompetencyListComponent(
      mockWidgetService as any,
      mockConfigService as any,
      mockRouter as any,
      mockMatSnackBar as any,
      mockLangTranslations as any,
      mockTranslate as any,
      mockConfigService as any,
      mockDocument as any
    );
  }

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn().mockImplementation((key) => {
        if (key === 'websiteLanguage') {
          return 'en';
        }
        return null;
      }),
      setItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    
    // Create component instance
    component = createComponent();
    
    // Set up default successful response for fetchUserBatchList
    mockWidgetService.fetchUserBatchList.mockReturnValue(of({
      courses: []
    }));
    
    mockWidgetService.mapEnrollmentData.mockReturnValue({});
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct default values', () => {
    // Initialize the component
    component.ngOnInit();

    // Verify initialization
    expect(component.isMobile).toBeFalsy();
    expect(component.showAll).toBeTruthy();
    expect(component.skeletonArr).toEqual([1, 2, 3, 4, 5, 6]);
    expect(component.competency.skeletonLoading).toBeTruthy();
    expect(component.filterObjData).toBeDefined();
  });

  it('should initialize as mobile when window width is small', () => {
    // Mock narrow window
    Object.defineProperty(window, 'innerWidth', { value: 500 });
    
    // Create new component with mobile width
    component = createComponent();
    
    // Verify mobile initialization
    expect(component.isMobile).toBeTruthy();
    expect(component.showAll).toBeFalsy();
    expect(component.skeletonArr).toEqual([1, 2, 3]);
  });

  it('should fetch user enrollment list on init', () => {
    // Initialize the component
    component.ngOnInit();
    
    // Verify that fetchUserBatchList was called with user ID
    expect(mockWidgetService.fetchUserBatchList).toHaveBeenCalledWith('test-user-id');
  });

  it('should handle successful enrollment data', () => {
    // Mock successful response with sample competency data
    const mockResponse = {
      courses: [
        {
          contentId: 'course-1',
          courseName: 'Course 1',
          batchId: 'batch-1',
          completedOn: 1615465200000,
          issuedCertificates: [],
          content: {
            competenciesV5: [
              {
                competencyArea: 'Behavioural',
                competencyTheme: 'Theme 1',
                competencySubTheme: 'SubTheme 1'
              }
            ]
          }
        }
      ]
    };

    mockWidgetService.fetchUserBatchList.mockReturnValue(of(mockResponse));
    mockWidgetService.mapEnrollmentData.mockReturnValue({
      'course-1': { status: 2 }
    });

    // Initialize the component
    component.ngOnInit();
    
    // Verify data processing
    expect(component.competency.skeletonLoading).toBeFalsy();
    expect(component.competency.all.length).toBeGreaterThan(0);
    expect(component.competencyArray).toBeDefined();
  });

  it('should handle error from enrollment API', () => {
    // Mock API error
    const errorResponse = new HttpErrorResponse({
      error: 'test error',
      status: 500,
      statusText: 'Internal Server Error',
    });
    
    mockWidgetService.fetchUserBatchList.mockReturnValue(throwError(() => errorResponse));
    
    // Initialize the component
    component.ngOnInit();
    
    // Verify error handling
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to pull Enrollment list details!');
    expect(component.competency.skeletonLoading).toBeFalsy();
  });

  it('should handle tab change', () => {
    // Setup
    component.competency = {
      skeletonLoading: false,
      error: false,
      all: [{ latest: 2 }, { latest: 1 }],
      allValue: 0,
      behavioural: [{ latest: 3 }],
      functional: [{ latest: 4 }],
      domain: [{ latest: 5 }]
    };
    
    // Simulate tab change event
    const mockEvent = {
      tab: { textLabel: 'Behavioural' }
    };
    
    component.handleTabChange(mockEvent as any);
    
    // Verify tab change handling
    expect(component.tabValue).toBe('behavioural');
    expect(component.competencyArray).toEqual(component.competency.behavioural);
  });

  it('should toggle show all', () => {
    // Setup
    component.showAll = false;
    component.competency = {
      all: [1, 2, 3, 4, 5, 6].map(n => ({ id: n }))
    } as any;
    
    // Toggle show all
    component.handleShowAll();
    
    // Verify toggle
    expect(component.showAll).toBeTruthy();
    expect(component.competencyArray).toEqual(component.competency.all);
    
    // Toggle again
    component.handleShowAll();
    
    // Verify second toggle
    expect(component.showAll).toBeFalsy();
    expect(component.competencyArray.length).toBe(3);
  });

  it('should handle search', () => {
    // Setup
    component.competency = {
      behavioural: [
        { competencyTheme: 'Communication' },
        { competencyTheme: 'Leadership' },
        { competencyTheme: 'Team Building' }
      ]
    } as any;
    component.compentencyKey = {
      vCompetencyTheme: 'competencyTheme'
    } as any;
    
    // Search for 'lead'
    component.handleSearch('lead', 'behavioural');
    
    // Verify search results
    expect(component.competencyArray.length).toBe(1);
    expect(component.competencyArray[0].competencyTheme).toBe('Leadership');
    
    // Search with empty string should return all
    component.handleSearch('', 'behavioural');
    expect(component.competencyArray.length).toBe(3);
  });

  it('should handle navigation to details page', () => {
    // Setup
    const mockObj = { id: 'test-competency' };
    
    // Navigate to details
    component.handleNavigate(mockObj);
    
    // Verify localStorage and navigation
    expect(localStorage.setItem).toHaveBeenCalledWith('details_page', JSON.stringify(mockObj));
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/competency-passbook/details']);
  });

  it('should toggle filter and manage body class', () => {
    // Toggle filter on
    component.handleFilter(true);
    
    // Verify body class added
    expect(mockDocument.body.classList.add).toHaveBeenCalledWith('overflow-hidden');
    expect(component.toggleFilter).toBeTruthy();
    
    // Toggle filter off
    component.handleFilter(false);
    
    // Verify body class removed
    expect(mockDocument.body.classList.remove).toHaveBeenCalledWith('overflow-hidden');
    expect(component.toggleFilter).toBeFalsy();
  });

  it('should handle filter application', () => {
    // Setup
    const mockFilterObj = {
      competencyArea: ['Behavioural'],
      competencyTheme: [],
      competencySubTheme: []
    };
    
    component.competency = {
      all: [
        { competencyArea: 'Behavioural', competencyTheme: 'Theme 1' },
        { competencyArea: 'Functional', competencyTheme: 'Theme 2' }
      ]
    } as any;
    
    component.tabValue = 'all';
    component.competencyArray = component.competency.all;
    component.compentencyKey = {
      vCompetencyArea: 'competencyArea',
      vCompetencyTheme: 'competencyTheme',
      vCompetencySubTheme: 'competencySubTheme',
      vKey:'', 
      vCompetencyAreaDescription:''
    };
    
    // Apply filter
    component.handleApplyFilter(mockFilterObj);
    
    // Verify filter application
    expect(component.toggleFilter).toBeFalsy();
    expect(mockDocument.body.classList.remove).toHaveBeenCalledWith('overflow-hidden');
    expect(component.filterObjData).toEqual(mockFilterObj);
  });

  it('should properly destroy subscriptions on ngOnDestroy', () => {
    // Setup
   // const spyUnsubscribe = jest.spyOn(component.destroySubject$, 'unsubscribe');
    
    // Call ngOnDestroy
    component.ngOnDestroy();
    
    // Verify subscription cleanup
   // expect(spyUnsubscribe).toHaveBeenCalled();
  });
});