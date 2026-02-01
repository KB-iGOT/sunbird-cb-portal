import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule, TitleCasePipe } from '@angular/common'

import { GyaanKarmayogiRoutingModule } from './gyaan-karmayogi-routing.module'
import { GyaanKarmayogiHomeComponent } from './components/gyaan-karmayogi-home/gyaan-karmayogi-home.component'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { HttpClient } from '@angular/common/http'
import { GyaanPlayerComponent } from './components/gyaan-player/gyaan-player.component'
import { GyaanKarmayogiComponent } from './gyaan-karmayogi.component'
import { GyaanKarmayogiViewAllComponent } from './components/gyaan-karmayogi-view-all/gyaan-karmayogi-view-all.component'
import { DefaultThumbnailModule, PipePublicURLModule } from '@sunbird-cb/utils-v2'

import { GyaanKarmayogiService } from './services/gyaan-karmayogi.service'
import { PdfComponent } from './components/players/pdf/pdf.component'
import { GyaanVideoComponent } from './components/players/gyaan-video/gyaan-video.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ShareTocModule } from '../app-toc/share-toc/share-toc.module'
import { GyaanFilterComponent } from './components/gyaan-filter/gyaan-filter.component'
import { GyaanAudioComponent } from './components/players/gyaan-audio/gyaan-audio.component'
import { GyaanYoutubeComponent } from './components/players/gyaan-youtube/gyaan-youtube.component'
import { InfiniteScrollModule } from 'ngx-infinite-scroll'
import { ReplaceNbspTextPipe } from './pipes/replace-nbsp-text.pipe'
import { MatBottomSheetModule, MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSliderModule } from '@angular/material/slider'
import { MatTabsModule } from '@angular/material/tabs'

import { NgxSliderModule } from '@angular-slider/ngx-slider'
import { HorizontalScrollerV2Module } from '@sunbird-cb/consumption'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { YoutubeModule } from '../youtube/youtube.module'
import { AudioModule } from '../audio/audio.module'
import { PdfScormDataService } from '../pdf-scorm-data-service'
import { PdfModule } from '../pdf/pdf.module'
import { VideoModule } from '../video/video.module'
import { ViewerDataService } from '../viewer-data.service'
import { ViewerResolve } from '../viewer.resolve'
import { ContentStripWithTabsModule } from '../content-strip-with-tabs/content-strip-with-tabs.module'
import { CardContentV2Module } from '../card-content-v2/card-content-v2.module'
import { SkeletonLoaderModule } from '../_common/skeleton-loader/skeleton-loader.module'
import { BtnPageBackModule } from '../btn-page-back/btn-page-back.module'
import { SlidersModule } from '../sliders/sliders.module'

import { HttpLoaderFactory } from './../_services/http-loader.factory'
@NgModule({
  declarations: [GyaanKarmayogiHomeComponent, GyaanPlayerComponent,
    GyaanKarmayogiComponent, GyaanKarmayogiViewAllComponent,
    PdfComponent, GyaanVideoComponent, GyaanFilterComponent, GyaanAudioComponent, GyaanYoutubeComponent, ReplaceNbspTextPipe],
  imports: [NgxSliderModule,
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    GyaanKarmayogiRoutingModule,
    DefaultThumbnailModule,
    ContentStripWithTabsModule,
    MatCheckboxModule,
    CardContentV2Module,
    PdfModule,
    VideoModule,
    AudioModule,
    YoutubeModule,
    MatSidenavModule,
    ReactiveFormsModule,
    SkeletonLoaderModule,
    BtnPageBackModule,
    ShareTocModule,
    MatBottomSheetModule,
    MatRadioModule,
    InfiniteScrollModule,
    MatSliderModule,
    MatTabsModule,
    HorizontalScrollerV2Module,
    SlidersModule,
    PipePublicURLModule,
    SbUiResolverModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [{ provide: MAT_BOTTOM_SHEET_DATA, useValue: {} },
  { provide: MatBottomSheetRef, useValue: {} },
    ViewerResolve, TitleCasePipe,
    PdfScormDataService, GyaanKarmayogiService,
    ViewerDataService],
})
export class GyaanKarmayogiModule { }
