import {  Subject, BehaviorSubject } from 'rxjs';
import { FeaturesComponent } from './features.component';
import { UntypedFormControl } from '@angular/forms';
import * as _ from 'lodash';

// Mock lodash
jest.mock('lodash', () => ({
  get: jest.fn((obj, path) => {
    // Simple implementation for nested path access
    if (path.includes('[') && path.includes(']')) {
      const match = path.match(/features\[(\w+)\]\.permission/);
      if (match && obj && obj.features && obj.features[match[1]]) {
        return obj.features[match[1]].permission;
      }
    }
    return undefined;
  }),
  compact: jest.fn((arr) => arr.filter(Boolean)),
}));

describe('FeaturesComponent', () => {
  let component: FeaturesComponent;
  let mockDialog: any;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockConfigurationSvc: any;
  let mockTour: any;
  let mockRespondSvc: any;
  let mockValueSvc: any;
  let mockAccessService: any;

  beforeEach(() => {
    // Mock dependencies
    mockDialog = {
      open: jest.fn(),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    mockActivatedRoute = {
      snapshot: {
        queryParamMap: {
          get: jest.fn().mockReturnValue('test-query'),
        },
      },
    };

    mockConfigurationSvc = {
      pageNavBar: { background: 'primary' },
      tourGuideNotifier: new Subject(),
      restrictedFeatures: new Set(),
      appsConfig: {
        tourGuide: { steps: [] },
        groups: [
          {
            id: 'group1',
            name: 'Test Group 1',
            hasRole: ['user'],
            featureIds: ['feature1', 'feature2'],
          },
          {
            id: 'group2',
            name: 'Test Group 2',
            hasRole: [],
            featureIds: ['feature3'],
          },
        ],
        features: {
          feature1: {
            id: 'feature1',
            name: 'Feature 1',
            description: 'Test feature 1',
            keywords: ['test', 'feature'],
            permission: ['user'],
          },
          feature2: {
            id: 'feature2',
            name: 'Feature 2',
            description: 'Test feature 2',
            keywords: ['another', 'test'],
            permission: [],
          },
          feature3: {
            id: 'feature3',
            name: 'Feature 3',
            description: 'Test feature 3',
            keywords: ['third'],
            permission: ['admin'],
          },
        },
      },
    };

    mockTour = {
      data: null,
      startTour: jest.fn(),
    };

    mockRespondSvc = {
      unsubscribeResponse: jest.fn(),
    };

    mockValueSvc = {
      isXSmall$: new BehaviorSubject(false),
    };

    mockAccessService = {
      hasRole: jest.fn().mockReturnValue(true),
    };

    // Create component instance
    component = new FeaturesComponent(
      mockDialog,
      mockRouter,
      mockActivatedRoute,
      mockConfigurationSvc,
      mockTour,
      mockRespondSvc,
      mockValueSvc,
      mockAccessService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create component with default values', () => {
      expect(component).toBeTruthy();
      expect(component.queryControl).toBeDefined();
      expect(component.queryControl.constructor.name).toBe('UntypedFormControl');
      expect(component.featureGroups).toBeNull();
      expect(component.isTourGuideAvailable).toBe(false);
      expect(component.isXSmall).toBe(false);
    });

    it('should initialize queryControl with query parameter from route', () => {
      expect(component.queryControl.value).toBe('test-query');
    });

    it('should set up tour guide when available in config', () => {
      expect(mockTour.data).toEqual(mockConfigurationSvc.appsConfig.tourGuide);
    });

    it('should filter groups based on role permissions', () => {
      mockAccessService.hasRole.mockImplementation((roles: string[]) => 
        roles.includes('user') || roles.length === 0
      );

      // const newComponent = new FeaturesComponent(
      //   mockDialog,
      //   mockRouter,
      //   mockActivatedRoute,
      //   mockConfigurationSvc,
      //   mockTour,
      //   mockRespondSvc,
      //   mockValueSvc,
      //   mockAccessService
      // );

      expect(mockAccessService.hasRole).toHaveBeenCalledWith(['user']);
      expect(mockAccessService.hasRole).toHaveBeenCalledWith([]);
      expect(_.compact).toHaveBeenCalled();
    });

    it('should handle case when appsConfig is null', () => {
      mockConfigurationSvc.appsConfig = null;

      const newComponent = new FeaturesComponent(
        mockDialog,
        mockRouter,
        mockActivatedRoute,
        mockConfigurationSvc,
        mockTour,
        mockRespondSvc,
        mockValueSvc,
        mockAccessService
      );

      expect(newComponent).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      jest.spyOn(component, 'filteredFeatures').mockReturnValue([]);
    });

    it('should set up query control value changes subscription', () => {
      component.ngOnInit();

      expect(mockRouter.navigate).toHaveBeenCalledWith([], { 
        queryParams: { q: 'test-query' } 
      });
      expect(component.filteredFeatures).toHaveBeenCalledWith('test-query');
    });

    it('should handle null query parameter', () => {
      mockActivatedRoute.snapshot.queryParamMap.get.mockReturnValue(null);
      component.queryControl = new UntypedFormControl(null);

      component.ngOnInit();

      expect(mockRouter.navigate).toHaveBeenCalledWith([], { 
        queryParams: { q: null } 
      });
    });

    it('should subscribe to tour guide notifier', () => {
      component.ngOnInit();

      mockConfigurationSvc.tourGuideNotifier.next(true);

      expect(component.isTourGuideAvailable).toBe(true);
    });

    it('should not enable tour guide if feature is restricted', () => {
      mockConfigurationSvc.restrictedFeatures = new Set(['tourGuide']);

      component.ngOnInit();
      mockConfigurationSvc.tourGuideNotifier.next(true);

      expect(component.isTourGuideAvailable).toBe(false);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from query changes subscription', () => {
      const mockSubscription = { unsubscribe: jest.fn() };
      (component as any).queryChangeSubs = mockSubscription;

      component.ngOnDestroy();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should handle null subscription gracefully', () => {
      (component as any).queryChangeSubs = null;

      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should notify tour guide to hide', () => {
      const spy = jest.spyOn(mockConfigurationSvc.tourGuideNotifier, 'next');

      component.ngOnDestroy();

      expect(spy).toHaveBeenCalledWith(false);
    });
  });

  describe('clear', () => {
    it('should clear query control value', () => {
      component.queryControl.setValue('some-query');

      component.clear();

      expect(component.queryControl.value).toBe('');
    });
  });

  describe('filteredFeatures', () => {
    beforeEach(() => {
      (component as any).featuresConfig = [
        {
          id: 'group1',
          name: 'Group 1',
          featureWidgets: [
            {
              widgetData: {
                actionBtn: {
                  name: 'Feature One',
                  description: 'Description one',
                  keywords: ['keyword1', 'test'],
                },
              },
            },
            {
              widgetData: {
                actionBtn: {
                  name: 'Feature Two',
                  description: 'Description two',
                  keywords: ['keyword2'],
                },
              },
            },
          ],
        },
        {
          id: 'group2',
          name: 'Group 2',
          featureWidgets: [
            {
              widgetData: {
                actionBtn: {
                  name: 'Another Feature',
                  description: 'Another description',
                  keywords: ['different'],
                },
              },
            },
          ],
        },
      ];
    });

    it('should return all features when query is empty', () => {
      const result = (component as any).filteredFeatures('');

      expect(result).toEqual((component as any).featuresConfig);
    });

    it('should return empty array when featuresConfig is null', () => {
      (component as any).featuresConfig = null;

      const result = (component as any).filteredFeatures('test');

      expect(result).toEqual([]);
    });

    it('should filter features by name', () => {
      const result = (component as any).filteredFeatures('Feature One');

      expect(result.length).toBe(1);
      expect(result[0].featureWidgets.length).toBe(1);
      expect(result[0].featureWidgets[0].widgetData.actionBtn.name).toBe('Feature One');
    });

    it('should filter features by keyword', () => {
      const result = (component as any).filteredFeatures('test');

      expect(result.length).toBe(1);
      expect(result[0].featureWidgets.length).toBe(1);
    });

    it('should filter features by description', () => {
      const result = (component as any).filteredFeatures('Description one');

      expect(result.length).toBe(1);
      expect(result[0].featureWidgets.length).toBe(1);
    });

    it('should filter case-insensitively', () => {
      const result = (component as any).filteredFeatures('FEATURE ONE');

      expect(result.length).toBe(1);
      expect(result[0].featureWidgets[0].widgetData.actionBtn.name).toBe('Feature One');
    });

    it('should exclude groups with no matching features', () => {
      const result = (component as any).filteredFeatures('nonexistent');

      expect(result.length).toBe(0);
    });
  });

  describe('queryMatchForFeature', () => {
    const testFeature = {
      name: 'Test Feature',
      description: 'Test Description',
      keywords: ['keyword1', 'keyword2'],
    };

    it('should match by name', () => {
      const result = (component as any).queryMatchForFeature(testFeature, 'test feature');

      expect(result).toBe(true);
    });

    it('should match by description', () => {
      const result = (component as any).queryMatchForFeature(testFeature, 'test description');

      expect(result).toBe(true);
    });

    it('should match by keyword', () => {
      const result = (component as any).queryMatchForFeature(testFeature, 'keyword1');

      expect(result).toBe(true);
    });

    it('should return false for no match', () => {
      const result = (component as any).queryMatchForFeature(testFeature, 'nomatch');

      expect(result).toBe(false);
    });

    it('should return false for undefined feature', () => {
      const result = (component as any).queryMatchForFeature(undefined, 'test');

      expect(result).toBe(false);
    });

    it('should handle feature without description', () => {
      const featureWithoutDesc = {
        name: 'Test Feature',
        keywords: ['keyword1'],
      };

      const result = (component as any).queryMatchForFeature(featureWithoutDesc, 'test');

      expect(result).toBe(true);
    });
  });

  // describe('logout', () => {
  //   it('should open logout dialog', () => {
  //     component.logout();

  //     expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function));
  //   });
  // });

  describe('startTour', () => {
    it('should start tour', () => {
      component.startTour();

      expect(mockTour.startTour).toHaveBeenCalled();
    });

    it('should unsubscribe from response subscription if exists', () => {
      const mockResponseSubscription = { unsubscribe: jest.fn() };
      (component as any).responseSubscription = mockResponseSubscription;

      component.startTour();

      expect(mockRespondSvc.unsubscribeResponse).toHaveBeenCalled();
      expect(mockResponseSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should handle null response subscription', () => {
      (component as any).responseSubscription = null;

      expect(() => component.startTour()).not.toThrow();
      expect(mockTour.startTour).toHaveBeenCalled();
    });
  });

  describe('Value Service Integration', () => {
    it('should update isXSmall when value service emits', () => {
      expect(component.isXSmall).toBe(false);

      mockValueSvc.isXSmall$.next(true);

      expect(component.isXSmall).toBe(true);
    });
  });

  describe('Query Control Debouncing', () => {
    it('should handle rapid query changes with debouncing', (done) => {
      jest.spyOn(component, 'filteredFeatures').mockReturnValue([]);
      
      component.ngOnInit();

      // Simulate rapid changes
      component.queryControl.setValue('a');
      component.queryControl.setValue('ab');
      component.queryControl.setValue('abc');

      // Wait for debounce
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith([], { 
          queryParams: { q: 'abc' } 
        });
        done();
      }, 600);
    });
  });
});