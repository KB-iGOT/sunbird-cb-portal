import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { RdbmsHandsOnService } from '../../rdbms-hands-on.service'
import { UntypedFormBuilder } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { autoMock } from 'src/testing/auto-mock'

import { DbmsConceptCreateComponent } from './dbms-concept-create.component'

describe('DbmsConceptCreateComponent', () => {
  let component: DbmsConceptCreateComponent
  let fixture: ComponentFixture<DbmsConceptCreateComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DbmsConceptCreateComponent],
      providers: [
        { provide: UntypedFormBuilder, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: RdbmsHandsOnService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(DbmsConceptCreateComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DbmsConceptCreateComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
