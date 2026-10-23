import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ProfileService } from '../../../../services/profile.service'
import { UntypedFormBuilder } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { ValueService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { LearningTimeComponent } from './learning-time.component'

describe('LearningTimeComponent', () => {
  let component: LearningTimeComponent
  let fixture: ComponentFixture<LearningTimeComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LearningTimeComponent],
      providers: [
        { provide: Router, useValue: autoMock() },
        { provide: UntypedFormBuilder, useValue: autoMock() },
        { provide: ProfileService, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(LearningTimeComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningTimeComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
