import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AccessControlService } from '../../../../../../../../modules/shared/services/access-control.service'
import { AuthInitService } from '../../../../../../../../services/init.service'
import { LoaderService } from '../../../../../../../../services/loader.service'
import { NotificationService } from '../../../../../../../../services/notification.service'
import { EditorContentService } from '../../../../../services/editor-content.service'
import { EditorService } from '../../../../../services/editor.service'
import { UploadService } from '../../../../../shared/services/upload.service'
import { QuizResolverService } from '../../services/resolver.service'
import { QuizStoreService } from '../../services/store.service'
import { BreakpointObserver } from '@angular/cdk/layout'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router, ActivatedRoute } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'

import { QuizComponent } from './quiz.component'

describe('QuizComponent', () => {
  let component: QuizComponent
  let fixture: ComponentFixture<QuizComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [QuizComponent],
      providers: [
        { provide: Router, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: BreakpointObserver, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: QuizStoreService, useValue: autoMock() },
        { provide: LoaderService, useValue: autoMock() },
        { provide: EditorContentService, useValue: autoMock() },
        { provide: UploadService, useValue: autoMock() },
        { provide: EditorService, useValue: autoMock() },
        { provide: NotificationService, useValue: autoMock() },
        { provide: AuthInitService, useValue: autoMock() },
        { provide: QuizResolverService, useValue: autoMock() },
        { provide: AccessControlService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    // QuizResolverService is also provided at component level, so replace it there too
    .overrideProvider(QuizResolverService, { useValue: autoMock() })
    .overrideTemplate(QuizComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
