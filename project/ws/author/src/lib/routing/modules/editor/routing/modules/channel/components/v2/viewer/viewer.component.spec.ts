import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ChannelResolverService } from '../../../services/resolver.service'
import { ChannelStoreService } from '../../../services/store.service'
import { autoMock } from 'src/testing/auto-mock'

import { ViewerComponent } from './viewer.component'

describe('ViewerComponent', () => {
  let component: ViewerComponent
  let fixture: ComponentFixture<ViewerComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ViewerComponent],
      providers: [
        { provide: ChannelStoreService, useValue: autoMock() },
        { provide: ChannelResolverService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ViewerComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
