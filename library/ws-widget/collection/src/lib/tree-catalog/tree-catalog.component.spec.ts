import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { TreeCatalogService } from './tree-catalog.service'
import { autoMock } from 'src/testing/auto-mock'

import { TreeCatalogComponent } from './tree-catalog.component'

describe('TreeCatalogComponent', () => {
  let component: TreeCatalogComponent
  let fixture: ComponentFixture<TreeCatalogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TreeCatalogComponent],
      providers: [
        { provide: TreeCatalogService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(TreeCatalogComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeCatalogComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
