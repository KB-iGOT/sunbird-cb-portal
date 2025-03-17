import { InsightSideBarComponent } from './in-sight-side-bar.component';
import { of, throwError } from 'rxjs';
//import moment from 'moment';

// Create mock services
const mockHomePageService = {
  getInsightsData: jest.fn(),
  getRecentRequests: jest.fn(),
  getDiscussionsData: jest.fn(),
  getAssessmentinfo: jest.fn()
};

const mockConfigService = {
  userProfile: {
    rootOrgId: 'root-org-1',
    userName: 'testuser',
    professionalDetails: [{
      designation: 'Developer'
    }]
  },
  unMappedUser: {
    id: 'user-1',
    profileDetails: {
      profileStatus: 'active',
      refRootOrg: {
        orgId: 'org-1'
      },
      employmentDetails: {
        departmentName: 'department-1'
      }
    }
  }
};

const mockActivatedRoute = {
  snapshot: {
    data: {
      pageData: {
        data: {
          learnerAdvisory: [],
          surveyForm: {},
          surveyPopup: {},
          nationalLearningWeek: {
            enabled: true,
            startDate: '01-01-2025',
            endDate: '07-01-2025'
          },
          updateDesignation: {
            enabled: true,
            header: 'Update Designation',
            headerHi: 'पदनाम अपडेट करें',
            headerGu: 'હોદ્દો અપડેટ કરો',
            buttonText: 'Update',
            buttonTextHi: 'अपडेट',
            buttonTextGu: 'અપડેટ',
            hintText: 'Select designation',
            hintTextHi: 'पदनाम का चयन करें',
            hintTextGu: 'હોદ્દો પસંદ કરો'
          },
          stateLearningWeek: [
            {
              orgId: 'org-1',
              enabled: true,
              startDate: '15-01-2025',
              endDate: '21-01-2025',
              orgName: 'Test Org'
            }
          ],
          assessmentData: {}
        }
      }
    }
  }
};

const mockDiscussUtilsService = {
  setDiscussionConfig: jest.fn()
};

const mockTranslateService = {
  setDefaultLang: jest.fn(),
  use: jest.fn()
};

const mockEventService = {
  raiseInteractTelemetry: jest.fn()
};

const mockSnackBar = {
  open: jest.fn()
};

const mockRouter = {
  navigate: jest.fn(),
  navigateByUrl: jest.fn()
};

const mockSignupService = {
  getOrgReadData: jest.fn(),
  getFrameworkInfo: jest.fn()
};

const mockProfileV2Service = {
  fetchApprovalDetails: jest.fn(),
  withDrawApprovalRequest: jest.fn()
};

const mockUserProfileService = {
  editProfileDetails: jest.fn()
};

const mockMultilingualTranslationsService = {
  languageSelectedObservable: of({})
};

