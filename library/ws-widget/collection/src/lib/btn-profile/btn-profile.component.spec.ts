import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AccessControlService } from '../_services/access-control.service'
import { MatDialog } from '@angular/material/dialog'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { LibNotificationsService } from '@sunbird-cb/notification'
import { ConfigurationsService, EventService, DomainConfService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { BtnProfileComponent } from './btn-profile.component'

describe('BtnProfileComponent', () => {
  let component: BtnProfileComponent
  let fixture: ComponentFixture<BtnProfileComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BtnProfileComponent],
      providers: [
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: AccessControlService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: LibNotificationsService, useValue: autoMock() },
        { provide: DomainConfService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(BtnProfileComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnProfileComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
