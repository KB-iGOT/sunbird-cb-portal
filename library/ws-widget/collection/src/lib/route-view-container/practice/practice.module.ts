import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'



import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@sunbird-cb/utils-v2'

import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { PracticePlModule as PracticePluginModule } from '../../plugins/practice/practice.module'
import { PracticeComponent } from './practice.component'
import { PracticeRoutingModule } from './practice-routing.module'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatToolbarModule } from '@angular/material/toolbar'
import { BtnContentDownloadModule } from '../../btn-content-download/btn-content-download.module'
import { BtnContentFeedbackModule } from '../../btn-content-feedback/btn-content-feedback.module'
import { BtnContentLikeModule } from '../../btn-content-like/btn-content-like.module'
import { BtnContentShareModule } from '../../btn-content-share/btn-content-share.module'
import { BtnGoalsModule } from '../../btn-goals/btn-goals.module'
import { DisplayContentTypeModule } from '../../_common/display-content-type/display-content-type.module'
import { UserImageModule } from '../../_common/user-image/user-image.module'
import { BtnPlaylistModule } from '../../btn-playlist/btn-playlist.module'
import { UserContentRatingModule } from '../../_common/user-content-rating/user-content-rating.module'
import { BtnContentFeedbackV2Module } from '../../btn-content-feedback-v2/btn-content-feedback-v2.module'
import { PlayerBriefModule } from '../../_common/player-brief/player-brief.module'
import { BtnPageBackModule } from '../../btn-page-back/btn-page-back.module'

@NgModule({
  declarations: [PracticeComponent],
  imports: [
    CommonModule,
    PracticeRoutingModule,
    PracticePluginModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatToolbarModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
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
    SbUiResolverModule,
    UserContentRatingModule,
    BtnContentFeedbackV2Module,
    BtnPageBackModule,
    PlayerBriefModule,
  ],
  exports: [
    PracticeComponent,
  ],
})
export class PracticeModule { }
