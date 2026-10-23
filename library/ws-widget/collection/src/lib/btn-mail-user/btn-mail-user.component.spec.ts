import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { EventService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { BtnMailUserComponent } from './btn-mail-user.component'

describe('BtnMailUserComponent', () => {
  let component: BtnMailUserComponent
  let fixture: ComponentFixture<BtnMailUserComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BtnMailUserComponent],
      providers: [
        { provide: EventService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(BtnMailUserComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnMailUserComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
