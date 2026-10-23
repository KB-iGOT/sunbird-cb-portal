import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { FormExtService } from '../../../routes/services/form-ext.service'
import { AllContentService } from './../service/all-content.service'
import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { CommonMethodsService } from '@sunbird-cb/consumption'
import { MultilingualTranslationsService, UtilityService, EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { MdoChannelsAllContentComponent } from './mdo-channels-all-content.component'

describe('MdoChannelsAllContentComponent', () => {
  let component: MdoChannelsAllContentComponent
  let fixture: ComponentFixture<MdoChannelsAllContentComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MdoChannelsAllContentComponent],
      providers: [
        { provide: CommonMethodsService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: FormExtService, useValue: autoMock() },
        { provide: AllContentService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: UtilityService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(MdoChannelsAllContentComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MdoChannelsAllContentComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
