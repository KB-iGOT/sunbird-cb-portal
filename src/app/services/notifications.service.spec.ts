import { NotificationsService } from './notifications.service';
import { of, throwError } from 'rxjs';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockHttpClient: any;
  let mockRouter: any;
  let mockConfigService: any;
  let mockSnackBar: any;
  let mockEnvironment: any;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn()
    };

    mockRouter = {
      navigate: jest.fn()
    };

    mockConfigService = {
      unMappedUser: {
        profileDetails: {
          employmentDetails: {
            departmentName: 'Test Department'
          }
        }
      }
    };

    mockSnackBar = {
      open: jest.fn()
    };

    mockEnvironment = {
      portalsForNotifications: {
        cbp: 'https://cbp.example.com',
        mdo: 'https://mdo.example.com'
      }
    };

    service = new NotificationsService(mockHttpClient, mockRouter, mockConfigService);

    // Mock window.open
   // global.window = Object.create(window);
    Object.defineProperty(window, 'open', {
      value: jest.fn(),
      writable: true
    });

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should set orgName from config service when all nested properties exist', () => {
      expect(service.orgName).toBe('Test Department');
    });

    // it('should handle missing config service', () => {
    //   const serviceWithoutConfig = new NotificationsService(mockHttpClient, mockRouter, null);
    //   expect(serviceWithoutConfig.orgName).toBe('');
    // });

    // it('should handle missing unMappedUser', () => {
    //   const configWithoutUser = { unMappedUser: null };
    //   const serviceWithoutUser = new NotificationsService(mockHttpClient, mockRouter, configWithoutUser);
    //   expect(serviceWithoutUser.orgName).toBe('');
    // });

    // it('should handle missing profileDetails', () => {
    //   const configWithoutProfile = { 
    //     unMappedUser: { 
    //       profileDetails: null 
    //     } 
    //   };
    //   const serviceWithoutProfile = new NotificationsService(mockHttpClient, mockRouter, configWithoutProfile);
    //   expect(serviceWithoutProfile.orgName).toBe('');
    // });

    // it('should handle missing employmentDetails', () => {
    //   const configWithoutEmployment = { 
    //     unMappedUser: { 
    //       profileDetails: { 
    //         employmentDetails: null 
    //       } 
    //     } 
    //   };
    //   const serviceWithoutEmployment = new NotificationsService(mockHttpClient, mockRouter, configWithoutEmployment);
    //   expect(serviceWithoutEmployment.orgName).toBe('');
    // });

    // it('should handle missing departmentName', () => {
    //   const configWithoutDept = { 
    //     unMappedUser: { 
    //       profileDetails: { 
    //         employmentDetails: { 
    //           departmentName: null 
    //         } 
    //       } 
    //     } 
    //   };
    //   const serviceWithoutDept = new NotificationsService(mockHttpClient, mockRouter, configWithoutDept);
    //   expect(serviceWithoutDept.orgName).toBe('');
    // });
  });

  describe('getNotificationsData', () => {
    it('should call http get with correct endpoint', () => {
      const expectedUrl = 'apis/proxies/v8/v1/notifications/unread/count';
      mockHttpClient.get.mockReturnValue(of({}));

      service.getNotificationsData();

      expect(mockHttpClient.get).toHaveBeenCalledWith(expectedUrl);
    });

    it('should return observable', () => {
      const mockResponse = { count: 5 };
      mockHttpClient.get.mockReturnValue(of(mockResponse));

      const result = service.getNotificationsData();

      result.subscribe(data => {
        expect(data).toEqual(mockResponse);
      });
    });
  });

  describe('resetNotificationsCount', () => {
    it('should call http get with correct endpoint and empty object', () => {
      const expectedUrl = 'apis/proxies/v8/v1/notifications/reset/unread/count';
      mockHttpClient.get.mockReturnValue(of({}));

      service.resetNotificationsCount();

      expect(mockHttpClient.get).toHaveBeenCalledWith(expectedUrl, {});
    });

    it('should return observable', () => {
      const mockResponse = { success: true };
      mockHttpClient.get.mockReturnValue(of(mockResponse));

      const result = service.resetNotificationsCount();

      result.subscribe(data => {
        expect(data).toEqual(mockResponse);
      });
    });
  });

  describe('getContentData', () => {
    it('should call http get with correct endpoint', () => {
      const contentId = 'test-content-id';
      const expectedUrl = `/apis/proxies/v8/action/content/v3/read/${contentId}`;
      const mockResponse = { result: { content: { id: contentId } } };
      mockHttpClient.get.mockReturnValue(of(mockResponse));

      service.getContentData(contentId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(expectedUrl);
    });

    it('should map response to content and retry once', () => {
      const contentId = 'test-content-id';
      const mockContent = { id: contentId, title: 'Test Content' };
      const mockResponse = { result: { content: mockContent } };
      mockHttpClient.get.mockReturnValue(of(mockResponse));

      const result = service.getContentData(contentId);

      result.subscribe(data => {
        expect(data).toEqual(mockContent);
      });
    });
  });

  describe('searchWorkflowSearch', () => {
    it('should call http post with correct endpoint and request', () => {
      const expectedUrl = 'apis/protected/v8/workflowhandler/profileApprovalSearch';
      const mockRequest = { test: 'data' };
      mockHttpClient.post.mockReturnValue(of({}));

      service.searchWorkflowSearch(mockRequest);

      expect(mockHttpClient.post).toHaveBeenCalledWith(expectedUrl, mockRequest);
    });

    it('should return observable', () => {
      const mockRequest = { test: 'data' };
      const mockResponse = { result: { data: [] } };
      mockHttpClient.post.mockReturnValue(of(mockResponse));

      const result = service.searchWorkflowSearch(mockRequest);

      result.subscribe(data => {
        expect(data).toEqual(mockResponse);
      });
    });
  });

  describe('getMyRequests', () => {
    it('should call http get with correct endpoint', () => {
      const expectedUrl = 'apis/protected/v8/connections/v2/connections/requests/received?pageNo=0&pageSize=100';
      const mockResponse = { result: { data: [] } };
      mockHttpClient.get.mockReturnValue(of(mockResponse));

      service.getMyRequests();

      expect(mockHttpClient.get).toHaveBeenCalledWith(expectedUrl);
    });

    it('should map response to data and retry once', () => {
      const mockData = [{ id: 1, name: 'Test Request' }];
      const mockResponse = { result: { data: mockData } };
      mockHttpClient.get.mockReturnValue(of(mockResponse));

      const result = service.getMyRequests();

      result.subscribe(data => {
        expect(data).toEqual(mockData);
      });
    });
  });

  describe('constrctPayload', () => {
    it('should construct payload for PROFILE_VERIFICATION', () => {
      const notification = { sub_category: 'PROFILE_VERIFICATION' };
      
      const result = service.constrctPayload(notification);

      expect(result).toEqual({
        applicationStatus: 'SEND_FOR_APPROVAL',
        deptName: 'Test Department',
        limit: 50,
        serviceName: 'profile',
        requestType: ['GROUP_CHANGE', 'DESIGNATION_CHANGE']
      });
    });

    it('should construct payload for USER_TRANSFER', () => {
      const notification = { sub_category: 'USER_TRANSFER' };
      
      const result = service.constrctPayload(notification);

      expect(result).toEqual({
        applicationStatus: 'SEND_FOR_APPROVAL',
        deptName: 'Test Department',
        limit: 50,
        serviceName: 'profile',
        requestType: ['ORG_TRANSFER']
      });
    });

    it('should construct basic payload for other sub_categories', () => {
      const notification = { sub_category: 'OTHER' };
      
      const result = service.constrctPayload(notification);

      expect(result).toEqual({
        applicationStatus: 'SEND_FOR_APPROVAL',
        deptName: 'Test Department',
        limit: 50,
        serviceName: 'profile'
      });
    });
  });

  describe('handleReviewStatus', () => {
    const mockNotification = {
      message: { data: { id: 'content-id' } }
    };

    it('should handle InReview status with CONTENT_REVIEWER role', () => {
      const res = { reviewStatus: 'InReview' };
      const roles = ['CONTENT_REVIEWER'];
      const isStandaloneResource = true;

      service.handleReviewStatus(res, mockNotification, isStandaloneResource, roles, mockEnvironment, mockSnackBar);

      expect(window.open).toHaveBeenCalledWith(
        `${mockEnvironment.portalsForNotifications.cbp}/author/editor/content-id/collectionV2?isStandaloneResource=true&preview=true&editMode=true&status=Review&reviewStatus=InReview`,
        '_blank'
      );
    });

    it('should handle InReview status without CONTENT_REVIEWER role', () => {
      const res = { reviewStatus: 'InReview' };
      const roles = ['OTHER_ROLE'];
      const isStandaloneResource = false;

      service.handleReviewStatus(res, mockNotification, isStandaloneResource, roles, mockEnvironment, mockSnackBar);

      expect(mockSnackBar.open).toHaveBeenCalledWith('You are not authorized to view this content.');
    });

    it('should handle Reviewed status with CONTENT_PUBLISHER role', () => {
      const res = { reviewStatus: 'Reviewed' };
      const roles = ['CONTENT_PUBLISHER'];
      const isStandaloneResource = false;

      service.handleReviewStatus(res, mockNotification, isStandaloneResource, roles, mockEnvironment, mockSnackBar);

      expect(window.open).toHaveBeenCalledWith(
        `${mockEnvironment.portalsForNotifications.cbp}/author/editor/content-id/collectionV2?isStandaloneResource=false`,
        '_blank'
      );
    });

    it('should handle Reviewed status without CONTENT_PUBLISHER role', () => {
      const res = { reviewStatus: 'Reviewed' };
      const roles = ['OTHER_ROLE'];
      const isStandaloneResource = true;

      service.handleReviewStatus(res, mockNotification, isStandaloneResource, roles, mockEnvironment, mockSnackBar);

      expect(mockSnackBar.open).toHaveBeenCalledWith('You are not authorized to view this content.');
    });
  });

  describe('handleNetworkRedirection', () => {
    it('should show snackbar for REJECTED_CONNECTION_REQUEST', () => {
      const notification = { sub_category: 'REJECTED_CONNECTION_REQUEST' };

      service.handleNetworkRedirection(notification, mockSnackBar);

      expect(mockSnackBar.open).toHaveBeenCalledWith('This request has been resolved or is no longer available.');
    });

    it('should handle SEND_CONNECTION_REQUEST with existing connection', () => {
      const notification = { 
        sub_category: 'SEND_CONNECTION_REQUEST',
        message: { data: { id: 'user-id' } }
      };
      const mockRequests = [{ userId: 'user-id', name: 'Test User' }];
      mockHttpClient.get.mockReturnValue(of({ result: { data: mockRequests } }));

      service.handleNetworkRedirection(notification, mockSnackBar);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/network-v2/connections']);
    });

    it('should handle SEND_CONNECTION_REQUEST without matching connection', () => {
      const notification = { 
        sub_category: 'SEND_CONNECTION_REQUEST',
        message: { data: { id: 'user-id' } }
      };
      const mockRequests = [{ userId: 'other-user-id', name: 'Other User' }];
      mockHttpClient.get.mockReturnValue(of({ result: { data: mockRequests } }));

      service.handleNetworkRedirection(notification, mockSnackBar);

      expect(mockSnackBar.open).toHaveBeenCalledWith('This request has been resolved or is no longer available.');
    });

    it('should handle SEND_CONNECTION_REQUEST with empty requests', () => {
      const notification = { 
        sub_category: 'SEND_CONNECTION_REQUEST',
        message: { data: { id: 'user-id' } }
      };
      mockHttpClient.get.mockReturnValue(of({ result: { data: [] } }));

      service.handleNetworkRedirection(notification, mockSnackBar);

      expect(mockSnackBar.open).toHaveBeenCalledWith('This request has been resolved or is no longer available.');
    });

    it('should handle SEND_CONNECTION_REQUEST with null requests', () => {
      const notification = { 
        sub_category: 'SEND_CONNECTION_REQUEST',
        message: { data: { id: 'user-id' } }
      };
      mockHttpClient.get.mockReturnValue(of({ result: { data: null } }));

      service.handleNetworkRedirection(notification, mockSnackBar);

      expect(mockSnackBar.open).toHaveBeenCalledWith('This request has been resolved or is no longer available.');
    });

    it('should navigate to connections for other sub_categories', () => {
      const notification = { sub_category: 'OTHER_NETWORK_TYPE' };

      service.handleNetworkRedirection(notification, mockSnackBar);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/network-v2/connections']);
    });
  });

  describe('handleRedirection', () => {
    const roles = ['CONTENT_CREATOR', 'CONTENT_REVIEWER', 'CONTENT_PUBLISHER'];

    it('should handle LEARN category', () => {
      const notification = {
        category: 'LEARN',
        message: { data: { id: 'content-id' } }
      };

      service.handleRedirection(notification, mockEnvironment, roles, mockSnackBar);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/content-id']);
    });

    it('should handle EVENT category', () => {
      const notification = {
        category: 'EVENT',
        message: { data: { id: 'event-id' } }
      };

      service.handleRedirection(notification, mockEnvironment, roles, mockSnackBar);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/event-hub/home/event-id']);
    });

    it('should handle DISCUSSION category', () => {
      const notification = {
        category: 'DISCUSSION',
        message: { 
          data: { 
            communityId: 'community-id',
            discussionId: 'discussion-id'
          } 
        }
      };

      service.handleRedirection(notification, mockEnvironment, roles, mockSnackBar);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/discussion-forum-v2/community/community-id/discussion-id']);
    });

    it('should handle NETWORK category', () => {
      const notification = {
        category: 'NETWORK',
        sub_category: 'REJECTED_CONNECTION_REQUEST'
      };

      service.handleRedirection(notification, mockEnvironment, roles, mockSnackBar);

      expect(mockSnackBar.open).toHaveBeenCalledWith('This request has been resolved or is no longer available.');
    });

    it('should handle CONTENT category with Live status', () => {
      const notification = {
        category: 'CONTENT_REVIEW',
        message: { data: { id: 'content-id' } }
      };
      const mockContent = {
        primaryCategory: 'Learning Resource',
        resourceCategory: 'Video',
        status: 'Live'
      };
      mockHttpClient.get.mockReturnValue(of({ result: { content: mockContent } }));

      service.handleRedirection(notification, mockEnvironment, roles, mockSnackBar);

      expect(localStorage.setItem).toHaveBeenCalledWith('isStandaloneResource', 'true');
      expect(window.open).toHaveBeenCalledWith(
        `${mockEnvironment.portalsForNotifications.cbp}/author/content-detail/content-id/overview-v2?isStandaloneResource=true`,
        '_blank'
      );
    });

    it('should handle CONTENT category with Draft status and CONTENT_CREATOR role', () => {
      const notification = {
        category: 'CONTENT_DRAFT',
        message: { data: { id: 'content-id' } }
      };
      const mockContent = {
        primaryCategory: 'Course',
        resourceCategory: 'Learning Resource',
        status: 'Draft'
      };
      mockHttpClient.get.mockReturnValue(of({ result: { content: mockContent } }));

      service.handleRedirection(notification, mockEnvironment, roles, mockSnackBar);

      expect(localStorage.setItem).toHaveBeenCalledWith('isStandaloneResource', 'false');
      expect(window.open).toHaveBeenCalledWith(
        `${mockEnvironment.portalsForNotifications.cbp}/author/editor/content-id/collectionV2?isStandaloneResource=false`,
        '_blank'
      );
    });

    it('should handle CONTENT category with Draft status without CONTENT_CREATOR role', () => {
      const notification = {
        category: 'CONTENT_DRAFT',
        message: { data: { id: 'content-id' } }
      };
      const mockContent = {
        primaryCategory: 'Course',
        status: 'Draft'
      };
      const rolesWithoutCreator = ['CONTENT_REVIEWER'];
      mockHttpClient.get.mockReturnValue(of({ result: { content: mockContent } }));

      service.handleRedirection(notification, mockEnvironment, rolesWithoutCreator, mockSnackBar);

      expect(mockSnackBar.open).toHaveBeenCalledWith('You are not authorized to view this content.');
    });

    it('should handle CONTENT category with Review status', () => {
      const notification = {
        category: 'CONTENT_REVIEW',
        message: { data: { id: 'content-id' } }
      };
      const mockContent = {
        primaryCategory: 'Learning Resource',
        resourceCategory: 'Video',
        status: 'Review',
        reviewStatus: 'InReview'
      };
      mockHttpClient.get.mockReturnValue(of({ result: { content: mockContent } }));

      service.handleRedirection(notification, mockEnvironment, roles, mockSnackBar);

      expect(window.open).toHaveBeenCalledWith(
        `${mockEnvironment.portalsForNotifications.cbp}/author/editor/content-id/collectionV2?isStandaloneResource=true&preview=true&editMode=true&status=Review&reviewStatus=InReview`,
        '_blank'
      );
    });

    it('should handle CONTENT category with Retired status', () => {
      const notification = {
        category: 'CONTENT_RETIRED',
        message: { data: { id: 'content-id' } }
      };
      const mockContent = {
        primaryCategory: 'Course',
        status: 'Retired'
      };
      mockHttpClient.get.mockReturnValue(of({ result: { content: mockContent } }));

      service.handleRedirection(notification, mockEnvironment, roles, mockSnackBar);

      expect(mockSnackBar.open).toHaveBeenCalledWith('This content is retired.');
    });

    it('should handle PROFILE category with pending user', () => {
      const notification = {
        category: 'PROFILE',
        sub_category: 'PROFILE_VERIFICATION',
        message: { data: { id: 'user-id' } }
      };
      const mockWorkflowResponse = {
        result: {
          data: [{
            wfInfo: [{ userId: 'user-id' }]
          }]
        }
      };
      mockHttpClient.post.mockReturnValue(of(mockWorkflowResponse));

      service.handleRedirection(notification, mockEnvironment, roles, mockSnackBar);

      expect(window.open).toHaveBeenCalledWith(
        `${mockEnvironment.portalsForNotifications.mdo}/app/home/approvals/approval`,
        '_blank'
      );
    });

    it('should handle PROFILE category without pending user for PROFILE_VERIFICATION', () => {
      const notification = {
        category: 'PROFILE',
        sub_category: 'PROFILE_VERIFICATION',
        message: { data: { id: 'user-id' } }
      };
      const mockWorkflowResponse = {
        result: {
          data: [{
            wfInfo: [{ userId: 'other-user-id' }]
          }]
        }
      };
      mockHttpClient.post.mockReturnValue(of(mockWorkflowResponse));

      service.handleRedirection(notification, mockEnvironment, roles, mockSnackBar);

      expect(mockSnackBar.open).toHaveBeenCalledWith('This request has been resolved or is no longer available.');
    });

    it('should handle PROFILE category without pending user for USER_TRANSFER', () => {
      const notification = {
        category: 'PROFILE',
        sub_category: 'USER_TRANSFER',
        message: { data: { id: 'user-id' } }
      };
      const mockWorkflowResponse = {
        result: {
          data: []
        }
      };
      mockHttpClient.post.mockReturnValue(of(mockWorkflowResponse));

      service.handleRedirection(notification, mockEnvironment, roles, mockSnackBar);

      expect(mockSnackBar.open).toHaveBeenCalledWith('This request has been resolved or is no longer available.');
    });

    it('should handle PROFILE category workflow search error', () => {
      const notification = {
        category: 'PROFILE',
        sub_category: 'PROFILE_VERIFICATION',
        message: { data: { id: 'user-id' } }
      };
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockHttpClient.post.mockReturnValue(throwError('Network error'));

      service.handleRedirection(notification, mockEnvironment, roles, mockSnackBar);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error while fetching workflow search data', 'Network error');
      expect(mockSnackBar.open).toHaveBeenCalledWith('Error while fetching approval data');
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Subjects', () => {
    it('should have closeDialogPop subject', () => {
      expect(service.closeDialogPop).toBeDefined();
    });

    it('should have nofificationsCount subject', () => {
      expect(service.nofificationsCount).toBeDefined();
    });
  });
});