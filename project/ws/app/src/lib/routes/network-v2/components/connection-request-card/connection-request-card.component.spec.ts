import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { NetworkV2Service } from '../../services/network-v2.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router, ActivatedRoute } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'

import { ConnectionRequestCardComponent } from './connection-request-card.component'

describe('ConnectionRequestCardComponent', () => {
  let component: ConnectionRequestCardComponent
  let fixture: ComponentFixture<ConnectionRequestCardComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ConnectionRequestCardComponent],
      providers: [
        { provide: Router, useValue: autoMock() },
        { provide: NetworkV2Service, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ConnectionRequestCardComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionRequestCardComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
