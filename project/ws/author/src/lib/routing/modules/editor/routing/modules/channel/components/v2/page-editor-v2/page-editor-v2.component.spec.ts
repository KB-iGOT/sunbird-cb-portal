import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { EditorContentService } from '../../../../../../services/editor-content.service'
import { ChannelStoreService } from './../../../services/store.service'
import { autoMock } from 'src/testing/auto-mock'

import { PageEditorV2Component } from './page-editor-v2.component'

describe('PageEditorV2Component', () => {
  let component: PageEditorV2Component
  let fixture: ComponentFixture<PageEditorV2Component>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PageEditorV2Component],
      providers: [
        { provide: ChannelStoreService, useValue: autoMock() },
        { provide: EditorContentService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PageEditorV2Component, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PageEditorV2Component)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
