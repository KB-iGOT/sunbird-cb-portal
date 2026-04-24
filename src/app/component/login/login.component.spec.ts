import { LoginComponent } from './login.component'
import { SafeUrl } from '@angular/platform-browser'
import { of } from 'rxjs'

// Mock the services
jest.mock('@angular/router')
jest.mock('@sunbird-cb/utils-v2')
jest.mock('@angular/platform-browser')

describe('LoginComponent', () => {
  let component: LoginComponent
  let mockActivatedRoute: any
  let mockConfigService: any
  let mockDomSanitizer: any

  beforeEach(() => {
    // Create mocks for services
    mockActivatedRoute = {
      data: of({
        pageData: {
          data: {
            isClient: true,
            footer: {
              descriptiveFooter: { text: 'Footer text' },
              contactUs: true,
            },
            topbar: {
              title: 'Title',
              subTitle: 'Sub Title',
            },
          },
        },
      }),
    }
    mockConfigService = {
      instanceConfig: {
        logos: {
          appTransparent: 'app-logo-url',
          company: 'company-logo-url',
          developedBy: 'Developed by XYZ',
        },
      },
    }
    mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('safe-url') as jest.Mock<SafeUrl>,
    }

    // Create instance of LoginComponent
    component = new LoginComponent(mockActivatedRoute, mockConfigService, mockDomSanitizer)
  })

  it('should create the component', () => {
    expect(component).toBeDefined()
  })

  it('should initialize the component with the correct values on ngOnInit', () => {
    component.ngOnInit()

    expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('app-logo-url')
    expect(component.appIcon).toBe('safe-url')
    expect(component.productLogo).toBe('company-logo-url')
    expect(component.developedBy).toBe('Developed by XYZ')

    // Verifying the data set from activated route
    expect(component.loginConfig).toBeDefined()
    expect(component.isClientLogin).toBe(true)
    expect(component.welcomeFooter).toBeDefined()
    expect(component.title).toBe('Title')
    expect(component.subTitle).toBe('Sub Title')
    expect(component.contactUs).toBe(true)
  })

  it('should unsubscribe from the subscription on ngOnDestroy', () => {
    component.ngOnInit()
    const sub = (component as any).subscriptionLogin
    const unsubscribeSpy = jest.spyOn(sub, 'unsubscribe')

    component.ngOnDestroy()

    expect(unsubscribeSpy).toHaveBeenCalled()
  })

  it('should not throw when subscriptionLogin is null on ngOnDestroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow()
  })

  it('should handle null instanceConfig gracefully', () => {
    mockConfigService.instanceConfig = null
    component = new LoginComponent(mockActivatedRoute, mockConfigService, mockDomSanitizer)

    component.ngOnInit()

    expect(component.appIcon).toBeNull()
    expect(component.productLogo).toBe('')
    expect(component.developedBy).toBe('')
  })
})
