import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { RdbmsHandsOnService } from '../../rdbms-hands-on.service'
import { UntypedFormBuilder } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { autoMock } from 'src/testing/auto-mock'

import { DbmsBestPracticeComponent } from './dbms-best-practice.component'

describe('DbmsBestPracticeComponent', () => {
  let component: DbmsBestPracticeComponent
  let fixture: ComponentFixture<DbmsBestPracticeComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DbmsBestPracticeComponent],
      providers: [
        { provide: RdbmsHandsOnService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: UntypedFormBuilder, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(DbmsBestPracticeComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DbmsBestPracticeComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
