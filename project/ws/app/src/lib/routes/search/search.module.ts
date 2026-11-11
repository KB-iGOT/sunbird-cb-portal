import { CommonModule } from '@angular/common'
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { BtnChannelAnalyticsModule } from '@sunbird-cb/collection/src/lib/btn-channel-analytics/btn-channel-analytics.module'
import { BtnContentDownloadModule } from '@sunbird-cb/collection/src/lib/btn-content-download/btn-content-download.module'
import { BtnContentLikeModule } from '@sunbird-cb/collection/src/lib/btn-content-like/btn-content-like.module'
import { BtnContentMailMeModule } from '@sunbird-cb/collection/src/lib/btn-content-mail-me/btn-content-mail-me.module'
import { BtnContentShareModule } from '@sunbird-cb/collection/src/lib/btn-content-share/btn-content-share.module'
import { BtnGoalsModule } from '@sunbird-cb/collection/src/lib/btn-goals/btn-goals.module'
import { BtnKbModule } from '@sunbird-cb/collection/src/lib/btn-kb/btn-kb.module'
import { BtnPageBackModule } from '@sunbird-cb/collection/src/lib/btn-page-back/btn-page-back.module'
import { BtnPlaylistModule } from '@sunbird-cb/collection/src/lib/btn-playlist/btn-playlist.module'
import { DisplayContentTypeModule } from '@sunbird-cb/collection/src/lib/_common/display-content-type/display-content-type.module'
import { PipeContentRouteModule } from '@sunbird-cb/collection/src/lib/_common/pipe-content-route/pipe-content-route.module'
import { BtnKbAnalyticsModule } from '@sunbird-cb/collection/src/lib/btn-kb-analytics/btn-kb-analytics.module'
import { UserAutocompleteModule } from '@sunbird-cb/collection/src/lib/_common/user-autocomplete/user-autocomplete.module'
import { WidgetResolverModule } from '@sunbird-cb/resolver'
import {
  DefaultThumbnailModule,
  HorizontalScrollerModule, PipeDurationTransformModule, PipeLimitToModule, PipePartialContentModule,
} from '@sunbird-cb/utils-v2'
import { BlogsCardComponent } from './components/blogs-card/blogs-card.component'
import { FilterDisplayComponent } from './components/filter-display/filter-display.component'
import { ItemTileComponent } from './components/item-tile/item-tile.component'
import { LearningCardComponent } from './components/learning-card/learning-card.component'
import { QandaCardComponent } from './components/qanda-card/qanda-card.component'
import { SearchInputComponent } from './components/search-input/search-input.component'
import { HomeComponent } from './routes/home/home.component'
import { KnowledgeComponent } from './routes/knowledge/knowledge.component'
import { LearningComponent } from './routes/learning/learning.component'
import { ProjectComponent } from './routes/project/project.component'
import { SearchRootComponent } from './routes/search-root/search-root.component'
import { SocialComponent } from './routes/social/social.component'
import { SearchRoutingModule } from './search-routing.module'
import { PeopleComponent } from './routes/people/people.component'
import { SearchInputHomeComponent } from './components/search-input-home/search-input-home.component'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatChipsModule } from '@angular/material/chips'
import { MatRippleModule } from '@angular/material/core'
import { MatOptionModule } from '@angular/material/core'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { TranslateModule } from '@ngx-translate/core'
import { SearchV3Module } from '../search-v3/search-v3.module'
import { SearchInputHomeV4Component } from '../search-v3/components/search-input-home-v4/search-input-home-v4.component'

@NgModule({
  declarations: [
    SearchRootComponent,
    SearchInputComponent,
    SearchInputHomeComponent,
    LearningComponent,
    BlogsCardComponent,
    FilterDisplayComponent,
    ItemTileComponent,
    KnowledgeComponent,
    LearningCardComponent,
    ProjectComponent,
    QandaCardComponent,
    SocialComponent,
    HomeComponent,
    PeopleComponent,
  ],
  imports: [
    CommonModule,
    SearchRoutingModule,
    BtnPageBackModule,
    MatToolbarModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatCardModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSidenavModule,
    MatRippleModule,
    DefaultThumbnailModule,
    MatTooltipModule,
    PipeContentRouteModule,
    PipeLimitToModule,
    PipeDurationTransformModule,
    BtnContentDownloadModule,
    BtnContentLikeModule,
    BtnContentShareModule,
    BtnPlaylistModule,
    BtnGoalsModule,
    BtnContentMailMeModule,
    BtnKbAnalyticsModule,
    PipePartialContentModule,
    HorizontalScrollerModule,
    MatProgressSpinnerModule,
    DisplayContentTypeModule,
    WidgetResolverModule,
    BtnKbModule,
    BtnChannelAnalyticsModule,
    MatDividerModule,
    UserAutocompleteModule,
    TranslateModule,
    SearchV3Module,
    SearchInputHomeV4Component,
  ],
  exports: [ItemTileComponent, SearchInputComponent, SearchInputHomeComponent],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SearchModule { }
