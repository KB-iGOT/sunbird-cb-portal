import { LandingComponent } from './landing.component'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { LeadershipService } from '../../services/leadership.service'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { ElementRef } from '@angular/core'
import { of, throwError } from 'rxjs'
import { IWsUserFollow } from '../../model/leadership-email.model'
import { IWsLeaderData } from '../../model/leadership.model'
import { SendMailDialogComponent } from '../send-mail-dialog/send-mail-dialog.component'

describe('LandingComponent', () => {
  let component: LandingComponent
  let mockRoute: jest.Mocked<ActivatedRoute>
  let mockRouter: jest.Mocked<Router>
  let mockDialog: jest.Mocked<MatDialog>
  let mockSnackBar: jest.Mocked<MatSnackBar>
  let mockLeaderSvc: jest.Mocked<LeadershipService>
  let mockConfigSvc: jest.Mocked<ConfigurationsService>

  const mockLeaderData: IWsLeaderData = {
    profile: {
      name: 'John Doe',
      emailId: 'john.doe@example.com'
    },
    tabs: [
      { title: 'Overview' },
      { title: 'Experience' },
      { title: 'Skills' }
    ],
    mailMeta: {
      placeholder: 'Write your message...',
      emailTo: 'john.doe@example.com',
      name: 'John Doe',
      subject: 'Message from Leadership Portal'
    }
  } as IWsLeaderData

  const mockUserFollow: IWsUserFollow = {
    followers: [],
    following: [
      {
        id: 'user123',
        email: 'test@example.com',
        firstname: 'Test User'
      }
    ]
  }

  beforeEach(() => {
    // Mock ActivatedRoute
    mockRoute = {
      data: of({ leaderData: { data: mockLeaderData } }),
      paramMap: of({
        get: jest.fn().mockReturnValue('john-doe')
      } as unknown as ParamMap),
      queryParamMap: of({
        get: jest.fn().mockReturnValue('Overview')
      } as unknown as ParamMap)
    } as unknown as jest.Mocked<ActivatedRoute>

    // Mock Router
    mockRouter = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>

    // Mock MatDialog
    mockDialog = {
      open: jest.fn()
    } as unknown as jest.Mocked<MatDialog>

    // Mock MatSnackBar
    mockSnackBar = {
      open: jest.fn()
    } as unknown as jest.Mocked<MatSnackBar>

    // Mock LeadershipService
    mockLeaderSvc = {
      emailToUserId: jest.fn().mockReturnValue(of({ userId: 'leader123', email: 'john.doe@example.com' })),
      fetchUserFollow: jest.fn().mockReturnValue(of(mockUserFollow)),
      followUser: jest.fn(),
      unFollowUser: jest.fn()
    } as unknown as jest.Mocked<LeadershipService>

    // Mock ConfigurationsService
    mockConfigSvc = {
      userProfile: {
        userId: 'current-user-123'
      }
    } as unknown as jest.Mocked<ConfigurationsService>

    component = new LandingComponent(
      mockRoute,
      mockRouter,
      mockDialog,
      mockSnackBar,
      mockLeaderSvc,
      mockConfigSvc
    )

    // Mock ViewChild elements
    component.followed = {
      nativeElement: { value: 'Successfully followed' }
    } as ElementRef<any>

    component.unfollowed = {
      nativeElement: { value: 'Successfully unfollowed' }
    } as ElementRef<any>

    component.followUnfollowError = {
      nativeElement: { value: 'Error occurred' }
    } as ElementRef<any>
  })

  describe('Constructor', () => {
    it('should initialize component with user profile', () => {
      expect(component.userId).toBe('current-user-123')
    })

    it('should handle missing user profile', () => {
      mockConfigSvc.userProfile = null as any
      const newComponent = new LandingComponent(
        mockRoute,
        mockRouter,
        mockDialog,
        mockSnackBar,
        mockLeaderSvc,
        mockConfigSvc
      )
      expect(newComponent.userId).toBeUndefined()
    })
  })

  describe('ngOnInit', () => {
    it('should subscribe to route data when route exists', () => {
      const initSpy = jest.spyOn(component, 'init').mockImplementation(() => { })
      component.ngOnInit()
      expect(initSpy).toHaveBeenCalledWith({ leaderData: { data: mockLeaderData } })
    })

    it('should handle missing route', () => {
      component['route'] = null as any
      expect(() => component.ngOnInit()).not.toThrow()
    })

    it('should handle missing route data', () => {
      mockRoute.data = null as any
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  describe('init', () => {
    beforeEach(() => {
      jest.spyOn(component, 'fetchUserId').mockImplementation()
      jest.spyOn(component, 'fetchLoggedUserFollowers' as any).mockImplementation()
    })

    it('should initialize with valid leader data', () => {
      const response = { leaderData: { data: mockLeaderData } }
      component.init(response)

      expect(component.leaderData).toEqual(mockLeaderData)
      expect(component.tabs).toEqual(['Overview', 'Experience', 'Skills'])
      expect(component.leaderName).toBe('john-doe')
      expect(component.currentIndex).toBe(0)
      expect(component.fetchUserId).toHaveBeenCalled()
      // expect(component.fetchLoggedUserFollowers).toHaveBeenCalled();
    })

    it('should handle error in leader response', () => {
      const response = { leaderData: { error: 'Some error' } }
      component.init(response)

      expect(component.errorFetchingJson).toBe(true)
      expect(component.fetchUserId).toHaveBeenCalled()
      // expect(component.fetchLoggedUserFollowers).toHaveBeenCalled();
    })

    it('should handle missing name parameter', () => {
      const mockParamMap: any = {
        get: jest.fn().mockReturnValue(null)
      } as unknown as ParamMap
        ; (mockRoute as any).paramMap = of(mockParamMap)

      const response = { leaderData: { data: mockLeaderData } }
      component.init(response)

      expect(component.leaderName).toBe('')
    })

    it('should handle invalid tab query parameter', () => {
      // const mockQueryParamMap = {
      //   get: jest.fn().mockReturnValue('InvalidTab')
      // } as unknown as ParamMap;
      // mockRoute.queryParamMap = of(mockQueryParamMap);

      const response = { leaderData: { data: mockLeaderData } }
      component.init(response)

      expect(component.currentIndex).toBe(0)
    })

    it('should handle valid tab query parameter', () => {
      const mockQueryParamMap = {
        get: jest.fn().mockReturnValue('Experience')
      } as unknown as ParamMap
        ; (mockRoute as any).queryParamMap = of(mockQueryParamMap)

      const response = { leaderData: { data: mockLeaderData } }
      component.init(response)

      expect(component.currentIndex).toBe(1)
    })

    it('should handle missing paramMap', () => {
      // mockRoute.paramMap = null as any;
      const response = { leaderData: { data: mockLeaderData } }
      expect(() => component.init(response)).not.toThrow()
    })

    it('should handle missing queryParamMap', () => {
      //  mockRoute.queryParamMap = null as any;
      const response = { leaderData: { data: mockLeaderData } }
      expect(() => component.init(response)).not.toThrow()
    })

    it('should handle missing route', () => {
      component['route'] = null as any
      const response = { leaderData: { data: mockLeaderData } }
      expect(() => component.init(response)).not.toThrow()
    })
  })

  describe('fetchUserId', () => {
    it('should fetch user ID successfully', () => {
      const mockEmailUserId = { userId: 'leader123', email: 'john.doe@example.com' }
      mockLeaderSvc.emailToUserId.mockReturnValue(of(mockEmailUserId))
      component.leaderData = mockLeaderData

      component.fetchUserId()

      expect(mockLeaderSvc.emailToUserId).toHaveBeenCalledWith('john.doe@example.com')
      expect(component.leaderUuid).toBe('leader123')
      expect(component.isFollowDisabled).toBe(false)
    })

    it('should handle error when fetching user ID', () => {
      mockLeaderSvc.emailToUserId.mockReturnValue(throwError('Error'))
      component.leaderData = mockLeaderData

      component.fetchUserId()

      expect(component.isFollowDisabled).toBe(true)
    })

    it('should handle missing leader data', () => {
      component.leaderData = null
      component.fetchUserId()
      expect(mockLeaderSvc.emailToUserId).not.toHaveBeenCalled()
    })

    it('should handle missing profile in leader data', () => {
      component.leaderData = { ...mockLeaderData, profile: null } as any
      component.fetchUserId()
      expect(mockLeaderSvc.emailToUserId).not.toHaveBeenCalled()
    })

    it('should handle missing emailId in profile', () => {
      component.leaderData = {
        ...mockLeaderData,
        profile: { ...mockLeaderData.profile, emailId: '' }
      }
      component.fetchUserId()
      expect(mockLeaderSvc.emailToUserId).not.toHaveBeenCalled()
    })
  })

  describe('onIndexChange', () => {
    it('should navigate with correct tab query parameter', () => {
      component.tabs = ['Overview', 'Experience', 'Skills']
      component.onIndexChange(1)

      expect(mockRouter.navigate).toHaveBeenCalledWith([], {
        queryParams: { tab: 'Experience' }
      })
    })
  })

  describe('openSendMailDialog', () => {
    it('should open dialog with correct data', () => {
      component.leaderData = mockLeaderData
      component.openSendMailDialog()

      expect(mockDialog.open).toHaveBeenCalledWith(SendMailDialogComponent, {
        data: {
          placeholder: 'Write your message...',
          emailTo: 'john.doe@example.com',
          name: 'John Doe',
          subject: 'Message from Leadership Portal'
        }
      })
    })

    it('should not open dialog when leader data is null', () => {
      component.leaderData = null
      component.openSendMailDialog()

      expect(mockDialog.open).not.toHaveBeenCalled()
    })
  })

  describe('fetchLoggedUserFollowers', () => {
    it('should fetch user followers successfully', () => {
      mockLeaderSvc.fetchUserFollow.mockReturnValue(of(mockUserFollow))
      component.userId = 'current-user-123'

      component['fetchLoggedUserFollowers']()

      expect(mockLeaderSvc.fetchUserFollow).toHaveBeenCalledWith('current-user-123')
      expect(component.loggedUserFollowData).toEqual(mockUserFollow)
    })

    it('should handle error when fetching followers', () => {
      mockLeaderSvc.fetchUserFollow.mockReturnValue(throwError('Error'))
      component.userId = 'current-user-123'

      component['fetchLoggedUserFollowers']()

      expect(mockSnackBar.open).toHaveBeenCalledWith('Error occurred', 'X')
    })

    it('should handle undefined userId', () => {
      component.userId = undefined
      mockLeaderSvc.fetchUserFollow.mockReturnValue(of(mockUserFollow))

      component['fetchLoggedUserFollowers']()

      expect(mockLeaderSvc.fetchUserFollow).toHaveBeenCalledWith('')
    })
  })

  describe('isFollowing', () => {
    it('should return true when user is following', () => {
      component.loggedUserFollowData = mockUserFollow
      const result = component.isFollowing('user123')
      expect(result).toBe(true)
    })

    it('should return false when user is not following', () => {
      component.loggedUserFollowData = mockUserFollow
      const result = component.isFollowing('unknown-user')
      expect(result).toBe(false)
    })

    it('should return false when following list is empty', () => {
      component.loggedUserFollowData = { followers: [], following: [] }
      const result = component.isFollowing('user123')
      expect(result).toBe(false)
    })
  })

  describe('follow', () => {
    beforeEach(() => {
      component.leaderData = mockLeaderData
      component.leaderUuid = 'leader123'
      component.userId = 'current-user'
      component.loggedUserFollowData = { followers: [], following: [] }
    })

    it('should follow user successfully', () => {
      mockLeaderSvc.followUser.mockReturnValue(of({}))

      component.follow()

      expect(component.isFetchingFollow).toBe(false) // of({}) is synchronous, subscribe callback already ran
      expect(component.loggedUserFollowData.following).toHaveLength(1)
      expect(component.loggedUserFollowData.following[0]).toEqual({
        id: 'leader123',
        email: 'john.doe@example.com',
        firstname: 'John Doe'
      })

      expect(mockLeaderSvc.followUser).toHaveBeenCalledWith({
        followsourceid: 'current-user',
        followtargetid: 'leader123',
        type: 'person'
      })
    })

    it('should handle successful follow API response', (done) => {
      mockLeaderSvc.followUser.mockReturnValue(of({}))

      component.follow()

      setTimeout(() => {
        expect(mockSnackBar.open).toHaveBeenCalledWith('Successfully followed_John Doe', 'X')
        expect(component.isFetchingFollow).toBe(false)
        done()
      }, 0)
    })

    it('should handle follow API error', (done) => {
      mockLeaderSvc.followUser.mockReturnValue(throwError('Error'))

      component.follow()

      setTimeout(() => {
        expect(mockSnackBar.open).toHaveBeenCalledWith('Error occurred', 'X')
        expect(component.loggedUserFollowData.following).toHaveLength(0)
        expect(component.isFetchingFollow).toBe(false)
        done()
      }, 0)
    })

    it('should use email prefix as firstname when name is not available', () => {
      component.leaderData = {
        ...mockLeaderData,
        profile: { ...mockLeaderData.profile, name: '' }
      }
      mockLeaderSvc.followUser.mockReturnValue(of({}))

      component.follow()

      expect(component.loggedUserFollowData.following[0].firstname).toBe('john')
    })

    it('should not follow when leader data is null', () => {
      component.leaderData = null
      component.follow()

      expect(mockLeaderSvc.followUser).not.toHaveBeenCalled()
      expect(component.isFetchingFollow).toBe(false)
    })
  })

  describe('unFollow', () => {
    beforeEach(() => {
      component.leaderData = mockLeaderData
      component.leaderUuid = 'leader123'
      component.userId = 'current-user'
      component.loggedUserFollowData = {
        followers: [],
        following: [{ id: 'leader123', email: 'john@example.com', firstname: 'John' }]
      }
    })

    it('should unfollow user successfully', (done) => {
      mockLeaderSvc.unFollowUser.mockReturnValue(of({}))

      component.unFollow()

      expect(component.isFetchingFollow).toBe(false) // of({}) is synchronous, subscribe callback already ran
      expect(mockLeaderSvc.unFollowUser).toHaveBeenCalledWith({
        followsourceid: 'current-user',
        followtargetid: 'leader123'
      })

      setTimeout(() => {
        expect(mockSnackBar.open).toHaveBeenCalledWith('Successfully unfollowed John Doe', 'X')
        expect(component.loggedUserFollowData.following).toHaveLength(0)
        expect(component.isFetchingFollow).toBe(false)
        done()
      }, 0)
    })

    it('should handle unfollow API error', (done) => {
      mockLeaderSvc.unFollowUser.mockReturnValue(throwError('Error'))

      component.unFollow()

      setTimeout(() => {
        expect(mockSnackBar.open).toHaveBeenCalledWith('Error occurred', 'X')
        expect(component.isFetchingFollow).toBe(false)
        done()
      }, 0)
    })

    it('should not unfollow when leader data is null', () => {
      component.leaderData = null
      component.unFollow()

      expect(mockLeaderSvc.unFollowUser).not.toHaveBeenCalled()
      expect(component.isFetchingFollow).toBe(false)
    })
  })

  describe('toggleFollow', () => {
    beforeEach(() => {
      component.leaderUuid = 'leader123'
      jest.spyOn(component, 'isFollowing')
      jest.spyOn(component, 'follow').mockImplementation()
      jest.spyOn(component, 'unFollow').mockImplementation()
    })

    it('should call unFollow when user is following', () => {
      (component.isFollowing as jest.Mock).mockReturnValue(true)

      component.toggleFollow()

      expect(component.unFollow).toHaveBeenCalled()
      expect(component.follow).not.toHaveBeenCalled()
    })

    it('should call follow when user is not following', () => {
      (component.isFollowing as jest.Mock).mockReturnValue(false)

      component.toggleFollow()

      expect(component.follow).toHaveBeenCalled()
      expect(component.unFollow).not.toHaveBeenCalled()
    })
  })

  describe('Component Properties', () => {
    it('should initialize with default values', () => {
      const newComponent = new LandingComponent(
        mockRoute,
        mockRouter,
        mockDialog,
        mockSnackBar,
        mockLeaderSvc,
        mockConfigSvc
      )

      expect(newComponent.isFetchingFollow).toBe(false)
      expect(newComponent.tabs).toEqual([])
      expect(newComponent.currentIndex).toBe(0)
      expect(newComponent.leaderName).toBe('')
      expect(newComponent.leaderData).toBeNull()
      expect(newComponent.loggedUserFollowData).toEqual({
        followers: [],
        following: []
      })
      expect(newComponent.leaderUuid).toBe('')
      expect(newComponent.isFollowDisabled).toBe(true)
      expect(newComponent.errorFetchingJson).toBe(false)
    })
  })
})