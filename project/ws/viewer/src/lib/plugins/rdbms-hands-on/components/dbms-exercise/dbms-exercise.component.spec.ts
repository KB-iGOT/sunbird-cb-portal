import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { RdbmsHandsOnService } from '../../rdbms-hands-on.service'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { DbmsExerciseComponent } from './dbms-exercise.component'

describe('DbmsExerciseComponent', () => {
  let component: DbmsExerciseComponent
  let fixture: ComponentFixture<DbmsExerciseComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DbmsExerciseComponent],
      providers: [
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: RdbmsHandsOnService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(DbmsExerciseComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DbmsExerciseComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
