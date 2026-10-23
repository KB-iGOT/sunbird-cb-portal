import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { HttpClient } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'
import { WidgetContentService, ViewerUtilService } from '@sunbird-cb/toc'
import { ValueService, EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ClassDiagramComponent } from './class-diagram.component'

describe('ClassDiagramComponent', () => {
  let component: ClassDiagramComponent
  let fixture: ComponentFixture<ClassDiagramComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ClassDiagramComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: HttpClient, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: ViewerUtilService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ClassDiagramComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassDiagramComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
