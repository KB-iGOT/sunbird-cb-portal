import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute, Router } from '@angular/router'
import { WidgetContentService, ViewerUtilService } from '@sunbird-cb/toc'
import { EventService, LoggerService, ValueService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { PlayerPdfComponent } from './player-pdf.component'

describe('PlayerPdfComponent', () => {
  let component: PlayerPdfComponent
  let fixture: ComponentFixture<PlayerPdfComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerPdfComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: LoggerService, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: ViewerUtilService, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PlayerPdfComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerPdfComponent)
    component = fixture.componentInstance
    // ngOnDestroy reads widgetData, so provide a minimal one for a clean teardown
    // tslint:disable-next-line:no-any
    component.widgetData = { disableTelemetry: true } as any
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should start outside fullscreen', () => {
    expect(component.isInFullScreen).toBe(false)
  })

  describe('fullScreenState', () => {
    it('should set fullscreen mode and re-render the page when entering fullscreen', () => {
      const refreshSpy = jest.spyOn(component, 'refresh')

      component.fullScreenState(true)

      expect(component.isInFullScreen).toBe(true)
      expect(refreshSpy).toHaveBeenCalledTimes(1)
    })

    it('should reset fullscreen mode and re-render the page when exiting fullscreen (e.g. via Esc)', () => {
      const refreshSpy = jest.spyOn(component, 'refresh')
      component.fullScreenState(true)

      component.fullScreenState(false)

      expect(component.isInFullScreen).toBe(false)
      expect(refreshSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('refresh', () => {
    it('should trigger a new render', () => {
      // tslint:disable-next-line:no-any
      const nextSpy = jest.spyOn((component as any).renderSubject, 'next')

      component.refresh()

      expect(nextSpy).toHaveBeenCalledWith({})
    })
  })
})
