import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialogRef } from '@angular/material/dialog'
import { autoMock } from 'src/testing/auto-mock'

import { PlaylistDeleteDialogComponent } from './playlist-delete-dialog.component'

describe('PlaylistDeleteDialogComponent', () => {
  let component: PlaylistDeleteDialogComponent
  let fixture: ComponentFixture<PlaylistDeleteDialogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlaylistDeleteDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PlaylistDeleteDialogComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistDeleteDialogComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
