import { FooterSectionComponent } from './footer-section.component';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { DiscussUtilsService } from '@ws/app/src/lib/routes/discuss/services/discuss-utils.service';
import { Router } from '@angular/router';
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2';
import * as _ from 'lodash';

describe('FooterSectionComponent', () => {
  let component: FooterSectionComponent;
  let configSvcMock: jest.Mocked<ConfigurationsService>;
  let discussUtilitySvcMock: jest.Mocked<DiscussUtilsService>;
  let routerMock: jest.Mocked<Router>;
  let langtranslationsMock: jest.Mocked<MultilingualTranslationsService>;

  beforeEach(() => {
    // Mock the dependencies
    configSvcMock = {
      nodebbUserProfile: { username: 'testuser' },
      userRoles: new Set(['admin']),
    } as any;

    discussUtilitySvcMock = {
      setDiscussionConfig: jest.fn(),
    } as any;

    routerMock = {
      navigate: jest.fn(),
    } as any;

    langtranslationsMock = {
      translateLabelWithoutspace: jest.fn().mockReturnValue('translated-label'),
      translateLabel: jest.fn().mockReturnValue('translated-label-with-space'),
    } as any;

    // Instantiate the component
    component = new FooterSectionComponent(
      configSvcMock,
      discussUtilitySvcMock,
      routerMock,
      langtranslationsMock
    );

    // Set up input data
    component.environment = { portals: [{ id: '1', name: 'Portal 1', isPublic: true }] };
    component.hubsList = [];
    component.headerFooterConfigData = {
      footerSectionConfig: [
        { id: 1, order: 1, sectionHeading: 'Hubs', active: true, slug: 'hub' },
        { id: 2, order: 2, sectionHeading: 'Related Links', active: true, slug: 'link' },
      ],
    };
  });

  it('should initialize with correct footerSectionConfig', () => {
    component.ngOnInit();

    expect(component.footerSectionConfig).toEqual([
      { id: 1, order: 1, sectionHeading: 'Hubs', active: true, slug: 'hub' },
      { id: 2, order: 2, sectionHeading: 'Related Links', active: true, slug: 'link' },
    ]);
  });

  it('should filter portals correctly based on environment', () => {
    component.ngOnInit();
    expect(component.environment.portals).toHaveLength(1);
    expect(component.environment.portals[0].id).toBe('1');
  });

  it('should remove "Related Links" if no public portals are available', () => {
    component.environment.portals = [];
    component.ngOnInit();
    expect(component.footerSectionConfig).toEqual([
      { id: 1, order: 1, sectionHeading: 'Hubs', active: true, slug: 'hub' },
    ]);
  });

  it('should call setDiscussionConfig when navigate is invoked', () => {
    component.navigate();
    expect(discussUtilitySvcMock.setDiscussionConfig).toHaveBeenCalledWith(expect.objectContaining({
      menuOptions: expect.arrayContaining([
        expect.objectContaining({ route: 'all-discussions', label: 'All discussions', enable: true }),
      ]),
    }));
  });

  it('should navigate to discussion forum when navigate is invoked', () => {
    component.navigate();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app/discussion-forum'], {
      queryParams: { page: 'home' },
      queryParamsHandling: 'merge',
    });
  });

  it('should return true if the user has the role in isAllowed method', () => {
    const result = component.isAllowed('1');
    expect(result).toBe(true);
  });

  it('should return false if the user does not have the role in isAllowed method', () => {
    configSvcMock.userRoles = new Set(['guest']);
    const result = component.isAllowed('1');
    expect(result).toBe(false);
  });

  it('should toggle class "open" when onClick is invoked', () => {
    const event = { target: { parentElement: { classList: { toggle: jest.fn() } } } };
    component.onClick(event);
    expect(event.target.parentElement.classList.toggle).toHaveBeenCalledWith('open');
  });

  it('should return translated label without space when translateLabels is invoked', () => {
    const result = component.translateLabels('label', 'type');
    expect(result).toBe('translated-label');
    expect(langtranslationsMock.translateLabelWithoutspace).toHaveBeenCalledWith('label', 'type', '');
  });

  it('should return translated label with space when translateLabelsWithSpace is invoked', () => {
    const result = component.translateLabelsWithSpace('label', 'type');
    expect(result).toBe('translated-label-with-space');
    expect(langtranslationsMock.translateLabel).toHaveBeenCalledWith('label', 'type', '');
  });
});
