import { Component, OnInit, Input } from '@angular/core'
import { IChannelHub, IChannelHubCard } from './channel-hub.model'
import * as _moment from 'moment'
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment'
import { WidgetBaseComponent } from '@sunbird-cb/resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '@sunbird-cb/resolver/src/lib/widget-resolver.model'
const moment = _rollupMoment || _moment

@Component({
  selector: 'ws-widget-channel-hub',
  templateUrl: './channel-hub.component.html',
  styleUrls: ['./channel-hub.component.scss'],
})
export class ChannelHubComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<IChannelHub> {
  @Input() widgetData!: IChannelHub

  ngOnInit() {
    this.widgetData.cards.map((card: IChannelHubCard) => {
      if (card) {
        if (
          card.startDate &&
          typeof card.startDate === 'string' &&
          card.startDate.indexOf('/') > -1
        ) {
          const startDate: any = moment(card.startDate, 'MM/YYYY')
          card.startDate = startDate.toISOString()
        }
        if (card.endDate && typeof card.endDate === 'string' && card.endDate.indexOf('/') > -1) {
          const endDate: any = moment(card.endDate, 'MM/YYYY')
          card.endDate = endDate.toISOString()
        }
      }
    })
  }
}
