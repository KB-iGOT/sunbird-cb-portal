import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { FormExtService } from '../../../../routes/services/form-ext.service'
import { BrowseProviderService } from '../../services/browse-provider.service'
import { ActivatedRoute } from '@angular/router'
import { CommonMethodsService } from '@sunbird-cb/consumption'
import { UtilityService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ProviderContentAllComponent } from './provider-content-all.component'

describe('ProviderContentAllComponent', () => {
  let component: ProviderContentAllComponent
  let fixture: ComponentFixture<ProviderContentAllComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderContentAllComponent],
      providers: [
        { provide: CommonMethodsService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: BrowseProviderService, useValue: autoMock() },
        { provide: UtilityService, useValue: autoMock() },
        { provide: FormExtService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ProviderContentAllComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderContentAllComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
