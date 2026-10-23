import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { UnresolvedComponent } from './unresolved.component'

describe('UnresolvedComponent', () => {
  let component: UnresolvedComponent
  let fixture: ComponentFixture<UnresolvedComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UnresolvedComponent],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(UnresolvedComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UnresolvedComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
