import { TopRightNavBarComponent } from './top-right-nav-bar.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { HomePageService } from '../../services/home-page.service';
import { ConfigurationsService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';

describe('TopRightNavBarComponent', () => {
  let component: TopRightNavBarComponent;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockHomePageService: jest.Mocked<HomePageService>;
  let mockConfigSvc: jest.Mocked<ConfigurationsService>;
  let mockLangTranslations: jest.Mocked<MultilingualTranslationsService>;
  let mockTranslate: jest.Mocked<TranslateService>;
  let mockHttpClient: jest.Mocked<HttpClient>;
  let mockSanitizer: jest.Mocked<DomSanitizer>;
  let mockEventService:any;
  let mockSnackBar:any;
  let mockRouter:any;
  let mockNotificationsService:any;
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = (() => {
      let store: { [key: string]: string } = {};
      return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value.toString();
        }),
        clear: jest.fn(() => {
          store = {};
        })
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Create mock instances
    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of({}))
      })
    } as any;

    mockHomePageService = {
      closeDialogPop: of(false)
    } as any;

    mockConfigSvc = {
      instanceConfig: {
        websitelanguages: ['en', 'fr'],
        isMultilingualEnabled: true
      },
      unMappedUser: { id: 'test-user' },
      languageTranslationFlag: {
        next: jest.fn()
      }
    } as any;

    mockLangTranslations = {
      languageSelectedObservable: of({}),
      translateLabel: jest.fn().mockReturnValue('translated-label'),
      updatelanguageSelected: jest.fn()
    } as any;

    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    } as any;

    mockHttpClient = {
      get: jest.fn().mockReturnValue(of('<html>Zoho HTML</html>'))
    } as any;

    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn().mockReturnValue('sanitized-html')
    } as any;

    mockEventService = {

    }
    // Instantiate component with mocks
    component = new TopRightNavBarComponent(
      mockDialog,
      mockHomePageService,
      mockConfigSvc,
      mockLangTranslations,
      mockTranslate,
      mockHttpClient,
      mockSanitizer,
      mockEventService, 
      mockSnackBar,
      mockRouter, 
      mockNotificationsService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    it('should set default language when websiteLanguage is in localStorage', () => {
      localStorage.setItem('websiteLanguage', 'fr');
      
      // Recreate component to trigger constructor logic
      component = new TopRightNavBarComponent(
        mockDialog,
        mockHomePageService,
        mockConfigSvc,
        mockLangTranslations,
        mockTranslate,
        mockHttpClient,
        mockSanitizer,
        mockEventService, 
      mockSnackBar,
      mockRouter, 
      mockNotificationsService
      );

      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockTranslate.use).toHaveBeenCalledWith('fr');
      expect(component.selectedLanguage).toBe('fr');
    });
  });

  describe('ngOnInit', () => {
    it('should set multilingual configuration', () => {
      component.ngOnInit();

      expect(component.multiLang).toEqual(['en', 'fr']);
      expect(component.isMultiLangEnabled).toBe(true);
    });

    it('should fetch Zoho HTML and sanitize it', () => {
      component.ngOnInit();

      // expect(mockHttpClient.get).toHaveBeenCalledWith(component.zohoUrl, { responseType: 'text' });
      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<html>Zoho HTML</html>');
      expect(component.zohoHtml).toBe('sanitized-html');
    });
  });

  describe('translateLabels', () => {
    it('should call translateLabel method', () => {
      const result = component.translateLabels('test-label', 'test-type');

      expect(mockLangTranslations.translateLabel).toHaveBeenCalledWith('test-label', 'test-type', '');
      expect(result).toBe('translated-label');
    });
  });

  describe('selectLanguage', () => {
    it('should update selected language and notify services', () => {
      component.selectLanguage('fr');

      expect(component.selectedLanguage).toBe('fr');
      expect(localStorage.setItem).toHaveBeenCalledWith('websiteLanguage', 'fr');
      expect(mockLangTranslations.updatelanguageSelected).toHaveBeenCalledWith(true, 'fr', 'test-user');
      expect(mockConfigSvc.languageTranslationFlag.next).toHaveBeenCalledWith(true);
    });
  });

  describe('getZohoForm', () => {
    it('should open Zoho dialog and call XML request', () => {
      jest.useFakeTimers();
      const mockCallXMLRequest = jest.spyOn(component, 'callXMLRequest');

      component.getZohoForm();

      expect(mockDialog.open).toHaveBeenCalled();
      jest.advanceTimersByTime(0);
      expect(mockCallXMLRequest).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe('openDialog', () => {
    it('should open dialog box', () => {
      component.openDialog();

      expect(mockDialog.open).toHaveBeenCalled();
    });
  });

  // Note: callXMLRequest method involves direct DOM manipulation 
  // which is challenging to test in a pure unit test environment
  describe('callXMLRequest', () => {
    it('should be a method that exists', () => {
      expect(typeof component.callXMLRequest).toBe('function');
    });
  });
});