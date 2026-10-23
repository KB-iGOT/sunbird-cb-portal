import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { autoMock } from 'src/testing/auto-mock'

import { PrivacyPolicyComponent } from './privacy-policy.component'

describe('PrivacyPolicyComponent', () => {
  let component: PrivacyPolicyComponent
  let fixture: ComponentFixture<PrivacyPolicyComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PrivacyPolicyComponent],
      providers: [
        { provide: TranslateService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PrivacyPolicyComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyPolicyComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
