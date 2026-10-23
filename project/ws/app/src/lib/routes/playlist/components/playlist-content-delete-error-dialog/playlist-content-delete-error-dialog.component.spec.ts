import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { PlaylistContentDeleteErrorDialogComponent } from './playlist-content-delete-error-dialog.component'

describe('PlaylistContentDeleteErrorDialogComponent', () => {
  let component: PlaylistContentDeleteErrorDialogComponent
  let fixture: ComponentFixture<PlaylistContentDeleteErrorDialogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlaylistContentDeleteErrorDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PlaylistContentDeleteErrorDialogComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistContentDeleteErrorDialogComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
