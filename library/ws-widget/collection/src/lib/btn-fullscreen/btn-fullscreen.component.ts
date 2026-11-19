import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, HostBinding } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@sunbird-cb/resolver'
import { Subscription, fromEvent } from 'rxjs'
import {
  getFullScreenElement,
  requestExitFullScreen,
  requestFullScreen,
  hasFullScreenSupport,
} from './fullscreen.util'

@Component({
    selector: 'ws-widget-btn-fullscreen',
    templateUrl: './btn-fullscreen.component.html',
    styleUrls: ['./btn-fullscreen.component.scss'],
    standalone: false
})
export class BtnFullscreenComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy, NsWidgetResolver.IWidgetData<{ fsContainer: HTMLElement | null }> {
  @Input() widgetData!: { fsContainer: HTMLElement | null }
  @Output() fsState: EventEmitter<boolean> = new EventEmitter()
  @HostBinding('id')
  public id = 'fullscreen'

  isFullScreenSupported = false
  isInFs = false
  fsChangeSubs: Subscription | null = null

  ngOnInit() {
    if (!this.widgetData.fsContainer) {
      return
    }
    this.isInFs = Boolean(getFullScreenElement())
    // Emit on the browser event so exits via Esc/F11 are reported too, not only button clicks
    this.fsChangeSubs = fromEvent(document, 'fullscreenchange').subscribe(() => {
      this.isInFs = Boolean(getFullScreenElement())
      // Only report fullscreen when our own container is the fullscreen element
      this.fsState.emit(getFullScreenElement() === this.widgetData.fsContainer)
    })
    this.isFullScreenSupported = hasFullScreenSupport(this.widgetData.fsContainer)
  }

  ngOnDestroy() {
    if (this.fsChangeSubs) {
      this.fsChangeSubs.unsubscribe()
    }
  }

  toggleFs() {
    if (getFullScreenElement()) {
      requestExitFullScreen()
    } else if (this.widgetData.fsContainer) {
      requestFullScreen(this.widgetData.fsContainer)
      try {
        this.widgetData.fsContainer.classList.add('mat-app-background')
      } catch (err) { }
    }
  }
}
