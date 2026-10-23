import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { KnowledgeResourceService } from '../../services/knowledge-resource.service'
import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { KnowledgeSavedComponent } from './knowledge-saved.component'

describe('KnowledgeSavedComponent', () => {
  let component: KnowledgeSavedComponent
  let fixture: ComponentFixture<KnowledgeSavedComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [KnowledgeSavedComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: KnowledgeResourceService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(KnowledgeSavedComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeSavedComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
