import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import {
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
  MatSnackBarModule,
  MatTabsModule,
} from '@angular/material'

import { ViewerRoutingModule } from './viewer-routing.module'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  DefaultThumbnailModule,
  PipePartialContentModule,
  PipePublicURLModule,
} from '@sunbird-cb/utils'

import {
  ErrorResolverModule,
  BtnPageBackModule,
  BtnFullscreenModule,
  DisplayContentTypeModule,
  BtnContentDownloadModule,
  BtnContentLikeModule,
  BtnContentShareModule,
  BtnGoalsModule,
  BtnPlaylistModule,
  BtnContentFeedbackModule,
  DisplayContentTypeIconModule,
  BtnContentFeedbackV2Module,
  PlayerBriefModule,
} from '@sunbird-cb/collection'

import { WidgetResolverModule } from '@sunbird-cb/resolver'
import { ViewerComponent } from './viewer.component'
import { ViewerTocComponent } from './components/viewer-toc/viewer-toc.component'
import { ViewerTopBarModule } from './components/viewer-top-bar/viewer-top-bar.module'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { HttpClient } from '@angular/common/http'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'

// tslint:disable-next-line:function-name
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http)
}

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
    MatSnackBarModule,
    ViewerRoutingModule,
    ErrorResolverModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePublicURLModule,
    DefaultThumbnailModule,
    BtnPageBackModule,
    BtnFullscreenModule,
    WidgetResolverModule,
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
  ],
})
export class ViewerModule { }
