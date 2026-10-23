import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AnalyticsResolver } from '../../resolvers/learning-analytics-filters.resolver'
import { LearningAnalyticsService } from '../../services/learning-analytics.service'
import { ActivatedRoute } from '@angular/router'
import { GraphGeneralService } from '@sunbird-cb/collection'
import { ValueService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ContentComponent } from './content.component'

describe('ContentComponent', () => {
  let component: ContentComponent
  let fixture: ComponentFixture<ContentComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentComponent],
      providers: [
        { provide: LearningAnalyticsService, useValue: autoMock() },
        { provide: GraphGeneralService, useValue: autoMock() },
        { provide: AnalyticsResolver, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ContentComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
