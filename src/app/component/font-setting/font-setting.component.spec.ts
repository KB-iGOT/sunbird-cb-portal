import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { BtnSettingsService } from '@sunbird-cb/collection'
import { autoMock } from 'src/testing/auto-mock'

import { FontSettingComponent } from './font-setting.component'

describe('FontSettingComponent', () => {
  let component: FontSettingComponent
  let fixture: ComponentFixture<FontSettingComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FontSettingComponent],
      providers: [
        { provide: BtnSettingsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(FontSettingComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FontSettingComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
