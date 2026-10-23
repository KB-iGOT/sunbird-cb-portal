import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MobileAppsService } from '../../services/mobile-apps.service'
import { HeaderService } from './header.service'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { ValueService, DomainConfService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { HeaderComponent } from './header.component'

describe('HeaderComponent', () => {
  let component: HeaderComponent
  let fixture: ComponentFixture<HeaderComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        { provide: ValueService, useValue: autoMock() },
        { provide: HeaderService, useValue: autoMock() },
        { provide: MobileAppsService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: DomainConfService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(HeaderComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
