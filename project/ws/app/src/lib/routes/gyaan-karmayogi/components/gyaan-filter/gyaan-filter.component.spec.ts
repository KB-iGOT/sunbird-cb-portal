import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet'
import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { autoMock } from 'src/testing/auto-mock'

import { GyaanFilterComponent } from './gyaan-filter.component'

describe('GyaanFilterComponent', () => {
  let component: GyaanFilterComponent
  let fixture: ComponentFixture<GyaanFilterComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GyaanFilterComponent],
      providers: [
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: MatBottomSheetRef, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(GyaanFilterComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GyaanFilterComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
