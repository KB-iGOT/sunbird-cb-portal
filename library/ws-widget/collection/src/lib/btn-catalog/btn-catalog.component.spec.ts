import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { TreeCatalogService } from '../tree-catalog/tree-catalog.service'
import { autoMock } from 'src/testing/auto-mock'

import { BtnCatalogComponent } from './btn-catalog.component'

describe('BtnCatalogComponent', () => {
  let component: BtnCatalogComponent
  let fixture: ComponentFixture<BtnCatalogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BtnCatalogComponent],
      providers: [
        { provide: TreeCatalogService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(BtnCatalogComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnCatalogComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
