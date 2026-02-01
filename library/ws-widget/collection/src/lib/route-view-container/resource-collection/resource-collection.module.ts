import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ResourceCollectionRoutingModule } from './resource-collection-routing.module'
import { ResourceCollectionComponent } from './resource-collection.component'

import { WebModuleModule as PluginWebModuleModule } from '../../plugins/web-module/web-module.module'
import { ResourceCollectionModule as PluginResourceCollectionModule } from '../../plugins/resource-collection/resource-collection.module'


import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@sunbird-cb/utils-v2'

import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatTableModule } from '@angular/material/table'
import { MatTabsModule } from '@angular/material/tabs'
import { BtnContentDownloadModule } from '../../btn-content-download/btn-content-download.module'
import { BtnContentFeedbackModule } from '../../btn-content-feedback/btn-content-feedback.module'
import { BtnContentLikeModule } from '../../btn-content-like/btn-content-like.module'
import { BtnContentShareModule } from '../../btn-content-share/btn-content-share.module'
import { BtnGoalsModule } from '../../btn-goals/btn-goals.module'
import { BtnPlaylistModule } from '../../btn-playlist/btn-playlist.module'
import { DisplayContentTypeModule } from '../../_common/display-content-type/display-content-type.module'
import { UserImageModule } from '../../_common/user-image/user-image.module'
import { BtnContentFeedbackV2Module } from '../../btn-content-feedback-v2/btn-content-feedback-v2.module'
import { UserContentRatingModule } from '../../_common/user-content-rating/user-content-rating.module'
import { PlayerBriefModule } from '../../_common/player-brief/player-brief.module'

@NgModule({
  declarations: [ResourceCollectionComponent],
  imports: [
    CommonModule,
    ResourceCollectionRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatPaginatorModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    PluginResourceCollectionModule,
    PluginWebModuleModule,
    BtnContentDownloadModule,
    BtnContentFeedbackModule,
    BtnContentLikeModule,
    BtnContentShareModule,
    BtnGoalsModule,
    BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    UserContentRatingModule,
    BtnContentFeedbackV2Module,
    PlayerBriefModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    SbUiResolverModule,
  ],
  exports: [
    ResourceCollectionComponent,
  ],
})
export class ResourceCollectionModule { }
