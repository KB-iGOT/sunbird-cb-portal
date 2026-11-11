import { NgModule } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { AppTocRoutingModule } from './app-toc-routing.module'
import { NgCircleProgressModule } from 'ng-circle-progress'
import { TranslateModule } from '@ngx-translate/core'
import { InfiniteScrollModule } from 'ngx-infinite-scroll'

// custom modules
import { WidgetResolverModule } from '@sunbird-cb/resolver'
import {
  PipeDurationTransformModule,
  PipeSafeSanitizerModule,
  PipeLimitToModule,
  PipePartialContentModule,
  HorizontalScrollerModule,
  DefaultThumbnailModule,
  PipeNameTransformModule,
  PipeCountTransformModule,
  PipeFilterV3Module,
  PipeRelativeTimeModule,
  PipePublicURLModule,
  MultilingualTranslationsService,
} from '@sunbird-cb/utils-v2'
import { BtnCallModule } from '@sunbird-cb/collection/src/lib/btn-call/btn-call.module'
import { BtnContentDownloadModule } from '@sunbird-cb/collection/src/lib/btn-content-download/btn-content-download.module'
import { BtnContentLikeModule } from '@sunbird-cb/collection/src/lib/btn-content-like/btn-content-like.module'
import { BtnContentShareModule } from '@sunbird-cb/collection/src/lib/btn-content-share/btn-content-share.module'
import { BtnContentFeedbackModule } from '@sunbird-cb/collection/src/lib/btn-content-feedback/btn-content-feedback.module'
import { BtnContentFeedbackV2Module } from '@sunbird-cb/collection/src/lib/btn-content-feedback-v2/btn-content-feedback-v2.module'
import { BtnGoalsModule } from '@sunbird-cb/collection/src/lib/btn-goals/btn-goals.module'
import { BtnMailUserModule } from '@sunbird-cb/collection/src/lib/btn-mail-user/btn-mail-user.module'
import { BtnPageBackModule } from '@sunbird-cb/collection/src/lib/btn-page-back/btn-page-back.module'
import { UserImageModule } from '@sunbird-cb/collection/src/lib/_common/user-image/user-image.module'
import { DisplayContentTypeModule } from '@sunbird-cb/collection/src/lib/_common/display-content-type/display-content-type.module'
import { BtnPlaylistModule } from '@sunbird-cb/collection/src/lib/btn-playlist/btn-playlist.module'
import { DisplayContentTypeIconModule } from '@sunbird-cb/collection/src/lib/_common/display-content-type-icon/display-content-type-icon.module'
import { ContentProgressModule } from '@sunbird-cb/collection/src/lib/_common/content-progress/content-progress.module'
import { UserContentRatingModule } from '@sunbird-cb/collection/src/lib/_common/user-content-rating/user-content-rating.module'
import { PipeContentRouteModule } from '@sunbird-cb/collection/src/lib/_common/pipe-content-route/pipe-content-route.module'
import { PipeContentRoutePipe } from '@sunbird-cb/collection/src/lib/_common/pipe-content-route/pipe-content-route.pipe'
import { BtnKbModule } from '@sunbird-cb/collection/src/lib/btn-kb/btn-kb.module'
import { MarkAsCompleteModule } from '@sunbird-cb/collection/src/lib/_common/mark-as-complete/mark-as-complete.module'
import { PlayerBriefModule } from '@sunbird-cb/collection/src/lib/_common/player-brief/player-brief.module'
import { CardContentModule } from '@sunbird-cb/collection/src/lib/card-content/card-content.module'
import { UserAutocompleteModule } from '@sunbird-cb/collection/src/lib/_common/user-autocomplete/user-autocomplete.module'
import { AvatarPhotoModule } from '@sunbird-cb/collection/src/lib/_common/avatar-photo/avatar-photo.module'
import { ContentRatingV2DialogModule } from '@sunbird-cb/collection/src/lib/_common/content-rating-v2-dialog/content-rating-v2-dialog.module'
import { RatingSummaryModule } from '@sunbird-cb/collection/src/lib/_common/rating-summary/rating-summary.module'
import { CardRatingCommentModule } from '@sunbird-cb/collection/src/lib/card-rating-comment/card-rating-comment.module'
import { AttendanceHelperModule } from '@sunbird-cb/collection/src/lib/_common/attendance-helper/attendance-helper.module'
import { AttendanceCardModule } from '@sunbird-cb/collection/src/lib/_common/attendance-card/attendance-card.module'
import { NonReleventFeedbackDialogModule } from '@sunbird-cb/collection/src/lib/_common/non-relevent-feedback-dialog/non-relevent-feedback-dialog.module'
import { SkeletonLoaderModule } from '@sunbird-cb/collection/src/lib/_common/skeleton-loader/skeleton-loader.module'
import { ContentTocModule } from '@sunbird-cb/toc'
import { TocKpiValuesModule } from '@sunbird-cb/toc'
import { MicroSurveyModule } from '@sunbird-cb/micro-surveys'
import { CardContentV2Module } from '@sunbird-cb/collection/src/lib/card-content-v2/card-content-v2.module'
import { ConnectionNameModule } from '@sunbird-cb/collection/src/lib/_common/connection-name/connection-name.module'
import { CertificateDialogModule } from '@sunbird-cb/collection/src/lib/_common/certificate-dialog/certificate-dialog.module'
import { ConfirmDialogModule } from '@sunbird-cb/collection/src/lib/_common/confirm-dialog/confirm-dialog.module'
import { KarmaPointsModule } from '@sunbird-cb/toc'
import { TipsForLearnerModule } from '@sunbird-cb/collection/src/lib/_common/tips-for-learner/tips-for-learner.module'

