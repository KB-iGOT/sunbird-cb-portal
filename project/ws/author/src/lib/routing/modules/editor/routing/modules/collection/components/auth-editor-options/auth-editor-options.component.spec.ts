import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AuthInitService } from '../../../../../../../../services/init.service'
import { EditorContentService } from '../../../../../services/editor-content.service'
import { CollectionStoreService } from './../../services/store.service'
import { autoMock } from 'src/testing/auto-mock'

import { AuthEditorOptionsComponent } from './auth-editor-options.component'

describe('AuthEditorOptionsComponent', () => {
  let component: AuthEditorOptionsComponent
  let fixture: ComponentFixture<AuthEditorOptionsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AuthEditorOptionsComponent],
      providers: [
        { provide: AuthInitService, useValue: autoMock() },
        { provide: EditorContentService, useValue: autoMock() },
        { provide: CollectionStoreService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(AuthEditorOptionsComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthEditorOptionsComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
