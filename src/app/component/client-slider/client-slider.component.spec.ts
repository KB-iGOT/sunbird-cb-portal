import { ClientSliderComponent } from './client-slider.component';
import { TranslateService } from '@ngx-translate/core';

jest.mock('@ngx-translate/core', () => {
  return {
    TranslateService: jest.fn().mockImplementation(() => ({
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    })),
  };
});

describe('ClientSliderComponent', () => {
  let component: ClientSliderComponent;
  let translateService: TranslateService;

  beforeEach(() => {
    // Create a mock of TranslateService
    translateService = new TranslateService(null as any,null as any,null as any,null as any,null as any,null as any,null as any,null as any,null as any);

    // Create instance of ClientSliderComponent with mock TranslateService
    component = new ClientSliderComponent(translateService);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize clients with clientList on ngOnInit', () => {
    // Given input client list
    const clientList = [{ name: 'Client 1' }, { name: 'Client 2' }];
    component.clientList = clientList;

    // Call ngOnInit
    component.ngOnInit();

    // Check if clients are initialized correctly
    expect(component.clients).toBe(clientList);
  });

  it('should call translate.setDefaultLang and translate.use on constructor', () => {
    // Mock localStorage item
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'en'),
      },
    });

    // Create new component instance which will trigger constructor logic
    new ClientSliderComponent(translateService);

    // Check if setDefaultLang and use were called
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
  });

  it('should not call translate.setDefaultLang or translate.use if no language is set in localStorage', () => {
    // Mock localStorage item to return null (no language set)
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
      },
    });

    // Create new component instance which will trigger constructor logic
    new ClientSliderComponent(translateService);

    // Check if setDefaultLang and use were NOT called
    expect(translateService.setDefaultLang).not.toHaveBeenCalled();
    expect(translateService.use).not.toHaveBeenCalled();
  });
});
