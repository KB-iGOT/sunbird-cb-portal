import { FooterSectionComponent } from './footer-section.component'
import { ConfigurationsService, DomainConfService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { DiscussUtilsService } from '@ws/app/src/lib/routes/discuss/services/discuss-utils.service'
import { Router } from '@angular/router'

describe('FooterSectionComponent', () => {
  let component: FooterSectionComponent
  let configSvcMock: jest.Mocked<ConfigurationsService>
  let discussUtilitySvcMock: jest.Mocked<DiscussUtilsService>
  let routerMock: jest.Mocked<Router>
  let langtranslationsMock: jest.Mocked<MultilingualTranslationsService>
  let domainConfSvcMock: jest.Mocked<DomainConfService>

  beforeEach(() => {
    // Mock the dependencies
    configSvcMock = {
      nodebbUserProfile: { username: 'testuser' },
      userRoles: new Set(['admin']),
    } as any

    discussUtilitySvcMock = {
      setDiscussionConfig: jest.fn(),
    } as any

    routerMock = {
      navigate: jest.fn(),
    } as any

    langtranslationsMock = {
      translateLabelWithoutspace: jest.fn().mockReturnValue('translated-label'),
      translateLabel: jest.fn().mockReturnValue('translated-label-with-space'),
    } as any

    domainConfSvcMock = {
      isKbPortal: jest.fn().mockReturnValue(true),
    } as any

    // Instantiate the component
    component = new FooterSectionComponent(
      configSvcMock,
      discussUtilitySvcMock,
      routerMock,
      langtranslationsMock,
      domainConfSvcMock
    )

    // Set up input data
    component.environment = { portals: [{ id: '1', name: 'Portal 1', isPublic: true }] }
    component.hubsList = []
    component.headerFooterConfigData = {
      footerSectionConfig: [
        { id: 1, order: 1, sectionHeading: 'Hubs', active: true, slug: 'hub' },
        { id: 2, order: 2, sectionHeading: 'Related Links', active: true, slug: 'link' },
      ],
    }
  })

  it('should initialize with correct footerSectionConfig', () => {
    component.ngOnInit()

    expect(component.footerSectionConfig).toEqual([
      { id: 1, order: 1, sectionHeading: 'Hubs', active: true, slug: 'hub' },
      { id: 2, order: 2, sectionHeading: 'Related Links', active: true, slug: 'link' },
    ])
  })

  it('should filter portals correctly based on environment', () => {
    component.ngOnInit()
    expect(component.environment.portals.length).toBe(1)
    expect(component.environment.portals[0].id).toBe('1')
  })

  it('should remove "Related Links" if no public portals are available', () => {
    component.environment.portals = []
    component.ngOnInit()
    expect(component.footerSectionConfig).toEqual([
      { id: 1, order: 1, sectionHeading: 'Hubs', active: true, slug: 'hub' },
    ])
  })

  it('should react to headerFooterConfigData changes in ngOnChanges', () => {
    const newConfig = {
      footerSectionConfig: [
        { id: 3, order: 2, sectionHeading: 'Support', active: true, slug: 'support' },
        { id: 1, order: 1, sectionHeading: 'Hubs', active: true, slug: 'hub' },
      ],
    }

    component.ngOnChanges({
      headerFooterConfigData: {
        currentValue: newConfig,
        previousValue: component.headerFooterConfigData,
        firstChange: false,
        isFirstChange: () => false,
      } as any,
    })

    expect(component.footerSectionConfig.map(s => s.order)).toEqual([1, 2])
  })

  it('should call setDiscussionConfig when navigate is invoked', () => {
    component.navigate()
    expect(discussUtilitySvcMock.setDiscussionConfig).toHaveBeenCalledTimes(1)
    const passedConfig = discussUtilitySvcMock.setDiscussionConfig.mock.calls[0][0]
    expect(passedConfig.menuOptions.some((m: any) => m.route === 'all-discussions' && m.enable)).toBe(true)
  })

  it('should navigate to discussion forum when navigate is invoked', () => {
    component.navigate()
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app/discussion-forum'], {
      queryParams: { page: 'home' },
      queryParamsHandling: 'merge',
    })
  })

  it('should return true if the user has the role in isAllowed method', () => {
    const result = component.isAllowed('1')
    expect(result).toBe(true)
  })

  it('should return false if the user does not have the role in isAllowed method', () => {
    configSvcMock.userRoles = new Set(['guest'])
    const result = component.isAllowed('1')
    expect(result).toBe(false)
  })

  it('should allow portal when no roles are configured', () => {
    component.environment.portals = [{ id: '2', name: 'Portal 2', isPublic: false } as any]
    const result = component.isAllowed('2')
    expect(result).toBe(true)
  })

  it('should toggle class "open" when onClick is invoked', () => {
    const event = { target: { parentElement: { classList: { toggle: jest.fn() } } } }
    component.onClick(event)
    expect(event.target.parentElement.classList.toggle).toHaveBeenCalledWith('open')
  })

  it('should return translated label without space when translateLabels is invoked', () => {
    const result = component.translateLabels('label', 'type')
    expect(result).toBe('translated-label')
    expect(langtranslationsMock.translateLabelWithoutspace).toHaveBeenCalledWith('label', 'type', '')
  })

  it('should return translated label with space when translateLabelsWithSpace is invoked', () => {
    const result = component.translateLabelsWithSpace('label', 'type')
    expect(result).toBe('translated-label-with-space')
    expect(langtranslationsMock.translateLabel).toHaveBeenCalledWith('label', 'type', '')
  })
})
