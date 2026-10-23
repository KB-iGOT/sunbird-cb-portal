import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { SurveyFormComponent } from './survey-form.component'

describe('SurveyFormComponent', () => {
  let component: SurveyFormComponent
  let fixture: ComponentFixture<SurveyFormComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SurveyFormComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(SurveyFormComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyFormComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
