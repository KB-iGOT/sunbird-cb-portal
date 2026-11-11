import { Directive, Input, ViewContainerRef, OnChanges, OnDestroy } from '@angular/core'
import { LoggerService } from '@sunbird-cb/utils-v2'
import { NsWidgetResolver } from './widget-resolver.model'
import { WidgetResolverService } from './widget-resolver.service'

@Directive({
    selector: '[wsResolverWidget]',
    standalone: false
})
export class WidgetResolverDirective implements OnChanges, OnDestroy {
  @Input() wsResolverWidget: NsWidgetResolver.IRenderConfigWithAnyData | null = null
  // bumped on every render and on destroy, so a lazy widget that finishes loading after
  // the input changed (or the host went away) is not rendered over the newer state
  private renderId = 0
  constructor(
    private viewContainerRef: ViewContainerRef,
    private widgetResolverSvc: WidgetResolverService,
    private logger: LoggerService,
  ) {}

  ngOnChanges() {
    this.renderId += 1
    if (!this.widgetResolverSvc.isInitialized) {
      this.logger.error(
        'Widgets Registration Not Done. Used Before Initialization.',
        this.wsResolverWidget,
      )
      return
    }
    if (this.wsResolverWidget) {
      if (this.widgetResolverSvc.isLazyWidget(this.wsResolverWidget)) {
        const renderId = this.renderId
        this.viewContainerRef.clear()
        this.widgetResolverSvc
          .resolveLazyWidget(this.wsResolverWidget, this.viewContainerRef, () => renderId === this.renderId)
          .then(compRef => {
            if (compRef) {
              compRef.changeDetectorRef.detectChanges()
            }
          })
        return
      }
      const compRef = this.widgetResolverSvc.resolveWidget(
        this.wsResolverWidget,
        this.viewContainerRef,
      )
      if (compRef) {
        compRef.changeDetectorRef.detectChanges()
      }
    }
  }

  ngOnDestroy() {
    this.renderId += 1
  }
}
