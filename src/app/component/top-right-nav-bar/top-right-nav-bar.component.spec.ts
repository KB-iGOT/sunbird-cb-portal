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
    }

    mockRootService = {
      getCookie: jest.fn(),
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
})

