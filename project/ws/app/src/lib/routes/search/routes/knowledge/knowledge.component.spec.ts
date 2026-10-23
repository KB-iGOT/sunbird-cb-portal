import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { SearchServService } from '../../services/search-serv.service'
import { ActivatedRoute, Router } from '@angular/router'
import { ValueService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { KnowledgeComponent } from './knowledge.component'

describe('KnowledgeComponent', () => {
  let component: KnowledgeComponent
  let fixture: ComponentFixture<KnowledgeComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [KnowledgeComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
        { provide: SearchServService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(KnowledgeComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
