import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { WidgetResolverModule } from '@sunbird-cb/resolver'

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
  DefaultThumbnailModule,
  PipePartialContentModule,
  PipeSafeSanitizerModule,
} from '@sunbird-cb/utils-v2'

import { AudioNativeModule as AudioNativeViewContainerModule } from '../../route-view-container/audio-native/audio-native.module'

import { AudioNativeComponent } from './audio-native.component'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBarModule } from '@angular/material/snack-bar'

@NgModule({
  declarations: [AudioNativeComponent],
  imports: [
    AudioNativeViewContainerModule,
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
    MatSnackBarModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    RouterModule,
    UserContentRatingModule,
    UserImageModule,
    WidgetResolverModule,
    PipeSafeSanitizerModule,
  ],
})
export class AudioNativeModule { }
