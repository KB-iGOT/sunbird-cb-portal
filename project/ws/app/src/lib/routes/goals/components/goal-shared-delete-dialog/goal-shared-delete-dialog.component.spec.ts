import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BtnGoalsService } from '@sunbird-cb/collection'
import { autoMock } from 'src/testing/auto-mock'

import { GoalSharedDeleteDialogComponent } from './goal-shared-delete-dialog.component'

describe('GoalSharedDeleteDialogComponent', () => {
  let component: GoalSharedDeleteDialogComponent
  let fixture: ComponentFixture<GoalSharedDeleteDialogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GoalSharedDeleteDialogComponent],
      providers: [
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: MatDialogRef, useValue: autoMock() },
        { provide: MAT_DIALOG_DATA, useValue: autoMock() },
        { provide: BtnGoalsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(GoalSharedDeleteDialogComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalSharedDeleteDialogComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
