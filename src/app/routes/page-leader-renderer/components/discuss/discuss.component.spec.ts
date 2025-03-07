import { DiscussComponent } from './discuss.component';
import { IWsLeader } from '../../model/leadership.model';
import { NsDiscussionForum } from '@sunbird-cb/collection';

describe('DiscussComponent', () => {
  let component: DiscussComponent;

  beforeEach(() => {
    component = new DiscussComponent();
  });

  it('should create DiscussComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should set discussionForumWidget and discussionFetchStatus when leaderProfile is provided', () => {
    // Mock leader profile
    const mockLeaderProfile: IWsLeader = { 
        designation: '',
        disabled: false,
        emailId: '',
        link: '',
        name: '',
        profileImage: '',
        role: ''
    };

    // Assign the input properties
    component.pageId = 'page-1';
    component.leaderProfile = mockLeaderProfile;

    // Call ngOnInit manually to simulate component initialization
    component.ngOnInit();

    // Check if the discussionForumWidget is set properly
    expect(component.discussionForumWidget).toEqual({
      widgetData: {
        id: 'page-1',
        title: '',
        name: NsDiscussionForum.EDiscussionType.LEARNING,
        initialPostCount: 2,
      },
      widgetSubType: 'discussionForum',
      widgetType: 'discussionForum',
    });

    // Check if the discussionFetchStatus is set to 'done'
    expect(component.discussionFetchStatus).toBe('done');
  });

  it('should not set discussionForumWidget and discussionFetchStatus if leaderProfile is not provided', () => {
    component.pageId = 'page-1';
    component.leaderProfile = null; // No leader profile

    component.ngOnInit();

    // The discussionForumWidget should remain null
    expect(component.discussionForumWidget).toBeNull();

    // The discussionFetchStatus should remain 'none'
    expect(component.discussionFetchStatus).toBe('none');
  });

  it('should initialize with default values', () => {
    expect(component.pageId).toBe('');
    expect(component.leaderProfile).toBeNull();
    expect(component.isDiscussionsDoneByLeader).toBe(false);
    expect(component.discussionFetchStatus).toBe('none');
    expect(component.discussionForumInput).toBeNull();
    expect(component.userId).toBe('');
    expect(component.appName).toBe('');
    expect(component.discussionForumWidget).toBeNull();
  });

  // Additional test case for user-specific functionality, if any, can be added here
});
