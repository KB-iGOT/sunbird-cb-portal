import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { NetworkV2Service } from '../../services/network-v2.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router, ActivatedRoute } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'

import { ConnectionSearchCardComponent } from './connection-search-card.component'

describe('ConnectionSearchCardComponent', () => {
  let component: ConnectionSearchCardComponent
  let fixture: ComponentFixture<ConnectionSearchCardComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ConnectionSearchCardComponent],
      providers: [
        { provide: NetworkV2Service, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ConnectionSearchCardComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionSearchCardComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
