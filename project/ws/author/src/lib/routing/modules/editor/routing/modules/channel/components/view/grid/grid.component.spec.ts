import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ChannelResolverService } from './../../../services/resolver.service'
import { ChannelStoreService } from './../../../services/store.service'
import { autoMock } from 'src/testing/auto-mock'

import { GridComponent } from './grid.component'

describe('GridComponent', () => {
  let component: GridComponent
  let fixture: ComponentFixture<GridComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GridComponent],
      providers: [
        { provide: ChannelStoreService, useValue: autoMock() },
        { provide: ChannelResolverService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(GridComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GridComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
