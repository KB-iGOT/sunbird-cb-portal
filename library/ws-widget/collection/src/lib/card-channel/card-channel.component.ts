import { Component, OnInit, Input } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@sunbird-cb/resolver-v2'
import { IChannel } from './card-channel.model'
@Component({
  selector: 'ws-widget-card-channel',
  templateUrl: './card-channel.component.html',
  styleUrls: ['./card-channel.component.scss'],
  standalone: false
})
export class CardChannelComponent extends WidgetBaseComponent implements OnInit, NsWidgetResolver.IWidgetData<IChannel> {

  @Input() widgetData!: IChannel

  constructor() {
    super()
  }

  ngOnInit() {
  }
}
