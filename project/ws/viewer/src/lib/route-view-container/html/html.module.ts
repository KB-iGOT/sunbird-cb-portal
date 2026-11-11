import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { BtnContentDownloadModule } from '@sunbird-cb/collection/src/lib/btn-content-download/btn-content-download.module'
import { BtnContentFeedbackModule } from '@sunbird-cb/collection/src/lib/btn-content-feedback/btn-content-feedback.module'
import { BtnContentLikeModule } from '@sunbird-cb/collection/src/lib/btn-content-like/btn-content-like.module'
import { BtnContentShareModule } from '@sunbird-cb/collection/src/lib/btn-content-share/btn-content-share.module'
import { BtnFullscreenModule } from '@sunbird-cb/collection/src/lib/btn-fullscreen/btn-fullscreen.module'
import { BtnGoalsModule } from '@sunbird-cb/collection/src/lib/btn-goals/btn-goals.module'
import { BtnPlaylistModule } from '@sunbird-cb/collection/src/lib/btn-playlist/btn-playlist.module'
import { DisplayContentTypeModule } from '@sunbird-cb/collection/src/lib/_common/display-content-type/display-content-type.module'
import { UserContentRatingModule } from '@sunbird-cb/collection/src/lib/_common/user-content-rating/user-content-rating.module'
import { UserImageModule } from '@sunbird-cb/collection/src/lib/_common/user-image/user-image.module'
import { BtnContentFeedbackV2Module } from '@sunbird-cb/collection/src/lib/btn-content-feedback-v2/btn-content-feedback-v2.module'
import { PlayerBriefModule } from '@sunbird-cb/collection/src/lib/_common/player-brief/player-brief.module'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
  PipeLimitToPipe,
} from '@sunbird-cb/utils-v2'

import { WidgetResolverModule } from '@sunbird-cb/resolver'

// import { HtmlRoutingModule } from './html-routing.module'

import { HtmlModule as HtmlPluginModule } from '../../plugins/html/html.module'

import { HtmlComponent } from './html.component'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBarModule } from '@angular/material/snack-bar'
// import { ViewerCourseInfoModule } from '../../plugins/viewer-course-info/viewer-course-info.module'

@NgModule({
  declarations: [HtmlComponent],
  imports: [
    CommonModule,
    HtmlPluginModule,
    RouterModule,
    // HtmlRoutingModule,
    WidgetResolverModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    BtnContentDownloadModule,
    BtnContentFeedbackModule,
    BtnContentLikeModule,
    BtnContentShareModule,
    BtnFullscreenModule,
    BtnGoalsModule,
    BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    UserContentRatingModule,
    BtnContentFeedbackV2Module,
    PlayerBriefModule,
    // ViewerCourseInfoModule,
  ],
  providers: [PipeLimitToPipe],
  exports: [HtmlComponent],
})
export class HtmlModule { }
