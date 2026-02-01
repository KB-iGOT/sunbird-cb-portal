import { Component, OnInit, Input, OnChanges } from '@angular/core'
import { NsWidgetResolver } from '@sunbird-cb/resolver-v2'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { NsDiscussionForum } from '../../../discussion-forum/ws-discussion-forum.model'
import { NsContent } from '../../../_services/widget-content.model'

@Component({
  selector: 'ws-app-toc-discussion',
  templateUrl: './app-toc-discussion.component.html',
  styleUrls: ['./app-toc-discussion.component.scss'],
  standalone: false
})
export class AppTocDiscussionComponent implements OnChanges, OnInit {
  @Input() content!: NsContent.IContent
  showDiscussionForum = false
  isRestricted = true
  @Input() forPreview = false
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  constructor(private activatedRoute: ActivatedRoute, private configSvc: ConfigurationsService) { }

  ngOnChanges() {
    this.forPreview = window.location.href.includes('/author/')
    if (this.content) {
      this.discussionForumWidget = {
        widgetData: {
          description: this.content.description,
          id: this.content.identifier,
          name: NsDiscussionForum.EDiscussionType.LEARNING,
          title: this.content.name,
          initialPostCount: 2,
          isDisabled: this.forPreview,
        },
        widgetSubType: 'discussionForum',
        widgetType: 'discussionForum',
      }
    }
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        this.configSvc.restrictedFeatures.has('disscussionForum') ||
        this.configSvc.restrictedFeatures.has('disscussionForumTRPU')
    }
    if (this.activatedRoute.parent && this.activatedRoute.parent.data) {
      this.activatedRoute.parent.data.subscribe((data: any) => {
        if (data && data.content && data.content.data) {
          this.content = data.content.data
          this.ngOnChanges()
        }
      })
    }
  }
}
