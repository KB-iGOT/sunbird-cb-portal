import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { HttpClient } from '@angular/common/http'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ZohoFormService } from '../../../header/header/zoho-form.service'
import { autoMock } from 'src/testing/auto-mock'

import { SuppotSectionComponent } from './suppot-section.component'

// the @ws/app barrel transitively pulls in learn-search.component, which does not compile
// against the installed @sunbird-cb/utils-v2, so only the tokens used here are provided
jest.mock('@ws/app', () => ({
  DialogBoxComponent: class DialogBoxComponent { },
}))

describe('SuppotSectionComponent', () => {
  let component: SuppotSectionComponent
  let fixture: ComponentFixture<SuppotSectionComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SuppotSectionComponent],
      providers: [
        { provide: ZohoFormService, useValue: autoMock() },
        { provide: HttpClient, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(SuppotSectionComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SuppotSectionComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
