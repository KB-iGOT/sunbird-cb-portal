import { EventsEngagementComponent } from './events-engagement.component';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2';
import { Router } from '@angular/router';

describe('EventsEngagementComponent', () => {
  let component: EventsEngagementComponent;
  let mockBottomSheetRef: jest.Mocked<MatBottomSheetRef<any>>;
  let mockLangTranslations: jest.Mocked<MultilingualTranslationsService>;
  let mockRouter: jest.Mocked<Router>;

  beforeEach(() => {
    // Create mocks for dependencies
    mockBottomSheetRef = {
      dismiss: jest.fn()
    } as any;
    
    mockLangTranslations = {
      translateActualLabel: jest.fn().mockReturnValue('translated-value')
    } as any;
    
    mockRouter = {
      navigate: jest.fn()
    } as any;
  });

  describe('when instantiated with data', () => {
    beforeEach(() => {
      // Create component with data
      component = new EventsEngagementComponent(
        mockBottomSheetRef,
        { 
          engagements: 'mock-engagements',
          engagementDetails: 'mock-details'
        },
        mockLangTranslations,
        mockRouter
      );
    });

    it('should set properties from data', () => {
      expect(component.myEngagements).toBe('mock-engagements');
      expect(component.engagementDetails).toBe('mock-details');
      expect(component.bottomSheet).toBe(true);
    });
  });

  describe('when instantiated without data', () => {
    beforeEach(() => {
      // Create component without data
      component = new EventsEngagementComponent(
        mockBottomSheetRef,
        null,
        mockLangTranslations,
        mockRouter
      );
    });

    it('should not set properties from data', () => {
      expect(component.myEngagements).toBeUndefined();
      expect(component.engagementDetails).toBeUndefined();
      expect(component.bottomSheet).toBe(false);
    });
  });

  describe('translateLabels', () => {
    beforeEach(() => {
      component = new EventsEngagementComponent(
        mockBottomSheetRef,
        null,
        mockLangTranslations,
        mockRouter
      );
    });

    it('should call translateActualLabel with correct params', () => {
      const result = component.translateLabels('test-label', 'test-type');
      expect(mockLangTranslations.translateActualLabel).toHaveBeenCalledWith('test-label', 'test-type', '');
      expect(result).toBe('translated-value');
    });
  });

  describe('getValue', () => {
    beforeEach(() => {
      component = new EventsEngagementComponent(
        mockBottomSheetRef,
        null,
        mockLangTranslations,
        mockRouter
      );
      component.engagementDetails = {
        prop1: 'value1',
        nested: {
          prop2: 'value2'
        }
      };
    });

    it('should return empty string when key is not provided', () => {
      expect(component.getValue('')).toBe('');
    });

    it('should return empty string when engagementDetails is not available', () => {
      component.engagementDetails = null;
      expect(component.getValue('prop1')).toBe('');
    });

    it('should return value for simple property', () => {
      expect(component.getValue('prop1')).toBe('value1');
    });

    it('should return value for nested property', () => {
      expect(component.getValue('nested.prop2')).toBe('value2');
    });

    it('should return empty string for non-existent property', () => {
      expect(component.getValue('unknown')).toBe('');
    });
  });

  describe('closeDiaolg', () => {
    beforeEach(() => {
      component = new EventsEngagementComponent(
        mockBottomSheetRef,
        null,
        mockLangTranslations,
        mockRouter
      );
    });

    it('should call dismiss on bottomSheetRef', () => {
      component.closeDiaolg();
      expect(mockBottomSheetRef.dismiss).toHaveBeenCalled();
    });
  });

  describe('redirectToEvents', () => {
    describe('when bottomSheet is true', () => {
      beforeEach(() => {
        component = new EventsEngagementComponent(
          mockBottomSheetRef,
          null,
          mockLangTranslations,
          mockRouter
        );
        component.bottomSheet = true;
      });

      it('should dismiss bottomSheet and navigate', () => {
        component.redirectToEvents();
        expect(mockBottomSheetRef.dismiss).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(
          ['app/seeAll/new'],
          {
            queryParams: { 
              key: 'continueLearning', 
              tabSelected: 'Events', 
              pillSelected: 'completed' 
            }
          }
        );
      });
    });

    describe('when bottomSheet is false', () => {
      beforeEach(() => {
        component = new EventsEngagementComponent(
          mockBottomSheetRef,
          null,
          mockLangTranslations,
          mockRouter
        );
        component.bottomSheet = false;
      });

      it('should not dismiss bottomSheet but still navigate', () => {
        component.redirectToEvents();
        expect(mockBottomSheetRef.dismiss).not.toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(
          ['app/seeAll/new'],
          {
            queryParams: { 
              key: 'continueLearning', 
              tabSelected: 'Events', 
              pillSelected: 'completed' 
            }
          }
        );
      });
    });
  });
});