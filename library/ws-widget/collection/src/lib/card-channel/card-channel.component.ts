import { Component, OnInit, Input } from '@angular/core'
import { IChannel } from './card-channel.model'
import { WidgetBaseComponent } from '@sunbird-cb/resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '@sunbird-cb/utils-v2/lib/services/widget-resolver.model'
@Component({
  selector: 'ws-widget-card-channel',
  templateUrl: './card-channel.component.html',
  styleUrls: ['./card-channel.component.scss'],
})
export class CardChannelComponent extends WidgetBaseComponent implements OnInit, NsWidgetResolver.IWidgetData<IChannel> {

  @Input() widgetData!: IChannel

  constructor() {
    super()
  }

  ngOnInit() {
  }
}
