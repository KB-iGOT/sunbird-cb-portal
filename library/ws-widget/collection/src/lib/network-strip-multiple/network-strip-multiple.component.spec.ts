import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { WidgetContentService } from '@sunbird-cb/toc'
import { LoggerService, UtilityService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'
import { ContentStripNewMultipleService } from './network-strip-multiple.service'

import { NetworkStripMultipleComponent } from './network-strip-multiple.component'

describe('NetworkStripMultipleComponent', () => {
  let component: NetworkStripMultipleComponent
  let fixture: ComponentFixture<NetworkStripMultipleComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NetworkStripMultipleComponent],
      providers: [
        { provide: ContentStripNewMultipleService, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: LoggerService, useValue: autoMock() },
        { provide: UtilityService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(NetworkStripMultipleComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkStripMultipleComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
