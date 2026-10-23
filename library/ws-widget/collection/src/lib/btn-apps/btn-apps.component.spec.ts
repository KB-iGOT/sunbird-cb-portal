import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { BtnAppsComponent } from './btn-apps.component'

describe('BtnAppsComponent', () => {
  let component: BtnAppsComponent
  let fixture: ComponentFixture<BtnAppsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BtnAppsComponent],
      providers: [
        { provide: MatDialog, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(BtnAppsComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnAppsComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
