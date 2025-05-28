import { Component, Input, OnInit } from '@angular/core'
import { NsContent } from '../_services/widget-content.model'
import { WidgetBaseComponent } from '@sunbird-cb/resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '@sunbird-cb/utils-v2/lib/services/widget-resolver.model'

export interface IWidgetBtnKbAnalytics {
  identifier: string
  contentType: NsContent.EContentTypes
  resourceType: string
  mimeType: NsContent.EMimeTypes
  downloadUrl: string
  isExternal: boolean
  artifactUrl: string
}

@Component({
  selector: 'ws-widget-btn-kb-analytics',
  templateUrl: './btn-kb-analytics.component.html',
  styleUrls: ['./btn-kb-analytics.component.scss'],
})
export class BtnKbAnalyticsComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<IWidgetBtnKbAnalytics> {
  @Input() widgetData!: IWidgetBtnKbAnalytics
  @Input() forPreview = false

  isVisible = false

  constructor(
  ) {
    super()
  }
  ngOnInit() {
    this.isVisible = (NsContent.EContentTypes.KNOWLEDGE_BOARD === this.widgetData.contentType)
  }

}
