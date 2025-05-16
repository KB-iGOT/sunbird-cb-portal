import { FilterComponent } from './filter.component';
import { of } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let appCbpPlansServiceMock: any;
  let translateServiceMock: any;
  let langTranslationsMock: any;

  beforeEach(() => {
    // Create mocks for services
    appCbpPlansServiceMock = {
      getFilterEntity: jest.fn().mockReturnValue(of([])),
      getProviders: jest.fn().mockReturnValue(of([]))
    };

    translateServiceMock = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn().mockReturnValue('translated-text')
    };

    langTranslationsMock = {
      languageSelectedObservable: new BehaviorSubject<boolean>(false),
      translateLabel: jest.fn().mockReturnValue('translated-label')
    };

    // Initialize component with mocked dependencies
    component = new FilterComponent(
      appCbpPlansServiceMock,
      translateServiceMock,
      langTranslationsMock
    );

    // Initialize required component properties
    component.filterObj = {
      primaryCategory: [],
      status: [],
      timeDuration: [],
      competencyArea: [],
      competencyTheme: [],
      competencySubTheme: [],
      providers: [],
      provider: [] // This is referenced in checkedProviders but not initialized in the component
    };

    component.competencyList = [];
    component.competencyTypeList = [];
    component.competencyThemeList = [];
    component.competencySubThemeList = [];
    component.competencyThemeOriginalList = [];
    component.competencySubThemeOriginalList = [];

    // Spy on emitter methods
    jest.spyOn(component.toggleFilter, 'emit');
    jest.spyOn(component.getFilterData, 'emit');
    jest.spyOn(component.clearFilterObj, 'emit');
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call required initialization methods', () => {
      // Spy on component methods
      jest.spyOn(component, 'setDefaultValues');
      jest.spyOn(component, 'getFilterEntity');
      jest.spyOn(component, 'getProviders');
      jest.spyOn(component, 'bindFilter');

      // Call ngOnInit
      component.ngOnInit();

      // Verify methods were called
      expect(component.setDefaultValues).toHaveBeenCalled();
      expect(component.getFilterEntity).toHaveBeenCalled();
      expect(component.getProviders).toHaveBeenCalled();
      expect(component.bindFilter).toHaveBeenCalled();
    });
  });

  describe('setDefaultValues', () => {
    it('should initialize default filter lists', () => {
      component.setDefaultValues();

      expect(component.primaryCategoryList).toBeDefined();
      expect(component.primaryCategoryList.length).toBeGreaterThan(0);
      expect(component.timeDuration).toBeDefined();
      expect(component.timeDuration.length).toBeGreaterThan(0);
      expect(component.contentStatus).toBeDefined();
      expect(component.contentStatus.length).toBeGreaterThan(0);
    });
  });

  describe('hideFilter', () => {
    it('should emit toggleFilter event with false', () => {
      component.hideFilter();
      expect(component.toggleFilter.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('getFilterEntity', () => {
    it('should call appCbpPlansService.getFilterEntity with correct params', () => {
      component.getFilterEntity();
      
      const expectedFilterObj = {
        search: {
          type: 'Competency Area',
        },
        filter: {
          isDetail: true,
        },
      };
      
      expect(appCbpPlansServiceMock.getFilterEntity).toHaveBeenCalledWith(expectedFilterObj);
    });

    it('should call manageCompetency when response is received', () => {
      jest.spyOn(component, 'manageCompetency');
      
      appCbpPlansServiceMock.getFilterEntity.mockReturnValue(of([
        { name: 'Competency 1', children: [] },
        { name: 'Competency 2', children: [] }
      ]));
      
      component.getFilterEntity();
      
      expect(component.competencyList.length).toBe(2);
      expect(component.manageCompetency).toHaveBeenCalled();
    });
  });

  describe('manageCompetency', () => {
    it('should populate competencyTypeList and order by id', () => {
      component.competencyList = [
        { name: 'Z Competency', children: [] },
        { name: 'A Competency', children: [] }
      ];
      
      component.manageCompetency();
      
      expect(component.competencyTypeList.length).toBe(2);
      expect(component.competencyTypeList[0].id).toBe('A Competency');
      expect(component.competencyTypeList[1].id).toBe('Z Competency');
    });
  });

  describe('getProviders', () => {
    it('should call appCbpPlansService.getProviders', () => {
      component.getProviders();
      expect(appCbpPlansServiceMock.getProviders).toHaveBeenCalled();
    });

    it('should call bindProviders when response is received', () => {
      jest.spyOn(component, 'bindProviders');
      
      appCbpPlansServiceMock.getProviders.mockReturnValue(of([
        { name: 'Provider 1' },
        { name: 'Provider 2' }
      ]));
      
      component.getProviders();
      
      expect(component.providersList.length).toBe(2);
      expect(component.bindProviders).toHaveBeenCalled();
    });
  });

  describe('checkedProviders', () => {
    it('should add provider to selectedProviders and filterObj.providers when checked', () => {
      const provider = { name: 'Test Provider' };
      component.selectedProviders = [];
      
      component.checkedProviders(true, provider);
      
      expect(component.selectedProviders).toContain(provider);
      expect(component.filterObj.providers).toContain(provider.name);
    });

    it('should remove provider from filterObj.providers when unchecked', () => {
      const provider = { name: 'Test Provider' };
      component.filterObj.providers = ['Test Provider'];
      component.filterObj.provider = ['Test Provider']; // This field is referenced but not initialized in the component
      
      component.checkedProviders(false, provider);
      
      expect(component.filterObj.providers).not.toContain(provider.name);
    });
  });

  describe('getCompetencyTheme', () => {
    it('should add competency themes when checked', () => {
      component.competencyList = [
        { 
          name: 'Competency 1', 
          children: [
            { name: 'Theme 1' },
            { name: 'Theme 2' }
          ] 
        }
      ];
      
      const competencyType = { id: 'Competency 1' };
      
      component.getCompetencyTheme({ checked: true }, competencyType);
      
      expect(component.competencyThemeList.length).toBe(2);
      expect(component.filterObj.competencyArea).toContain('Competency 1');
    });

    it('should remove competency themes when unchecked', () => {
      component.competencyThemeList = [
        { parent: 'Competency 1', name: 'Theme 1', checked: true },
        { parent: 'Competency 1', name: 'Theme 2', checked: true },
        { parent: 'Competency 2', name: 'Theme 3', checked: true }
      ];
      
      component.filterObj.competencyTheme = ['Theme 1', 'Theme 2', 'Theme 3'];
      component.filterObj.competencyArea = ['Competency 1', 'Competency 2'];
      
      jest.spyOn(component, 'getCompetencySubTheme');
      jest.spyOn(component, 'bindCompetencyTheme');
      jest.spyOn(component, 'checkFilterEmpty');
      
      component.getCompetencyTheme({ checked: false }, { id: 'Competency 1' });
      
      expect(component.competencyThemeList.length).toBe(1);
      expect(component.competencyThemeList[0].name).toBe('Theme 3');
      expect(component.filterObj.competencyArea).not.toContain('Competency 1');
      expect(component.getCompetencySubTheme).toHaveBeenCalled();
      expect(component.bindCompetencyTheme).toHaveBeenCalled();
      expect(component.checkFilterEmpty).toHaveBeenCalled();
    });
  });

  describe('getCompetencySubTheme', () => {
    it('should add competency sub-themes when checked', () => {
      component.competencyThemeList = [
        { 
          name: 'Theme 1',
          parent: 'Competency 1',
          children: [
            { name: 'SubTheme 1' },
            { name: 'SubTheme 2' }
          ] 
        }
      ];
      
      component.getCompetencySubTheme({ checked: true }, { name: 'Theme 1' });
      
      expect(component.competencySubThemeList.length).toBe(2);
      expect(component.filterObj.competencyTheme).toContain('Theme 1');
    });

    it('should remove competency sub-themes when unchecked', () => {
      component.competencySubThemeList = [
        { parent: 'Theme 1', name: 'SubTheme 1', checked: true },
        { parent: 'Theme 1', name: 'SubTheme 2', checked: true },
        { parent: 'Theme 2', name: 'SubTheme 3', checked: true }
      ];
      
      component.filterObj.competencySubTheme = ['SubTheme 1', 'SubTheme 2', 'SubTheme 3'];
      component.filterObj.competencyTheme = ['Theme 1', 'Theme 2'];
      
      jest.spyOn(component, 'bindCompetencySubTheme');
      jest.spyOn(component, 'checkFilterEmpty');
      
      component.getCompetencySubTheme({ checked: false }, { name: 'Theme 1' });
      
      expect(component.competencySubThemeList.length).toBe(1);
      expect(component.competencySubThemeList[0].name).toBe('SubTheme 3');
      expect(component.filterObj.competencyTheme).not.toContain('Theme 1');
      expect(component.bindCompetencySubTheme).toHaveBeenCalled();
      expect(component.checkFilterEmpty).toHaveBeenCalled();
    });
  });

  describe('manageCompetencySubTheme', () => {
    it('should add sub-theme to filterObj when checked', () => {
      component.filterObj.competencySubTheme = [];
      
      component.manageCompetencySubTheme({ checked: true }, { name: 'SubTheme 1' });
      
      expect(component.filterObj.competencySubTheme).toContain('SubTheme 1');
    });

    it('should remove sub-theme from filterObj when unchecked', () => {
      component.filterObj.competencySubTheme = ['SubTheme 1', 'SubTheme 2'];
      
      component.manageCompetencySubTheme({ checked: false }, { name: 'SubTheme 1' });
      
      expect(component.filterObj.competencySubTheme).not.toContain('SubTheme 1');
      expect(component.filterObj.competencySubTheme).toContain('SubTheme 2');
    });
  });

  describe('applyFilter', () => {
    it('should emit filterObj through getFilterData', () => {
      component.filterObj = {
        primaryCategory: ['Course'],
        status: ['1'],
        timeDuration: ['30ad'],
        competencyArea: ['Area 1'],
        competencyTheme: ['Theme 1'],
        competencySubTheme: ['SubTheme 1'],
        providers: ['Provider 1'],
        provider: []
      };
      
      component.applyFilter();
      
      expect(component.getFilterData.emit).toHaveBeenCalledWith(component.filterObj);
    });
  });

  describe('clearFilter', () => {
    it('should reset filter objects and emit clearFilterObj', () => {
      const filterObjEmpty = JSON.parse(JSON.stringify(component.filterObjEmpty));
      
      jest.spyOn(component, 'clearFilterWhileSearch');
      jest.spyOn(component, 'checkFilterEmpty');
      
      component.clearFilter();
      
      expect(component.clearFilterWhileSearch).toHaveBeenCalled();
      expect(component.competencyThemeList).toEqual([]);
      expect(component.competencySubThemeList).toEqual([]);
      expect(component.clearFilterObj.emit).toHaveBeenCalledWith(filterObjEmpty);
      expect(component.filterObj).toEqual(filterObjEmpty);
      expect(component.checkFilterEmpty).toHaveBeenCalled();
    });
  });

  describe('getFilterType', () => {
    it('should add filter when checked and not already present', () => {
      component.filterObj.primaryCategory = [];
      
      component.getFilterType({ checked: true }, { id: 'Course' }, 'primaryCategory');
      
      expect(component.filterObj.primaryCategory).toContain('Course');
    });

    it('should remove filter when unchecked', () => {
      component.filterObj.primaryCategory = ['Course', 'Program'];
      
      component.getFilterType({ checked: false }, { id: 'Course' }, 'primaryCategory');
      
      expect(component.filterObj.primaryCategory).not.toContain('Course');
      expect(component.filterObj.primaryCategory).toContain('Program');
    });

    it('should handle "all" status filter specially', () => {
      component.filterObj.status = ['1', '2'];
      
      component.getFilterType({ checked: true }, { id: 'all' }, 'status');
      
      expect(component.filterObj.status).toEqual(['all']);
      
      component.getFilterType({ checked: false }, { id: 'all' }, 'status');
      
      expect(component.filterObj.status).toEqual([]);
    });
  });

  describe('checkFilterEmpty', () => {
    it('should return true when all filter arrays are empty', () => {
      component.filterObj = {
        primaryCategory: [],
        status: [],
        timeDuration: [],
        competencyArea: [],
        competencyTheme: [],
        competencySubTheme: [],
        providers: [],
        provider: []
      };
      
      const result = component.checkFilterEmpty();
      
      expect(result).toBe(true);
      expect(component.filterEmpty).toBe(true);
    });

    it('should return false when any filter array has items', () => {
      component.filterObj = {
        primaryCategory: ['Course'],
        status: [],
        timeDuration: [],
        competencyArea: [],
        competencyTheme: [],
        competencySubTheme: [],
        providers: [],
        provider: []
      };
      
      const result = component.checkFilterEmpty();
      
      expect(result).toBe(false);
      expect(component.filterEmpty).toBe(false);
    });
  });

  describe('translateLabel', () => {
    it('should call langtranslations.translateLabel with correct parameters', () => {
      component.translateLabel('Test Label', 'Test Type');
      
      expect(langTranslationsMock.translateLabel).toHaveBeenCalledWith('Test Label', 'Test Type', '');
    });
  });
});