import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AnalyticsResolver } from '../../resolvers/learning-analytics-filters.resolver'
import { LearningAnalyticsService } from '../../services/learning-analytics.service'
import { UntypedFormBuilder } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { GraphGeneralService } from '@sunbird-cb/collection'
import { ValueService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ClientAnalyticsComponent } from './client-analytics.component'

describe('ClientAnalyticsComponent', () => {
  let component: ClientAnalyticsComponent
  let fixture: ComponentFixture<ClientAnalyticsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ClientAnalyticsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: AnalyticsResolver, useValue: autoMock() },
        { provide: UntypedFormBuilder, useValue: autoMock() },
        { provide: GraphGeneralService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: LearningAnalyticsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ClientAnalyticsComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientAnalyticsComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
