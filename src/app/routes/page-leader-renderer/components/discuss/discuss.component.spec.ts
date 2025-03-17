import { DiscussComponent } from './discuss.component';
import { IWsLeader } from '../../model/leadership.model';

// Mock the dependencies
jest.mock('@sunbird-cb/collection', () => ({
  NsDiscussionForum: {
    EDiscussionType: {
      LEARNING: 'LEARNING'
    }
  }
}));

describe('DiscussComponent', () => {
  let component: DiscussComponent;

  beforeEach(() => {
    // Create a fresh instance for each test
    component = new DiscussComponent();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.pageId).toBe('');
    expect(component.leaderProfile).toBeNull();
    expect(component.isDiscussionsDoneByLeader).toBeFalsy();
    expect(component.discussionFetchStatus).toBe('none');
    expect(component.discussionForumInput).toBeNull();
    expect(component.userId).toBe('');
    expect(component.appName).toBe('');
    expect(component.discussionForumWidget).toBeNull();
  });

  describe('ngOnInit', () => {
    it('should not initialize discussionForumWidget when leaderProfile is null', () => {
      // Set up initial state
      component.pageId = 'test-page';
      component.leaderProfile = null;

      // Call the method
      component.ngOnInit();

      // Check the expected outcome
      expect(component.discussionForumWidget).toBeNull();
      expect(component.discussionFetchStatus).toBe('none');
    });

    it('should initialize discussionForumWidget when leaderProfile is provided', () => {
      // Set up test data
      const mockLeaderProfile: IWsLeader = {
        name: 'Test Leader',
        designation: '',
        emailId: '',
        link: '',
        profileImage: '',
        role: ''
      };
      
      // Set initial state
      component.pageId = 'test-page';
      component.leaderProfile = mockLeaderProfile;

      // Call the method
      component.ngOnInit();

      // Verify expected outcomes
      expect(component.discussionFetchStatus).toBe('done');
      expect(component.discussionForumWidget).toEqual({
        widgetData: {
          id: 'test-page',
          title: '',
          name: 'LEARNING',
          initialPostCount: 2,
        },
        widgetSubType: 'discussionForum',
        widgetType: 'discussionForum',
      });
    });
  });
});