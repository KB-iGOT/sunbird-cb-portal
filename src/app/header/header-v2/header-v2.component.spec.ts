import { ComponentFixture, TestBed } from '@angular/core/testing'
import { DomainConfService, ValueService } from '@sunbird-cb/utils-v2'
import { of, Subject } from 'rxjs'

import { HeaderV2Component } from './header-v2.component'
import { MobileAppsService } from '../../services/mobile-apps.service'

// the nav bar is only referenced in the standalone imports; loading it for real pulls in the
// @ws/app barrel and learn-search.component, which does not compile against the installed utils-v2
jest.mock('../../component/app-nav-bar-v2/app-nav-bar-v2.component', () => ({
  AppNavBarV2Component: class AppNavBarV2Component { },
}))

describe('HeaderV2Component', () => {
  let component: HeaderV2Component
  let fixture: ComponentFixture<HeaderV2Component>
  let mockDomainConfSvc: { isConfigEnabled: jest.Mock }
  let mockMobileAppsSvc: { mobileTopHeaderVisibilityStatus: Subject<boolean> }

  beforeEach(async () => {
    mockDomainConfSvc = {
      isConfigEnabled: jest.fn().mockReturnValue(true),
    }

    mockMobileAppsSvc = {
      mobileTopHeaderVisibilityStatus: new Subject<boolean>(),
    }

    await TestBed.configureTestingModule({
      imports: [HeaderV2Component],
      providers: [
        { provide: ValueService, useValue: { isXSmall$: of(false) } },
        { provide: DomainConfService, useValue: mockDomainConfSvc },
        { provide: MobileAppsService, useValue: mockMobileAppsSvc },
      ],
    })
      .overrideComponent(HeaderV2Component, { set: { imports: [], template: '' } })
      .compileComponents()

    fixture = TestBed.createComponent(HeaderV2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.mobileTopHeaderVisibilityStatus()).toBe(true)
      expect(component.leftNavBarOpen()).toBe(false)
    })

    it('should build the hubs widget data on init', () => {
      expect(component.widgetData.widgets[0][0].widget.widgetSubType).toBe('cardHomeHubs')
    })

    it('should read the nps flag from the domain config', () => {
      expect(component.isNpsEnabled).toBe(true)
      expect(mockDomainConfSvc.isConfigEnabled).toHaveBeenCalledWith('components.dialogs', 'npsSurvey')
    })
  })

  describe('leftNavBarOpen input', () => {
    it('should reflect the bound value', () => {
      fixture.componentRef.setInput('leftNavBarOpen', true)
      expect(component.leftNavBarOpen()).toBe(true)
    })
  })

  describe('Mobile Header', () => {
    it('should hide mobile top header when hideMobileTopHeader is called', () => {
      component.hideMobileTopHeader()
      expect(component.mobileTopHeaderVisibilityStatus()).toBe(false)
    })

    it('should emit event to mobile apps service when hiding banner', () => {
      const nextSpy = jest.spyOn(mockMobileAppsSvc.mobileTopHeaderVisibilityStatus, 'next')
      component.hideMobileTopHeader()
      expect(nextSpy).toHaveBeenCalledWith(false)
    })
  })

  describe('Download App', () => {
    it('should open Android app store on Android devices', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Android',
        configurable: true,
      })

      component.downloadApp()
      expect(openSpy).toHaveBeenCalledWith(
        expect.stringContaining('play.google.com'),
        '_blank',
      )
      openSpy.mockRestore()
    })
  })
})
