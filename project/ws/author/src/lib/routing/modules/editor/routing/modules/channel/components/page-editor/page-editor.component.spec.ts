import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { EditorContentService } from './../../../../../services/editor-content.service'
import { ChannelStoreService } from './../../services/store.service'
import { autoMock } from 'src/testing/auto-mock'

import { PageEditorComponent } from './page-editor.component'

describe('PageEditorComponent', () => {
  let component: PageEditorComponent
  let fixture: ComponentFixture<PageEditorComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PageEditorComponent],
      providers: [
        { provide: ChannelStoreService, useValue: autoMock() },
        { provide: EditorContentService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PageEditorComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PageEditorComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
