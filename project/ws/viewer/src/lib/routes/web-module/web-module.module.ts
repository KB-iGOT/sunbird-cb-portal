import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { BtnContentDownloadModule } from '@sunbird-cb/collection/src/lib/btn-content-download/btn-content-download.module'
import { BtnContentFeedbackModule } from '@sunbird-cb/collection/src/lib/btn-content-feedback/btn-content-feedback.module'
import { BtnContentLikeModule } from '@sunbird-cb/collection/src/lib/btn-content-like/btn-content-like.module'
import { BtnContentShareModule } from '@sunbird-cb/collection/src/lib/btn-content-share/btn-content-share.module'
import { BtnGoalsModule } from '@sunbird-cb/collection/src/lib/btn-goals/btn-goals.module'
import { BtnPlaylistModule } from '@sunbird-cb/collection/src/lib/btn-playlist/btn-playlist.module'
import { DisplayContentTypeModule } from '@sunbird-cb/collection/src/lib/_common/display-content-type/display-content-type.module'
import { UserImageModule } from '@sunbird-cb/collection/src/lib/_common/user-image/user-image.module'
import { UserContentRatingModule } from '@sunbird-cb/collection/src/lib/_common/user-content-rating/user-content-rating.module'
import { BtnContentFeedbackV2Module } from '@sunbird-cb/collection/src/lib/btn-content-feedback-v2/btn-content-feedback-v2.module'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@sunbird-cb/utils-v2'

import { WidgetResolverModule } from '@sunbird-cb/resolver'

import { WebModuleRoutingModule } from './web-module-routing.module'

import { WebModuleComponent } from './web-module.component'

import { WebModuleModule as WebModuleViewContainerModule } from '../../route-view-container/web-module/web-module.module'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatSnackBarModule } from '@angular/material/snack-bar'

@NgModule({
  declarations: [WebModuleComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatSnackBarModule,
    WebModuleRoutingModule,
    WidgetResolverModule,
    BtnContentDownloadModule,
    BtnContentFeedbackModule,
    BtnContentLikeModule,
    BtnContentShareModule,
    BtnGoalsModule,
    BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    UserContentRatingModule,
    BtnContentFeedbackV2Module,
    WebModuleViewContainerModule,
  ],
})
export class WebModuleModule { }
