import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IapComponent } from './iap.component'
import { IapRoutingModule } from './iap-routing.module'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { IapModule as IapPluginModule } from '../../plugins/iap/iap.module'



import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@sunbird-cb/utils-v2'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { BtnContentDownloadModule } from '../../btn-content-download/btn-content-download.module'
import { BtnContentFeedbackModule } from '../../btn-content-feedback/btn-content-feedback.module'
import { BtnContentLikeModule } from '../../btn-content-like/btn-content-like.module'
import { BtnContentShareModule } from '../../btn-content-share/btn-content-share.module'
import { BtnGoalsModule } from '../../btn-goals/btn-goals.module'
import { BtnPlaylistModule } from '../../btn-playlist/btn-playlist.module'
import { DisplayContentTypeModule } from '../../_common/display-content-type/display-content-type.module'
import { UserImageModule } from '../../_common/user-image/user-image.module'
import { UserContentRatingModule } from '../../_common/user-content-rating/user-content-rating.module'
import { BtnContentFeedbackV2Module } from '../../btn-content-feedback-v2/btn-content-feedback-v2.module'
import { PlayerBriefModule } from '../../_common/player-brief/player-brief.module'
@NgModule({
  declarations: [IapComponent],
  imports: [
    CommonModule,
    IapPluginModule,
    IapRoutingModule,
    SbUiResolverModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    BtnContentDownloadModule,
    BtnContentFeedbackModule,
    BtnContentLikeModule,
    BtnContentShareModule,
    BtnGoalsModule,
    BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatChipsModule,
    UserContentRatingModule,
    BtnContentFeedbackV2Module,
    PlayerBriefModule,
  ],
  exports: [IapComponent],
})
export class IapModule { }
