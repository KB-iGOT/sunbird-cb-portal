import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'
import { HelpCenterService } from '../../help-center.service'

import { HelpCenterComponent } from './help-center.component'

describe('HelpCenterComponent', () => {
  let component: HelpCenterComponent
  let fixture: ComponentFixture<HelpCenterComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HelpCenterComponent],
      providers: [
        { provide: HelpCenterService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(HelpCenterComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpCenterComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
