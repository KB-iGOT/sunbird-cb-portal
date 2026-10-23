import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { LearningHubHomeComponent } from './home.component'

describe('LearningHubHomeComponent', () => {
  let component: LearningHubHomeComponent
  let fixture: ComponentFixture<LearningHubHomeComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LearningHubHomeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(LearningHubHomeComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningHubHomeComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
