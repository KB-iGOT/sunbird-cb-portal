import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'


import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  DefaultThumbnailModule,
  PipePartialContentModule,
  PipeSafeSanitizerModule,
} from '@sunbird-cb/utils-v2'

import { AudioNativeModule as AudioNativePluginModule } from '../../plugins/audio-native/audio-native.module'

import { AudioNativeComponent } from './audio-native.component'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { BtnContentDownloadModule } from '../../btn-content-download/btn-content-download.module'
import { BtnContentFeedbackModule } from '../../btn-content-feedback/btn-content-feedback.module'
import { BtnContentFeedbackV2Module } from '../../btn-content-feedback-v2/btn-content-feedback-v2.module'
import { BtnContentLikeModule } from '../../btn-content-like/btn-content-like.module'
import { BtnContentShareModule } from '../../btn-content-share/btn-content-share.module'
import { BtnGoalsModule } from '../../btn-goals/btn-goals.module'
import { BtnPlaylistModule } from '../../btn-playlist/btn-playlist.module'
import { DisplayContentTypeModule } from '../../_common/display-content-type/display-content-type.module'
import { UserContentRatingModule } from '../../_common/user-content-rating/user-content-rating.module'
import { UserImageModule } from '../../_common/user-image/user-image.module'
import { PlayerBriefModule } from '../../_common/player-brief/player-brief.module'

@NgModule({
  declarations: [AudioNativeComponent],
  imports: [
    AudioNativePluginModule,
    BtnContentDownloadModule,
    BtnContentFeedbackModule,
    BtnContentFeedbackV2Module,
    BtnContentLikeModule,
    BtnContentShareModule,
    BtnGoalsModule,
    BtnPlaylistModule,
    CommonModule,
    DefaultThumbnailModule,
    DisplayContentTypeModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatSnackBarModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    RouterModule,
    UserContentRatingModule,
    UserImageModule,
    SbUiResolverModule,
    PipeSafeSanitizerModule,
    PlayerBriefModule,
  ],
  exports: [AudioNativeComponent],
})
export class AudioNativeModule { }
