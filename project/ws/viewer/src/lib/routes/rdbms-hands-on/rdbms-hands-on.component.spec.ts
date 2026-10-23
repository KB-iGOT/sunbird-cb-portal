import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { HttpClient } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'
import { WidgetContentService, ViewerUtilService } from '@sunbird-cb/toc'
import { EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { RdbmsHandsOnComponent } from './rdbms-hands-on.component'

describe('RdbmsHandsOnComponent', () => {
  let component: RdbmsHandsOnComponent
  let fixture: ComponentFixture<RdbmsHandsOnComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RdbmsHandsOnComponent],
      providers: [
        { provide: EventService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: HttpClient, useValue: autoMock() },
        { provide: ViewerUtilService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(RdbmsHandsOnComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RdbmsHandsOnComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
