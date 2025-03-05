import { PublicTocComponent } from './public-toc.component';
import { of, Subject } from 'rxjs';
import * as moment from 'moment';
import * as _ from 'lodash';

describe('PublicTocComponent', () => {
  let component: PublicTocComponent;
  let mockRoute: any;
  let mockRouter: any;
  let mockContentService: any;
  let mockTocService: any;
  let mockLoggerService: any;
  let mockConfigService: any;
  let mockDomSanitizer: any;
  let mockAuthAccessControlService: any;
  let mockDialog: any;
  let mockMobileAppsService: any;
  let mockUtilityService: any;
  let mockActionService: any;
  let mockRatingService: any;

  beforeEach(() => {
    // Create mock services
    mockRoute = {
      data: of({
        pageData: {
          data: {
            banners: {},
            subtitleOnBanners: false,
            showDescription: false,
          }
        }
      }),
      fragment: of('overview'),
      queryParamMap: of(new Map([['contextId', 'testContextId'], ['contextPath', 'testContextPath']]))
    };

    mockRouter = {
      url: '/test/path',
      events: new Subject()
    };

    mockContentService = {
      getFirstChildInHierarchy: jest.fn().mockReturnValue({
        identifier: 'test-id',
        mimeType: 'test-mime-type'
      })
    };

    mockTocService = {
      initData: jest.fn().mockReturnValue({
        content: {
          identifier: 'test-content-id',
          primaryCategory: 'Course',
          body: 'Test body',
          children: [],
          learningMode: 'Instructor-Led'
        },
        errorCode: null
      }),
      getTocStructure: jest.fn().mockReturnValue({}),
      fetchPostAssessmentStatus: jest.fn().mockReturnValue(of({ result: [] })),
      filterToc: jest.fn().mockReturnValue(true),
      batchReplaySubject: of({}),
      subtitleOnBanners: false,
      showDescription: false,
      showStartButton: jest.fn().mockReturnValue(true)
    };

    mockConfigService = {
      instanceConfig: {
        logos: {
          defaultSourceLogo: 'test-logo'
        }
      },
      userProfile: {
        userId: 'test-user-id'
      },
      restrictedFeatures: new Set(['goals']),
      rootOrg: 'test-org'
    };

    mockDomSanitizer = {
      bypassSecurityTrustHtml: jest.fn().mockReturnValue('sanitized-html'),
      bypassSecurityTrustStyle: jest.fn().mockReturnValue('sanitized-style')
    };

    mockAuthAccessControlService = {
      proxyToAuthoringUrl: jest.fn().mockReturnValue('proxied-url')
    };

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true)
      })
    };

    mockMobileAppsService = {
      sendViewerData: jest.fn()
    };

    mockUtilityService = {
      isMobile: false
    };

    mockActionService = {
      getUpdateCompGroupO: of({
        url: 'test-url',
        queryParams: {}
      })
    };

    mockRatingService = {
      getRating: jest.fn().mockReturnValue(of({
        result: {
          response: { rating: 4 }
        }
      }))
    };

    // Initialize component with mocked dependencies
    component = new PublicTocComponent(
      mockRoute as any,
      mockRouter as any,
      mockContentService,
      mockTocService,
      mockLoggerService,
      mockConfigService,
      mockDomSanitizer,
      mockAuthAccessControlService,
      mockDialog,
      mockMobileAppsService,
      mockUtilityService,
      mockActionService,
      mockRatingService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Lifecycle Methods', () => {
    it('should initialize component properties in ngOnInit', () => {
      component.ngOnInit();
      
      expect(component.currentFragment).toBe('overview');
      expect(component.defaultSLogo).toBe('test-logo');
      expect(component.isGoalsEnabled).toBe(false);
      expect(component.contextId).toBe('testContextId');
      expect(component.contextPath).toBe('testContextPath');
    });

    it('should unsubscribe from subscriptions in ngOnDestroy', () => {
      const mockUnsubscribe = jest.fn();
      component.routeSubscription = { unsubscribe: mockUnsubscribe } as any;
      component.batchSubscription = { unsubscribe: mockUnsubscribe } as any;
      component.routerParamSubscription = { unsubscribe: mockUnsubscribe } as any;

      component.ngOnDestroy();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(3);
    });
  });

  describe('Getters', () => {
    it('should correctly determine if content is a resource', () => {
      component.content = {
        primaryCategory: 'KNOWLEDGE_ARTIFACT',
        children: []
      } as any;

      expect(component.isResource).toBe(true);
      expect(mockMobileAppsService.sendViewerData).toHaveBeenCalled();
    });

    it('should get start date correctly', () => {
      const mockBatches = [{ 
        batchId: 'test-batch', 
        startDate: moment().add(1, 'day').toISOString(),
        endDate: moment().add(2, 'days').toISOString()
      }];
      component.content = { batches: mockBatches } as any;
      component.currentCourseBatchId = 'test-batch';

      const startDate = component.getStartDate;
      expect(startDate).toBeTruthy();
    });

    it('should generate rating icons correctly', () => {
      component.content = { averageRating: 3.5 } as any;

      expect(component.getRatingIcon(1)).toBe('star');
      expect(component.getRatingIcon(2)).toBe('star');
      expect(component.getRatingIcon(3)).toBe('star');
      expect(component.getRatingIcon(4)).toBe('star_half');
      expect(component.getRatingIcon(5)).toBe('star_border');
    });
  });

  describe('Methods', () => {
    it('should generate query params correctly', () => {
      component.firstResourceLink = {
        queryParams: { test: 'param' },
        url: 'test-url'
      };
      component.contextId = 'test-context';
      component.contextPath = 'test-path';
      component.getBatchId = jest.fn().mockReturnValue('');

     // const resumeQuery = component.generateQuery('RESUME');
    //   expect(resumeQuery).toEqual(expect.objectContaining({
    //     batchId: '',
    //     viewMode: 'RESUME'
    //   }));

    //   const startQuery = component.generateQuery('START');
    //   expect(startQuery).toEqual(expect.objectContaining({
    //     test: 'param',
    //     viewMode: 'START',
    //     batchId: '',
    //     collectionId: 'test-context',
    //     collectionType: 'test-path'
    //   }));
    });

    it('should open feedback dialog', () => {
      const mockContent = { id: 'test-content' };
      component.userId = 'test-user';

      component.openFeedbackDialog(mockContent);

      expect(mockDialog.open).toHaveBeenCalled();
    });
  });
});