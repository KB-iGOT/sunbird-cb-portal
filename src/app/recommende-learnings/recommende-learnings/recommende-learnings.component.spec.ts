import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { WidgetUserServiceLib } from '@sunbird-cb/consumption'
import { MultilingualTranslationsService, WidgetEnrollService } from '@sunbird-cb/utils-v2'
import { SeeAllService } from '@ws/app'
import { autoMock } from 'src/testing/auto-mock'

import { RecommendeLearningsComponent } from './recommende-learnings.component'

// the @ws/app barrel transitively pulls in learn-search.component, which does not compile
// against the installed @sunbird-cb/utils-v2, so only the token used here is provided
jest.mock('@ws/app', () => ({ SeeAllService: class SeeAllService { } }))

describe('RecommendeLearningsComponent', () => {
  let component: RecommendeLearningsComponent
  let fixture: ComponentFixture<RecommendeLearningsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RecommendeLearningsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: WidgetUserServiceLib, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: SeeAllService, useValue: autoMock() },
        { provide: WidgetEnrollService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(RecommendeLearningsComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RecommendeLearningsComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
