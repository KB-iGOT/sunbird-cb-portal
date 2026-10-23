import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { TranslateService } from '@ngx-translate/core'
import { EventService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { SlidersDynamicComponent } from './sliders-dynamic.component'

describe('SlidersComponent', () => {
  let component: SlidersDynamicComponent
  let fixture: ComponentFixture<SlidersDynamicComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SlidersDynamicComponent],
      providers: [
        { provide: EventService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(SlidersDynamicComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SlidersDynamicComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
