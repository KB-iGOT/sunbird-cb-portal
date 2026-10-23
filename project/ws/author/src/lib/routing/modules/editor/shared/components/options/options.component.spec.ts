import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AccessControlService } from '../../../../../../modules/shared/services/access-control.service'
import { EditorContentService } from '../../../services/editor-content.service'
import { autoMock } from 'src/testing/auto-mock'

import { OptionsComponent } from './options.component'

describe('OptionsComponent', () => {
  let component: OptionsComponent
  let fixture: ComponentFixture<OptionsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OptionsComponent],
      providers: [
        { provide: AccessControlService, useValue: autoMock() },
        { provide: EditorContentService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(OptionsComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
