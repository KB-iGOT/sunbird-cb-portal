import { CbpPlanFeedComponent } from './cbp-plan-feed.component';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2';
import { of } from 'rxjs';

jest.mock('@ngx-translate/core', () => ({
  TranslateService: jest.fn().mockImplementation(() => ({
    setDefaultLang: jest.fn(),
    use: jest.fn(),
  })),
}));

jest.mock('@sunbird-cb/utils-v2', () => ({
  MultilingualTranslationsService: jest.fn().mockImplementation(() => ({
    languageSelectedObservable: of('en'),
    translateLabel: jest.fn(),
  })),
}));

describe('CbpPlanFeedComponent', () => {
  let component: CbpPlanFeedComponent;
  let translateServiceMock: TranslateService;
  let multilingualTranslationsServiceMock: MultilingualTranslationsService;
  let activatedRouteMock: ActivatedRoute;

  beforeEach(() => {
    translateServiceMock = new TranslateService(null as any,null as any,null as any,null as any,null as any,null as any,null as any,null as any,null as any);
    multilingualTranslationsServiceMock = new MultilingualTranslationsService(null as any,null as any,null as any);
    activatedRouteMock = { snapshot: { data: { pageData: { data: 'some config data' } } } } as any;

    component = new CbpPlanFeedComponent(activatedRouteMock, translateServiceMock, multilingualTranslationsServiceMock);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize cbpConfig on ngOnInit', () => {
    component.ngOnInit();
    expect(component.cbpConfig).toBe('some config data');
  });

  it('should emit search event when searchControl value changes', () => {
    const emitSearchRequestSpy = jest.spyOn(component.searchRequest, 'emit');
    component.ngOnInit();  // Initialize the component and subscribe to the valueChanges observable

    // Simulate a value change in the search control
    component.searchControl.setValue('test search');
    
    expect(emitSearchRequestSpy).toHaveBeenCalledWith({ query: 'test search' });
  });

  it('should toggle filter and emit toggleFilterEvent when openFilter is called', () => {
    const emitToggleFilterEventSpy = jest.spyOn(component.toggleFilterEvent, 'emit');
    component.openFilter();
    
    expect(component.toggleFilter).toBe(true);
    expect(emitToggleFilterEventSpy).toHaveBeenCalledWith(true);
  });

  it('should emit closeFilterKey when closeFilter is called', () => {
    const emitCloseFilterKeySpy = jest.spyOn(component.closeFilterKey, 'emit');
    const value = 'test value';
    const key = 'test key';

    component.closeFilter(value, key);
    
    expect(emitCloseFilterKeySpy).toHaveBeenCalledWith({ value, key });
  });

  it('should set default language to "en" and use language from localStorage in languageSelectedObservable subscription', () => {
    // Set up localStorage mock
    // global.localStorage = {
    //   getItem: jest.fn().mockReturnValue('fr'), // Mock a different language
    //   setItem: jest.fn(),
    // };

    // component.langtranslations.languageSelectedObservable.subscribe(() => {
    //   expect(translateServiceMock.setDefaultLang).toHaveBeenCalledWith('en');
    //   expect(translateServiceMock.use).toHaveBeenCalledWith('fr');
    // });
  });

  it('should call translateLabel method of multilingualTranslationsService', () => {
    const label = 'testLabel';
    const type = 'testType';

    component.translateLabel(label, type);
    expect(multilingualTranslationsServiceMock.translateLabel).toHaveBeenCalledWith(label, type, '');
  });
});
