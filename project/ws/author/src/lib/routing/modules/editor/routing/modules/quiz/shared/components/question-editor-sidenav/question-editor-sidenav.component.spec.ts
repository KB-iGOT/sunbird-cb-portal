import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { QuizStoreService } from '../../../services/store.service'
import { BreakpointObserver } from '@angular/cdk/layout'
import { MatDialog } from '@angular/material/dialog'
import { autoMock } from 'src/testing/auto-mock'

import { QuestionEditorSidenavComponent } from './question-editor-sidenav.component'

describe('QuestionEditorSidenavComponent', () => {
  let component: QuestionEditorSidenavComponent
  let fixture: ComponentFixture<QuestionEditorSidenavComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionEditorSidenavComponent],
      providers: [
        { provide: QuizStoreService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: BreakpointObserver, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(QuestionEditorSidenavComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionEditorSidenavComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
