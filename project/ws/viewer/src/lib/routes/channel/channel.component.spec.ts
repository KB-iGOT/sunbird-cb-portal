import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { HttpClient } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'
import { ViewerUtilService } from '@sunbird-cb/toc'
import { autoMock } from 'src/testing/auto-mock'

import { ChannelComponent } from './channel.component'

describe('ChannelComponent', () => {
  let component: ChannelComponent
  let fixture: ComponentFixture<ChannelComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: HttpClient, useValue: autoMock() },
        { provide: ViewerUtilService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ChannelComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
