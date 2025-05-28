import { DiscussComponent } from './discuss.component';
import { IWsLeader } from '../../model/leadership.model';
import { NsDiscussionForum } from '@sunbird-cb/collection/src/lib/discussion-forum/ws-discussion-forum.model';


describe('DiscussComponent', () => {
  let component: DiscussComponent;

  beforeEach(() => {
    component = new DiscussComponent();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create component with default values', () => {
      expect(component).toBeTruthy();
      expect(component.pageId).toBe('');
      expect(component.leaderProfile).toBeNull();
      expect(component.isDiscussionsDoneByLeader).toBe(false);
      expect(component.discussionFetchStatus).toBe('none');
      expect(component.discussionForumInput).toBeNull();
      expect(component.userId).toBe('');
      expect(component.appName).toBe('');
      expect(component.discussionForumWidget).toBeNull();
    });

    it('should have correct input property decorators', () => {
      // Verify that pageId has default empty string
      expect(component.pageId).toBe('');
      
      // Verify that leaderProfile has default null value
      expect(component.leaderProfile).toBeNull();
    });
  });

  describe('ngOnInit', () => {
    it('should not initialize discussionForumWidget when leaderProfile is null', () => {
      component.leaderProfile = null;
      component.pageId = 'test-page-id';

      component.ngOnInit();

      expect(component.discussionForumWidget).toBeNull();
      expect(component.discussionFetchStatus).toBe('none');
    });

    it('should not initialize discussionForumWidget when leaderProfile is undefined', () => {
      component.leaderProfile = undefined as any;
      component.pageId = 'test-page-id';

      component.ngOnInit();

      expect(component.discussionForumWidget).toBeNull();
      expect(component.discussionFetchStatus).toBe('none');
    });

    it('should initialize discussionForumWidget when leaderProfile exists', () => {
      const mockLeaderProfile: IWsLeader = {
        // Add mock properties based on your IWsLeader interface
        id: 'leader-1',
        name: 'Test Leader'
      } as unknown as IWsLeader;

      component.leaderProfile = mockLeaderProfile;
      component.pageId = 'test-page-id';

      component.ngOnInit();

      expect(component.discussionForumWidget).not.toBeNull();
      expect(component.discussionForumWidget?.widgetData.id).toBe('test-page-id');
      expect(component.discussionForumWidget?.widgetData.title).toBe('');
      expect(component.discussionForumWidget?.widgetData.name).toBe(NsDiscussionForum.EDiscussionType.LEARNING);
      expect(component.discussionForumWidget?.widgetData.initialPostCount).toBe(2);
      expect(component.discussionForumWidget?.widgetSubType).toBe('discussionForum');
      expect(component.discussionForumWidget?.widgetType).toBe('discussionForum');
    });

    it('should set discussionFetchStatus to done when leaderProfile exists', () => {
      const mockLeaderProfile: IWsLeader = {
        id: 'leader-1',
        name: 'Test Leader'
      } as unknown as IWsLeader;

      component.leaderProfile = mockLeaderProfile;
      component.discussionFetchStatus = 'none';

      component.ngOnInit();

      expect(component.discussionFetchStatus).toBe('done');
    });

    it('should use pageId in discussionForumWidget configuration', () => {
      const mockLeaderProfile: IWsLeader = {
        id: 'leader-1',
        name: 'Test Leader'
      } as unknown as IWsLeader;

      component.leaderProfile = mockLeaderProfile;
      component.pageId = 'custom-page-id';

      component.ngOnInit();

      expect(component.discussionForumWidget?.widgetData.id).toBe('custom-page-id');
    });

    it('should handle empty pageId', () => {
      const mockLeaderProfile: IWsLeader = {
        id: 'leader-1',
        name: 'Test Leader'
      } as unknown as IWsLeader;

      component.leaderProfile = mockLeaderProfile;
      component.pageId = '';

      component.ngOnInit();

      expect(component.discussionForumWidget?.widgetData.id).toBe('');
      expect(component.discussionFetchStatus).toBe('done');
    });

    it('should create a new object reference for discussionForumWidget', () => {
      const mockLeaderProfile: IWsLeader = {
        id: 'leader-1',
        name: 'Test Leader'
      } as unknown as IWsLeader;

      component.leaderProfile = mockLeaderProfile;
      component.pageId = 'test-page-id';

      const originalWidget = component.discussionForumWidget;
      
      component.ngOnInit();

      // The widget should be recreated (spread operator creates new reference)
      expect(component.discussionForumWidget).not.toBe(originalWidget);
      expect(component.discussionForumWidget).toBeTruthy();
    });
  });

  describe('Input Properties', () => {
    it('should accept pageId input', () => {
      const testPageId = 'test-page-123';
      component.pageId = testPageId;
      
      expect(component.pageId).toBe(testPageId);
    });

    it('should accept leaderProfile input', () => {
      const mockLeaderProfile: IWsLeader = {
        id: 'leader-1',
        name: 'Test Leader'
      } as unknown as IWsLeader;
      
      component.leaderProfile = mockLeaderProfile;
      
      expect(component.leaderProfile).toBe(mockLeaderProfile);
    });
  });

  describe('Component State', () => {
    it('should maintain correct initial state for all properties', () => {
      expect(component.isDiscussionsDoneByLeader).toBe(false);
      expect(component.discussionFetchStatus).toBe('none');
      expect(component.discussionForumInput).toBeNull();
      expect(component.userId).toBe('');
      expect(component.appName).toBe('');
    });

    it('should not modify unrelated properties during ngOnInit', () => {
      const mockLeaderProfile: IWsLeader = {
        id: 'leader-1',
        name: 'Test Leader'
      } as unknown as IWsLeader;

      component.leaderProfile = mockLeaderProfile;
      component.pageId = 'test-page-id';
      
      // Set some values to verify they don't change
      component.isDiscussionsDoneByLeader = false;
      component.userId = 'original-user-id';
      component.appName = 'original-app-name';

      component.ngOnInit();

      expect(component.isDiscussionsDoneByLeader).toBe(false);
      expect(component.userId).toBe('original-user-id');
      expect(component.appName).toBe('original-app-name');
    });
  });

  describe('Widget Configuration', () => {
    it('should set correct widget configuration properties', () => {
      const mockLeaderProfile: IWsLeader = {
        id: 'leader-1',
        name: 'Test Leader'
      } as unknown as IWsLeader;

      component.leaderProfile = mockLeaderProfile;
      component.pageId = 'test-page-id';

      component.ngOnInit();

      const widget = component.discussionForumWidget;
      
      expect(widget?.widgetSubType).toBe('discussionForum');
      expect(widget?.widgetType).toBe('discussionForum');
      expect(widget?.widgetData).toBeDefined();
      expect(widget?.widgetData.initialPostCount).toBe(2);
      expect(widget?.widgetData.title).toBe('');
    });
  });
});