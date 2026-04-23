jest.mock('src/app/services/notifications.service', () => ({
  NotificationsService: jest.fn().mockImplementation(() => ({
    nofificationsCount: { next: jest.fn() },
    handleRedirection: jest.fn(),
  })),
}), { virtual: true })

jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash')
  return { ...actual, default: actual }
})

import { Subject, of } from 'rxjs'
import { TopRightNavBarComponent } from './top-right-nav-bar.component'
import { of, throwError, Subject } from 'rxjs'

// Mock classes and interfaces
class MockMatDialog {
  open = jest.fn().mockReturnValue({
    afterClosed: () => of(true),
    close: jest.fn()
  });
}

class MockHomePageService {
  closeDialogPop = new Subject();
}

class MockConfigurationsService {
  instanceConfig: any = {
    websitelanguages: ['en', 'hi', 'te'],
    isMultilingualEnabled: true
  };
  unMappedUser: any = {
    id: 'user123',
    roles: ['admin', 'user']
  };
  languageTranslationFlag = new Subject();
  iGOTAIConfig: any
  userProfile: any
}

class MockMultilingualTranslationsService {
  languageSelectedObservable = new Subject();
  translateLabel = jest.fn().mockReturnValue('translated-label');
  updatelanguageSelected = jest.fn();
}

class MockTranslateService {
  setDefaultLang = jest.fn();
  use = jest.fn();
}

class MockDomSanitizer {
  bypassSecurityTrustHtml = jest.fn().mockReturnValue('sanitized-html');
}

class MockHttpClient {
  get = jest.fn().mockReturnValue(of('<html>zoho form</html>'));
}

class MockEventService {
  raiseInteractTelemetry = jest.fn();
}

class MockMatSnackBar {
  open = jest.fn();
}

class MockRouter {
  navigate = jest.fn();
}

class MockNotificationsService {
  resetNotificationsCount = jest.fn().mockReturnValue(of({ responseCode: 'OK' }));
  handleRedirection = jest.fn();
  nofificationsCount = new Subject();
}

class MockRootService {
  openSupportAIChatbot = {
    next: jest.fn(),
  };
}

