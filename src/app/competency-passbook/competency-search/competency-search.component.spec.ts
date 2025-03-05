import {  fakeAsync, tick } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2';
import { of } from 'rxjs';
import { CompetencySearchComponent } from './competency-search.component';

describe('CompetencySearchComponent', () => {
  let component: CompetencySearchComponent;
  let translateService: jest.Mocked<TranslateService>;
  let languageTranslationService: jest.Mocked<MultilingualTranslationsService>;

  beforeEach(() => {
    // Create mock services using Jest mocking
    translateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    } as unknown as jest.Mocked<TranslateService>;

    languageTranslationService = {
      languageSelectedObservable: of(),
    } as unknown as jest.Mocked<MultilingualTranslationsService>;

    // Create component with mock services
    component = new CompetencySearchComponent(
      translateService,
      languageTranslationService
    );
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Language Initialization', () => {
    beforeEach(() => {
      // Mock localStorage
      jest.spyOn(localStorage, 'getItem').mockReturnValue('en');
    });

    it('should set default language and use website language on language selection', () => {
      // Trigger language selection observable
      languageTranslationService.languageSelectedObservable.subscribe(() => {
        expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
        expect(translateService.use).toHaveBeenCalledWith('en');
      });
    });
  });

  describe('Search Functionality', () => {
    let mockInputElement: HTMLInputElement;

    beforeEach(() => {
      // Create a mock input element
      mockInputElement = document.createElement('input');
      component.searchInput = { nativeElement: mockInputElement } as any;
    });

    it('should emit search value on input', fakeAsync(() => {
      // Spy on searchValue emitter
      jest.spyOn(component.searchValue, 'emit');

      // Simulate input event
      mockInputElement.value = 'test search';
      mockInputElement.dispatchEvent(new Event('keyup'));

      // Wait for debounce
      tick(250);

      expect(component.searchValue.emit).toHaveBeenCalledWith('test search');
      expect(component.clearIcon).toBe(true);
    }));

    it('should handle clear input', () => {
      // Spy on searchValue emitter
      jest.spyOn(component.searchValue, 'emit');

      // Set some initial state
      component.clearIcon = true;
      mockInputElement.value = 'test search';

      // Call handleClear method
      component.handleClear();

      expect(mockInputElement.value).toBe('');
      expect(component.clearIcon).toBe(false);
      expect(component.searchValue.emit).toHaveBeenCalledWith('');
    });

    it('should emit filter event', () => {
      // Spy on enableFilter emitter
      jest.spyOn(component.enableFilter, 'emit');

      // Call handleFilter method
      component.handleFilter();

      expect(component.enableFilter.emit).toHaveBeenCalledWith(true);
    });

    it('should focus on input', () => {
      // Spy on focus method
      jest.spyOn(mockInputElement, 'focus');

      // Call handleFocus method
      component.handleFocus();

      expect(mockInputElement.focus).toHaveBeenCalled();
    });
  });
});