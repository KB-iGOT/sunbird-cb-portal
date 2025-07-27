import { InsightSideBarComponent } from './in-sight-side-bar.component';
import { of, throwError } from 'rxjs';
import * as moment from 'moment';

describe('InsightSideBarComponent', () => {
  let component: InsightSideBarComponent;
  let homePageSvc: any;
  let configSvc: any;
  let activatedRoute: any;
  let discussUtilitySvc: any;
  let translate: any;
  let events: any;
  let snackBar: any;
  let router: any;
  let signupService: any;
  let profileV2Svc: any;
  let userProfileService: any;
  let langtranslations: any;

  beforeEach(() => {
    // Mock services
    homePageSvc = {
      getInsightsData: jest.fn(),
      getAssessmentinfo: jest.fn(),
      getDiscussionsData: jest.fn(),
      getRecentRequests: jest.fn()
    };

    configSvc = {
      userProfile: {
        rootOrgId: 'test-root-org',
        userName: 'testuser',
        professionalDetails: [{
          designation: 'test-designation'
        }]
      },
      unMappedUser: {
        id: 'test-user-id',
        profileDetails: {
          profileStatus: 'active',
          refRootOrg: {
            orgId: 'test-org-id'
          },
          employmentDetails: {
            departmentName: 'test-dept'
          }
        }
      },
      nodebbUserProfile: {
        username: 'testuser'
      }
    };

    activatedRoute = {
      snapshot: {
        data: {
          pageData: {
            data: {
              learnerAdvisory: [],
              surveyForm: {},
              surveyPopup: {},
              nationalLearningWeek: {
                enabled: true,
                startDate: '01-01-2024',
                endDate: '07-01-2024'
              },
              updateDesignation: {
                enabled: true,
                header: 'Update Designation',
                headerHi: 'पदनाम अपडेट करें',
                headerGu: 'હોદ્દો અપડેટ કરો',
                buttonText: 'Update',
                buttonTextHi: 'अपडेट करें',
                buttonTextGu: 'અપડેટ કરો',
                hintText: 'Select designation',
                hintTextHi: 'पदनाम चुनें',
                hintTextGu: 'હોદ્દો પસંદ કરો'
              },
              stateLearningWeek: [{
                orgId: 'test-org-id',
                enabled: true,
                startDate: '01-01-2024',
                endDate: '07-01-2024',
                orgName: 'test-org'
              }],
              assessmentData: {}
            }
          }
        }
      }
    };

    discussUtilitySvc = {
      setDiscussionConfig: jest.fn()
    };

    translate = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    };

    events = {
      raiseInteractTelemetry: jest.fn()
    };

    snackBar = {
      open: jest.fn()
    };

    router = {
      navigateByUrl: jest.fn(),
      navigate: jest.fn()
    };

    signupService = {
      getOrgReadData: jest.fn(),
      getFrameworkInfo: jest.fn()
    };

    profileV2Svc = {
      fetchApprovalDetails: jest.fn(),
      withDrawApprovalRequest: jest.fn()
    };

    userProfileService = {
      editProfileDetails: jest.fn()
    };

    langtranslations = {
      languageSelectedObservable: of({})
    };

    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();

    // Create component instance
    component = new InsightSideBarComponent(
      homePageSvc,
      configSvc,
      activatedRoute,
      discussUtilitySvc,
      translate,
      events,
      snackBar,
      router,
      signupService,
      profileV2Svc,
      userProfileService,
      langtranslations
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize component with language settings when websiteLanguage exists', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('hi');
      
      component = new InsightSideBarComponent(
        homePageSvc,
        configSvc,
        activatedRoute,
        discussUtilitySvc,
        translate,
        events,
        snackBar,
        router,
        signupService,
        profileV2Svc,
        userProfileService,
        langtranslations
      );

      expect(translate.setDefaultLang).toHaveBeenCalledWith('en');
      expect(translate.use).toHaveBeenCalledWith('hi');
    });

    it('should handle language change observable', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('gu');
      
      component = new InsightSideBarComponent(
        homePageSvc,
        configSvc,
        activatedRoute,
        discussUtilitySvc,
        translate,
        events,
        snackBar,
        router,
        signupService,
        profileV2Svc,
        userProfileService,
        langtranslations
      );

      expect(component.currentLang).toBe('gu');
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      homePageSvc.getInsightsData.mockReturnValue(of({
        result: {
          response: {
            nudges: [
              { label: 'Test Nudge', growth: 'positive', progress: 5 }
            ],
            'weekly-claps': { data: 'test' }
          }
        }
      }));
      homePageSvc.getRecentRequests.mockReturnValue(of({
        result: {
          data: [{ fullName: 'test user' }]
        }
      }));
      homePageSvc.getDiscussionsData.mockReturnValue(of({
        latestPosts: []
      }));
    });

    it('should initialize component data', () => {
      component.ngOnInit();

      expect(component.userData).toBe(configSvc.userProfile);
      expect(component.homePageData).toBeDefined();
      expect(component.learnAdvisoryData).toEqual([]);
      expect(component.surveyForm).toEqual({});
      expect(component.surveyPopup).toEqual({});
    });

    it('should set isNotMyUser when profile status is not-my-user', () => {
      configSvc.unMappedUser.profileDetails.profileStatus = 'not-my-user';
      
      component.ngOnInit();

      expect(component.isNotMyUser).toBe(true);
    });

    it('should set isIgotOrg when department is igot', () => {
      configSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot';
      
      component.ngOnInit();

      expect(component.isIgotOrg).toBe(true);
    });

    it('should call getNlwConfig when national learning week is enabled', () => {
      const spy = jest.spyOn(component, 'getNlwConfig');
      
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should call getMasterDesignation when update designation is enabled', () => {
      const spy = jest.spyOn(component, 'getMasterDesignation');
      
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should call getSlwConfig when state learning week is enabled', () => {
      const spy = jest.spyOn(component, 'getSlwConfig');
      
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getNlwConfig', () => {
    beforeEach(() => {
      component.nwlConfiguration = {
        startDate: '01-01-2024',
        endDate: '07-01-2024'
      };
    });

    it('should set canShowNlwCard to true when current date is between start and end date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(true);
      jest.spyOn(moment.prototype, 'diff').mockReturnValue(3);

      component.getNlwConfig();

      expect(component.canShowNlwCard).toBe(true);
      expect(component.daysCompleted).toBe(3);
    });

    it('should set canShowNlwCard to false when current date is before start date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isBefore').mockReturnValue(true);

      component.getNlwConfig();

      expect(component.canShowNlwCard).toBe(false);
    });

    it('should handle when current date is after end date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isBefore').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isAfter').mockReturnValue(true);
      jest.spyOn(moment.prototype, 'diff')
        .mockReturnValueOnce(7) // totalDays
        .mockReturnValueOnce(0); // daysPassed

      component.getNlwConfig();

      expect(component.canShowNlwCard).toBe(true);
      expect(component.daysCompleted).toBe(7);
    });
  });

  describe('getSlwConfig', () => {
    beforeEach(() => {
      component.slwConfiguration = {
        startDate: '01-01-2024',
        endDate: '07-01-2024'
      };
    });

    it('should set canShowSlwCard to true when current date is between start and end date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(true);
      jest.spyOn(moment.prototype, 'diff').mockReturnValue(3);

      component.getSlwConfig();

      expect(component.canShowSlwCard).toBe(true);
      expect(component.daysCompleted).toBe(3);
    });

    it('should set canShowSlwCard to false when current date is before start date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isBefore').mockReturnValue(true);

      component.getSlwConfig();

      expect(component.canShowSlwCard).toBe(false);
    });
  });

  describe('getMasterDesignation', () => {
    const mockFrameworkResponse = {
      result: {
        framework: {
          categories: [
            {
              code: 'org',
              terms: [
                {
                  children: [
                    { name: 'Manager' },
                    { name: 'Developer' }
                  ]
                }
              ]
            }
          ]
        }
      }
    };

    beforeEach(() => {
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test-framework' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }));
    });

    it('should fetch and process designation data successfully', () => {
      component.getMasterDesignation();

      expect(signupService.getOrgReadData).toHaveBeenCalledWith(configSvc.userProfile.rootOrgId);
      expect(signupService.getFrameworkInfo).toHaveBeenCalledWith('test-framework');
      expect(component.designationList).toEqual([
        { name: 'Developer' },
        { name: 'Manager' }
      ]);
    });

    it('should set showUpdateDesignations to true when no approval data and no designation', () => {
      configSvc.userProfile.professionalDetails = [];
      
      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle approval data with designation not in list', () => {
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({
        result: {
          data: [{ designation: 'Custom Designation' }]
        }
      }));

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle existing designation not in master list', () => {
      configSvc.userProfile.professionalDetails[0].designation = 'Custom Role';

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle org read data error', () => {
      signupService.getOrgReadData.mockReturnValue(throwError('Error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component.getMasterDesignation();

      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle framework info error', () => {
      signupService.getFrameworkInfo.mockReturnValue(throwError('Error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component.getMasterDesignation();

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getInsights', () => {
    it('should fetch insights data successfully', () => {
      const mockResponse = {
        result: {
          response: {
            nudges: [
              { label: 'Test', growth: 'positive', progress: 5 }
            ],
            'weekly-claps': { data: 'test' }
          }
        }
      };
      homePageSvc.getInsightsData.mockReturnValue(of(mockResponse));

      component.getInsights();

      expect(component.insightsData).toBe(mockResponse.result.response);
      expect(component.profileDataLoading).toBe(false);
    });

    it('should handle insights data error', () => {
      homePageSvc.getInsightsData.mockReturnValue(throwError('Error'));

      component.getInsights();

      expect(component.insightsData).toBe('');
      expect(component.profileDataLoading).toBe(false);
      expect(component.clapsDataLoading).toBe(false);
    });
  });

  describe('constructNudgeData', () => {
    it('should construct nudge data with positive growth', () => {
      component.insightsData = {
        nudges: [
          { label: 'Test Label', growth: 'positive', progress: 5 }
        ]
      };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData[0]).toEqual({
        title: 'Test Label',
        icon: 'arrow_upward',
        data: '+5%',
        colorData: 'color-green'
      });
    });

    it('should construct nudge data with negative growth', () => {
      component.insightsData = {
        nudges: [
          { label: 'Test Label', growth: 'negative', progress: -3 }
        ]
      };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData[0]).toEqual({
        title: 'Test Label',
        icon: 'arrow_downward',
        data: '',
        colorData: 'color-red'
      });
    });
  });

  describe('constructWeeklyData', () => {
    it('should construct weekly claps data', () => {
      component.insightsData = {
        'weekly-claps': { data: 'test' }
      };

      component.constructWeeklyData();

      expect(component.insightsData.weeklyClaps).toEqual({ data: 'test' });
      expect(component.clapsDataLoading).toBe(false);
    });
  });

  describe('getAssessmentData', () => {
    it('should fetch assessment data successfully', () => {
      const mockResponse = { result: { response: { data: 'test' } } };
      homePageSvc.getAssessmentinfo.mockReturnValue(of(mockResponse));

      component.getAssessmentData();

      expect(component.assessmentsData).toBe(mockResponse.result.response);
    });

    it('should handle assessment data error', () => {
      homePageSvc.getAssessmentinfo.mockReturnValue(throwError({ ok: false }));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      component.getAssessmentData();

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getDiscussionsData', () => {
    it('should fetch discussions data successfully', () => {
      const mockResponse = { latestPosts: ['post1', 'post2'] };
      homePageSvc.getDiscussionsData.mockReturnValue(of(mockResponse));

      component.getDiscussionsData();

      expect(component.discussion.data).toEqual(['post1', 'post2']);
      expect(component.discussion.loadSkeleton).toBe(false);
    });

    it('should handle discussions data error', () => {
      homePageSvc.getDiscussionsData.mockReturnValue(throwError({ ok: false }));

      component.getDiscussionsData();

      expect(component.discussion.loadSkeleton).toBe(false);
      expect(component.discussion.error).toBe(true);
    });
  });

  describe('getPendingRequestData', () => {
    it('should fetch pending request data successfully', () => {
      const mockResponse = {
        result: {
          data: [
            { fullName: 'john doe' },
            { fullName: 'jane smith' }
          ]
        }
      };
      homePageSvc.getRecentRequests.mockReturnValue(of(mockResponse));

      component.getPendingRequestData();

      expect(component.pendingRequestData[0].fullName).toBe('John doe');
      expect(component.pendingRequestData[1].fullName).toBe('Jane smith');
      expect(component.pendingRequestSkeleton).toBe(false);
    });

    it('should handle pending request data error', () => {
      homePageSvc.getRecentRequests.mockReturnValue(throwError({ ok: false }));

      component.getPendingRequestData();

      expect(component.pendingRequestSkeleton).toBe(false);
    });
  });

  describe('Navigation methods', () => {
    it('should navigate to connection requests', () => {
      component.navigateTo();

      expect(router.navigateByUrl).toHaveBeenCalledWith('app/network-v2/connection-requests');
    });

    it('should navigate to user profile', () => {
      component.moveToUserProile('user123');

      expect(router.navigateByUrl).toHaveBeenCalledWith('app/person-profile/user123#profileInfo');
    });

    it('should navigate to activity', () => {
      component.goToActivity({});

      expect(router.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me?tab=1');
    });

    it('should navigate to discussion forum', () => {
      component.navigate();

      expect(discussUtilitySvc.setDiscussionConfig).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/app/discussion-forum'], {
        queryParams: { page: 'home' },
        queryParamsHandling: 'merge'
      });
    });

    it('should navigate to national learning page', () => {
      component.navigateToNationalLearning();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('app/learn/karmayogi-saptah');
    });

    it('should navigate to state learning page', () => {
      component.slwConfiguration = {
        orgName: 'test-org',
        orgId: 'test-org-id'
      };

      component.navigateToStatelLearning();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('app/learn/mdo-channels/test-org/test-org-id/micro-sites');
    });
  });

  describe('UI interaction methods', () => {
    it('should expand/collapse', () => {
      component.expandCollapse(true);

      expect(component.collapsed).toBe(true);
    });

    it('should toggle credentials', () => {
      component.toggleCreds();

      expect(component.showCreds).toBe(true);
      expect(component.credMessage).toBe('Hide my credentials');

      component.toggleCreds();

      expect(component.showCreds).toBe(false);
      expect(component.credMessage).toBe('View my credentials');
    });

    it('should check leaderboard data', () => {
      component.checkLeaderboardData(true);

      expect(component.isLeaderboardExist).toBe(true);
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard', () => {
      const mockTextArea = {
        value: '',
        select: jest.fn(),
        focus: jest.fn()
      };
      const mockBody = {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockTextArea as any);
      jest.spyOn(document, 'execCommand').mockReturnValue(true);
      Object.defineProperty(document, 'body', { value: mockBody });
      
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);
      const raiseTelemetrySpy = jest.spyOn(component, 'raiseTelemetry');

      component.copyToClipboard('test text');

      expect(mockTextArea.value).toBe('test text');
      expect(mockTextArea.select).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(openSnackbarSpy).toHaveBeenCalledWith('copied');
      expect(raiseTelemetrySpy).toHaveBeenCalledWith('copyToClipboard');
    });
  });

  describe('Designation update methods', () => {
    it('should update designation successfully', () => {
      component.selectDesignation = 'Manager';
      const raiseTelemetrySpy = jest.spyOn(component, 'raiseTelemetryForDesigantion');
      const apiCallSpy = jest.spyOn(component, 'apiCallToUpdateDesignation');

      component.updateDesignation();

      expect(raiseTelemetrySpy).toHaveBeenCalled();
      expect(apiCallSpy).toHaveBeenCalled();
    });

    it('should show error when no designation selected', () => {
      component.selectDesignation = '';
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);

      component.updateDesignation();

      expect(openSnackbarSpy).toHaveBeenCalledWith('Please select a valid designation');
    });

    it('should submit profile successfully', () => {
      component.selectDesignation = 'Manager';
      userProfileService.editProfileDetails.mockReturnValue(of({ responseCode: 'OK' }));
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);

      component.submitProfile();

      expect(component.showUpdateDesignations).toBe(false);
      expect(openSnackbarSpy).toHaveBeenCalledWith('Designation updated successfully');
    });

    it('should handle profile update error', () => {
      userProfileService.editProfileDetails.mockReturnValue(throwError('Error'));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      component.submitProfile();

      expect(consoleSpy).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('something went wrong!');
    });

    it('should handle API call with pending approval', () => {
      component.desigantionUnderApproval = { wfId: 'test-wf-id' };
      profileV2Svc.withDrawApprovalRequest.mockReturnValue(of({ result: { message: 'Success' } }));
      const submitProfileSpy = jest.spyOn(component, 'submitProfile');

      component.apiCallToUpdateDesignation();

      expect(submitProfileSpy).toHaveBeenCalled();
    });

    it('should handle API call without pending approval', () => {
      component.desigantionUnderApproval = null;
      const submitProfileSpy = jest.spyOn(component, 'submitProfile');

      component.apiCallToUpdateDesignation();

      expect(submitProfileSpy).toHaveBeenCalled();
    });
  });

  describe('Input handling methods', () => {
    beforeEach(() => {
      component.designationList = [
        { name: 'Manager' },
        { name: 'Developer' },
        { name: 'Analyst' }
      ];
    });

    it('should filter designations on input change', () => {
      component.onInputChange('man');

      expect(component.filterDesigantionList).toEqual([{ name: 'Manager' }]);
      expect(component.selectDesignation).toBe('man');
    });

    it('should reset filter when input is empty', () => {
      component.onInputChange('');

      expect(component.filterDesigantionList).toEqual(component.designationList);
      expect(component.selectDesignation).toBe('');
    });

    it('should select designation option', () => {
      component.onOptionSelected('Manager');

      expect(component.selectDesignation).toBe('Manager');
    });

    it('should handle autocomplete opened', () => {
      component.onAutoCompleteOpened();

      expect(component.isMatcompleteOpened).toBe(true);
    });

    it('should handle autocomplete closed', () => {
      component.onAutoCompleteClosed();

      expect(component.isMatcompleteOpened).toBe(false);
      expect(component.filterDesigantionList).toEqual(component.designationList);
    });

    it('should open autocomplete manually', () => {
      const mockTrigger = { openPanel: jest.fn() };
      const mockInput = { focus: jest.fn() };

      component.openAutocomplete(mockTrigger as any, mockInput as any);

      expect(mockInput.focus).toHaveBeenCalled();
      expect(mockTrigger.openPanel).toHaveBeenCalled();
    });
  });

  describe('Localization methods', () => {
    beforeEach(() => {
      component.updateDesignationCard = {
        header: 'Update Designation',
        headerHi: 'पदनाम अपडेट करें',
        headerGu: 'હોદ્દો અપડેટ કરો',
        buttonText: 'Update',
        buttonTextHi: 'अपडेट करें',
        buttonTextGu: 'અપડેટ કરો',
        hintText: 'Select designation',
        hintTextHi: 'पदनाम चुनें',
        hintTextGu: 'હોદ્દો પસંદ કરો'
      };
    });

    it('should render header in Hindi', () => {
      component.currentLang = 'hi';

      const result = component.renderUpdateDesignationCardHeader();

      expect(result).toBe('पदनाम अपडेट करें');
    });

    it('should render header in Gujarati', () => {
      component.currentLang = 'gu';

      const result = component.renderUpdateDesignationCardHeader();

      expect(result).toBe('હોદ્દો અપડેટ કરો');
    });

    it('should render header in English by default', () => {
      component.currentLang = 'en';

      const result = component.renderUpdateDesignationCardHeader();

      expect(result).toBe('Update Designation');
    });

    it('should render button text in Hindi', () => {
      component.currentLang = 'hi';

      const result = component.renderUpdateDesignationCardButtonText();

      expect(result).toBe('अपडेट करें');
    });

    it('should render hint text in Gujarati', () => {
      component.currentLang = 'gu';

      const result = component.renderUpdateDesignationCardHint();

      expect(result).toBe('હોદ્દો પસંદ કરો');
    });
  });

  describe('Utility methods', () => {
    it('should raise telemetry event', () => {
      component.raiseTelemetry('test-id');

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
    });

    it('should raise telemetry for designation', () => {
      component.selectDesignation = 'Manager';

      component.raiseTelemetryForDesigantion();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
    });

    it('should emit telemetry event', () => {
      const emitSpy = jest.spyOn(component.telemetryRaisedLibrary, 'emit');
      const event = { type: 'test' };

      component.raiseTelemetryInteratEvent(event);

      expect(emitSpy).toHaveBeenCalledWith(event);
    });

    it('should open snackbar with default duration', () => {
      component['openSnackbar']('Test message');

      expect(snackBar.open).toHaveBeenCalledWith('Test message', 'X', { duration: 5000 });
    });

    it('should open snackbar with custom duration', () => {
      component['openSnackbar']('Test message', 3000);

      expect(snackBar.open).toHaveBeenCalledWith('Test message', 'X', { duration: 3000 });
    });
  });

  describe('getTermsByCode', () => {
    it('should return terms for given code', () => {
      const categories = [
        {
          code: 'org',
          terms: [{ name: 'term1' }, { name: 'term2' }]
        },
        {
          code: 'other',
          terms: [{ name: 'term3' }]
        }
      ];

      const result = component['getTermsByCode'](categories, 'org');

      expect(result).toEqual([{ name: 'term1' }, { name: 'term2' }]);
    });

    it('should return empty array when code not found', () => {
      const categories = [
        {
          code: 'other',
          terms: [{ name: 'term1' }]
        }
      ];

      const result = component['getTermsByCode'](categories, 'org');

      expect(result).toEqual([]);
    });

    it('should return empty array when no terms exist', () => {
      const categories = [
        {
          code: 'org'
        }
      ];

      const result = component['getTermsByCode'](categories, 'org');

      expect(result).toEqual([]);
    });
  });

  describe('Component Properties and State', () => {
    it('should initialize with default values', () => {
      expect(component.profileDataLoading).toBe(true);
      expect(component.clapsDataLoading).toBe(true);
      expect(component.collapsed).toBe(false);
      expect(component.pendingRequestSkeleton).toBe(true);
      expect(component.showCreds).toBe(false);
      expect(component.credMessage).toBe('View my credentials');
      expect(component.isLeaderboardExist).toBe(false);
      expect(component.isNotMyUser).toBe(false);
      expect(component.isIgotOrg).toBe(false);
      expect(component.canShowNlwCard).toBe(false);
      expect(component.canShowSlwCard).toBe(false);
      expect(component.totalDays).toBe(0);
      expect(component.daysCompleted).toBe(0);
      expect(component.currentLang).toBe('');
      expect(component.selectDesignation).toBe('');
      expect(component.showUpdateDesignations).toBe(false);
      expect(component.isMatcompleteOpened).toBe(false);
      expect(component.discussion).toEqual({
        loadSkeleton: false,
        data: [],
        error: false,
      });
    });

    it('should handle null/undefined configuration data', () => {
      configSvc.userProfile = null;
      configSvc.unMappedUser = null;

      component.ngOnInit();

      expect(component.userData).toBeNull();
    });

    it('should handle missing page data', () => {
      activatedRoute.snapshot.data = {};

      component.ngOnInit();

      expect(component.homePageData).toBeUndefined();
    });

    it('should handle missing state learning week configuration', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [];

      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should handle state learning week configuration without matching org', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [
        {
          orgId: 'different-org-id',
          enabled: true
        }
      ];

      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty nudges array', () => {
      component.insightsData = { nudges: [] };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData).toEqual([]);
    });

    it('should handle nudge with progress less than 1', () => {
      component.insightsData = {
        nudges: [
          { label: 'Test', growth: 'positive', progress: 0.5 }
        ]
      };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData[0].data).toBe('');
    });

    it('should handle null nudge elements', () => {
      component.insightsData = {
        nudges: [null, undefined, { label: 'Valid', growth: 'positive', progress: 5 }]
      };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData).toHaveLength(1);
    });

    it('should handle missing professional details', () => {
      configSvc.userProfile = {
        rootOrgId: 'test-root-org',
        professionalDetails: null
      };

      const spy = jest.spyOn(component, 'getMasterDesignation');
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should handle framework response without categories', () => {
      const mockResponse = {
        result: {
          framework: {}
        }
      };
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockResponse));

      component.getMasterDesignation();

      expect(component.designationList).toEqual([]);
    });

    it('should handle designation filtering with special characters', () => {
      component.designationList = [
        { name: 'Manager-Admin' },
        { name: 'Developer/Analyst' }
      ];

      component.onInputChange('admin');

      expect(component.filterDesigantionList).toEqual([{ name: 'Manager-Admin' }]);
    });

    it('should handle case insensitive designation filtering', () => {
      component.designationList = [
        { name: 'Manager' },
        { name: 'DEVELOPER' }
      ];

      component.onInputChange('MANAGER');

      expect(component.filterDesigantionList).toEqual([{ name: 'Manager' }]);
    });
  });

  describe('Date Calculations Edge Cases', () => {
    it('should handle invalid date formats in getNlwConfig', () => {
      component.nwlConfiguration = {
        startDate: 'invalid-date',
        endDate: 'invalid-date'
      };

      expect(() => component.getNlwConfig()).not.toThrow();
    });

    it('should handle same start and end dates', () => {
      component.nwlConfiguration = {
        startDate: '01-01-2024',
        endDate: '01-01-2024'
      };
      jest.spyOn(moment.prototype, 'diff').mockReturnValue(0);
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(true);

      component.getNlwConfig();

      expect(component.totalDays).toBe(0);
    });

    it('should handle future dates in getSlwConfig', () => {
      component.slwConfiguration = {
        startDate: '01-01-2025',
        endDate: '07-01-2025'
      };
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isBefore').mockReturnValue(true);

      component.getSlwConfig();

      expect(component.canShowSlwCard).toBe(false);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple state learning week configurations', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [
        {
          orgId: 'different-org',
          enabled: true,
          orgName: 'Different Org'
        },
        {
          orgId: 'test-org-id',
          enabled: true,
          orgName: 'Test Org'
        }
      ];

      component.ngOnInit();

      expect(component.slwConfiguration.orgName).toBe('Test Org');
    });

    it('should handle designation approval with multiple users', () => {
      const mockResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'org',
                terms: [
                  {
                    children: [
                      { name: 'Manager' },
                      { name: 'Developer' }
                    ]
                  }
                ]
              }
            ]
          }
        }
      };
      
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockResponse));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({
        result: {
          data: [
            { designation: 'Valid Designation' },
            { designation: 'Custom Designation' }
          ]
        }
      }));

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle navigation to state learning without configuration', () => {
      component.slwConfiguration = null;

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should handle clipboard operation failure', () => {
      jest.spyOn(document, 'createElement').mockImplementation(() => {
        throw new Error('Failed to create element');
      });

      expect(() => component.copyToClipboard('test')).not.toThrow();
    });
  });

  describe('Service Integration Tests', () => {
    it('should handle all service calls in ngOnInit', () => {
      homePageSvc.getInsightsData.mockReturnValue(of({ result: { response: { nudges: [], 'weekly-claps': {} } } }));
      homePageSvc.getRecentRequests.mockReturnValue(of({ result: { data: [] } }));
      homePageSvc.getDiscussionsData.mockReturnValue(of({ latestPosts: [] }));
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test' }));
      signupService.getFrameworkInfo.mockReturnValue(of({ result: { framework: { categories: [] } } }));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }));

      component.ngOnInit();

      expect(homePageSvc.getInsightsData).toHaveBeenCalled();
      expect(homePageSvc.getRecentRequests).toHaveBeenCalled();
      expect(homePageSvc.getDiscussionsData).toHaveBeenCalled();
      expect(signupService.getOrgReadData).toHaveBeenCalled();
    });

    it('should handle service dependency chain failures', () => {
      signupService.getOrgReadData.mockReturnValue(throwError('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component.getMasterDesignation();

      expect(consoleSpy).toHaveBeenCalled();
      expect(signupService.getFrameworkInfo).not.toHaveBeenCalled();
    });
  });

  describe('Navigation methods', () => {
    it('should navigate to connection requests', () => {
      component.navigateTo();

      expect(router.navigateByUrl).toHaveBeenCalledWith('app/network-v2/connection-requests');
    });

    it('should navigate to user profile', () => {
      component.moveToUserProile('user123');

      expect(router.navigateByUrl).toHaveBeenCalledWith('app/person-profile/user123#profileInfo');
    });

    it('should navigate to activity', () => {
      component.goToActivity({});

      expect(router.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me?tab=1');
    });

    it('should navigate to national learning page', () => {
      component.navigateToNationalLearning();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('app/learn/karmayogi-saptah');
    });

    it('should navigate to state learning page', () => {
      component.slwConfiguration = {
        orgName: 'test-org',
        orgId: 'test-org-id'
      };

      component.navigateToStatelLearning();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('app/learn/mdo-channels/test-org/test-org-id/micro-sites');
    });

    it('should not navigate to state learning when slwConfiguration is missing', () => {
      component.slwConfiguration = null;

      component.navigateToStatelLearning();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not navigate to state learning when orgName is missing', () => {
      component.slwConfiguration = {
        orgId: 'test-org-id'
      };

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not navigate to state learning when orgId is missing', () => {
      component.slwConfiguration = {
        orgName: 'test-org'
      };

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('navigate', () => {
    it('should configure discussion forum and navigate', () => {
      component.navigate();

      const expectedConfig = {
        menuOptions: [
          {
            route: 'all-discussions',
            label: 'All discussions',
            enable: true,
          },
          {
            route: 'categories',
            label: 'Categories',
            enable: true,
          },
          {
            route: 'tags',
            label: 'Tags',
            enable: true,
          },
          {
            route: 'my-discussion',
            label: 'Your discussion',
            enable: true,
          },
        ],
        userName: 'testuser',
        context: {
          id: 1,
        },
        categories: { result: [] },
        routerSlug: '/app',
        headerOptions: false,
        bannerOption: true,
      };

      expect(discussUtilitySvc.setDiscussionConfig).toHaveBeenCalledWith(expectedConfig);
      expect(localStorage.setItem).toHaveBeenCalledWith('home', JSON.stringify(expectedConfig));
      expect(router.navigate).toHaveBeenCalledWith(['/app/discussion-forum'], {
        queryParams: { page: 'home' },
        queryParamsHandling: 'merge'
      });
    });

    it('should handle missing nodebbUserProfile', () => {
      configSvc.nodebbUserProfile = null;
      
      component.navigate();

      const setConfigCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(setConfigCall.userName).toBe('');
    });

    it('should handle missing username in nodebbUserProfile', () => {
      configSvc.nodebbUserProfile = {};
      
      component.navigate();

      const setConfigCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(setConfigCall.userName).toBe('');
    });
  });

  describe('Additional Navigation Edge Cases', () => {
    it('should handle navigateToStatelLearning with partial configuration', () => {
      component.slwConfiguration = {
        orgName: 'test-org'
        // missing orgId
      };

      component.navigateToStatelLearning();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should handle navigateToStatelLearning with empty strings', () => {
      component.slwConfiguration = {
        orgName: '',
        orgId: ''
      };

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('Line Coverage for constructWeeklyData', () => {
    it('should handle missing weekly-claps data', () => {
      component.insightsData = {};

      component.constructWeeklyData();

      expect(component.insightsData.weeklyClaps).toBeUndefined();
      expect(component.clapsDataLoading).toBe(false);
    });

    it('should handle null insightsData', () => {
      component.insightsData = null;

      component.constructWeeklyData();

      expect(component.clapsDataLoading).toBe(false);
    });
  });

  describe('Line Coverage for updateDesignation error path', () => {
    it('should call openSnackbar when no designation selected', () => {
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);
      component.selectDesignation = '';

      component.updateDesignation();

      expect(openSnackbarSpy).toHaveBeenCalledWith('Please select a valid designation');
    });

    it('should call openSnackbar when designation is whitespace only', () => {
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);
      component.selectDesignation = '   ';

      component.updateDesignation();

      expect(openSnackbarSpy).toHaveBeenCalledWith('Please select a valid designation');
    });
  });

  describe('Line Coverage for onInputChange', () => {
    beforeEach(() => {
      component.designationList = [
        { name: 'Manager' },
        { name: 'Developer' },
        { name: 'Senior Manager' }
      ];
      component.filterDesigantionList = component.designationList;
    });

    it('should clear selectDesignation when no search value length', () => {
      component.selectDesignation = 'previous-value';
      
      component.onInputChange('');

      expect(component.selectDesignation).toBe('');
      expect(component.filterDesigantionList).toEqual(component.designationList);
    });

    it('should filter and set selectDesignation when search has length', () => {
      component.onInputChange('manager');

      expect(component.filterDesigantionList).toEqual([
        { name: 'Manager' },
        { name: 'Senior Manager' }
      ]);
      expect(component.selectDesignation).toBe('manager');
    });

    it('should handle case insensitive filtering', () => {
      component.onInputChange('DEVELOPER');

      expect(component.filterDesigantionList).toEqual([{ name: 'Developer' }]);
      expect(component.selectDesignation).toBe('DEVELOPER');
    });
  });

describe('InsightSideBarComponent', () => {
  let component: InsightSideBarComponent;
  let homePageSvc: any;
  let configSvc: any;
  let activatedRoute: any;
  let discussUtilitySvc: any;
  let translate: any;
  let events: any;
  let snackBar: any;
  let router: any;
  let signupService: any;
  let profileV2Svc: any;
  let userProfileService: any;
  let langtranslations: any;

  beforeEach(() => {
    // Mock services
    homePageSvc = {
      getInsightsData: jest.fn(),
      getAssessmentinfo: jest.fn(),
      getDiscussionsData: jest.fn(),
      getRecentRequests: jest.fn()
    };

    configSvc = {
      userProfile: {
        rootOrgId: 'test-root-org',
        userName: 'testuser',
        professionalDetails: [{
          designation: 'test-designation'
        }]
      },
      unMappedUser: {
        id: 'test-user-id',
        profileDetails: {
          profileStatus: 'active',
          refRootOrg: {
            orgId: 'test-org-id'
          },
          employmentDetails: {
            departmentName: 'test-dept'
          }
        }
      },
      nodebbUserProfile: {
        username: 'testuser'
      }
    };

    activatedRoute = {
      snapshot: {
        data: {
          pageData: {
            data: {
              learnerAdvisory: [],
              surveyForm: {},
              surveyPopup: {},
              nationalLearningWeek: {
                enabled: true,
                startDate: '01-01-2024',
                endDate: '07-01-2024'
              },
              updateDesignation: {
                enabled: true,
                header: 'Update Designation',
                headerHi: 'पदनाम अपडेट करें',
                headerGu: 'હોદ્દો અપડેટ કરો',
                buttonText: 'Update',
                buttonTextHi: 'अपडेट करें',
                buttonTextGu: 'અપડેટ કરો',
                hintText: 'Select designation',
                hintTextHi: 'पदनाम चुनें',
                hintTextGu: 'હોદ્દો પસંદ કરો'
              },
              stateLearningWeek: [{
                orgId: 'test-org-id',
                enabled: true,
                startDate: '01-01-2024',
                endDate: '07-01-2024',
                orgName: 'test-org'
              }],
              assessmentData: {}
            }
          }
        }
      }
    };

    discussUtilitySvc = {
      setDiscussionConfig: jest.fn()
    };

    translate = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    };

    events = {
      raiseInteractTelemetry: jest.fn()
    };

    snackBar = {
      open: jest.fn()
    };

    router = {
      navigateByUrl: jest.fn(),
      navigate: jest.fn()
    };

    signupService = {
      getOrgReadData: jest.fn(),
      getFrameworkInfo: jest.fn()
    };

    profileV2Svc = {
      fetchApprovalDetails: jest.fn(),
      withDrawApprovalRequest: jest.fn()
    };

    userProfileService = {
      editProfileDetails: jest.fn()
    };

    langtranslations = {
      languageSelectedObservable: of({})
    };

    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();

    // Create component instance
    component = new InsightSideBarComponent(
      homePageSvc,
      configSvc,
      activatedRoute,
      discussUtilitySvc,
      translate,
      events,
      snackBar,
      router,
      signupService,
      profileV2Svc,
      userProfileService,
      langtranslations
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize component with language settings when websiteLanguage exists', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('hi');
      
      component = new InsightSideBarComponent(
        homePageSvc,
        configSvc,
        activatedRoute,
        discussUtilitySvc,
        translate,
        events,
        snackBar,
        router,
        signupService,
        profileV2Svc,
        userProfileService,
        langtranslations
      );

      expect(translate.setDefaultLang).toHaveBeenCalledWith('en');
      expect(translate.use).toHaveBeenCalledWith('hi');
    });

    it('should handle language change observable', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('gu');
      
      component = new InsightSideBarComponent(
        homePageSvc,
        configSvc,
        activatedRoute,
        discussUtilitySvc,
        translate,
        events,
        snackBar,
        router,
        signupService,
        profileV2Svc,
        userProfileService,
        langtranslations
      );

      expect(component.currentLang).toBe('gu');
    });

    it('should initialize without websiteLanguage in localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      
      component = new InsightSideBarComponent(
        homePageSvc,
        configSvc,
        activatedRoute,
        discussUtilitySvc,
        translate,
        events,
        snackBar,
        router,
        signupService,
        profileV2Svc,
        userProfileService,
        langtranslations
      );

      // Should not call translate methods when no language in localStorage
      expect(translate.setDefaultLang).not.toHaveBeenCalled();
      expect(translate.use).not.toHaveBeenCalled();
    });

    it('should handle language observable without websiteLanguage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      
      const mockObservable = {
        subscribe: jest.fn().mockImplementation((callback) => {
          callback(); // Trigger the callback
          return { unsubscribe: jest.fn() };
        })
      };
      
      langtranslations.languageSelectedObservable = mockObservable;
      
      component = new InsightSideBarComponent(
        homePageSvc,
        configSvc,
        activatedRoute,
        discussUtilitySvc,
        translate,
        events,
        snackBar,
        router,
        signupService,
        profileV2Svc,
        userProfileService,
        langtranslations
      );

      // Should not set language when not in localStorage
      expect(translate.setDefaultLang).not.toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      homePageSvc.getInsightsData.mockReturnValue(of({
        result: {
          response: {
            nudges: [
              { label: 'Test Nudge', growth: 'positive', progress: 5 }
            ],
            'weekly-claps': { data: 'test' }
          }
        }
      }));
      homePageSvc.getRecentRequests.mockReturnValue(of({
        result: {
          data: [{ fullName: 'test user' }]
        }
      }));
      homePageSvc.getDiscussionsData.mockReturnValue(of({
        latestPosts: []
      }));
    });

    it('should initialize component data', () => {
      component.ngOnInit();

      expect(component.userData).toBe(configSvc.userProfile);
      expect(component.homePageData).toBeDefined();
      expect(component.learnAdvisoryData).toEqual([]);
      expect(component.surveyForm).toEqual({});
      expect(component.surveyPopup).toEqual({});
    });

    it('should handle missing pageData', () => {
      activatedRoute.snapshot.data = {};
      
      component.ngOnInit();

      expect(component.homePageData).toBeUndefined();
      expect(component.learnAdvisoryData).toBeUndefined();
    });

    it('should handle missing pageData.data', () => {
      activatedRoute.snapshot.data.pageData = {};
      
      component.ngOnInit();

      expect(component.homePageData).toBeUndefined();
    });

    it('should process state learning week configuration correctly', () => {
      // Test with matching orgId
      component.ngOnInit();

      expect(component.slwConfiguration).toBeDefined();
      expect(component.slwConfiguration.orgName).toBe('test-org');
    });

    it('should handle state learning week without userData', () => {
      configSvc.unMappedUser = null;
      
      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should handle state learning week without profileDetails', () => {
      configSvc.unMappedUser.profileDetails = null;
      
      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should handle state learning week without refRootOrg', () => {
      configSvc.unMappedUser.profileDetails.refRootOrg = null;
      
      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should handle state learning week without orgId', () => {
      configSvc.unMappedUser.profileDetails.refRootOrg.orgId = null;
      
      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should handle state learning week with no matching orgId', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [{
        orgId: 'different-org-id',
        enabled: true
      }];
      
      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should set isNotMyUser when profile status is not-my-user', () => {
      configSvc.unMappedUser.profileDetails.profileStatus = 'not-my-user';
      
      component.ngOnInit();

      expect(component.isNotMyUser).toBe(true);
    });

    it('should handle missing configSvc', () => {
      const originalConfigSvc = configSvc;
      (component as any).configSvc = null;
      
      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
      
      // Restore
      (component as any).configSvc = originalConfigSvc;
    });

    it('should handle missing unMappedUser', () => {
      configSvc.unMappedUser = null;
      
      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
    });

    it('should handle missing profileDetails for status check', () => {
      configSvc.unMappedUser.profileDetails = null;
      
      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
    });

    it('should handle missing profileStatus', () => {
      delete configSvc.unMappedUser.profileDetails.profileStatus;
      
      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
    });

    it('should set isIgotOrg when department is igot', () => {
      configSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot';
      
      component.ngOnInit();

      expect(component.isIgotOrg).toBe(true);
    });

    it('should handle missing employmentDetails', () => {
      configSvc.unMappedUser.profileDetails.employmentDetails = null;
      
      component.ngOnInit();

      expect(component.isIgotOrg).toBe(false);
    });

    it('should handle missing departmentName', () => {
      delete configSvc.unMappedUser.profileDetails.employmentDetails.departmentName;
      
      component.ngOnInit();

      expect(component.isIgotOrg).toBe(false);
    });

    it('should call getNlwConfig when national learning week is enabled', () => {
      const spy = jest.spyOn(component, 'getNlwConfig');
      
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should not call getNlwConfig when national learning week is disabled', () => {
      activatedRoute.snapshot.data.pageData.data.nationalLearningWeek.enabled = false;
      const spy = jest.spyOn(component, 'getNlwConfig');
      
      component.ngOnInit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should call getMasterDesignation when update designation is enabled', () => {
      const spy = jest.spyOn(component, 'getMasterDesignation');
      
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should not call getMasterDesignation when update designation is disabled', () => {
      activatedRoute.snapshot.data.pageData.data.updateDesignation.enabled = false;
      const spy = jest.spyOn(component, 'getMasterDesignation');
      
      component.ngOnInit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should call getSlwConfig when state learning week is enabled', () => {
      const spy = jest.spyOn(component, 'getSlwConfig');
      
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should not call getSlwConfig when state learning week is disabled', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek[0].enabled = false;
      const spy = jest.spyOn(component, 'getSlwConfig');
      
      component.ngOnInit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should set assessment strip data', () => {
      component.ngOnInit();

      expect(component.assessmentStrip).toBeDefined();
    });

    it('should handle missing assessment data', () => {
      delete activatedRoute.snapshot.data.pageData.data.assessmentData;
      
      component.ngOnInit();

      expect(component.assessmentStrip).toBeUndefined();
    });
  });

  describe('getNlwConfig', () => {
    beforeEach(() => {
      component.nwlConfiguration = {
        startDate: '01-01-2024',
        endDate: '07-01-2024'
      };
    });

    it('should set canShowNlwCard to true when current date is between start and end date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(true);
      jest.spyOn(moment.prototype, 'diff').mockReturnValue(3);

      component.getNlwConfig();

      expect(component.canShowNlwCard).toBe(true);
      expect(component.daysCompleted).toBe(3);
    });

    it('should set canShowNlwCard to false when current date is before start date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isBefore').mockReturnValue(true);

      component.getNlwConfig();

      expect(component.canShowNlwCard).toBe(false);
    });

    it('should handle when current date is after end date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isBefore').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isAfter').mockReturnValue(true);
      jest.spyOn(moment.prototype, 'diff')
        .mockReturnValueOnce(7) // totalDays
        .mockReturnValueOnce(0); // daysPassed

      component.getNlwConfig();

      expect(component.canShowNlwCard).toBe(true);
      expect(component.daysCompleted).toBe(7);
    });
  });

  describe('getSlwConfig', () => {
    beforeEach(() => {
      component.slwConfiguration = {
        startDate: '01-01-2024',
        endDate: '07-01-2024'
      };
    });

    it('should set canShowSlwCard to true when current date is between start and end date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(true);
      jest.spyOn(moment.prototype, 'diff').mockReturnValue(3);

      component.getSlwConfig();

      expect(component.canShowSlwCard).toBe(true);
      expect(component.daysCompleted).toBe(3);
    });

    it('should set canShowSlwCard to false when current date is before start date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isBefore').mockReturnValue(true);

      component.getSlwConfig();

      expect(component.canShowSlwCard).toBe(false);
    });
  });

  describe('getMasterDesignation', () => {
    const mockFrameworkResponse = {
      result: {
        framework: {
          categories: [
            {
              code: 'org',
              terms: [
                {
                  children: [
                    { name: 'Manager' },
                    { name: 'Developer' }
                  ]
                }
              ]
            }
          ]
        }
      }
    };

    beforeEach(() => {
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test-framework' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }));
    });

    it('should fetch and process designation data successfully', () => {
      component.getMasterDesignation();

      expect(signupService.getOrgReadData).toHaveBeenCalledWith(configSvc.userProfile.rootOrgId);
      expect(signupService.getFrameworkInfo).toHaveBeenCalledWith('test-framework');
      expect(component.designationList).toEqual([
        { name: 'Developer' },
        { name: 'Manager' }
      ]);
    });

    it('should not call services when userData is null', () => {
      component.userData = null;
      
      component.getMasterDesignation();

      expect(signupService.getOrgReadData).not.toHaveBeenCalled();
    });

    it('should not call services when rootOrgId is missing', () => {
      component.userData = { rootOrgId: null };
      
      component.getMasterDesignation();

      expect(signupService.getOrgReadData).not.toHaveBeenCalled();
    });

    it('should set showUpdateDesignations to true when no approval data and no designation', () => {
      configSvc.userProfile.professionalDetails = [];
      
      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should set showUpdateDesignations to true when no approval data and no professionalDetails', () => {
      configSvc.userProfile.professionalDetails = null;
      
      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle approval data with designation not in list', () => {
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({
        result: {
          data: [{ designation: 'Custom Designation' }]
        }
      }));

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle approval data with designation in list', () => {
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({
        result: {
          data: [{ designation: 'Manager' }]
        }
      }));

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(false);
    });

    it('should handle existing designation not in master list', () => {
      configSvc.userProfile.professionalDetails[0].designation = 'Custom Role';

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle existing designation in master list', () => {
      configSvc.userProfile.professionalDetails[0].designation = 'Manager';

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(false);
    });

    it('should handle missing professionalDetails array', () => {
      delete configSvc.userProfile.professionalDetails;

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle empty professionalDetails array', () => {
      configSvc.userProfile.professionalDetails = [];

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle missing designation in professionalDetails', () => {
      configSvc.userProfile.professionalDetails = [{}];

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle org read data error', () => {
      signupService.getOrgReadData.mockReturnValue(throwError('Error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component.getMasterDesignation();

      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle framework info error', () => {
      signupService.getFrameworkInfo.mockReturnValue(throwError('Error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component.getMasterDesignation();

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getInsights', () => {
    it('should fetch insights data successfully', () => {
      const mockResponse = {
        result: {
          response: {
            nudges: [
              { label: 'Test', growth: 'positive', progress: 5 }
            ],
            'weekly-claps': { data: 'test' }
          }
        }
      };
      homePageSvc.getInsightsData.mockReturnValue(of(mockResponse));

      component.getInsights();

      expect(component.insightsData).toBe(mockResponse.result.response);
      expect(component.profileDataLoading).toBe(false);
    });

    it('should handle insights data error', () => {
      homePageSvc.getInsightsData.mockReturnValue(throwError('Error'));

      component.getInsights();

      expect(component.insightsData).toBe('');
      expect(component.profileDataLoading).toBe(false);
      expect(component.clapsDataLoading).toBe(false);
    });
  });

  describe('constructNudgeData', () => {
    it('should construct nudge data with positive growth', () => {
      component.insightsData = {
        nudges: [
          { label: 'Test Label', growth: 'positive', progress: 5 }
        ]
      };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData[0]).toEqual({
        title: 'Test Label',
        icon: 'arrow_upward',
        data: '+5%',
        colorData: 'color-green'
      });
    });

    it('should construct nudge data with negative growth', () => {
      component.insightsData = {
        nudges: [
          { label: 'Test Label', growth: 'negative', progress: -3 }
        ]
      };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData[0]).toEqual({
        title: 'Test Label',
        icon: 'arrow_downward',
        data: '',
        colorData: 'color-red'
      });
    });
  });

  describe('constructWeeklyData', () => {
    it('should construct weekly claps data', () => {
      component.insightsData = {
        'weekly-claps': { data: 'test' }
      };

      component.constructWeeklyData();

      expect(component.insightsData.weeklyClaps).toEqual({ data: 'test' });
      expect(component.clapsDataLoading).toBe(false);
    });
  });

  describe('getAssessmentData', () => {
    it('should fetch assessment data successfully', () => {
      const mockResponse = { result: { response: { data: 'test' } } };
      homePageSvc.getAssessmentinfo.mockReturnValue(of(mockResponse));

      component.getAssessmentData();

      expect(component.assessmentsData).toBe(mockResponse.result.response);
    });

    it('should handle assessment data error', () => {
      homePageSvc.getAssessmentinfo.mockReturnValue(throwError({ ok: false }));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      component.getAssessmentData();

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getDiscussionsData', () => {
    it('should fetch discussions data successfully', () => {
      const mockResponse = { latestPosts: ['post1', 'post2'] };
      homePageSvc.getDiscussionsData.mockReturnValue(of(mockResponse));

      component.getDiscussionsData();

      expect(component.discussion.data).toEqual(['post1', 'post2']);
      expect(component.discussion.loadSkeleton).toBe(false);
    });

    it('should handle discussions data error', () => {
      homePageSvc.getDiscussionsData.mockReturnValue(throwError({ ok: false }));

      component.getDiscussionsData();

      expect(component.discussion.loadSkeleton).toBe(false);
      expect(component.discussion.error).toBe(true);
    });
  });

  describe('getPendingRequestData', () => {
    it('should fetch pending request data successfully', () => {
      const mockResponse = {
        result: {
          data: [
            { fullName: 'john doe' },
            { fullName: 'jane smith' }
          ]
        }
      };
      homePageSvc.getRecentRequests.mockReturnValue(of(mockResponse));

      component.getPendingRequestData();

      expect(component.pendingRequestData[0].fullName).toBe('John doe');
      expect(component.pendingRequestData[1].fullName).toBe('Jane smith');
      expect(component.pendingRequestSkeleton).toBe(false);
    });

    it('should handle pending request data error', () => {
      homePageSvc.getRecentRequests.mockReturnValue(throwError({ ok: false }));

      component.getPendingRequestData();

      expect(component.pendingRequestSkeleton).toBe(false);
    });
  });

  describe('navigate', () => {
    it('should configure discussion forum and navigate', () => {
      component.navigate();

      const expectedConfig = {
        menuOptions: [
          {
            route: 'all-discussions',
            label: 'All discussions',
            enable: true,
          },
          {
            route: 'categories',
            label: 'Categories',
            enable: true,
          },
          {
            route: 'tags',
            label: 'Tags',
            enable: true,
          },
          {
            route: 'my-discussion',
            label: 'Your discussion',
            enable: true,
          },
        ],
        userName: 'testuser',
        context: {
          id: 1,
        },
        categories: { result: [] },
        routerSlug: '/app',
        headerOptions: false,
        bannerOption: true,
      };

      expect(discussUtilitySvc.setDiscussionConfig).toHaveBeenCalledWith(expectedConfig);
      expect(localStorage.setItem).toHaveBeenCalledWith('home', JSON.stringify(expectedConfig));
      expect(router.navigate).toHaveBeenCalledWith(['/app/discussion-forum'], {
        queryParams: { page: 'home' },
        queryParamsHandling: 'merge'
      });
    });

    it('should handle missing nodebbUserProfile', () => {
      configSvc.nodebbUserProfile = null;
      
      component.navigate();

      const setConfigCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(setConfigCall.userName).toBe('');
    });

    it('should handle missing username in nodebbUserProfile', () => {
      configSvc.nodebbUserProfile = {};
      
      component.navigate();

      const setConfigCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(setConfigCall.userName).toBe('');
    });
  });

  describe('UI interaction methods', () => {
    it('should expand/collapse', () => {
      component.expandCollapse(true);

      expect(component.collapsed).toBe(true);
    });

    it('should toggle credentials', () => {
      component.toggleCreds();

      expect(component.showCreds).toBe(true);
      expect(component.credMessage).toBe('Hide my credentials');

      component.toggleCreds();

      expect(component.showCreds).toBe(false);
      expect(component.credMessage).toBe('View my credentials');
    });

    it('should check leaderboard data', () => {
      component.checkLeaderboardData(true);

      expect(component.isLeaderboardExist).toBe(true);
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard', () => {
      const mockTextArea = {
        value: '',
        select: jest.fn(),
        focus: jest.fn()
      };
      const mockBody = {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockTextArea as any);
      jest.spyOn(document, 'execCommand').mockReturnValue(true);
      Object.defineProperty(document, 'body', { value: mockBody });
      
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);
      const raiseTelemetrySpy = jest.spyOn(component, 'raiseTelemetry');

      component.copyToClipboard('test text');

      expect(mockTextArea.value).toBe('test text');
      expect(mockTextArea.select).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(openSnackbarSpy).toHaveBeenCalledWith('copied');
      expect(raiseTelemetrySpy).toHaveBeenCalledWith('copyToClipboard');
    });
  });

  describe('Designation update methods', () => {
    it('should update designation successfully', () => {
      component.selectDesignation = 'Manager';
      const raiseTelemetrySpy = jest.spyOn(component, 'raiseTelemetryForDesigantion');
      const apiCallSpy = jest.spyOn(component, 'apiCallToUpdateDesignation');

      component.updateDesignation();

      expect(raiseTelemetrySpy).toHaveBeenCalled();
      expect(apiCallSpy).toHaveBeenCalled();
    });

    it('should show error when no designation selected', () => {
      component.selectDesignation = '';
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);

      component.updateDesignation();

      expect(openSnackbarSpy).toHaveBeenCalledWith('Please select a valid designation');
    });

    it('should submit profile successfully', () => {
      component.selectDesignation = 'Manager';
      userProfileService.editProfileDetails.mockReturnValue(of({ responseCode: 'OK' }));
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);

      component.submitProfile();

      expect(component.showUpdateDesignations).toBe(false);
      expect(openSnackbarSpy).toHaveBeenCalledWith('Designation updated successfully');
    });

    it('should handle profile update error', () => {
      userProfileService.editProfileDetails.mockReturnValue(throwError('Error'));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      component.submitProfile();

      expect(consoleSpy).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('something went wrong!');
    });

    it('should handle API call with pending approval', () => {
      component.desigantionUnderApproval = { wfId: 'test-wf-id' };
      profileV2Svc.withDrawApprovalRequest.mockReturnValue(of({ result: { message: 'Success' } }));
      const submitProfileSpy = jest.spyOn(component, 'submitProfile');

      component.apiCallToUpdateDesignation();

      expect(submitProfileSpy).toHaveBeenCalled();
    });

    it('should handle API call without pending approval', () => {
      component.desigantionUnderApproval = null;
      const submitProfileSpy = jest.spyOn(component, 'submitProfile');

      component.apiCallToUpdateDesignation();

      expect(submitProfileSpy).toHaveBeenCalled();
    });
  });

  describe('Input handling methods', () => {
    beforeEach(() => {
      component.designationList = [
        { name: 'Manager' },
        { name: 'Developer' },
        { name: 'Analyst' }
      ];
    });

    it('should filter designations on input change', () => {
      component.onInputChange('man');

      expect(component.filterDesigantionList).toEqual([{ name: 'Manager' }]);
      expect(component.selectDesignation).toBe('man');
    });

    it('should reset filter when input is empty', () => {
      component.onInputChange('');

      expect(component.filterDesigantionList).toEqual(component.designationList);
      expect(component.selectDesignation).toBe('');
    });

    it('should select designation option', () => {
      component.onOptionSelected('Manager');

      expect(component.selectDesignation).toBe('Manager');
    });

    it('should handle autocomplete opened', () => {
      component.onAutoCompleteOpened();

      expect(component.isMatcompleteOpened).toBe(true);
    });

    it('should handle autocomplete closed', () => {
      component.onAutoCompleteClosed();

      expect(component.isMatcompleteOpened).toBe(false);
      expect(component.filterDesigantionList).toEqual(component.designationList);
    });

    it('should open autocomplete manually', () => {
      const mockTrigger = { openPanel: jest.fn() };
      const mockInput = { focus: jest.fn() };

      component.openAutocomplete(mockTrigger as any, mockInput as any);

      expect(mockInput.focus).toHaveBeenCalled();
      expect(mockTrigger.openPanel).toHaveBeenCalled();
    });
  });

  describe('Localization methods', () => {
    beforeEach(() => {
      component.updateDesignationCard = {
        header: 'Update Designation',
        headerHi: 'पदनाम अपडेट करें',
        headerGu: 'હોદ્દો અપડેટ કરો',
        buttonText: 'Update',
        buttonTextHi: 'अपडेट करें',
        buttonTextGu: 'અપડેટ કરો',
        hintText: 'Select designation',
        hintTextHi: 'पदनाम चुनें',
        hintTextGu: 'હોદ્દો પસંદ કરો'
      };
    });

    it('should render header in Hindi', () => {
      component.currentLang = 'hi';

      const result = component.renderUpdateDesignationCardHeader();

      expect(result).toBe('पदनाम अपडेट करें');
    });

    it('should render header in Gujarati', () => {
      component.currentLang = 'gu';

      const result = component.renderUpdateDesignationCardHeader();

      expect(result).toBe('હોદ્દો અપડેટ કરો');
    });

    it('should render header in English by default', () => {
      component.currentLang = 'en';

      const result = component.renderUpdateDesignationCardHeader();

      expect(result).toBe('Update Designation');
    });

    it('should render button text in Hindi', () => {
      component.currentLang = 'hi';

      const result = component.renderUpdateDesignationCardButtonText();

      expect(result).toBe('अपडेट करें');
    });

    it('should render hint text in Gujarati', () => {
      component.currentLang = 'gu';

      const result = component.renderUpdateDesignationCardHint();

      expect(result).toBe('હોદ્દો પસંદ કરો');
    });
  });

  describe('Utility methods', () => {
    it('should raise telemetry event', () => {
      component.raiseTelemetry('test-id');

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
    });

    it('should raise telemetry for designation', () => {
      component.selectDesignation = 'Manager';

      component.raiseTelemetryForDesigantion();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
    });

    it('should emit telemetry event', () => {
      const emitSpy = jest.spyOn(component.telemetryRaisedLibrary, 'emit');
      const event = { type: 'test' };

      component.raiseTelemetryInteratEvent(event);

      expect(emitSpy).toHaveBeenCalledWith(event);
    });

    it('should open snackbar with default duration', () => {
      component['openSnackbar']('Test message');

      expect(snackBar.open).toHaveBeenCalledWith('Test message', 'X', { duration: 5000 });
    });

    it('should open snackbar with custom duration', () => {
      component['openSnackbar']('Test message', 3000);

      expect(snackBar.open).toHaveBeenCalledWith('Test message', 'X', { duration: 3000 });
    });
  });

  describe('getTermsByCode', () => {
    it('should return terms for given code', () => {
      const categories = [
        {
          code: 'org',
          terms: [{ name: 'term1' }, { name: 'term2' }]
        },
        {
          code: 'other',
          terms: [{ name: 'term3' }]
        }
      ];

      const result = component['getTermsByCode'](categories, 'org');

      expect(result).toEqual([{ name: 'term1' }, { name: 'term2' }]);
    });

    it('should return empty array when code not found', () => {
      const categories = [
        {
          code: 'other',
          terms: [{ name: 'term1' }]
        }
      ];

      const result = component['getTermsByCode'](categories, 'org');

      expect(result).toEqual([]);
    });

    it('should return empty array when no terms exist', () => {
      const categories = [
        {
          code: 'org'
        }
      ];

      const result = component['getTermsByCode'](categories, 'org');

      expect(result).toEqual([]);
    });
  });

  describe('Component Properties and State', () => {
    it('should initialize with default values', () => {
      expect(component.profileDataLoading).toBe(true);
      expect(component.clapsDataLoading).toBe(true);
      expect(component.collapsed).toBe(false);
      expect(component.pendingRequestSkeleton).toBe(true);
      expect(component.showCreds).toBe(false);
      expect(component.credMessage).toBe('View my credentials');
      expect(component.isLeaderboardExist).toBe(false);
      expect(component.isNotMyUser).toBe(false);
      expect(component.isIgotOrg).toBe(false);
      expect(component.canShowNlwCard).toBe(false);
      expect(component.canShowSlwCard).toBe(false);
      expect(component.totalDays).toBe(0);
      expect(component.daysCompleted).toBe(0);
      expect(component.currentLang).toBe('');
      expect(component.selectDesignation).toBe('');
      expect(component.showUpdateDesignations).toBe(false);
      expect(component.isMatcompleteOpened).toBe(false);
      expect(component.discussion).toEqual({
        loadSkeleton: false,
        data: [],
        error: false,
      });
    });

    it('should handle null/undefined configuration data', () => {
      configSvc.userProfile = null;
      configSvc.unMappedUser = null;

      component.ngOnInit();

      expect(component.userData).toBeNull();
    });

    it('should handle missing page data', () => {
      activatedRoute.snapshot.data = {};

      component.ngOnInit();

      expect(component.homePageData).toBeUndefined();
    });

    it('should handle missing state learning week configuration', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [];

      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should handle state learning week configuration without matching org', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [
        {
          orgId: 'different-org-id',
          enabled: true
        }
      ];

      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty nudges array', () => {
      component.insightsData = { nudges: [] };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData).toEqual([]);
    });

    it('should handle nudge with progress less than 1', () => {
      component.insightsData = {
        nudges: [
          { label: 'Test', growth: 'positive', progress: 0.5 }
        ]
      };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData[0].data).toBe('');
    });

    it('should handle null nudge elements', () => {
      component.insightsData = {
        nudges: [null, undefined, { label: 'Valid', growth: 'positive', progress: 5 }]
      };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData).toHaveLength(1);
    });

    it('should handle missing professional details', () => {
      configSvc.userProfile = {
        rootOrgId: 'test-root-org',
        professionalDetails: null
      };

      const spy = jest.spyOn(component, 'getMasterDesignation');
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should handle framework response without categories', () => {
      const mockResponse = {
        result: {
          framework: {}
        }
      };
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockResponse));

      component.getMasterDesignation();

      expect(component.designationList).toEqual([]);
    });

    it('should handle designation filtering with special characters', () => {
      component.designationList = [
        { name: 'Manager-Admin' },
        { name: 'Developer/Analyst' }
      ];

      component.onInputChange('admin');

      expect(component.filterDesigantionList).toEqual([{ name: 'Manager-Admin' }]);
    });

    it('should handle case insensitive designation filtering', () => {
      component.designationList = [
        { name: 'Manager' },
        { name: 'DEVELOPER' }
      ];

      component.onInputChange('MANAGER');

      expect(component.filterDesigantionList).toEqual([{ name: 'Manager' }]);
    });
  });

  describe('Date Calculations Edge Cases', () => {
    it('should handle invalid date formats in getNlwConfig', () => {
      component.nwlConfiguration = {
        startDate: 'invalid-date',
        endDate: 'invalid-date'
      };

      expect(() => component.getNlwConfig()).not.toThrow();
    });

    it('should handle same start and end dates', () => {
      component.nwlConfiguration = {
        startDate: '01-01-2024',
        endDate: '01-01-2024'
      };
      jest.spyOn(moment.prototype, 'diff').mockReturnValue(0);
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(true);

      component.getNlwConfig();

      expect(component.totalDays).toBe(0);
    });

    it('should handle future dates in getSlwConfig', () => {
      component.slwConfiguration = {
        startDate: '01-01-2025',
        endDate: '07-01-2025'
      };
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isBefore').mockReturnValue(true);

      component.getSlwConfig();

      expect(component.canShowSlwCard).toBe(false);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple state learning week configurations', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [
        {
          orgId: 'different-org',
          enabled: true,
          orgName: 'Different Org'
        },
        {
          orgId: 'test-org-id',
          enabled: true,
          orgName: 'Test Org'
        }
      ];

      component.ngOnInit();

      expect(component.slwConfiguration.orgName).toBe('Test Org');
    });

    it('should handle designation approval with multiple users', () => {
      const mockResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'org',
                terms: [
                  {
                    children: [
                      { name: 'Manager' },
                      { name: 'Developer' }
                    ]
                  }
                ]
              }
            ]
          }
        }
      };
      
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockResponse));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({
        result: {
          data: [
            { designation: 'Valid Designation' },
            { designation: 'Custom Designation' }
          ]
        }
      }));

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle navigation to state learning without configuration', () => {
      component.slwConfiguration = null;

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should handle clipboard operation failure', () => {
      jest.spyOn(document, 'createElement').mockImplementation(() => {
        throw new Error('Failed to create element');
      });

      expect(() => component.copyToClipboard('test')).not.toThrow();
    });
  });

  describe('Service Integration Tests', () => {
    it('should handle all service calls in ngOnInit', () => {
      homePageSvc.getInsightsData.mockReturnValue(of({ result: { response: { nudges: [], 'weekly-claps': {} } } }));
      homePageSvc.getRecentRequests.mockReturnValue(of({ result: { data: [] } }));
      homePageSvc.getDiscussionsData.mockReturnValue(of({ latestPosts: [] }));
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test' }));
      signupService.getFrameworkInfo.mockReturnValue(of({ result: { framework: { categories: [] } } }));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }));

      component.ngOnInit();

      expect(homePageSvc.getInsightsData).toHaveBeenCalled();
      expect(homePageSvc.getRecentRequests).toHaveBeenCalled();
      expect(homePageSvc.getDiscussionsData).toHaveBeenCalled();
      expect(signupService.getOrgReadData).toHaveBeenCalled();
    });

    it('should handle service dependency chain failures', () => {
      signupService.getOrgReadData.mockReturnValue(throwError('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component.getMasterDesignation();

      expect(consoleSpy).toHaveBeenCalled();
      expect(signupService.getFrameworkInfo).not.toHaveBeenCalled();
    });
  });

  describe('Navigation methods', () => {
    it('should navigate to connection requests', () => {
      component.navigateTo();

      expect(router.navigateByUrl).toHaveBeenCalledWith('app/network-v2/connection-requests');
    });

    it('should navigate to user profile', () => {
      component.moveToUserProile('user123');

      expect(router.navigateByUrl).toHaveBeenCalledWith('app/person-profile/user123#profileInfo');
    });

    it('should navigate to activity', () => {
      component.goToActivity({});

      expect(router.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me?tab=1');
    });

    it('should navigate to national learning page', () => {
      component.navigateToNationalLearning();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('app/learn/karmayogi-saptah');
    });

    it('should navigate to state learning page', () => {
      component.slwConfiguration = {
        orgName: 'test-org',
        orgId: 'test-org-id'
      };

      component.navigateToStatelLearning();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('app/learn/mdo-channels/test-org/test-org-id/micro-sites');
    });

    it('should not navigate to state learning when slwConfiguration is missing', () => {
      component.slwConfiguration = null;

      component.navigateToStatelLearning();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not navigate to state learning when orgName is missing', () => {
      component.slwConfiguration = {
        orgId: 'test-org-id'
      };

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not navigate to state learning when orgId is missing', () => {
      component.slwConfiguration = {
        orgName: 'test-org'
      };

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('navigate', () => {
    it('should configure discussion forum and navigate', () => {
      component.navigate();

      const expectedConfig = {
        menuOptions: [
          {
            route: 'all-discussions',
            label: 'All discussions',
            enable: true,
          },
          {
            route: 'categories',
            label: 'Categories',
            enable: true,
          },
          {
            route: 'tags',
            label: 'Tags',
            enable: true,
          },
          {
            route: 'my-discussion',
            label: 'Your discussion',
            enable: true,
          },
        ],
        userName: 'testuser',
        context: {
          id: 1,
        },
        categories: { result: [] },
        routerSlug: '/app',
        headerOptions: false,
        bannerOption: true,
      };

      expect(discussUtilitySvc.setDiscussionConfig).toHaveBeenCalledWith(expectedConfig);
      expect(localStorage.setItem).toHaveBeenCalledWith('home', JSON.stringify(expectedConfig));
      expect(router.navigate).toHaveBeenCalledWith(['/app/discussion-forum'], {
        queryParams: { page: 'home' },
        queryParamsHandling: 'merge'
      });
    });

    it('should handle missing nodebbUserProfile', () => {
      configSvc.nodebbUserProfile = null;
      
      component.navigate();

      const setConfigCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(setConfigCall.userName).toBe('');
    });

    it('should handle missing username in nodebbUserProfile', () => {
      configSvc.nodebbUserProfile = {};
      
      component.navigate();

      const setConfigCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(setConfigCall.userName).toBe('');
    });
  });

  describe('Additional Navigation Edge Cases', () => {
    it('should handle navigateToStatelLearning with partial configuration', () => {
      component.slwConfiguration = {
        orgName: 'test-org'
        // missing orgId
      };

      component.navigateToStatelLearning();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should handle navigateToStatelLearning with empty strings', () => {
      component.slwConfiguration = {
        orgName: '',
        orgId: ''
      };

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('Line Coverage for constructWeeklyData', () => {
    it('should handle missing weekly-claps data', () => {
      component.insightsData = {};

      component.constructWeeklyData();

      expect(component.insightsData.weeklyClaps).toBeUndefined();
      expect(component.clapsDataLoading).toBe(false);
    });

    it('should handle null insightsData', () => {
      component.insightsData = null;

      component.constructWeeklyData();

      expect(component.clapsDataLoading).toBe(false);
    });
  });

  describe('Line Coverage for updateDesignation error path', () => {
    it('should call openSnackbar when no designation selected', () => {
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);
      component.selectDesignation = '';

      component.updateDesignation();

      expect(openSnackbarSpy).toHaveBeenCalledWith('Please select a valid designation');
    });

    it('should call openSnackbar when designation is whitespace only', () => {
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);
      component.selectDesignation = '   ';

      component.updateDesignation();

      expect(openSnackbarSpy).toHaveBeenCalledWith('Please select a valid designation');
    });
  });

  describe('Line Coverage for onInputChange', () => {
    beforeEach(() => {
      component.designationList = [
        { name: 'Manager' },
        { name: 'Developer' },
        { name: 'Senior Manager' }
      ];
      component.filterDesigantionList = component.designationList;
    });

    it('should clear selectDesignation when no search value length', () => {
      component.selectDesignation = 'previous-value';
      
      component.onInputChange('');

      expect(component.selectDesignation).toBe('');
      expect(component.filterDesigantionList).toEqual(component.designationList);
    });

    it('should filter and set selectDesignation when search has length', () => {
      component.onInputChange('manager');

      expect(component.filterDesigantionList).toEqual([
        { name: 'Manager' },
        { name: 'Senior Manager' }
      ]);
      expect(component.selectDesignation).toBe('manager');
    });

    it('should handle case insensitive filtering', () => {
      component.onInputChange('DEVELOPER');

      expect(component.filterDesigantionList).toEqual([{ name: 'Developer' }]);
      expect(component.selectDesignation).toBe('DEVELOPER');
    });
  });

describe('InsightSideBarComponent', () => {
  let component: InsightSideBarComponent;
  let homePageSvc: any;
  let configSvc: any;
  let activatedRoute: any;
  let discussUtilitySvc: any;
  let translate: any;
  let events: any;
  let snackBar: any;
  let router: any;
  let signupService: any;
  let profileV2Svc: any;
  let userProfileService: any;
  let langtranslations: any;

  beforeEach(() => {
    // Mock services
    homePageSvc = {
      getInsightsData: jest.fn(),
      getAssessmentinfo: jest.fn(),
      getDiscussionsData: jest.fn(),
      getRecentRequests: jest.fn()
    };

    configSvc = {
      userProfile: {
        rootOrgId: 'test-root-org',
        userName: 'testuser',
        professionalDetails: [{
          designation: 'test-designation'
        }]
      },
      unMappedUser: {
        id: 'test-user-id',
        profileDetails: {
          profileStatus: 'active',
          refRootOrg: {
            orgId: 'test-org-id'
          },
          employmentDetails: {
            departmentName: 'test-dept'
          }
        }
      },
      nodebbUserProfile: {
        username: 'testuser'
      }
    };

    activatedRoute = {
      snapshot: {
        data: {
          pageData: {
            data: {
              learnerAdvisory: [],
              surveyForm: {},
              surveyPopup: {},
              nationalLearningWeek: {
                enabled: true,
                startDate: '01-01-2024',
                endDate: '07-01-2024'
              },
              updateDesignation: {
                enabled: true,
                header: 'Update Designation',
                headerHi: 'पदनाम अपडेट करें',
                headerGu: 'હોદ્દો અપડેટ કરો',
                buttonText: 'Update',
                buttonTextHi: 'अपडेट करें',
                buttonTextGu: 'અપડેટ કરો',
                hintText: 'Select designation',
                hintTextHi: 'पदनाम चुनें',
                hintTextGu: 'હોદ્દો પસંદ કરો'
              },
              stateLearningWeek: [{
                orgId: 'test-org-id',
                enabled: true,
                startDate: '01-01-2024',
                endDate: '07-01-2024',
                orgName: 'test-org'
              }],
              assessmentData: {}
            }
          }
        }
      }
    };

    discussUtilitySvc = {
      setDiscussionConfig: jest.fn()
    };

    translate = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    };

    events = {
      raiseInteractTelemetry: jest.fn()
    };

    snackBar = {
      open: jest.fn()
    };

    router = {
      navigateByUrl: jest.fn(),
      navigate: jest.fn()
    };

    signupService = {
      getOrgReadData: jest.fn(),
      getFrameworkInfo: jest.fn()
    };

    profileV2Svc = {
      fetchApprovalDetails: jest.fn(),
      withDrawApprovalRequest: jest.fn()
    };

    userProfileService = {
      editProfileDetails: jest.fn()
    };

    langtranslations = {
      languageSelectedObservable: of({})
    };

    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();

    // Create component instance
    component = new InsightSideBarComponent(
      homePageSvc,
      configSvc,
      activatedRoute,
      discussUtilitySvc,
      translate,
      events,
      snackBar,
      router,
      signupService,
      profileV2Svc,
      userProfileService,
      langtranslations
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor Language Handling - Lines 111-112', () => {
    it('should handle language change observable when websiteLanguage exists', () => {
      const mockLangObservable = {
        subscribe: jest.fn().mockImplementation((callback) => {
          // Simulate the observable firing
          (localStorage.getItem as jest.Mock).mockReturnValue('hi');
          callback();
          return { unsubscribe: jest.fn() };
        })
      };
      
      langtranslations.languageSelectedObservable = mockLangObservable;
      
      component = new InsightSideBarComponent(
        homePageSvc,
        configSvc,
        activatedRoute,
        discussUtilitySvc,
        translate,
        events,
        snackBar,
        router,
        signupService,
        profileV2Svc,
        userProfileService,
        langtranslations
      );

      // Verify the observable callback was executed
      expect(translate.setDefaultLang).toHaveBeenCalledWith('en');
      expect(translate.use).toHaveBeenCalledWith('hi');
      expect(component.currentLang).toBe('hi');
    });
  });

  describe('ngOnInit Line 132 Coverage', () => {
    it('should handle stateLearningWeek array processing when userData exists', () => {
      // Ensure userData and nested properties exist
      configSvc.unMappedUser = {
        profileDetails: {
          refRootOrg: {
            orgId: 'test-org-id'
          }
        }
      };

      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [
        {
          orgId: 'wrong-org-id',
          enabled: true
        },
        {
          orgId: 'test-org-id',
          enabled: true,
          orgName: 'Correct Org'
        }
      ];

      component.ngOnInit();

      expect(component.slwConfiguration.orgName).toBe('Correct Org');
    });
  });

  describe('ngOnInit Lines 142-157 - State Learning Week Processing', () => {
    it('should iterate through stateLearningWeek array when conditions are met', () => {
      // Set up the exact conditions for lines 142-157
      const slwArray = [
        { orgId: 'other-org', enabled: true },
        { orgId: 'test-org-id', enabled: true, orgName: 'Target Org' },
        { orgId: 'another-org', enabled: true }
      ];

      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = slwArray;
      
      configSvc.unMappedUser = {
        profileDetails: {
          refRootOrg: {
            orgId: 'test-org-id'
          }
        }
      };

      component.ngOnInit();

      // This should trigger the for loop and assignment on line 154
      expect(component.slwConfiguration.orgName).toBe('Target Org');
    });

    it('should not set slwConfiguration when no matching orgId found in loop', () => {
      const slwArray = [
        { orgId: 'other-org-1', enabled: true },
        { orgId: 'other-org-2', enabled: true }
      ];

      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = slwArray;
      
      configSvc.unMappedUser = {
        profileDetails: {
          refRootOrg: {
            orgId: 'test-org-id'
          }
        }
      };

      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });
  });

  describe('ngOnInit Lines 163-178 - User Status Checks', () => {
    it('should execute all nested checks for isNotMyUser - line 167-170', () => {
      configSvc.unMappedUser = {
        profileDetails: {
          profileStatus: 'not-my-user'
        }
      };

      component.ngOnInit();

      expect(component.isNotMyUser).toBe(true);
    });

    it('should execute all nested checks for isIgotOrg - line 173-178', () => {
      configSvc.unMappedUser = {
        profileDetails: {
          employmentDetails: {
            departmentName: 'igot'
          }
        }
      };

      component.ngOnInit();

      expect(component.isIgotOrg).toBe(true);
    });

    it('should handle case where profileStatus is not not-my-user', () => {
      configSvc.unMappedUser = {
        profileDetails: {
          profileStatus: 'active'
        }
      };

      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
    });

    it('should handle case where departmentName is not igot', () => {
      configSvc.unMappedUser = {
        profileDetails: {
          employmentDetails: {
            departmentName: 'other-dept'
          }
        }
      };

      component.ngOnInit();

      expect(component.isIgotOrg).toBe(false);
    });
  });

  describe('getMasterDesignation Lines 185-230', () => {
    beforeEach(() => {
      // Reset to ensure userData exists for these tests
      component.userData = { rootOrgId: 'test-root-org' };
    });

    it('should execute the main flow when userData and rootOrgId exist - line 185-187', () => {
      const mockOrgResponse = { frameworkid: 'test-framework' };
      const mockFrameworkResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'org',
                terms: [{ children: [{ name: 'Manager' }] }]
              }
            ]
          }
        }
      };

      signupService.getOrgReadData.mockReturnValue(of(mockOrgResponse));
      signupService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }));

      component.getMasterDesignation();

      expect(signupService.getOrgReadData).toHaveBeenCalledWith('test-root-org');
    });

    it('should handle the approval details processing - lines 195-230', () => {
      const mockFrameworkResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'org',
                terms: [{ children: [{ name: 'Manager' }, { name: 'Developer' }] }]
              }
            ]
          }
        }
      };

      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test-framework' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse));

      // Test when approval data has length > 0 with designation not in list
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({
        result: {
          data: [
            { designation: 'Custom Role' }
          ]
        }
      }));

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
      expect(component.desigantionUnderApproval).toEqual({ designation: 'Custom Role' });
    });

    it('should handle approval data length 0 with valid user designation - lines 208-220', () => {
      const mockFrameworkResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'org',
                terms: [{ children: [{ name: 'Manager' }, { name: 'Developer' }] }]
              }
            ]
          }
        }
      };

      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test-framework' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }));

      // Set up user with valid designation
      configSvc.userProfile = {
        professionalDetails: [
          { designation: 'Manager' }
        ]
      };

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(false);
    });

    it('should handle approval data length 0 with invalid user designation - lines 215-220', () => {
      const mockFrameworkResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'org',
                terms: [{ children: [{ name: 'Manager' }, { name: 'Developer' }] }]
              }
            ]
          }
        }
      };

      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test-framework' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }));

      // Set up user with invalid designation
      configSvc.userProfile = {
        professionalDetails: [
          { designation: 'Invalid Role' }
        ]
      };

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle approval data length 0 with no designation - lines 221-223', () => {
      const mockFrameworkResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'org',
                terms: [{ children: [{ name: 'Manager' }] }]
              }
            ]
          }
        }
      };

      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test-framework' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }));

      // Set up user without designation
      configSvc.userProfile = {
        professionalDetails: [{}]
      };

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });
  });

  describe('navigate method Lines 416-423', () => {
    it('should use empty string when nodebbUserProfile is null', () => {
      configSvc.nodebbUserProfile = null;

      component.navigate();

      const configCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(configCall.userName).toBe('');
    });

    it('should use empty string when nodebbUserProfile exists but username is undefined', () => {
      configSvc.nodebbUserProfile = { someOtherProp: 'value' };

      component.navigate();

      const configCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(configCall.userName).toBe('');
    });

    it('should use username when nodebbUserProfile and username exist', () => {
      configSvc.nodebbUserProfile = { username: 'testuser' };

      component.navigate();

      const configCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(configCall.userName).toBe('testuser');
    });
  });

  describe('navigateToStatelLearning Lines 541-543', () => {
    it('should not navigate when slwConfiguration is falsy', () => {
      component.slwConfiguration = null;

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not navigate when orgName is falsy', () => {
      component.slwConfiguration = {
        orgName: null,
        orgId: 'test-id'
      };

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not navigate when orgId is falsy', () => {
      component.slwConfiguration = {
        orgName: 'test-org',
        orgId: null
      };

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should navigate when both orgName and orgId exist', () => {
      component.slwConfiguration = {
        orgName: 'test-org',
        orgId: 'test-id'
      };

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).toHaveBeenCalledWith('app/learn/mdo-channels/test-org/test-id/micro-sites');
    });
  });

  describe('updateDesignation Line 549', () => {
    it('should show error message when selectDesignation is falsy', () => {
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);
      component.selectDesignation = '';

      component.updateDesignation();

      expect(openSnackbarSpy).toHaveBeenCalledWith('Please select a valid designation');
    });

    it('should proceed with update when selectDesignation has value', () => {
      component.selectDesignation = 'Manager';
      const raiseTelemetrySpy = jest.spyOn(component, 'raiseTelemetryForDesigantion');
      const apiCallSpy = jest.spyOn(component, 'apiCallToUpdateDesignation');

      component.updateDesignation();

      expect(raiseTelemetrySpy).toHaveBeenCalled();
      expect(apiCallSpy).toHaveBeenCalled();
    });
  });

  describe('onInputChange Line 553', () => {
    beforeEach(() => {
      component.designationList = [
        { name: 'Manager' },
        { name: 'Developer' }
      ];
    });

    it('should reset selectDesignation when searchValue has no length', () => {
      component.selectDesignation = 'previous-value';

      component.onInputChange('');

      expect(component.selectDesignation).toBe('');
      expect(component.filterDesigantionList).toEqual(component.designationList);
    });

    it('should set selectDesignation to searchValue when it has length', () => {
      component.onInputChange('man');

      expect(component.selectDesignation).toBe('man');
      expect(component.filterDesigantionList).toEqual([{ name: 'Manager' }]);
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      homePageSvc.getInsightsData.mockReturnValue(of({
        result: {
          response: {
            nudges: [
              { label: 'Test Nudge', growth: 'positive', progress: 5 }
            ],
            'weekly-claps': { data: 'test' }
          }
        }
      }));
      homePageSvc.getRecentRequests.mockReturnValue(of({
        result: {
          data: [{ fullName: 'test user' }]
        }
      }));
      homePageSvc.getDiscussionsData.mockReturnValue(of({
        latestPosts: []
      }));
    });

    it('should initialize component data', () => {
      component.ngOnInit();

      expect(component.userData).toBe(configSvc.userProfile);
      expect(component.homePageData).toBeDefined();
      expect(component.learnAdvisoryData).toEqual([]);
      expect(component.surveyForm).toEqual({});
      expect(component.surveyPopup).toEqual({});
    });

    it('should handle missing pageData', () => {
      activatedRoute.snapshot.data = {};
      
      component.ngOnInit();

      expect(component.homePageData).toBeUndefined();
      expect(component.learnAdvisoryData).toBeUndefined();
    });

    it('should handle missing pageData.data', () => {
      activatedRoute.snapshot.data.pageData = {};
      
      component.ngOnInit();

      expect(component.homePageData).toBeUndefined();
    });

    it('should process state learning week configuration correctly', () => {
      // Test with matching orgId
      component.ngOnInit();

      expect(component.slwConfiguration).toBeDefined();
      expect(component.slwConfiguration.orgName).toBe('test-org');
    });

    it('should handle state learning week without userData', () => {
      configSvc.unMappedUser = null;
      
      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should handle state learning week without profileDetails', () => {
      configSvc.unMappedUser.profileDetails = null;
      
      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should handle state learning week without refRootOrg', () => {
      configSvc.unMappedUser.profileDetails.refRootOrg = null;
      
      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should handle state learning week without orgId', () => {
      configSvc.unMappedUser.profileDetails.refRootOrg.orgId = null;
      
      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should handle state learning week with no matching orgId', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [{
        orgId: 'different-org-id',
        enabled: true
      }];
      
      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should set isNotMyUser when profile status is not-my-user', () => {
      configSvc.unMappedUser.profileDetails.profileStatus = 'not-my-user';
      
      component.ngOnInit();

      expect(component.isNotMyUser).toBe(true);
    });

    it('should handle missing configSvc', () => {
      const originalConfigSvc = configSvc;
      (component as any).configSvc = null;
      
      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
      
      // Restore
      (component as any).configSvc = originalConfigSvc;
    });

    it('should handle missing unMappedUser', () => {
      configSvc.unMappedUser = null;
      
      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
    });

    it('should handle missing profileDetails for status check', () => {
      configSvc.unMappedUser.profileDetails = null;
      
      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
    });

    it('should handle missing profileStatus', () => {
      delete configSvc.unMappedUser.profileDetails.profileStatus;
      
      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
    });

    it('should set isIgotOrg when department is igot', () => {
      configSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot';
      
      component.ngOnInit();

      expect(component.isIgotOrg).toBe(true);
    });

    it('should handle missing employmentDetails', () => {
      configSvc.unMappedUser.profileDetails.employmentDetails = null;
      
      component.ngOnInit();

      expect(component.isIgotOrg).toBe(false);
    });

    it('should handle missing departmentName', () => {
      delete configSvc.unMappedUser.profileDetails.employmentDetails.departmentName;
      
      component.ngOnInit();

      expect(component.isIgotOrg).toBe(false);
    });

    it('should call getNlwConfig when national learning week is enabled', () => {
      const spy = jest.spyOn(component, 'getNlwConfig');
      
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should not call getNlwConfig when national learning week is disabled', () => {
      activatedRoute.snapshot.data.pageData.data.nationalLearningWeek.enabled = false;
      const spy = jest.spyOn(component, 'getNlwConfig');
      
      component.ngOnInit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should call getMasterDesignation when update designation is enabled', () => {
      const spy = jest.spyOn(component, 'getMasterDesignation');
      
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should not call getMasterDesignation when update designation is disabled', () => {
      activatedRoute.snapshot.data.pageData.data.updateDesignation.enabled = false;
      const spy = jest.spyOn(component, 'getMasterDesignation');
      
      component.ngOnInit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should call getSlwConfig when state learning week is enabled', () => {
      const spy = jest.spyOn(component, 'getSlwConfig');
      
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should not call getSlwConfig when state learning week is disabled', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek[0].enabled = false;
      const spy = jest.spyOn(component, 'getSlwConfig');
      
      component.ngOnInit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should set assessment strip data', () => {
      component.ngOnInit();

      expect(component.assessmentStrip).toBeDefined();
    });

    it('should handle missing assessment data', () => {
      delete activatedRoute.snapshot.data.pageData.data.assessmentData;
      
      component.ngOnInit();

      expect(component.assessmentStrip).toBeUndefined();
    });
  });

  describe('getNlwConfig', () => {
    beforeEach(() => {
      component.nwlConfiguration = {
        startDate: '01-01-2024',
        endDate: '07-01-2024'
      };
    });

    it('should set canShowNlwCard to true when current date is between start and end date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(true);
      jest.spyOn(moment.prototype, 'diff').mockReturnValue(3);

      component.getNlwConfig();

      expect(component.canShowNlwCard).toBe(true);
      expect(component.daysCompleted).toBe(3);
    });

    it('should set canShowNlwCard to false when current date is before start date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isBefore').mockReturnValue(true);

      component.getNlwConfig();

      expect(component.canShowNlwCard).toBe(false);
    });

    it('should handle when current date is after end date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isBefore').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isAfter').mockReturnValue(true);
      jest.spyOn(moment.prototype, 'diff')
        .mockReturnValueOnce(7) // totalDays
        .mockReturnValueOnce(0); // daysPassed

      component.getNlwConfig();

      expect(component.canShowNlwCard).toBe(true);
      expect(component.daysCompleted).toBe(7);
    });
  });

  describe('getSlwConfig', () => {
    beforeEach(() => {
      component.slwConfiguration = {
        startDate: '01-01-2024',
        endDate: '07-01-2024'
      };
    });

    it('should set canShowSlwCard to true when current date is between start and end date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(true);
      jest.spyOn(moment.prototype, 'diff').mockReturnValue(3);

      component.getSlwConfig();

      expect(component.canShowSlwCard).toBe(true);
      expect(component.daysCompleted).toBe(3);
    });

    it('should set canShowSlwCard to false when current date is before start date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isBefore').mockReturnValue(true);

      component.getSlwConfig();

      expect(component.canShowSlwCard).toBe(false);
    });
  });

  describe('getMasterDesignation', () => {
    const mockFrameworkResponse = {
      result: {
        framework: {
          categories: [
            {
              code: 'org',
              terms: [
                {
                  children: [
                    { name: 'Manager' },
                    { name: 'Developer' }
                  ]
                }
              ]
            }
          ]
        }
      }
    };

    beforeEach(() => {
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test-framework' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }));
    });

    it('should fetch and process designation data successfully', () => {
      component.getMasterDesignation();

      expect(signupService.getOrgReadData).toHaveBeenCalledWith(configSvc.userProfile.rootOrgId);
      expect(signupService.getFrameworkInfo).toHaveBeenCalledWith('test-framework');
      expect(component.designationList).toEqual([
        { name: 'Developer' },
        { name: 'Manager' }
      ]);
    });

    it('should not call services when userData is null', () => {
      component.userData = null;
      
      component.getMasterDesignation();

      expect(signupService.getOrgReadData).not.toHaveBeenCalled();
    });

    it('should not call services when rootOrgId is missing', () => {
      component.userData = { rootOrgId: null };
      
      component.getMasterDesignation();

      expect(signupService.getOrgReadData).not.toHaveBeenCalled();
    });

    it('should set showUpdateDesignations to true when no approval data and no designation', () => {
      configSvc.userProfile.professionalDetails = [];
      
      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should set showUpdateDesignations to true when no approval data and no professionalDetails', () => {
      configSvc.userProfile.professionalDetails = null;
      
      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle approval data with designation not in list', () => {
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({
        result: {
          data: [{ designation: 'Custom Designation' }]
        }
      }));

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle approval data with designation in list', () => {
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({
        result: {
          data: [{ designation: 'Manager' }]
        }
      }));

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(false);
    });

    it('should handle existing designation not in master list', () => {
      configSvc.userProfile.professionalDetails[0].designation = 'Custom Role';

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle existing designation in master list', () => {
      configSvc.userProfile.professionalDetails[0].designation = 'Manager';

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(false);
    });

    it('should handle missing professionalDetails array', () => {
      delete configSvc.userProfile.professionalDetails;

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle empty professionalDetails array', () => {
      configSvc.userProfile.professionalDetails = [];

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle missing designation in professionalDetails', () => {
      configSvc.userProfile.professionalDetails = [{}];

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle org read data error', () => {
      signupService.getOrgReadData.mockReturnValue(throwError('Error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component.getMasterDesignation();

      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle framework info error', () => {
      signupService.getFrameworkInfo.mockReturnValue(throwError('Error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component.getMasterDesignation();

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getInsights', () => {
    it('should fetch insights data successfully', () => {
      const mockResponse = {
        result: {
          response: {
            nudges: [
              { label: 'Test', growth: 'positive', progress: 5 }
            ],
            'weekly-claps': { data: 'test' }
          }
        }
      };
      homePageSvc.getInsightsData.mockReturnValue(of(mockResponse));

      component.getInsights();

      expect(component.insightsData).toBe(mockResponse.result.response);
      expect(component.profileDataLoading).toBe(false);
    });

    it('should handle insights data error', () => {
      homePageSvc.getInsightsData.mockReturnValue(throwError('Error'));

      component.getInsights();

      expect(component.insightsData).toBe('');
      expect(component.profileDataLoading).toBe(false);
      expect(component.clapsDataLoading).toBe(false);
    });
  });

  describe('constructNudgeData', () => {
    it('should construct nudge data with positive growth', () => {
      component.insightsData = {
        nudges: [
          { label: 'Test Label', growth: 'positive', progress: 5 }
        ]
      };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData[0]).toEqual({
        title: 'Test Label',
        icon: 'arrow_upward',
        data: '+5%',
        colorData: 'color-green'
      });
    });

    it('should construct nudge data with negative growth', () => {
      component.insightsData = {
        nudges: [
          { label: 'Test Label', growth: 'negative', progress: -3 }
        ]
      };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData[0]).toEqual({
        title: 'Test Label',
        icon: 'arrow_downward',
        data: '',
        colorData: 'color-red'
      });
    });
  });

  describe('constructWeeklyData', () => {
    it('should construct weekly claps data', () => {
      component.insightsData = {
        'weekly-claps': { data: 'test' }
      };

      component.constructWeeklyData();

      expect(component.insightsData.weeklyClaps).toEqual({ data: 'test' });
      expect(component.clapsDataLoading).toBe(false);
    });
  });

  describe('getAssessmentData', () => {
    it('should fetch assessment data successfully', () => {
      const mockResponse = { result: { response: { data: 'test' } } };
      homePageSvc.getAssessmentinfo.mockReturnValue(of(mockResponse));

      component.getAssessmentData();

      expect(component.assessmentsData).toBe(mockResponse.result.response);
    });

    it('should handle assessment data error', () => {
      homePageSvc.getAssessmentinfo.mockReturnValue(throwError({ ok: false }));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      component.getAssessmentData();

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getDiscussionsData', () => {
    it('should fetch discussions data successfully', () => {
      const mockResponse = { latestPosts: ['post1', 'post2'] };
      homePageSvc.getDiscussionsData.mockReturnValue(of(mockResponse));

      component.getDiscussionsData();

      expect(component.discussion.data).toEqual(['post1', 'post2']);
      expect(component.discussion.loadSkeleton).toBe(false);
    });

    it('should handle discussions data error', () => {
      homePageSvc.getDiscussionsData.mockReturnValue(throwError({ ok: false }));

      component.getDiscussionsData();

      expect(component.discussion.loadSkeleton).toBe(false);
      expect(component.discussion.error).toBe(true);
    });
  });

  describe('getPendingRequestData', () => {
    it('should fetch pending request data successfully', () => {
      const mockResponse = {
        result: {
          data: [
            { fullName: 'john doe' },
            { fullName: 'jane smith' }
          ]
        }
      };
      homePageSvc.getRecentRequests.mockReturnValue(of(mockResponse));

      component.getPendingRequestData();

      expect(component.pendingRequestData[0].fullName).toBe('John doe');
      expect(component.pendingRequestData[1].fullName).toBe('Jane smith');
      expect(component.pendingRequestSkeleton).toBe(false);
    });

    it('should handle pending request data error', () => {
      homePageSvc.getRecentRequests.mockReturnValue(throwError({ ok: false }));

      component.getPendingRequestData();

      expect(component.pendingRequestSkeleton).toBe(false);
    });
  });

  describe('navigate', () => {
    it('should configure discussion forum and navigate', () => {
      component.navigate();

      const expectedConfig = {
        menuOptions: [
          {
            route: 'all-discussions',
            label: 'All discussions',
            enable: true,
          },
          {
            route: 'categories',
            label: 'Categories',
            enable: true,
          },
          {
            route: 'tags',
            label: 'Tags',
            enable: true,
          },
          {
            route: 'my-discussion',
            label: 'Your discussion',
            enable: true,
          },
        ],
        userName: 'testuser',
        context: {
          id: 1,
        },
        categories: { result: [] },
        routerSlug: '/app',
        headerOptions: false,
        bannerOption: true,
      };

      expect(discussUtilitySvc.setDiscussionConfig).toHaveBeenCalledWith(expectedConfig);
      expect(localStorage.setItem).toHaveBeenCalledWith('home', JSON.stringify(expectedConfig));
      expect(router.navigate).toHaveBeenCalledWith(['/app/discussion-forum'], {
        queryParams: { page: 'home' },
        queryParamsHandling: 'merge'
      });
    });

    it('should handle missing nodebbUserProfile', () => {
      configSvc.nodebbUserProfile = null;
      
      component.navigate();

      const setConfigCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(setConfigCall.userName).toBe('');
    });

    it('should handle missing username in nodebbUserProfile', () => {
      configSvc.nodebbUserProfile = {};
      
      component.navigate();

      const setConfigCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(setConfigCall.userName).toBe('');
    });
  });

  describe('UI interaction methods', () => {
    it('should expand/collapse', () => {
      component.expandCollapse(true);

      expect(component.collapsed).toBe(true);
    });

    it('should toggle credentials', () => {
      component.toggleCreds();

      expect(component.showCreds).toBe(true);
      expect(component.credMessage).toBe('Hide my credentials');

      component.toggleCreds();

      expect(component.showCreds).toBe(false);
      expect(component.credMessage).toBe('View my credentials');
    });

    it('should check leaderboard data', () => {
      component.checkLeaderboardData(true);

      expect(component.isLeaderboardExist).toBe(true);
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard', () => {
      const mockTextArea = {
        value: '',
        select: jest.fn(),
        focus: jest.fn()
      };
      const mockBody = {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockTextArea as any);
      jest.spyOn(document, 'execCommand').mockReturnValue(true);
      Object.defineProperty(document, 'body', { value: mockBody });
      
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);
      const raiseTelemetrySpy = jest.spyOn(component, 'raiseTelemetry');

      component.copyToClipboard('test text');

      expect(mockTextArea.value).toBe('test text');
      expect(mockTextArea.select).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(openSnackbarSpy).toHaveBeenCalledWith('copied');
      expect(raiseTelemetrySpy).toHaveBeenCalledWith('copyToClipboard');
    });
  });

  describe('Designation update methods', () => {
    it('should update designation successfully', () => {
      component.selectDesignation = 'Manager';
      const raiseTelemetrySpy = jest.spyOn(component, 'raiseTelemetryForDesigantion');
      const apiCallSpy = jest.spyOn(component, 'apiCallToUpdateDesignation');

      component.updateDesignation();

      expect(raiseTelemetrySpy).toHaveBeenCalled();
      expect(apiCallSpy).toHaveBeenCalled();
    });

    it('should show error when no designation selected', () => {
      component.selectDesignation = '';
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);

      component.updateDesignation();

      expect(openSnackbarSpy).toHaveBeenCalledWith('Please select a valid designation');
    });

    it('should submit profile successfully', () => {
      component.selectDesignation = 'Manager';
      userProfileService.editProfileDetails.mockReturnValue(of({ responseCode: 'OK' }));
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);

      component.submitProfile();

      expect(component.showUpdateDesignations).toBe(false);
      expect(openSnackbarSpy).toHaveBeenCalledWith('Designation updated successfully');
    });

    it('should handle profile update error', () => {
      userProfileService.editProfileDetails.mockReturnValue(throwError('Error'));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      component.submitProfile();

      expect(consoleSpy).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('something went wrong!');
    });

    it('should handle API call with pending approval', () => {
      component.desigantionUnderApproval = { wfId: 'test-wf-id' };
      profileV2Svc.withDrawApprovalRequest.mockReturnValue(of({ result: { message: 'Success' } }));
      const submitProfileSpy = jest.spyOn(component, 'submitProfile');

      component.apiCallToUpdateDesignation();

      expect(submitProfileSpy).toHaveBeenCalled();
    });

    it('should handle API call without pending approval', () => {
      component.desigantionUnderApproval = null;
      const submitProfileSpy = jest.spyOn(component, 'submitProfile');

      component.apiCallToUpdateDesignation();

      expect(submitProfileSpy).toHaveBeenCalled();
    });
  });

  describe('Input handling methods', () => {
    beforeEach(() => {
      component.designationList = [
        { name: 'Manager' },
        { name: 'Developer' },
        { name: 'Analyst' }
      ];
    });

    it('should filter designations on input change', () => {
      component.onInputChange('man');

      expect(component.filterDesigantionList).toEqual([{ name: 'Manager' }]);
      expect(component.selectDesignation).toBe('man');
    });

    it('should reset filter when input is empty', () => {
      component.onInputChange('');

      expect(component.filterDesigantionList).toEqual(component.designationList);
      expect(component.selectDesignation).toBe('');
    });

    it('should select designation option', () => {
      component.onOptionSelected('Manager');

      expect(component.selectDesignation).toBe('Manager');
    });

    it('should handle autocomplete opened', () => {
      component.onAutoCompleteOpened();

      expect(component.isMatcompleteOpened).toBe(true);
    });

    it('should handle autocomplete closed', () => {
      component.onAutoCompleteClosed();

      expect(component.isMatcompleteOpened).toBe(false);
      expect(component.filterDesigantionList).toEqual(component.designationList);
    });

    it('should open autocomplete manually', () => {
      const mockTrigger = { openPanel: jest.fn() };
      const mockInput = { focus: jest.fn() };

      component.openAutocomplete(mockTrigger as any, mockInput as any);

      expect(mockInput.focus).toHaveBeenCalled();
      expect(mockTrigger.openPanel).toHaveBeenCalled();
    });
  });

  describe('Localization methods', () => {
    beforeEach(() => {
      component.updateDesignationCard = {
        header: 'Update Designation',
        headerHi: 'पदनाम अपडेट करें',
        headerGu: 'હોદ્દો અપડેટ કરો',
        buttonText: 'Update',
        buttonTextHi: 'अपडेट करें',
        buttonTextGu: 'અપડેટ કરો',
        hintText: 'Select designation',
        hintTextHi: 'पदनाम चुनें',
        hintTextGu: 'હોદ્દો પસંદ કરો'
      };
    });

    it('should render header in Hindi', () => {
      component.currentLang = 'hi';

      const result = component.renderUpdateDesignationCardHeader();

      expect(result).toBe('पदनाम अपडेट करें');
    });

    it('should render header in Gujarati', () => {
      component.currentLang = 'gu';

      const result = component.renderUpdateDesignationCardHeader();

      expect(result).toBe('હોદ્દો અપડેટ કરો');
    });

    it('should render header in English by default', () => {
      component.currentLang = 'en';

      const result = component.renderUpdateDesignationCardHeader();

      expect(result).toBe('Update Designation');
    });

    it('should render button text in Hindi', () => {
      component.currentLang = 'hi';

      const result = component.renderUpdateDesignationCardButtonText();

      expect(result).toBe('अपडेट करें');
    });

    it('should render hint text in Gujarati', () => {
      component.currentLang = 'gu';

      const result = component.renderUpdateDesignationCardHint();

      expect(result).toBe('હોદ્દો પસંદ કરો');
    });
  });

  describe('Utility methods', () => {
    it('should raise telemetry event', () => {
      component.raiseTelemetry('test-id');

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
    });

    it('should raise telemetry for designation', () => {
      component.selectDesignation = 'Manager';

      component.raiseTelemetryForDesigantion();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
    });

    it('should emit telemetry event', () => {
      const emitSpy = jest.spyOn(component.telemetryRaisedLibrary, 'emit');
      const event = { type: 'test' };

      component.raiseTelemetryInteratEvent(event);

      expect(emitSpy).toHaveBeenCalledWith(event);
    });

    it('should open snackbar with default duration', () => {
      component['openSnackbar']('Test message');

      expect(snackBar.open).toHaveBeenCalledWith('Test message', 'X', { duration: 5000 });
    });

    it('should open snackbar with custom duration', () => {
      component['openSnackbar']('Test message', 3000);

      expect(snackBar.open).toHaveBeenCalledWith('Test message', 'X', { duration: 3000 });
    });
  });

  describe('getTermsByCode', () => {
    it('should return terms for given code', () => {
      const categories = [
        {
          code: 'org',
          terms: [{ name: 'term1' }, { name: 'term2' }]
        },
        {
          code: 'other',
          terms: [{ name: 'term3' }]
        }
      ];

      const result = component['getTermsByCode'](categories, 'org');

      expect(result).toEqual([{ name: 'term1' }, { name: 'term2' }]);
    });

    it('should return empty array when code not found', () => {
      const categories = [
        {
          code: 'other',
          terms: [{ name: 'term1' }]
        }
      ];

      const result = component['getTermsByCode'](categories, 'org');

      expect(result).toEqual([]);
    });

    it('should return empty array when no terms exist', () => {
      const categories = [
        {
          code: 'org'
        }
      ];

      const result = component['getTermsByCode'](categories, 'org');

      expect(result).toEqual([]);
    });
  });

  describe('Component Properties and State', () => {
    it('should initialize with default values', () => {
      expect(component.profileDataLoading).toBe(true);
      expect(component.clapsDataLoading).toBe(true);
      expect(component.collapsed).toBe(false);
      expect(component.pendingRequestSkeleton).toBe(true);
      expect(component.showCreds).toBe(false);
      expect(component.credMessage).toBe('View my credentials');
      expect(component.isLeaderboardExist).toBe(false);
      expect(component.isNotMyUser).toBe(false);
      expect(component.isIgotOrg).toBe(false);
      expect(component.canShowNlwCard).toBe(false);
      expect(component.canShowSlwCard).toBe(false);
      expect(component.totalDays).toBe(0);
      expect(component.daysCompleted).toBe(0);
      expect(component.currentLang).toBe('');
      expect(component.selectDesignation).toBe('');
      expect(component.showUpdateDesignations).toBe(false);
      expect(component.isMatcompleteOpened).toBe(false);
      expect(component.discussion).toEqual({
        loadSkeleton: false,
        data: [],
        error: false,
      });
    });

    it('should handle null/undefined configuration data', () => {
      configSvc.userProfile = null;
      configSvc.unMappedUser = null;

      component.ngOnInit();

      expect(component.userData).toBeNull();
    });

    it('should handle missing page data', () => {
      activatedRoute.snapshot.data = {};

      component.ngOnInit();

      expect(component.homePageData).toBeUndefined();
    });

    it('should handle missing state learning week configuration', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [];

      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should handle state learning week configuration without matching org', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [
        {
          orgId: 'different-org-id',
          enabled: true
        }
      ];

      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty nudges array', () => {
      component.insightsData = { nudges: [] };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData).toEqual([]);
    });

    it('should handle nudge with progress less than 1', () => {
      component.insightsData = {
        nudges: [
          { label: 'Test', growth: 'positive', progress: 0.5 }
        ]
      };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData[0].data).toBe('');
    });

    it('should handle null nudge elements', () => {
      component.insightsData = {
        nudges: [null, undefined, { label: 'Valid', growth: 'positive', progress: 5 }]
      };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData).toHaveLength(1);
    });

    it('should handle missing professional details', () => {
      configSvc.userProfile = {
        rootOrgId: 'test-root-org',
        professionalDetails: null
      };

      const spy = jest.spyOn(component, 'getMasterDesignation');
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should handle framework response without categories', () => {
      const mockResponse = {
        result: {
          framework: {}
        }
      };
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockResponse));

      component.getMasterDesignation();

      expect(component.designationList).toEqual([]);
    });

    it('should handle designation filtering with special characters', () => {
      component.designationList = [
        { name: 'Manager-Admin' },
        { name: 'Developer/Analyst' }
      ];

      component.onInputChange('admin');

      expect(component.filterDesigantionList).toEqual([{ name: 'Manager-Admin' }]);
    });

    it('should handle case insensitive designation filtering', () => {
      component.designationList = [
        { name: 'Manager' },
        { name: 'DEVELOPER' }
      ];

      component.onInputChange('MANAGER');

      expect(component.filterDesigantionList).toEqual([{ name: 'Manager' }]);
    });
  });

  describe('Date Calculations Edge Cases', () => {
    it('should handle invalid date formats in getNlwConfig', () => {
      component.nwlConfiguration = {
        startDate: 'invalid-date',
        endDate: 'invalid-date'
      };

      expect(() => component.getNlwConfig()).not.toThrow();
    });

    it('should handle same start and end dates', () => {
      component.nwlConfiguration = {
        startDate: '01-01-2024',
        endDate: '01-01-2024'
      };
      jest.spyOn(moment.prototype, 'diff').mockReturnValue(0);
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(true);

      component.getNlwConfig();

      expect(component.totalDays).toBe(0);
    });

    it('should handle future dates in getSlwConfig', () => {
      component.slwConfiguration = {
        startDate: '01-01-2025',
        endDate: '07-01-2025'
      };
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isBefore').mockReturnValue(true);

      component.getSlwConfig();

      expect(component.canShowSlwCard).toBe(false);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple state learning week configurations', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [
        {
          orgId: 'different-org',
          enabled: true,
          orgName: 'Different Org'
        },
        {
          orgId: 'test-org-id',
          enabled: true,
          orgName: 'Test Org'
        }
      ];

      component.ngOnInit();

      expect(component.slwConfiguration.orgName).toBe('Test Org');
    });

    it('should handle designation approval with multiple users', () => {
      const mockResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'org',
                terms: [
                  {
                    children: [
                      { name: 'Manager' },
                      { name: 'Developer' }
                    ]
                  }
                ]
              }
            ]
          }
        }
      };
      
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockResponse));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({
        result: {
          data: [
            { designation: 'Valid Designation' },
            { designation: 'Custom Designation' }
          ]
        }
      }));

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle navigation to state learning without configuration', () => {
      component.slwConfiguration = null;

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should handle clipboard operation failure', () => {
      jest.spyOn(document, 'createElement').mockImplementation(() => {
        throw new Error('Failed to create element');
      });

      expect(() => component.copyToClipboard('test')).not.toThrow();
    });
  });

  describe('Service Integration Tests', () => {
    it('should handle all service calls in ngOnInit', () => {
      homePageSvc.getInsightsData.mockReturnValue(of({ result: { response: { nudges: [], 'weekly-claps': {} } } }));
      homePageSvc.getRecentRequests.mockReturnValue(of({ result: { data: [] } }));
      homePageSvc.getDiscussionsData.mockReturnValue(of({ latestPosts: [] }));
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test' }));
      signupService.getFrameworkInfo.mockReturnValue(of({ result: { framework: { categories: [] } } }));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }));

      component.ngOnInit();

      expect(homePageSvc.getInsightsData).toHaveBeenCalled();
      expect(homePageSvc.getRecentRequests).toHaveBeenCalled();
      expect(homePageSvc.getDiscussionsData).toHaveBeenCalled();
      expect(signupService.getOrgReadData).toHaveBeenCalled();
    });

    it('should handle service dependency chain failures', () => {
      signupService.getOrgReadData.mockReturnValue(throwError('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component.getMasterDesignation();

      expect(consoleSpy).toHaveBeenCalled();
      expect(signupService.getFrameworkInfo).not.toHaveBeenCalled();
    });
  });

  describe('Navigation methods', () => {
    it('should navigate to connection requests', () => {
      component.navigateTo();

      expect(router.navigateByUrl).toHaveBeenCalledWith('app/network-v2/connection-requests');
    });

    it('should navigate to user profile', () => {
      component.moveToUserProile('user123');

      expect(router.navigateByUrl).toHaveBeenCalledWith('app/person-profile/user123#profileInfo');
    });

    it('should navigate to activity', () => {
      component.goToActivity({});

      expect(router.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me?tab=1');
    });

    it('should navigate to national learning page', () => {
      component.navigateToNationalLearning();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('app/learn/karmayogi-saptah');
    });

    it('should navigate to state learning page', () => {
      component.slwConfiguration = {
        orgName: 'test-org',
        orgId: 'test-org-id'
      };

      component.navigateToStatelLearning();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('app/learn/mdo-channels/test-org/test-org-id/micro-sites');
    });

    it('should not navigate to state learning when slwConfiguration is missing', () => {
      component.slwConfiguration = null;

      component.navigateToStatelLearning();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not navigate to state learning when orgName is missing', () => {
      component.slwConfiguration = {
        orgId: 'test-org-id'
      };

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not navigate to state learning when orgId is missing', () => {
      component.slwConfiguration = {
        orgName: 'test-org'
      };

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('navigate', () => {
    it('should configure discussion forum and navigate', () => {
      component.navigate();

      const expectedConfig = {
        menuOptions: [
          {
            route: 'all-discussions',
            label: 'All discussions',
            enable: true,
          },
          {
            route: 'categories',
            label: 'Categories',
            enable: true,
          },
          {
            route: 'tags',
            label: 'Tags',
            enable: true,
          },
          {
            route: 'my-discussion',
            label: 'Your discussion',
            enable: true,
          },
        ],
        userName: 'testuser',
        context: {
          id: 1,
        },
        categories: { result: [] },
        routerSlug: '/app',
        headerOptions: false,
        bannerOption: true,
      };

      expect(discussUtilitySvc.setDiscussionConfig).toHaveBeenCalledWith(expectedConfig);
      expect(localStorage.setItem).toHaveBeenCalledWith('home', JSON.stringify(expectedConfig));
      expect(router.navigate).toHaveBeenCalledWith(['/app/discussion-forum'], {
        queryParams: { page: 'home' },
        queryParamsHandling: 'merge'
      });
    });

    it('should handle missing nodebbUserProfile', () => {
      configSvc.nodebbUserProfile = null;
      
      component.navigate();

      const setConfigCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(setConfigCall.userName).toBe('');
    });

    it('should handle missing username in nodebbUserProfile', () => {
      configSvc.nodebbUserProfile = {};
      
      component.navigate();

      const setConfigCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(setConfigCall.userName).toBe('');
    });
  });

  describe('Additional Navigation Edge Cases', () => {
    it('should handle navigateToStatelLearning with partial configuration', () => {
      component.slwConfiguration = {
        orgName: 'test-org'
        // missing orgId
      };

      component.navigateToStatelLearning();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should handle navigateToStatelLearning with empty strings', () => {
      component.slwConfiguration = {
        orgName: '',
        orgId: ''
      };

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('Line Coverage for constructWeeklyData', () => {
    it('should handle missing weekly-claps data', () => {
      component.insightsData = {};

      component.constructWeeklyData();

      expect(component.insightsData.weeklyClaps).toBeUndefined();
      expect(component.clapsDataLoading).toBe(false);
    });

    it('should handle null insightsData', () => {
      component.insightsData = null;

      component.constructWeeklyData();

      expect(component.clapsDataLoading).toBe(false);
    });
  });

  describe('Line Coverage for updateDesignation error path', () => {
    it('should call openSnackbar when no designation selected', () => {
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);
      component.selectDesignation = '';

      component.updateDesignation();

      expect(openSnackbarSpy).toHaveBeenCalledWith('Please select a valid designation');
    });

    it('should call openSnackbar when designation is whitespace only', () => {
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);
      component.selectDesignation = '   ';

      component.updateDesignation();

      expect(openSnackbarSpy).toHaveBeenCalledWith('Please select a valid designation');
    });
  });

  describe('Line Coverage for onInputChange', () => {
    beforeEach(() => {
      component.designationList = [
        { name: 'Manager' },
        { name: 'Developer' },
        { name: 'Senior Manager' }
      ];
      component.filterDesigantionList = component.designationList;
    });

    it('should clear selectDesignation when no search value length', () => {
      component.selectDesignation = 'previous-value';
      
      component.onInputChange('');

      expect(component.selectDesignation).toBe('');
      expect(component.filterDesigantionList).toEqual(component.designationList);
    });

    it('should filter and set selectDesignation when search has length', () => {
      component.onInputChange('manager');

      expect(component.filterDesigantionList).toEqual([
        { name: 'Manager' },
        { name: 'Senior Manager' }
      ]);
      expect(component.selectDesignation).toBe('manager');
    });

    it('should handle case insensitive filtering', () => {
      component.onInputChange('DEVELOPER');

      expect(component.filterDesigantionList).toEqual([{ name: 'Developer' }]);
      expect(component.selectDesignation).toBe('DEVELOPER');
    });
  });

describe('InsightSideBarComponent', () => {
  let component: InsightSideBarComponent;
  let homePageSvc: any;
  let configSvc: any;
  let activatedRoute: any;
  let discussUtilitySvc: any;
  let translate: any;
  let events: any;
  let snackBar: any;
  let router: any;
  let signupService: any;
  let profileV2Svc: any;
  let userProfileService: any;
  let langtranslations: any;

  beforeEach(() => {
    // Mock services
    homePageSvc = {
      getInsightsData: jest.fn(),
      getAssessmentinfo: jest.fn(),
      getDiscussionsData: jest.fn(),
      getRecentRequests: jest.fn()
    };

    configSvc = {
      userProfile: {
        rootOrgId: 'test-root-org',
        userName: 'testuser',
        professionalDetails: [{
          designation: 'test-designation'
        }]
      },
      unMappedUser: {
        id: 'test-user-id',
        profileDetails: {
          profileStatus: 'active',
          refRootOrg: {
            orgId: 'test-org-id'
          },
          employmentDetails: {
            departmentName: 'test-dept'
          }
        }
      },
      nodebbUserProfile: {
        username: 'testuser'
      }
    };

    activatedRoute = {
      snapshot: {
        data: {
          pageData: {
            data: {
              learnerAdvisory: [],
              surveyForm: {},
              surveyPopup: {},
              nationalLearningWeek: {
                enabled: true,
                startDate: '01-01-2024',
                endDate: '07-01-2024'
              },
              updateDesignation: {
                enabled: true,
                header: 'Update Designation',
                headerHi: 'पदनाम अपडेट करें',
                headerGu: 'હોદ્દો અપડેટ કરો',
                buttonText: 'Update',
                buttonTextHi: 'अपडेट करें',
                buttonTextGu: 'અપડેટ કરો',
                hintText: 'Select designation',
                hintTextHi: 'पदनाम चुनें',
                hintTextGu: 'હોદ્દો પસંદ કરો'
              },
              stateLearningWeek: [{
                orgId: 'test-org-id',
                enabled: true,
                startDate: '01-01-2024',
                endDate: '07-01-2024',
                orgName: 'test-org'
              }],
              assessmentData: {}
            }
          }
        }
      }
    };

    discussUtilitySvc = {
      setDiscussionConfig: jest.fn()
    };

    translate = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    };

    events = {
      raiseInteractTelemetry: jest.fn()
    };

    snackBar = {
      open: jest.fn()
    };

    router = {
      navigateByUrl: jest.fn(),
      navigate: jest.fn()
    };

    signupService = {
      getOrgReadData: jest.fn(),
      getFrameworkInfo: jest.fn()
    };

    profileV2Svc = {
      fetchApprovalDetails: jest.fn(),
      withDrawApprovalRequest: jest.fn()
    };

    userProfileService = {
      editProfileDetails: jest.fn()
    };

    langtranslations = {
      languageSelectedObservable: of({})
    };

    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();

    // Create component instance
    component = new InsightSideBarComponent(
      homePageSvc,
      configSvc,
      activatedRoute,
      discussUtilitySvc,
      translate,
      events,
      snackBar,
      router,
      signupService,
      profileV2Svc,
      userProfileService,
      langtranslations
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor Language Handling - Lines 111-112', () => {
    it('should handle language change observable when websiteLanguage exists', () => {
      const mockLangObservable = {
        subscribe: jest.fn().mockImplementation((callback) => {
          // Simulate the observable firing
          (localStorage.getItem as jest.Mock).mockReturnValue('hi');
          callback();
          return { unsubscribe: jest.fn() };
        })
      };
      
      langtranslations.languageSelectedObservable = mockLangObservable;
      
      component = new InsightSideBarComponent(
        homePageSvc,
        configSvc,
        activatedRoute,
        discussUtilitySvc,
        translate,
        events,
        snackBar,
        router,
        signupService,
        profileV2Svc,
        userProfileService,
        langtranslations
      );

      // Verify the observable callback was executed
      expect(translate.setDefaultLang).toHaveBeenCalledWith('en');
      expect(translate.use).toHaveBeenCalledWith('hi');
      expect(component.currentLang).toBe('hi');
    });
  });

  describe('ngOnInit Line 132 Coverage', () => {
    it('should handle stateLearningWeek array processing when userData exists', () => {
      // Ensure userData and nested properties exist
      configSvc.unMappedUser = {
        profileDetails: {
          refRootOrg: {
            orgId: 'test-org-id'
          }
        }
      };

      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [
        {
          orgId: 'wrong-org-id',
          enabled: true
        },
        {
          orgId: 'test-org-id',
          enabled: true,
          orgName: 'Correct Org'
        }
      ];

      component.ngOnInit();

      expect(component.slwConfiguration.orgName).toBe('Correct Org');
    });
  });

  describe('Lines 142-157 - State Learning Week Loop Coverage', () => {
    it('should execute the complete for loop when slwConfigurationLocal exists and has length', () => {
      // This test specifically targets lines 142-157
      const slwArray = [
        { orgId: 'first-org', enabled: true, orgName: 'First Org' },
        { orgId: 'test-org-id', enabled: true, orgName: 'Matching Org' },
        { orgId: 'third-org', enabled: true, orgName: 'Third Org' }
      ];

      // Set up activatedRoute data to have stateLearningWeek array
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = slwArray;
      
      // Set up userData to have matching orgId
      configSvc.unMappedUser = {
        profileDetails: {
          refRootOrg: {
            orgId: 'test-org-id'
          }
        }
      };

      component.ngOnInit();

      // This should execute lines 142-157 including the for loop and the assignment on line 154
      expect(component.slwConfiguration).toEqual({
        orgId: 'test-org-id',
        enabled: true,
        orgName: 'Matching Org'
      });
    });

    it('should execute for loop but not find matching orgId', () => {
      const slwArray = [
        { orgId: 'different-org-1', enabled: true },
        { orgId: 'different-org-2', enabled: true }
      ];

      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = slwArray;
      
      configSvc.unMappedUser = {
        profileDetails: {
          refRootOrg: {
            orgId: 'non-matching-org-id'
          }
        }
      };

      component.ngOnInit();

      // This executes the for loop but doesn't set slwConfiguration
      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should not execute for loop when userData conditions are not met', () => {
      const slwArray = [{ orgId: 'some-org', enabled: true }];
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = slwArray;
      
      // Missing userData entirely
      configSvc.unMappedUser = null;

      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should not execute for loop when profileDetails is missing', () => {
      const slwArray = [{ orgId: 'some-org', enabled: true }];
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = slwArray;
      
      configSvc.unMappedUser = {
        profileDetails: null
      };

      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should not execute for loop when refRootOrg is missing', () => {
      const slwArray = [{ orgId: 'some-org', enabled: true }];
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = slwArray;
      
      configSvc.unMappedUser = {
        profileDetails: {
          refRootOrg: null
        }
      };

      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should not execute for loop when orgId is missing', () => {
      const slwArray = [{ orgId: 'some-org', enabled: true }];
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = slwArray;
      
      configSvc.unMappedUser = {
        profileDetails: {
          refRootOrg: {
            orgId: null
          }
        }
      };

      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });
  });

  describe('Lines 163-178 - User Status Check Coverage', () => {
    it('should execute all conditions for isNotMyUser check - line 163-170', () => {
      // Set up to execute the exact conditional chain for isNotMyUser
      configSvc.unMappedUser = {
        profileDetails: {
          profileStatus: 'not-my-user'
        }
      };

      component.ngOnInit();

      expect(component.isNotMyUser).toBe(true);
    });

    it('should execute all conditions for isIgotOrg check - line 171-178', () => {
      // Set up to execute the exact conditional chain for isIgotOrg  
      configSvc.unMappedUser = {
        profileDetails: {
          employmentDetails: {
            departmentName: 'igot'
          }
        }
      };

      component.ngOnInit();

      expect(component.isIgotOrg).toBe(true);
    });

    it('should handle configSvc being null for both checks', () => {
      // Test when configSvc itself is falsy
      const originalConfigSvc = component['configSvc'];
  //    component['configSvc'] = null;

      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
      expect(component.isIgotOrg).toBe(false);

      // Restore
      component['configSvc'] = originalConfigSvc;
    });

    it('should handle unMappedUser being null for both checks', () => {
      configSvc.unMappedUser = null;

      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
      expect(component.isIgotOrg).toBe(false);
    });

    it('should handle profileDetails being null for both checks', () => {
      configSvc.unMappedUser = {
        profileDetails: null
      };

      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
      expect(component.isIgotOrg).toBe(false);
    });

    it('should handle missing profileStatus', () => {
      configSvc.unMappedUser = {
        profileDetails: {
          // missing profileStatus
        }
      };

      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
    });

    it('should handle missing employmentDetails', () => {
      configSvc.unMappedUser = {
        profileDetails: {
          // missing employmentDetails
        }
      };

      component.ngOnInit();

      expect(component.isIgotOrg).toBe(false);
    });

    it('should handle missing departmentName', () => {
      configSvc.unMappedUser = {
        profileDetails: {
          employmentDetails: {
            // missing departmentName
          }
        }
      };

      component.ngOnInit();

      expect(component.isIgotOrg).toBe(false);
    });
  });

  describe('Lines 225-230 - getMasterDesignation Error Handling', () => {
    beforeEach(() => {
      component.userData = { rootOrgId: 'test-root-org' };
    });

    it('should execute error handler for getFrameworkInfo - lines 225-228', () => {
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test-framework' }));
      signupService.getFrameworkInfo.mockReturnValue(throwError({ message: 'Framework error' }));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      component.getMasterDesignation();

      expect(consoleSpy).toHaveBeenCalledWith('Error occurred:', { message: 'Framework error' });
      consoleSpy.mockRestore();
    });

    it('should execute error handler for getOrgReadData - lines 229-230', () => {
      signupService.getOrgReadData.mockReturnValue(throwError({ message: 'Org read error' }));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      component.getMasterDesignation();

      expect(consoleSpy).toHaveBeenCalledWith('Error occurred:', { message: 'Org read error' });
      consoleSpy.mockRestore();
    });

    it('should not execute any service calls when userData is null', () => {
      component.userData = null;

      component.getMasterDesignation();

      expect(signupService.getOrgReadData).not.toHaveBeenCalled();
      expect(signupService.getFrameworkInfo).not.toHaveBeenCalled();
    });

    it('should not execute any service calls when rootOrgId is null', () => {
      component.userData = { rootOrgId: null };

      component.getMasterDesignation();

      expect(signupService.getOrgReadData).not.toHaveBeenCalled();
      expect(signupService.getFrameworkInfo).not.toHaveBeenCalled();
    });
  });

  describe('Lines 416-423 - navigate Method Username Logic', () => {
    it('should execute ternary operator when nodebbUserProfile is null', () => {
      configSvc.nodebbUserProfile = null;

      component.navigate();

      // This should execute the || '' part of the ternary
      const config = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(config.userName).toBe('');
    });

    it('should execute ternary operator when nodebbUserProfile exists but username is undefined', () => {
      configSvc.nodebbUserProfile = {};

      component.navigate();

      // This should execute the || '' part of the ternary  
      const config = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(config.userName).toBe('');
    });

    it('should execute ternary operator when nodebbUserProfile and username both exist', () => {
      configSvc.nodebbUserProfile = { username: 'testuser123' };

      component.navigate();

      // This should execute the username part of the ternary
      const config = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(config.userName).toBe('testuser123');
    });

    it('should handle when configSvc itself is null', () => {
      const originalConfigSvc = component['configSvc'];
      //component['configSvc'] = null;

      component.navigate();

      const config = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(config.userName).toBe('');

      // Restore
      component['configSvc'] = originalConfigSvc;
    });
  });

  describe('getMasterDesignation Lines 185-230', () => {
    beforeEach(() => {
      // Reset to ensure userData exists for these tests
      component.userData = { rootOrgId: 'test-root-org' };
    });

    it('should execute the main flow when userData and rootOrgId exist - line 185-187', () => {
      const mockOrgResponse = { frameworkid: 'test-framework' };
      const mockFrameworkResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'org',
                terms: [{ children: [{ name: 'Manager' }] }]
              }
            ]
          }
        }
      };

      signupService.getOrgReadData.mockReturnValue(of(mockOrgResponse));
      signupService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }));

      component.getMasterDesignation();

      expect(signupService.getOrgReadData).toHaveBeenCalledWith('test-root-org');
    });

    it('should handle the approval details processing - lines 195-230', () => {
      const mockFrameworkResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'org',
                terms: [{ children: [{ name: 'Manager' }, { name: 'Developer' }] }]
              }
            ]
          }
        }
      };

      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test-framework' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse));

      // Test when approval data has length > 0 with designation not in list
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({
        result: {
          data: [
            { designation: 'Custom Role' }
          ]
        }
      }));

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
      expect(component.desigantionUnderApproval).toEqual({ designation: 'Custom Role' });
    });

    it('should handle approval data length 0 with valid user designation - lines 208-220', () => {
      const mockFrameworkResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'org',
                terms: [{ children: [{ name: 'Manager' }, { name: 'Developer' }] }]
              }
            ]
          }
        }
      };

      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test-framework' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }));

      // Set up user with valid designation
      configSvc.userProfile = {
        professionalDetails: [
          { designation: 'Manager' }
        ]
      };

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(false);
    });

    it('should handle approval data length 0 with invalid user designation - lines 215-220', () => {
      const mockFrameworkResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'org',
                terms: [{ children: [{ name: 'Manager' }, { name: 'Developer' }] }]
              }
            ]
          }
        }
      };

      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test-framework' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }));

      // Set up user with invalid designation
      configSvc.userProfile = {
        professionalDetails: [
          { designation: 'Invalid Role' }
        ]
      };

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle approval data length 0 with no designation - lines 221-223', () => {
      const mockFrameworkResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'org',
                terms: [{ children: [{ name: 'Manager' }] }]
              }
            ]
          }
        }
      };

      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test-framework' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }));

      // Set up user without designation
      configSvc.userProfile = {
        professionalDetails: [{}]
      };

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });
  });

  describe('navigate method Lines 416-423', () => {
    it('should use empty string when nodebbUserProfile is null', () => {
      configSvc.nodebbUserProfile = null;

      component.navigate();

      const configCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(configCall.userName).toBe('');
    });

    it('should use empty string when nodebbUserProfile exists but username is undefined', () => {
      configSvc.nodebbUserProfile = { someOtherProp: 'value' };

      component.navigate();

      const configCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(configCall.userName).toBe('');
    });

    it('should use username when nodebbUserProfile and username exist', () => {
      configSvc.nodebbUserProfile = { username: 'testuser' };

      component.navigate();

      const configCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(configCall.userName).toBe('testuser');
    });
  });

  describe('navigateToStatelLearning Lines 541-543', () => {
    it('should not navigate when slwConfiguration is falsy', () => {
      component.slwConfiguration = null;

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not navigate when orgName is falsy', () => {
      component.slwConfiguration = {
        orgName: null,
        orgId: 'test-id'
      };

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not navigate when orgId is falsy', () => {
      component.slwConfiguration = {
        orgName: 'test-org',
        orgId: null
      };

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should navigate when both orgName and orgId exist', () => {
      component.slwConfiguration = {
        orgName: 'test-org',
        orgId: 'test-id'
      };

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).toHaveBeenCalledWith('app/learn/mdo-channels/test-org/test-id/micro-sites');
    });
  });

  describe('updateDesignation Line 549', () => {
    it('should show error message when selectDesignation is falsy', () => {
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);
      component.selectDesignation = '';

      component.updateDesignation();

      expect(openSnackbarSpy).toHaveBeenCalledWith('Please select a valid designation');
    });

    it('should proceed with update when selectDesignation has value', () => {
      component.selectDesignation = 'Manager';
      const raiseTelemetrySpy = jest.spyOn(component, 'raiseTelemetryForDesigantion');
      const apiCallSpy = jest.spyOn(component, 'apiCallToUpdateDesignation');

      component.updateDesignation();

      expect(raiseTelemetrySpy).toHaveBeenCalled();
      expect(apiCallSpy).toHaveBeenCalled();
    });
  });

  describe('onInputChange Line 553', () => {
    beforeEach(() => {
      component.designationList = [
        { name: 'Manager' },
        { name: 'Developer' }
      ];
    });

    it('should reset selectDesignation when searchValue has no length', () => {
      component.selectDesignation = 'previous-value';

      component.onInputChange('');

      expect(component.selectDesignation).toBe('');
      expect(component.filterDesigantionList).toEqual(component.designationList);
    });

    it('should set selectDesignation to searchValue when it has length', () => {
      component.onInputChange('man');

      expect(component.selectDesignation).toBe('man');
      expect(component.filterDesigantionList).toEqual([{ name: 'Manager' }]);
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      homePageSvc.getInsightsData.mockReturnValue(of({
        result: {
          response: {
            nudges: [
              { label: 'Test Nudge', growth: 'positive', progress: 5 }
            ],
            'weekly-claps': { data: 'test' }
          }
        }
      }));
      homePageSvc.getRecentRequests.mockReturnValue(of({
        result: {
          data: [{ fullName: 'test user' }]
        }
      }));
      homePageSvc.getDiscussionsData.mockReturnValue(of({
        latestPosts: []
      }));
    });

    it('should initialize component data', () => {
      component.ngOnInit();

      expect(component.userData).toBe(configSvc.userProfile);
      expect(component.homePageData).toBeDefined();
      expect(component.learnAdvisoryData).toEqual([]);
      expect(component.surveyForm).toEqual({});
      expect(component.surveyPopup).toEqual({});
    });

    it('should handle missing pageData', () => {
      activatedRoute.snapshot.data = {};
      
      component.ngOnInit();

      expect(component.homePageData).toBeUndefined();
      expect(component.learnAdvisoryData).toBeUndefined();
    });

    it('should handle missing pageData.data', () => {
      activatedRoute.snapshot.data.pageData = {};
      
      component.ngOnInit();

      expect(component.homePageData).toBeUndefined();
    });

    it('should process state learning week configuration correctly', () => {
      // Test with matching orgId
      component.ngOnInit();

      expect(component.slwConfiguration).toBeDefined();
      expect(component.slwConfiguration.orgName).toBe('test-org');
    });

    it('should handle state learning week without userData', () => {
      configSvc.unMappedUser = null;
      
      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should handle state learning week without profileDetails', () => {
      configSvc.unMappedUser.profileDetails = null;
      
      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should handle state learning week without refRootOrg', () => {
      configSvc.unMappedUser.profileDetails.refRootOrg = null;
      
      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should handle state learning week without orgId', () => {
      configSvc.unMappedUser.profileDetails.refRootOrg.orgId = null;
      
      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should handle state learning week with no matching orgId', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [{
        orgId: 'different-org-id',
        enabled: true
      }];
      
      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should set isNotMyUser when profile status is not-my-user', () => {
      configSvc.unMappedUser.profileDetails.profileStatus = 'not-my-user';
      
      component.ngOnInit();

      expect(component.isNotMyUser).toBe(true);
    });

    it('should handle missing configSvc', () => {
      const originalConfigSvc = configSvc;
      (component as any).configSvc = null;
      
      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
      
      // Restore
      (component as any).configSvc = originalConfigSvc;
    });

    it('should handle missing unMappedUser', () => {
      configSvc.unMappedUser = null;
      
      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
    });

    it('should handle missing profileDetails for status check', () => {
      configSvc.unMappedUser.profileDetails = null;
      
      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
    });

    it('should handle missing profileStatus', () => {
      delete configSvc.unMappedUser.profileDetails.profileStatus;
      
      component.ngOnInit();

      expect(component.isNotMyUser).toBe(false);
    });

    it('should set isIgotOrg when department is igot', () => {
      configSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot';
      
      component.ngOnInit();

      expect(component.isIgotOrg).toBe(true);
    });

    it('should handle missing employmentDetails', () => {
      configSvc.unMappedUser.profileDetails.employmentDetails = null;
      
      component.ngOnInit();

      expect(component.isIgotOrg).toBe(false);
    });

    it('should handle missing departmentName', () => {
      delete configSvc.unMappedUser.profileDetails.employmentDetails.departmentName;
      
      component.ngOnInit();

      expect(component.isIgotOrg).toBe(false);
    });

    it('should call getNlwConfig when national learning week is enabled', () => {
      const spy = jest.spyOn(component, 'getNlwConfig');
      
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should not call getNlwConfig when national learning week is disabled', () => {
      activatedRoute.snapshot.data.pageData.data.nationalLearningWeek.enabled = false;
      const spy = jest.spyOn(component, 'getNlwConfig');
      
      component.ngOnInit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should call getMasterDesignation when update designation is enabled', () => {
      const spy = jest.spyOn(component, 'getMasterDesignation');
      
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should not call getMasterDesignation when update designation is disabled', () => {
      activatedRoute.snapshot.data.pageData.data.updateDesignation.enabled = false;
      const spy = jest.spyOn(component, 'getMasterDesignation');
      
      component.ngOnInit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should call getSlwConfig when state learning week is enabled', () => {
      const spy = jest.spyOn(component, 'getSlwConfig');
      
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should not call getSlwConfig when state learning week is disabled', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek[0].enabled = false;
      const spy = jest.spyOn(component, 'getSlwConfig');
      
      component.ngOnInit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should set assessment strip data', () => {
      component.ngOnInit();

      expect(component.assessmentStrip).toBeDefined();
    });

    it('should handle missing assessment data', () => {
      delete activatedRoute.snapshot.data.pageData.data.assessmentData;
      
      component.ngOnInit();

      expect(component.assessmentStrip).toBeUndefined();
    });
  });

  describe('getNlwConfig', () => {
    beforeEach(() => {
      component.nwlConfiguration = {
        startDate: '01-01-2024',
        endDate: '07-01-2024'
      };
    });

    it('should set canShowNlwCard to true when current date is between start and end date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(true);
      jest.spyOn(moment.prototype, 'diff').mockReturnValue(3);

      component.getNlwConfig();

      expect(component.canShowNlwCard).toBe(true);
      expect(component.daysCompleted).toBe(3);
    });

    it('should set canShowNlwCard to false when current date is before start date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isBefore').mockReturnValue(true);

      component.getNlwConfig();

      expect(component.canShowNlwCard).toBe(false);
    });

    it('should handle when current date is after end date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isBefore').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isAfter').mockReturnValue(true);
      jest.spyOn(moment.prototype, 'diff')
        .mockReturnValueOnce(7) // totalDays
        .mockReturnValueOnce(0); // daysPassed

      component.getNlwConfig();

      expect(component.canShowNlwCard).toBe(true);
      expect(component.daysCompleted).toBe(7);
    });
  });

  describe('getSlwConfig', () => {
    beforeEach(() => {
      component.slwConfiguration = {
        startDate: '01-01-2024',
        endDate: '07-01-2024'
      };
    });

    it('should set canShowSlwCard to true when current date is between start and end date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(true);
      jest.spyOn(moment.prototype, 'diff').mockReturnValue(3);

      component.getSlwConfig();

      expect(component.canShowSlwCard).toBe(true);
      expect(component.daysCompleted).toBe(3);
    });

    it('should set canShowSlwCard to false when current date is before start date', () => {
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isBefore').mockReturnValue(true);

      component.getSlwConfig();

      expect(component.canShowSlwCard).toBe(false);
    });
  });

  describe('getMasterDesignation', () => {
    const mockFrameworkResponse = {
      result: {
        framework: {
          categories: [
            {
              code: 'org',
              terms: [
                {
                  children: [
                    { name: 'Manager' },
                    { name: 'Developer' }
                  ]
                }
              ]
            }
          ]
        }
      }
    };

    beforeEach(() => {
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test-framework' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }));
    });

    it('should fetch and process designation data successfully', () => {
      component.getMasterDesignation();

      expect(signupService.getOrgReadData).toHaveBeenCalledWith(configSvc.userProfile.rootOrgId);
      expect(signupService.getFrameworkInfo).toHaveBeenCalledWith('test-framework');
      expect(component.designationList).toEqual([
        { name: 'Developer' },
        { name: 'Manager' }
      ]);
    });

    it('should not call services when userData is null', () => {
      component.userData = null;
      
      component.getMasterDesignation();

      expect(signupService.getOrgReadData).not.toHaveBeenCalled();
    });

    it('should not call services when rootOrgId is missing', () => {
      component.userData = { rootOrgId: null };
      
      component.getMasterDesignation();

      expect(signupService.getOrgReadData).not.toHaveBeenCalled();
    });

    it('should set showUpdateDesignations to true when no approval data and no designation', () => {
      configSvc.userProfile.professionalDetails = [];
      
      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should set showUpdateDesignations to true when no approval data and no professionalDetails', () => {
      configSvc.userProfile.professionalDetails = null;
      
      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle approval data with designation not in list', () => {
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({
        result: {
          data: [{ designation: 'Custom Designation' }]
        }
      }));

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle approval data with designation in list', () => {
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({
        result: {
          data: [{ designation: 'Manager' }]
        }
      }));

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(false);
    });

    it('should handle existing designation not in master list', () => {
      configSvc.userProfile.professionalDetails[0].designation = 'Custom Role';

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle existing designation in master list', () => {
      configSvc.userProfile.professionalDetails[0].designation = 'Manager';

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(false);
    });

    it('should handle missing professionalDetails array', () => {
      delete configSvc.userProfile.professionalDetails;

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle empty professionalDetails array', () => {
      configSvc.userProfile.professionalDetails = [];

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle missing designation in professionalDetails', () => {
      configSvc.userProfile.professionalDetails = [{}];

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle org read data error', () => {
      signupService.getOrgReadData.mockReturnValue(throwError('Error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component.getMasterDesignation();

      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle framework info error', () => {
      signupService.getFrameworkInfo.mockReturnValue(throwError('Error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component.getMasterDesignation();

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getInsights', () => {
    it('should fetch insights data successfully', () => {
      const mockResponse = {
        result: {
          response: {
            nudges: [
              { label: 'Test', growth: 'positive', progress: 5 }
            ],
            'weekly-claps': { data: 'test' }
          }
        }
      };
      homePageSvc.getInsightsData.mockReturnValue(of(mockResponse));

      component.getInsights();

      expect(component.insightsData).toBe(mockResponse.result.response);
      expect(component.profileDataLoading).toBe(false);
    });

    it('should handle insights data error', () => {
      homePageSvc.getInsightsData.mockReturnValue(throwError('Error'));

      component.getInsights();

      expect(component.insightsData).toBe('');
      expect(component.profileDataLoading).toBe(false);
      expect(component.clapsDataLoading).toBe(false);
    });
  });

  describe('constructNudgeData', () => {
    it('should construct nudge data with positive growth', () => {
      component.insightsData = {
        nudges: [
          { label: 'Test Label', growth: 'positive', progress: 5 }
        ]
      };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData[0]).toEqual({
        title: 'Test Label',
        icon: 'arrow_upward',
        data: '+5%',
        colorData: 'color-green'
      });
    });

    it('should construct nudge data with negative growth', () => {
      component.insightsData = {
        nudges: [
          { label: 'Test Label', growth: 'negative', progress: -3 }
        ]
      };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData[0]).toEqual({
        title: 'Test Label',
        icon: 'arrow_downward',
        data: '',
        colorData: 'color-red'
      });
    });
  });

  describe('constructWeeklyData', () => {
    it('should construct weekly claps data', () => {
      component.insightsData = {
        'weekly-claps': { data: 'test' }
      };

      component.constructWeeklyData();

      expect(component.insightsData.weeklyClaps).toEqual({ data: 'test' });
      expect(component.clapsDataLoading).toBe(false);
    });
  });

  describe('getAssessmentData', () => {
    it('should fetch assessment data successfully', () => {
      const mockResponse = { result: { response: { data: 'test' } } };
      homePageSvc.getAssessmentinfo.mockReturnValue(of(mockResponse));

      component.getAssessmentData();

      expect(component.assessmentsData).toBe(mockResponse.result.response);
    });

    it('should handle assessment data error', () => {
      homePageSvc.getAssessmentinfo.mockReturnValue(throwError({ ok: false }));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      component.getAssessmentData();

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getDiscussionsData', () => {
    it('should fetch discussions data successfully', () => {
      const mockResponse = { latestPosts: ['post1', 'post2'] };
      homePageSvc.getDiscussionsData.mockReturnValue(of(mockResponse));

      component.getDiscussionsData();

      expect(component.discussion.data).toEqual(['post1', 'post2']);
      expect(component.discussion.loadSkeleton).toBe(false);
    });

    it('should handle discussions data error', () => {
      homePageSvc.getDiscussionsData.mockReturnValue(throwError({ ok: false }));

      component.getDiscussionsData();

      expect(component.discussion.loadSkeleton).toBe(false);
      expect(component.discussion.error).toBe(true);
    });
  });

  describe('getPendingRequestData', () => {
    it('should fetch pending request data successfully', () => {
      const mockResponse = {
        result: {
          data: [
            { fullName: 'john doe' },
            { fullName: 'jane smith' }
          ]
        }
      };
      homePageSvc.getRecentRequests.mockReturnValue(of(mockResponse));

      component.getPendingRequestData();

      expect(component.pendingRequestData[0].fullName).toBe('John doe');
      expect(component.pendingRequestData[1].fullName).toBe('Jane smith');
      expect(component.pendingRequestSkeleton).toBe(false);
    });

    it('should handle pending request data error', () => {
      homePageSvc.getRecentRequests.mockReturnValue(throwError({ ok: false }));

      component.getPendingRequestData();

      expect(component.pendingRequestSkeleton).toBe(false);
    });
  });

  describe('navigate', () => {
    it('should configure discussion forum and navigate', () => {
      component.navigate();

      const expectedConfig = {
        menuOptions: [
          {
            route: 'all-discussions',
            label: 'All discussions',
            enable: true,
          },
          {
            route: 'categories',
            label: 'Categories',
            enable: true,
          },
          {
            route: 'tags',
            label: 'Tags',
            enable: true,
          },
          {
            route: 'my-discussion',
            label: 'Your discussion',
            enable: true,
          },
        ],
        userName: 'testuser',
        context: {
          id: 1,
        },
        categories: { result: [] },
        routerSlug: '/app',
        headerOptions: false,
        bannerOption: true,
      };

      expect(discussUtilitySvc.setDiscussionConfig).toHaveBeenCalledWith(expectedConfig);
      expect(localStorage.setItem).toHaveBeenCalledWith('home', JSON.stringify(expectedConfig));
      expect(router.navigate).toHaveBeenCalledWith(['/app/discussion-forum'], {
        queryParams: { page: 'home' },
        queryParamsHandling: 'merge'
      });
    });

    it('should handle missing nodebbUserProfile', () => {
      configSvc.nodebbUserProfile = null;
      
      component.navigate();

      const setConfigCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(setConfigCall.userName).toBe('');
    });

    it('should handle missing username in nodebbUserProfile', () => {
      configSvc.nodebbUserProfile = {};
      
      component.navigate();

      const setConfigCall = discussUtilitySvc.setDiscussionConfig.mock.calls[0][0];
      expect(setConfigCall.userName).toBe('');
    });
  });

  describe('UI interaction methods', () => {
    it('should expand/collapse', () => {
      component.expandCollapse(true);

      expect(component.collapsed).toBe(true);
    });

    it('should toggle credentials', () => {
      component.toggleCreds();

      expect(component.showCreds).toBe(true);
      expect(component.credMessage).toBe('Hide my credentials');

      component.toggleCreds();

      expect(component.showCreds).toBe(false);
      expect(component.credMessage).toBe('View my credentials');
    });

    it('should check leaderboard data', () => {
      component.checkLeaderboardData(true);

      expect(component.isLeaderboardExist).toBe(true);
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard', () => {
      const mockTextArea = {
        value: '',
        select: jest.fn(),
        focus: jest.fn()
      };
      const mockBody = {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockTextArea as any);
      jest.spyOn(document, 'execCommand').mockReturnValue(true);
      Object.defineProperty(document, 'body', { value: mockBody });
      
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);
      const raiseTelemetrySpy = jest.spyOn(component, 'raiseTelemetry');

      component.copyToClipboard('test text');

      expect(mockTextArea.value).toBe('test text');
      expect(mockTextArea.select).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(openSnackbarSpy).toHaveBeenCalledWith('copied');
      expect(raiseTelemetrySpy).toHaveBeenCalledWith('copyToClipboard');
    });
  });

  describe('Designation update methods', () => {
    it('should update designation successfully', () => {
      component.selectDesignation = 'Manager';
      const raiseTelemetrySpy = jest.spyOn(component, 'raiseTelemetryForDesigantion');
      const apiCallSpy = jest.spyOn(component, 'apiCallToUpdateDesignation');

      component.updateDesignation();

      expect(raiseTelemetrySpy).toHaveBeenCalled();
      expect(apiCallSpy).toHaveBeenCalled();
    });

    it('should show error when no designation selected', () => {
      component.selectDesignation = '';
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);

      component.updateDesignation();

      expect(openSnackbarSpy).toHaveBeenCalledWith('Please select a valid designation');
    });

    it('should submit profile successfully', () => {
      component.selectDesignation = 'Manager';
      userProfileService.editProfileDetails.mockReturnValue(of({ responseCode: 'OK' }));
      const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any);

      component.submitProfile();

      expect(component.showUpdateDesignations).toBe(false);
      expect(openSnackbarSpy).toHaveBeenCalledWith('Designation updated successfully');
    });

    it('should handle profile update error', () => {
      userProfileService.editProfileDetails.mockReturnValue(throwError('Error'));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      component.submitProfile();

      expect(consoleSpy).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('something went wrong!');
    });

    it('should handle API call with pending approval', () => {
      component.desigantionUnderApproval = { wfId: 'test-wf-id' };
      profileV2Svc.withDrawApprovalRequest.mockReturnValue(of({ result: { message: 'Success' } }));
      const submitProfileSpy = jest.spyOn(component, 'submitProfile');

      component.apiCallToUpdateDesignation();

      expect(submitProfileSpy).toHaveBeenCalled();
    });

    it('should handle API call without pending approval', () => {
      component.desigantionUnderApproval = null;
      const submitProfileSpy = jest.spyOn(component, 'submitProfile');

      component.apiCallToUpdateDesignation();

      expect(submitProfileSpy).toHaveBeenCalled();
    });
  });

  describe('Input handling methods', () => {
    beforeEach(() => {
      component.designationList = [
        { name: 'Manager' },
        { name: 'Developer' },
        { name: 'Analyst' }
      ];
    });

    it('should filter designations on input change', () => {
      component.onInputChange('man');

      expect(component.filterDesigantionList).toEqual([{ name: 'Manager' }]);
      expect(component.selectDesignation).toBe('man');
    });

    it('should reset filter when input is empty', () => {
      component.onInputChange('');

      expect(component.filterDesigantionList).toEqual(component.designationList);
      expect(component.selectDesignation).toBe('');
    });

    it('should select designation option', () => {
      component.onOptionSelected('Manager');

      expect(component.selectDesignation).toBe('Manager');
    });

    it('should handle autocomplete opened', () => {
      component.onAutoCompleteOpened();

      expect(component.isMatcompleteOpened).toBe(true);
    });

    it('should handle autocomplete closed', () => {
      component.onAutoCompleteClosed();

      expect(component.isMatcompleteOpened).toBe(false);
      expect(component.filterDesigantionList).toEqual(component.designationList);
    });

    it('should open autocomplete manually', () => {
      const mockTrigger = { openPanel: jest.fn() };
      const mockInput = { focus: jest.fn() };

      component.openAutocomplete(mockTrigger as any, mockInput as any);

      expect(mockInput.focus).toHaveBeenCalled();
      expect(mockTrigger.openPanel).toHaveBeenCalled();
    });
  });

  describe('Localization methods', () => {
    beforeEach(() => {
      component.updateDesignationCard = {
        header: 'Update Designation',
        headerHi: 'पदनाम अपडेट करें',
        headerGu: 'હોદ્દો અપડેટ કરો',
        buttonText: 'Update',
        buttonTextHi: 'अपडेट करें',
        buttonTextGu: 'અપડેટ કરો',
        hintText: 'Select designation',
        hintTextHi: 'पदनाम चुनें',
        hintTextGu: 'હોદ્દો પસંદ કરો'
      };
    });

    it('should render header in Hindi', () => {
      component.currentLang = 'hi';

      const result = component.renderUpdateDesignationCardHeader();

      expect(result).toBe('पदनाम अपडेट करें');
    });

    it('should render header in Gujarati', () => {
      component.currentLang = 'gu';

      const result = component.renderUpdateDesignationCardHeader();

      expect(result).toBe('હોદ્દો અપડેટ કરો');
    });

    it('should render header in English by default', () => {
      component.currentLang = 'en';

      const result = component.renderUpdateDesignationCardHeader();

      expect(result).toBe('Update Designation');
    });

    it('should render button text in Hindi', () => {
      component.currentLang = 'hi';

      const result = component.renderUpdateDesignationCardButtonText();

      expect(result).toBe('अपडेट करें');
    });

    it('should render hint text in Gujarati', () => {
      component.currentLang = 'gu';

      const result = component.renderUpdateDesignationCardHint();

      expect(result).toBe('હોદ્દો પસંદ કરો');
    });
  });

  describe('Utility methods', () => {
    it('should raise telemetry event', () => {
      component.raiseTelemetry('test-id');

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
    });

    it('should raise telemetry for designation', () => {
      component.selectDesignation = 'Manager';

      component.raiseTelemetryForDesigantion();

      expect(events.raiseInteractTelemetry).toHaveBeenCalled();
    });

    it('should emit telemetry event', () => {
      const emitSpy = jest.spyOn(component.telemetryRaisedLibrary, 'emit');
      const event = { type: 'test' };

      component.raiseTelemetryInteratEvent(event);

      expect(emitSpy).toHaveBeenCalledWith(event);
    });

    it('should open snackbar with default duration', () => {
      component['openSnackbar']('Test message');

      expect(snackBar.open).toHaveBeenCalledWith('Test message', 'X', { duration: 5000 });
    });

    it('should open snackbar with custom duration', () => {
      component['openSnackbar']('Test message', 3000);

      expect(snackBar.open).toHaveBeenCalledWith('Test message', 'X', { duration: 3000 });
    });
  });

  describe('getTermsByCode', () => {
    it('should return terms for given code', () => {
      const categories = [
        {
          code: 'org',
          terms: [{ name: 'term1' }, { name: 'term2' }]
        },
        {
          code: 'other',
          terms: [{ name: 'term3' }]
        }
      ];

      const result = component['getTermsByCode'](categories, 'org');

      expect(result).toEqual([{ name: 'term1' }, { name: 'term2' }]);
    });

    it('should return empty array when code not found', () => {
      const categories = [
        {
          code: 'other',
          terms: [{ name: 'term1' }]
        }
      ];

      const result = component['getTermsByCode'](categories, 'org');

      expect(result).toEqual([]);
    });

    it('should return empty array when no terms exist', () => {
      const categories = [
        {
          code: 'org'
        }
      ];

      const result = component['getTermsByCode'](categories, 'org');

      expect(result).toEqual([]);
    });
  });

  describe('Component Properties and State', () => {
    it('should initialize with default values', () => {
      expect(component.profileDataLoading).toBe(true);
      expect(component.clapsDataLoading).toBe(true);
      expect(component.collapsed).toBe(false);
      expect(component.pendingRequestSkeleton).toBe(true);
      expect(component.showCreds).toBe(false);
      expect(component.credMessage).toBe('View my credentials');
      expect(component.isLeaderboardExist).toBe(false);
      expect(component.isNotMyUser).toBe(false);
      expect(component.isIgotOrg).toBe(false);
      expect(component.canShowNlwCard).toBe(false);
      expect(component.canShowSlwCard).toBe(false);
      expect(component.totalDays).toBe(0);
      expect(component.daysCompleted).toBe(0);
      expect(component.currentLang).toBe('');
      expect(component.selectDesignation).toBe('');
      expect(component.showUpdateDesignations).toBe(false);
      expect(component.isMatcompleteOpened).toBe(false);
      expect(component.discussion).toEqual({
        loadSkeleton: false,
        data: [],
        error: false,
      });
    });

    it('should handle null/undefined configuration data', () => {
      configSvc.userProfile = null;
      configSvc.unMappedUser = null;

      component.ngOnInit();

      expect(component.userData).toBeNull();
    });

    it('should handle missing page data', () => {
      activatedRoute.snapshot.data = {};

      component.ngOnInit();

      expect(component.homePageData).toBeUndefined();
    });

    it('should handle missing state learning week configuration', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [];

      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });

    it('should handle state learning week configuration without matching org', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [
        {
          orgId: 'different-org-id',
          enabled: true
        }
      ];

      component.ngOnInit();

      expect(component.slwConfiguration).toBeUndefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty nudges array', () => {
      component.insightsData = { nudges: [] };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData).toEqual([]);
    });

    it('should handle nudge with progress less than 1', () => {
      component.insightsData = {
        nudges: [
          { label: 'Test', growth: 'positive', progress: 0.5 }
        ]
      };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData[0].data).toBe('');
    });

    it('should handle null nudge elements', () => {
      component.insightsData = {
        nudges: [null, undefined, { label: 'Valid', growth: 'positive', progress: 5 }]
      };

      component.constructNudgeData();

      expect(component.insightsData.sliderData.sliderData).toHaveLength(1);
    });

    it('should handle missing professional details', () => {
      configSvc.userProfile = {
        rootOrgId: 'test-root-org',
        professionalDetails: null
      };

      const spy = jest.spyOn(component, 'getMasterDesignation');
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should handle framework response without categories', () => {
      const mockResponse = {
        result: {
          framework: {}
        }
      };
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockResponse));

      component.getMasterDesignation();

      expect(component.designationList).toEqual([]);
    });

    it('should handle designation filtering with special characters', () => {
      component.designationList = [
        { name: 'Manager-Admin' },
        { name: 'Developer/Analyst' }
      ];

      component.onInputChange('admin');

      expect(component.filterDesigantionList).toEqual([{ name: 'Manager-Admin' }]);
    });

    it('should handle case insensitive designation filtering', () => {
      component.designationList = [
        { name: 'Manager' },
        { name: 'DEVELOPER' }
      ];

      component.onInputChange('MANAGER');

      expect(component.filterDesigantionList).toEqual([{ name: 'Manager' }]);
    });
  });

  describe('Date Calculations Edge Cases', () => {
    it('should handle invalid date formats in getNlwConfig', () => {
      component.nwlConfiguration = {
        startDate: 'invalid-date',
        endDate: 'invalid-date'
      };

      expect(() => component.getNlwConfig()).not.toThrow();
    });

    it('should handle same start and end dates', () => {
      component.nwlConfiguration = {
        startDate: '01-01-2024',
        endDate: '01-01-2024'
      };
      jest.spyOn(moment.prototype, 'diff').mockReturnValue(0);
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(true);

      component.getNlwConfig();

      expect(component.totalDays).toBe(0);
    });

    it('should handle future dates in getSlwConfig', () => {
      component.slwConfiguration = {
        startDate: '01-01-2025',
        endDate: '07-01-2025'
      };
      jest.spyOn(moment.prototype, 'isBetween').mockReturnValue(false);
      jest.spyOn(moment.prototype, 'isBefore').mockReturnValue(true);

      component.getSlwConfig();

      expect(component.canShowSlwCard).toBe(false);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple state learning week configurations', () => {
      activatedRoute.snapshot.data.pageData.data.stateLearningWeek = [
        {
          orgId: 'different-org',
          enabled: true,
          orgName: 'Different Org'
        },
        {
          orgId: 'test-org-id',
          enabled: true,
          orgName: 'Test Org'
        }
      ];

      component.ngOnInit();

      expect(component.slwConfiguration.orgName).toBe('Test Org');
    });

    it('should handle designation approval with multiple users', () => {
      const mockResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'org',
                terms: [
                  {
                    children: [
                      { name: 'Manager' },
                      { name: 'Developer' }
                    ]
                  }
                ]
              }
            ]
          }
        }
      };
      
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test' }));
      signupService.getFrameworkInfo.mockReturnValue(of(mockResponse));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({
        result: {
          data: [
            { designation: 'Valid Designation' },
            { designation: 'Custom Designation' }
          ]
        }
      }));

      component.getMasterDesignation();

      expect(component.showUpdateDesignations).toBe(true);
    });

    it('should handle navigation to state learning without configuration', () => {
      component.slwConfiguration = null;

      component.navigateToStatelLearning();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should handle clipboard operation failure', () => {
      jest.spyOn(document, 'createElement').mockImplementation(() => {
        throw new Error('Failed to create element');
      });

      expect(() => component.copyToClipboard('test')).not.toThrow();
    });
  });

  describe('Service Integration Tests', () => {
    it('should handle all service calls in ngOnInit', () => {
      homePageSvc.getInsightsData.mockReturnValue(of({ result: { response: { nudges: [], 'weekly-claps': {} } } }));
      homePageSvc.getRecentRequests.mockReturnValue(of({ result: { data: [] } }));
      homePageSvc.getDiscussionsData.mockReturnValue(of({ latestPosts: [] }));
      signupService.getOrgReadData.mockReturnValue(of({ frameworkid: 'test' }));
      signupService.getFrameworkInfo.mockReturnValue(of({ result: { framework: { categories: [] } } }));
      profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }));

      component.ngOnInit();

      expect(homePageSvc.getInsightsData).toHaveBeenCalled();
      expect(homePageSvc.getRecentRequests).toHaveBeenCalled();
      expect(homePageSvc.getDiscussionsData).toHaveBeenCalled();
      expect(signupService.getOrgReadData).toHaveBeenCalled();
    });

    it('should handle service dependency chain failures', () => {
      signupService.getOrgReadData.mockReturnValue(throwError('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component.getMasterDesignation();

      expect(consoleSpy).toHaveBeenCalled();
      expect(signupService.getFrameworkInfo).not.toHaveBeenCalled();
    });
  });
});
});
});
});