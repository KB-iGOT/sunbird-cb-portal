import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { TranslateService } from '@ngx-translate/core'
import { autoMock } from 'src/testing/auto-mock'

import { PresenterCardComponent } from './presenter-card.component'

describe('PresenterCardComponent', () => {
  let component: PresenterCardComponent
  let fixture: ComponentFixture<PresenterCardComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PresenterCardComponent],
      providers: [
        { provide: TranslateService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PresenterCardComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PresenterCardComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
