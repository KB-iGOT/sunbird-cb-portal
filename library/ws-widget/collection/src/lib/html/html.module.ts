import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'


import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@sunbird-cb/utils-v2'

import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'

import { HtmlModule as HtmlViewContainerModule } from '../route-view-container/html/html.module'

import { HtmlComponent } from './html.component'

import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { AccessControlService } from '../modules/shared/services/access-control.service'
import { BtnContentDownloadModule } from '../btn-content-download/btn-content-download.module'
import { BtnContentFeedbackModule } from '../btn-content-feedback/btn-content-feedback.module'
import { BtnContentLikeModule } from '../btn-content-like/btn-content-like.module'
import { BtnContentShareModule } from '../btn-content-share/btn-content-share.module'
import { BtnFullscreenModule } from '../btn-fullscreen/btn-fullscreen.module'
import { BtnGoalsModule } from '../btn-goals/btn-goals.module'
import { BtnPlaylistModule } from '../btn-playlist/btn-playlist.module'
import { DisplayContentTypeModule } from '../_common/display-content-type/display-content-type.module'
import { UserImageModule } from '../_common/user-image/user-image.module'
import { UserContentRatingModule } from '../_common/user-content-rating/user-content-rating.module'
import { BtnContentFeedbackV2Module } from '../btn-content-feedback-v2/btn-content-feedback-v2.module'
@NgModule({
  declarations: [HtmlComponent],
  imports: [
    CommonModule,
    HtmlViewContainerModule,
    RouterModule,
    SbUiResolverModule,
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
    MatSnackBarModule,
    UserContentRatingModule,
    BtnContentFeedbackV2Module,
  ],
  providers: [AccessControlService],
})
export class HtmlModule { }
