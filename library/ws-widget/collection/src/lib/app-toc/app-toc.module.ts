import { NgModule } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { AppTocRoutingModule } from './app-toc-routing.module'
import { NgCircleProgressModule } from 'ng-circle-progress'
import { TranslateModule } from '@ngx-translate/core'
import { InfiniteScrollModule } from 'ngx-infinite-scroll'

// custom modules
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { DiscussionUiModule } from '@sunbird-cb/discussions-ui-v8'
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

import { AppTocCertificationModule } from './routes/app-toc-certification/app-toc-certification.module'
import { ShareTocModule } from './share-toc/share-toc.module'

// Components
import { AppTocAnalyticsComponent } from './routes/app-toc-analytics/app-toc-analytics.component'
import { AppTocContentsComponent } from './routes/app-toc-contents/app-toc-contents.component'
// import { AppTocHomeComponent } from './components/app-toc-home/app-toc-home.component'
import { AppTocHomeComponent as AppTocHomeRootComponent } from './components/app-toc-home/app-toc-home.component'
import { AppTocOverviewComponent } from './components/app-toc-overview/app-toc-overview.component'
import { AppTocBannerComponent } from './components/app-toc-banner/app-toc-banner.component'
import { AppTocCohortsComponent } from './components/app-toc-cohorts/app-toc-cohorts.component'
import { AppTocContentCardComponent } from './components/app-toc-content-card/app-toc-content-card.component'
import { AppTocDiscussionComponent } from './components/app-toc-discussion/app-toc-discussion.component'
import { AppTocDialogIntroVideoComponent } from './components/app-toc-dialog-intro-video/app-toc-dialog-intro-video.component'
import { AppTocOverviewComponent as AppTocOverviewRootComponent } from './routes/app-toc-overview/app-toc-overview.component'
import { AppTocCohortsComponent as AppTocCohortsRootComponent } from './routes/app-toc-cohorts/app-toc-cohorts.component'
import { AppTocAnalyticsTilesComponent } from './components/app-toc-analytics-tiles/app-toc-analytics-tiles.component'
import { KnowledgeArtifactDetailsComponent } from './components/knowledge-artifact-details/knowledge-artifact-details.component'
import { AppTocSinglePageComponent as AppTocSinglePageRootComponent } from './routes/app-toc-single-page/app-toc-single-page.component'
import { AppTocSinglePageComponent } from './components/app-toc-single-page/app-toc-single-page.component'
import { CreateBatchDialogComponent } from './components/create-batch-dialog/create-batch-dialog.component'
import { AllDiscussionWidgetComponent } from '../discuss/widget/all-discussion-widget/category-widget/all-discussion-widget.component'
import { AppTocSessionsComponent } from './components/app-toc-sessions/app-toc-sessions.component'
import { AppTocSessionCardComponent } from './components/app-toc-session-card/app-toc-session-card.component'
import { EnrollQuestionnaireComponent } from './components/enroll-questionnaire/enroll-questionnaire.component'
import { TagWidgetComponent } from '../discuss/widget/tag-widget/tag-widget.component'

// Services
import { AppTocService } from './services/app-toc.service'
import { ProfileResolverService } from './resolvers/profile-resolver.service'
import { CertificationApiService } from './routes/app-toc-certification/apis/certification-api.service'
import { ActionService } from './services/action.service'

// Resolver
import { CertificationMetaResolver } from './routes/app-toc-certification/resolvers/certification-meta.resolver'
import { ContentCertificationResolver } from './routes/app-toc-certification/resolvers/content-certification.resolver'

// Directives
import { AppTocOverviewDirective } from './routes/app-toc-overview/app-toc-overview.directive'
import { AppTocHomeDirective } from './routes/app-toc-home/app-toc-home.directive'
import { AppTocCohortsDirective } from './routes/app-toc-cohorts/app-toc-cohorts.directive'
import { AppTocSinglePageDirective } from './routes/app-toc-single-page/app-toc-single-page.directive'
import { AppTocCiosHomeComponent } from './components/app-toc-cios-home/app-toc-cios-home.component'
import { CommonMethodsService, ContentLanguageService, DialogComponentsModule, TOCMultiLingualDialogModule } from '@sunbird-cb/consumption'
import { UserProfileService } from '../user-profile/services/user-profile.service'
import { OtpService } from '../user-profile/services/otp.services'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
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

