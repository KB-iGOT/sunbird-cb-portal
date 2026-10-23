import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { DynamicAssetsLoaderService } from '../_services/dynamic-assets-loader.service'
import { ViewerUtilService } from '@sunbird-cb/toc'
import { EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { PlayerAmpComponent } from './player-amp.component'

describe('PlayerAmpComponent', () => {
  let component: PlayerAmpComponent
  let fixture: ComponentFixture<PlayerAmpComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerAmpComponent],
      providers: [
        { provide: DynamicAssetsLoaderService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: ViewerUtilService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PlayerAmpComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerAmpComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