describe('TopRightNavBarComponent', () => {
  let component: TopRightNavBarComponent
  let mockDialog: any
  let mockHomePageService: any
  let mockConfigSvc: any
  let mockLangtranslations: any
  let mockTranslate: any
  let mockHttp: any
  let mockSanitizer: any
  let mockEvents: any
  let mockSnackBar: any
  let mockRouter: any
  let mockNotificationsService: any
  let mockRootService: any
  let mockMatDialogNew: any

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(null)),
      }),
    }

    mockHomePageService = {
      closeDialogPop: new Subject<any>(),
    }

    mockConfigSvc = {
      unMappedUser: {
        id: 'user-1',
        roles: ['MDO_ADMIN'],
      },
      instanceConfig: {
        websitelanguages: ['en', 'hi'],
        isMultilingualEnabled: true,
      },
      languageTranslationFlag: { next: jest.fn() },
    }

    const languageSelectedSubject = new Subject<void>()
    mockLangtranslations = {
      languageSelectedObservable: languageSelectedSubject.asObservable(),
      translateLabel: jest.fn().mockReturnValue('translated'),
      updatelanguageSelected: jest.fn(),
    }

    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    }

    mockHttp = {
      get: jest.fn().mockReturnValue(of('<div>zoho html</div>')),
    }

    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn().mockReturnValue('<safe-html>'),
    }

    mockEvents = {
      raiseInteractTelemetry: jest.fn(),
    }

    mockSnackBar = {
      open: jest.fn(),
    }

    mockRouter = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
    }

    mockNotificationsService = {
      resetNotificationsCount: jest.fn().mockReturnValue(of({ responseCode: 'OK' })),
      handleRedirection: jest.fn(),
      nofificationsCount: { next: jest.fn() },
    }

    mockRootService = {
      getCookie: jest.fn(),
      openSupportAIChatbot: { next: jest.fn() },
    }

    mockMatDialogNew = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(null)),
      }),
    }

    component = new TopRightNavBarComponent(
      mockDialog,
      mockHomePageService,
      mockConfigSvc,
      mockLangtranslations,
      mockTranslate,
      mockHttp,
      mockSanitizer,
      mockEvents,
      mockSnackBar,
      mockRouter,
      mockNotificationsService,
      mockRootService,
      mockMatDialogNew
    )
  })

  describe('constructor', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should set roles from configSvc.unMappedUser', () => {
      expect(component.roles).toEqual(['MDO_ADMIN'])
    })

    it('should default selectedLanguage to en when no localStorage entry', () => {
      expect(component.selectedLanguage).toBe('en')
    })

    it('should read language from localStorage if set', () => {
      localStorage.setItem('websiteLanguage', 'hi')
      const comp = new TopRightNavBarComponent(
        mockDialog, mockHomePageService, mockConfigSvc,
        mockLangtranslations, mockTranslate, mockHttp,
        mockSanitizer, mockEvents, mockSnackBar,
        mockRouter, mockNotificationsService, mockRootService, mockMatDialogNew
      )
      expect(comp.selectedLanguage).toBe('hi')
    })

    it('should leave roles empty when unMappedUser has no roles', () => {
      mockConfigSvc.unMappedUser = { id: 'u1' }
      const comp = new TopRightNavBarComponent(
        mockDialog, mockHomePageService, mockConfigSvc,
        mockLangtranslations, mockTranslate, mockHttp,
        mockSanitizer, mockEvents, mockSnackBar,
        mockRouter, mockNotificationsService, mockRootService, mockMatDialogNew
      )
      expect(comp.roles).toEqual([])
    })
  })

  describe('ngOnInit', () => {
    it('should load multiLang and isMultiLangEnabled from instanceConfig', () => {
      component.ngOnInit()
      expect(component.multiLang).toEqual(['en', 'hi'])
      expect(component.isMultiLangEnabled).toBe(true)
    })

    it('should call http.get for zoho html', () => {
      component.ngOnInit()
      expect(mockHttp.get).toHaveBeenCalledWith(component.zohoUrl, { responseType: 'text' })
    })

    it('should set zohoHtml after http.get resolves', () => {
      component.ngOnInit()
      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalled()
      expect(component.zohoHtml).toBe('<safe-html>')
    })

    it('should handle rightNavConfig with topRightNavConfig property', () => {
      component.rightNavConfig = { topRightNavConfig: { items: [] } }
      component.ngOnInit()
      expect(component.rightNavConfig).toEqual({ items: [] })
    })

    it('should keep rightNavConfig as-is when no topRightNavConfig', () => {
      component.rightNavConfig = { items: ['a', 'b'] }
      component.ngOnInit()
      expect(component.rightNavConfig).toEqual({ items: ['a', 'b'] })
    })
  })

  describe('ngOnChanges', () => {
    it('should unwrap topRightNavConfig if present', () => {
      component.rightNavConfig = { topRightNavConfig: { sections: ['profile'] } }
      component.ngOnChanges()
      expect(component.rightNavConfig).toEqual({ sections: ['profile'] })
    })

    it('should leave rightNavConfig unchanged if topRightNavConfig absent', () => {
      component.rightNavConfig = { sections: ['profile'] }
      component.ngOnChanges()
      expect(component.rightNavConfig).toEqual({ sections: ['profile'] })
    })
  })

  describe('translateLabels', () => {
    it('should delegate to langtranslations.translateLabel', () => {
      const result = component.translateLabels('myLabel', 'someType')
      expect(mockLangtranslations.translateLabel).toHaveBeenCalledWith('myLabel', 'someType', '')
      expect(result).toBe('translated')
    })
  })

  describe('onBellClick', () => {
    it('should call resetNotificationsCount when count > 0', () => {
      component.notificationsCount = 5
      component.onBellClick()
      expect(mockNotificationsService.resetNotificationsCount).toHaveBeenCalled()
    })

    it('should set notificationsCount to 0 on successful reset', () => {
      component.notificationsCount = 5
      component.onBellClick()
      expect(component.notificationsCount).toBe(0)
    })

    it('should NOT call resetNotificationsCount when count is 0', () => {
      component.notificationsCount = 0
      component.onBellClick()
      expect(mockNotificationsService.resetNotificationsCount).not.toHaveBeenCalled()
    })

    it('should set showDropdown to false then true via setTimeout', (done) => {
      component.notificationsCount = 0
      component.showDropdown = true
      component.onBellClick()
      expect(component.showDropdown).toBe(false)
      setTimeout(() => {
        expect(component.showDropdown).toBe(true)
        done()
      }, 10)
    })

    it('should handle error from resetNotificationsCount gracefully', () => {
      mockNotificationsService.resetNotificationsCount.mockReturnValue({
        subscribe: jest.fn((_ok: any, errorCb: any) => errorCb(new Error('error'))),
      })
      component.notificationsCount = 3
      expect(() => component.onBellClick()).not.toThrow()
    })
  })

  describe('onMenuClosed', () => {
    it('should set showDropdown to false', () => {
      component.showDropdown = true
      component.onMenuClosed()
      expect(component.showDropdown).toBe(false)
    })
  })

  describe('selectLanguage', () => {
    it('should update selectedLanguage', () => {
      component.selectLanguage('hi')
      expect(component.selectedLanguage).toBe('hi')
    })

    it('should store language in localStorage', () => {
      component.selectLanguage('hi')
      expect(localStorage.getItem('websiteLanguage')).toBe('hi')
    })

    it('should call langtranslations.updatelanguageSelected', () => {
      component.selectLanguage('hi')
      expect(mockLangtranslations.updatelanguageSelected).toHaveBeenCalledWith(
        true,
        'hi',
        'user-1'
      )
    })

    it('should raise languageTranslationFlag', () => {
      component.selectLanguage('hi')
      expect(mockConfigSvc.languageTranslationFlag.next).toHaveBeenCalledWith(true)
    })

    it('should pass empty string as userId when unMappedUser is null', () => {
      mockConfigSvc.unMappedUser = null
      component.selectLanguage('hi')
      expect(mockLangtranslations.updatelanguageSelected).toHaveBeenCalledWith(true, 'hi', '')
    })
  })

  describe('openDialog', () => {
    it('should open MatDialog with width 1000px', () => {
      component.openDialog()
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.any(Function),
        { width: '1000px' }
      )
    })
  })

  describe('getZohoForm', () => {
    it('should open ZohoDialogComponent dialog', () => {
      component.getZohoForm()
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ width: '45%' })
      )
    })
  })

  describe('formatDate', () => {
    it('should return empty string for falsy input', () => {
      expect(component.formatDate('')).toBe('')
    })

    it('should return original string for invalid date', () => {
      expect(component.formatDate('not-a-date')).toBe('not-a-date')
    })

    it('should return formatted date in dd-mm-yyyy format', () => {
      const result = component.formatDate('2024-01-15')
      expect(result).toBe('15-01-2024')
    })
  })

  describe('raiseTelemetryEventForNotification', () => {
    it('should call events.raiseInteractTelemetry', () => {
      const notification = { notification_id: 'n-1' }
      component.raiseTelemetryEventForNotification(notification)
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click', id: 'n-1' }),
        {},
        expect.objectContaining({ module: 'Home' })
      )
    })
  })

  describe('reCountNotifications', () => {
    it('should call nofificationsCount.next with event', () => {
      component.reCountNotifications(5)
      expect(mockNotificationsService.nofificationsCount.next).toHaveBeenCalledWith(5)
    })
  })

  describe('calculateCount', () => {
    it('should not throw when called', () => {
      expect(() => component.calculateCount({ count: 5 })).not.toThrow()
    })
  })

  describe('showDialog', () => {
    it('should open ConfirmDialogComponent dialog', () => {
      component.showDialog({ title: 'Test' }, 'https://example.com')
      expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function), { title: 'Test' })
    })

    it('should open window when dialog closes with truthy result', () => {
      mockDialog.open.mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of(true)) })
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
      component.showDialog({}, 'https://example.com')
      expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank')
      openSpy.mockRestore()
    })
  })

  describe('viewAllClick', () => {
    it('should call openSurveypopup for PEER_VALIDATION without PEER_REVIEW_ASSIGNED', () => {
      const openSurveySpy = jest.spyOn(component, 'openSurveypopup').mockImplementation(() => { })
      const raiseSpy = jest.spyOn(component, 'raiseTelemetryEventForNotification').mockImplementation(() => { })
      const event = { category: 'PEER_VALIDATION', sub_category: 'PEER_REVIEW_SUBMITTED' }
      component.viewAllClick(event)
      expect(raiseSpy).toHaveBeenCalled()
      expect(openSurveySpy).toHaveBeenCalledWith(event)
    })

    it('should call openVerificationPopup for PEER_REVIEW_ASSIGNED sub_category', () => {
      const openVerSpy = jest.spyOn(component, 'openVerificationPopup').mockImplementation(() => { })
      jest.spyOn(component, 'raiseTelemetryEventForNotification').mockImplementation(() => { })
      const event = { category: 'PEER_VALIDATION', sub_category: 'PEER_REVIEW_ASSIGNED' }
      component.viewAllClick(event)
      expect(openVerSpy).toHaveBeenCalledWith(event)
    })

    it('should call handleRedirection when category is present but not PEER_VALIDATION', () => {
      jest.spyOn(component, 'raiseTelemetryEventForNotification').mockImplementation(() => { })
      const event = { category: 'LEARNING' }
      component.viewAllClick(event)
      expect(mockNotificationsService.handleRedirection).toHaveBeenCalled()
    })

    it('should navigate to notifications when no category', () => {
      component.viewAllClick('all')
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/notifications'],
        { queryParams: { tab: 'all' } }
      )
    })

    it('should match PEER_VALIDATION via sub_type', () => {
      const openSurveySpy = jest.spyOn(component, 'openSurveypopup').mockImplementation(() => { })
      jest.spyOn(component, 'raiseTelemetryEventForNotification').mockImplementation(() => { })
      const event = { sub_type: 'PEER_VALIDATION', sub_category: 'OTHER' }
      component.viewAllClick(event)
      expect(openSurveySpy).toHaveBeenCalled()
    })
  })

  describe('openSurveypopup', () => {
    beforeEach(() => {
      mockConfigSvc.userProfile = { firstName: 'John', lastName: 'Doe' }
    })

    it('should show snackbar and return if status is SUBMITTED', () => {
      const notification = { status: 'SUBMITTED', message: { data: [{}] } }
      component.openSurveypopup(notification)
      expect(mockSnackBar.open).toHaveBeenCalledWith(expect.stringContaining('survey'), 'X', expect.any(Object))
      expect(mockMatDialogNew.open).not.toHaveBeenCalled()
    })

    it('should show snackbar and return if status is IGNORED', () => {
      const notification = { status: 'IGNORED', message: { data: [{}] } }
      component.openSurveypopup(notification)
      expect(mockSnackBar.open).toHaveBeenCalled()
      expect(mockMatDialogNew.open).not.toHaveBeenCalled()
    })

    it('should show snackbar and return if surveyEndDate has passed', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString()
      const notification = { status: '', message: { data: [{ surveyEndDate: pastDate }] } }
      component.openSurveypopup(notification)
      expect(mockSnackBar.open).toHaveBeenCalledWith('Survey has ended.', 'X', expect.any(Object))
    })

    it('should open SurveyPopupComponent for valid notification', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString()
      const notification = {
        status: '',
        message: { data: [{ courseName: 'Test Course', completionDate: '2024-01-01', formId: 'f1', surveyEndDate: futureDate }] },
        notification_id: 'n-1',
        created_at: '2024-01-01',
      }
      component.openSurveypopup(notification)
      expect(mockMatDialogNew.open).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ width: '500px' }))
    })

    it('should set notification status to IGNORED when result is ignored', () => {
      mockMatDialogNew.open.mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of('ignored')) })
      const notification = { status: '', message: { data: [{}] }, notification_id: 'n-1', created_at: '' }
      component.openSurveypopup(notification)
      expect(notification.status).toBe('IGNORED')
    })
  })

  describe('openVerificationPopup', () => {
    it('should show snackbar if status is APPROVED', () => {
      const notification = { status: 'APPROVED', message: { data: [{}] } }
      component.openVerificationPopup(notification)
      expect(mockSnackBar.open).toHaveBeenCalled()
      expect(mockMatDialogNew.open).not.toHaveBeenCalled()
    })

    it('should show snackbar if status is REJECTED', () => {
      const notification = { status: 'REJECTED', message: { data: [{}] } }
      component.openVerificationPopup(notification)
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should show snackbar if status is IGNORED', () => {
      const notification = { status: 'IGNORED', message: { data: [{}] } }
      component.openVerificationPopup(notification)
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should open VerificationRequestDialogComponent for valid notification', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString()
      const notification = {
        status: '',
        message: { data: [{ requestedName: 'R', courseName: 'C', formId: 'f1', surveyEndDate: futureDate }] },
        notification_id: 'n-2',
        created_at: '2024-01-01',
      }
      component.openVerificationPopup(notification)
      expect(mockMatDialogNew.open).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ width: '440px' }))
    })

    it('should set notification status to IGNORED when dialog closes with ignored', () => {
      mockMatDialogNew.open.mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of('ignored')) })
      const notification = { status: '', message: { data: [{}] }, notification_id: 'n-1', created_at: '' }
      component.openVerificationPopup(notification)
      expect(notification.status).toBe('IGNORED')
    })
  })

  describe('openSupportChatBot', () => {
    it('should open chatbot when supportAI.all is true', () => {
      mockConfigSvc.iGOTAIConfig = { supportAI: { all: true } }
      mockConfigSvc.userProfile = { rootOrgId: 'org-1' }
      component.openSupportChatBot()
      expect(component.enableSupportAI).toBe(true)
      expect(mockRootService.openSupportAIChatbot.next).toHaveBeenCalledWith(true)
    })

    it('should open chatbot when org is in forOrg list', () => {
      mockConfigSvc.iGOTAIConfig = { supportAI: { all: false, forOrg: ['org-1'] } }
      mockConfigSvc.userProfile = { rootOrgId: 'org-1' }
      component.openSupportChatBot()
      expect(component.enableSupportAI).toBe(true)
      expect(mockRootService.openSupportAIChatbot.next).toHaveBeenCalledWith(true)
    })

    it('should call getZohoForm when no supportAI config matches', () => {
      mockConfigSvc.iGOTAIConfig = null
      const zohoSpy = jest.spyOn(component, 'getZohoForm').mockImplementation(() => { })
      component.openSupportChatBot()
      expect(zohoSpy).toHaveBeenCalled()
    })
  })
})

