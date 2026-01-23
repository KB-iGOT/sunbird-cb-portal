import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { NsWidgetResolver, WidgetBaseComponent } from '@sunbird-cb/resolver'
import { EventService, LoggerService, WsEvents, ValueService } from '@sunbird-cb/utils-v2'
import { GlobalWorkerOptions, getDocument, PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf'
import { fromEvent, interval, merge, Subject, Subscription } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { ROOT_WIDGET_CONFIG } from '../collection.config'
import { NsContent } from '../_services/widget-content.model'
import { WidgetContentService } from '../_services/widget-content.service'
import { IWidgetsPlayerPdfData } from './player-pdf.model'
import { ViewerUtilService } from '@ws/viewer/src/lib/viewer-util.service'

let pdfjsViewer: any

// ---------------------------
// IMPORTANT: set worker path
// ---------------------------
GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js'

@Component({
  selector: 'ws-widget-player-pdf',
  templateUrl: './player-pdf.component.html',
  styleUrls: ['./player-pdf.component.scss'],
  standalone: false
})
export class PlayerPdfComponent extends WidgetBaseComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges, NsWidgetResolver.IWidgetData<any> {

  @Input() widgetData!: IWidgetsPlayerPdfData

  @ViewChild('fullScreenContainer', { static: true })
  containerSection!: ElementRef<HTMLElement>

  // NOTE: This must be a DIV, NOT a CANVAS
  @ViewChild('pdfContainer', { static: true })
  pdfContainer!: ElementRef<HTMLDivElement>

  DEFAULT_SCALE = 1.0
  MAX_SCALE = 3
  MIN_SCALE = 0.2
  CSS_UNITS = 96 / 72
  totalPages = 0
  currentPage = new UntypedFormControl(0)
  zoom = new UntypedFormControl(this.DEFAULT_SCALE)
  isSmallViewPort = false
  realTimeProgressRequest = {
    content_type: 'Resource',
    current: ['0'],
    max_size: 0,
    mime_type: NsContent.EMimeTypes.PDF,
    user_id_type: 'uuid',
  }
  current: string[] = []
  identifier: string | null = null
  enableTelemetry = false
  private pdfInstance: PDFDocumentProxy | null = null
  private activityStartedAt: Date | null = null
  private renderSubject = new Subject()
  private lastRenderTask: any | null = null

  // Subscriptions
  private contextMenuSubs: Subscription | null = null
  private renderSubscriptions: Subscription | null = null
  private runnerSubs: Subscription | null = null
  private routerSubs: Subscription | null = null
  public isInFullScreen = false
  public isMobile = false
  public markAsCompleteSubjectSubscribe: Subscription | null = null

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private eventSvc: EventService,
    private logger: LoggerService,
    private contentSvc: WidgetContentService,
    private viewerSvc: ViewerUtilService,
    private valueSvc: ValueService,
  ) {
    super()
  }

  async ngOnInit() {
    pdfjsViewer = await import('pdfjs-dist/web/pdf_viewer')

    // Link service fix (optional)
    pdfjsViewer.SimpleLinkService.prototype.getDestinationHash =
      pdfjsViewer.PDFLinkService.prototype.getDestinationHash
    pdfjsViewer.SimpleLinkService.prototype.getAnchorUrl =
      pdfjsViewer.PDFLinkService.prototype.getAnchorUrl

    this.zoom.disable()
    this.currentPage.disable()

    this.valueSvc.isLtMedium$.subscribe(ltMedium => {
      if (ltMedium) {
        this.zoom.setValue(0.5)
      }
    })

    this.widgetData.disableTelemetry = false

    if (this.widgetData.readValuesQueryParamsKey) {
      const keys = this.widgetData.readValuesQueryParamsKey
      this.activatedRoute.queryParamMap.pipe(distinctUntilChanged()).subscribe(params => {
        const pageNumber = Number(params.get(keys.pageNumber))
        const zoom = Number(params.get(keys.zoom))
        if (pageNumber > 0 && pageNumber <= this.totalPages) {
          this.currentPage.setValue(pageNumber)
        }
        if (zoom > 0) {
          this.zoom.setValue(zoom)
        }
      })
    }

    this.renderSubscriptions = merge(
      this.zoom.valueChanges.pipe(distinctUntilChanged()),
      this.currentPage.valueChanges.pipe(distinctUntilChanged()),
      this.renderSubject.asObservable(),
    )
      .pipe(debounceTime(250))
      .subscribe(async _ => {
        if (this.widgetData.readValuesQueryParamsKey) {
          const { zoom, pageNumber } = this.widgetData.readValuesQueryParamsKey
          const params = this.activatedRoute.snapshot.queryParamMap
          if (
            Number(params.get(zoom)) !== this.zoom.value ||
            Number(params.get(pageNumber)) !== this.currentPage.value
          ) {
            this.router.navigate([], {
              queryParams: {
                [pageNumber]: this.currentPage.value,
                [zoom]: this.zoom.value,
              },
            })
          }
        }
        await this.render()
        setTimeout(() => this.preserveAllApiCalls(), 500)
      })

    if (!this.widgetData.disableTelemetry) {
      this.runnerSubs = interval(30000).subscribe(_ => {
        this.eventDispatcher(WsEvents.EnumTelemetrySubType.HeartBeat)
      })
      this.eventDispatcher(WsEvents.EnumTelemetrySubType.Init)
    }

    this.markAsCompleteSubjectSubscribe = this.viewerSvc.markAsCompleteSubject.subscribe((data: any) => {
      if (data) {
        this.currentPage.reset()
        this.currentPage.setValue(this.totalPages)
        this.current = [...this.current, ...[this.totalPages.toString()]]
        this.markAsCompleteSubjectSubscribe?.unsubscribe()
        if (this.identifier) {
          this.saveContinueLearning(this.identifier)
        }
      }
    })

    this.isMobile = window.innerWidth <= 1200
  }

  ngOnChanges() { }

  ngAfterViewInit() {
    this.contextMenuSubs = fromEvent(this.pdfContainer.nativeElement, 'contextmenu').subscribe(e =>
      e.preventDefault(),
    )

    if (this.widgetData && this.widgetData.pdfUrl) {
      const publicUrl = this.viewerSvc.getCdnUrl(this.widgetData.pdfUrl)
      this.loadDocument(publicUrl)

      if (this.widgetData.identifier) {
        this.identifier = this.widgetData.identifier
      }
    }

    if (this.containerSection.nativeElement.clientWidth < 400) {
      this.isSmallViewPort = true
    }

    document.addEventListener('textlayerrendered', _event => {
      const pdfLinks = document.getElementsByClassName('linkAnnotation')
      for (let i = 0; i < pdfLinks.length; i += 1) {
        const anchor = pdfLinks[i].getElementsByTagName('a')[0]
        if (anchor && !anchor.classList.contains('internalLink')) {
          anchor.setAttribute('target', 'blank')
        }
      }
    })
  }

  ngOnDestroy() {
    if (this.identifier) {
      this.saveContinueLearning(this.identifier)
      this.fireRealTimeProgress(this.identifier)
    }
    this.contextMenuSubs?.unsubscribe()
    this.renderSubscriptions?.unsubscribe()
    this.runnerSubs?.unsubscribe()
    this.routerSubs?.unsubscribe()

    if (!this.widgetData.disableTelemetry) {
      this.eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded)
    }
  }

  changeScale(val: 'zoomin' | 'zoomout') {
    const currentZoom = this.zoom.value
    const step = 0.1
    this.zoom.setValue(val === 'zoomin' ? currentZoom + step : currentZoom - step)
  }

  fullScreenState(state: boolean) {
    this.isInFullScreen = state
  }

  loadPageNum(pageNum: number) {
    this.raiseTelemetry('pageChange')
    if (pageNum < 1 || pageNum > this.totalPages) return

    this.currentPage.setValue(pageNum)

    if (!this.widgetData.disableTelemetry) {
      this.eventDispatcher(WsEvents.EnumTelemetrySubType.StateChange)
    }

    if (pageNum === this.totalPages && this.identifier) {
      const pageNumStr = this.currentPage.value.toString()
      if (!this.current.includes(pageNumStr)) {
        this.current.push(pageNumStr)
      }
      this.fireRealTimeProgress(this.identifier)
    }
  }

  raiseTelemetry(action: string) {
    if (!this.identifier) return

    this.eventSvc.raiseInteractTelemetry(
      {
        type: action,
        subType: 'click',
        id: this.identifier,
      },
      {
        id: this.identifier,
        type: this.widgetData.primaryCategory,
        rollup: {
          l1: this.widgetData.collectionId || '',
        },
        ver: `${this.widgetData.version}${''}`,
      },
      {
        module: WsEvents.EnumTelemetrymodules.LEARN,
      })
  }

  saveContinueLearning(id: string) {
    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    const isPlaylist = this.activatedRoute.snapshot.queryParams.collectionType?.toLowerCase() === 'playlist'

    const reqBody: any = {
      contextPathId: collectionId ? collectionId : id,
      resourceId: id,
      dateAccessed: Date.now(),
      data: JSON.stringify({
        progress: this.currentPage.value,
        timestamp: Date.now(),
        ...(isPlaylist && {
          contextType: 'playlist',
          contextFullPath: [collectionId, id],
        }),
      }),
    }

    this.contentSvc.saveContinueLearning(reqBody).toPromise().catch()
  }

  fireRealTimeProgress(id: string) {
    if (this.totalPages <= 0 || this.current.length === 0) return

    const realTimeProgressRequest = {
      ...this.realTimeProgressRequest,
      max_size: this.totalPages,
      current: this.current,
    }

    const resData = this.viewerSvc.getBatchIdAndCourseId(
      this.activatedRoute.snapshot.queryParams.collectionId,
      this.activatedRoute.snapshot.queryParams.batchId,
      id
    )
    const collectionId = (resData && resData.courseId) ? resData.courseId : ''
    const isPreAssessment = this.activatedRoute.snapshot.queryParams.preAssessment
    const batchId = (resData && resData.batchId) ? resData.batchId : ''

    if (isPreAssessment) {
      if (id && collectionId) {
        this.viewerSvc.realTimeProgressUpdateForPreAssessment(id, realTimeProgressRequest)
      }
    } else if (id && collectionId && batchId) {
      this.viewerSvc.realTimeProgressUpdate(id, realTimeProgressRequest, collectionId, batchId)
    }
  }

  private async render(): Promise<boolean> {
    if (!this.pdfContainer || this.pdfInstance === null) {
      return false
    }

    this.pdfContainer.nativeElement.innerHTML = ''

    const page = await this.pdfInstance.getPage(this.currentPage.value)
    const viewport = page.getViewport({ scale: this.zoom.value })

    const pageNumStr = this.currentPage.value.toString()
    if (!this.current.includes(pageNumStr)) {
      this.current.push(pageNumStr)
    }

    this.lastRenderTask = new pdfjsViewer.PDFPageView({
      container: this.pdfContainer.nativeElement,
      id: this.currentPage.value,
      scale: viewport.scale,
      defaultViewport: viewport,
      textLayerFactory: new pdfjsViewer.DefaultTextLayerFactory(),
      annotationLayerFactory: new pdfjsViewer.DefaultAnnotationLayerFactory(),
    })

    if (this.lastRenderTask) {
      this.lastRenderTask.setPdfPage(page)
      this.lastRenderTask.draw()
    }
    return true
  }

  refresh() {
    this.renderSubject.next()
  }

  private async loadDocument(url: string) {
    const pdf = await getDocument(url).promise
    this.pdfInstance = pdf
    this.totalPages = this.pdfInstance.numPages

    this.zoom.enable()
    this.currentPage.enable()

    this.currentPage.setValue(
      typeof this.widgetData.resumePage === 'number' &&
        this.widgetData.resumePage >= 1 &&
        this.widgetData.resumePage <= this.totalPages
        ? this.widgetData.resumePage
        : 1,
    )

    this.renderSubject.next()
    this.activityStartedAt = new Date()

    if (!this.widgetData.disableTelemetry) {
      this.eventDispatcher(WsEvents.EnumTelemetrySubType.Loaded)
    }
  }

  private eventDispatcher(
    eventType: WsEvents.EnumTelemetrySubType,
    activity: WsEvents.EnumTelemetryPdfActivity = WsEvents.EnumTelemetryPdfActivity.NONE,
  ) {
    if (this.widgetData.disableTelemetry) return

    const commonStructure: WsEvents.WsEventTelemetryPDF = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      from: {
        type: 'widget',
        widgetType: ROOT_WIDGET_CONFIG.player._type,
        widgetSubType: ROOT_WIDGET_CONFIG.player.pdf,
      },
      to: '',
      data: {
        eventSubType: eventType,
        activityType: activity,
        currentPage: this.currentPage.value,
        totalPage: this.totalPages,
        activityStartedAt: this.activityStartedAt,
        object: {
          id: this.widgetData.identifier,
          type: this.widgetData.contentType,
          ver: `${this.widgetData.version}${''}`,
          rollup: {
            l1: this.widgetData.collectionId || '',
          },
        },
      },
      passThroughData: this.widgetData.passThroughData,
    }

    switch (eventType) {
      case WsEvents.EnumTelemetrySubType.HeartBeat:
      case WsEvents.EnumTelemetrySubType.Init:
      case WsEvents.EnumTelemetrySubType.Loaded:
      case WsEvents.EnumTelemetrySubType.StateChange:
      case WsEvents.EnumTelemetrySubType.Unloaded:
        break
      default:
        return
    }
    if (this.enableTelemetry) {
      this.eventSvc.dispatchEvent(commonStructure)
    }
  }

  preserveAllApiCalls() {
    const links = Array.prototype.slice.call(document.getElementsByTagName('a'))
    for (let i = 0; i < links.length; i += 1) {
      if (links[i].className.includes('internalLink')) {
        links[i].addEventListener('click', async (e: any) => {
          const layer = unescape((new URL(e.toElement.href).hash as string).slice(1))
          const pageIndex: any = JSON.parse(layer)

            ; (this.pdfInstance as any)
              .getPageIndex(pageIndex[0])
              .then((pageNumber: number) => {
                this.currentPage.setValue(pageNumber + 1)
              })
              .catch((ex: any) => {
                this.logger.error(ex)
              })
        })
      }
    }
  }
}
