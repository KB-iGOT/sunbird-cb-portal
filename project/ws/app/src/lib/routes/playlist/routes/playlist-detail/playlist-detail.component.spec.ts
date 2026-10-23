import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { UntypedFormBuilder } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { BtnPlaylistService } from '@sunbird-cb/collection'
import { WidgetContentService } from '@sunbird-cb/toc'
import { ConfigurationsService, ValueService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { PlaylistDetailComponent } from './playlist-detail.component'

describe('PlaylistDetailComponent', () => {
  let component: PlaylistDetailComponent
  let fixture: ComponentFixture<PlaylistDetailComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlaylistDetailComponent],
      providers: [
        { provide: UntypedFormBuilder, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: BtnPlaylistService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PlaylistDetailComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistDetailComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
