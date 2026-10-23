import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { NetworkV2Service } from '../../services/network-v2.service'
import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { ConfigurationsService, EventService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { NetworkMyMdoComponent } from './network-my-mdo.component'

describe('NetworkMyMdoComponent', () => {
  let component: NetworkMyMdoComponent
  let fixture: ComponentFixture<NetworkMyMdoComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NetworkMyMdoComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: NetworkV2Service, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(NetworkMyMdoComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkMyMdoComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
