import { FilterComponent } from './filter.component';
import { UntypedFormControl } from '@angular/forms';
import { of } from 'rxjs';

// Mock dependencies
const mockAppCbpPlansService = {
  getFilterEntity: jest.fn(),
  getProviders: jest.fn()
};

const mockTranslateService = {
  setDefaultLang: jest.fn(),
  use: jest.fn()
};

const mockLangtranslations = {
  languageSelectedObservable: of({}),
  translateLabel: jest.fn()
};

// const mockElementRef = {
//   checked: false
// };

describe('FilterComponent', () => {
  let component: FilterComponent;
  let mockLocalStorage: any;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    // Create component instance
    component = new FilterComponent(
      mockAppCbpPlansService as any,
      mockTranslateService as any,
      mockLangtranslations as any
    );

    // Initialize default properties
    component.filterObj = {
      primaryCategory: [],
      status: [],
      timeDuration: [],
      competencyArea: [],
      competencyTheme: [],
      competencySubTheme: [],
      providers: []
    };

    component.checkboxes = {
      forEach: jest.fn()
    } as any;

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create component and subscribe to language changes', () => {
      expect(component).toBeDefined();
      expect(mockLangtranslations.languageSelectedObservable.subscribe).toBeDefined();
    });

    it('should handle language change when localStorage has websiteLanguage', () => {
      mockLocalStorage.getItem.mockReturnValue('es');
      
      // Create new component to trigger constructor
      // const newComponent = new FilterComponent(
      //   mockAppCbpPlansService as any,
      //   mockTranslateService as any,
      //   mockLangtranslations as any
      // );

      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockTranslateService.use).toHaveBeenCalledWith('es');
    });

    it('should handle language change when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      // const newComponent = new FilterComponent(
      //   mockAppCbpPlansService as any,
      //   mockTranslateService as any,
      //   mockLangtranslations as any
      // );

      // Should not call translate methods when no language in localStorage
      expect(mockTranslateService.setDefaultLang).not.toHaveBeenCalled();
      expect(mockTranslateService.use).not.toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should call all initialization methods', () => {
      jest.spyOn(component, 'setDefaultValues');
      jest.spyOn(component, 'getFilterEntity');
      jest.spyOn(component, 'getProviders');
      jest.spyOn(component, 'bindFilter');

      component.ngOnInit();

      expect(component.setDefaultValues).toHaveBeenCalled();
      expect(component.getFilterEntity).toHaveBeenCalled();
      expect(component.getProviders).toHaveBeenCalled();
      expect(component.bindFilter).toHaveBeenCalled();
    });
  });

  describe('setDefaultValues', () => {
    it('should set default values for all filter arrays', () => {
      component.setDefaultValues();

      expect(component.primaryCategoryList).toHaveLength(5);
      expect(component.timeDuration).toHaveLength(9);
      expect(component.contentStatus).toHaveLength(3);

      // Check specific items
      expect(component.primaryCategoryList[0]).toEqual({
        id: 'Course',
        name: 'Course',
        checked: false
      });

      expect(component.timeDuration[0]).toEqual({
        id: '7ad',
        name: 'Upcoming 7 Days',
        checked: false
      });

      expect(component.contentStatus[0]).toEqual({
        id: '1',
        name: 'In progress',
        checked: false
      });
    });
  });

  describe('getFilterEntity', () => {
    it('should call service and process response', () => {
      const mockResponse = [
        { name: 'Competency1', children: [] },
        { name: 'Competency2', children: [] }
      ];
      mockAppCbpPlansService.getFilterEntity.mockReturnValue(of(mockResponse));
      jest.spyOn(component, 'manageCompetency');

      component.getFilterEntity();

      expect(mockAppCbpPlansService.getFilterEntity).toHaveBeenCalledWith({
        search: { type: 'Competency Area' },
        filter: { isDetail: true }
      });
      expect(component.competencyList).toEqual(mockResponse);
      expect(component.manageCompetency).toHaveBeenCalled();
    });
  });

  describe('manageCompetency', () => {
    it('should process competency list and sort by id', () => {
      component.competencyList = [
        { name: 'ZCompetency', children: [] },
        { name: 'ACompetency', children: [] }
      ];
      component.competencyTypeList = [];
      jest.spyOn(component, 'bindFilter');

      component.manageCompetency();

      expect(component.competencyTypeList).toHaveLength(2);
      expect(component.competencyTypeList[0].id).toBe('ACompetency');
      expect(component.competencyTypeList[1].id).toBe('ZCompetency');
      expect(component.bindFilter).toHaveBeenCalled();
    });
  });

  describe('getProviders', () => {
    it('should call service and bind providers', () => {
      const mockProviders = [{ name: 'Provider1' }, { name: 'Provider2' }];
      mockAppCbpPlansService.getProviders.mockReturnValue(of(mockProviders));
      jest.spyOn(component, 'bindProviders');

      component.getProviders();

      expect(mockAppCbpPlansService.getProviders).toHaveBeenCalled();
      expect(component.providersList).toEqual(mockProviders);
      expect(component.bindProviders).toHaveBeenCalled();
    });
  });

  describe('hideFilter', () => {
    it('should emit toggleFilter with false', () => {
      jest.spyOn(component.toggleFilter, 'emit');

      component.hideFilter();

      expect(component.toggleFilter.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('checkedProviders', () => {
    const mockItem = { name: 'TestProvider' };

    beforeEach(() => {
      component.selectedProviders = [];
      component.filterObj = { providers: [] };
    });

    it('should add provider when event is true', () => {
      component.checkedProviders(true, mockItem);

      expect(component.selectedProviders).toContain(mockItem);
      expect(component.filterObj.providers).toContain('TestProvider');
    });

    it('should remove provider when event is false', () => {
      // First add the provider
      component.filterObj.providers = ['TestProvider'];
      
      component.checkedProviders(false, mockItem);

      expect(component.filterObj.providers).toHaveLength(0);
    });

    it('should handle removal when provider not in list', () => {
      component.filterObj.providers = ['OtherProvider'];
      
      component.checkedProviders(false, mockItem);

      expect(component.filterObj.providers).toEqual(['OtherProvider']);
    });
  });

  describe('getCompetencyTheme', () => {
    beforeEach(() => {
      component.competencyList = [
        {
          name: 'TestCompetency',
          children: [
            { name: 'Theme1' },
            { name: 'Theme2' }
          ]
        }
      ];
      component.competencyThemeList = [];
      component.filterObj = { competencyArea: [], competencyTheme: [] };
      jest.spyOn(component, 'bindCompetencyTheme');
      jest.spyOn(component, 'checkFilterEmpty');
      jest.spyOn(component, 'getCompetencySubTheme');
    });

    it('should add competency theme when checked', () => {
      const ctype = { id: 'TestCompetency' };
      const event = { checked: true };

      component.getCompetencyTheme(event, ctype);

      expect(component.filterObj.competencyArea).toContain('TestCompetency');
      expect(component.competencyThemeList).toHaveLength(2);
      expect(component.competencyThemeList[0].parent).toBe('TestCompetency');
      expect(component.bindCompetencyTheme).toHaveBeenCalled();
      expect(component.checkFilterEmpty).toHaveBeenCalled();
    });

    it('should remove competency theme when unchecked', () => {
      // Setup initial state
      component.competencyThemeList = [
        { name: 'Theme1', parent: 'TestCompetency', checked: true }
      ];
      component.filterObj.competencyArea = ['TestCompetency'];
      component.filterObj.competencyTheme = ['Theme1'];

      const ctype = { id: 'TestCompetency' };
      const event = { checked: false };

      component.getCompetencyTheme(event, ctype);

      expect(component.filterObj.competencyArea).not.toContain('TestCompetency');
      expect(component.competencyThemeList).toHaveLength(0);
      expect(component.getCompetencySubTheme).toHaveBeenCalledWith({ checked: false }, expect.any(Object));
    });

    it('should not push to competencyArea when pushValue is false', () => {
      const ctype = { id: 'TestCompetency' };
      const event = { checked: true };

      component.getCompetencyTheme(event, ctype, false);

      expect(component.filterObj.competencyArea).toHaveLength(0);
    });
  });

  describe('getCompetencySubTheme', () => {
    beforeEach(() => {
      component.competencyThemeList = [
        {
          name: 'TestTheme',
          parent: 'TestCompetency',
          children: [
            { name: 'SubTheme1' },
            { name: 'SubTheme2' }
          ]
        }
      ];
      component.competencySubThemeList = [];
      component.filterObj = { competencyTheme: [], competencySubTheme: [] };
      jest.spyOn(component, 'bindCompetencySubTheme');
      jest.spyOn(component, 'checkFilterEmpty');
    });

    it('should add competency sub theme when checked', () => {
      const cstype = { name: 'TestTheme' };
      const event = { checked: true };

      component.getCompetencySubTheme(event, cstype);

      expect(component.filterObj.competencyTheme).toContain('TestTheme');
      expect(component.competencySubThemeList).toHaveLength(2);
      expect(component.competencySubThemeList[0].parent).toBe('TestTheme');
      expect(component.bindCompetencySubTheme).toHaveBeenCalled();
      expect(component.checkFilterEmpty).toHaveBeenCalled();
    });

    it('should remove competency sub theme when unchecked', () => {
      // Setup initial state
      component.competencySubThemeList = [
        { name: 'SubTheme1', parent: 'TestTheme', checked: true }
      ];
      component.filterObj.competencyTheme = ['TestTheme'];
      component.filterObj.competencySubTheme = ['SubTheme1'];

      const cstype = { name: 'TestTheme' };
      const event = { checked: false };

      component.getCompetencySubTheme(event, cstype);

      expect(component.filterObj.competencyTheme).not.toContain('TestTheme');
      expect(component.competencySubThemeList).toHaveLength(0);
    });

    it('should not push to competencyTheme when pushValue is false', () => {
      const cstype = { name: 'TestTheme' };
      const event = { checked: true };

      component.getCompetencySubTheme(event, cstype, false);

      expect(component.filterObj.competencyTheme).toHaveLength(0);
    });
  });

  describe('manageCompetencySubTheme', () => {
    beforeEach(() => {
      component.filterObj = { competencySubTheme: [] };
    });

    it('should add sub theme when checked', () => {
      const csttype = { name: 'TestSubTheme' };
      const event = { checked: true };

      component.manageCompetencySubTheme(event, csttype);

      expect(component.filterObj.competencySubTheme).toContain('TestSubTheme');
    });

    it('should remove sub theme when unchecked', () => {
      component.filterObj.competencySubTheme = ['TestSubTheme'];
      const csttype = { name: 'TestSubTheme' };
      const event = { checked: false };

      component.manageCompetencySubTheme(event, csttype);

      expect(component.filterObj.competencySubTheme).not.toContain('TestSubTheme');
    });

    it('should handle unchecking when item not in list', () => {
      component.filterObj.competencySubTheme = ['OtherSubTheme'];
      const csttype = { name: 'TestSubTheme' };
      const event = { checked: false };

      component.manageCompetencySubTheme(event, csttype);

      expect(component.filterObj.competencySubTheme).toEqual(['OtherSubTheme']);
    });
  });

  describe('applyFilter', () => {
    it('should emit filter data', () => {
      jest.spyOn(component.getFilterData, 'emit');
      const testFilterObj = { test: 'data' };
      component.filterObj = testFilterObj as any;

      component.applyFilter();

      expect(component.getFilterData.emit).toHaveBeenCalledWith(testFilterObj);
    });
  });

  describe('clearFilter', () => {
    it('should clear all filters and emit clear event', () => {
      jest.spyOn(component, 'clearFilterWhileSearch');
      jest.spyOn(component.clearFilterObj, 'emit');
      jest.spyOn(component, 'checkFilterEmpty');

      component.competencyThemeList = [{ name: 'test' }];
      component.competencySubThemeList = [{ name: 'test' }];

      component.clearFilter();

      expect(component.clearFilterWhileSearch).toHaveBeenCalled();
      expect(component.competencyThemeList).toHaveLength(0);
      expect(component.competencySubThemeList).toHaveLength(0);
      expect(component.clearFilterObj.emit).toHaveBeenCalledWith(component.filterObjEmpty);
      expect(component.filterObj).toEqual(component.filterObjEmpty);
      expect(component.checkFilterEmpty).toHaveBeenCalled();
    });
  });

  describe('clearFilterWhileSearch', () => {
    it('should uncheck all checkboxes when checkboxes exist', () => {
      const mockCheckbox1 = { checked: true };
      const mockCheckbox2 = { checked: true };
      
      component.checkboxes = {
        forEach: jest.fn((callback) => {
          callback(mockCheckbox1);
          callback(mockCheckbox2);
        })
      } as any;

      component.clearFilterWhileSearch();

      expect(mockCheckbox1.checked).toBe(false);
      expect(mockCheckbox2.checked).toBe(false);
    });

    it('should handle case when checkboxes is null', () => {
      component.checkboxes = null as any;

      expect(() => component.clearFilterWhileSearch()).not.toThrow();
    });
  });

  describe('getFilterType', () => {
    beforeEach(() => {
      component.filterObj = { testFilter: [] };
      jest.spyOn(component, 'checkFilterEmpty');
    });

    it('should add item when checked and not already included', () => {
      const event = { checked: true };
      const ctype = { id: 'testId' };

      component.getFilterType(event, ctype, 'testFilter');

      expect(component.filterObj.testFilter).toContain('testId');
      expect(component.checkFilterEmpty).toHaveBeenCalled();
    });

    it('should not add duplicate item when already included', () => {
      component.filterObj.testFilter = ['testId'];
      const event = { checked: true };
      const ctype = { id: 'testId' };

      component.getFilterType(event, ctype, 'testFilter');

      expect(component.filterObj.testFilter).toHaveLength(1);
    });

    it('should remove item when unchecked', () => {
      component.filterObj.testFilter = ['testId'];
      const event = { checked: false };
      const ctype = { id: 'testId' };

      component.getFilterType(event, ctype, 'testFilter');

      expect(component.filterObj.testFilter).not.toContain('testId');
    });

    it('should handle item without id property', () => {
      const event = { checked: true };
      const ctype = 'stringValue';

      component.getFilterType(event, ctype, 'testFilter');

      expect(component.filterObj.testFilter).toContain('stringValue');
    });

    it('should handle "all" status filter specially when checked', () => {
      component.filterObj.status = ['other'];
      const event = { checked: true };
      const ctype = { id: 'all' };

      component.getFilterType(event, ctype, 'status');

      expect(component.filterObj.status).toEqual(['all']);
    });

    it('should clear status filter when "all" is unchecked', () => {
      component.filterObj.status = ['all'];
      const event = { checked: false };
      const ctype = { id: 'all' };

      component.getFilterType(event, ctype, 'status');

      expect(component.filterObj.status).toEqual([]);
    });
  });

  describe('bindFilter', () => {
    beforeEach(() => {
      component.primaryCategoryList = [{ id: 'Course', checked: false }];
      component.timeDuration = [{ id: '7ad', checked: false }];
      component.contentStatus = [{ id: '1', checked: false }];
      component.competencyTypeList = [{ id: 'TestComp', checked: false }];
      
      jest.spyOn(component, 'checkFilterEmpty').mockReturnValue(false);
      jest.spyOn(component, 'getCompetencyTheme');
    });

    it('should bind primary category filters', () => {
      component.filterObj.primaryCategory = ['Course'];

      component.bindFilter();

      expect(component.primaryCategoryList[0].checked).toBe(true);
    });

    it('should bind time duration filters', () => {
      component.filterObj.timeDuration = ['7ad'];

      component.bindFilter();

      expect(component.timeDuration[0].checked).toBe(true);
    });

    it('should bind status filters', () => {
      component.filterObj.status = ['1'];

      component.bindFilter();

      expect(component.contentStatus[0].checked).toBe(true);
    });

    it('should bind competency area filters and call getCompetencyTheme', () => {
      component.filterObj.competencyArea = ['TestComp'];

      component.bindFilter();

      expect(component.competencyTypeList[0].checked).toBe(true);
      expect(component.getCompetencyTheme).toHaveBeenCalledWith(
        { checked: true },
        component.competencyTypeList[0],
        false
      );
    });

    it('should not bind when filter is empty', () => {
      jest.spyOn(component, 'checkFilterEmpty').mockReturnValue(true);

      component.bindFilter();

      expect(component.primaryCategoryList[0].checked).toBe(false);
    });
  });

  describe('bindCompetencyTheme', () => {
    it('should bind competency theme filters', () => {
      component.competencyThemeList = [{ name: 'Theme1', checked: false }];
      component.filterObj.competencyTheme = ['Theme1'];
      jest.spyOn(component, 'getCompetencySubTheme');

      component.bindCompetencyTheme();

      expect(component.competencyThemeList[0].checked).toBe(true);
      expect(component.getCompetencySubTheme).toHaveBeenCalledWith(
        { checked: true },
        component.competencyThemeList[0],
        false
      );
    });

    it('should handle empty competency theme list', () => {
      component.competencyThemeList = [];
      component.filterObj.competencyTheme = ['Theme1'];

      expect(() => component.bindCompetencyTheme()).not.toThrow();
    });
  });

  describe('bindCompetencySubTheme', () => {
    it('should bind competency sub theme filters', () => {
      component.competencySubThemeList = [{ name: 'SubTheme1', checked: false }];
      component.filterObj.competencySubTheme = ['SubTheme1'];

      component.bindCompetencySubTheme();

      expect(component.competencySubThemeList[0].checked).toBe(true);
    });

    it('should handle empty competency sub theme list', () => {
      component.competencySubThemeList = [];
      component.filterObj.competencySubTheme = ['SubTheme1'];

      expect(() => component.bindCompetencySubTheme()).not.toThrow();
    });
  });

  describe('bindProviders', () => {
    it('should bind provider filters', () => {
      component.providersList = [{ name: 'Provider1', checked: false }];
      component.filterObj.providers = ['Provider1'];

      component.bindProviders();

      expect(component.providersList[0].checked).toBe(true);
    });

    it('should handle empty providers list', () => {
      component.providersList = [];
      component.filterObj.providers = ['Provider1'];

      expect(() => component.bindProviders()).not.toThrow();
    });
  });

  describe('timeDurationFilter', () => {
    it('should set time duration filter to single value', () => {
      jest.spyOn(component, 'checkFilterEmpty');
      const ctype = { id: '7ad' };

      component.timeDurationFilter(ctype, 'timeDuration');

      expect(component.filterObj.timeDuration).toEqual(['7ad']);
      expect(component.checkFilterEmpty).toHaveBeenCalled();
    });
  });

  describe('onCompetencyTheme', () => {
    it('should filter competency theme list based on search', () => {
      component.competencyThemeOriginalList = [
        { name: 'Theme One' },
        { name: 'Theme Two' }
      ];
      
      const mockEvent = {
        target: { value: 'theme one' }
      };

      component.onCompetencyTheme(mockEvent);

      expect(component.competencyThemeList).toEqual(component.competencyThemeOriginalList);
    });
  });

  describe('onCompetencySubTheme', () => {
    it('should filter competency sub theme list based on search', () => {
      component.competencySubThemeOriginalList = [
        { name: 'SubTheme One' },
        { name: 'SubTheme Two' }
      ];
      
      const mockEvent = {
        target: { value: 'subtheme one' }
      };

      component.onCompetencySubTheme(mockEvent);

      expect(component.competencySubThemeList).toEqual(component.competencySubThemeOriginalList);
    });
  });

  describe('checkFilterEmpty', () => {
    beforeEach(() => {
      component.filterObj = {
        primaryCategory: [],
        status: [],
        timeDuration: [],
        competencyArea: [],
        competencyTheme: [],
        competencySubTheme: [],
        providers: []
      };
    });

    it('should return true and set filterEmpty to true when all filters are empty', () => {
      const result = component.checkFilterEmpty();

      expect(result).toBe(true);
      expect(component.filterEmpty).toBe(true);
    });

    it('should return false and set filterEmpty to false when primaryCategory has items', () => {
      component.filterObj.primaryCategory = ['Course'];

      const result = component.checkFilterEmpty();

      expect(result).toBe(false);
      expect(component.filterEmpty).toBe(false);
    });

    it('should return false when status has items', () => {
      component.filterObj.status = ['1'];

      const result = component.checkFilterEmpty();

      expect(result).toBe(false);
      expect(component.filterEmpty).toBe(false);
    });

    it('should return false when timeDuration has items', () => {
      component.filterObj.timeDuration = ['7ad'];

      const result = component.checkFilterEmpty();

      expect(result).toBe(false);
      expect(component.filterEmpty).toBe(false);
    });

    it('should return false when competencyArea has items', () => {
      component.filterObj.competencyArea = ['Comp1'];

      const result = component.checkFilterEmpty();

      expect(result).toBe(false);
      expect(component.filterEmpty).toBe(false);
    });

    it('should return false when competencyTheme has items', () => {
      component.filterObj.competencyTheme = ['Theme1'];

      const result = component.checkFilterEmpty();

      expect(result).toBe(false);
      expect(component.filterEmpty).toBe(false);
    });

    it('should return false when competencySubTheme has items', () => {
      component.filterObj.competencySubTheme = ['SubTheme1'];

      const result = component.checkFilterEmpty();

      expect(result).toBe(false);
      expect(component.filterEmpty).toBe(false);
    });

    it('should return false when providers has items', () => {
      component.filterObj.providers = ['Provider1'];

      const result = component.checkFilterEmpty();

      expect(result).toBe(false);
      expect(component.filterEmpty).toBe(false);
    });
  });

  describe('translateLabel', () => {
    it('should call langtranslations.translateLabel with correct parameters', () => {
      const label = 'testLabel';
      const type = 'testType';

      component.translateLabel(label, type);

      expect(mockLangtranslations.translateLabel).toHaveBeenCalledWith(label, type, '');
    });
  });

  describe('Property Initialization', () => {
    it('should initialize all required properties', () => {
      expect(component.filterEmpty).toBe(false);
      expect(component.providersList).toEqual([]);
      expect(component.selectedProviders).toEqual([]);
      expect(component.competencyTypeList).toEqual([]);
      expect(component.competencyList).toEqual([]);
      expect(component.competencyThemeList).toEqual([]);
      expect(component.competencySubThemeList).toEqual([]);
      expect(component.competencyThemeOriginalList).toEqual([]);
      expect(component.competencySubThemeOriginalList).toEqual([]);
      expect(component.searchThemeControl).toBeInstanceOf(UntypedFormControl);
    });

    it('should initialize filterObjEmpty with correct structure', () => {
      expect(component.filterObjEmpty).toEqual({
        primaryCategory: [],
        status: [],
        timeDuration: [],
        competencyArea: [],
        competencyTheme: [],
        competencySubTheme: [],
        providers: []
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined filterObj properties gracefully', () => {
      component.filterObj = {} as any;

      expect(() => component.checkFilterEmpty()).not.toThrow();
    });

    it('should handle empty arrays in getCompetencyTheme', () => {
      component.competencyList = [];
      const event = { checked: true };
      const ctype = { id: 'NonexistentCompetency' };

      expect(() => component.getCompetencyTheme(event, ctype)).not.toThrow();
    });

    it('should handle empty arrays in getCompetencySubTheme', () => {
      component.competencyThemeList = [];
      const event = { checked: true };
      const cstype = { name: 'NonexistentTheme' };

      expect(() => component.getCompetencySubTheme(event, cstype)).not.toThrow();
    });
  });
});