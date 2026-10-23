import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { HomePageService } from '../../services/home-page.service'
import { MatDialogRef } from '@angular/material/dialog'
import { TranslateService } from '@ngx-translate/core'
import { autoMock } from 'src/testing/auto-mock'

import { DownloadAppComponent } from './download-app.component'

describe('DownloadAppComponent', () => {
  let component: DownloadAppComponent
  let fixture: ComponentFixture<DownloadAppComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DownloadAppComponent],
      providers: [
        { provide: HomePageService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: MatDialogRef, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(DownloadAppComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadAppComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
