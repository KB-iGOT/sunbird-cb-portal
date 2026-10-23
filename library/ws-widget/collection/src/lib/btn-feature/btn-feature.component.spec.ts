import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { CustomTourService } from '../_common/tour-guide/tour-guide.service'
import { MobileAppsService } from '../_services/mobile-apps.service'
import { BtnFeatureService } from './btn-feature.service'
import { Router } from '@angular/router'
import { EventService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { BtnFeatureComponent } from './btn-feature.component'

describe('BtnFeatureComponent', () => {
  let component: BtnFeatureComponent
  let fixture: ComponentFixture<BtnFeatureComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BtnFeatureComponent],
      providers: [
        { provide: EventService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: BtnFeatureService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: MobileAppsService, useValue: autoMock() },
        { provide: CustomTourService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(BtnFeatureComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnFeatureComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
