import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { KnowledgeResourceService } from '../../services/knowledge-resource.service'
import { autoMock } from 'src/testing/auto-mock'

import { KnowledgeCardComponent } from './knowledge-card.component'

describe('KnowledgeCardComponent', () => {
  let component: KnowledgeCardComponent
  let fixture: ComponentFixture<KnowledgeCardComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [KnowledgeCardComponent],
      providers: [
        { provide: KnowledgeResourceService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(KnowledgeCardComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeCardComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
