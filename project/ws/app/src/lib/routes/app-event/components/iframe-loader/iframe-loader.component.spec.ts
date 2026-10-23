import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { EventService } from '../../services/event.service'
import { ActivatedRoute } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'

import { IframeLoaderComponent } from './iframe-loader.component'

describe('IframeLoaderComponent', () => {
  let component: IframeLoaderComponent
  let fixture: ComponentFixture<IframeLoaderComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IframeLoaderComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(IframeLoaderComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeLoaderComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
