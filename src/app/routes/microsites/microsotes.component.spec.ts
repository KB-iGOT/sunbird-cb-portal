import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MicrositeService } from './microsites.service'
import { CommonMethodsService } from '@sunbird-cb/consumption'
import { autoMock } from 'src/testing/auto-mock'

import { MicrosotesComponent } from './microsotes.component'

describe('MicrosotesComponent', () => {
  let component: MicrosotesComponent
  let fixture: ComponentFixture<MicrosotesComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MicrosotesComponent],
      providers: [
        { provide: MicrositeService, useValue: autoMock() },
        { provide: CommonMethodsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(MicrosotesComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MicrosotesComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
