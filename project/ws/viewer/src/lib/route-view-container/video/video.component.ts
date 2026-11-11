import { Component, Input, OnInit } from '@angular/core'
import { NsContent } from '@sunbird-cb/collection/src/lib/_services/widget-content.model'
import { IWidgetsPlayerMediaData } from '@sunbird-cb/collection/src/lib/_models/player-media.model'
import { NsWidgetResolver } from '@sunbird-cb/resolver'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'

@Component({
    selector: 'viewer-video-container',
    templateUrl: './video.component.html',
    styleUrls: ['./video.component.scss'],
    standalone: false
})
export class VideoComponent implements OnInit {
  @Input() isScreenSizeSmall = false
  @Input() isNotEmbed = true
  @Input() isFetchingDataComplete = false
  @Input() forPreview = false
  @Input() videoData: NsContent.IContent | null = null
  @Input() widgetResolverVideoData: NsWidgetResolver.IRenderConfigWithTypedData<
    IWidgetsPlayerMediaData
  > | null = null
  @Input() isPreviewMode = false
  isTypeOfCollection = false
  isRestricted = false
  isMobile = false
  constructor(private activatedRoute: ActivatedRoute, private configSvc: ConfigurationsService) { }

  ngOnInit() {
    if (window.innerWidth <= 1200) {
      this.isMobile = true
    } else {
      this.isMobile = false
    }
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        !this.configSvc.restrictedFeatures.has('disscussionForum')
    }
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
  }
}
