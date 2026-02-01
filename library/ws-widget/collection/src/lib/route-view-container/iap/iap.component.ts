import { Component, Input, OnInit } from '@angular/core'
import { NsWidgetResolver } from '@sunbird-cb/resolver-v2'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { NsContent } from '../../_services/widget-content.model'
import { NsDiscussionForum } from '../../discussion-forum/ws-discussion-forum.model'

@Component({
  selector: 'viewer-iap-container',
  templateUrl: './iap.component.html',
  styleUrls: ['./iap.component.scss'],
  standalone: false
})
export class IapComponent implements OnInit {
  @Input() isFetchingDataComplete = false
  @Input() iapData: NsContent.IContent | null = null
  @Input() discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  @Input() isPreviewMode = false
  isTypeOfCollection = false
  @Input() forPreview = false
  isRestricted = false

  constructor(private activatedRoute: ActivatedRoute, private configSvc: ConfigurationsService) { }
  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        !this.configSvc.restrictedFeatures.has('disscussionForum')
    }
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
  }
}
