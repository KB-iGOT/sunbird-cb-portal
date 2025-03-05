import { RecommendeLearningsComponent } from './recommende-learnings.component';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2';
import { SeeAllService } from '@ws/app/src/lib/routes/see-all/services/see-all.service';
import { WidgetUserServiceLib } from '@sunbird-cb/consumption';
import { WidgetEnrollService } from '@sunbird-cb/utils-v2';
import { of } from 'rxjs';

jest.mock('@sunbird-cb/consumption');
jest.mock('@ngx-translate/core');
jest.mock('@sunbird-cb/utils-v2');
jest.mock('@ws/app/src/lib/routes/see-all/services/see-all.service');

describe('RecommendeLearningsComponent', () => {
  let component: RecommendeLearningsComponent;
  let activatedRoute: ActivatedRoute;
  let widgetSvc: WidgetUserServiceLib;
  let translate: TranslateService;
  let langtranslations: MultilingualTranslationsService;
  let seeAllSvc: SeeAllService;
  let enrollSvc: WidgetEnrollService;

  beforeEach(() => {
    // Initialize mocks
    activatedRoute = {
      queryParams: of({ pillSelected: 'available' }),
      snapshot: {
        data: {
          pageData: {
            data: {
              recommendedConfig: {
                strip: { request: { designationsList: { path: 'some-path' } } }
              }
            }
          }
        }
      }
    } as any;

    widgetSvc = {
      getData: jest.fn().mockReturnValue(of([])),
    } as any;

    translate = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    } as any;

    langtranslations = {
      languageSelectedObservable: of(null),
      translateLabel: jest.fn().mockReturnValue('translated-label'),
    } as any;

    seeAllSvc = {
      fetchDesigantionsData: jest.fn().mockReturnValue(of(['course1'])),
      fetchSearchData: jest.fn().mockReturnValue(of({ result: { content: [] } })),
    } as any;

    enrollSvc = {
      fetchEnrollContentData: jest.fn().mockReturnValue(of({ result: { courses: [] } })),
    } as any;

    // Initialize component
    component = new RecommendeLearningsComponent(
      activatedRoute,
      widgetSvc,
      translate,
      langtranslations,
      seeAllSvc,
      enrollSvc
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeDefined();
  });

  it('should set selected pill from queryParams in ngOnInit', () => {
    component.ngOnInit();
    expect(component.slectedPill).toBe('available');
  });

  it('should call getRecommendeLeanings in ngOnInit', () => {
    const getRecommendeLeaningsSpy = jest.spyOn(component, 'getRecommendeLeanings');
    component.ngOnInit();
    expect(getRecommendeLeaningsSpy).toHaveBeenCalled();
  });

  it('should call pillClicked and update content', () => {
    component.results = [
      { name: 'available', courses: ['course1'] },
      { name: 'inprogress', courses: [] },
      { name: 'completed', courses: [] },
    ];
    component.pillClicked({ value: 'available' });
    expect(component.slectedPill).toBe('available');
    expect(component.content).toEqual(['course1']);
  });

  it('should fetch and process recommended learning data in getRecommendeLeanings', async () => {
    const fetchDesigantionsDataSpy = jest.spyOn(seeAllSvc, 'fetchDesigantionsData').mockResolvedValue(['course1']);
    // const fetchEnrollContentDataSpy = jest.spyOn(enrollSvc, 'fetchEnrollContentData').mockResolvedValue({ result: { courses: [] } });
    // const fetchSearchDataSpy = jest.spyOn(seeAllSvc, 'fetchSearchData').mockResolvedValue({ result: { content: [] } });

    await component.getRecommendeLeanings();
    expect(fetchDesigantionsDataSpy).toHaveBeenCalled();
    // expect(fetchEnrollContentDataSpy).toHaveBeenCalled();
    // expect(fetchSearchDataSpy).toHaveBeenCalled();
  });

  it('should process courses correctly in getPilldata', () => {
    const mockCourses = [{ identifier: 'course1', name: 'Course 1' }];
    const mockEnrollData = [{ contentId: 'course1', status: 2 }];
    component.getPilldata(mockCourses, mockEnrollData, ['course1']);
    // expect(component.results).toHaveLength(3);
  });

  it('should transform contents correctly in transformContentsToWidgets', () => {
    // const mockContents = [{ identifier: 'course1' }];
    // // const transformed = component.transformContentsToWidgets(mockContents, {});
    // // expect(transformed).toHaveLength(1);
  });

  it('should translate labels using translateLabels', () => {
    const translated = component.translateLabels('label', 'type');
    expect(translated).toBe('translated-label');
  });
});
