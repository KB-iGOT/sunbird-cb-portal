import { Component, Input, OnInit } from '@angular/core'
import { WidgetBaseComponent } from '@sunbird-cb/resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '@sunbird-cb/resolver/src/lib/widget-resolver.model'

@Component({
  selector: 'ws-widget-player-slides',
  templateUrl: './player-slides.component.html',
  styleUrls: ['./player-slides.component.scss'],
})
export class PlayerSlidesComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<any> {
  @Input() widgetData!: any

  ngOnInit() {}
}
