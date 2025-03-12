import { PageContainerComponent } from './page-container.component';

describe('PageContainerComponent', () => {
  let component: PageContainerComponent;

  beforeEach(() => {
    // Manually create an instance of the component
    component = new PageContainerComponent();
  });

  it('should create the component', () => {
    // Ensure the component is created correctly
    expect(component).toBeTruthy();
  });

  it('should initialize widgetData correctly on ngOnInit', () => {
    // Call ngOnInit to initialize the component
    component.ngOnInit();

    // Check if widgetData is set correctly
    expect(component.widgetData).toEqual({
      widgets: [
        [
          {
            dimensions: {},
            className: '',
            widget: {
              widgetType: 'card',
              widgetSubType: 'cardHomeNotify',
              widgetData: {},
            },
          },
        ],
        [
          {
            dimensions: {},
            className: 'ws-mat-primary-lite-background-important new-box-hubs',
            widget: {
              widgetType: 'card',
              widgetSubType: 'cardHomeHubs',
              widgetData: {},
            },
          },
        ],
        [
          {
            dimensions: {
              small: 12,
              medium: 2,
            },
            className: '',
            widget: {
              widgetType: 'menus',
              widgetSubType: 'leftMenu',
              widgetData: [
                {
                  name: 'Users',
                  key: 'users',
                  render: true,
                  badges: {
                    enabled: false,
                    uri: '',
                  },
                  enabled: true,
                  routerLink: '/app/home',
                },
                {
                  name: 'Roles and Access',
                  key: 'roles-access',
                  render: true,
                  badges: {
                    enabled: false,
                    uri: '',
                  },
                  enabled: true,
                  routerLink: '/app/home/roles-access',
                },
                {
                  name: 'Approvals',
                  key: 'approvals',
                  render: true,
                  badges: {
                    enabled: false,
                    uri: '',
                  },
                  enabled: true,
                  routerLink: '/app/home/approvals',
                },
                {
                  name: 'Competencies',
                  key: 'competencies',
                  render: true,
                  badges: {
                    enabled: false,
                    uri: '',
                  },
                  enabled: true,
                  routerLink: '/app/notifications',
                },
                {
                  name: 'About',
                  key: 'about',
                  render: true,
                  badges: {
                    enabled: false,
                    uri: '',
                  },
                  enabled: true,
                  routerLink: '/app/notifications',
                },
              ],
            },
          },
          {
            dimensions: {
              small: 12,
              medium: 10,
            },
            className: '',
            widget: {
              widgetType: 'contentStrip',
              widgetSubType: 'contentStripMultipleNew',
              widgetData: {
                strips: [],
              },
            },
          },
        ],
      ],
    });
  });
});
