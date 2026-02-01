import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { ViewerRoutingModule } from './viewer-routing.module'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  DefaultThumbnailModule,
  PipePartialContentModule,
  PipePublicURLModule,
  DomainConfService,
} from '@sunbird-cb/utils-v2'



import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { ViewerComponent } from './viewer.component'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { HttpClient } from '@angular/common/http'
import { HttpLoaderFactory } from './_services/http-loader.factory'




import { PdfScormDataService } from './pdf-scorm-data-service'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTreeModule } from '@angular/material/tree'
// import { AiTutorComponent } from './components/ai-tutor/ai-tutor.component'
import { FormsModule } from '@angular/forms'
import { MatSelectModule } from '@angular/material/select'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MarkdownModule } from 'ngx-markdown'
import { ViewerTocComponent } from './viewer-toc/viewer-toc.component'
import { ViewerTopBarModule } from './viewer-top-bar/viewer-top-bar.module'
import { ViewerSecondaryTopBarModule } from './viewer-secondary-top-bar/viewer-secondary-top-bar.module'
import { ErrorResolverModule } from './error-resolver/error-resolver.module'
import { BtnPageBackModule } from './btn-page-back/btn-page-back.module'
import { BtnFullscreenModule } from './btn-fullscreen/btn-fullscreen.module'
import { DisplayContentTypeModule } from './_common/display-content-type/display-content-type.module'
import { BtnContentDownloadModule } from './btn-content-download/btn-content-download.module'
import { BtnContentLikeModule } from './btn-content-like/btn-content-like.module'
import { BtnContentShareModule } from './btn-content-share/btn-content-share.module'
import { BtnGoalsModule } from './btn-goals/btn-goals.module'
import { BtnPlaylistModule } from './btn-playlist/btn-playlist.module'
import { BtnContentFeedbackModule } from './btn-content-feedback/btn-content-feedback.module'
import { BtnContentFeedbackV2Module } from './btn-content-feedback-v2/btn-content-feedback-v2.module'
import { DisplayContentTypeIconModule } from './_common/display-content-type-icon/display-content-type-icon.module'
import { SkeletonLoaderModule } from './_common/skeleton-loader/skeleton-loader.module'
import { PlayerBriefModule } from './_common/player-brief/player-brief.module'
import { ContentProgressModule } from './_common/content-progress/content-progress.module'
import { ContentTocModule } from './_common/content-toc/content-toc.module'

@NgModule({
  declarations: [ViewerComponent, ViewerTocComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatListModule,
    MatTreeModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    ViewerRoutingModule,
    ErrorResolverModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePublicURLModule,
    DefaultThumbnailModule,
    BtnPageBackModule,
    BtnFullscreenModule,
    SbUiResolverModule,
    DisplayContentTypeModule,
    BtnContentDownloadModule,
    BtnContentLikeModule,
    BtnContentShareModule,
    BtnGoalsModule,
    BtnPlaylistModule,
    BtnContentFeedbackModule,
    BtnContentFeedbackV2Module,
    DisplayContentTypeIconModule,
    PipePartialContentModule,
    SkeletonLoaderModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    MatTabsModule,
    PlayerBriefModule,
    ViewerTopBarModule,
    ViewerSecondaryTopBarModule,
    ContentProgressModule,
    ContentTocModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MarkdownModule.forRoot()
  ],
  providers: [PdfScormDataService, DomainConfService],
})
export class ViewerModule { }
