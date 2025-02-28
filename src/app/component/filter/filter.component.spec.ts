import { FilterComponent } from './filter.component';
import { AppCbpPlansService } from 'src/app/services/app-cbp-plans.service';
import { of } from 'rxjs'; // Importing 'of' to return an observable
import { TranslateService } from '@ngx-translate/core';
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let appCbpPlansService: jest.Mocked<AppCbpPlansService>;
  let translateService: jest.Mocked<TranslateService>;
  let langTranslationsService: jest.Mocked<MultilingualTranslationsService>;

  beforeEach(() => {
    // Mock the AppCbpPlansService methods to return observables
    appCbpPlansService = {
      getFilterEntity: jest.fn().mockReturnValue(of([])), // mock getFilterEntity to return an observable
      getProviders: jest.fn().mockReturnValue(of([])), // mock getProviders to return an observable
    } as any; // Type assertion because we are mocking

    translateService = {} as any;
    langTranslationsService = {} as any;

    // Create the component instance with mocked services
    component = new FilterComponent(appCbpPlansService, translateService, langTranslationsService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should call getFilterEntity on init', () => {
    const spy = jest.spyOn(appCbpPlansService, 'getFilterEntity');
    component.ngOnInit(); // ngOnInit will call getFilterEntity
    expect(spy).toHaveBeenCalled();
  });

  it('should call getProviders on init', () => {
    const spy = jest.spyOn(appCbpPlansService, 'getProviders');
    component.ngOnInit(); // ngOnInit will call getProviders
    expect(spy).toHaveBeenCalled();
  });

  it('should handle empty result from getFilterEntity', () => {
    const spy = jest.spyOn(appCbpPlansService, 'getFilterEntity').mockReturnValue(of([]));
    component.ngOnInit(); // ngOnInit will call getFilterEntity
    expect(spy).toHaveBeenCalled();
    expect(component.competencyList).toEqual([]); // Ensure the competency list is empty
  });

  it('should handle empty result from getProviders', () => {
    const spy = jest.spyOn(appCbpPlansService, 'getProviders').mockReturnValue(of([]));
    component.ngOnInit(); // ngOnInit will call getProviders
    expect(spy).toHaveBeenCalled();
    expect(component.providersList).toEqual([]); // Ensure providers list is empty
  });
});