import { EnrollProfileFormComponent } from './components/enroll-profile-form/enroll-profile-form.component'
import { SurveyFormQuestionComponent } from './components/survey-form-question/survey-form-question.component'
import { SurveyFormSectionComponent } from './components/survey-form-section/survey-form-section.component'
import { NonReleventFeedbackDialogModule } from '../_common/non-relevent-feedback-dialog/non-relevent-feedback-dialog.module'
import { AppTocContentReadResolverService } from './resolvers/app-toc-content-read-resolver.service'
import { AppTocHomeV2Component } from './components/app-toc-home-v2/app-toc-home-v2.component'
import { EnrollLanguageDialogueComponent } from './components/enroll-language-dialogue/enroll-language-dialogue.component'
import { CompletionSurveyFormComponent } from './components/completion-survey-form/completion-survey-form.component'
import { PublicSurveyFormComponent } from './components/public-survey-form/public-survey-form.component'
import { ConsentDialogComponent } from './components/app-toc-cios-home/consent-dialog.component'
import { ApiService } from '../modules/shared/services/api.service'
import { EditorService } from '../routing/modules/editor/services/editor.service'
import { AccessControlService } from '../_common/ck-editor/services/access-control.service'
import { MicroSurveyModule } from '@sunbird-cb/micro-surveys'
import { DisplayContentTypeModule } from '../_common/display-content-type/display-content-type.module'
import { DisplayContentTypeIconModule } from '../_common/display-content-type-icon/display-content-type-icon.module'
import { PipeContentRouteModule } from '../_common/pipe-content-route/pipe-content-route.module'
import { BtnCallModule } from '../btn-call/btn-call.module'
import { BtnContentDownloadModule } from '../btn-content-download/btn-content-download.module'
import { BtnContentLikeModule } from '../btn-content-like/btn-content-like.module'
import { BtnContentFeedbackModule } from '../btn-content-feedback/btn-content-feedback.module'
import { BtnContentFeedbackV2Module } from '../btn-content-feedback-v2/btn-content-feedback-v2.module'
import { ContentRatingV2DialogModule } from '../_common/content-rating-v2-dialog/content-rating-v2-dialog.module'
import { RatingSummaryModule } from '../_common/rating-summary/rating-summary.module'
import { CertificateDialogModule } from '../_common/certificate-dialog/certificate-dialog.module'
import { ConfirmDialogModule } from '../_common/confirm-dialog/confirm-dialog.module'
import { BtnGoalsModule } from '../btn-goals/btn-goals.module'
import { SkeletonLoaderModule } from '../_common/skeleton-loader/skeleton-loader.module'
import { BtnPlaylistModule } from '../btn-playlist/btn-playlist.module'
import { BtnMailUserModule } from '../btn-mail-user/btn-mail-user.module'
import { BtnPageBackModule } from '../btn-page-back/btn-page-back.module'
import { UserImageModule } from '../_common/user-image/user-image.module'
import { ContentProgressModule } from '../_common/content-progress/content-progress.module'
import { UserContentRatingModule } from '../_common/user-content-rating/user-content-rating.module'
import { BtnKbModule } from '../btn-kb/btn-kb.module'
import { MarkAsCompleteModule } from '../_common/mark-as-complete/mark-as-complete.module'
import { PlayerBriefModule } from '../_common/player-brief/player-brief.module'
import { CardContentModule } from '../card-content/card-content.module'
import { CardContentV2Module } from '../card-content-v2/card-content-v2.module'
import { BtnContentShareModule } from '../btn-content-share/btn-content-share.module'
import { UserAutocompleteModule } from '../_common/user-autocomplete/user-autocomplete.module'
import { AvatarPhotoModule } from '../_common/avatar-photo/avatar-photo.module'
import { ConnectionNameModule } from '../_common/connection-name/connection-name.module'
import { CardRatingCommentModule } from '../card-rating-comment/card-rating-comment.module'
import { AttendanceHelperModule } from '../_common/attendance-helper/attendance-helper.module'
import { AttendanceCardModule } from '../_common/attendance-card/attendance-card.module'
import { ContentTocModule } from '../_common/content-toc/content-toc.module'
import { TocKpiValuesModule } from '../_common/content-toc/toc-kpi-values/toc-kpi-values.module'
import { KarmaPointsModule } from '../_common/content-toc/karma-points/karma-points.module'
import { TipsForLearnerModule } from '../_common/tips-for-learner/tips-for-learner.module'
import { SlidersDynamicModule } from '../sliders-dynamic/sliders-dynamic.module'
import { PipeContentRoutePipe } from '../_common/pipe-content-route/pipe-content-route.pipe'
import { AppPublicTocResolverService } from '../_services/app-public-toc-resolver.service'

