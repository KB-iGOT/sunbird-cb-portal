import { ComponentFactoryResolver } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { DomSanitizer } from '@angular/platform-browser'
import { autoMock } from 'src/testing/auto-mock'
import { WIDGET_RESOLVER_GLOBAL_CONFIG, WIDGET_RESOLVER_SCOPED_CONFIG } from './widget-resolver.constant'

import { WidgetResolverService } from './widget-resolver.service'

describe('WidgetResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      WidgetResolverService,
      { provide: DomSanitizer, useValue: autoMock() },
      { provide: ComponentFactoryResolver, useValue: autoMock() },
      { provide: WIDGET_RESOLVER_GLOBAL_CONFIG, useValue: autoMock() },
      { provide: WIDGET_RESOLVER_SCOPED_CONFIG, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: WidgetResolverService = TestBed.inject(WidgetResolverService)
    expect(service).toBeTruthy()
  })
})
