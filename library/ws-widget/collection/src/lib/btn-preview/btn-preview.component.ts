import { Component, Input, OnInit } from '@angular/core'
import { WidgetBaseComponent } from '@sunbird-cb/resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '@sunbird-cb/resolver/src/lib/widget-resolver.model'

@Component({
  selector: 'ws-widget-btn-preview',
  templateUrl: './btn-preview.component.html',
  styleUrls: ['./btn-preview.component.scss'],
})
export class BtnPreviewComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<any> {
  @Input() widgetData!: any
  ngOnInit(): void {
  }

}