// Services
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { EditorService } from '@ws/author/src/lib/routing/modules/editor/services/editor.service'
import { AppPublicTocResolverService } from '../../routes/services/app-public-toc-resolver.service'

// Resolver

// Directives
import { CommonMethodsService, ContentLanguageService } from '@sunbird-cb/consumption'
import { UserProfileService } from '../user-profile/services/user-profile.service'
import { OtpService } from '../user-profile/services/otp.services'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatChipsModule } from '@angular/material/chips'
import { MatNativeDateModule } from '@angular/material/core'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { WidgetCommentModule } from '@sunbird-cb/discussion-v2'
import { SlidersDynamicModule } from '@sunbird-cb/collection/src/lib/sliders-dynamic/sliders-dynamic.module'
import { TocHomeComponent } from './toc-home/toc-home.component'
import { AppTocLibModule } from '@sunbird-cb/toc'
@NgModule({
  declarations: [
    TocHomeComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    AppTocRoutingModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatRadioModule,
    MatTabsModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSelectModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DisplayContentTypeModule,
    DisplayContentTypeIconModule,
    PipeDurationTransformModule,
    PipeSafeSanitizerModule,
    PipeLimitToModule,
    PipeNameTransformModule,
    PipeCountTransformModule,
    PipePartialContentModule,
    PipeFilterV3Module,
    PipeRelativeTimeModule,
    PipeContentRouteModule,
    PipePublicURLModule,
    BtnCallModule,
    BtnContentDownloadModule,
    BtnContentLikeModule,
    BtnContentFeedbackModule,
    BtnContentFeedbackV2Module,
    ContentRatingV2DialogModule,
    RatingSummaryModule,
    CertificateDialogModule,
    ConfirmDialogModule,
    BtnGoalsModule,
    SkeletonLoaderModule,
    BtnPlaylistModule,
    BtnMailUserModule,
    BtnPageBackModule,
    HorizontalScrollerModule,
    UserImageModule,
    DefaultThumbnailModule,
    WidgetResolverModule,
    ContentProgressModule,
    UserContentRatingModule,
    BtnKbModule,
    MarkAsCompleteModule,
    PlayerBriefModule,
    CardContentModule,
    CardContentV2Module,
    BtnContentShareModule,
    UserAutocompleteModule,
    AvatarPhotoModule,
    ConnectionNameModule,
    CardRatingCommentModule,
    InfiniteScrollModule,
    AttendanceHelperModule,
    AttendanceCardModule,
    MicroSurveyModule,
    ContentTocModule,
    NgCircleProgressModule.forRoot({}),
    TranslateModule,
    TocKpiValuesModule,
    KarmaPointsModule,
    TipsForLearnerModule,
    WidgetCommentModule,
    SlidersDynamicModule,
    NonReleventFeedbackDialogModule,
    AppTocLibModule,
  ],
  providers: [
    AppPublicTocResolverService,
    PipeContentRoutePipe,
    EditorService,
    ApiService,
    AccessControlService,
    MultilingualTranslationsService,
    CommonMethodsService,
    UserProfileService,
    OtpService,
    ContentLanguageService,
    DatePipe,
  ],
  exports: [
  ],
})
export class AppTocModule { }
