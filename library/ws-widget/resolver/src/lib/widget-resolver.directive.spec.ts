import { ViewContainerRef } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { LoggerService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'
import { WidgetResolverService } from './widget-resolver.service'

import { WidgetResolverDirective } from './widget-resolver.directive'

describe('WidgetResolverDirective', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      WidgetResolverDirective,
      { provide: ViewContainerRef, useValue: autoMock() },
      { provide: WidgetResolverService, useValue: autoMock() },
      { provide: LoggerService, useValue: autoMock() },
    ],
  }))

  it('should create an instance', () => {
    const directive: WidgetResolverDirective = TestBed.inject(WidgetResolverDirective)
    expect(directive).toBeTruthy()
  })
})
