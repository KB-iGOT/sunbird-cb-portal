import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BtnPlaylistService } from '@sunbird-cb/collection'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { PlaylistShareDialogComponent } from './playlist-share-dialog.component'

describe('PlaylistShareDialogComponent', () => {
  let component: PlaylistShareDialogComponent
  let fixture: ComponentFixture<PlaylistShareDialogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlaylistShareDialogComponent],
      providers: [
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: BtnPlaylistService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: MatDialogRef, useValue: autoMock() },
        { provide: MAT_DIALOG_DATA, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PlaylistShareDialogComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistShareDialogComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
