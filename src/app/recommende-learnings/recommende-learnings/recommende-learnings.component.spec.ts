import { RecommendeLearningsComponent } from './recommende-learnings.component';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MultilingualTranslationsService, WidgetEnrollService } from '@sunbird-cb/utils-v2';
import { SeeAllService } from '@ws/app/src/lib/routes/see-all/services/see-all.service';
import { WidgetUserServiceLib } from '@sunbird-cb/consumption';
import { of } from 'rxjs';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('RecommendeLearningsComponent', () => {
  let component: RecommendeLearningsComponent;
  let mockActivatedRoute: jest.Mocked<ActivatedRoute>;
  let mockWidgetSvc: jest.Mocked<WidgetUserServiceLib>;
  let mockTranslate: jest.Mocked<TranslateService>;
  let mockLangTranslations: jest.Mocked<MultilingualTranslationsService>;
  let mockSeeAllSvc: jest.Mocked<SeeAllService>;
  let mockEnrollSvc: jest.Mocked<WidgetEnrollService>;

  const mockRecommendedConfig = {
    strip: {
      request: {
        designationsList: {
          path: '/api/designations'
        }
      },
      key: 'recommended',
      viewMoreUrl: {
        stripConfig: {
          cardSubType: 'standard'
        }
      },
      stripConfig: {
        intranetMode: false,
        deletedMode: false,
        contentTags: ['tag1', 'tag2']
      }
    }
  };

  const mockCourses = [
    {
      identifier: 'course1',
      name: 'Course 1',
      description: 'Description 1'
    },
    {
      identifier: 'course2',
      name: 'Course 2',
      description: 'Description 2'
    }
  ];

  const mockEnrollData = [
    {
      contentId: 'course1',
      status: 1 // in progress
    },
    {
      contentId: 'course2',
      status: 2 // completed
    }
  ];

  beforeEach(() => {
    // Mock ActivatedRoute
    mockActivatedRoute = {
      queryParams: of({ pillSelected: 'ravailable' }),
      snapshot: {
        data: {
          pageData: {
            data: {
              recommendedConfig: mockRecommendedConfig
            }
          }
        }
      }
    } as any;

    // Mock WidgetUserServiceLib
    mockWidgetSvc = {
      getData: jest.fn()
    } as any;

    // Mock TranslateService
    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    } as any;

    // Mock MultilingualTranslationsService
    mockLangTranslations = {
      languageSelectedObservable: of({}),
      translateLabel: jest.fn()
    } as any;

    // Mock SeeAllService
    mockSeeAllSvc = {
      fetchDesigantionsData: jest.fn(),
      fetchSearchData: jest.fn()
    } as any;

    // Mock WidgetEnrollService
    mockEnrollSvc = {
      fetchEnrollContentData: jest.fn()
    } as any;

    component = new RecommendeLearningsComponent(
      mockActivatedRoute,
      mockWidgetSvc,
      mockTranslate,
      mockLangTranslations,
      mockSeeAllSvc,
      mockEnrollSvc
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
  });

  describe('Constructor', () => {
    it('should create component with initial values', () => {
      expect(component).toBeTruthy();
      expect(component.slectedPill).toBe('');
      expect(component.available).toEqual([]);
      expect(component.inprogress).toEqual([]);
      expect(component.completed).toEqual([]);
      expect(component.results).toEqual([]);
      expect(component.content).toEqual([]);
    });

    it('should subscribe to languageSelectedObservable and set language when localStorage has websiteLanguage', () => {
      localStorageMock.getItem.mockReturnValue('es');
      
      // Create new component to trigger constructor
      // const newComponent = new RecommendeLearningsComponent(
      //   mockActivatedRoute,
      //   mockWidgetSvc,
      //   mockTranslate,
      //   mockLangTranslations,
      //   mockSeeAllSvc,
      //   mockEnrollSvc
      // );

      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockTranslate.use).toHaveBeenCalledWith('es');
    });

    it('should handle languageSelectedObservable when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      // const newComponent = new RecommendeLearningsComponent(
      //   mockActivatedRoute,
      //   mockWidgetSvc,
      //   mockTranslate,
      //   mockLangTranslations,
      //   mockSeeAllSvc,
      //   mockEnrollSvc
      // );

      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockTranslate.use).not.toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should initialize with query params and page data', () => {
      const getRecommendeLeaningsSpy = jest.spyOn(component, 'getRecommendeLeanings').mockImplementation();
      
      component.ngOnInit();

      expect(component.slectedPill).toBe('ravailable');
      expect(component.recommendedConfig).toEqual(mockRecommendedConfig);
      expect(getRecommendeLeaningsSpy).toHaveBeenCalled();
    });

    it('should handle empty query params', () => {
      mockActivatedRoute.queryParams = of({});
      const getRecommendeLeaningsSpy = jest.spyOn(component, 'getRecommendeLeanings').mockImplementation();
      
      component.ngOnInit();

      expect(component.slectedPill).toBe('');
      expect(getRecommendeLeaningsSpy).toHaveBeenCalled();
    });

    it('should handle missing pageData', () => {
      mockActivatedRoute.snapshot.data = {};
      const getRecommendeLeaningsSpy = jest.spyOn(component, 'getRecommendeLeanings').mockImplementation();
      
      component.ngOnInit();

      expect(component.recommendedConfig).toBeUndefined();
      expect(getRecommendeLeaningsSpy).toHaveBeenCalled();
    });
  });

  describe('pillClicked', () => {
    beforeEach(() => {
      component.results = [
        { name: 'ravailable', courses: ['course1', 'course2'] },
        { name: 'rinprogress', courses: ['course3'] },
        { name: 'rcompleted', courses: ['course4', 'course5'] }
      ];
    });

    it('should set selected pill and update content when pill exists', () => {
      const pill = { value: 'ravailable' };
      
      component.pillClicked(pill);

      expect(component.slectedPill).toBe('ravailable');
      expect(component.content).toEqual(['course1', 'course2']);
    });

    it('should set selected pill and empty content when pill does not exist', () => {
      const pill = { value: 'nonexistent' };
      
      component.pillClicked(pill);

      expect(component.slectedPill).toBe('nonexistent');
      expect(component.content).toEqual([]);
    });
  });

  describe('getRecommendeLeanings', () => {
    it('should fetch and process data successfully', async () => {
      const mockDesignationResponse = ['course1', 'course2'];
      const mockSearchResponse = {
        result: {
          content: mockCourses
        }
      };

      mockSeeAllSvc.fetchDesigantionsData.mockReturnValue({
        toPromise: () => Promise.resolve(mockDesignationResponse)
      } as any);

      mockEnrollSvc.fetchEnrollContentData.mockReturnValue({
        toPromise: () => Promise.resolve({
          result: {
            courses: mockEnrollData
          }
        })
      } as any);

      mockSeeAllSvc.fetchSearchData.mockReturnValue(of(mockSearchResponse));

      const getPillDataSpy = jest.spyOn(component, 'getPilldata').mockImplementation();

      await component.getRecommendeLeanings();

      expect(mockSeeAllSvc.fetchDesigantionsData).toHaveBeenCalledWith('/api/designations');
      expect(mockEnrollSvc.fetchEnrollContentData).toHaveBeenCalledWith({
        request: {
          courseId: mockDesignationResponse
        }
      });
      expect(mockSeeAllSvc.fetchSearchData).toHaveBeenCalledWith({
        request: {
          filters: {
            identifier: mockDesignationResponse
          },
          offset: 0,
          query: "",
          sort_by: {
            lastUpdatedOn: "desc"
          }
        }
      });
      expect(getPillDataSpy).toHaveBeenCalledWith(mockCourses, mockEnrollData, mockDesignationResponse);
    });

    it('should handle enrollment data fetch error', async () => {
      const mockDesignationResponse = ['course1', 'course2'];
      const mockSearchResponse = {
        result: {
          content: mockCourses
        }
      };

      mockSeeAllSvc.fetchDesigantionsData.mockReturnValue({
        toPromise: () => Promise.resolve(mockDesignationResponse)
      } as any);

      mockEnrollSvc.fetchEnrollContentData.mockReturnValue({
        toPromise: () => Promise.reject(new Error('Enrollment fetch error'))
      } as any);

      mockSeeAllSvc.fetchSearchData.mockReturnValue(of(mockSearchResponse));

      const getPillDataSpy = jest.spyOn(component, 'getPilldata').mockImplementation();

      await component.getRecommendeLeanings();

      expect(getPillDataSpy).toHaveBeenCalledWith(mockCourses, [], mockDesignationResponse);
    });

    it('should handle empty enrollment response', async () => {
      const mockDesignationResponse = ['course1', 'course2'];
      const mockSearchResponse = {
        result: {
          content: mockCourses
        }
      };

      mockSeeAllSvc.fetchDesigantionsData.mockReturnValue({
        toPromise: () => Promise.resolve(mockDesignationResponse)
      } as any);

      mockEnrollSvc.fetchEnrollContentData.mockReturnValue({
        toPromise: () => Promise.resolve({ result: { courses: [] } })
      } as any);

      mockSeeAllSvc.fetchSearchData.mockReturnValue(of(mockSearchResponse));

      const getPillDataSpy = jest.spyOn(component, 'getPilldata').mockImplementation();

      await component.getRecommendeLeanings();

      expect(getPillDataSpy).toHaveBeenCalledWith(mockCourses, [], mockDesignationResponse);
    });

    it('should handle missing enrollment result', async () => {
      const mockDesignationResponse = ['course1', 'course2'];
      const mockSearchResponse = {
        result: {
          content: mockCourses
        }
      };

      mockSeeAllSvc.fetchDesigantionsData.mockReturnValue({
        toPromise: () => Promise.resolve(mockDesignationResponse)
      } as any);

      mockEnrollSvc.fetchEnrollContentData.mockReturnValue({
        toPromise: () => Promise.resolve({})
      } as any);

      mockSeeAllSvc.fetchSearchData.mockReturnValue(of(mockSearchResponse));

      const getPillDataSpy = jest.spyOn(component, 'getPilldata').mockImplementation();

      await component.getRecommendeLeanings();

      expect(getPillDataSpy).toHaveBeenCalledWith(mockCourses, [], mockDesignationResponse);
    });

    it('should handle empty designation response', async () => {
      mockSeeAllSvc.fetchDesigantionsData.mockReturnValue({
        toPromise: () => Promise.resolve(null)
      } as any);

      const getPillDataSpy = jest.spyOn(component, 'getPilldata').mockImplementation();

      await component.getRecommendeLeanings();

      expect(getPillDataSpy).not.toHaveBeenCalled();
    });
  });

  describe('getPilldata', () => {
    beforeEach(() => {
      component.recommendedConfig = mockRecommendedConfig;
      component.results = [];
    });

    it('should categorize courses correctly with cbpData', () => {
      const mockCbpData = [{ identifier: 'course1' }];
      mockWidgetSvc.getData.mockReturnValue(of(mockCbpData));

      const transformSpy = jest.spyOn(component, 'transformContentsToWidgets' as any)
        .mockReturnValue(['transformed']);

      component.getPilldata(mockCourses, mockEnrollData, ['course1', 'course2', 'course3']);

      expect(component.results).toHaveLength(3);
      expect(component.results[0].name).toBe('ravailable');
      expect(component.results[1].name).toBe('rinprogress');
      expect(component.results[2].name).toBe('rcompleted');
      expect(transformSpy).toHaveBeenCalledTimes(3);
    });

    it('should categorize courses correctly without cbpData', () => {
      mockWidgetSvc.getData.mockReturnValue(of(null));

      const transformSpy = jest.spyOn(component, 'transformContentsToWidgets' as any)
        .mockReturnValue(['transformed']);

      component.getPilldata(mockCourses, mockEnrollData, ['course1', 'course2', 'course3']);

      expect(component.results).toHaveLength(3);
      expect(transformSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle courses with no enrollment data', () => {
      mockWidgetSvc.getData.mockReturnValue(of(null));

      const transformSpy = jest.spyOn(component, 'transformContentsToWidgets' as any)
        .mockReturnValue(['transformed']);

      component.getPilldata(mockCourses, [], ['course1', 'course2']);

      expect(transformSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle missing course in courses array', () => {
      mockWidgetSvc.getData.mockReturnValue(of(null));

      const transformSpy = jest.spyOn(component, 'transformContentsToWidgets' as any)
        .mockReturnValue(['transformed']);

      component.getPilldata(mockCourses, mockEnrollData, ['course1', 'course2', 'nonexistent']);

      expect(transformSpy).toHaveBeenCalledTimes(3);
    });

    it('should update content based on selected pill', () => {
      component.slectedPill = 'ravailable';
      mockWidgetSvc.getData.mockReturnValue(of(null));

      jest.spyOn(component, 'transformContentsToWidgets' as any)
        .mockReturnValue(['transformed-content']);

      component.getPilldata(mockCourses, [], ['course1', 'course2']);

      expect(component.content).toEqual(['transformed-content']);
    });

    it('should handle empty content when selected pill not found', () => {
      component.slectedPill = 'nonexistent';
      mockWidgetSvc.getData.mockReturnValue(of(null));

      jest.spyOn(component, 'transformContentsToWidgets' as any)
        .mockReturnValue(['transformed-content']);

      component.getPilldata(mockCourses, [], ['course1', 'course2']);

      expect(component.content).toEqual([]);
    });
  });

  describe('transformContentsToWidgets', () => {
    beforeEach(() => {
      component.recommendedConfig = mockRecommendedConfig;
    });

    it('should transform contents to widgets correctly', () => {
      const contents = [
        { identifier: 'course1', name: 'Course 1' },
        { identifier: 'course2', name: 'Course 2', batch: { batchId: 'batch1' } }
      ];

      const result = (component as any).transformContentsToWidgets(contents, mockRecommendedConfig.strip);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        widgetType: 'card',
        widgetSubType: 'cardContent',
        widgetHostClass: 'mb-2',
        widgetData: {
          content: contents[0],
          cardSubType: 'standard',
          context: {
            pageSection: 'recommended',
            position: 0
          },
          intranetMode: false,
          deletedMode: false,
          contentTags: ['tag1', 'tag2']
        }
      });
      expect(result[1].widgetData.batch).toEqual({ batchId: 'batch1' });
    });

    it('should handle empty contents array', () => {
      const result = (component as any).transformContentsToWidgets([], mockRecommendedConfig.strip);

      expect(result).toEqual([]);
    });

    it('should handle null contents array', () => {
      const result = (component as any).transformContentsToWidgets(null, mockRecommendedConfig.strip);

      expect(result).toEqual([]);
    });

    it('should handle strip without viewMoreUrl', () => {
      const stripWithoutViewMore = {
        ...mockRecommendedConfig.strip,
        viewMoreUrl: null
      };
      const contents = [{ identifier: 'course1', name: 'Course 1' }];

      const result = (component as any).transformContentsToWidgets(contents, stripWithoutViewMore);

      expect(result[0].widgetData.cardSubType).toBeUndefined();
    });

    it('should handle strip without stripConfig', () => {
      const stripWithoutConfig = {
        ...mockRecommendedConfig.strip,
        stripConfig: null
      };
      const contents = [{ identifier: 'course1', name: 'Course 1' }];

      const result = (component as any).transformContentsToWidgets(contents, stripWithoutConfig);

      expect(result[0].widgetData.intranetMode).toBeFalsy();
      expect(result[0].widgetData.deletedMode).toBeFalsy();
      expect(result[0].widgetData.contentTags).toBeFalsy();
    });
  });

  describe('translateLabels', () => {
    it('should call langtranslations.translateLabel with correct parameters', () => {
      const label = 'Test Label';
      const type = 'button';
      mockLangTranslations.translateLabel.mockReturnValue('Translated Label');

      const result = component.translateLabels(label, type);

      expect(mockLangTranslations.translateLabel).toHaveBeenCalledWith('test label', type, '');
      expect(result).toBe('Translated Label');
    });

    it('should handle empty label', () => {
      mockLangTranslations.translateLabel.mockReturnValue('');

      const result = component.translateLabels('', 'button');

      expect(mockLangTranslations.translateLabel).toHaveBeenCalledWith('', 'button', '');
      expect(result).toBe('');
    });
  });
});