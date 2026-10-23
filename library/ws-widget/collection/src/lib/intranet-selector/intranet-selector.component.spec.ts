import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IntranetSelectorService } from './intranet-selector.service'
import { autoMock } from 'src/testing/auto-mock'

import { IntranetSelectorComponent } from './intranet-selector.component'

describe('IntranetSelectorComponent', () => {
  let component: IntranetSelectorComponent
  let fixture: ComponentFixture<IntranetSelectorComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IntranetSelectorComponent],
      providers: [
        { provide: IntranetSelectorService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(IntranetSelectorComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IntranetSelectorComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
