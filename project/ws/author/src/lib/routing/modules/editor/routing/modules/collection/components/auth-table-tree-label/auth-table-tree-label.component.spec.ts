import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { EditorContentService } from '../../../../../services/editor-content.service'
import { autoMock } from 'src/testing/auto-mock'

import { AuthTableTreeLabelComponent } from './auth-table-tree-label.component'

describe('AuthTableTreeLabelComponent', () => {
  let component: AuthTableTreeLabelComponent
  let fixture: ComponentFixture<AuthTableTreeLabelComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AuthTableTreeLabelComponent],
      providers: [
        { provide: EditorContentService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(AuthTableTreeLabelComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthTableTreeLabelComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
