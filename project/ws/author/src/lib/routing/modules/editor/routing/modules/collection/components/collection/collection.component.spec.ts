import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AccessControlService } from '../../../../../../../../modules/shared/services/access-control.service'
import { AuthInitService } from '../../../../../../../../services/init.service'
import { LoaderService } from '../../../../../../../../services/loader.service'
import { NotificationService } from '../../../../../../../../services/notification.service'
import { EditorContentService } from '../../../../../services/editor-content.service'
import { EditorService } from '../../../../../services/editor.service'
import { CollectionResolverService } from './../../services/resolver.service'
import { CollectionStoreService } from './../../services/store.service'
import { BreakpointObserver } from '@angular/cdk/layout'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'

import { CollectionComponent } from './collection.component'

describe('CollectionComponent', () => {
  let component: CollectionComponent
  let fixture: ComponentFixture<CollectionComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CollectionComponent],
      providers: [
        { provide: EditorContentService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: CollectionStoreService, useValue: autoMock() },
        { provide: CollectionResolverService, useValue: autoMock() },
        { provide: AuthInitService, useValue: autoMock() },
        { provide: LoaderService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: EditorService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: NotificationService, useValue: autoMock() },
        { provide: AccessControlService, useValue: autoMock() },
        { provide: BreakpointObserver, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    // the store and resolver are also provided at component level, so replace them there too
    .overrideProvider(CollectionStoreService, { useValue: autoMock() })
    .overrideProvider(CollectionResolverService, { useValue: autoMock() })
    .overrideTemplate(CollectionComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
