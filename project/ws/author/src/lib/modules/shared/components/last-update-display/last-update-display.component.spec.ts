import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AccessControlService } from '../../services/access-control.service'
import { autoMock } from 'src/testing/auto-mock'

import { LastUpdateDisplayComponent } from './last-update-display.component'

describe('LastUpdateDisplayComponent', () => {
  let component: LastUpdateDisplayComponent
  let fixture: ComponentFixture<LastUpdateDisplayComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LastUpdateDisplayComponent],
      providers: [
        { provide: AccessControlService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(LastUpdateDisplayComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LastUpdateDisplayComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
