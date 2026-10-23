import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { WidgetContentService } from '@sunbird-cb/toc'
import { autoMock } from 'src/testing/auto-mock'

import { ChannelsHomeComponent } from './channels-home.component'

describe('ChannelsHomeComponent', () => {
  let component: ChannelsHomeComponent
  let fixture: ComponentFixture<ChannelsHomeComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelsHomeComponent],
      providers: [
        { provide: WidgetContentService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ChannelsHomeComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelsHomeComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
