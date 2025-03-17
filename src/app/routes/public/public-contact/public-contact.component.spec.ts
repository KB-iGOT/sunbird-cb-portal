import { PublicContactComponent } from './public-contact.component';
import { of, Subject } from 'rxjs';

describe('PublicContactComponent', () => {
  let component: PublicContactComponent;
  let mockConfigSvc: any;
  let mockActivatedRoute: any;
  let mockLangTranslations: any;
  let mockTranslateService: any;
  let languageSelectedSubject: Subject<any>;

  beforeEach(() => {
    // Mock ElementRef for @ViewChild
    const mockElementRef = {
      nativeElement: {
        parentElement: {
          offsetTop: 100
        }
      }
    };

    // Create subject for language selection observable
    languageSelectedSubject = new Subject<any>();

    // Mock services
    mockConfigSvc = {
      pageNavBar: { color: 'primary' },
      instanceConfig: {
        mailIds: {
          contactUs: 'test@example.com'
        }
      }
    };

    mockActivatedRoute = {
      data: of({
        pageData: {
          data: {
            help: [
              {
                title: 'FAQ 1',
                fragment: 'faq1',
                contents: ['content1', 'content2']
              },
              {
                title: 'FAQ 2',
                fragment: 'faq2',
                contents: ['content3', 'content4']
              }
            ]
          }
        }
      }),
      fragment: of('faq1')
    };

    mockLangTranslations = {
      languageSelectedObservable: languageSelectedSubject.asObservable(),
      translateLabelWithoutspace: jest.fn().mockReturnValue('Translated Label')
    };

    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn().mockReturnValue('Translated Content')
    };

    // Create component instance and inject mocks
    component = new PublicContactComponent(
      mockConfigSvc,
      mockActivatedRoute,
      mockLangTranslations,
      mockTranslateService
    );

    // Set the mock element ref manually
    component['menuElement'] = mockElementRef as any;

    // Mock window methods
    // Object.defineProperty(global, 'localStorage', {
    //   value: {
    //     getItem: jest.fn().mockImplementation(key => {
    //       if (key === 'websiteLanguage') {
    //         return 'en';
    //       }
    //       return null;
    //     }),
    //     setItem: jest.fn()
    //   },
    //   writable: true
    // });

    // Spy on document.getElementById
    document.getElementById = jest.fn().mockImplementation(() => {
      return {
        scrollIntoView: jest.fn()
      };
    });

    // Initialize component
    component.ngOnInit();
  });

  afterEach(() => {
    component.ngOnDestroy();
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set contactUsMail from configuration service', () => {
    expect(component.contactUsMail).toBe('test@example.com');
  });

  it('should initialize tabsData with menus from contact page', () => {
    expect(component.tabsData).toBeDefined();
    expect(component.tabsData.menus.length).toBe(2);
    expect(component.tabsData.menus[0].name).toBe('FAQ 1');
    expect(component.tabsData.menus[0].fragment).toBe('faq1');
    expect(component.tabsData.menus[0].isDefaultSelected).toBe(true);
    expect(component.tabsData.menus[1].isDefaultSelected).toBe(false);
  });

  it('should set language when language is selected', () => {
    // Trigger language selection
    languageSelectedSubject.next();
    
    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(mockTranslateService.use).toHaveBeenCalledWith('en');
  });

  it('should handle sticky menu when scrolling', () => {
    // Initial state
    expect(component.sticky).toBe(false);
    
    // Simulate scrolling below the element position
   // global.window.pageYOffset = 120;
    component.handleScroll();
    expect(component.sticky).toBe(true);
    
    // Simulate scrolling above the element position
   // global.window.pageYOffset = 80;
    component.handleScroll();
    expect(component.sticky).toBe(false);
  });

  it('should update currentTab and scroll to element on side nav tab click', () => {
    const scrollSpy = jest.spyOn(document.getElementById('faq2')!, 'scrollIntoView');
    
    component.onSideNavTabClick('faq2');
    
    expect(component.currentTab).toBe('faq2');
    expect(document.getElementById).toHaveBeenCalledWith('faq2');
    expect(scrollSpy).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
      inline: 'start'
    });
  });

  it('should filter help content based on search text', () => {
    // Without search text
    component.searchText = '';
    const allHelp = component.getHelp;
    expect(allHelp.length).toBe(2);
    
    // With search text that matches
    component.searchText = 'content1';
    const filteredHelp = component.getHelp;
    expect(filteredHelp.length).toBe(2);
    expect(filteredHelp[0].contents.length).toBe(1);
    expect(filteredHelp[0].contents[0]).toBe('content1');
  });

  it('should toggle showSideMenu when showMenuButton is called', () => {
    component.showSideMenu = true;
    component.showMenuButton();
    expect(component.showSideMenu).toBe(false);
    
    component.showMenuButton();
    expect(component.showSideMenu).toBe(true);
  });

  it('should call translation service for translateLabels', () => {
    const result = component.translateLabels('Test Label', 'faq');
    expect(mockLangTranslations.translateLabelWithoutspace).toHaveBeenCalledWith('Test Label', 'faq', '');
    expect(result).toBe('Translated Label');
  });

  it('should format translated answer with HTML', () => {
    const result = component.translateAnswer('Test Answer', 'faq');
    expect(mockTranslateService.instant).toHaveBeenCalledWith('faq.TestAnswer');
    expect(result).toBe('<p class=\'mat-body-2\'><ng-container>Translated Content</ng-container></p>');
  });

  it('should call ngAfterViewInit and setup fragment subscription', () => {
    // Reset any previous calls
    jest.clearAllMocks();
    
    // Create a spy on onSideNavTabClick
    const onSideNavTabClickSpy = jest.spyOn(component, 'onSideNavTabClick');
    
    // Call ngAfterViewInit
    component.ngAfterViewInit();
    
    // Verify that elementPosition is set
    expect(component.elementPosition).toBe(100);
    
    // Verify that the fragment subscription calls onSideNavTabClick
    expect(onSideNavTabClickSpy).toHaveBeenCalledWith('faq1');
  });
});
