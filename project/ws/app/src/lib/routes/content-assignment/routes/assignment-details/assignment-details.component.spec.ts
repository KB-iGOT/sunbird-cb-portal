import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router, ActivatedRoute } from '@angular/router'
import { ContentAssignService } from '@sunbird-cb/collection'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { AssignmentDetailsComponent } from './assignment-details.component'

describe('AssignmentDetailsComponent', () => {
  let component: AssignmentDetailsComponent
  let fixture: ComponentFixture<AssignmentDetailsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AssignmentDetailsComponent],
      providers: [
        { provide: ContentAssignService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(AssignmentDetailsComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentDetailsComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
