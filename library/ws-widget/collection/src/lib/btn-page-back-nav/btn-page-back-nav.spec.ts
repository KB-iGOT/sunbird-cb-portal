import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { BtnPageBackNavService } from './btn-page-back-nav.service'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'

import { BtnPageBackNavComponent } from './btn-page-back-nav.component'

describe('BtnPageBackNavComponent', () => {
  let component: BtnPageBackNavComponent
  let fixture: ComponentFixture<BtnPageBackNavComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BtnPageBackNavComponent],
      providers: [
        { provide: BtnPageBackNavService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(BtnPageBackNavComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnPageBackNavComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
