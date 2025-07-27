import { HomeComponent } from './home.component';
import { of, throwError } from 'rxjs';

// Mock helper function
// function isStripActive(strip: any): boolean {
//   return !!(strip &&
//     strip.strips &&
//     Array.isArray(strip.strips) &&
//     strip.strips.length > 0 &&
//     strip.strips[0] &&
//     strip.strips[0].active === true);
// }

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

  const mockPageData = {
    data: {
      homeConfig: { config: 'test' },
      newHomeStrip: [
        { order: 2, strips: [{ active: true }], key: 'strip2' },
        { order: 1, strips: [{ active: false }], key: 'strip1' }
      ],
      clientList: { client1: 'test' },
      hubsData: { hub1: 'test' },
      enableLazyLoading: true,
      sliderData: { slides: [] }
    }
  };

  const mockUnMappedUser = {
    id: 'user123',
    rootOrgId: 'org123',
    profileDetails: {
      profileStatus: 'ACTIVE',
      employmentDetails: {
        departmentName: 'IT'
      },
      additionalProperties: {
        isProfileUpdatedMsgViewed: false
      }
    }
  };

  beforeEach(() => {
    // Mock services
    mockActivatedRoute = {
      snapshot: {
        data: {
          pageData: mockPageData
        }
      }
    };

    mockConfigSvc = {
      unMappedUser: mockUnMappedUser,
      overrideThemeChanges: { theme: 'dark' }
    };

    mockBtnSettingsSvc = {
      changeFont: jest.fn()
    };

    mockMobileAppsService = {
      mobileTopHeaderVisibilityStatus: of(true)
    };

    mockRouter = {
      navigateByUrl: jest.fn(),
      navigate: jest.fn()
    };

    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn((key: string) => key)
    };

    mockUserProfileService = {
      readOrgData: jest.fn(() => of({
        result: {
          response: {
            customfieldsdata: {
              isPopupEnabled: true,
              customFieldsCount: 1,
              customFieldIds: ['field1']
            }
          }
        }
      })),
      readCustomattributeDetails: jest.fn(() => of({
        result: {
          response: {
            customFieldValues: []
          }
        }
      })),
      listApprovalPendingFields: jest.fn(() => of({
        result: {
          data: []
        }
      })),
      fetchApprovedFields: jest.fn(() => of({
        result: {
          data: [{ name: 'John' }]
        }
      })),
      listRejectedFields: jest.fn(() => of({
        result: {
          data: [{ designation: 'Manager' }]
        }
      })),
      editProfileDetails: jest.fn(() => of({ success: true }))
    };

    mockMatSnackBar = {
      open: jest.fn(),
      openFromComponent: jest.fn()
    };

    mockEvents = {
      raiseInteractTelemetry: jest.fn()
    };

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

    // Mock DOM methods
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });

    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });

    // global.setInterval = jest.fn(() => 123);
    // global.clearInterval = jest.fn();

    // Mock document methods
    Object.defineProperty(document, 'getElementsByClassName', {
      value: jest.fn(() => [
        {
          getBoundingClientRect: () => ({
            top: 100,
            bottom: 200
          })
        }
      ]),
      configurable: true
    });

    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.widgetData).toEqual({});
      expect(component.sliderData).toEqual({});
      expect(component.contentStripData).toEqual({});
      expect(component.sectionList).toEqual([]);
      expect(component.enableLazyLoadingFlag).toBe(true);
      expect(component.canShowCustomAttrOpen).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('should initialize component with valid data', () => {
      component.ngOnInit();

      expect(component.homeConfig).toEqual(mockPageData.data.homeConfig);
      expect(component.contentStripData).toHaveLength(2);
      expect(component.contentStripData[0].order).toBe(1);
      expect(component.sectionList).toHaveLength(5); // 2 content strips + 3 fixed sections
    });

    it('should handle not-my-user profile status with igot org', () => {
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'not-my-user';
      mockConfigSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot';

      component.ngOnInit();

      expect(component.disableMenu).toBe(true);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me#profileInfo');
    });

    it('should handle profile update message not viewed', () => {
      component.ngOnInit();

      expect(mockUserProfileService.fetchApprovedFields).toHaveBeenCalled();
      expect(mockUserProfileService.listRejectedFields).toHaveBeenCalled();
    });

    it('should handle profile update message already viewed', () => {
      mockConfigSvc.unMappedUser.profileDetails.additionalProperties.isProfileUpdatedMsgViewed = true;
      
      component.ngOnInit();

      expect(component.isMDOMsgOpen).toBe(true);
    });

    it('should set up mobile header visibility subscription', () => {
      component.ngOnInit();

      expect(component.mobileTopHeaderVisibilityStatus).toBe(true);
    });

    it('should set up enrollment data interval', () => {
      component.ngOnInit();

      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    it('should handle website language from localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('es');

      component.ngOnInit();

      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockTranslate.use).toHaveBeenCalledWith('es');
    });

    it('should call getOrgDetails', () => {
      const spy = jest.spyOn(component, 'getOrgDetails');
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getOrgDetails', () => {
    it('should fetch organization details and show custom attributes popup', () => {
      const spy = jest.spyOn(component, 'readCustomattributeDetails');
      
      component.getOrgDetails();

      expect(mockUserProfileService.readOrgData).toHaveBeenCalledWith({
        request: { organisationId: 'org123' }
      });
      expect(spy).toHaveBeenCalled();
    });

    it('should not show custom attributes popup when disabled', () => {
      mockUserProfileService.readOrgData.mockReturnValue(of({
        result: {
          response: {
            customfieldsdata: {
              isPopupEnabled: false,
              customFieldsCount: 0,
              customFieldIds: []
            }
          }
        }
      }));

      component.getOrgDetails();

      expect(component.canShowCustomAttrOpen).toBe(false);
    });

    it('should handle error in fetching organization details', () => {
      mockUserProfileService.readOrgData.mockReturnValue(throwError({ error: 'test error' }));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component.getOrgDetails();

      expect(component.canShowCustomAttrOpen).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('readCustomattributeDetails', () => {
    it('should redirect to custom profile when no custom field values', () => {
      const spy = jest.spyOn(component, 'redirectToCustomProfile');

      component.readCustomattributeDetails();

      expect(mockUserProfileService.readCustomattributeDetails).toHaveBeenCalledWith('user123', 'org123');
      expect(spy).toHaveBeenCalled();
      expect(component.canShowCustomAttrOpen).toBe(true);
    });

    it('should not redirect when custom field values exist', () => {
      mockUserProfileService.readCustomattributeDetails.mockReturnValue(of({
        result: {
          response: {
            customFieldValues: [{ field: 'value' }]
          }
        }
      }));

      component.readCustomattributeDetails();

      expect(component.canShowCustomAttrOpen).toBe(false);
    });

    it('should handle error in reading custom attributes', () => {
      mockUserProfileService.readCustomattributeDetails.mockReturnValue(throwError({ error: 'test error' }));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      component.readCustomattributeDetails();

      expect(component.canShowCustomAttrOpen).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit', () => {
    it('should make initial content strips visible', () => {
      component.sectionList = [
        { section: 'section_0', isVisible: false },
        { section: 'section_1', isVisible: false },
        { section: 'slider', isVisible: false }
      ];

      component.ngAfterViewInit();

      expect(component.sectionList[0].isVisible).toBe(true);
      expect(component.sectionList[1].isVisible).toBe(true);
      expect(component.sectionList[2].isVisible).toBe(false);
    });
  });

  describe('getEnrollmentData', () => {
    it('should handle enrollment data and disable KP panel', () => {
      const enrollData = { enrolledCourseCount: 5 };
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(enrollData));

      component.getEnrollmentData();

      expect(component.enrollData).toEqual(enrollData);
      expect(component.isKPPanelenabled).toBe(false);
      expect(clearInterval).toHaveBeenCalled();
    });

    it('should enable KP panel when no enrolled courses', () => {
      const enrollData = { enrolledCourseCount: 0 };
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(enrollData));

      component.getEnrollmentData();

      expect(component.isKPPanelenabled).toBe(true);
    });

    it('should handle null enrollment data', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      component.getEnrollmentData();

      expect(component.enrollData).toBeNull();
    });
  });

  describe('handleButtonClick', () => {
    it('should execute without errors', () => {
      expect(() => component.handleButtonClick()).not.toThrow();
    });
  });

  describe('translateHub', () => {
    it('should translate hub name', () => {
      const result = component.translateHub('testHub');

      expect(mockTranslate.instant).toHaveBeenCalledWith('testHub');
      expect(result).toBe('testHub');
    });
  });

  describe('getListPendingApproval', () => {
    it('should fetch pending approval list successfully', () => {
      const spy = jest.spyOn(component, 'handleUpdateMobileNudge');

      component.getListPendingApproval();

      expect(mockUserProfileService.listApprovalPendingFields).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });

    it('should handle error in fetching pending approval list', () => {
      mockUserProfileService.listApprovalPendingFields.mockReturnValue(
        throwError({ ok: false, error: { text: 'Error message' } })
      );

      component.getListPendingApproval();

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to fetch pending approval list');
    });

    it('should not call handleUpdateMobileNudge when pending list exists', () => {
      mockUserProfileService.listApprovalPendingFields.mockReturnValue(of({
        result: { data: [{ field: 'test' }] }
      }));
      const spy = jest.spyOn(component, 'handleUpdateMobileNudge');

      component.getListPendingApproval();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('handleUpdateMobileNudge', () => {
    it('should open nudge when profile not verified and popup not hidden', () => {
      (sessionStorage.getItem as jest.Mock).mockReturnValue(null);

      component.handleUpdateMobileNudge();

      expect(component.isNudgeOpen).toBe(true);
    });

    it('should not open nudge when profile is verified', () => {
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'VERIFIED';

      component.handleUpdateMobileNudge();

      expect(component.isNudgeOpen).toBe(false);
    });

    it('should open nudge when no profile details', () => {
      mockConfigSvc.unMappedUser.profileDetails = null;

      component.handleUpdateMobileNudge();

      expect(component.isNudgeOpen).toBe(true);
    });
  });

  describe('handleDefaultFontSetting', () => {
    it('should apply font setting from localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('large-font');

      component.handleDefaultFontSetting();

      expect(mockBtnSettingsSvc.changeFont).toHaveBeenCalledWith('large-font');
    });
  });

  describe('scrollHandler', () => {
    it('should check visibility for non-visible sections', () => {
      component.sectionList = [
        { section: 'section_0', isVisible: true },
        { section: 'section_5', isVisible: false }
      ];
      const spy = jest.spyOn(component, 'checkSectionVisibility');

      component.scrollHandler();

      expect(spy).toHaveBeenCalledWith('section_5');
    });
  });

  describe('checkSectionVisibility', () => {
    it('should skip initial visible sections', () => {
      component.checkSectionVisibility('section_0');
      // Should not throw or modify anything
      expect(true).toBe(true);
    });

    it('should make section visible when in viewport', () => {
      component.sectionList = [
        { section: 'section_5', isVisible: false }
      ];

      component.checkSectionVisibility('section_5');

      expect(component.sectionList[0].isVisible).toBe(true);
    });

    it('should handle non-existent sections', () => {
      component.checkSectionVisibility('non-existent');
      // Should not throw
      expect(true).toBe(true);
    });

    it('should handle sections not in DOM', () => {
      (document.getElementsByClassName as jest.Mock).mockReturnValue([]);

      component.checkSectionVisibility('section_5');
      // Should not throw
      expect(true).toBe(true);
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
    it('should handle MDO message status and navigate to profile', () => {
      const spy = jest.spyOn(component, 'handleMDOMsgstatus');

      component.fetchProfile();

      expect(spy).toHaveBeenCalled();
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

    it('should handle error in updating profile details', () => {
      mockUserProfileService.editProfileDetails.mockReturnValue(
        throwError({ ok: false, error: { text: 'Error message' } })
      );

      component.handleMDOMsgstatus();

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Error message');
    });
  });

  describe('getApprovedStatus', () => {
    it('should set approved status to true when valid fields exist', () => {
      component.getApprovedStatus();

      expect(component.approvedStatus).toBe(true);
      expect(component.approvedStatusList).toEqual([{ name: 'John' }]);
    });

    it('should set approved status to false when no valid fields', () => {
      mockUserProfileService.fetchApprovedFields.mockReturnValue(of({
        result: { data: [{ invalidField: 'test' }] }
      }));

      component.getApprovedStatus();

      expect(component.approvedStatus).toBe(false);
    });

    it('should handle empty approved status list', () => {
      mockUserProfileService.fetchApprovedFields.mockReturnValue(of({
        result: { data: [] }
      }));

      component.getApprovedStatus();

      expect(component.approvedStatus).toBe(false);
    });

    it('should handle error in fetching approved fields', () => {
      mockUserProfileService.fetchApprovedFields.mockReturnValue(
        throwError({ ok: false, error: { text: 'Error message' } })
      );

      component.getApprovedStatus();

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Error message');
    });
  });

  describe('getRejectedStatus', () => {
    it('should set rejected status to true when valid fields exist', () => {
      component.getRejectedStatus();

      expect(component.rejectedStatus).toBe(true);
      expect(component.rejectedStatusList).toEqual([{ designation: 'Manager' }]);
    });

    it('should set rejected status to false when no valid fields', () => {
      mockUserProfileService.listRejectedFields.mockReturnValue(of({
        result: { data: [{ invalidField: 'test' }] }
      }));

      component.getRejectedStatus();

      expect(component.rejectedStatus).toBe(false);
    });

    it('should handle error in fetching rejected fields', () => {
      mockUserProfileService.listRejectedFields.mockReturnValue(
        throwError({ ok: false, error: { text: 'Error message' } })
      );

      component.getRejectedStatus();

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Error message');
    });
  });

  describe('raiseTelemetryInteratEvent', () => {
    it('should raise telemetry for view more URL', () => {
      const event = {
        viewMoreUrl: { viewMoreText: 'View More' },
        stripTitle: 'Test Strip',
        typeOfTelemetry: 'test'
      };
      const spy = jest.spyOn(component, 'raiseTelemetry');

      component.raiseTelemetryInteratEvent(event);

      expect(spy).toHaveBeenCalledWith('Test Strip View More', 'test');
    });

    it('should raise telemetry for external content', () => {
      const event = {
        contentId: 'ext123',
        typeOfTelemetry: 'external',
        identifier: 'ext123'
      };

      component.raiseTelemetryInteratEvent(event);

      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'external',
          id: 'card-content'
        },
        {
          id: 'ext123',
          type: 'External content'
        },
        {
          module: expect.any(Object)
        }
      );
      expect(component.isTelemetryRaised).toBe(true);
    });

    it('should raise telemetry for MDO channel', () => {
      const event = {
        typeOfTelemetry: 'mdoChannel',
        identifier: 'mdo123',
        title: 'Test Title'
      };

      component.raiseTelemetryInteratEvent(event);

      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({
          subType: 'mdo-channel'
        }),
        {
          id: 'mdo123',
          type: 'org/ministry'
        },
        expect.any(Object)
      );
    });

    it('should raise telemetry for CBP plan with selected tab and pill', () => {
      const event = {
        typeOfTelemetry: 'cbpPlan',
        identifier: 'cbp123',
        primaryCategory: 'Course',
        selectedTab: 'tab1',
        selectedPill: 'pill1',
        sakshamAIGenerated: false
      };

      component.raiseTelemetryInteratEvent(event);

      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({
          subType: 'tab1-pill1'
        }),
        {
          id: 'cbp123',
          type: 'Course'
        },
        expect.any(Object)
      );
    });

    it('should raise telemetry for AI generated CBP plan', () => {
      const event = {
        typeOfTelemetry: 'cbpPlan',
        identifier: 'cbp123',
        primaryCategory: 'Course',
        sakshamAIGenerated: true
      };

      component.raiseTelemetryInteratEvent(event);

      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({
          subType: 'igot-ai'
        }),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should raise telemetry for providers', () => {
      const event = {
        typeOfTelemetry: 'providers',
        orgId: 'org123'
      };

      component.raiseTelemetryInteratEvent(event);

      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({
          subType: 'training-institutions'
        }),
        {
          id: 'org123',
          type: 'org'
        },
        expect.any(Object)
      );
    });

    it('should not raise telemetry when already raised', () => {
      component.isTelemetryRaised = true;
      const event = { contentId: 'test123', typeOfTelemetry: 'test' };

      component.raiseTelemetryInteratEvent(event);

      expect(mockEvents.raiseInteractTelemetry).not.toHaveBeenCalled();
    });
  });

  describe('raiseTelemetry', () => {
    it('should raise interact telemetry with correct parameters', () => {
      component.raiseTelemetry('Test Name', 'test-subtype');

      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'test-subtype',
          id: 'test-name'
        },
        {},
        {
          module: expect.any(Object)
        }
      );
    });
  });

  describe('redirectToCustomProfile', () => {
    it('should navigate to custom profile', () => {
      component.redirectToCustomProfile();

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/person-profile/me'],
        { fragment: 'orgDetails' }
      );
    });
  });
});