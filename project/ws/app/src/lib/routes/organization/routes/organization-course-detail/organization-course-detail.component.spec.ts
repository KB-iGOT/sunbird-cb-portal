import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'

import { OrganizationCourseDetailComponent } from './organization-course-detail.component'

describe('OrganizationCourseDetailComponent', () => {
  let component: OrganizationCourseDetailComponent
  let fixture: ComponentFixture<OrganizationCourseDetailComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OrganizationCourseDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(OrganizationCourseDetailComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationCourseDetailComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
