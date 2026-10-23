import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ContentPickerV2Service } from './content-picker-v2.service'
import { ValueService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ContentPickerV2Component } from './content-picker-v2.component'

describe('ContentPickerV2Component', () => {
  let component: ContentPickerV2Component
  let fixture: ComponentFixture<ContentPickerV2Component>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentPickerV2Component],
      providers: [
        { provide: ValueService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: ContentPickerV2Service, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ContentPickerV2Component, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentPickerV2Component)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
