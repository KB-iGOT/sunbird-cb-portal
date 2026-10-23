import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AccessControlService } from '../../../../../../../../modules/shared/services/access-control.service'
import { LoaderService } from '../../../../../../../../services/loader.service'
import { EditorService } from '../../../../../services/editor.service'
import { autoMock } from 'src/testing/auto-mock'

import { TemplateComponent } from './template.component'

describe('TemplateComponent', () => {
  let component: TemplateComponent
  let fixture: ComponentFixture<TemplateComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TemplateComponent],
      providers: [
        { provide: EditorService, useValue: autoMock() },
        { provide: LoaderService, useValue: autoMock() },
        { provide: AccessControlService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(TemplateComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
