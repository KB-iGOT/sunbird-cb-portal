import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AuthInitService } from '../../../../../services/init.service'
import { Router } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'

import { EntityCardComponent } from './entity-card.component'

describe('EntityCardComponent', () => {
  let component: EntityCardComponent
  let fixture: ComponentFixture<EntityCardComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EntityCardComponent],
      providers: [
        { provide: AuthInitService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(EntityCardComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityCardComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