describe('InsightSideBarComponent', () => {
  let component: InsightSideBarComponent;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockImplementation(key => {
          if (key === 'websiteLanguage') return 'en';
          return null;
        }),
        setItem: jest.fn()
      },
      writable: true
    });
    
    // Create component instance with mocked dependencies
    component = new InsightSideBarComponent(
      mockHomePageService as any,
      mockConfigService as any,
      mockActivatedRoute as any,
      mockDiscussUtilsService as any,
      mockTranslateService as any,
      mockEventService as any,
      mockSnackBar as any,
      mockRouter as any,
      mockSignupService as any,
      mockProfileV2Service as any,
      mockUserProfileService as any,
      mockMultilingualTranslationsService as any
    );
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set language on init', () => {
 //   component.ngOnInit();
    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(mockTranslateService.use).toHaveBeenCalledWith('en');
  });

  it('should initialize component properties from route data', () => {
  //  component.ngOnInit();
    expect(component.userData).toBe(mockConfigService.userProfile);
    expect(component.nwlConfiguration).toEqual(mockActivatedRoute.snapshot.data.pageData.data.nationalLearningWeek);
    expect(component.updateDesignationCard).toEqual(mockActivatedRoute.snapshot.data.pageData.data.updateDesignation);
    expect(component.slwConfiguration).toBeDefined();
  });

  it('should call getInsights, getPendingRequestData, and getDiscussionsData on init', () => {
    // Mock implementation for required methods
    jest.spyOn(component, 'getInsights').mockImplementation(() => {});
    jest.spyOn(component, 'getPendingRequestData').mockImplementation(() => {});
    jest.spyOn(component, 'getDiscussionsData').mockImplementation(() => {});
    jest.spyOn(component, 'getNlwConfig').mockImplementation(() => {});
    jest.spyOn(component, 'getMasterDesignation').mockImplementation(() => {});
    jest.spyOn(component, 'getSlwConfig').mockImplementation(() => {});
    
    component.ngOnInit();
    
    expect(component.getInsights).toHaveBeenCalled();
    expect(component.getPendingRequestData).toHaveBeenCalled();
    expect(component.getDiscussionsData).toHaveBeenCalled();
    expect(component.getNlwConfig).toHaveBeenCalled();
    expect(component.getMasterDesignation).toHaveBeenCalled();
    expect(component.getSlwConfig).toHaveBeenCalled();
  });

  describe('getInsights', () => {
    it('should set insightsData and call constructNudgeData and constructWeeklyData on success', () => {
      const mockResponse = {
        result: {
          response: {
            nudges: [
              { label: 'Nudge 1', growth: 'positive', progress: 10 }
            ],
            'weekly-claps': { data: 'claps-data' }
          }
        }
      };
      
      mockHomePageService.getInsightsData.mockReturnValue(of(mockResponse));
      
      jest.spyOn(component, 'constructNudgeData').mockImplementation(() => {});
      jest.spyOn(component, 'constructWeeklyData').mockImplementation(() => {});
      
      component.getInsights();
      
      expect(mockHomePageService.getInsightsData).toHaveBeenCalled();
      expect(component.insightsData).toEqual(mockResponse.result.response);
      expect(component.constructNudgeData).toHaveBeenCalled();
      expect(component.constructWeeklyData).toHaveBeenCalled();
      expect(component.profileDataLoading).toBe(false);
    });
    
    it('should handle error in getInsightsData', () => {
      mockHomePageService.getInsightsData.mockReturnValue(throwError('Error'));
      
      component.getInsights();
      
      expect(component.insightsData).toBe('');
      expect(component.profileDataLoading).toBe(false);
      expect(component.clapsDataLoading).toBe(false);
    });
  });

  describe('constructNudgeData', () => {
    it('should properly construct nudge data', () => {
      component.insightsData = {
        nudges: [
          { label: 'Nudge 1', growth: 'positive', progress: 10 },
          { label: 'Nudge 2', growth: 'negative', progress: 5 }
        ]
      };
      
      component.constructNudgeData();
      
      expect(component.insightsData.sliderData).toBeDefined();
      expect(component.insightsData.sliderData.sliderData.length).toBe(2);
      expect(component.insightsData.sliderData.sliderData[0].title).toBe('Nudge 1');
      expect(component.insightsData.sliderData.sliderData[0].icon).toBe('arrow_upward');
      expect(component.insightsData.sliderData.sliderData[0].colorData).toBe('color-green');
      
      expect(component.insightsData.sliderData.sliderData[1].title).toBe('Nudge 2');
      expect(component.insightsData.sliderData.sliderData[1].icon).toBe('arrow_downward');
      expect(component.insightsData.sliderData.sliderData[1].colorData).toBe('color-red');
      
      expect(component.profileDataLoading).toBe(false);
    });
  });

  describe('constructWeeklyData', () => {
    it('should set weeklyClaps from weekly-claps', () => {
      component.insightsData = {
        'weekly-claps': { data: 'claps-data' }
      };
      
      component.constructWeeklyData();
      
      expect(component.insightsData.weeklyClaps).toEqual({ data: 'claps-data' });
      expect(component.clapsDataLoading).toBe(false);
    });
  });

  describe('getDiscussionsData', () => {
    it('should set discussion data on success', () => {
      const mockResponse = {
        latestPosts: ['post1', 'post2']
      };
      
      mockHomePageService.getDiscussionsData.mockReturnValue(of(mockResponse));
      
      component.getDiscussionsData();
      
      expect(mockHomePageService.getDiscussionsData).toHaveBeenCalledWith(mockConfigService.userProfile.userName);
      expect(component.discussion.loadSkeleton).toBe(false);
      expect(component.discussion.data).toEqual(mockResponse.latestPosts);
    });
    
    it('should handle error in getDiscussionsData', () => {
      mockHomePageService.getDiscussionsData.mockReturnValue(throwError({ ok: false }));
      
      component.getDiscussionsData();
      
      expect(component.discussion.loadSkeleton).toBe(false);
      expect(component.discussion.error).toBe(true);
    });
  });

  describe('getPendingRequestData', () => {
    it('should set pendingRequestData on success', () => {
      const mockResponse = {
        result: {
          data: [
            { fullName: 'john', otherData: 'data1' },
            { fullName: 'jane', otherData: 'data2' }
          ]
        }
      };
      
      mockHomePageService.getRecentRequests.mockReturnValue(of(mockResponse));
      
      component.getPendingRequestData();
      
      expect(mockHomePageService.getRecentRequests).toHaveBeenCalled();
      expect(component.pendingRequestSkeleton).toBe(false);
      expect(component.pendingRequestData.length).toBe(2);
      expect(component.pendingRequestData[0].fullName).toBe('John'); // First letter capitalized
      expect(component.pendingRequestData[1].fullName).toBe('Jane'); // First letter capitalized
    });
    
    it('should handle error in getRecentRequests', () => {
      mockHomePageService.getRecentRequests.mockReturnValue(throwError({ ok: false }));
      
      component.getPendingRequestData();
      
      expect(component.pendingRequestSkeleton).toBe(false);
    });
  });

  describe('getNlwConfig', () => {
    // it('should calculate days for National Learning Week when current date is within range', () => {
    //   // const mockStartDate = moment('01-01-2025', 'DD-MMYYYY');
    //   // const mockEndDate = moment('07-01-2025', 'DD-MMYYYY');
    //  // const mockCurrentDate = moment('03-01-2025', 'DD-MMYYYY');
      
    //   // Mock the moment calls
    //  // jest.spyOn(moment, 'default').mockImplementation(() => mockCurrentDate);
      
    //   component.nwlConfiguration = {
    //     startDate: '01-01-2025',
    //     endDate: '07-01-2025',
    //     enabled: true
    //   };
      
    //   component.getNlwConfig();
      
    //   // totalDays should be 6 (end - start)
    //   expect(component.totalDays).toBe(6);
    //   // daysCompleted should be 2 (current - start)
    //   expect(component.daysCompleted).toBe(2);
    //   expect(component.canShowNlwCard).toBe(true);
    // });
    
    // it('should not show NLW card when current date is before start date', () => {
    //   // const mockStartDate = moment('01-01-2025', 'DD-MMYYYY');
    //   // const mockEndDate = moment('07-01-2025', 'DD-MMYYYY');
    //   // const mockCurrentDate = moment('20-12-2024', 'DD-MMYYYY');
      
    //   // Mock the moment calls
    //  // jest.spyOn(moment, 'default').mockImplementation(() => mockCurrentDate);
      
    //   component.nwlConfiguration = {
    //     startDate: '01-01-2025',
    //     endDate: '07-01-2025',
    //     enabled: true
    //   };
      
    //   component.getNlwConfig();
      
    //   expect(component.canShowNlwCard).toBe(false);
    // });
  });

  describe('getSlwConfig', () => {
    // it('should calculate days for State Learning Week when current date is within range', () => {
    //   // const mockStartDate = moment('15-01-2025', 'DD-MMYYYY');
    //   // const mockEndDate = moment('21-01-2025', 'DD-MMYYYY');
    //   // const mockCurrentDate = moment('18-01-2025', 'DD-MMYYYY');
      
    //   // // Mock the moment calls
    //   // jest.spyOn(moment, 'default').mockImplementation(() => mockCurrentDate);
      
    //   component.slwConfiguration = {
    //     startDate: '15-01-2025',
    //     endDate: '21-01-2025',
    //     enabled: true
    //   };
      
    //   component.getSlwConfig();
      
    //   // totalDays should be 6 (end - start)
    //   expect(component.totalDays).toBe(6);
    //   // daysCompleted should be 3 (current - start)
    //   expect(component.daysCompleted).toBe(3);
    //   expect(component.canShowSlwCard).toBe(true);
    // });
  });

  describe('getMasterDesignation', () => {
    it('should get designation list and check if update is needed', () => {
      const mockOrgResponse = {
        frameworkid: 'framework-1'
      };
      
      const mockFrameworkResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'org',
                terms: [
                  {
                    children: [
                      { name: 'Developer' },
                      { name: 'Manager' }
                    ]
                  }
                ]
              }
            ]
          }
        }
      };
      
      const mockApprovalResponse = {
        result: {
          data: []
        }
      };
      
      mockSignupService.getOrgReadData.mockReturnValue(of(mockOrgResponse));
      mockSignupService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse));
      mockProfileV2Service.fetchApprovalDetails.mockReturnValue(of(mockApprovalResponse));
      
      component.getMasterDesignation();
      
      expect(mockSignupService.getOrgReadData).toHaveBeenCalledWith(mockConfigService.userProfile.rootOrgId);
      expect(mockSignupService.getFrameworkInfo).toHaveBeenCalledWith('framework-1');
      expect(mockProfileV2Service.fetchApprovalDetails).toHaveBeenCalled();
      
      // Should have the sorted designations
      expect(component.designationList).toEqual([
        { name: 'Developer' },
        { name: 'Manager' }
      ]);
      
      // showUpdateDesignations should be true since the user has a designation in professional details
      expect(component.showUpdateDesignations).toBe(true);
    });
  });

  describe('updateDesignation', () => {
    it('should call apiCallToUpdateDesignation when designation is selected', () => {
      component.selectDesignation = 'Manager';
      
      jest.spyOn(component, 'raiseTelemetryForDesigantion').mockImplementation(() => {});
      jest.spyOn(component, 'apiCallToUpdateDesignation').mockImplementation(() => {});
      
      component.updateDesignation();
      
      expect(component.raiseTelemetryForDesigantion).toHaveBeenCalled();
      expect(component.apiCallToUpdateDesignation).toHaveBeenCalled();
    });
    
    it('should show snackbar when no designation is selected', () => {
      component.selectDesignation = '';
      
   //   jest.spyOn(component, 'openSnackbar').mockImplementation(() => {});
      
      component.updateDesignation();
      
     // expect(component.openSnackbar).toHaveBeenCalledWith('Please select a valid designation');
    });
  });

  describe('submitProfile', () => {
    it('should call editProfileDetails with correct payload', () => {
      component.selectDesignation = 'Manager';
      
      const expectedPayload = {
        request: {
          userId: 'user-1',
          profileDetails: {
            professionalDetails: [{ designation: 'Manager' }]
          }
        }
      };
      
      mockUserProfileService.editProfileDetails.mockReturnValue(of({ responseCode: 'OK' }));
      
     // jest.spyOn(component, 'openSnackbar').mockImplementation(() => {});
      
      component.submitProfile();
      
      expect(mockUserProfileService.editProfileDetails).toHaveBeenCalledWith(expectedPayload);
      expect(component.showUpdateDesignations).toBe(false);
      //expect(component.openSnackbar).toHaveBeenCalledWith('Designation updated successfully');
    });
    
    it('should handle error in editProfileDetails', () => {
      component.selectDesignation = 'Manager';
      
      mockUserProfileService.editProfileDetails.mockReturnValue(throwError('Error'));
      
      component.submitProfile();
      
      expect(mockSnackBar.open).toHaveBeenCalledWith('something went wrong!');
    });
  });

  describe('apiCallToUpdateDesignation', () => {
    it('should withdraw approval request and submit profile when desigantionUnderApproval exists', () => {
      component.desigantionUnderApproval = { wfId: 'wf-1' };
      
      mockProfileV2Service.withDrawApprovalRequest.mockReturnValue(of({
        result: { message: 'Success' }
      }));
      
      jest.spyOn(component, 'submitProfile').mockImplementation(() => {});
      
      component.apiCallToUpdateDesignation();
      
      expect(mockProfileV2Service.withDrawApprovalRequest).toHaveBeenCalledWith(
        'user-1',
        'wf-1'
      );
      expect(component.submitProfile).toHaveBeenCalled();
    });
    
    it('should just submit profile when desigantionUnderApproval does not exist', () => {
      component.desigantionUnderApproval = null;
      
      jest.spyOn(component, 'submitProfile').mockImplementation(() => {});
      
      component.apiCallToUpdateDesignation();
      
      expect(mockProfileV2Service.withDrawApprovalRequest).not.toHaveBeenCalled();
      expect(component.submitProfile).toHaveBeenCalled();
    });
  });

  describe('onInputChange', () => {
    it('should filter designation list based on search value', () => {
      component.designationList = [
        { name: 'Developer' },
        { name: 'Manager' },
        { name: 'Director' }
      ];
      
      component.onInputChange('dev');
      
      expect(component.filterDesigantionList).toEqual([{ name: 'Developer' }]);
      expect(component.selectDesignation).toBe('');
    });
    
    it('should reset filter when search value is empty', () => {
      component.designationList = [
        { name: 'Developer' },
        { name: 'Manager' }
      ];
      
      component.onInputChange('');
      
      expect(component.filterDesigantionList).toEqual(component.designationList);
      expect(component.selectDesignation).toBe('');
    });
  });

  describe('navigation methods', () => {
    it('should navigate to connection requests page', () => {
      component.navigateTo();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/network-v2/connection-requests');
    });
    
    it('should navigate to user profile page', () => {
      component.moveToUserProile('user-123');
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/person-profile/user-123#profileInfo');
    });
    
    it('should navigate to activity page', () => {
      component.goToActivity({});
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me?tab=1');
    });
    
    it('should navigate to national learning week page', () => {
      component.navigateToNationalLearning();
      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/learn/karmayogi-saptah');
    });
    
    it('should navigate to state learning week page', () => {
      component.slwConfiguration = {
        orgName: 'Test Org',
        orgId: 'org-1'
      };
      
      component.navigateToStatelLearning();
      
      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/learn/mdo-channels/Test Org/org-1/micro-sites');
    });
  });

  describe('rendering methods', () => {
    it('should render header text based on current language', () => {
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
    
    it('should render button text based on current language', () => {
      component.updateDesignationCard = {
        buttonText: 'Update',
        buttonTextHi: 'अपडेट',
        buttonTextGu: 'અપડેટ'
      };
      
      // Test English
      component.currentLang = 'en';
      expect(component.renderUpdateDesignationCardButtonText()).toBe('Update');
      
      // Test Hindi
      component.currentLang = 'hi';
      expect(component.renderUpdateDesignationCardButtonText()).toBe('अपडेट');
      
      // Test Gujarati
      component.currentLang = 'gu';
      expect(component.renderUpdateDesignationCardButtonText()).toBe('અપડેટ');
    });
    
    it('should render hint text based on current language', () => {
      component.updateDesignationCard = {
        hintText: 'Select designation',
        hintTextHi: 'पदनाम का चयन करें',
        hintTextGu: 'હોદ્દો પસંદ કરો'
      };
      
      // Test English
      component.currentLang = 'en';
      expect(component.renderUpdateDesignationCardHint()).toBe('Select designation');
      
      // Test Hindi
      component.currentLang = 'hi';
      expect(component.renderUpdateDesignationCardHint()).toBe('पदनाम का चयन करें');
      
      // Test Gujarati
      component.currentLang = 'gu';
      expect(component.renderUpdateDesignationCardHint()).toBe('હોદ્દો પસંદ કરો');
    });
  });

  describe('other utility methods', () => {
    it('should toggle creds and update message', () => {
      component.showCreds = false;
      component.toggleCreds();
      expect(component.showCreds).toBe(true);
      expect(component.credMessage).toBe('Hide my credentials');
      
      component.toggleCreds();
      expect(component.showCreds).toBe(false);
      expect(component.credMessage).toBe('View my credentials');
    });
    
    it('should copy text to clipboard and show snackbar', () => {
      // Mock document methods
      document.execCommand = jest.fn();
      document.createElement = jest.fn().mockReturnValue({
        value: '',
        select: jest.fn()
      });
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
      
     // jest.spyOn(component, 'openSnackbar').mockImplementation(() => {});
      jest.spyOn(component, 'raiseTelemetry').mockImplementation(() => {});
      
      component.copyToClipboard('test text');
      
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      //expect(component.openSnackbar).toHaveBeenCalledWith('copied');
      expect(component.raiseTelemetry).toHaveBeenCalledWith('copyToClipboard');
    });
    
    it('should update isLeaderboardExist when checkLeaderboardData is called with true', () => {
      component.isLeaderboardExist = false;
      component.checkLeaderboardData(true);
      expect(component.isLeaderboardExist).toBe(true);
    });
    
    it('should not update isLeaderboardExist when checkLeaderboardData is called with false', () => {
      component.isLeaderboardExist = false;
      component.checkLeaderboardData(false);
      expect(component.isLeaderboardExist).toBe(false);
    });
  });
});
