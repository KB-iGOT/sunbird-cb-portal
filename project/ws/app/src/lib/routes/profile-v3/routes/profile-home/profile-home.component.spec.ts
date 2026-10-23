import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { InitService } from '../../../../routes/services/appInit.service'
import { CompLocalService } from '../../services/comp.service'
import { ProfileV3Service } from '../../services/profile_v3.service'
import { StepService } from '../../services/step.service'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { ValueService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ProfileHomeComponent } from './profile-home.component'

describe('ProfileHomeComponent', () => {
  let component: ProfileHomeComponent
  let fixture: ComponentFixture<ProfileHomeComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileHomeComponent],
      providers: [
        { provide: ValueService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: StepService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: CompLocalService, useValue: autoMock() },
        { provide: ProfileV3Service, useValue: autoMock() },
        { provide: InitService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ProfileHomeComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileHomeComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
