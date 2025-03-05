import { AppPublicNavBarComponent } from './app-public-nav-bar.component'
import { DomSanitizer } from '@angular/platform-browser'
import { ConfigurationsService, NsPage } from '@sunbird-cb/utils-v2'

// Mock the dependencies
jest.mock('@angular/platform-browser', () => ({
  DomSanitizer: jest.fn().mockImplementation(() => ({
    bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('safe-url'),
  })),
}))

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn().mockImplementation(() => ({
    instanceConfig: {
      logos: { appTransparent: 'http://example.com/logo.png' },
      details: { appName: 'MyApp' },
    },
    primaryNavBar: {
      backgroundColor: '#fff',
      textColor: '#000',
    } as unknown as NsPage.INavBackground,
  })),
}))

describe('AppPublicNavBarComponent', () => {
  let component: AppPublicNavBarComponent
  let sanitizer: DomSanitizer
  let configService: ConfigurationsService

  beforeEach(() => {
    // Initialize the dependencies
   // sanitizer = new DomSanitizer() as any
    configService = new ConfigurationsService() as any

    // Create the component instance
    component = new AppPublicNavBarComponent(sanitizer, configService)
  })

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize appIcon, appName, and navBar properties on ngOnInit', () => {
    // Trigger ngOnInit manually
    component.ngOnInit()

    // Verify the values assigned in ngOnInit
    expect(component.appIcon).toBe('safe-url')
    expect(component.appName).toBe('MyApp')
    // expect(component.navBar).toEqual({
    //   backgroundColor: '#fff',
    //   textColor: '#000',
    // })
  })

  it('should return true for showPublicNavbar getter', () => {
    expect(component.showPublicNavbar).toBe(true)
  })

  it('should call bypassSecurityTrustResourceUrl when initializing appIcon', () => {
    // Trigger ngOnInit and check if bypassSecurityTrustResourceUrl is called
    component.ngOnInit()

    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
      'http://example.com/logo.png'
    )
  })
})
