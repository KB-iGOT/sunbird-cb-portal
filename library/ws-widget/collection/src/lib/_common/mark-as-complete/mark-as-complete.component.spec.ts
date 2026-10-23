import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { WidgetContentService } from '@sunbird-cb/toc'
import { autoMock } from 'src/testing/auto-mock'

import { MarkAsCompleteComponent } from './mark-as-complete.component'

describe('MarkAsCompleteComponent', () => {
  let component: MarkAsCompleteComponent
  let fixture: ComponentFixture<MarkAsCompleteComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MarkAsCompleteComponent],
      providers: [
        { provide: MatDialog, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(MarkAsCompleteComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkAsCompleteComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
