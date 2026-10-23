import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { BtnPlaylistService } from '../btn-playlist.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { BtnPlaylistSelectionComponent } from './btn-playlist-selection.component'

describe('BtnPlaylistSelectionComponent', () => {
  let component: BtnPlaylistSelectionComponent
  let fixture: ComponentFixture<BtnPlaylistSelectionComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BtnPlaylistSelectionComponent],
      providers: [
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: BtnPlaylistService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(BtnPlaylistSelectionComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnPlaylistSelectionComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
