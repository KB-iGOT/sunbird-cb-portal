import { Component, Input, OnInit } from '@angular/core'
import { WidgetBaseComponent } from '@sunbird-cb/resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '@sunbird-cb/resolver/src/lib/widget-resolver.model'

interface ILinearWidgets {
  widgets: NsWidgetResolver.IRenderConfigWithAnyData[]
}
@Component({
  selector: 'ws-widget-layout-linear',
  templateUrl: './layout-linear.component.html',
  styleUrls: ['./layout-linear.component.scss'],
})
export class LayoutLinearComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<ILinearWidgets> {
  @Input() widgetData!: ILinearWidgets

  ngOnInit() {}
}
