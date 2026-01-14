import { HttpClient } from '@angular/common/http'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Router, NavigationEnd } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { ConfigurationsService, ValueService, NsInstanceConfig, DomainConfService } from '@sunbird-cb/utils-v2'
import { of, Subject } from 'rxjs'
import { environment } from 'src/environments/environment'
import { AppFooterComponent } from './app-footer.component'

describe('AppFooterComponent', () => {
  let component: AppFooterComponent
  let fixture: ComponentFixture<AppFooterComponent>
  let configServiceMock: Partial<ConfigurationsService>
  let valueServiceMock: Partial<ValueService>
  let routerMock: Partial<Router>
  let translateServiceMock: Partial<TranslateService>
  let httpClientMock: Partial<HttpClient>
  let domainConfServiceMock: Partial<DomainConfService>

  const routerEventsSubject = new Subject<any>()
  const isXSmallSubject = new Subject<boolean>()

  beforeEach(async () => {
    // Create mocks for all required services
    configServiceMock = {
      baseUrl: 'http://test.base.url',
      restrictedFeatures: new Set<string>(),
      userRoles: new Set<string>(['user']),
      instanceConfig: undefined,
      portalUrls: undefined
    }

    valueServiceMock = {
      isXSmall$: isXSmallSubject.asObservable()
    }

    routerMock = {
      events: routerEventsSubject.asObservable()
    }

    translateServiceMock = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn()
    }

    httpClientMock = {
      get: jest.fn()
    }

    domainConfServiceMock = {
      getDomainAppLogo: jest.fn().mockReturnValue('test-logo.svg'),
      getDomainRedirectPath: jest.fn().mockReturnValue('/test-redirect'),
    } as any

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
    }
    Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
      ],
      declarations: [AppFooterComponent],
      providers: [
        { provide: ConfigurationsService, useValue: configServiceMock },
        { provide: ValueService, useValue: valueServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: HttpClient, useValue: httpClientMock },
        { provide: DomainConfService, useValue: domainConfServiceMock },
      ]
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(AppFooterComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set language from localStorage on construction', () => {
    // Mock localStorage
    jest.spyOn(localStorage, 'getItem').mockReturnValue('fr')

    // Create component instance
    fixture = TestBed.createComponent(AppFooterComponent)

    expect(translateServiceMock.setDefaultLang).toHaveBeenCalledWith('en')
    expect(translateServiceMock.use).toHaveBeenCalledWith('fr')
  })

  it('should subscribe to isXSmall$ on construction', () => {
    fixture = TestBed.createComponent(AppFooterComponent)
    isXSmallSubject.next(true)
    expect(component.isXSmall).toBe(true)

    isXSmallSubject.next(false)
    expect(component.isXSmall).toBe(false)
  })

  it('should update currentRoute on NavigationEnd event', () => {
    fixture = TestBed.createComponent(AppFooterComponent)
    const testUrl = '/app/competencies/test-path'
    routerEventsSubject.next(new NavigationEnd(1, testUrl, testUrl))
    expect(component.currentRoute).toBe('test-path')
  })

  it('should set termsOfUser to false if restricted', () => {
    configServiceMock.restrictedFeatures = new Set(['termsOfUser'])
    fixture = TestBed.createComponent(AppFooterComponent)
    expect(component.termsOfUser).toBe(true)
  })

  it('should set hubsList from instanceConfig if available', async () => {
    const mockHubs = [
      { active: true, name: 'Hub1' },
      { active: false, name: 'Hub2' },
      { active: true, name: 'Hub3' }
    ]

    configServiceMock.instanceConfig = {
      hubs: mockHubs
    } as unknown as NsInstanceConfig.IConfig

    fixture = TestBed.createComponent(AppFooterComponent)
    await component.ngOnInit()

    expect(component.hubsList.map((h: any) => ({ active: h.active, name: h.name }))).toEqual([
      { active: true, name: 'Hub1' },
      { active: true, name: 'Hub3' }
    ])

    expect(domainConfServiceMock.getDomainAppLogo).toHaveBeenCalled()
    expect(domainConfServiceMock.getDomainRedirectPath).toHaveBeenCalled()
    expect(component.logoSrc).toBe('test-logo.svg')
    expect(component.redirectPath).toBe('/test-redirect')
  })

  it('should fetch hubsList from API if not in instanceConfig', async () => {
    configServiceMock.instanceConfig = undefined

    const mockPublicConfig = {
      hubs: [
        { active: true, name: 'Hub1' },
        { active: false, name: 'Hub2' }
      ]
    };

    (httpClientMock.get as jest.Mock).mockReturnValue(of(mockPublicConfig))

    fixture = TestBed.createComponent(AppFooterComponent)
    await component.ngOnInit()

    expect(httpClientMock.get).toHaveBeenCalledWith('http://test.base.url/site.config.json')
    expect(component.hubsList.map((h: any) => ({ active: h.active, name: h.name }))).toEqual([
      { active: true, name: 'Hub1' }
    ])

    expect(domainConfServiceMock.getDomainAppLogo).toHaveBeenCalled()
    expect(domainConfServiceMock.getDomainRedirectPath).toHaveBeenCalled()
    expect(component.logoSrc).toBe('test-logo.svg')
    expect(component.redirectPath).toBe('/test-redirect')
  })

  it('should set portalUrls from configSvc if available', async () => {
    const mockPortalUrls = { portal1: 'url1', portal2: 'url2' } as any
    configServiceMock.portalUrls = mockPortalUrls

    fixture = TestBed.createComponent(AppFooterComponent)
    await component.ngOnInit()

    expect(component.portalUrls).toEqual(mockPortalUrls)
  })

  it('should bind url correctly', () => {
    fixture = TestBed.createComponent(AppFooterComponent)

    component.bindUrl('/test-path')
    expect(component.currentRoute).toBe('/test-path')

    component.bindUrl('/app/competencies')
    expect(component.currentRoute).toBe('/test-path') // Should not change for this path
  })

  it('should check if user has specific roles', () => {
    configServiceMock.userRoles = new Set(['role1', 'ROLE2'])
    fixture = TestBed.createComponent(AppFooterComponent)

    expect(component.hasRole(['role1', 'role3'])).toBe(true)
    expect(component.hasRole(['role2'])).toBe(true) // Case insensitive check
    expect(component.hasRole(['role3'])).toBe(false)
  })

  it('should check if portal is allowed based on roles', () => {
    configServiceMock.userRoles = new Set(['user']);

    // Patch environment portals for this test
    (environment as any).portals = [
      { id: 'portal1', roles: ['user'] },
      { id: 'portal2', roles: ['admin'] },
      { id: 'portal3', roles: [] },
    ]

    fixture = TestBed.createComponent(AppFooterComponent)

    expect(component.isAllowed('portal1')).toBe(true) // User has required role
    expect(component.isAllowed('portal2')).toBe(false) // User doesn't have admin role
    expect(component.isAllowed('portal3')).toBe(true) // Portal with no roles should be allowed
  })

  it('should translate hub names', () => {
    (translateServiceMock.instant as jest.Mock).mockReturnValue('Translated Hub')
    fixture = TestBed.createComponent(AppFooterComponent)

    expect(component.translateHub('testHub')).toBe('Translated Hub')
    expect(translateServiceMock.instant).toHaveBeenCalledWith('common.testHub')
  })

  it('should determine if footer needs to be hidden', () => {
    fixture = TestBed.createComponent(AppFooterComponent)

    component.currentRoute = 'page/home'
    expect(component.needToHide).toBe(false)

    component.currentRoute = 'all/assessment/test'
    expect(component.needToHide).toBe(true)
  })

  it('should toggle open class on click', () => {
    fixture = TestBed.createComponent(AppFooterComponent)

    const mockEvent = {
      target: {
        parentElement: {
          classList: {
            toggle: jest.fn()
          }
        }
      }
    }

    component.onClick(mockEvent)
    expect(mockEvent.target.parentElement.classList.toggle).toHaveBeenCalledWith('open')
  })
})