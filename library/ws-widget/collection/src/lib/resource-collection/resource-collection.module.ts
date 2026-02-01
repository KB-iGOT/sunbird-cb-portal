import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'



import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@sunbird-cb/utils-v2'

import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'

import { ResourceCollectionRoutingModule } from './resource-collection-routing.module'

import { ResourceCollectionComponent } from './resource-collection.component'

import {
  ResourceCollectionModule as ResourceCollectionViewContainerModule,
} from '../route-view-container/resource-collection/resource-collection.module'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { BtnContentDownloadModule } from '../btn-content-download/btn-content-download.module'
import { BtnContentFeedbackModule } from '../btn-content-feedback/btn-content-feedback.module'
import { BtnContentLikeModule } from '../btn-content-like/btn-content-like.module'
import { BtnContentShareModule } from '../btn-content-share/btn-content-share.module'
import { BtnGoalsModule } from '../btn-goals/btn-goals.module'
import { BtnPlaylistModule } from '../btn-playlist/btn-playlist.module'
import { DisplayContentTypeModule } from '../_common/display-content-type/display-content-type.module'
import { UserImageModule } from '../_common/user-image/user-image.module'
import { UserContentRatingModule } from '../_common/user-content-rating/user-content-rating.module'
import { BtnContentFeedbackV2Module } from '../btn-content-feedback-v2/btn-content-feedback-v2.module'

@NgModule({
  declarations: [ResourceCollectionComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatSnackBarModule,
    ResourceCollectionRoutingModule,
    SbUiResolverModule,
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
    ResourceCollectionViewContainerModule,
  ],
})
export class ResourceCollectionModule { }
