import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ChannelResolverService } from './../../../services/resolver.service'
import { ChannelStoreService } from './../../../services/store.service'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { autoMock } from 'src/testing/auto-mock'

import { RendererV2Component } from './renderer-v2.component'

describe('RendererV2Component', () => {
  let component: RendererV2Component
  let fixture: ComponentFixture<RendererV2Component>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RendererV2Component],
      providers: [
        { provide: ChannelStoreService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: ChannelResolverService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(RendererV2Component, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RendererV2Component)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
