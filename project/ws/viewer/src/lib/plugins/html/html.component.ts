import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild, OnDestroy } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { Router, ActivatedRoute } from '@angular/router'
import { NsContent } from '@sunbird-cb/collection'
import { ConfigurationsService, EventService, LoggerService, TFetchStatus } from '@sunbird-cb/utils'
import { MobileAppsService } from '../../../../../../../src/app/services/mobile-apps.service'
import { SCORMAdapterService } from './SCORMAdapter/scormAdapter'
/* tslint:disable */
import _ from 'lodash'
import { environment } from 'src/environments/environment';
import { Subscription, timer } from 'rxjs'
import { Storage } from './SCORMAdapter/storage'
/* tslint:enable */

@Component({
  selector: 'viewer-plugin-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss'],
})
export class HtmlComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('mobileOpenInNewTab', { read: ElementRef, static: false }) mobileOpenInNewTab !: ElementRef<HTMLAnchorElement>
  @Input() htmlContent: NsContent.IContent | null = null
  iframeUrl: SafeResourceUrl | null = null
  iframeName = `piframe_${Date.now()}`
  showIframeSupportWarning = false
  showIsLoadingMessage = false
  showUnBlockMessage = false
  pageFetchStatus: TFetchStatus | 'artifactUrlMissing' = 'fetching'
  isUserInIntranet = false
  intranetUrlPatterns: string[] | undefined = []
  isIntranetUrl = false
  collectionId = ''
  forPreview = window.location.href.includes('/public/') || window.location.href.includes('&preview=true')
  progress = 100
  progressThreshold = 70
  realTimeProgressRequest = {
    content_type: 'Resource',
    primaryCategory: NsContent.EPrimaryCategory.RESOURCE,
    current: ['0'],
    max_size: 0,
    mime_type: NsContent.EMimeTypes.ZIP,
    user_id_type: 'uuid',
  }

  ticks = 0
  private timer!: any
  // Subscription object
  private sub!: Subscription

  constructor(
    private domSanitizer: DomSanitizer,
    public mobAppSvc: MobileAppsService,
    private scormAdapterService: SCORMAdapterService,
    private router: Router,
    private configSvc: ConfigurationsService,
    private snackBar: MatSnackBar,
    private events: EventService,
    private activatedRoute: ActivatedRoute,
    private store: Storage,
    private loggerSvc: LoggerService
  ) {
    (window as any).API = this.scormAdapterService
    // if (window.addEventListener) {
    window.addEventListener('message', this.receiveMessage.bind(this))
    // }
    // else {
    //   (<any>window).attachEvent('onmessage', this.receiveMessage.bind(this))
    // }
    // window.addEventListener('message', function (event) {
    //   /* tslint:disable-next-line */
    //   console.log('message', event)
    // })
    // window.addEventListener('onmessage', function (event) {
    //   /* tslint:disable-next-line */
    //   console.log('onmessage===>', event)
    // })
  }

  ngOnInit() {
    console.log('ngOnInit')
    if (this.htmlContent && this.htmlContent.identifier) {
      this.scormAdapterService.contentId = this.htmlContent.identifier
      if (!this.forPreview) {
        this.scormAdapterService.loadDataV2()
        this.timer = timer(1000, 1000)
        // subscribing to a observable returns a subscription object
        this.sub = this.timer.subscribe((t: any) => this.tickerFunc(t))
      }
    }
  }

  tickerFunc(tick: any) {
    console.log('tick', tick)
    this.ticks = tick
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.receiveMessage)
    window.removeEventListener('onmessage', this.receiveMessage)
    console.log('this.ticks: ', this.ticks)
    this.raiseRealTimeProgress()

  }

  private raiseRealTimeProgress() {
    this.realTimeProgressRequest = {
      ...this.realTimeProgressRequest,
      current: ['1'],
      max_size: 1,
    }
    this.fireRealTimeProgress()
    this.sub.unsubscribe();
  }

  private fireRealTimeProgress() {
    if (this.htmlContent) {
      console.log('this.htmlContent', this.htmlContent, '::', this.ticks)
      this.realTimeProgressRequest.content_type = this.htmlContent.contentType
      this.realTimeProgressRequest.primaryCategory = this.htmlContent.primaryCategory

      // const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
      //   this.activatedRoute.snapshot.queryParams.collectionId : ''

      // const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
      //   this.activatedRoute.snapshot.queryParams.batchId : ''
      const completionData = this.calculateCompletionStatus()
      const req = {
        ...this.realTimeProgressRequest,
        status: (completionData && completionData.status) || 0,
        completionPercentage: (completionData && completionData.completionPercentage) || 0,
        progressDetails: { spentTime: (completionData && completionData.completionPercentage) || 0 }
      }
      this.scormAdapterService.addDataV3(req).subscribe((_res: any) => {
        this.loggerSvc.log('Progress updated successfully')
      }, (err) => {
        this.loggerSvc.error('Error calling progress update for scorm content', err)
      }
      )
    }
    return
  }

  calculateCompletionStatus() {
    const data = this.store.getAll()
    let spentTime = 0
    let percentage = 0
    // if ((data && data['completionStatus'] === 2)) {
    //   return {
    //     completionPercentage: data && data['completionPercentage'],
    //     status: data && data['completionStatus'],
    //   }
    // } else {

      if (data) {
        spentTime = (this.ticks * 1000) + (data && data["spentTime"] || 0)
        if (this.htmlContent && spentTime) {
          // ~~ will remove decimal after division
          percentage = ~~((spentTime / this.htmlContent.duration) * 100)
        }
      }

      if (percentage >= this.progressThreshold) {
        return {
          completionPercentage: 100,
          status: 2,
          spentTime: spentTime
        }
      } else {
        return {
          completionPercentage: percentage,
          status: 1,
          spentTime: spentTime
        }
      }
    // }
  }

  ngOnChanges() {
    this.isIntranetUrl = false
    this.progress = 100
    this.pageFetchStatus = 'fetching'
    this.showIframeSupportWarning = false
    this.intranetUrlPatterns = this.configSvc.instanceConfig
      ? this.configSvc.instanceConfig.intranetIframeUrls
      : []

    // //console.log(this.htmlContent)
    let iframeSupport: boolean | string | null =
      this.htmlContent && this.htmlContent.isIframeSupported
    if (this.htmlContent && this.htmlContent.artifactUrl) {
      if (this.htmlContent.artifactUrl.startsWith('http://')) {
        this.htmlContent.isIframeSupported = 'No'
      }
      if (typeof iframeSupport !== 'boolean') {
        iframeSupport = this.htmlContent.isIframeSupported
        if (iframeSupport === 'no') {
          this.showIframeSupportWarning = true
          setTimeout(
            () => {
              this.openInNewTab()
            },
            3000,
          )
          setInterval(
            () => {
              this.progress -= 1
            },
            30,
          )
        } else if (iframeSupport === 'maybe') {
          this.showIframeSupportWarning = true
        } else {
          this.showIframeSupportWarning = false
        }
      }
      if (this.intranetUrlPatterns && this.intranetUrlPatterns.length) {
        this.intranetUrlPatterns.forEach(iup => {
          if (this.htmlContent && this.htmlContent.artifactUrl) {
            if (this.htmlContent.artifactUrl.startsWith(iup)) {
              this.isIntranetUrl = true
            }
          }
        })
      }
      // if (this.htmlContent.isInIntranet || this.isIntranetUrl) {
      //   this.checkIfIntranet().subscribe(
      //     data => {
      //       //console.log(data)
      //       this.isUserInIntranet = data ? true : false
      //       //console.log(this.isUserInIntranet)
      //     },
      //     () => {
      //       this.isUserInIntranet = false
      //       //console.log(this.isUserInIntranet)
      //     },
      //   )
      // }
      this.showIsLoadingMessage = true
      // if (this.htmlContent.isIframeSupported !== 'No') {
      //   setTimeout(
      //     () => {
      //       if (this.pageFetchStatus === 'fetching') {
      //         this.showIsLoadingMessage = true
      //       }
      //     },
      //     3000,
      //   )
      // }
      // this.scormAdapterService.downladFile(this.htmlContent.artifactUrl).subscribe(data => {
      //   const blob = new Blob([data], {
      //     type: 'application/zip',
      //   })
      //   const a = document.createElement('a')
      //   const objectUrl = URL.createObjectURL(blob)
      //   a.href = objectUrl
      //   a.download = 'sunbird.zip'
      //   a.click()
      //   URL.revokeObjectURL(objectUrl)
      // })
      if (this.htmlContent.mimeType !== 'text/x-url' && this.htmlContent.mimeType !== 'video/x-youtube') {
        // if (this.htmlContent.status === 'Live') {
        //   this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
        //     // `https://igot.blob.core.windows.net/content/content/html/${this.htmlContent.identifier}-latest/index.html`
        // tslint:disable-next-line: max-line-length
        //     `${environment.azureHost}/${environment.azureBucket}/content/html/${this.htmlContent.identifier}-latest/index.html?timestamp='${new Date().getTime()}`
        //   )
        // } else {
        //   this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
        //     // `https://igot.blob.core.windows.net/content/content/html/${this.htmlContent.identifier}-snapshot/index.html`
        // tslint:disable-next-line: max-line-length
        //     `${environment.azureHost}/${environment.azureBucket}/content/html/${this.htmlContent.identifier}-snapshot/index.html?timestamp='${new Date().getTime()}`
        //   )
        // }
        if (this.htmlContent.streamingUrl && this.htmlContent.initFile) {
          if (this.htmlContent.streamingUrl.includes('latest') && !this.htmlContent.initFile) {
            this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
              // tslint:disable-next-line:max-line-length
              `${environment.azureHost}/${environment.azureBucket}/content/html/${this.htmlContent.identifier}-latest/index.html?timestamp='${new Date().getTime()}`
            )
          } else {
            // `${this.htmlContent.streamingUrl}/${this.htmlContent.initFile}?timestamp='${new Date().getTime()}`)
            this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
              // tslint:disable-next-line:max-line-length
              `${this.generateUrl(this.htmlContent.streamingUrl)}/${this.htmlContent.initFile}?timestamp='${new Date().getTime()}`
            )
          }
        } else {
          if (environment.production) {
            this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
              // tslint:disable-next-line: max-line-length
              // `${environment.azureHost}/${environment.azureBucket}/content/html/${this.htmlContent.identifier}-snapshot/index.html?timestamp='${new Date().getTime()}`
              // tslint:disable-next-line: max-line-length
              `${environment.azureHost}/${environment.azureBucket}/content/html/${this.htmlContent.identifier}-snapshot/index.html?timestamp='${new Date().getTime()}`
            )
          } else {
            this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
              // tslint:disable-next-line: max-line-length
              // `${environment.azureHost}/${environment.azureBucket}/content/html/${this.htmlContent.identifier}-snapshot/index.html?timestamp='${new Date().getTime()}`
              // tslint:disable-next-line: max-line-length
              `/abcd/${environment.azureBucket}/content/html/${this.htmlContent.identifier}-snapshot/index.html?timestamp='${new Date().getTime()}`
            )
          }
        }
      } else {
        setTimeout(
          () => {
            if (this.htmlContent && this.htmlContent.artifactUrl) {
              this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.htmlContent.artifactUrl)
            }
          },
          1000,
        )
        // this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.htmlContent.artifactUrl)
      }
      // testing purpose only
      // setTimeout(
      //   () => {
      //     const ifram = document.getElementsByClassName('html-iframe')[0]
      //     if (ifram && this.htmlContent) {
      //       _.set(ifram, 'src',
      //         `${this.htmlContent.artifactUrl}?timestamp='${new Date().getTime()}`)
      //     }
      //   },
      //   1000,
      // )
    } else if (this.htmlContent && this.htmlContent.artifactUrl === '') {
      this.iframeUrl = null
      this.pageFetchStatus = 'artifactUrlMissing'
    } else {
      this.iframeUrl = null
      this.pageFetchStatus = 'error'
    }
  }

  backToDetailsPage() {
    this.router.navigate(
      [`/app/toc/${this.htmlContent ? this.htmlContent.identifier : ''}/overview`],
      { queryParams: { primaryCategory: this.htmlContent ? this.htmlContent.primaryCategory : '' } })
  }
  receiveMessage(msg: any) {
    // /* tslint:disable-next-line */
    console.log("msg=>", msg)
    if (msg.data) {
      this.raiseTelemetry(msg.data)
    } else {
      this.raiseTelemetry({
        event: msg.message,
        id: msg.id,
      })
    }
  }
  openInNewTab() {
    if (this.htmlContent) {
      if (this.mobAppSvc && this.mobAppSvc.isMobile) {
        // window.open(this.htmlContent.artifactUrl)
        setTimeout(
          () => {
            this.mobileOpenInNewTab.nativeElement.click()
          },
          0,
        )
      } else {
        const width = window.outerWidth
        const height = window.outerHeight
        const isWindowOpen = window.open(
          this.htmlContent.artifactUrl,
          '_blank',
          `toolbar=yes,
             scrollbars=yes,
             resizable=yes,
             menubar=no,
             location=no,
             addressbar=no,
             top=${(15 * height) / 100},
             left=${(2 * width) / 100},
             width=${(65 * width) / 100},
             height=${(70 * height) / 100}`,
        )
        if (isWindowOpen === null) {
          const msg = 'The pop up window has been blocked by your browser, please unblock to continue.'
          this.snackBar.open(msg, 'X')
        }
      }
    }
  }
  dismiss() {
    this.showIframeSupportWarning = false
    this.isIntranetUrl = false
  }

  onIframeLoadOrError(evt: 'load' | 'error', iframe?: HTMLIFrameElement, event?: any) {
    if (evt === 'error') {
      this.pageFetchStatus = evt
    }
    if (evt === 'load' && iframe && iframe.contentWindow) {
      if (event && iframe.onload) {
        iframe.onload(event)
      }
      iframe.onload = (data => {
        if (data.target) {
          this.pageFetchStatus = 'done'
          this.showIsLoadingMessage = false
        }
      })
    }
  }

  raiseTelemetry(data1: any) {
    // if (this.forPreview) { return }
    let data: any
    if (this.htmlContent) {
      if (typeof data1 === 'string' || data1 instanceof String) {
        data = JSON.parse(data1.toString())
      } else {
        data = { ...data1 }
      }
      /* tslint:disable-next-line */
      if (this.activatedRoute.snapshot.queryParams.collectionId) {
        this.collectionId = this.activatedRoute.snapshot.queryParams.collectionId
      }
      this.events.raiseInteractTelemetry(
        {
          type: data.event || data.type || 'type',
          subType: 'scorm',
          id: this.htmlContent.identifier,
        },
        {
          ...data,
          // contentId: this.htmlContent.identifier,
          // contentType: this.htmlContent.primaryCategory,
          id: this.htmlContent.identifier,
          type: this.htmlContent.primaryCategory,
          context: this.htmlContent.context,
          rollup: {
            l1: this.collectionId || '',
          },
          ver: `${this.htmlContent.version}${''}`,
        },
        {
          pageIdExt: `${_.camelCase(this.htmlContent.primaryCategory)}`,
          module: _.camelCase(this.htmlContent.primaryCategory),
        })
    }
  }

  generateUrl(oldUrl: string) {
    const chunk = oldUrl.split('/')
    const newChunk = environment.azureHost.split('/')
    const newLink = []
    for (let i = 0; i < chunk.length; i += 1) {
      if (i === 2) {
        newLink.push(newChunk[i])
      } else if (i === 3) {
        newLink.push(environment.azureBucket)
      } else {
        newLink.push(chunk[i])
      }
    }
    const newUrl = newLink.join('/')
    return newUrl
  }
}
