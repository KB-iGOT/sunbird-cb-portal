import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { BreadcrumbsOrgService } from './breadcrumbs-org.service'
import { Router } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { BreadcrumbsOrgComponent } from './breadcrumbs-org.component'

describe('BreadcrumbsOrgComponent', () => {
  let component: BreadcrumbsOrgComponent
  let fixture: ComponentFixture<BreadcrumbsOrgComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BreadcrumbsOrgComponent],
      providers: [
        { provide: BreadcrumbsOrgService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(BreadcrumbsOrgComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbsOrgComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
