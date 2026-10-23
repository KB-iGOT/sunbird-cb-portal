import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ContentStripSingleService } from './content-strip-single.service'
import { WidgetContentService } from '@sunbird-cb/toc'
import { autoMock } from 'src/testing/auto-mock'

import { ContentStripSingleComponent } from './content-strip-single.component'

describe('ContentStripSingleComponent', () => {
  let component: ContentStripSingleComponent
  let fixture: ComponentFixture<ContentStripSingleComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentStripSingleComponent],
      providers: [
        { provide: ContentStripSingleService, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ContentStripSingleComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentStripSingleComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
