import { of, throwError } from 'rxjs';
import { LandingComponent } from './landing.component';
import { LeadershipService } from '../../services/leadership.service';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { Router,  convertToParamMap } from '@angular/router';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let mockLeadershipService: jest.Mocked<LeadershipService>;
  let mockConfigService: jest.Mocked<ConfigurationsService>;
  let mockRouter: jest.Mocked<Router>;
  let mockDialog: any;
  let mockSnackBar: any;
  let mockActivatedRoute: any;
  let mockElementRef: any;

  beforeEach(() => {
    // Create mock services
    mockLeadershipService = {
      emailToUserId: jest.fn(),
      fetchUserFollow: jest.fn(),
      followUser: jest.fn(),
      unFollowUser: jest.fn(),
    } as unknown as jest.Mocked<LeadershipService>;

    mockConfigService = {
      userProfile: {
        userId: 'test-user-id'
      }
    } as unknown as jest.Mocked<ConfigurationsService>;

    mockRouter = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    mockDialog = {
      open: jest.fn()
    };

    mockSnackBar = {
      open: jest.fn()
    };

    mockElementRef = {
      nativeElement: {
        value: 'mock-value'
      }
    };

    // Setup mock ActivatedRoute
    mockActivatedRoute = {
      data: of({ 
        leaderData: { 
          data: {
            tabs: [{ title: 'Tab1' }, { title: 'Tab2' }],
            profile: { 
              emailId: 'leader@example.com',
              name: 'Leader Name'
            },
            mailMeta: {
              placeholder: 'Email placeholder',
              emailTo: 'leader@example.com',
              name: 'Leader Name',
              subject: 'Email Subject'
            }
          }
        }
      }),
      paramMap: of(convertToParamMap({ name: 'leader-name' })),
      queryParamMap: of(convertToParamMap({ tab: 'Tab2' }))
    };

    // Instantiate component with mocks
    component = new LandingComponent(
      mockActivatedRoute,
      mockRouter,
      mockDialog,
      mockSnackBar,
      mockLeadershipService,
      mockConfigService
    );

    // Mock ViewChild elements
    component.followed = mockElementRef;
    component.unfollowed = mockElementRef;
    component.followUnfollowError = mockElementRef;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component and call init method', () => {
      const initSpy = jest.spyOn(component, 'init');
      component.ngOnInit();
      expect(initSpy).toHaveBeenCalled();
    });
  });

  describe('init', () => {
    it('should initialize component with leader data', () => {
      const leaderData = { 
        data: {
          tabs: [{ title: 'Tab1' }, { title: 'Tab2' }],
          profile: { 
            emailId: 'leader@example.com',
            name: 'Leader Name'
          },
          mailMeta: {
            placeholder: 'Email placeholder',
            emailTo: 'leader@example.com',
            name: 'Leader Name',
            subject: 'Email Subject'
          }
        }
      };
      
      jest.spyOn(component, 'fetchUserId');
    //   jest.spyOn(component, 'fetchLoggedUserFollowers');

    //   component.init({ leaderData });

      expect(component.leaderData).toEqual(leaderData.data);
      expect(component.tabs).toEqual(['Tab1', 'Tab2']);
      expect(component.leaderName).toBe('leader-name');
      expect(component.currentIndex).toBe(1); // since 'Tab2' is at index 1
      expect(component.fetchUserId).toHaveBeenCalled();
    //   expect(component.fetchLoggedUserFollowers).toHaveBeenCalled();
    });

    it('should handle error when fetching leader data', () => {
    //   const leaderData = { error: 'Error fetching data' };
      
    //   component.init({ leaderData });

      expect(component.errorFetchingJson).toBe(true);
    });
  });

  describe('fetchUserId', () => {
    it('should fetch user ID successfully', () => {
    //   mockLeadershipService.emailToUserId.mockReturnValue(of({ userId: 'leader-uuid' }));

      component.fetchUserId();

      expect(mockLeadershipService.emailToUserId).toHaveBeenCalledWith('leader@example.com');
      expect(component.leaderUuid).toBe('leader-uuid');
      expect(component.isFollowDisabled).toBe(false);
    });

    it('should handle error when fetching user ID', () => {
      mockLeadershipService.emailToUserId.mockReturnValue(throwError('Error'));

      component.fetchUserId();

      expect(component.isFollowDisabled).toBe(true);
    });
  });

  describe('onIndexChange', () => {
    it('should navigate with correct query params', () => {
      component.tabs = ['Tab1', 'Tab2', 'Tab3'];
      
      component.onIndexChange(2);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([], { queryParams: { tab: 'Tab3' } });
    });
  });

  describe('openSendMailDialog', () => {
    it('should open send mail dialog with correct data', () => {
      component.openSendMailDialog();
      
      expect(mockDialog.open).toHaveBeenCalledWith(expect.anything(), {
        data: {
          placeholder: 'Email placeholder',
          emailTo: 'leader@example.com',
          name: 'Leader Name',
          subject: 'Email Subject'
        }
      });
    });
  });

  describe('fetchLoggedUserFollowers', () => {
    it('should fetch logged user followers successfully', () => {
      const mockFollowData = { followers: [], following: [] };
      mockLeadershipService.fetchUserFollow.mockReturnValue(of(mockFollowData));
      
      // We need to access the private method
      (component as any).fetchLoggedUserFollowers();
      
      expect(mockLeadershipService.fetchUserFollow).toHaveBeenCalledWith('test-user-id');
      expect(component.loggedUserFollowData).toEqual(mockFollowData);
    });

    it('should handle error when fetching user followers', () => {
      mockLeadershipService.fetchUserFollow.mockReturnValue(throwError('Error'));
      
      (component as any).fetchLoggedUserFollowers();
      
      expect(mockSnackBar.open).toHaveBeenCalledWith('mock-value', 'X');
    });
  });

  describe('isFollowing', () => {
    it('should return true if user is following the leader', () => {
      component.loggedUserFollowData = {
        followers: [],
        following: [{ id: 'leader-uuid', email: 'leader@example.com', firstname: 'Leader' }]
      };
      
      const result = component.isFollowing('leader-uuid');
      
      expect(result).toBe(true);
    });

    it('should return false if user is not following the leader', () => {
      component.loggedUserFollowData = {
        followers: [],
        following: []
      };
      
      const result = component.isFollowing('leader-uuid');
      
      expect(result).toBe(false);
    });
  });

  describe('follow', () => {
    it('should follow a leader successfully', () => {
      component.leaderUuid = 'leader-uuid';
      component.isFetchingFollow = false;
      component.userId = 'test-user-id';
      component.loggedUserFollowData = { followers: [], following: [] };
      
      mockLeadershipService.followUser.mockReturnValue(of({}));
      
      component.follow();
      
      expect(component.isFetchingFollow).toBe(false);
      expect(mockLeadershipService.followUser).toHaveBeenCalledWith({
        followsourceid: 'test-user-id',
        followtargetid: 'leader-uuid',
        type: 'person'
      });
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(component.loggedUserFollowData.following.length).toBe(1);
    });

    it('should handle error when following a leader', () => {
      component.leaderUuid = 'leader-uuid';
      component.userId = 'test-user-id';
      component.loggedUserFollowData = { followers: [], following: [] };
      
      mockLeadershipService.followUser.mockReturnValue(throwError('Error'));
      
      component.follow();
      
      expect(component.isFetchingFollow).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith('mock-value', 'X');
      expect(component.loggedUserFollowData.following.length).toBe(0);
    });
  });

  describe('unFollow', () => {
    it('should unfollow a leader successfully', () => {
      component.leaderUuid = 'leader-uuid';
      component.userId = 'test-user-id';
      component.loggedUserFollowData = {
        followers: [],
        following: [{ id: 'leader-uuid', email: 'leader@example.com', firstname: 'Leader' }]
      };
      
      mockLeadershipService.unFollowUser.mockReturnValue(of({}));
      
      component.unFollow();
      
      expect(component.isFetchingFollow).toBe(false);
      expect(mockLeadershipService.unFollowUser).toHaveBeenCalledWith({
        followsourceid: 'test-user-id',
        followtargetid: 'leader-uuid'
      });
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(component.loggedUserFollowData.following.length).toBe(0);
    });

    it('should handle error when unfollowing a leader', () => {
      component.leaderUuid = 'leader-uuid';
      component.userId = 'test-user-id';
      component.loggedUserFollowData = {
        followers: [],
        following: [{ id: 'leader-uuid', email: 'leader@example.com', firstname: 'Leader' }]
      };
      
      mockLeadershipService.unFollowUser.mockReturnValue(throwError('Error'));
      
      component.unFollow();
      
      expect(component.isFetchingFollow).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith('mock-value', 'X');
      // Following array should remain unchanged
      expect(component.loggedUserFollowData.following.length).toBe(1);
    });
  });

  describe('toggleFollow', () => {
    it('should call unFollow when already following', () => {
      component.leaderUuid = 'leader-uuid';
      component.loggedUserFollowData = {
        followers: [],
        following: [{ id: 'leader-uuid', email: 'leader@example.com', firstname: 'Leader' }]
      };
      
      const unFollowSpy = jest.spyOn(component, 'unFollow');
      const followSpy = jest.spyOn(component, 'follow');
      
      component.toggleFollow();
      
      expect(unFollowSpy).toHaveBeenCalled();
      expect(followSpy).not.toHaveBeenCalled();
    });

    it('should call follow when not already following', () => {
      component.leaderUuid = 'leader-uuid';
      component.loggedUserFollowData = {
        followers: [],
        following: []
      };
      
      const unFollowSpy = jest.spyOn(component, 'unFollow');
      const followSpy = jest.spyOn(component, 'follow');
      
      component.toggleFollow();
      
      expect(followSpy).toHaveBeenCalled();
      expect(unFollowSpy).not.toHaveBeenCalled();
    });
  });
});
