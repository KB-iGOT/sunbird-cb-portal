import { PrivacyPolicyComponent } from './privacy-policy.component'
import { TranslateService } from '@ngx-translate/core'
import { ActivatedRoute } from '@angular/router'
import { of } from 'rxjs'

describe('PrivacyPolicyComponent', () => {
  let component: PrivacyPolicyComponent
  let mockTranslateService: TranslateService
  let mockActivatedRoute: ActivatedRoute

  beforeEach(() => {
    // Mock the TranslateService
    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    } as any

    // Mock the ActivatedRoute
    mockActivatedRoute = {
      queryParams: of({ mode: 'mobile' }), // Simulate query params with 'mode' as 'mobile'
    } as any

    // Create instance of the component
    component = new PrivacyPolicyComponent(mockTranslateService, mockActivatedRoute)
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should set the default language to "en" if websiteLanguage exists in localStorage', () => {
    // Simulate localStorage item
    localStorage.setItem('websiteLanguage', 'en')

    // Create new component instance to check the constructor logic
    //const newComponent = new PrivacyPolicyComponent(mockTranslateService, mockActivatedRoute)

    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en')
    expect(mockTranslateService.use).toHaveBeenCalledWith('en')
  })

  it('should set hideHeader to true if "mode" query parameter is "mobile"', () => {
    component.ngOnInit()

    expect(component.hideHeader).toBe(true)
  })

  it('should call translate.use with the correct language when changeLanguage is called', () => {
    const language = 'fr'
    component.changeLanguage(language)

    expect(mockTranslateService.use).toHaveBeenCalledWith(language)
  })

  it('should not change hideHeader if "mode" query parameter is not "mobile"', () => {
    // Simulate query parameter with a different value
    mockActivatedRoute.queryParams = of({ mode: 'desktop' })
    component.ngOnInit()

    expect(component.hideHeader).toBe(false)
  })
})
