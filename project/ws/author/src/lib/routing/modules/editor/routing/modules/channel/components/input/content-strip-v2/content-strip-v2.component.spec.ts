import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { InterestService } from './../../../../../../../../../../../../app/src/lib/routes/profile/routes/interest/services/interest.service'
import { UntypedFormBuilder } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { autoMock } from 'src/testing/auto-mock'

import { ContentStripV2Component } from './content-strip-v2.component'

describe('ContentStripV2Component', () => {
  let component: ContentStripV2Component
  let fixture: ComponentFixture<ContentStripV2Component>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentStripV2Component],
      providers: [
        { provide: InterestService, useValue: autoMock() },
        { provide: UntypedFormBuilder, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ContentStripV2Component, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentStripV2Component)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
