import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { GamificationService } from '../../../../services/gamification.service'
import { autoMock } from 'src/testing/auto-mock'

import { ConfigurationsComponent } from './configurations.component'

describe('ConfigurationsComponent', () => {
  let component: ConfigurationsComponent
  let fixture: ComponentFixture<ConfigurationsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigurationsComponent],
      providers: [
        { provide: GamificationService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ConfigurationsComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationsComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
