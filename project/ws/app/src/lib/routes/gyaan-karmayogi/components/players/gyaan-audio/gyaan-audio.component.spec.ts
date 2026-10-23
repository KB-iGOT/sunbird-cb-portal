import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { GyaanAudioComponent } from './gyaan-audio.component'

describe('GyaanAudioComponent', () => {
  let component: GyaanAudioComponent
  let fixture: ComponentFixture<GyaanAudioComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GyaanAudioComponent],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(GyaanAudioComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GyaanAudioComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
