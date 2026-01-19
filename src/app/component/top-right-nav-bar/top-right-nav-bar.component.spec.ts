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
  let mockDialog: MockMatDialog
  let mockHomePageService: MockHomePageService
  let mockConfigSvc: MockConfigurationsService
  let mockLangtranslations: MockMultilingualTranslationsService
  let mockTranslate: MockTranslateService
  let mockHttp: MockHttpClient
  let mockSanitizer: MockDomSanitizer
  let mockEvents: MockEventService
  let mockSnackBar: MockMatSnackBar
  let mockRouter: MockRouter
  let mockNotificationsService: MockNotificationsService
  let mockRootService: MockRootService

  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
  }
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    configurable: true,
  })

  // Mock XMLHttpRequest
  const mockXHR: any = {
    open: jest.fn(),
    send: jest.fn(),
    onreadystatechange: jest.fn(),
    readyState: 4,
    status: 200,
    responseText: JSON.stringify({
      captchaUrl: 'http://example.com/captcha.png',
      captchaDigest: 'digest123'
    })
  };
  (globalThis as any).XMLHttpRequest = jest.fn(() => mockXHR)

  // Mock DOM elements
  const mockElement = {
    src: '',
    style: { display: '' },
    value: '',
    addEventListener: jest.fn()
  }
  const mockGetElementById = jest.fn().mockReturnValue(mockElement)
  const mockGetElementsByName = jest.fn().mockReturnValue([mockElement])
  Object.defineProperty(document, 'getElementById', { value: mockGetElementById })
  Object.defineProperty(document, 'getElementsByName', { value: mockGetElementsByName })

  // Mock window.open
  Object.defineProperty(globalThis, 'open', {
    value: jest.fn(),
    configurable: true,
  })

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()

    // Create mock instances
    mockDialog = new MockMatDialog()
    mockHomePageService = new MockHomePageService()
    mockConfigSvc = new MockConfigurationsService()
    mockLangtranslations = new MockMultilingualTranslationsService()
    mockTranslate = new MockTranslateService()
    mockHttp = new MockHttpClient()
    mockSanitizer = new MockDomSanitizer()
    mockEvents = new MockEventService()
    mockSnackBar = new MockMatSnackBar()
    mockRouter = new MockRouter()
    mockNotificationsService = new MockNotificationsService()
    mockRootService = new MockRootService()

    // Create component instance
    component = new TopRightNavBarComponent(
      mockDialog as any,
      mockHomePageService as any,
      mockConfigSvc as any,
      mockLangtranslations as any,
      mockTranslate as any,
      mockHttp as any,
      mockSanitizer as any,
      mockEvents as any,
      mockSnackBar as any,
      mockRouter as any,
      mockNotificationsService as any,
      mockRootService as any
    )
  })

  describe('Constructor', () => {
    it('should create component', () => {
      expect(component).toBeDefined()
    })

    it('should set default language and selected language from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('"hi"')

      component = new TopRightNavBarComponent(
        mockDialog as any,
        mockHomePageService as any,
        mockConfigSvc as any,
        mockLangtranslations as any,
        mockTranslate as any,
        mockHttp as any,
        mockSanitizer as any,
        mockEvents as any,
        mockSnackBar as any,
        mockRouter as any,
        mockNotificationsService as any,
        mockRootService as any
      )

      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslate.use).toHaveBeenCalledWith('hi')
      expect(component.selectedLanguage).toBe('hi')
    })

    it('should handle localStorage with quotes in language value', () => {
      mockLocalStorage.getItem.mockReturnValue('"te"')

      component = new TopRightNavBarComponent(
        mockDialog as any,
        mockHomePageService as any,
        mockConfigSvc as any,
        mockLangtranslations as any,
        mockTranslate as any,
        mockHttp as any,
        mockSanitizer as any,
        mockEvents as any,
        mockSnackBar as any,
        mockRouter as any,
        mockNotificationsService as any,
        mockRootService as any
      )

      expect(component.selectedLanguage).toBe('te')
    })

    it('should subscribe to languageSelectedObservable', () => {
      mockLocalStorage.getItem.mockReturnValue('en')

      component = new TopRightNavBarComponent(
        mockDialog as any,
        mockHomePageService as any,
        mockConfigSvc as any,
        mockLangtranslations as any,
        mockTranslate as any,
        mockHttp as any,
        mockSanitizer as any,
        mockEvents as any,
        mockSnackBar as any,
        mockRouter as any,
        mockNotificationsService as any,
        mockRootService as any
      )

      // Trigger the observable
      mockLangtranslations.languageSelectedObservable.next(true)

      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslate.use).toHaveBeenCalledWith('en')
      expect(component.selectedLanguage).toBe('en')
    })

    it('should set roles from configSvc.unMappedUser', () => {
      expect(component.roles).toEqual(['admin', 'user'])
    })

    it('should handle missing configSvc.unMappedUser.roles', () => {
      mockConfigSvc.unMappedUser = null

      component = new TopRightNavBarComponent(
        mockDialog as any,
        mockHomePageService as any,
        mockConfigSvc as any,
        mockLangtranslations as any,
        mockTranslate as any,
        mockHttp as any,
        mockSanitizer as any,
        mockEvents as any,
        mockSnackBar as any,
        mockRouter as any,
        mockNotificationsService as any,
        mockRootService as any
      )

      expect(component.roles).toEqual([])
    })
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.rightNavConfig = { topRightNavConfig: ['config1', 'config2'] }
    })

    it('should set multiLang and isMultiLangEnabled from instanceConfig', () => {
      component.ngOnInit()

      expect(component.multiLang).toEqual(['en', 'hi', 'te'])
      expect(component.isMultiLangEnabled).toBe(true)
    })

    it('should handle missing instanceConfig', () => {
      mockConfigSvc.instanceConfig = null

      component.ngOnInit()

      expect(component.multiLang).toEqual([])
      expect(component.isMultiLangEnabled).toBeUndefined()
    })

    it('should set rightNavConfig from topRightNavConfig', () => {
      component.ngOnInit()

      expect(component.rightNavConfig).toEqual(['config1', 'config2'])
    })

    it('should use rightNavConfig directly if topRightNavConfig not present', () => {
      component.rightNavConfig = ['direct-config']

      component.ngOnInit()

      expect(component.rightNavConfig).toEqual(['direct-config'])
    })

    it('should subscribe to closeDialogPop and close dialog', () => {
      const mockDialogRef = { close: jest.fn() }
      component.dialogRef = mockDialogRef

      component.ngOnInit()
      mockHomePageService.closeDialogPop.next(true)

      expect(mockDialogRef.close).toHaveBeenCalled()
    })

    it('should not close dialog if closeDialogPop data is falsy', () => {
      const mockDialogRef = { close: jest.fn() }
      component.dialogRef = mockDialogRef

      component.ngOnInit()
      mockHomePageService.closeDialogPop.next(false)

      expect(mockDialogRef.close).not.toHaveBeenCalled()
    })

    it('should fetch zoho HTML and sanitize it', () => {
      component.ngOnInit()

      expect(mockHttp.get).toHaveBeenCalledWith('/assets/static-data/zoho-code.html', { responseType: 'text' })
      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<html>zoho form</html>')
      expect(component.zohoHtml).toBe('sanitized-html')
    })
  })

  describe('ngOnChanges', () => {
    it('should update rightNavConfig from topRightNavConfig', () => {
      component.rightNavConfig = { topRightNavConfig: ['changed-config'] }

      component.ngOnChanges()

      expect(component.rightNavConfig).toEqual(['changed-config'])
    })

    it('should use rightNavConfig directly if topRightNavConfig not present', () => {
      component.rightNavConfig = ['direct-changed-config']

      component.ngOnChanges()

      expect(component.rightNavConfig).toEqual(['direct-changed-config'])
    })
  })

  describe('translateLabels', () => {
    it('should call langtranslations.translateLabel with correct parameters', () => {
      const result = component.translateLabels('test-label', 'test-type')

      expect(mockLangtranslations.translateLabel).toHaveBeenCalledWith('test-label', 'test-type', '')
      expect(result).toBe('translated-label')
    })
  })

  describe('onBellClick', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should reset notifications count when count > 0', () => {
      component.notificationsCount = 5

      component.onBellClick()

      expect(mockNotificationsService.resetNotificationsCount).toHaveBeenCalled()
    })

    it('should set notificationsCount to 0 on successful reset', () => {
      component.notificationsCount = 5

      component.onBellClick()

      expect(component.notificationsCount).toBe(0)
    })

    it('should handle error when resetting notifications count', () => {
      component.notificationsCount = 5
      mockNotificationsService.resetNotificationsCount.mockReturnValue(throwError('error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      component.onBellClick()

      expect(consoleSpy).toHaveBeenCalledWith('Error while fetching notifications count', 'error')
      consoleSpy.mockRestore()
    })

    it('should not reset notifications when count is 0', () => {
      component.notificationsCount = 0

      component.onBellClick()

      expect(mockNotificationsService.resetNotificationsCount).not.toHaveBeenCalled()
    })

    it('should set showDropdown to false then true after timeout', () => {
      component.onBellClick()

      expect(component.showDropdown).toBe(false)

      jest.runAllTimers()

      expect(component.showDropdown).toBe(true)
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
    it('should update selected language and localStorage', () => {
      component.selectLanguage('hi')

      expect(component.selectedLanguage).toBe('hi')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('websiteLanguage', 'hi')
    })

    it('should call updatelanguageSelected with correct parameters', () => {
      component.selectLanguage('te')

      expect(mockLangtranslations.updatelanguageSelected).toHaveBeenCalledWith(
        true,
        'te',
        'user123'
      )
    })

    it('should handle missing unMappedUser id', () => {
      mockConfigSvc.unMappedUser = null

      component.selectLanguage('en')

      expect(mockLangtranslations.updatelanguageSelected).toHaveBeenCalledWith(
        true,
        'en',
        ''
      )
    })

    it('should trigger languageTranslationFlag', () => {
      const nextSpy = jest.spyOn(mockConfigSvc.languageTranslationFlag, 'next')

      component.selectLanguage('hi')

      expect(nextSpy).toHaveBeenCalledWith(true)
    })
  })

  describe('getZohoForm', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should open zoho dialog with correct parameters', () => {
      component.zohoHtml = 'test-html'

      component.getZohoForm()

      expect(mockDialog.open).toHaveBeenCalledWith((expect as any).anything(), {
        width: '45%',
        data: {
          view: 'zohoform',
          value: 'test-html',
        },
      })
    })

    it('should call callXMLRequest after timeout', () => {
      const callXMLRequestSpy = jest.spyOn(component, 'callXMLRequest').mockImplementation()

      component.getZohoForm()
      jest.runAllTimers()

      expect(callXMLRequestSpy).toHaveBeenCalled()
    })
  })

  describe('openDialog', () => {
    it('should open dialog with correct width', () => {
      component.openDialog()

      expect(mockDialog.open).toHaveBeenCalledWith((expect as any).anything(), {
        width: '1000px',
      })
    })

    it('should set dialogRef', () => {
      const expectedDialogRef = { afterClosed: () => of(true) }
      mockDialog.open.mockReturnValue(expectedDialogRef)

      component.openDialog()

      expect(component.dialogRef).toBe(expectedDialogRef)
    })
  })

  describe('callXMLRequest', () => {
    it('should create XMLHttpRequest and configure it', () => {
      component.callXMLRequest()

      expect(mockXHR.open).toHaveBeenCalledWith(
        'GET',
        (expect as any).stringContaining('https://desk.zoho.in/support/GenerateCaptcha?action=getNewCaptcha&_='),
        true
      )
      expect(mockXHR.send).toHaveBeenCalled()
    })

    it('should handle successful XMLHttpRequest response', () => {
      component.callXMLRequest()

      // Simulate successful response
      mockXHR.onreadystatechange()

      expect(mockGetElementById).toHaveBeenCalledWith('zsCaptchaUrl')
      expect(mockGetElementById).toHaveBeenCalledWith('zsCaptchaLoading')
      expect(mockGetElementById).toHaveBeenCalledWith('zsCaptcha')
      expect(mockGetElementById).toHaveBeenCalledWith('refreshCaptcha')
      expect(mockGetElementsByName).toHaveBeenCalledWith('xJdfEaS')
    })

    it('should handle XMLHttpRequest response with null responseText', () => {
      mockXHR.responseText = null

      component.callXMLRequest()
      mockXHR.onreadystatechange()

      // Should not throw error
      expect(mockGetElementById).toHaveBeenCalled()
    })

    it('should handle JSON parse error gracefully', () => {
      mockXHR.responseText = 'invalid json'

      expect(() => {
        component.callXMLRequest()
        mockXHR.onreadystatechange()
      }).not.toThrow()
    })

    it('should add event listener to refresh captcha', () => {
      mockXHR.responseText = JSON.stringify({
        captchaUrl: 'http://example.com/captcha.png',
        captchaDigest: 'digest123',
      })

      component.callXMLRequest()
      mockXHR.onreadystatechange()

      expect(mockElement.addEventListener).toHaveBeenCalledWith('click', (expect as any).any(Function))
    })

    it('should handle missing DOM elements gracefully', () => {
      mockXHR.responseText = JSON.stringify({
        captchaUrl: 'http://example.com/captcha.png',
        captchaDigest: 'digest123',
      })
      mockGetElementById.mockReturnValue(null)

      component.callXMLRequest()
      mockXHR.onreadystatechange()

      // Should not throw error
      expect(mockGetElementById).toHaveBeenCalled()
    })
  })

  describe('viewAllClick', () => {
    it('should handle event with category', () => {
      const event = { category: 'test-category', notification_id: '123' }
      const raiseTelemetrySpy = jest.spyOn(component, 'raiseTelemetryEventForNotification')

      component.viewAllClick(event)

      expect(raiseTelemetrySpy).toHaveBeenCalledWith(event)
      expect(mockNotificationsService.handleRedirection).toHaveBeenCalledWith(
        event,
        (expect as any).anything(),
        ['admin', 'user'],
        mockSnackBar
      )
    })

    it('should navigate to notifications page without category', () => {
      const event = 'test-tab'

      component.viewAllClick(event)

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/notifications'], {
        queryParams: { tab: 'test-tab' }
      })
    })
  })

  describe('reCountNotifications', () => {
    it('should emit event to notifications service', () => {
      const nextSpy = jest.spyOn(mockNotificationsService.nofificationsCount, 'next')

      component.reCountNotifications(10)

      expect(nextSpy).toHaveBeenCalledWith(10)
    })

    it('should log the event', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      component.reCountNotifications(5)

      expect(consoleSpy).toHaveBeenCalledWith('reCountNotifications', 5)
      consoleSpy.mockRestore()
    })
  })

  describe('calculateCount', () => {
    it('should log the event', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      component.calculateCount('test-event')

      expect(consoleSpy).toHaveBeenCalledWith('sds', 'test-event')
      consoleSpy.mockRestore()
    })
  })

  describe('showDialog', () => {
    it('should open confirm dialog and handle positive result', () => {
      const data = { message: 'test message' }
      const url = 'http://example.com'

      component.showDialog(data, url)

      expect(mockDialog.open).toHaveBeenCalledWith((expect as any).anything(), data)
      expect((globalThis as any).open).toHaveBeenCalledWith(url, '_blank')
    })

    it('should not open URL on negative dialog result', () => {
      mockDialog.open.mockReturnValue({
        afterClosed: () => of(false)
      })
      const data = { message: 'test message' }
      const url = 'http://example.com'

      component.showDialog(data, url)

      expect((globalThis as any).open).not.toHaveBeenCalled()
    })
  })

  describe('openSupportChatBot', () => {
    it('should enable support AI and open chatbot when supportAI.all is true', () => {
      mockConfigSvc.iGOTAIConfig = {
        supportAI: {
          all: true,
        },
      }

      const nextSpy = jest.spyOn(mockRootService.openSupportAIChatbot, 'next')

      component.openSupportChatBot()

      expect(component.enableSupportAI).toBe(true)
      expect(nextSpy).toHaveBeenCalledWith(true)
    })

    it('should enable support AI and open chatbot when user org is allowed', () => {
      mockConfigSvc.iGOTAIConfig = {
        supportAI: {
          forOrg: ['org-1', 'root-org'],
        },
      }
      mockConfigSvc.userProfile = {
        rootOrgId: 'root-org',
      }

      const nextSpy = jest.spyOn(mockRootService.openSupportAIChatbot, 'next')

      component.openSupportChatBot()

      expect(component.enableSupportAI).toBe(true)
      expect(nextSpy).toHaveBeenCalledWith(true)
    })

    it('should fallback to Zoho form when support AI config is not applicable', () => {
      mockConfigSvc.iGOTAIConfig = {
        supportAI: {
          forOrg: ['some-other-org'],
        },
      }
      mockConfigSvc.userProfile = {
        rootOrgId: 'root-org',
      }

      const getZohoFormSpy = jest.spyOn(component, 'getZohoForm').mockImplementation()

      component.openSupportChatBot()

      expect(getZohoFormSpy).toHaveBeenCalled()
    })
  })

  describe('raiseTelemetryEventForNotification', () => {
    it('should call events.raiseInteractTelemetry with correct parameters', () => {
      const notification = { notification_id: 'test-123' }

      component.raiseTelemetryEventForNotification(notification)

      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'notification-engine',
          id: 'test-123',
        },
        {},
        {
          module: 'Home',
        }
      )
    })
  })

  describe('Input Properties', () => {
    it('should have default values for input properties', () => {
      expect(component.showLangDropdown).toBe(true)
      expect(component.selectedLanguage).toBe('en')
      expect(component.showDropdown).toBe(false)
      expect(component.zohoUrl).toBe('/assets/static-data/zoho-code.html')
    })
  })

  describe('Error Handling', () => {
    it('should handle HTTP error when fetching zoho HTML', () => {
      mockHttp.get.mockReturnValue(throwError('HTTP Error'))
      component.rightNavConfig = { topRightNavConfig: [] }

      component.ngOnInit()

      expect(mockHttp.get).toHaveBeenCalled()
      // Component should not crash on HTTP error
    })

    it('should handle resetNotificationsCount error response', () => {
      component.notificationsCount = 5
      mockNotificationsService.resetNotificationsCount.mockReturnValue(
        of({ responseCode: 'ERROR' })
      )

      component.onBellClick()

      expect(component.notificationsCount).toBe(5) // Should remain unchanged
    })
  })
})