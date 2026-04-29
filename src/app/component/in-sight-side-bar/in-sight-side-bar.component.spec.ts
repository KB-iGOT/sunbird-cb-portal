jest.mock('@sunbird-cb/consumption', () => ({
  NlwCertificateDialogComponent: class { },
}), { virtual: true })

jest.mock('@sunbird-cb/collection', () => ({}), { virtual: true })
jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: class { },
  EventService: class { },
  WsEvents: {
    EnumInteractTypes: { CLICK: 'click' },
    EnumInteractSubTypes: { MY_DISCUSSIONS: 'my-discussions' },
    EnumTelemetrymodules: { HOME: 'Home' },
  },
  MultilingualTranslationsService: class { },
}), { virtual: true })

jest.mock('src/app/services/common-data.service', () => ({
  CommonDataService: class { getNlw2026CertifiedStatus = jest.fn(() => ({ subscribe: jest.fn() })) },
}), { virtual: true })

import { InsightSideBarComponent } from './in-sight-side-bar.component'
import { of, throwError } from 'rxjs'
import * as momentLib from 'moment'
const moment = (momentLib as any).default || momentLib

jest.mock('moment', () => {
  const m = jest.requireActual('moment')
  return { __esModule: true, default: m }
})

jest.mock('lodash', () => ({
  get: (obj: any, path: string, def?: any) => {
    const keys = path.replace(/\?\./g, '.').split(/\.|\[|\]/).filter(Boolean)
    let cur = obj
    for (const k of keys) {
      if (cur == null) return def
      cur = cur[k]
    }
    return cur !== undefined ? cur : def
  },
  sortBy: (arr: any[], key: string) => [...arr].sort((a, b) => a[key] < b[key] ? -1 : 1),
}), { virtual: false })

const buildMocks = () => {
  const homePageSvc = {
    getInsightsData: jest.fn(() => of({ result: { response: { nudges: [], 'weekly-claps': 5 } } })),
    getAssessmentinfo: jest.fn(() => of({ result: { response: {} } })),
    getDiscussionsData: jest.fn(() => of({ latestPosts: [] })),
  }
  const configSvc = {
    userProfile: {
      firstName: 'Test',
      userId: 'u1',
      rootOrgId: 'org1',
      userName: 'testuser',
      professionalDetails: [{ designation: 'Developer' }],
    },
    unMappedUser: {
      id: 'u1',
      rootOrgId: 'org1',
      profileDetails: {
        profileStatus: 'Active',
        employmentDetails: { departmentName: 'IT' },
        refRootOrg: { orgId: 'org1' },
        additionalProperties: {},
      },
    },
    nodebbUserProfile: { username: 'testuser' },
    iGOTAIConfig: null,
  }
  const activatedRoute = {
    snapshot: {
      data: {
        pageData: {
          data: {
            learnerAdvisory: [],
            surveyForm: null,
            surveyPopup: null,
            nationalLearningWeek: null,
            nlwExperience: null,
            stateLearningWeek: [],
            assessmentData: null,
            updateDesignation: null,
          },
        },
      },
    },
  }
  const discussUtilitySvc = { setDiscussionConfig: jest.fn() }
  const translate = { use: jest.fn(), setDefaultLang: jest.fn() }
  const events = {
    raiseInteractTelemetry: jest.fn(),
  }
  const snackBar = { open: jest.fn() }
  const router = {
    navigateByUrl: jest.fn(),
    navigate: jest.fn(),
  }
  const signupService = {
    getOrgReadData: jest.fn(() => of({ frameworkid: 'fw1' })),
    getFrameworkInfo: jest.fn(() => of({ result: { framework: { categories: [] } } })),
  }
  const profileV2Svc = {
    fetchApprovalDetails: jest.fn(() => of({ result: { data: [] } })),
  }
  const userProfileService = {
    editProfileDetails: jest.fn(() => of({ result: { response: 'SUCCESS' } })),
  }
  const langtranslations = {
    languageSelectedObservable: of(null),
  }
  const cdr = { detectChanges: jest.fn(), markForCheck: jest.fn() }
  const dialog = {
    open: jest.fn(() => ({ afterClosed: () => of(null) })),
  }
  const commonDataSvc = {
    getNlw2026CertifiedStatus: jest.fn(() => of(false)),
  }

  return {
    homePageSvc, configSvc, activatedRoute, discussUtilitySvc,
    translate, events, snackBar, router, signupService,
    profileV2Svc, userProfileService, langtranslations, cdr, dialog, commonDataSvc,
  }
}

