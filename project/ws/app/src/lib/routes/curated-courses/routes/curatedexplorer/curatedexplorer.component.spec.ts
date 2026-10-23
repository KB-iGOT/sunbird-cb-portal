import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { CuratedCollectionService } from '../../services/curated-collection.service'
import { ActivatedRoute, Router } from '@angular/router'
import { ValueService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { CuratedexplorerComponent } from './curatedexplorer.component'

describe('CuratedexplorerComponent', () => {
  let component: CuratedexplorerComponent
  let fixture: ComponentFixture<CuratedexplorerComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CuratedexplorerComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: CuratedCollectionService, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(CuratedexplorerComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CuratedexplorerComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
