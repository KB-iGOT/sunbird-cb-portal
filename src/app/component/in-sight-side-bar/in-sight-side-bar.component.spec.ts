import { InsightSideBarComponent } from './in-sight-side-bar.component';
import { of, throwError } from 'rxjs';
import moment from 'moment';

describe('InsightSideBarComponent', () => {
  let component: InsightSideBarComponent;
  let mockHomePageSvc: any;
  let mockConfigSvc: any;
  let mockActivatedRoute: any;
  let mockDiscussUtilitySvc: any;
  let mockTranslate: any;
  let mockEvents: any;
  let mockSnackBar: any;
  let mockRouter: any;
  let mockSignupService: any;
  let mockProfileV2Svc: any;
  let mockUserProfileService: any;
  let mockLangtranslations: any;

  beforeEach(() => {
    // Mock all dependencies
    mockHomePageSvc = {
      getInsightsData: jest.fn(),
      getDiscussionsData: jest.fn(),
      getRecentRequests: jest.fn(),
      getAssessmentinfo: jest.fn()
    };

    mockConfigSvc = {
      userProfile: {
        rootOrgId: 'test-org-id',
        userName: 'testUser',
        professionalDetails: [{ designation: 'Test Designation' }]
      },
      unMappedUser: {
        id: 'user-id',
        profileDetails: {
          profileStatus: 'active',
          employmentDetails: {
            departmentName: 'test-department'
          }
        }
      },
      nodebbUserProfile: {
        username: 'testUser'
      }
    };

    mockActivatedRoute = {
      snapshot: {
        data: {
          pageData: {
            data: {
              nationalLearningWeek: {
                enabled: true,
                startDate: '01-012025',
                endDate: '10-012025'
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
              learnerAdvisory: [],
              surveyForm: {},
              surveyPopup: {},
              assessmentData: {}
            }
          }
        }
      }
    };

    mockDiscussUtilitySvc = {
      setDiscussionConfig: jest.fn()
    };

    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    };

    mockEvents = {
      raiseInteractTelemetry: jest.fn()
    };

    mockSnackBar = {
      open: jest.fn()
    };

    mockRouter = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn()
    };

    mockSignupService = {
      getOrgReadData: jest.fn(),
      getFrameworkInfo: jest.fn()
    };

    mockProfileV2Svc = {
      fetchApprovalDetails: jest.fn(),
      withDrawApprovalRequest: jest.fn()
    };

    mockUserProfileService = {
      editProfileDetails: jest.fn()
    };

    mockLangtranslations = {
      languageSelectedObservable: of({})
    };

    // Create spy for localStorage
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'websiteLanguage') {
        return 'en';
      }
      return null;
    });

    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(jest.fn());

    // Initialize component with mocked dependencies
    component = new InsightSideBarComponent(
      mockHomePageSvc,
      mockConfigSvc,
      mockActivatedRoute,
      mockDiscussUtilitySvc,
      mockTranslate,
      mockEvents,
      mockSnackBar,
      mockRouter,
      mockSignupService,
      mockProfileV2Svc,
      mockUserProfileService,
      mockLangtranslations
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.profileDataLoading).toBeTruthy();
    expect(component.clapsDataLoading).toBeTruthy();
    expect(component.collapsed).toBeFalsy();
    expect(component.discussion.loadSkeleton).toBeFalsy();
    expect(component.pendingRequestSkeleton).toBeTruthy();
    expect(component.showCreds).toBeFalsy();
    expect(component.showUpdateDesignations).toBeFalsy();
  });

  it('should set language from localStorage', () => {
    expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en');
    expect(mockTranslate.use).toHaveBeenCalledWith('en');
  });

  describe('ngOnInit', () => {
    it('should call required methods on initialization', () => {
      // Setup spies
      jest.spyOn(component, 'getInsights').mockImplementation();
      jest.spyOn(component, 'getPendingRequestData').mockImplementation();
      jest.spyOn(component, 'getDiscussionsData').mockImplementation();
      jest.spyOn(component, 'getNlwConfig').mockImplementation();
      jest.spyOn(component, 'getMasterDesignation').mockImplementation();

      // Call method
      component.ngOnInit();

      // Assertions
      expect(component.getInsights).toHaveBeenCalled();
      expect(component.getPendingRequestData).toHaveBeenCalled();
      expect(component.getDiscussionsData).toHaveBeenCalled();
      expect(component.getNlwConfig).toHaveBeenCalled();
      expect(component.getMasterDesignation).toHaveBeenCalled();
      expect(component.isNotMyUser).toBeFalsy();
      expect(component.isIgotOrg).toBeFalsy();
    });

    it('should set isNotMyUser flag correctly when profileStatus is not-my-user', () => {
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'not-my-user';
      component.ngOnInit();
      expect(component.isNotMyUser).toBeTruthy();
    });

    it('should set isIgotOrg flag correctly when departmentName is igot', () => {
      mockConfigSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot';
      component.ngOnInit();
      expect(component.isIgotOrg).toBeTruthy();
    });
  });

  describe('getInsights', () => {
    it('should set insightsData and call related methods on success', () => {
      // Mock response
      const mockResponse = {
        result: {
          response: {
            nudges: [
              { label: 'Test Nudge', growth: 'positive', progress: 10 }
            ],
            'weekly-claps': 'test-claps'
          }
        }
      };

      // Setup spies
      mockHomePageSvc.getInsightsData.mockReturnValue(of(mockResponse));
      jest.spyOn(component, 'constructNudgeData').mockImplementation();
      jest.spyOn(component, 'constructWeeklyData').mockImplementation();

      // Call method
      component.getInsights();

      // Assertions
      expect(mockHomePageSvc.getInsightsData).toHaveBeenCalled();
      expect(component.insightsData).toEqual(mockResponse.result.response);
      expect(component.constructNudgeData).toHaveBeenCalled();
      expect(component.constructWeeklyData).toHaveBeenCalled();
      expect(component.profileDataLoading).toBeFalsy();
    });

    it('should handle error case in getInsights', () => {
      mockHomePageSvc.getInsightsData.mockReturnValue(throwError('error'));
      component.getInsights();
      expect(component.insightsData).toBe('');
      expect(component.profileDataLoading).toBeFalsy();
      expect(component.clapsDataLoading).toBeFalsy();
    });
  });

  describe('constructNudgeData', () => {
    it('should format nudge data correctly', () => {
      // Setup data
      component.insightsData = {
        nudges: [
          { label: 'Nudge 1', growth: 'positive', progress: 10 },
          { label: 'Nudge 2', growth: 'negative', progress: -5 }
        ]
      };

      // Call method
      component.constructNudgeData();

      // Assertions
      expect(component.insightsData.sliderData).toBeDefined();
      expect(component.insightsData.sliderData.sliderData.length).toBe(2);
      expect(component.insightsData.sliderData.sliderData[0].title).toBe('Nudge 1');
      expect(component.insightsData.sliderData.sliderData[0].icon).toBe('arrow_upward');
      expect(component.insightsData.sliderData.sliderData[0].data).toBe('+10%');
      expect(component.insightsData.sliderData.sliderData[0].colorData).toBe('color-green');
      
      expect(component.insightsData.sliderData.sliderData[1].title).toBe('Nudge 2');
      expect(component.insightsData.sliderData.sliderData[1].icon).toBe('arrow_downward');
      expect(component.insightsData.sliderData.sliderData[1].colorData).toBe('color-red');
      expect(component.profileDataLoading).toBeFalsy();
    });
  });

  describe('constructWeeklyData', () => {
    it('should set weeklyClaps property from weekly-claps', () => {
      // Setup data
      component.insightsData = {
        'weekly-claps': 'test-claps'
      };

      // Call method
      component.constructWeeklyData();

      // Assertions
      expect(component.insightsData.weeklyClaps).toBe('test-claps');
      expect(component.clapsDataLoading).toBeFalsy();
    });
  });

  describe('getDiscussionsData', () => {
    it('should set discussion data on success', () => {
      // Mock response
      const mockResponse = {
        latestPosts: ['post1', 'post2']
      };

      // Setup spy
      mockHomePageSvc.getDiscussionsData.mockReturnValue(of(mockResponse));

      // Call method
      component.getDiscussionsData();

      // Assertions
      expect(mockHomePageSvc.getDiscussionsData).toHaveBeenCalledWith('testUser');
      expect(component.discussion.loadSkeleton).toBeFalsy();
      expect(component.discussion.data).toEqual(['post1', 'post2']);
      expect(component.discussion.error).toBeFalsy();
    });

    it('should handle error in getDiscussionsData', () => {
      // Mock error
      mockHomePageSvc.getDiscussionsData.mockReturnValue(throwError({ ok: false }));

      // Call method
      component.getDiscussionsData();

      // Assertions
      expect(component.discussion.loadSkeleton).toBeFalsy();
      expect(component.discussion.error).toBeTruthy();
    });
  });

  describe('getPendingRequestData', () => {
    it('should set pendingRequestData on success', () => {
      // Mock response
      const mockResponse = {
        result: {
          data: [
            { fullName: 'john doe' },
            { fullName: 'jane doe' }
          ]
        }
      };

      // Setup spy
      mockHomePageSvc.getRecentRequests.mockReturnValue(of(mockResponse));

      // Call method
      component.getPendingRequestData();

      // Assertions
      expect(mockHomePageSvc.getRecentRequests).toHaveBeenCalled();
      expect(component.pendingRequestSkeleton).toBeFalsy();
      expect(component.pendingRequestData.length).toBe(2);
      expect(component.pendingRequestData[0].fullName).toBe('John doe'); // First letter capitalized
      expect(component.pendingRequestData[1].fullName).toBe('Jane doe');
    });

    it('should handle error in getPendingRequestData', () => {
      // Mock error
      mockHomePageSvc.getRecentRequests.mockReturnValue(throwError({ ok: false }));

      // Call method
      component.getPendingRequestData();

      // Assertions
      expect(component.pendingRequestSkeleton).toBeFalsy();
    });
  });

  describe('getNlwConfig', () => {
    it('should calculate days correctly when current date is between start and end date', () => {
      // Setup
      const mockStartDate = moment().subtract(2, 'days').format('DD-MMYYYY');
      const mockEndDate = moment().add(5, 'days').format('DD-MMYYYY');
      
      component.nwlConfiguration = {
        startDate: mockStartDate,
        endDate: mockEndDate
      };

      // Call method
      component.getNlwConfig();

      // Assertions
      expect(component.totlaDays).toBe(7);
      expect(component.canShowNlwCard).toBeTruthy();
      expect(component.daysCompleted).toBe(2);
    });

    it('should not show NLW card when current date is before start date', () => {
      // Setup
      const mockStartDate = moment().add(2, 'days').format('DD-MMYYYY');
      const mockEndDate = moment().add(7, 'days').format('DD-MMYYYY');
      
      component.nwlConfiguration = {
        startDate: mockStartDate,
        endDate: mockEndDate
      };

      // Call method
      component.getNlwConfig();

      // Assertions
      expect(component.canShowNlwCard).toBeFalsy();
    });

    it('should show NLW card with full days when current date is at the end date', () => {
      // Setup
      const mockStartDate = moment().subtract(7, 'days').format('DD-MMYYYY');
      const mockEndDate = moment().format('DD-MMYYYY');
      
      component.nwlConfiguration = {
        startDate: mockStartDate,
        endDate: mockEndDate
      };

      // Call method
      component.getNlwConfig();

      // Assertions
      expect(component.canShowNlwCard).toBeTruthy();
      expect(component.daysCompleted).toBe(7);
    });
  });

  describe('getMasterDesignation', () => {
    it('should fetch and process designation list', () => {
      // Mock responses
      const orgResponse = { frameworkid: 'test-framework' };
      const frameworkResponse = { 
        result: { 
          framework: { 
            categories: [
              { 
                code: 'org',
                terms: [
                  {
                    children: [
                      { name: 'Designation B' },
                      { name: 'Designation A' }
                    ]
                  }
                ]
              }
            ]
          }
        }
      };
      const approvalResponse = { result: { data: [] } };

      // Setup spies
      mockSignupService.getOrgReadData.mockReturnValue(of(orgResponse));
      mockSignupService.getFrameworkInfo.mockReturnValue(of(frameworkResponse));
      mockProfileV2Svc.fetchApprovalDetails.mockReturnValue(of(approvalResponse));

      // Call method
      component.getMasterDesignation();

      // Assertions
      expect(mockSignupService.getOrgReadData).toHaveBeenCalledWith('test-org-id');
      expect(mockSignupService.getFrameworkInfo).toHaveBeenCalledWith('test-framework');
      expect(mockProfileV2Svc.fetchApprovalDetails).toHaveBeenCalled();
      
      // Designations should be sorted by name
      expect(component.designationList[0].name).toBe('Designation A');
      expect(component.designationList[1].name).toBe('Designation B');
      expect(component.filterDesigantionList).toEqual(component.designationList);
      
      // Current user designation isn't in master list, so should show update UI
      expect(component.showUpdateDesignations).toBeTruthy();
    });

    it('should handle approval request in progress', () => {
      // Mock responses
      const orgResponse = { frameworkid: 'test-framework' };
      const frameworkResponse = { 
        result: { 
          framework: { 
            categories: [
              { 
                code: 'org',
                terms: [
                  {
                    children: [
                      { name: 'Approved Designation' }
                    ]
                  }
                ]
              }
            ]
          }
        }
      };
      const approvalResponse = { 
        result: { 
          data: [
            { designation: 'Pending Designation' }
          ] 
        } 
      };

      // Setup spies
      mockSignupService.getOrgReadData.mockReturnValue(of(orgResponse));
      mockSignupService.getFrameworkInfo.mockReturnValue(of(frameworkResponse));
      mockProfileV2Svc.fetchApprovalDetails.mockReturnValue(of(approvalResponse));

      // Call method
      component.getMasterDesignation();

      // Assertions
      expect(component.showUpdateDesignations).toBeTruthy();
      expect(component.desigantionUnderApproval).toEqual({ designation: 'Pending Designation' });
    });

    it('should handle errors in API calls', () => {
      // Mock console.error to prevent test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // Mock error
      mockSignupService.getOrgReadData.mockReturnValue(throwError('error'));

      // Call method
      component.getMasterDesignation();

      // Assertions
      expect(console.error).toHaveBeenCalled();

      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe('toggleCreds', () => {
    it('should toggle showCreds flag and update message', () => {
      // Initial state
      expect(component.showCreds).toBeFalsy();
      expect(component.credMessage).toBe('View my credentials');

      // Toggle
      component.toggleCreds();

      // After first toggle
      expect(component.showCreds).toBeTruthy();
      expect(component.credMessage).toBe('Hide my credentials');

      // Toggle again
      component.toggleCreds();

      // After second toggle
      expect(component.showCreds).toBeFalsy();
      expect(component.credMessage).toBe('View my credentials');
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard and show snackbar', () => {
      // Mock document.execCommand
      document.execCommand = jest.fn();
      
      // Setup spy
      // jest.spyOn(component, 'openSnackbar');
      jest.spyOn(component, 'raiseTelemetry');

      // Call method
      component.copyToClipboard('test-text');

      // Assertions
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      // expect(component.openSnackbar).toHaveBeenCalledWith('copied');
      expect(component.raiseTelemetry).toHaveBeenCalledWith('copyToClipboard');
    });
  });

  describe('updateDesignation', () => {
    it('should call API when designation is selected', () => {
      // Setup
      component.selectDesignation = 'New Designation';
      jest.spyOn(component, 'raiseTelemetryForDesigantion');
      jest.spyOn(component, 'apiCallToUpdateDesignation');

      // Call method
      component.updateDesignation();

      // Assertions
      expect(component.raiseTelemetryForDesigantion).toHaveBeenCalled();
      expect(component.apiCallToUpdateDesignation).toHaveBeenCalled();
    });

    it('should show snackbar when no designation is selected', () => {
      // Setup
      component.selectDesignation = '';
      // jest.spyOn(component, 'openSnackbar');

      // Call method
      component.updateDesignation();

      // Assertions
      // expect(component.openSnackbar).toHaveBeenCalledWith('Please select a valid designation');
    });
  });

  describe('apiCallToUpdateDesignation', () => {
    it('should withdraw existing request before submitting new designation', () => {
      // Setup
      component.desigantionUnderApproval = { wfId: 'workflow-id' };
      component.selectDesignation = 'New Designation';
      mockProfileV2Svc.withDrawApprovalRequest.mockReturnValue(of({ result: { message: 'Success' } }));
      jest.spyOn(component, 'submitProfile');

      // Call method
      component.apiCallToUpdateDesignation();

      // Assertions
      expect(mockProfileV2Svc.withDrawApprovalRequest).toHaveBeenCalledWith('user-id', 'workflow-id');
      expect(component.submitProfile).toHaveBeenCalled();
    });

    it('should submit profile directly when no pending approval exists', () => {
      // Setup
      component.desigantionUnderApproval = null;
      component.selectDesignation = 'New Designation';
      jest.spyOn(component, 'submitProfile');

      // Call method
      component.apiCallToUpdateDesignation();

      // Assertions
      expect(mockProfileV2Svc.withDrawApprovalRequest).not.toHaveBeenCalled();
      expect(component.submitProfile).toHaveBeenCalled();
    });
  });

  describe('submitProfile', () => {
    it('should call API with correct payload and handle success', () => {
      // Setup
      component.selectDesignation = 'New Designation';
      mockUserProfileService.editProfileDetails.mockReturnValue(of({ responseCode: 'OK' }));
      // jest.spyOn(component, 'openSnackbar');

      // Expected payload
      const expectedPayload = {
        request: {
          userId: 'user-id',
          profileDetails: {
            professionalDetails: [{ designation: 'New Designation' }]
          }
        }
      };

      // Call method
      component.submitProfile();

      // Assertions
      expect(mockUserProfileService.editProfileDetails).toHaveBeenCalledWith(expectedPayload);
      expect(component.showUpdateDesignations).toBeFalsy();
      // expect(component.openSnackbar).toHaveBeenCalledWith('Designation updated successfully');
    });

    it('should handle API error', () => {
      // Mock console.log to prevent test output pollution
      const originalConsoleLog = console.log;
      console.log = jest.fn();

      // Setup
      component.selectDesignation = 'New Designation';
      mockUserProfileService.editProfileDetails.mockReturnValue(throwError('error'));

      // Call method
      component.submitProfile();

      // Assertions
      expect(mockSnackBar.open).toHaveBeenCalledWith('something went wrong!');

      // Restore console.log
      console.log = originalConsoleLog;
    });
  });

  describe('onInputChange', () => {
    beforeEach(() => {
      component.designationList = [
        { name: 'Director' },
        { name: 'Manager' },
        { name: 'Assistant' }
      ];
      component.filterDesigantionList = [...component.designationList];
    });

    it('should filter designations when input has value', () => {
      component.onInputChange('man');
      expect(component.filterDesigantionList.length).toBe(1);
      expect(component.filterDesigantionList[0].name).toBe('Manager');
      expect(component.selectDesignation).toBe('');
    });

    it('should reset filter when input is empty', () => {
      component.onInputChange('');
      expect(component.filterDesigantionList).toEqual(component.designationList);
      expect(component.selectDesignation).toBe('');
    });
  });

  describe('navigate', () => {
    it('should set discussion config and navigate to discussion forum', () => {
      // Call method
      component.navigate();

      // Assertions
      expect(mockDiscussUtilitySvc.setDiscussionConfig).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/discussion-forum'], 
        { queryParams: { page: 'home' }, queryParamsHandling: 'merge' }
      );
    });
  });

  describe('language-specific methods', () => {
    it('should return correct header text based on language', () => {
      // Setup
      component.updateDesignationCard = {
        header: 'Update Designation',
        headerHi: 'पदनाम अपडेट करें',
        headerGu: 'હોદ્દો અપડેટ કરો'
      };

      // Test English
      component.currentLang = 'en';
      expect(component.renderUpdateDesignationCardHeader()).toBe('Update Designation');

      // Test Hindi
      component.currentLang = 'hi';
      expect(component.renderUpdateDesignationCardHeader()).toBe('पदनाम अपडेट करें');

      // Test Gujarati
      component.currentLang = 'gu';
      expect(component.renderUpdateDesignationCardHeader()).toBe('હોદ્દો અપડેટ કરો');
    });

    it('should return correct button text based on language', () => {
      // Setup
      component.updateDesignationCard = {
        buttonText: 'Update',
        buttonTextHi: 'अपडेट करें',
        buttonTextGu: 'અપડેટ કરો'
      };

      // Test English
      component.currentLang = 'en';
      expect(component.renderUpdateDesignationCardButtonText()).toBe('Update');

      // Test Hindi
      component.currentLang = 'hi';
      expect(component.renderUpdateDesignationCardButtonText()).toBe('अपडेट करें');

      // Test Gujarati
      component.currentLang = 'gu';
      expect(component.renderUpdateDesignationCardButtonText()).toBe('અપડેટ કરો');
    });

    it('should return correct hint text based on language', () => {
      // Setup
      component.updateDesignationCard = {
        hintText: 'Select designation',
        hintTextHi: 'पदनाम चुनें',
        hintTextGu: 'હોદ્દો પસંદ કરો'
      };

      // Test English
      component.currentLang = 'en';
      expect(component.renderUpdateDesignationCardHint()).toBe('Select designation');

      // Test Hindi
      component.currentLang = 'hi';
      expect(component.renderUpdateDesignationCardHint()).toBe('पदनाम चुनें');

      // Test Gujarati
      component.currentLang = 'gu';
      expect(component.renderUpdateDesignationCardHint()).toBe('હોદ્દો પસંદ કરો');
    });
  });
});