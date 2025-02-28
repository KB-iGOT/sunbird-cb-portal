import { HomeComponent } from './home.component';
import { Subject, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let mockActivatedRoute: any;
  let mockConfigSvc: any;
  let mockBtnSettingsSvc: any;
  let mockMobileAppsService: any;
  let mockRouter: any;
  let mockTranslate: any;
  let mockUserProfileService: any;
  let mockMatSnackBar: any;
  let mockEvents: any;

  beforeEach(() => {
    // Mock ActivatedRoute
    mockActivatedRoute = {
      snapshot: {
        data: {
          pageData: {
            data: {
              homeConfig: {},
              newHomeStrip: [],
              clientList: {},
              hubsData: {},
              sliderData: {},
              enableLazyLoading: true
            }
          }
        }
      }
    };

    // Mock ConfigurationsService
    mockConfigSvc = {
      unMappedUser: {
        id: 'user-123',
        profileDetails: {
          profileStatus: 'PENDING',
          employmentDetails: {
            departmentName: 'Engineering'
          },
          additionalProperties: {
            isProfileUpdatedMsgViewed: false
          }
        }
      },
      overrideThemeChanges: {}
    };

    // Mock BtnSettingsService
    mockBtnSettingsSvc = {
      changeFont: jest.fn()
    };

    // Mock MobileAppsService
    mockMobileAppsService = {
      mobileTopHeaderVisibilityStatus: new Subject()
    };

    // Mock Router
    mockRouter = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn()
    };

    // Mock TranslateService
    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn((key) => key)
    };

    // Mock UserProfileService
    mockUserProfileService = {
      listApprovalPendingFields: jest.fn().mockReturnValue(of({
        result: {
          data: []
        }
      })),
      editProfileDetails: jest.fn().mockReturnValue(of({
        result: {
          data: {}
        }
      })),
      fetchApprovedFields: jest.fn().mockReturnValue(of({
        result: {
          data: []
        }
      })),
      listRejectedFields: jest.fn().mockReturnValue(of({
        result: {
          data: []
        }
      }))
    };

    // Mock MatSnackBar
    mockMatSnackBar = {
      open: jest.fn(),
      openFromComponent: jest.fn()
    };

    // Mock EventService
    mockEvents = {
      raiseInteractTelemetry: jest.fn()
    };

    // Spy on localStorage and sessionStorage
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'userEnrollmentCount') {
        return JSON.stringify({ enrolledCourseCount: 0 });
      }
      if (key === 'hideUpdateProfilePopUp') {
        return 'true';
      }
      if (key === 'websiteLanguage') {
        return 'en';
      }
      return null;
    });
    
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(jest.fn());

    // Spy on window.innerHeight and document.getElementsByClassName
    Object.defineProperty(window, 'innerHeight', { value: 1000 });
    document.getElementsByClassName = jest.fn().mockImplementation(() => [{
      getBoundingClientRect: () => ({
        top: 100,
        bottom: 200
      })
    }]);

    // Create component instance
    component = new HomeComponent(
      mockActivatedRoute,
      mockConfigSvc,
      mockBtnSettingsSvc,
      mockMobileAppsService,
      mockRouter,
      mockTranslate,
      mockUserProfileService,
      mockMatSnackBar,
      mockEvents
    );
    
    // Spy on component methods
    jest.spyOn(component, 'handleUpdateMobileNudge');
    jest.spyOn(component, 'handleDefaultFontSetting');
    jest.spyOn(component, 'getEnrollmentData');
    jest.spyOn(component, 'getListPendingApproval');
    
    // Clear mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
    clearInterval(component.enrollInterval);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should redirect to profile page when user is from iGOT organization and has not-my-user status', () => {
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'not-my-user';
      mockConfigSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot';
      
      component.ngOnInit();
      
      expect(component.disableMenu).toBeTruthy();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me#profileInfo');
    });
    
    it('should not redirect when user is not from iGOT or does not have not-my-user status', () => {
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'VERIFIED';
      mockConfigSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'Engineering';
      
      component.ngOnInit();
      
      expect(component.disableMenu).toBeFalsy();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });
    
    it('should initialize section list correctly from content strip data', () => {
      mockActivatedRoute.snapshot.data.pageData.data.newHomeStrip = [
        {
          order: 1,
          strips: [{ active: true }]
        },
        {
          order: 0,
          strips: [{ active: true }]
        }
      ];
      
      component.ngOnInit();
      
      expect(component.contentStripData.length).toBe(2);
      expect(component.sectionList.length).toBeGreaterThan(2); // Includes the base sections + new sections
    });
    
    it('should set language from localStorage', () => {
      component.ngOnInit();
      
      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockTranslate.use).toHaveBeenCalledWith('en');
    });
    
    it('should set up data fetching methods', () => {
      component.ngOnInit();
      
      expect(component.getListPendingApproval).toHaveBeenCalled();
      expect(component.handleDefaultFontSetting).toHaveBeenCalled();
      expect(component.enrollInterval).toBeDefined();
    });
  });

  describe('getEnrollmentData', () => {
    it('should set isKPPanelenabled to true when user has no enrolled courses', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify({ enrolledCourseCount: 0 }));
      
      component.getEnrollmentData();
      
      expect(component.isKPPanelenabled).toBeTruthy();
      expect(clearInterval).toHaveBeenCalledWith(component.enrollInterval);
    });
    
    it('should set isKPPanelenabled to false when user has enrolled courses', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify({ enrolledCourseCount: 5 }));
      
      component.getEnrollmentData();
      
      expect(component.isKPPanelenabled).toBeFalsy();
      expect(clearInterval).toHaveBeenCalledWith(component.enrollInterval);
    });
  });

  describe('getListPendingApproval', () => {
    it('should handle pending approval fields successfully', () => {
      mockUserProfileService.listApprovalPendingFields.mockReturnValue(of({
        result: {
          data: [{ field: 'name', value: 'Test User' }]
        }
      }));
      
      component.getListPendingApproval();
      
      expect(mockUserProfileService.listApprovalPendingFields).toHaveBeenCalled();
      expect(component.pendingApprovalList).toEqual([{ field: 'name', value: 'Test User' }]);
      expect(component.handleUpdateMobileNudge).not.toHaveBeenCalled(); // Should not call when there are pending items
    });
    
    it('should call handleUpdateMobileNudge when there are no pending approval fields', () => {
      mockUserProfileService.listApprovalPendingFields.mockReturnValue(of({
        result: {
          data: []
        }
      }));
      
      component.getListPendingApproval();
      
      expect(mockUserProfileService.listApprovalPendingFields).toHaveBeenCalled();
      expect(component.pendingApprovalList).toEqual([]);
      expect(component.handleUpdateMobileNudge).toHaveBeenCalled();
    });
    
    it('should handle error from API call', () => {
      const errorResponse = new HttpErrorResponse({
        error: 'Error message',
        status: 400,
        statusText: 'Bad Request'
      });
      
      mockUserProfileService.listApprovalPendingFields.mockReturnValue(throwError(errorResponse));
      
      component.getListPendingApproval();
      
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to fetch pending approval list');
    });
  });

  describe('handleUpdateMobileNudge', () => {
    it('should set isNudgeOpen to true when profile status is not VERIFIED', () => {
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'PENDING';
      jest.spyOn(sessionStorage, 'getItem').mockReturnValue('true');
      
      component.handleUpdateMobileNudge();
      
      expect(component.isNudgeOpen).toBeTruthy();
    });
    
    it('should set isNudgeOpen to false when profile status is VERIFIED', () => {
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'VERIFIED';
      jest.spyOn(sessionStorage, 'getItem').mockReturnValue('true');
      
      component.handleUpdateMobileNudge();
      
      expect(component.isNudgeOpen).toBeFalsy();
    });
  });

  describe('handleDefaultFontSetting', () => {
    it('should call changeFont with the stored font setting', () => {
      jest.spyOn(localStorage, 'getItem').mockReturnValue('font-medium');
      
      component.handleDefaultFontSetting();
      
      expect(mockBtnSettingsSvc.changeFont).toHaveBeenCalledWith('font-medium');
    });
  });

  describe('scrollHandler and checkSectionVisibility', () => {
    it('should check visibility for sections beyond the first 5', () => {
      component.sectionList = [
        { section: 'section_0', isVisible: true },
        { section: 'section_1', isVisible: true },
        { section: 'section_5', isVisible: false },
        { section: 'section_6', isVisible: false }
      ];
      
      jest.spyOn(component, 'checkSectionVisibility');
      
      component.scrollHandler();
      
      expect(component.checkSectionVisibility).toHaveBeenCalledWith('section_5');
      expect(component.checkSectionVisibility).toHaveBeenCalledWith('section_6');
      expect(component.checkSectionVisibility).not.toHaveBeenCalledWith('section_0');
    });
    
    it('should update section visibility based on position in viewport', () => {
      component.sectionList = [
        { section: 'section_5', isVisible: false }
      ];
      
      component.checkSectionVisibility('section_5');
      
      expect(component.sectionList[0].isVisible).toBeTruthy();
    });
  });

  describe('handleRemindLater', () => {
    it('should set session storage and update isNudgeOpen', () => {
      component.handleRemindLater();
      
      expect(sessionStorage.setItem).toHaveBeenCalledWith('hideUpdateProfilePopUp', 'true');
      expect(component.isNudgeOpen).toBeFalsy();
    });
  });

  describe('fetchProfile', () => {
    it('should call handleMDOMsgstatus and navigate to profile page', () => {
      jest.spyOn(component, 'handleMDOMsgstatus');
      
      component.fetchProfile();
      
      expect(component.handleMDOMsgstatus).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/person-profile/me']);
    });
  });

  describe('closeKarmaPointsPanel', () => {
    it('should set isKPPanelenabled to false', () => {
      component.isKPPanelenabled = true;
      
      component.closeKarmaPointsPanel();
      
      expect(component.isKPPanelenabled).toBeFalsy();
    });
  });

  describe('raiseTelemetryInteratEvent', () => {
    it('should call raiseInteractTelemetry with correct parameters for viewMoreUrl event', () => {
      const event = {
        stripTitle: 'Title',
        viewMoreUrl: {
          viewMoreText: 'View More'
        },
        typeOfTelemetry: 'view-more'
      };
      
      component.raiseTelemetryInteratEvent(event);
      
      expect(component.raiseTelemetry).toHaveBeenCalledWith('Title View More', 'view-more');
    });
    
    it('should call raiseInteractTelemetry for mdo-channel event', () => {
      const event = {
        typeOfTelemetry: 'mdo-channel',
        identifier: 'channel-123',
        orgName: 'Channel Name'
      };
      
      component.raiseTelemetryInteratEvent(event);
      
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'mdo-channel',
          id: 'content-card',
        },
        {
          id: 'channel-123',
          type: 'Channel Name',
        },
        {
          module: 'home',
        }
      );
      expect(component.isTelemetryRaised).toBeTruthy();
    });
  });

  describe('handleMDOMsgstatus', () => {
    it('should update profile with isProfileUpdatedMsgViewed set to true', () => {
      mockUserProfileService.editProfileDetails.mockReturnValue(of({ success: true }));
      
      component.handleMDOMsgstatus();
      
      expect(mockUserProfileService.editProfileDetails).toHaveBeenCalledWith({
        request: {
          userId: 'user-123',
          profileDetails: {
            additionalProperties: {
              isProfileUpdatedMsgViewed: true,
            },
          },
        },
      });
      expect(component.isMDOMsgOpen).toBeTruthy();
    });
    
    it('should handle error from editProfileDetails', () => {
      const errorResponse = new HttpErrorResponse({
        error: { text: 'Error updating profile' },
        status: 400,
        statusText: 'Bad Request'
      });
      
      mockUserProfileService.editProfileDetails.mockReturnValue(throwError(errorResponse));
      
      component.handleMDOMsgstatus();
      
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Error updating profile');
    });
  });

  describe('getApprovedStatus', () => {
    it('should set approvedStatus to true when approved fields include relevant properties', () => {
      mockUserProfileService.fetchApprovedFields.mockReturnValue(of({
        result: {
          data: [{ name: 'Test User' }]
        }
      }));
      
      component.getApprovedStatus();
      
      expect(component.approvedStatus).toBeTruthy();
    });
    
    it('should set approvedStatus to false when approved fields do not include relevant properties', () => {
      mockUserProfileService.fetchApprovedFields.mockReturnValue(of({
        result: {
          data: [{ email: 'test@example.com' }]
        }
      }));
      
      component.getApprovedStatus();
      
      expect(component.approvedStatus).toBeFalsy();
    });
  });

  describe('getRejectedStatus', () => {
    it('should set rejectedStatus to true when rejected fields include relevant properties', () => {
      mockUserProfileService.listRejectedFields.mockReturnValue(of({
        result: {
          data: [{ designation: 'Manager' }]
        }
      }));
      
      component.getRejectedStatus();
      
      expect(component.rejectedStatus).toBeTruthy();
    });
    
    it('should set rejectedStatus to false when rejected fields do not include relevant properties', () => {
      mockUserProfileService.listRejectedFields.mockReturnValue(of({
        result: {
          data: [{ phone: '1234567890' }]
        }
      }));
      
      component.getRejectedStatus();
      
      expect(component.rejectedStatus).toBeFalsy();
    });
  });
});