import { DownloadAppComponent } from './download-app.component'
import { HomePageService } from '../../services/home-page.service'
import { TranslateService } from '@ngx-translate/core'

describe('DownloadAppComponent', () => {
  let component: DownloadAppComponent
  let homePageServiceMock: HomePageService
  let translateServiceMock: TranslateService

  beforeEach(() => {
    // Create mocks for services
    homePageServiceMock = { closeDialogPop: { next: jest.fn() } } as unknown as HomePageService
    translateServiceMock = { setDefaultLang: jest.fn(), use: jest.fn() } as unknown as TranslateService

    // Create the component instance
    component = new DownloadAppComponent(homePageServiceMock, translateServiceMock)

    // Mock localStorage behavior
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue('en'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })

    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      value: 800, // Default to mobile screen size
      writable: true,
    })
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should set default language and use the language from localStorage in the constructor', () => {
    component.ngOnInit()

    // Assert translateService methods are called as expected
    expect(translateServiceMock.setDefaultLang).toHaveBeenCalledWith('en')
    expect(translateServiceMock.use).toHaveBeenCalledWith('en')
  })

  it('should set isMobile to true if window.innerWidth <= 1200', () => {
    window.innerWidth = 800 // simulate mobile screen size
    component.ngOnInit()

    expect(component.isMobile).toBe(true)
  })

  it('should set isMobile to false if window.innerWidth > 1200', () => {
    window.innerWidth = 1500 // simulate desktop screen size
    component.ngOnInit()

    expect(component.isMobile).toBe(false)
  })

  it('should call closeDialogPop.next when closePopup is called', () => {
    component.closePopup()

    // Assert homePageService.closeDialogPop.next was called
    expect(homePageServiceMock.closeDialogPop.next).toHaveBeenCalledWith(true)
  })
})