@NgModule({
  declarations: [
    AppTocAnalyticsComponent,
    AppTocContentsComponent,
    AppTocHomeV2Component,
    // AppTocHomeComponent,
    AppTocOverviewComponent,
    AppTocBannerComponent,
    AppTocCohortsComponent,
    AppTocContentCardComponent,
    AppTocDiscussionComponent,
    AppTocDialogIntroVideoComponent,
    AppTocOverviewDirective,
    AppTocOverviewRootComponent,
    AppTocHomeDirective,
    AppTocHomeRootComponent,
    AppTocCohortsDirective,
    AppTocCohortsRootComponent,
    KnowledgeArtifactDetailsComponent,
    AppTocAnalyticsTilesComponent,
    AppTocSinglePageComponent,
    AppTocSinglePageRootComponent,
    AppTocSinglePageDirective,
    CreateBatchDialogComponent,
    AllDiscussionWidgetComponent,
    TagWidgetComponent,
    AppTocSessionsComponent,
    AppTocSessionCardComponent,
    EnrollQuestionnaireComponent,
    EnrollProfileFormComponent,
    AppTocCiosHomeComponent,
    ConsentDialogComponent,
    EnrollLanguageDialogueComponent,
    CompletionSurveyFormComponent,
    PublicSurveyFormComponent,
    SurveyFormQuestionComponent,
    SurveyFormSectionComponent
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
    FormsModule,
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
    MatChipsModule,
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
    SbUiResolverModule,
    ContentProgressModule,
    UserContentRatingModule,
    BtnKbModule,
    AppTocCertificationModule,
    MarkAsCompleteModule,
    PlayerBriefModule,
    MatProgressSpinnerModule,
    CardContentModule,
    CardContentV2Module,
    BtnContentShareModule,
    UserAutocompleteModule,
    AvatarPhotoModule,
    DiscussionUiModule,
    ConnectionNameModule,
    CardRatingCommentModule,
    InfiniteScrollModule,
    AttendanceHelperModule,
    AttendanceCardModule,
    MicroSurveyModule,
    MatChipsModule,
    MatAutocompleteModule,
    ContentTocModule,
    NgCircleProgressModule.forRoot({}),
    ShareTocModule,
    TocKpiValuesModule,
    KarmaPointsModule,
    TipsForLearnerModule,
    ReactiveFormsModule,
    WidgetCommentModule,
    SlidersDynamicModule,
    NonReleventFeedbackDialogModule,
    TranslateModule
  ],
  providers: [
    AppTocContentReadResolverService,
    AppPublicTocResolverService,
    AppTocService,
    PipeContentRoutePipe,
    CertificationApiService,
    CertificationMetaResolver,
    ContentCertificationResolver,
    EditorService,
    ApiService,
    AccessControlService,
    ProfileResolverService,
    ActionService,
    MultilingualTranslationsService,
    CommonMethodsService,
    UserProfileService,
    OtpService,
    ContentLanguageService,
    TOCMultiLingualDialogModule,
    DatePipe,
    DialogComponentsModule
  ],
  exports: [
    AppTocDiscussionComponent,
    AppTocSinglePageComponent,
    AppTocBannerComponent,
    AppTocHomeRootComponent,
    AppTocHomeV2Component,
    // AppTocHomeComponent,
    ShareTocModule,
    AppTocCiosHomeComponent,
  ]
})
export class AppTocModule { }
