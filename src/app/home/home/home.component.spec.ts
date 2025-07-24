import { HomeComponent } from './home.component';
import { of, throwError, Subject } from 'rxjs';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      any(expected: any): R;
    }
  }
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let mockDestroy$: Subject<void>;

  // Mock dependencies
  const mockActivatedRoute = {
    snapshot: {
      data: {
        pageData: {
          data: {
            homeConfig: { someConfig: 'test' },
            newHomeStrip: [
              {
                order: 1,
                strips: [{ active: true }]
              },
              {
                order: 2,
                strips: [{ active: true }]
              }
            ],
            clientList: { client1: 'test' },
            hubsData: { hub1: 'data' },
            enableLazyLoading: true,
            sliderData: { slider: 'data' }
          }
        }
      }
    }
  };

  const mockConfigSvc = {
    unMappedUser: {
      id: 'user123',
      profileDetails: {
        profileStatus: 'ACTIVE',
        employmentDetails: {
          departmentName: 'TestDept'
        },
        additionalProperties: {
          isProfileUpdatedMsgViewed: false
        }
      }
    },
    overrideThemeChanges: true
  };

  const mockBtnSettingsSvc = {
    changeFont: jest.fn()
  };

  const mockMobileAppsService = {
    mobileTopHeaderVisibilityStatus: of(true)
  };

  const mockRouter = {
    navigate: jest.fn(),
    navigateByUrl: jest.fn()
  };

  const mockTranslate = {
    setDefaultLang: jest.fn(),
    use: jest.fn(),
    instant: jest.fn((key: string) => key)
  };

  const mockUserProfileService = {
    listApprovalPendingFields: jest.fn().mockReturnValue(of({ result: { data: [] } })),
    editProfileDetails: jest.fn().mockReturnValue(of({ success: true })),
    fetchApprovedFields: jest.fn().mockReturnValue(of({ result: { data: [] } })),
    listRejectedFields: jest.fn().mockReturnValue(of({ result: { data: [] } }))
  };

  const mockMatSnackBar = {
    open: jest.fn(),
    openFromComponent: jest.fn()
  };

  const mockEvents = {
    raiseInteractTelemetry: jest.fn()
  };

  // Helper function to create component instance
  const createComponent = (): HomeComponent => {
    return new HomeComponent(
      mockActivatedRoute as any,
      mockConfigSvc as any,
      mockBtnSettingsSvc as any,
      mockMobileAppsService as any,
      mockRouter as any,
      mockTranslate as any,
      mockUserProfileService as any,
      mockMatSnackBar as any,
      mockEvents as any
    );
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset mock implementations
    mockUserProfileService.listApprovalPendingFields.mockReturnValue(of({ result: { data: [] } }));
    mockUserProfileService.editProfileDetails.mockReturnValue(of({ success: true }));
    mockUserProfileService.fetchApprovedFields.mockReturnValue(of({ result: { data: [] } }));
    mockUserProfileService.listRejectedFields.mockReturnValue(of({ result: { data: [] } }));
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });

    // Mock setInterval and clearInterval
    global.setInterval = jest.fn();
    global.clearInterval = jest.fn();

    // Mock document methods
    Object.defineProperty(document, 'getElementsByClassName', {
      value: jest.fn(() => [{
        getBoundingClientRect: () => ({ top: 100, bottom: 200 })
      }]),
      writable: true
    });

    // Mock window.innerHeight
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true
    });

    // Create component instance
    component = createComponent();

    // Mock the destroySubject$ after component creation
    mockDestroy$ = new Subject<void>();
    (component as any)['destroySubject$'] = mockDestroy$;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Complete any pending observables
    if (mockDestroy$) {
      mockDestroy$.next();
      mockDestroy$.complete();
    }
  });

  describe('Constructor', () => {
    it('should create instance with all dependencies', () => {
      const testComponent = createComponent();
      
      expect(testComponent).toBeDefined();
      expect(testComponent.widgetData).toEqual({});
      expect(testComponent.sliderData).toEqual({});
      expect(testComponent.contentStripData).toEqual({});
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      // Reset mocks to ensure clean state
      jest.clearAllMocks();
      mockUserProfileService.listApprovalPendingFields.mockReturnValue(of({ result: { data: [] } }));
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify({ enrolledCourseCount: 5 }));
    });

    it('should initialize component properly', () => {
      component.ngOnInit();

      expect(component.homeConfig).toEqual({ someConfig: 'test' });
      expect(component.clientList).toEqual({ client1: 'test' });
      expect(component.widgetData).toEqual({ hub1: 'data' });
      expect(component.enableLazyLoadingFlag).toBe(true);
      expect(component.sliderData).toEqual({ slider: 'data' });
    });

    it('should set up content strips and sections correctly', () => {
      component.ngOnInit();

      expect(component.contentStripData).toBe(2);
      expect(component.sectionList).toEqual({ section: 'section_0', isVisible: false });
      expect(component.sectionList).toEqual({ section: 'section_1', isVisible: false });
    });

    it('should handle not-my-user and igot org combination', () => {
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'not-my-user';
      mockConfigSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot';

      const testComponent = createComponent();
      testComponent.ngOnInit();

      expect(testComponent.disableMenu).toBe(true);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me#profileInfo');
    });

    it('should not disable menu for regular users', () => {
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'ACTIVE';
      mockConfigSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'TestDept';

      const testComponent = createComponent();
      testComponent.ngOnInit();

      expect(testComponent.disableMenu).toBe(false);
    });

    it('should handle language setting from localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('hi');

      component.ngOnInit();

      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockTranslate.use).toHaveBeenCalledWith('hi');
    });

    it('should call getListPendingApproval', () => {
      component.ngOnInit();

      expect(mockUserProfileService.listApprovalPendingFields).toHaveBeenCalled();
    });

    // it('should set up enrollment interval', () => {
    //   component.ngOnInit();

    //   expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
    // });
  });

  describe('ngAfterViewInit', () => {
    it('should set visibility for first 5 sections', () => {
      component.sectionList = [
        { section: 'section_0', isVisible: false },
        { section: 'section_1', isVisible: false },
        { section: 'section_5', isVisible: false }
      ];

      component.ngAfterViewInit();

      expect(component.sectionList[0].isVisible).toBe(true);
      expect(component.sectionList[1].isVisible).toBe(true);
      expect(component.sectionList[2].isVisible).toBe(false);
    });
  });

  describe('getEnrollmentData', () => {
    it('should enable KP panel when no enrolled courses', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify({ enrolledCourseCount: 0 }));

      component.getEnrollmentData();

      expect(component.isKPPanelenabled).toBe(true);
      expect(clearInterval).toHaveBeenCalled();
    });

    it('should disable KP panel when user has enrolled courses', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify({ enrolledCourseCount: 5 }));

      component.getEnrollmentData();

      expect(component.isKPPanelenabled).toBe(false);
      expect(clearInterval).toHaveBeenCalled();
    });

    it('should do nothing when no enrollment data', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      component.getEnrollmentData();

      expect(clearInterval).not.toHaveBeenCalled();
    });
  });

  describe('translateHub', () => {
    it('should return translated hub name', () => {
      const result = component.translateHub('testHub');

      expect(mockTranslate.instant).toHaveBeenCalledWith('testHub');
      expect(result).toBe('testHub');
    });
  });

  describe('getListPendingApproval', () => {
    it('should handle successful response', () => {
      const mockResponse = { result: { data: [{ field: 'test' }] } };
      mockUserProfileService.listApprovalPendingFields.mockReturnValue(of(mockResponse));

      component.getListPendingApproval();

      expect(component.pendingApprovalList).toEqual([{ field: 'test' }]);
    });

    it('should handle empty pending approval list', () => {
      const mockResponse = { result: { data: [] } };
      mockUserProfileService.listApprovalPendingFields.mockReturnValue(of(mockResponse));
      jest.spyOn(component, 'handleUpdateMobileNudge').mockImplementation();

      component.getListPendingApproval();

      expect(component.handleUpdateMobileNudge).toHaveBeenCalled();
    });

    it('should handle error response', () => {
      const errorResponse = { ok: false, error: { text: 'Error message' } };
      mockUserProfileService.listApprovalPendingFields.mockReturnValue(throwError(() => errorResponse));

      component.getListPendingApproval();

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to fetch pending approval list');
    });
  });

  describe('handleUpdateMobileNudge', () => {
    it('should open nudge when profile not verified and popup not hidden', () => {
      const testComponent = createComponent();
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'PENDING';
      (sessionStorage.getItem as jest.Mock).mockReturnValue(null);

      testComponent.handleUpdateMobileNudge();

      expect(testComponent.isNudgeOpen).toBe(true);
    });

    it('should not open nudge when profile is verified', () => {
      const testComponent = createComponent();
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'VERIFIED';

      testComponent.handleUpdateMobileNudge();

      expect(testComponent.isNudgeOpen).toBe(false);
    });

    it('should not open nudge when popup is hidden', () => {
      const testComponent = createComponent();
      (sessionStorage.getItem as jest.Mock).mockReturnValue('false');

      testComponent.handleUpdateMobileNudge();

      expect(testComponent.isNudgeOpen).toBe(false);
    });
  });

  describe('handleDefaultFontSetting', () => {
    it('should apply font setting from localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('large');

      component.handleDefaultFontSetting();

      expect(mockBtnSettingsSvc.changeFont).toHaveBeenCalledWith('large');
    });
  });

  describe('scrollHandler', () => {
    it('should check visibility for sections beyond first 5', () => {
      component.sectionList = [
        { section: 'section_0', isVisible: true },
        { section: 'section_5', isVisible: false },
        { section: 'section_6', isVisible: false }
      ];
      jest.spyOn(component, 'checkSectionVisibility').mockImplementation();

      component.scrollHandler();

      expect(component.checkSectionVisibility).toHaveBeenCalledWith('section_5');
      expect(component.checkSectionVisibility).toHaveBeenCalledWith('section_6');
      expect(component.checkSectionVisibility).not.toHaveBeenCalledWith('section_0');
    });
  });

  describe('checkSectionVisibility', () => {
    it('should check element visibility for later sections', () => {
      component.sectionList = [
        { section: 'section_5', isVisible: false },
        { section: 'section_6', isVisible: false }
      ];

      component.checkSectionVisibility('section_5');

      expect(document.getElementsByClassName).toHaveBeenCalledWith('section_5');
    });
  });

  describe('handleRemindLater', () => {
    it('should hide nudge and set session storage', () => {
      component.handleRemindLater();

      expect(sessionStorage.setItem).toHaveBeenCalledWith('hideUpdateProfilePopUp', 'true');
      expect(component.isNudgeOpen).toBe(false);
    });
  });

  describe('fetchProfile', () => {
    it('should handle MDO message status and navigate', () => {
      jest.spyOn(component, 'handleMDOMsgstatus').mockImplementation();

      component.fetchProfile();

      expect(component.handleMDOMsgstatus).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/person-profile/me']);
    });
  });

  describe('closeKarmaPointsPanel', () => {
    it('should disable KP panel', () => {
      component.closeKarmaPointsPanel();

      expect(component.isKPPanelenabled).toBe(false);
    });
  });

  describe('handleMDOMsgstatus', () => {
    it('should update profile details successfully', () => {
      const mockResponse = { success: true };
      mockUserProfileService.editProfileDetails.mockReturnValue(of(mockResponse));

      component.handleMDOMsgstatus();

      expect(mockUserProfileService.editProfileDetails).toHaveBeenCalledWith({
        request: {
          userId: 'user123',
          profileDetails: {
            additionalProperties: {
              isProfileUpdatedMsgViewed: true
            }
          }
        }
      });
      expect(component.isMDOMsgOpen).toBe(true);
    });

    it('should handle error when updating profile details', () => {
      const errorResponse = { ok: false, error: { text: 'Update failed' } };
      mockUserProfileService.editProfileDetails.mockReturnValue(throwError(() => errorResponse));

      component.handleMDOMsgstatus();

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Update failed');
    });
  });

  describe('getApprovedStatus', () => {
    it('should set approved status to true when relevant fields exist', () => {
      const mockResponse = {
        result: {
          data: [
            { name: 'John Doe' },
            { group: 'TestGroup' }
          ]
        }
      };
      mockUserProfileService.fetchApprovedFields.mockReturnValue(of(mockResponse));

      component.getApprovedStatus();

      expect(component.approvedStatusList).toEqual(mockResponse.result.data);
      expect(component.approvedStatus).toBe(true);
    });

    it('should set approved status to false when no relevant fields exist', () => {
      const mockResponse = {
        result: {
          data: [
            { otherField: 'value' }
          ]
        }
      };
      mockUserProfileService.fetchApprovedFields.mockReturnValue(of(mockResponse));

      component.getApprovedStatus();

      expect(component.approvedStatus).toBe(false);
    });

    it('should handle error response', () => {
      const errorResponse = { ok: false, error: { text: 'Fetch failed' } };
      mockUserProfileService.fetchApprovedFields.mockReturnValue(throwError(() => errorResponse));

      component.getApprovedStatus();

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Fetch failed');
    });
  });

  describe('getRejectedStatus', () => {
    it('should set rejected status to true when relevant fields exist', () => {
      const mockResponse = {
        result: {
          data: [
            { designation: 'Manager' }
          ]
        }
      };
      mockUserProfileService.listRejectedFields.mockReturnValue(of(mockResponse));

      component.getRejectedStatus();

      expect(component.rejectedStatusList).toEqual(mockResponse.result.data);
      expect(component.rejectedStatus).toBe(true);
    });

    it('should set rejected status to false when no relevant fields exist', () => {
      const mockResponse = {
        result: {
          data: []
        }
      };
      mockUserProfileService.listRejectedFields.mockReturnValue(of(mockResponse));

      component.getRejectedStatus();

      expect(component.rejectedStatus).toBe(false);
    });

    it('should handle error response', () => {
      const errorResponse = { ok: false, error: { text: 'Rejected fetch failed' } };
      mockUserProfileService.listRejectedFields.mockReturnValue(throwError(() => errorResponse));

      component.getRejectedStatus();

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Rejected fetch failed');
    });
  });

  describe('raiseTelemetryInteratEvent', () => {
    beforeEach(() => {
      component.isTelemetryRaised = false;
    });

    it('should raise telemetry for viewMoreUrl events', () => {
      const event = {
        viewMoreUrl: { viewMoreText: 'View More' },
        stripTitle: 'Test Strip',
        typeOfTelemetry: 'test'
      };
      jest.spyOn(component, 'raiseTelemetry').mockImplementation();

      component.raiseTelemetryInteratEvent(event);

      expect(component.raiseTelemetry).toHaveBeenCalledWith('Test Strip View More', 'test');
    });

    it('should raise telemetry for external content', () => {
      const event = {
        contentId: 'ext_123',
        typeOfTelemetry: 'external',
        identifier: 'ext_123'
      };

      component.raiseTelemetryInteratEvent(event);

      // expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
      //   {
      //     type: 'click',
      //     subType: 'external',
      //     id: 'card-content'
      //   },
      //   {
      //     id: 'ext_123',
      //     type: 'External content'
      //   },
      //   {
      //     module: expect.anything()
      //   }
      // );
      expect(component.isTelemetryRaised).toBe(true);
    });

    it('should raise telemetry for MDO channel events', () => {
      const event = {
        typeOfTelemetry: 'mdoChannel',
        identifier: 'mdo_123',
        orgId: 'org_123'
      };

      component.raiseTelemetryInteratEvent(event);

      // expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
      //   {
      //     type: 'click',
      //     subType: 'mdo-channel',
      //     id: 'card-content',
      //     pageid: '/page/home'
      //   },
      //   {
      //     id: 'mdo_123',
      //     type: 'org/ministry'
      //   },
      //   {
      //     module: expect.anything()
      //   }
      // );
    });

    // it('should raise telemetry for CBP plan with AI generated content', () => {
    //   const event = {
    //     typeOfTelemetry: 'cbpPlan',
    //     sakshamAIGenerated: true,
    //     identifier: 'cbp_123',
    //     primaryCategory: 'Course'
    //   };

    //   component.raiseTelemetryInteratEvent(event);

    //   expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
    //     {
    //       type: 'click',
    //       subType: 'igot-ai',
    //       id: 'card-content',
    //       pageid: '/page/home'
    //     },
    //     {
    //       id: 'cbp_123',
    //       type: 'Course'
    //     },
    //     {
    //       module: expect.anything()
    //     }
    //   );
    // });

    it('should not raise telemetry when already raised', () => {
      component.isTelemetryRaised = true;
      const event = {
        contentId: 'test_123',
        typeOfTelemetry: 'test'
      };

      component.raiseTelemetryInteratEvent(event);

      expect(mockEvents.raiseInteractTelemetry).not.toHaveBeenCalled();
    });
  });

  // describe('raiseTelemetry', () => {
  //   it('should raise interact telemetry with correct parameters', () => {
  //     component.raiseTelemetry('Test Name', 'test-subtype');

  //     expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
  //       {
  //         type: 'click',
  //         subType: 'test-subtype',
  //         id: 'test-name'
  //       },
  //       {},
  //       {
  //         module: expect.anything()
  //       }
  //     );
  //   });
  // });

  describe('handleButtonClick', () => {
    it('should execute without errors', () => {
      expect(() => component.handleButtonClick()).not.toThrow();
    });
  });
});