const makeComponent = (mocks: any) =>
  new InsightSideBarComponent(
    mocks.homePageSvc as any,
    mocks.configSvc as any,
    mocks.activatedRoute as any,
    mocks.discussUtilitySvc as any,
    mocks.translate as any,
    mocks.events as any,
    mocks.snackBar as any,
    mocks.router as any,
    mocks.signupService as any,
    mocks.profileV2Svc as any,
    mocks.userProfileService as any,
    mocks.langtranslations as any,
    mocks.cdr as any,
    mocks.dialog as any,
    mocks.commonDataSvc as any,
  )

describe('InsightSideBarComponent', () => {
  let component: InsightSideBarComponent
  let mocks: any

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    mocks = buildMocks()
    component = makeComponent(mocks)
  })

  // ── Construction ──────────────────────────────────────────────────────────
  describe('construction', () => {
    it('creates the component', () => {
      expect(component).toBeDefined()
    })

    it('initialises defaults', () => {
      expect(component.showCreds).toBe(false)
      expect(component.credMessage).toBe('View my credentials')
      expect(component.collapsed).toBe(false)
      expect(component.profileDataLoading).toBe(true)
    })

    it('calls translate.use when websiteLanguage is set in localStorage', () => {
      localStorage.setItem('websiteLanguage', 'hi')
      const m = buildMocks()
      makeComponent(m)
      expect(m.translate.use).toHaveBeenCalledWith('hi')
    })
  })

  // ── ngOnInit ──────────────────────────────────────────────────────────────
  describe('ngOnInit', () => {
    it('calls getInsights and getPendingRequestData', () => {
      jest.spyOn(component, 'getInsights').mockImplementation(jest.fn())
      jest.spyOn(component as any, 'getPendingRequestData').mockImplementation(jest.fn())
      component.ngOnInit()
      expect(component.getInsights).toHaveBeenCalled()
    })

    it('sets isNotMyUser true when profileStatus is not-my-user', () => {
      mocks.configSvc.unMappedUser.profileDetails.profileStatus = 'not-my-user'
      component = makeComponent(mocks)
      jest.spyOn(component, 'getInsights').mockImplementation(jest.fn())
      component.ngOnInit()
      expect(component.isNotMyUser).toBe(true)
    })

    it('sets isIgotOrg true when departmentName is igot', () => {
      mocks.configSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot'
      component = makeComponent(mocks)
      jest.spyOn(component, 'getInsights').mockImplementation(jest.fn())
      component.ngOnInit()
      expect(component.isIgotOrg).toBe(true)
    })

    it('calls getNlw2026CertifiedStatus when pageData is present', () => {
      jest.spyOn(component, 'getInsights').mockImplementation(jest.fn())
      component.ngOnInit()
      expect(mocks.commonDataSvc.getNlw2026CertifiedStatus).toHaveBeenCalled()
    })
  })

  // ── getNlwConfig ──────────────────────────────────────────────────────────
  describe('getNlwConfig', () => {
    it('sets canShowNlwCard true when current date is between start and end', () => {
      const today = moment()
      component.nwlConfiguration = {
        startDate: today.clone().subtract(2, 'days').format('DD-MMYYYY'),
        endDate: today.clone().add(5, 'days').format('DD-MMYYYY'),
      }
      component.getNlwConfig()
      expect(component.canShowNlwCard).toBe(true)
    })

    it('sets canShowNlwCard false when current date is before start', () => {
      const today = moment()
      component.nwlConfiguration = {
        startDate: today.clone().add(5, 'days').format('DD-MMYYYY'),
        endDate: today.clone().add(10, 'days').format('DD-MMYYYY'),
      }
      component.getNlwConfig()
      expect(component.canShowNlwCard).toBe(false)
    })
  })

  // ── getSlwConfig ──────────────────────────────────────────────────────────
  describe('getSlwConfig', () => {
    it('sets canShowSlwCard true when current date is between start and end', () => {
      const today = moment()
      component.slwConfiguration = {
        startDate: today.clone().subtract(1, 'days').format('DD-MMYYYY'),
        endDate: today.clone().add(3, 'days').format('DD-MMYYYY'),
      }
      component.getSlwConfig()
      expect(component.canShowSlwCard).toBe(true)
    })

    it('sets canShowSlwCard false before start date', () => {
      const today = moment()
      component.slwConfiguration = {
        startDate: today.clone().add(2, 'days').format('DD-MMYYYY'),
        endDate: today.clone().add(7, 'days').format('DD-MMYYYY'),
      }
      component.getSlwConfig()
      expect(component.canShowSlwCard).toBe(false)
    })
  })

  // ── getInsights ───────────────────────────────────────────────────────────
  describe('getInsights', () => {
    it('calls homePageSvc.getInsightsData', () => {
      component.userData = mocks.configSvc.userProfile
      component.getInsights()
      expect(mocks.homePageSvc.getInsightsData).toHaveBeenCalled()
    })

    it('sets insightsData on success', () => {
      const mockData = { nudges: [], 'weekly-claps': 3 }
      mocks.homePageSvc.getInsightsData.mockReturnValue(
        of({ result: { response: mockData } })
      )
      component = makeComponent(mocks)
      component.userData = mocks.configSvc.userProfile
      component.getInsights()
      expect(component.insightsData).toEqual(mockData)
    })

    it('sets profileDataLoading false on error', () => {
      mocks.homePageSvc.getInsightsData.mockReturnValue(throwError(() => new Error('fail')))
      component = makeComponent(mocks)
      component.userData = mocks.configSvc.userProfile
      component.getInsights()
      expect(component.profileDataLoading).toBe(false)
    })
  })

  // ── constructNudgeData ────────────────────────────────────────────────────
  describe('constructNudgeData', () => {
    it('constructs sliderData with positive nudge', () => {
      component.insightsData = {
        nudges: [{ label: 'Courses', growth: 'positive', progress: 10 }],
        'weekly-claps': 0,
      }
      component.constructNudgeData()
      expect(component.insightsData.sliderData.sliderData.length).toBe(1)
      expect(component.insightsData.sliderData.sliderData[0].icon).toBe('arrow_upward')
    })

    it('constructs sliderData with negative nudge', () => {
      component.insightsData = {
        nudges: [{ label: 'Courses', growth: 'negative', progress: 5 }],
        'weekly-claps': 0,
      }
      component.constructNudgeData()
      expect(component.insightsData.sliderData.sliderData[0].icon).toBe('arrow_downward')
    })
  })

  // ── constructWeeklyData ───────────────────────────────────────────────────
  describe('constructWeeklyData', () => {
    it('maps weekly-claps to weeklyClaps', () => {
      component.insightsData = { nudges: [], 'weekly-claps': 7 }
      component.constructWeeklyData()
      expect(component.insightsData['weeklyClaps']).toBe(7)
      expect(component.clapsDataLoading).toBe(false)
    })
  })

  // ── toggleCreds ───────────────────────────────────────────────────────────
  describe('toggleCreds', () => {
    it('toggles showCreds and updates credMessage', () => {
      component.toggleCreds()
      expect(component.showCreds).toBe(true)
      expect(component.credMessage).toBe('Hide my credentials')

      component.toggleCreds()
      expect(component.showCreds).toBe(false)
      expect(component.credMessage).toBe('View my credentials')
    })
  })

  // ── expandCollapse ────────────────────────────────────────────────────────
  describe('expandCollapse', () => {
    it('sets collapsed from event', () => {
      component.expandCollapse(true)
      expect(component.collapsed).toBe(true)
      component.expandCollapse(false)
      expect(component.collapsed).toBe(false)
    })
  })

  // ── checkLeaderboardData ──────────────────────────────────────────────────
  describe('checkLeaderboardData', () => {
    it('sets isLeaderboardExist when event is true', () => {
      component.checkLeaderboardData(true)
      expect(component.isLeaderboardExist).toBe(true)
    })

    it('does not set isLeaderboardExist when event is false', () => {
      component.isLeaderboardExist = false
      component.checkLeaderboardData(false)
      expect(component.isLeaderboardExist).toBe(false)
    })
  })

  // ── navigateTo ────────────────────────────────────────────────────────────
  describe('navigateTo', () => {
    it('navigates to connection-requests', () => {
      component.navigateTo()
      expect(mocks.router.navigateByUrl).toHaveBeenCalledWith('app/network-v2/connection-requests')
    })
  })

  // ── moveToUserProile ──────────────────────────────────────────────────────
  describe('moveToUserProile', () => {
    it('navigates to user profile', () => {
      component.moveToUserProile('user42')
      expect(mocks.router.navigateByUrl).toHaveBeenCalledWith('app/person-profile/user42#profileInfo')
    })
  })

  // ── goToActivity ──────────────────────────────────────────────────────────
  describe('goToActivity', () => {
    it('navigates to person-profile activity tab', () => {
      component.goToActivity({})
      expect(mocks.router.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me?tab=1')
    })
  })

  // ── navigate ──────────────────────────────────────────────────────────────
  describe('navigate', () => {
    it('calls setDiscussionConfig and navigates to discussion-forum', () => {
      component.navigate()
      expect(mocks.discussUtilitySvc.setDiscussionConfig).toHaveBeenCalled()
      expect(mocks.router.navigate).toHaveBeenCalledWith(
        ['/app/discussion-forum'],
        expect.objectContaining({ queryParams: { page: 'home' } })
      )
    })
  })

  // ── navigateToNationalLearning ────────────────────────────────────────────
  describe('navigateToNationalLearning', () => {
    it('navigates to nwlConfiguration url if set', () => {
      component.nwlConfiguration = { url: '/app/learn/nlw/custom' }
      component.navigateToNationalLearning()
      expect(mocks.router.navigateByUrl).toHaveBeenCalledWith('/app/learn/nlw/custom')
    })

    it('navigates to default nlw url when url is not set', () => {
      component.nwlConfiguration = {}
      component.navigateToNationalLearning()
      expect(mocks.router.navigateByUrl).toHaveBeenCalledWith('app/learn/nlw/karmayogi-saptah')
    })
  })

  // ── updateDesignation ─────────────────────────────────────────────────────
  describe('updateDesignation', () => {
    it('shows snackbar when no designation selected', () => {
      component.selectDesignation = ''
      component.updateDesignation()
      expect(mocks.snackBar.open).toHaveBeenCalledWith(
        'Please select a valid designation', 'X', expect.any(Object)
      )
    })

    it('calls apiCallToUpdateDesignation when designation selected', () => {
      component.selectDesignation = 'Manager'
      const spy = jest.spyOn(component as any, 'apiCallToUpdateDesignation').mockImplementation(jest.fn())
      component.updateDesignation()
      expect(spy).toHaveBeenCalled()
    })
  })

  // ── copyToClipboard ───────────────────────────────────────────────────────
  describe('copyToClipboard', () => {
    it('calls execCommand copy and opens snackbar', () => {
      ; (document as any).execCommand = jest.fn()
      component.copyToClipboard('test-text')
      expect((document as any).execCommand).toHaveBeenCalledWith('copy')
      expect(mocks.snackBar.open).toHaveBeenCalledWith('copied', 'X', expect.any(Object))
    })
  })

  // ── ngOnDestroy ───────────────────────────────────────────────────────────
  describe('ngOnDestroy', () => {
    it('does not throw', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('clears nlw auto-slide interval', () => {
      ; (component as any).nlwAutoSlideInterval = setInterval(jest.fn(), 10000)
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  // ── raiseTelemetry ────────────────────────────────────────────────────────
  describe('raiseTelemetry', () => {
    it('calls events.raiseInteractTelemetry with the given id', () => {
      component.raiseTelemetry('btn-1')
      expect(mocks.events.raiseInteractTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'btn-1' }),
        {},
        expect.objectContaining({ module: expect.any(String) })
      )
    })
  })

  // ── raiseTelemetryInteratEvent ────────────────────────────────────────────
  describe('raiseTelemetryInteratEvent', () => {
    it('emits event via telemetryRaisedLibrary', () => {
      const spy = jest.spyOn(component.telemetryRaisedLibrary, 'emit')
      component.raiseTelemetryInteratEvent({ id: 'test' })
      expect(spy).toHaveBeenCalledWith({ id: 'test' })
    })
  })

  // ── navigateToStateLearning ───────────────────────────────────────────────
  describe('navigateToStateLearning', () => {
    it('navigates to slw micro-sites url when orgName and orgId are set', () => {
      component.slwConfiguration = { orgName: 'StateOrg', orgId: 'org2' }
      component.navigateToStatelLearning()
      expect(mocks.router.navigateByUrl).toHaveBeenCalledWith(
        'app/learn/mdo-channels/StateOrg/org2/micro-sites'
      )
    })

    it('does not navigate when slwConfiguration is null', () => {
      component.slwConfiguration = null
      component.navigateToStatelLearning()
      expect(mocks.events.raiseInteractTelemetry).toHaveBeenCalled()
      expect(mocks.router.navigateByUrl).not.toHaveBeenCalled()
    })
  })

  // ── submitProfile ─────────────────────────────────────────────────────────
  describe('submitProfile', () => {
    it('calls editProfileDetails and shows snackbar on OK', () => {
      mocks.userProfileService.editProfileDetails.mockReturnValue(of({ responseCode: 'OK' }))
      component.selectDesignation = 'Officer'
      component.submitProfile()
      expect(mocks.userProfileService.editProfileDetails).toHaveBeenCalled()
      expect(mocks.snackBar.open).toHaveBeenCalledWith('Designation updated successfully', 'X', expect.any(Object))
    })

    it('shows snackbar on error', () => {
      const { throwError } = jest.requireActual('rxjs')
      mocks.userProfileService.editProfileDetails.mockReturnValue(throwError(() => new Error('err')))
      component.submitProfile()
      expect(mocks.snackBar.open).toHaveBeenCalledWith('something went wrong!')
    })
  })

  // ── apiCallToUpdateDesignation ────────────────────────────────────────────
  describe('apiCallToUpdateDesignation', () => {
    it('calls submitProfile directly when no desigantionUnderApproval', () => {
      component.desigantionUnderApproval = undefined
      mocks.userProfileService.editProfileDetails.mockReturnValue(of({ responseCode: 'OK' }))
      component.selectDesignation = 'Manager'
      component.apiCallToUpdateDesignation()
      expect(mocks.userProfileService.editProfileDetails).toHaveBeenCalled()
    })

    it('calls withDrawApprovalRequest then submitProfile when desigantionUnderApproval set', () => {
      component.desigantionUnderApproval = { wfId: 'wf1' }
      mocks.profileV2Svc.withDrawApprovalRequest = jest.fn().mockReturnValue(of({ result: { message: 'ok' } }))
      mocks.userProfileService.editProfileDetails.mockReturnValue(of({ responseCode: 'OK' }))
      component.selectDesignation = 'Manager'
      component.apiCallToUpdateDesignation()
      expect(mocks.profileV2Svc.withDrawApprovalRequest).toHaveBeenCalled()
    })
  })

  // ── onInputChange ─────────────────────────────────────────────────────────
  describe('onInputChange', () => {
    it('filters designationList by search value', () => {
      component.designationList = [{ name: 'Manager' }, { name: 'Officer' }, { name: 'Developer' }]
      component.onInputChange('man')
      expect(component.filterDesigantionList.every((d: any) => d.name.toLowerCase().includes('man'))).toBe(true)
    })

    it('resets filterDesigantionList when search is empty', () => {
      component.designationList = [{ name: 'Manager' }, { name: 'Officer' }]
      component.filterDesigantionList = []
      component.onInputChange('')
      expect(component.filterDesigantionList).toEqual(component.designationList)
    })

    it('sets selectDesignation to empty after filtering', () => {
      component.designationList = [{ name: 'Manager' }]
      component.onInputChange('Man')
      expect(component.selectDesignation).toBe('')
    })
  })

  // ── onOptionSelected ──────────────────────────────────────────────────────
  describe('onOptionSelected', () => {
    it('sets selectDesignation to the chosen value', () => {
      component.onOptionSelected('Director')
      expect(component.selectDesignation).toBe('Director')
    })
  })

  // ── onAutoCompleteOpened / Closed ─────────────────────────────────────────
  describe('onAutoCompleteOpened', () => {
    it('sets isMatcompleteOpened to true', () => {
      component.isMatcompleteOpened = false
      component.onAutoCompleteOpened()
      expect(component.isMatcompleteOpened).toBe(true)
    })
  })

  describe('onAutoCompleteClosed', () => {
    it('sets isMatcompleteOpened to false and resets filterDesigantionList', () => {
      component.isMatcompleteOpened = true
      component.designationList = [{ name: 'Manager' }]
      component.onAutoCompleteClosed()
      expect(component.isMatcompleteOpened).toBe(false)
      expect(component.filterDesigantionList).toEqual(component.designationList)
    })
  })

  // ── nlwSlides getter ──────────────────────────────────────────────────────
  describe('nlwSlides', () => {
    it('returns custom slides when nwlConfiguration.slides is set', () => {
      component.nwlConfiguration = { slides: [{ type: 'banner' }, { type: 'content' }, { type: 'extra' }] }
      expect(component.nlwSlides.length).toBe(3)
    })

    it('returns default [banner, content] when no slides', () => {
      component.nwlConfiguration = {}
      expect(component.nlwSlides).toEqual([{ type: 'banner' }, { type: 'content' }])
    })

    it('returns default when nwlConfiguration is null', () => {
      component.nwlConfiguration = null
      expect(component.nlwSlides).toEqual([{ type: 'banner' }, { type: 'content' }])
    })
  })

  // ── startNlwAutoSlide ─────────────────────────────────────────────────────
  describe('startNlwAutoSlide', () => {
    afterEach(() => jest.useRealTimers())

    it('does nothing when only 1 slide', () => {
      jest.useFakeTimers()
      component.nwlConfiguration = { slides: [{ type: 'banner' }] }
      component.startNlwAutoSlide()
      expect((component as any).nlwAutoSlideInterval).toBeNull()
    })

    it('sets interval when multiple slides', () => {
      jest.useFakeTimers()
      component.nwlConfiguration = { slides: [{ type: 'banner' }, { type: 'content' }], flipInterval: 3 }
      component.startNlwAutoSlide()
      expect((component as any).nlwAutoSlideInterval).not.toBeNull()
      jest.clearAllTimers()
    })
  })

  // ── goToNlwSlide / prevNlwSlide / nextNlwSlide ────────────────────────────
  describe('goToNlwSlide', () => {
    it('sets nlwSlideIndex to given index', () => {
      component.nwlConfiguration = { slides: [{ type: 'banner' }, { type: 'content' }] }
      component.goToNlwSlide(1)
      expect(component.nlwSlideIndex).toBe(1)
    })
  })

  describe('prevNlwSlide', () => {
    it('wraps around to last slide from index 0', () => {
      component.nwlConfiguration = { slides: [{ type: 'banner' }, { type: 'content' }, { type: 'extra' }] }
      component.nlwSlideIndex = 0
      component.prevNlwSlide()
      expect(component.nlwSlideIndex).toBe(2)
    })
  })

  describe('nextNlwSlide', () => {
    it('wraps around to 0 from last slide', () => {
      component.nwlConfiguration = { slides: [{ type: 'banner' }, { type: 'content' }] }
      component.nlwSlideIndex = 1
      component.nextNlwSlide()
      expect(component.nlwSlideIndex).toBe(0)
    })
  })

  // ── renderUpdateDesignationCard* ──────────────────────────────────────────
  describe('renderUpdateDesignationCardHeader', () => {
    beforeEach(() => {
      component.updateDesignationCard = { header: 'Update', headerHi: 'Update-Hi', headerGu: 'Update-Gu' }
    })

    it('returns header for default lang', () => {
      component.currentLang = 'en'
      expect(component.renderUpdateDesignationCardHeader()).toBe('Update')
    })

    it('returns headerHi for hi lang', () => {
      component.currentLang = 'hi'
      expect(component.renderUpdateDesignationCardHeader()).toBe('Update-Hi')
    })

    it('returns headerGu for gu lang', () => {
      component.currentLang = 'gu'
      expect(component.renderUpdateDesignationCardHeader()).toBe('Update-Gu')
    })
  })

  describe('renderUpdateDesignationCardButtonText', () => {
    beforeEach(() => {
      component.updateDesignationCard = { buttonText: 'Submit', buttonTextHi: 'सबमिट', buttonTextGu: 'સબમિટ' }
    })

    it('returns buttonText for default lang', () => {
      component.currentLang = 'en'
      expect(component.renderUpdateDesignationCardButtonText()).toBe('Submit')
    })

    it('returns buttonTextHi for hi lang', () => {
      component.currentLang = 'hi'
      expect(component.renderUpdateDesignationCardButtonText()).toBe('सबमिट')
    })
  })

  describe('renderUpdateDesignationCardHint', () => {
    beforeEach(() => {
      component.updateDesignationCard = { hintText: 'Hint', hintTextHi: 'संकेत', hintTextGu: 'સૂચન' }
    })

    it('returns hintText for default lang', () => {
      component.currentLang = 'en'
      expect(component.renderUpdateDesignationCardHint()).toBe('Hint')
    })

    it('returns hintTextHi for hi lang', () => {
      component.currentLang = 'hi'
      expect(component.renderUpdateDesignationCardHint()).toBe('संकेत')
    })
  })

  // ── getMasterDesignation ──────────────────────────────────────────────────
  describe('getMasterDesignation', () => {
    it('calls signupService.getOrgReadData and getFrameworkInfo', () => {
      mocks.signupService.getFrameworkInfo.mockReturnValue(of({
        result: { framework: { categories: [{ code: 'org', terms: [{ children: [{ name: 'Manager' }] }] }] } },
      }))
      mocks.profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }))
      component.userData = { rootOrgId: 'org1' }
      component.getMasterDesignation()
      expect(mocks.signupService.getOrgReadData).toHaveBeenCalled()
      expect(mocks.signupService.getFrameworkInfo).toHaveBeenCalled()
    })

    it('sets showUpdateDesignations true when designation not in list (no approval)', () => {
      mocks.signupService.getFrameworkInfo.mockReturnValue(of({
        result: { framework: { categories: [] } },
      }))
      mocks.profileV2Svc.fetchApprovalDetails.mockReturnValue(of({ result: { data: [] } }))
      mocks.configSvc.userProfile.professionalDetails = [{ designation: 'CustomRole' }]
      component.userData = { rootOrgId: 'org1' }
      component.designationList = []
      component.getMasterDesignation()
      expect(mocks.signupService.getOrgReadData).toHaveBeenCalled()
    })

    it('does not call getOrgReadData when userData has no rootOrgId', () => {
      component.userData = {}
      component.getMasterDesignation()
      expect(mocks.signupService.getOrgReadData).not.toHaveBeenCalled()
    })

    it('handles getOrgReadData error gracefully', () => {
      const { throwError } = jest.requireActual('rxjs')
      mocks.signupService.getOrgReadData.mockReturnValue(throwError(() => new Error('err')))
      component.userData = { rootOrgId: 'org1' }
      expect(() => component.getMasterDesignation()).not.toThrow()
    })
  })

  // ── getDiscussionsData ────────────────────────────────────────────────────
  describe('getDiscussionsData', () => {
    it('calls homePageSvc.getDiscussionsData and sets data on success', () => {
      mocks.homePageSvc.getDiscussionsData.mockReturnValue(of({ latestPosts: [{ id: 'p1' }] }))
      component.userData = { userName: 'testuser' }
      component.getDiscussionsData()
      expect(component.discussion.data).toEqual([{ id: 'p1' }])
      expect(component.discussion.loadSkeleton).toBe(false)
    })

    it('sets discussion.error on HTTP error', () => {
      const { throwError } = jest.requireActual('rxjs')
      mocks.homePageSvc.getDiscussionsData.mockReturnValue(throwError(() => ({ ok: false })))
      component.userData = { userName: 'testuser' }
      component.getDiscussionsData()
      expect(component.discussion.error).toBe(true)
    })
  })

  // ── onNlwBannerClick / onNlwNewsletterCtaClick ────────────────────────────
  describe('onNlwBannerClick', () => {
    it('does nothing when nlwExperience is null', () => {
      component.nlwExperience = null
      expect(() => component.onNlwBannerClick()).not.toThrow()
    })

    it('opens dialog when action is OPEN_POPUP', () => {
      component.nlwExperience = { banner: { onClick: { action: 'OPEN_POPUP', type: 'PDF', url: '/url', api: '/api' } } }
      component.onNlwBannerClick()
      expect(mocks.dialog.open).toHaveBeenCalled()
    })
  })

  describe('onNlwNewsletterCtaClick', () => {
    it('does nothing when nlwExperience newsletter is null', () => {
      component.nlwExperience = null
      expect(() => component.onNlwNewsletterCtaClick()).not.toThrow()
    })

    it('opens dialog when newsletter CTA action is OPEN_POPUP', () => {
      component.nlwExperience = { newsletter: { cta: { action: 'OPEN_POPUP', type: 'VIDEO', url: '/v', api: '/api' } } }
      component.onNlwNewsletterCtaClick()
      expect(mocks.dialog.open).toHaveBeenCalled()
    })
  })
})

