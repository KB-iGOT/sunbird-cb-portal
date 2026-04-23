jest.mock('@sunbird-cb/collection', () => ({
  BtnSettingsService: jest.fn(),
  NsContent: {},
}), { virtual: true })
jest.mock('@sunbird-cb/collection/src/public-api', () => ({}), { virtual: true })

import { HomeComponent } from './home.component'
import { Subject, of, throwError } from 'rxjs'

describe('HomeComponent', () => {
  let component: HomeComponent

  const mockActivatedRoute = {
    snapshot: {
      data: {
        pageData: {
          data: {
            homeConfig: { key: 'val' },
            newHomeStrip: [
              { order: 1, strips: [{ active: true }] },
              { order: 2, strips: [{ active: false }] },
            ],
            clientList: [],
            hubsData: {},
            enableLazyLoading: true,
            sliderData: {},
          },
        },
      },
    },
  }

  const mockConfigSvc: any = {
    unMappedUser: {
      rootOrgId: 'rootOrg1',
      id: 'user1',
      profileDetails: {
        profileStatus: 'VERIFIED',
        employmentDetails: { departmentName: 'dept' },
        additionalProperties: { isProfileUpdatedMsgViewed: true },
      },
    },
    overrideThemeChanges: false,
    sitePath: '/assets',
  }

  const mockBtnSettingsSvc = { changeFont: jest.fn() }

  const mockMobileAppsService = {
    mobileTopHeaderVisibilityStatus: new Subject<boolean>(),
  }

  const mockRouter = { navigateByUrl: jest.fn(), navigate: jest.fn() }

  const mockTranslate = {
    setDefaultLang: jest.fn(),
    use: jest.fn(),
    instant: jest.fn().mockReturnValue('translated'),
  }

  const mockUserProfileService = {
    listApprovalPendingFields: jest.fn().mockReturnValue(of({ result: { data: [] } })),
    fetchApprovedFields: jest.fn().mockReturnValue(of({ result: { data: [] } })),
    listRejectedFields: jest.fn().mockReturnValue(of({ result: { data: [] } })),
    editProfileDetails: jest.fn().mockReturnValue(of({ success: true })),
  }

  const mockSnackBar = { open: jest.fn(), openFromComponent: jest.fn() }

  const mockEvents = {
    raiseInteractTelemetry: jest.fn(),
    raiseImpressionTelemetry: jest.fn(),
  }

  function createComponent(configOverride?: any) {
    const cfg = configOverride || mockConfigSvc
    return new HomeComponent(
      mockActivatedRoute as any,
      cfg,
      mockBtnSettingsSvc as any,
      mockMobileAppsService as any,
      mockRouter as any,
      mockTranslate as any,
      mockUserProfileService as any,
      mockSnackBar as any,
      mockEvents as any,
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    component = createComponent()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('ngOnInit', () => {
    it('should set rootOrgId from configSvc', () => {
      component.ngOnInit()
      expect(component.rootOrgId).toBe('rootOrg1')
    })

    it('should set disableMenu false when not igot user', () => {
      component.ngOnInit()
      expect(component.disableMenu).toBe(false)
    })

    it('should set disableMenu true and navigate for igot + not-my-user', () => {
      const cfg = {
        ...mockConfigSvc,
        unMappedUser: {
          rootOrgId: 'r1',
          id: 'u1',
          profileDetails: {
            profileStatus: 'not-my-user',
            employmentDetails: { departmentName: 'igot' },
            additionalProperties: { isProfileUpdatedMsgViewed: true },
          },
        },
        overrideThemeChanges: false,
      }
      const comp = createComponent(cfg)
      comp.ngOnInit()
      expect(comp.disableMenu).toBe(true)
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me#profileInfo')
    })

    it('should load homeConfig from pageData', () => {
      component.ngOnInit()
      expect(component.homeConfig).toEqual({ key: 'val' })
    })

    it('should build sectionList from newHomeStrip', () => {
      component.ngOnInit()
      expect(component.sectionList.length).toBeGreaterThanOrEqual(2)
      expect(component.sectionList[0].section).toBe('section_0')
    })

    it('should call getListPendingApproval', () => {
      const spy = jest.spyOn(component, 'getListPendingApproval')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should call handleDefaultFontSetting', () => {
      const spy = jest.spyOn(component, 'handleDefaultFontSetting')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should use websiteLanguage from localStorage if set', () => {
      localStorage.setItem('websiteLanguage', 'hi')
      component.ngOnInit()
      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslate.use).toHaveBeenCalledWith('hi')
      localStorage.removeItem('websiteLanguage')
    })

    it('should call getApprovedStatus and getRejectedStatus when isProfileUpdatedMsgViewed is false', () => {
      const cfg = {
        ...mockConfigSvc,
        unMappedUser: {
          rootOrgId: 'r1',
          id: 'u1',
          profileDetails: {
            profileStatus: 'VERIFIED',
            employmentDetails: { departmentName: 'dept' },
            additionalProperties: { isProfileUpdatedMsgViewed: false },
          },
        },
        overrideThemeChanges: false,
      }
      const comp = createComponent(cfg)
      const spyApproved = jest.spyOn(comp, 'getApprovedStatus')
      const spyRejected = jest.spyOn(comp, 'getRejectedStatus')
      comp.ngOnInit()
      expect(spyApproved).toHaveBeenCalled()
      expect(spyRejected).toHaveBeenCalled()
    })
  })

  describe('ngAfterViewInit', () => {
    it('should mark initial section_0 to section_4 isVisible true', () => {
      component.ngOnInit()
      component.ngAfterViewInit()
      const visible = component.sectionList.filter((s: any) => s.section.startsWith('section_') && s.isVisible)
      expect(visible.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('getEnrollmentData', () => {
    it('should set isKPPanelenabled false when enrolledCourseCount > 0', () => {
      localStorage.setItem('userEnrollmentCount', JSON.stringify({ enrolledCourseCount: 5 }))
      component.enrollInterval = setInterval(() => { }, 10000)
      component.getEnrollmentData()
      expect(component.isKPPanelenabled).toBe(false)
      localStorage.removeItem('userEnrollmentCount')
    })

    it('should set isKPPanelenabled true when enrolledCourseCount is 0', () => {
      localStorage.setItem('userEnrollmentCount', JSON.stringify({ enrolledCourseCount: 0 }))
      component.enrollInterval = setInterval(() => { }, 10000)
      component.getEnrollmentData()
      expect(component.isKPPanelenabled).toBe(true)
      localStorage.removeItem('userEnrollmentCount')
    })

    it('should do nothing when no data in localStorage', () => {
      localStorage.removeItem('userEnrollmentCount')
      component.getEnrollmentData()
      expect(component.enrollData).toBeFalsy()
    })
  })

  describe('handleDefaultFontSetting', () => {
    it('should call btnSettingsSvc.changeFont with localStorage setting', () => {
      localStorage.setItem('setting', 'font-large')
      component.handleDefaultFontSetting()
      expect(mockBtnSettingsSvc.changeFont).toHaveBeenCalledWith('font-large')
      localStorage.removeItem('setting')
    })
  })

  describe('handleRemindLater', () => {
    it('should set sessionStorage and close nudge', () => {
      component.handleRemindLater()
      expect(sessionStorage.getItem('hideUpdateProfilePopUp')).toBe('true')
      expect(component.isNudgeOpen).toBe(false)
    })
  })

  describe('handleUpdateMobileNudge', () => {
    it('should set isNudgeOpen true when profileStatus not VERIFIED', () => {
      const cfg = {
        ...mockConfigSvc,
        unMappedUser: {
          rootOrgId: 'r1',
          id: 'u1',
          profileDetails: { profileStatus: 'NOT_VERIFIED' },
        },
      }
      const comp = createComponent(cfg)
      sessionStorage.setItem('hideUpdateProfilePopUp', 'true')
      comp.handleUpdateMobileNudge()
      expect(comp.isNudgeOpen).toBe(true)
    })

    it('should set isNudgeOpen false when profileStatus is VERIFIED', () => {
      component.handleUpdateMobileNudge()
      expect(component.isNudgeOpen).toBe(false)
    })

    it('should set isNudgeOpen true when no profileDetails', () => {
      const cfg = {
        ...mockConfigSvc,
        unMappedUser: { id: 'u1' },
      }
      const comp = createComponent(cfg)
      comp.handleUpdateMobileNudge()
      expect(comp.isNudgeOpen).toBe(true)
    })
  })

  describe('getListPendingApproval', () => {
    it('should set pendingApprovalList', () => {
      mockUserProfileService.listApprovalPendingFields.mockReturnValue(
        of({ result: { data: [{ id: 1 }] } })
      )
      component.getListPendingApproval()
      expect(component.pendingApprovalList).toEqual([{ id: 1 }])
    })

    it('should open snackbar on HTTP error', () => {
      mockUserProfileService.listApprovalPendingFields.mockReturnValue(
        throwError({ ok: false })
      )
      component.getListPendingApproval()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Unable to fetch pending approval list')
    })
  })

  describe('getApprovedStatus', () => {
    it('should set approvedStatus true when name field exists', () => {
      mockUserProfileService.fetchApprovedFields.mockReturnValue(
        of({ result: { data: [{ name: 'John' }] } })
      )
      component.getApprovedStatus()
      expect(component.approvedStatus).toBe(true)
    })

    it('should set approvedStatus false when no matching fields', () => {
      mockUserProfileService.fetchApprovedFields.mockReturnValue(
        of({ result: { data: [{ other: 'x' }] } })
      )
      component.getApprovedStatus()
      expect(component.approvedStatus).toBe(false)
    })

    it('should set approvedStatus false on empty list', () => {
      mockUserProfileService.fetchApprovedFields.mockReturnValue(
        of({ result: { data: [] } })
      )
      component.getApprovedStatus()
      expect(component.approvedStatus).toBe(false)
    })

    it('should open snackbar on error', () => {
      mockUserProfileService.fetchApprovedFields.mockReturnValue(
        throwError({ ok: false, error: { text: 'err' } })
      )
      component.getApprovedStatus()
      expect(mockSnackBar.open).toHaveBeenCalledWith('err')
    })
  })

  describe('getRejectedStatus', () => {
    it('should set rejectedStatus true when designation field exists', () => {
      mockUserProfileService.listRejectedFields.mockReturnValue(
        of({ result: { data: [{ designation: 'eng' }] } })
      )
      component.getRejectedStatus()
      expect(component.rejectedStatus).toBe(true)
    })

    it('should set rejectedStatus false on empty list', () => {
      mockUserProfileService.listRejectedFields.mockReturnValue(
        of({ result: { data: [] } })
      )
      component.getRejectedStatus()
      expect(component.rejectedStatus).toBe(false)
    })

    it('should open snackbar on error', () => {
      mockUserProfileService.listRejectedFields.mockReturnValue(
        throwError({ ok: false, error: { text: 'rej err' } })
      )
      component.getRejectedStatus()
      expect(mockSnackBar.open).toHaveBeenCalledWith('rej err')
    })
  })

  describe('handleMDOMsgstatus', () => {
    it('should call editProfileDetails and set isMDOMsgOpen true on success', () => {
      component.handleMDOMsgstatus()
      expect(mockUserProfileService.editProfileDetails).toHaveBeenCalled()
      expect(component.isMDOMsgOpen).toBe(true)
    })

    it('should open snackbar on error', () => {
      mockUserProfileService.editProfileDetails.mockReturnValue(
        throwError({ ok: false, error: { text: 'edit err' } })
      )
      component.handleMDOMsgstatus()
      expect(mockSnackBar.open).toHaveBeenCalledWith('edit err')
    })
  })

  describe('fetchProfile', () => {
    it('should call handleMDOMsgstatus and navigate', () => {
      const spy = jest.spyOn(component, 'handleMDOMsgstatus')
      component.fetchProfile()
      expect(spy).toHaveBeenCalled()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/person-profile/me'])
    })
  })

  describe('closeKarmaPointsPanel', () => {
    it('should set isKPPanelenabled to false', () => {
      component.isKPPanelenabled = true
      component.closeKarmaPointsPanel()
      expect(component.isKPPanelenabled).toBe(false)
    })
  })

  describe('translateHub', () => {
    it('should call translate.instant', () => {
      const result = component.translateHub('someKey')
      expect(mockTranslate.instant).toHaveBeenCalledWith('someKey')
      expect(result).toBe('translated')
    })
  })

  describe('checkSectionVisibility', () => {
    it('should return early for section_0 to section_4', () => {
      component.sectionList = [{ section: 'section_0', isVisible: false }]
      component.checkSectionVisibility('section_0')
      expect(component.sectionList[0].isVisible).toBe(false)
    })

    it('should return early if section not found in list', () => {
      component.sectionList = []
      expect(() => component.checkSectionVisibility('section_9')).not.toThrow()
    })
  })

  describe('handleButtonClick', () => {
    it('should not throw', () => {
      expect(() => component.handleButtonClick()).not.toThrow()
    })
  })

  describe('isMDOMsgOpen default', () => {
    it('should default to true', () => {
      expect(component.isMDOMsgOpen).toBe(true)
    })
  })
})
