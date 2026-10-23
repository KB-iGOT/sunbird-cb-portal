import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { LoggerService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { IapComponent } from './iap.component'

describe('IapComponent', () => {
  let component: IapComponent
  let fixture: ComponentFixture<IapComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IapComponent],
      providers: [
        { provide: LoggerService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(IapComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IapComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
