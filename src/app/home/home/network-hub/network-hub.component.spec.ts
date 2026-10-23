import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { HomePageService } from '../../../services/home-page.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'
import { ConfigurationsService, EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { NetworkHubComponent } from './network-hub.component'

describe('NetworkHubComponent', () => {
  let component: NetworkHubComponent
  let fixture: ComponentFixture<NetworkHubComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NetworkHubComponent],
      providers: [
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: HomePageService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(NetworkHubComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkHubComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
