import { Component, Input } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@sunbird-cb/resolver-v2'
import { IWidgetsPlayerAmpData } from './player-amp.model'

@Component({
  selector: 'ws-widget-player-amp',
  templateUrl: './player-amp.component.html',
  styleUrls: ['./player-amp.component.scss'],
})
export class PlayerAmpComponent
  extends WidgetBaseComponent
  implements NsWidgetResolver.IWidgetData<any> {

  @Input() widgetType!: string
  @Input() widgetSubType!: string
  @Input() widgetInstanceId?: string
  @Input() widgetData!: any

  @Input() data!: IWidgetsPlayerAmpData

  constructor() {
    super()
  }
}
