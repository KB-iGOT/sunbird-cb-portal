import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { GyaanKarmayogiService } from '../../services/gyaan-karmayogi.service'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { autoMock } from 'src/testing/auto-mock'

import { GyaanKarmayogiHomeComponent } from './gyaan-karmayogi-home.component'

describe('GyaanKarmayogiHomeComponent', () => {
  let component: GyaanKarmayogiHomeComponent
  let fixture: ComponentFixture<GyaanKarmayogiHomeComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GyaanKarmayogiHomeComponent],
      providers: [
        { provide: TranslateService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: GyaanKarmayogiService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(GyaanKarmayogiHomeComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GyaanKarmayogiHomeComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
