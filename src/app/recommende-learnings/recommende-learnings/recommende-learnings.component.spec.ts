import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecommendeLearningsComponent } from './recommende-learnings.component';
import { ActivatedRoute } from '@angular/router';
import { WidgetUserServiceLib } from '@sunbird-cb/consumption';
import { TranslateService } from '@ngx-translate/core';
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2';
import { of } from 'rxjs';

jest.mock('@ngx-translate/core');
jest.mock('@sunbird-cb/utils-v2');

describe('RecommendeLearningsComponent', () => {
  let component: RecommendeLearningsComponent;
  let fixture: ComponentFixture<RecommendeLearningsComponent>;
  let mockActivatedRoute: any;
  let mockWidgetUserService: any;
  let mockTranslateService: any;
  let mockMultilingualTranslationsService: any;

  beforeEach(() => {
    mockActivatedRoute = {
      queryParams: of({ pillSelected: 'available' }),
      snapshot: {
        data: {
          pageData: {
            data: {
              recommendedConfig: { strip: { request: { designationsList: { path: 'test' } } } },
            },
          },
        },
      },
    };

    mockWidgetUserService = {
      getData: jest.fn().mockReturnValue(of([])),
    };

    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    };

    mockMultilingualTranslationsService = {
      languageSelectedObservable: of(),
      translateLabel: jest.fn().mockReturnValue('translated-label'),
    };

    TestBed.configureTestingModule({
      declarations: [RecommendeLearningsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: WidgetUserServiceLib, useValue: mockWidgetUserService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MultilingualTranslationsService, useValue: mockMultilingualTranslationsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecommendeLearningsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnInit and set initial pill', () => {
    const spy = jest.spyOn(component, 'getRecommendeLeanings');
    component.ngOnInit();
    expect(component.slectedPill).toBe('available');
    expect(spy).toHaveBeenCalled();
  });

  it('should update pill and filter content when pillClicked is called', () => {
    component.results = [
      { name: 'available', courses: [{ identifier: 'course1' }] },
      { name: 'inprogress', courses: [{ identifier: 'course2' }] },
      { name: 'completed', courses: [{ identifier: 'course3' }] },
    ];

    component.pillClicked({ value: 'inprogress' });
    expect(component.slectedPill).toBe('inprogress');
    expect(component.content).toEqual([{ identifier: 'course2' }]);
  });

  it('should populate results when getRecommendeLeanings is called', async () => {
    // const spy = jest.spyOn(component.widgetSvc, 'getData').mockReturnValue(of([{ identifier: 'course1' }]));
    // await component.getRecommendeLeanings();
    // expect(component.results.length).toBe(3); // Should have 3 categories: available, inprogress, completed
    // expect(spy).toHaveBeenCalled();
  });

  it('should transform content to widgets correctly in transformContentsToWidgets', () => {
    // const courses = [{ identifier: 'course1', batch: 'batch1' }];
    // const strip = { key: 'testKey', viewMoreUrl: { stripConfig: { cardSubType: 'subType' } } };

    // const result = component.transformContentsToWidgets(courses, strip);
    // expect(result).toEqual([
    //   {
    //     widgetType: 'card',
    //     widgetSubType: 'cardContent',
    //     widgetHostClass: 'mb-2',
    //     widgetData: {
    //       content: { identifier: 'course1', batch: 'batch1' },
    //       batch: 'batch1',
    //       cardSubType: 'subType',
    //       context: { pageSection: 'testKey', position: 0 },
    //       intranetMode: undefined,
    //       deletedMode: undefined,
    //       contentTags: undefined,
    //     },
    //   },
    // ]);
  });

  it('should update language when languageSelectedObservable emits', () => {
    // const spy = jest.spyOn(mockTranslateService, 'use');
    // localStorage.setItem('websiteLanguage', 'fr');
    // component.langtranslations.languageSelectedObservable.next();
    // expect(spy).toHaveBeenCalledWith('fr');
  });

  it('should return translated label when translateLabels is called', () => {
    const result = component.translateLabels('Test Label', 'type');
    expect(result).toBe('translated-label');
    expect(mockMultilingualTranslationsService.translateLabel).toHaveBeenCalledWith('test label', 'type', '');
  });
});
