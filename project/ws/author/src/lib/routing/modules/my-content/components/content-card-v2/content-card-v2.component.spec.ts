import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AccessControlService } from '../../../../../modules/shared/services/access-control.service'
import { AuthInitService } from '../../../../../services/init.service'
import { MatDialog } from '@angular/material/dialog'
import { ValueService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ContentCardV2Component } from './content-card-v2.component'

describe('ContentCardV2Component', () => {
  let component: ContentCardV2Component
  let fixture: ComponentFixture<ContentCardV2Component>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentCardV2Component],
      providers: [
        { provide: AccessControlService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: AuthInitService, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ContentCardV2Component, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentCardV2Component)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
