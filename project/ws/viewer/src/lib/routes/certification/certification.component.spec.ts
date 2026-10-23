import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { WidgetContentService } from '@sunbird-cb/toc'
import { autoMock } from 'src/testing/auto-mock'

import { CertificationComponent } from './certification.component'

describe('CertificationComponent', () => {
  let component: CertificationComponent
  let fixture: ComponentFixture<CertificationComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CertificationComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(CertificationComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificationComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
