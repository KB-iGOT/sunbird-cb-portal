import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { StepService } from '../../services/step.service'
import { TranslateService } from '@ngx-translate/core'
import { EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { SetupLeftMenuComponent } from './left-menu.component'

describe('SetupLeftMenuComponent', () => {
  let component: SetupLeftMenuComponent
  let fixture: ComponentFixture<SetupLeftMenuComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SetupLeftMenuComponent],
      providers: [
        { provide: EventService, useValue: autoMock() },
        { provide: StepService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(SetupLeftMenuComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupLeftMenuComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
