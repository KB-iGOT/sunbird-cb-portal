import { DiscussHubComponent } from './discuss-hub.component';
import { of, throwError } from 'rxjs';

describe('DiscussHubComponent', () => {
  let component: DiscussHubComponent;

  // Mock services
  const mockHomePageService:any = {
    getTrendingDiscussions: jest.fn(),
    getDiscussionsData: jest.fn(),
  };

  const mockConfigurationsService:any = {
    userProfile: { userName: 'test-user' },
    nodebbUserProfile: { username: 'test-username' },
  };

  const mockDiscussUtilsService:any = {
    setDiscussionConfig: jest.fn(),
  };

  const mockEventService:any = {
    raiseInteractTelemetry: jest.fn(),
  };

  const mockRouter:any = {
    navigate: jest.fn(),
  };

  const mockTranslateService:any = {
    setDefaultLang: jest.fn(),
    use: jest.fn(),
    instant: jest.fn().mockImplementation((key) => key),
  };

  beforeEach(() => {
    // Ensure component is created before setting discussConfig
    component = new DiscussHubComponent(
      mockHomePageService,
      mockConfigurationsService,
      mockDiscussUtilsService,
      mockRouter,
      mockTranslateService,
      mockEventService
    );
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the userData and fetch data in ngOnInit', () => {
    // Arrange
    component.discussConfig = {
      trendingDiscussions: { active: true },
      updatePosts: { active: true },
    };

    const trendingResponse = { topics: [{ timestamp: 12345 }] };
    const updatePostsResponse = { latestPosts: [{ timestamp: 67890, upvotes: 1, downvotes: 0 }] };

    mockHomePageService.getTrendingDiscussions.mockReturnValue(of(trendingResponse));
    mockHomePageService.getDiscussionsData.mockReturnValue(of(updatePostsResponse));

    // Act
    component.ngOnInit();

    // Assert
    expect(component.userData).toEqual(mockConfigurationsService.userProfile);
    expect(mockHomePageService.getTrendingDiscussions).toHaveBeenCalled();
    expect(mockHomePageService.getDiscussionsData).toHaveBeenCalled();
    expect(component.discussion.data).toEqual([{ timestamp: 12345 }]);
    expect(component.updatesPosts.data).toEqual([{ timestamp: 67890, upvotes: 1, downvotes: 0 }]);
  });

  it('should handle errors in fetchTrendingDiscussions', () => {
    // Arrange
    mockHomePageService.getTrendingDiscussions.mockReturnValue(throwError(() => new Error('Error')));
    component.discussConfig = { trendingDiscussions: { active: true } };

    // Act
    component.fetchTrendingDiscussions();

    // Assert
    expect(component.discussion.error).toBe(true);
  });

  it('should handle errors in fetchUpdatesOnPosts', () => {
    // Arrange
    mockHomePageService.getDiscussionsData.mockReturnValue(throwError(() => new Error('Error')));
    component.discussConfig = { updatePosts: { active: true } };

    // Act
    component.fetchUpdatesOnPosts();

    // Assert
    expect(component.updatesPosts.error).toBe(true);
  });

  it('should call translate.instant correctly in translateHub', () => {
    // Arrange
    const hubName = 'testHub';

    // Act
    const result = component.translateHub(hubName);

    // Assert
    expect(mockTranslateService.instant).toHaveBeenCalledWith(hubName);
    expect(result).toBe(hubName);
  });

  it('should navigate and trigger telemetry in navigate method', () => {
    // Arrange
    const expectedTelemetry = {
      type: 'CLICK',
      subType: 'TRENDING_DISCUSSIONS',
      id: 'show-all',
    };
    const expectedRoute = ['/app/discussion-forum'];
    const expectedParams = { queryParams: { page: 'home' }, queryParamsHandling: 'merge' };

    // Act
    component.navigate();

    // Assert
    expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
      expectedTelemetry,
      {},
      { module: 'HOME' }
    );
    expect(mockDiscussUtilsService.setDiscussionConfig).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(expectedRoute, expectedParams);
  });

  it('should set language from localStorage if available', () => {
    // Arrange
    localStorage.setItem('websiteLanguage', 'fr');

    // Act
    component = new DiscussHubComponent(
      mockHomePageService,
      mockConfigurationsService,
      mockDiscussUtilsService,
      mockRouter,
      mockTranslateService,
      mockEventService
    );

    // Assert
    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(mockTranslateService.use).toHaveBeenCalledWith('fr');
  });
});
