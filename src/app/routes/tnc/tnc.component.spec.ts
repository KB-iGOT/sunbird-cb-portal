import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { TncAppResolverService } from '../../services/tnc-app-resolver.service'
import { TncPublicResolverService } from '../../services/tnc-public-resolver.service'
import { HttpClient } from '@angular/common/http'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router } from '@angular/router'
import { LoggerService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { TncComponent } from './tnc.component'

describe('TncComponent', () => {
  let component: TncComponent
  let fixture: ComponentFixture<TncComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TncComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: HttpClient, useValue: autoMock() },
        { provide: LoggerService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: TncAppResolverService, useValue: autoMock() },
        { provide: TncPublicResolverService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(TncComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TncComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
