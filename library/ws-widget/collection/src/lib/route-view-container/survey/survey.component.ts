import { Component, Input, OnInit } from '@angular/core'
import { NsWidgetResolver } from '@sunbird-cb/resolver-v2'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { NsDiscussionForum } from '../../discussion-forum/ws-discussion-forum.model'
import { NsContent } from '../../_services/widget-content.model'

@Component({
  selector: 'viewer-survey-container',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
  standalone: false
})
export class SurveyComponent implements OnInit {
  @Input() isFetchingDataComplete = false
  @Input() surveyData: NsContent.IContent | null = null
  @Input() forPreview = false
  @Input() widgetResolverSurveyData: any = {
    widgetType: 'player',
    widgetSubType: 'playerSurvey',
    widgetData: {
      surveyUrl: '',
      identifier: '',
      disableTelemetry: false,
      hideControls: true,
    },
  }
  @Input() isPreviewMode = false
  @Input() discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  isTypeOfCollection = false
  isRestricted = false
  constructor(
    private activatedRoute: ActivatedRoute,
    private configSvc: ConfigurationsService
  ) { }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        !this.configSvc.restrictedFeatures.has('disscussionForum')
    }
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
  }
}
