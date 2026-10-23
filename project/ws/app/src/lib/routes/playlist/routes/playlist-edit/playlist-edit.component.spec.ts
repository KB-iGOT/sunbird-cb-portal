import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { UntypedFormBuilder } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { BtnPlaylistService } from '@sunbird-cb/collection'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { PlaylistEditComponent } from './playlist-edit.component'

describe('PlaylistEditComponent', () => {
  let component: PlaylistEditComponent
  let fixture: ComponentFixture<PlaylistEditComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlaylistEditComponent],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                playlist: { data: { result: { content: { name: 'My playlist', children: [{ identifier: 'do_1' }] } } } },
                type: 'edit',
              },
            },
          },
        },
        { provide: Router, useValue: autoMock() },
        { provide: BtnPlaylistService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PlaylistEditComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistEditComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(component.editPlaylistForm.value.title).toBe('My playlist')
    expect(component.selectedContentIds.has('do_1')).toBe(true)
  })
})
