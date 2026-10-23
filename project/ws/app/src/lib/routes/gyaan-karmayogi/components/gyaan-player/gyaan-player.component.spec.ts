import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { TitleCasePipe } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { ViewerDataService } from '@sunbird-cb/toc'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { of } from 'rxjs'
import { autoMock } from 'src/testing/auto-mock'

import { GyaanPlayerComponent } from './gyaan-player.component'

describe('GyaanPlayerComponent', () => {
  let component: GyaanPlayerComponent
  let fixture: ComponentFixture<GyaanPlayerComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GyaanPlayerComponent],
      providers: [
        { provide: ViewerDataService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParams: {} },
            parent: { snapshot: { data: { pageData: { data: { stripConfig: {} } } }, queryParams: {} } },
          },
        },
        { provide: TitleCasePipe, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: Router, useValue: { events: of(), navigate: jest.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(GyaanPlayerComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GyaanPlayerComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
