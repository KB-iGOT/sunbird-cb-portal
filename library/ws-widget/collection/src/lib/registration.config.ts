import { NsWidgetResolver } from '@sunbird-cb/resolver'
import { ROOT_WIDGET_CONFIG } from './collection.config'
// Components
import { BtnAppsComponent } from './btn-apps/btn-apps.component'
// Modules
import { AvatarPhotoModule } from './_common/avatar-photo/avatar-photo.module'
import { BtnAppsModule } from './btn-apps/btn-apps.module'
import { BtnCallComponent } from './btn-call/btn-call.component'
import { BtnCallModule } from './btn-call/btn-call.module'
import { BtnCatalogComponent } from './btn-catalog/btn-catalog.component'
import { BtnCatalogModule } from './btn-catalog/btn-catalog.module'
import { BtnChannelAnalyticsComponent } from './btn-channel-analytics/btn-channel-analytics.component'
import { BtnChannelAnalyticsModule } from './btn-channel-analytics/btn-channel-analytics.module'
import { BtnContentDownloadComponent } from './btn-content-download/btn-content-download.component'
import { BtnContentDownloadModule } from './btn-content-download/btn-content-download.module'
import { BtnContentFeedbackComponent } from './btn-content-feedback/btn-content-feedback.component'
import { BtnContentFeedbackModule } from './btn-content-feedback/btn-content-feedback.module'
import { BtnContentLikeComponent } from './btn-content-like/btn-content-like.component'
import { BtnContentLikeModule } from './btn-content-like/btn-content-like.module'
import { BtnContentMailMeComponent } from './btn-content-mail-me/btn-content-mail-me.component'
import { BtnContentMailMeModule } from './btn-content-mail-me/btn-content-mail-me.module'
import { BtnContentShareComponent } from './btn-content-share/btn-content-share.component'
import { BtnContentShareModule } from './btn-content-share/btn-content-share.module'
// import { BtnFeatureComponent } from './btn-feature/btn-feature.component'
// import { BtnFeatureModule } from './btn-feature/btn-feature.module'
import { BtnFullscreenComponent } from './btn-fullscreen/btn-fullscreen.component'
import { BtnFullscreenModule } from './btn-fullscreen/btn-fullscreen.module'
import { BtnGoalsComponent } from './btn-goals/btn-goals.component'
import { BtnGoalsModule } from './btn-goals/btn-goals.module'
import { BtnMailUserComponent } from './btn-mail-user/btn-mail-user.component'
import { BtnMailUserModule } from './btn-mail-user/btn-mail-user.module'
import { BtnPageBackComponent } from './btn-page-back/btn-page-back.component'
import { BtnPageBackNavModule } from './btn-page-back-nav/btn-page-back-nav.module'
import { BtnPageBackModule } from './btn-page-back/btn-page-back.module'
import { BtnPlaylistComponent } from './btn-playlist/btn-playlist.component'
import { BtnPlaylistModule } from './btn-playlist/btn-playlist.module'
import { BtnPreviewComponent } from './btn-preview/btn-preview.component'
import { BtnPreviewModule } from './btn-preview/btn-preview.module'
import { BtnSettingsComponent } from './btn-settings/btn-settings.component'
import { BtnSettingsModule } from './btn-settings/btn-settings.module'
import { CardBreadcrumbComponent } from './card-breadcrumb/card-breadcrumb.component'
import { CardBreadcrumbModule } from './card-breadcrumb/card-breadcrumb.module'
import { CardChannelComponent } from './card-channel/card-channel.component'
import { CardChannelModule } from './card-channel/card-channel.module'
// import { CardContentComponent } from './card-content/card-content.component'
// import { CardContentModule } from './card-content/card-content.module'
import { CardLearnComponent } from './card-learn/card-learn.component'
import { CardLearnModule } from './card-learn/card-learn.module'
import { CardWelcomeComponent } from './card-welcome/card-welcome.component'
import { CardNetworkComponent } from './card-network/card-network.component'
import { CardHubsListComponent } from './card-hubs-list/card-hubs-list.component'
import { CardWelcomeModule } from './card-welcome/card-welcome.module'
import { CardNetworkModule } from './card-network/card-network.module'
import { CardHomeNetworkModule } from './card-home-network/card-home-network.module'
import { CardHomeTopModule } from './card-home-top/card-home-top.module'
import { CardBrowseCourseModule } from './card-browse-course/card-browse-course.module'
import { ChannelHubComponent } from './channel-hub/channel-hub.component'
import { ChannelHubModule } from './channel-hub/channel-hub.module'

import { ContentStripMultipleComponent } from './content-strip-multiple/content-strip-multiple.component'
import { ContentStripNewMultipleComponent } from './content-strip-new-multiple/content-strip-new-multiple.component'
import { ContentStripMultipleModule } from './content-strip-multiple/content-strip-multiple.module'
import { ContentStripNewMultipleModule } from './content-strip-new-multiple/content-strip-new-multiple.module'
import { ContentStripSingleComponent } from './content-strip-single/content-strip-single.component'
import { ContentStripSingleModule } from './content-strip-single/content-strip-single.module'
import { ElementHtmlComponent } from './element-html/element-html.component'
import { ElementHtmlModule } from './element-html/element-html.module'
import { EmbeddedPageComponent } from './embedded-page/embedded-page.component'
import { EmbeddedPageModule } from './embedded-page/embedded-page.module'
import { ErrorResolverComponent } from './error-resolver/error-resolver.component'
import { ErrorResolverModule } from './error-resolver/error-resolver.module'
import { GalleryViewComponent } from './gallery-view/gallery-view.component'
import { GalleryViewModule } from './gallery-view/gallery-view.module'
import { GridLayoutComponent } from './grid-layout/grid-layout.component'
import { GridLayoutModule } from './grid-layout/grid-layout.module'
import { ImageMapResponsiveComponent } from './image-map-responsive/image-map-responsive.component'
import { ImageMapResponsiveModule } from './image-map-responsive/image-map-responsive.module'
import { IntranetSelectorComponent } from './intranet-selector/intranet-selector.component'
import { IntranetSelectorModule } from './intranet-selector/intranet-selector.module'
import { LayoutLinearComponent } from './layout-linear/layout-linear.component'
import { LayoutLinearModule } from './layout-linear/layout-linear.module'
import { LayoutTabComponent } from './layout-tab/layout-tab.component'
import { LayoutTabModule } from './layout-tab/layout-tab.module'
import { NetworkStripMultipleModule } from './network-strip-multiple/network-strip-multiple.module'
import { CarrierStripMultipleModule } from './carrier-strip-multiple/carrier-strip-multiple.module'
// import { ActivityStripMultipleModule } from './activity-strip-multiple/activity-strip-multiple.module'
import { NetworkStripMultipleComponent } from './network-strip-multiple/network-strip-multiple.component'
// import { ActivityStripMultipleComponent } from './activity-strip-multiple/activity-strip-multiple.component'
import { PageComponent } from './page/page.component'
import { PageModule } from './page/page.module'
import { ProfileAcademicsComponent } from './profile-v2/profile-academics/profile-academics.component'
import { ProfileAcademicsModule } from './profile-v2/profile-academics/profile-academics.module'
import { ProfileCareerComponent } from './profile-v2/profile-career/profile-career.component'
import { ProfileCareerModule } from './profile-v2/profile-career/profile-career.module'
import { ProfileCompetenciesComponent } from './profile-v2/profile-competencies/profile-competencies.component'
import { ProfileCompetenciesModule } from './profile-v2/profile-competencies/profile-competencies.module'
import { ProfileCretificationsComponent } from './profile-v2/profile-cretifications/profile-cretifications.component'
import { ProfileCretificationsModule } from './profile-v2/profile-cretifications/profile-cretifications.module'
import { ProfileCretificationsV2Component } from './profile-v2/profile-cretifications-v2/profile-cretifications-v2.component'
import { ProfileCretificationsV2Module } from './profile-v2/profile-cretifications-v2/profile-cretifications-v2.module'

import { ProfileDepartmentsComponent } from './profile-v2/profile-departments/profile-departments.component'
import { ProfileDepartmentsModule } from './profile-v2/profile-departments/profile-departments.module'
import { ProfileHobbiesModule } from './profile-v2/profile-hobbies/profile-hobbies.module'
import { ProfileHobbiesComponent } from './profile-v2/profile-hobbies/profile-hobbies.component'
import { PickerContentModule } from './picker-content/picker-content.module'
import { ReleaseNotesComponent } from './release-notes/release-notes.component'
import { ReleaseNotesModule } from './release-notes/release-notes.module'
import { SelectorResponsiveComponent } from './selector-responsive/selector-responsive.component'
import { SelectorResponsiveModule } from './selector-responsive/selector-responsive.module'
import { SlidersMobComponent } from './sliders-mob/sliders-mob.component'
import { SlidersMobModule } from './sliders-mob/sliders-mob.module'
import { SlidersComponent } from './sliders/sliders.component'
import { SlidersModule } from './sliders/sliders.module'
import { TreeCatalogComponent } from './tree-catalog/tree-catalog.component'
import { TreeCatalogModule } from './tree-catalog/tree-catalog.module'
import { TreeComponent } from './tree/tree.component'
import { TreeModule } from './tree/tree.module'
// import { ContentStripVerticalModule } from './content-strip-vertical/content-strip-vertical.module'
// import { ContentStripVerticalComponent } from './content-strip-vertical/content-strip-vertical.component'
import { CardNetworkHomeComponent } from './card-network-home/card-network-home.component'
import { CardBrowseCourseComponent } from './card-browse-course/card-browse-course.component'
import { CardHubsListModule } from './card-hubs-list/card-hubs-list.module'
import { CardNotifyModule } from './card-notify/card-notify.module'
import { CardNetworkHomeModule } from './card-network-home/card-network-home.module'
import { CardCourseComponent } from './card-course/card-course.component'
import { CardCourseModule } from './card-course/card-course.module'
import { CardCarrierHomeComponent } from './card-carrier-home/card-carrier-home.component'
import { CardCarrierHomeModule } from './card-carrier-home/card-carrier-home.module'
import { CarrierStripMultipleComponent } from './carrier-strip-multiple/carrier-strip-multiple.component'
import { DiscussStripMultipleComponent } from './discuss-strip-multiple/discuss-strip-multiple.component'
import { DiscussStripMultipleModule } from './discuss-strip-multiple/discuss-strip-multiple.module'
import { CardActivityComponent } from './card-activity/card-activity.component'
import { CardActivityModule } from './card-activity/card-activity.module'
import { BtnFeatureComponent } from './btn-feature/btn-feature.component'
import { BtnFeatureModule } from './btn-feature/btn-feature.module'
// import { ContentQualityCheckModule } from './content-quality-check/content-quality-check.module'
import { UIAdminTableModule } from './ui-admin-table/ui-admin-table.module'

import { LeftMenuModule } from './left-menu/left-menu.module'
import { LeftMenuComponent } from './left-menu/left-menu.component'
import { UIORGTableModule } from './ui-org-table/ui-org-table.module'

import { BreadcrumbsOrgModule } from './breadcrumbs-org/breadcrumbs-org.module'
import { CardNotifyComponent } from './card-notify/card-notify.component'
import { CardContentV2Component } from './card-content-v2/card-content-v2.component'
import { CardContentV2Module } from './card-content-v2/card-content-v2.module'
import { ContentStripWithTabsComponent } from './content-strip-with-tabs/content-strip-with-tabs.component'
import { ProfileKarmapointsModule } from './profile-v2/profile-karmapoints/profile-karmapoints.module'
import { ProfileKarmapointsComponent } from './profile-v2/profile-karmapoints/profile-karmapoints.component'
import { CardEventHubComponent } from './card-event-hub/card-event-hub.component'
import { CardEventHubModule } from './card-event-hub/card-event-hub.module'
import { CardCompetencyComponent } from './card-competency/card-competency.component'
import { CardCompetencyModule } from './card-competency/card-competency.module'
import { TipsForLearnerModule } from './_common/tips-for-learner/tips-for-learner.module'
import { SurveyFormModule } from './_common/survey-form-left-section/survey-form/survey-form.module'
import { BtnProfileV2Component } from '@sunbird-cb/consumption'


export const WIDGET_REGISTERED_MODULES = [
  AvatarPhotoModule,
  BtnAppsModule,
  BtnCallModule,
  BtnCatalogModule,
  BtnChannelAnalyticsModule,
  BtnContentDownloadModule,
  BtnContentFeedbackModule,
  BtnContentLikeModule,
  BtnContentMailMeModule,
  BtnContentShareModule,
  BtnFullscreenModule,
  BtnGoalsModule,
  BtnMailUserModule,
  BtnPageBackNavModule,
  BtnPageBackModule,
  BtnPlaylistModule,
  BtnPreviewModule,
  BtnSettingsModule,
  CardBreadcrumbModule,
  // CardContentModule,
  CardContentV2Module,
  CardChannelModule,
  CardLearnModule,
  CardWelcomeModule,
  CardNetworkModule,
  ChannelHubModule,
  CardHomeNetworkModule,
  CardHomeTopModule,
  CardBrowseCourseModule,
  ContentStripMultipleModule,
  ContentStripNewMultipleModule,
  ContentStripSingleModule,
  // ContentStripVerticalModule,
  LayoutLinearModule,
  LayoutTabModule,
  NetworkStripMultipleModule,
  PickerContentModule,
  ReleaseNotesModule,
  SlidersModule,
  ElementHtmlModule,
  TreeModule,
  TreeCatalogModule,
  PageModule,
  ProfileAcademicsModule,
  ProfileCareerModule,
  ProfileCompetenciesModule,
  ProfileCretificationsModule,
  ProfileCretificationsV2Module,
  ProfileDepartmentsModule,
  ProfileHobbiesModule,
  ProfileKarmapointsModule,
  EmbeddedPageModule,
  SelectorResponsiveModule,
  GridLayoutModule,
  ErrorResolverModule,
  BtnFeatureModule,
  GalleryViewModule,
  ImageMapResponsiveModule,
  IntranetSelectorModule,
  SlidersMobModule,
  CardHubsListModule,
  CardNotifyModule,
  CardNetworkHomeModule,
  CardCourseModule,
  CardCarrierHomeModule,
  CarrierStripMultipleModule,
  DiscussStripMultipleModule,
  CardActivityModule,
  // ActivityStripMultipleModule,
  UIAdminTableModule,
  LeftMenuModule,
  UIORGTableModule,
  BreadcrumbsOrgModule,
  CardEventHubModule,
  CardCompetencyModule,
  TipsForLearnerModule,
  SurveyFormModule,
]

export const WIDGET_REGISTRATION_CONFIG: NsWidgetResolver.IRegistrationConfig[] = [
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.apps,
    component: BtnAppsComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.call,
    component: BtnCallComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.catalog,
    component: BtnCatalogComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.channelAnalytics,
    component: BtnChannelAnalyticsComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.contentDownload,
    component: BtnContentDownloadComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.contentFeedback,
    component: BtnContentFeedbackComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.contentLike,
    component: BtnContentLikeComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.contentMailMe,
    component: BtnContentMailMeComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.contentShare,
    component: BtnContentShareComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.fullscreen,
    component: BtnFullscreenComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.goals,
    component: BtnGoalsComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.mailUser,
    component: BtnMailUserComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.pageBack,
    component: BtnPageBackComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.playlist,
    component: BtnPlaylistComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.preview,
    component: BtnPreviewComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.newProfile,
    component: BtnProfileV2Component,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.setting,
    component: BtnSettingsComponent,
  },

  {
    widgetType: ROOT_WIDGET_CONFIG.card._type,
    widgetSubType: ROOT_WIDGET_CONFIG.card.breadcrumb,
    component: CardBreadcrumbComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.card._type,
    widgetSubType: ROOT_WIDGET_CONFIG.card.channel,
    component: CardChannelComponent,
  },
  // {
  //   widgetType: ROOT_WIDGET_CONFIG.card._type,
  //   widgetSubType: ROOT_WIDGET_CONFIG.card.content,
  //   component: CardContentComponent,
  // },
  {
    widgetType: ROOT_WIDGET_CONFIG.card._type,
    widgetSubType: ROOT_WIDGET_CONFIG.card.content,
    component: CardContentV2Component,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.card._type,
    widgetSubType: ROOT_WIDGET_CONFIG.card.learning,
    component: CardLearnComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.card._type,
    widgetSubType: ROOT_WIDGET_CONFIG.card.welcome,
    component: CardWelcomeComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.card._type,
    widgetSubType: ROOT_WIDGET_CONFIG.card.network,
    component: CardNetworkComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.card._type,
    widgetSubType: ROOT_WIDGET_CONFIG.card.home_activity,
    component: CardActivityComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.card._type,
    widgetSubType: ROOT_WIDGET_CONFIG.card.browse_course,
    component: CardBrowseCourseComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.card._type,
    widgetSubType: ROOT_WIDGET_CONFIG.card.home_network,
    component: CardNetworkHomeComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.channelHub._type,
    widgetSubType: ROOT_WIDGET_CONFIG.channelHub.channelHub,
    component: ChannelHubComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.contentStrip._type,
    widgetSubType: ROOT_WIDGET_CONFIG.contentStrip.multiStrip,
    component: ContentStripMultipleComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.contentStrip._type,
    widgetSubType: ROOT_WIDGET_CONFIG.contentStrip.multiStripNew,
    component: ContentStripNewMultipleComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.contentStrip._type,
    widgetSubType: ROOT_WIDGET_CONFIG.contentStrip.stripWithTabs,
    component: ContentStripWithTabsComponent,
  },
  // {
  //   widgetType: ROOT_WIDGET_CONFIG.contentStrip._type,
  //   widgetSubType: ROOT_WIDGET_CONFIG.contentStrip.verticalStrip,
  //   component: ContentStripVerticalComponent,
  // },
  {
    widgetType: ROOT_WIDGET_CONFIG.contentStrip._type,
    widgetSubType: ROOT_WIDGET_CONFIG.contentStrip.singleStrip,
    component: ContentStripSingleComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.graph._type,
    widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
    // lazy: keeps this player's libraries (pdf.js, video.js, ...) out of the initial bundle
    loadComponent: () => Promise.all([
      import('./graph-general/graph-general.module'),
      import('./graph-general/graph-general.component'),
    ]).then(([m, c]) => ({ ngModule: m.GraphGeneralModule, component: c.GraphGeneralComponent })),
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.layout._type,
    widgetSubType: ROOT_WIDGET_CONFIG.layout.linear,
    component: LayoutLinearComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.layout._type,
    widgetSubType: ROOT_WIDGET_CONFIG.layout.tab,
    component: LayoutTabComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.discussStrip._type,
    widgetSubType: ROOT_WIDGET_CONFIG.discussStrip.multipleStrip,
    component: DiscussStripMultipleComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.networkStrip._type,
    widgetSubType: ROOT_WIDGET_CONFIG.networkStrip.multipleStrip,
    component: NetworkStripMultipleComponent,
  },
  // {
  //   widgetType: ROOT_WIDGET_CONFIG.activityStrip._type,
  //   widgetSubType: ROOT_WIDGET_CONFIG.activityStrip.multipleStrip,
  //   component: ActivityStripMultipleComponent,
  // },
  {
    widgetType: ROOT_WIDGET_CONFIG.carrierStrip._type,
    widgetSubType: ROOT_WIDGET_CONFIG.carrierStrip.multipleStrip,
    component: CarrierStripMultipleComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.player._type,
    widgetSubType: ROOT_WIDGET_CONFIG.player.amp,
    // lazy: keeps this player's libraries (pdf.js, video.js, ...) out of the initial bundle
    loadComponent: () => Promise.all([
      import('./player-amp/player-amp.module'),
      import('./player-amp/player-amp.component'),
    ]).then(([m, c]) => ({ ngModule: m.PlayerAmpModule, component: c.PlayerAmpComponent })),
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.player._type,
    widgetSubType: ROOT_WIDGET_CONFIG.player.audio,
    // lazy: keeps this player's libraries (pdf.js, video.js, ...) out of the initial bundle
    loadComponent: () => Promise.all([
      import('./player-audio/player-audio.module'),
      import('./player-audio/player-audio.component'),
    ]).then(([m, c]) => ({ ngModule: m.PlayerAudioModule, component: c.PlayerAudioComponent })),
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.player._type,
    widgetSubType: ROOT_WIDGET_CONFIG.player.pdf,
    // lazy: keeps this player's libraries (pdf.js, video.js, ...) out of the initial bundle
    loadComponent: () => Promise.all([
      import('./player-pdf/player-pdf.module'),
      import('./player-pdf/player-pdf.component'),
    ]).then(([m, c]) => ({ ngModule: m.PlayerPdfModule, component: c.PlayerPdfComponent })),
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.player._type,
    widgetSubType: ROOT_WIDGET_CONFIG.player.survey,
    // lazy: keeps this player's libraries (pdf.js, video.js, ...) out of the initial bundle
    loadComponent: () => Promise.all([
      import('./player-survey/player-survey.module'),
      import('./player-survey/player-survey.component'),
    ]).then(([m, c]) => ({ ngModule: m.PlayerSurveyModule, component: c.PlayerSurveyComponent })),
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.player._type,
    widgetSubType: ROOT_WIDGET_CONFIG.player.offlineSession,
    // lazy: keeps this player's libraries (pdf.js, video.js, ...) out of the initial bundle
    loadComponent: () => Promise.all([
      import('./player-offline-session/player-offline-session.module'),
      import('./player-offline-session/player-offline-session.component'),
    ]).then(([m, c]) => ({ ngModule: m.PlayerOfflineSessionModule, component: c.PlayerOfflineSessionComponent })),
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.player._type,
    widgetSubType: ROOT_WIDGET_CONFIG.player.slides,
    // lazy: keeps this player's libraries (pdf.js, video.js, ...) out of the initial bundle
    loadComponent: () => Promise.all([
      import('./player-slides/player-slides.module'),
      import('./player-slides/player-slides.component'),
    ]).then(([m, c]) => ({ ngModule: m.PlayerSlidesModule, component: c.PlayerSlidesComponent })),
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.player._type,
    widgetSubType: ROOT_WIDGET_CONFIG.player.video,
    // lazy: keeps this player's libraries (pdf.js, video.js, ...) out of the initial bundle
    loadComponent: () => Promise.all([
      import('./player-video/player-video.module'),
      import('./player-video/player-video.component'),
    ]).then(([m, c]) => ({ ngModule: m.PlayerVideoModule, component: c.PlayerVideoComponent })),
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.player._type,
    widgetSubType: ROOT_WIDGET_CONFIG.player.webPages,
    // lazy: keeps this player's libraries (pdf.js, video.js, ...) out of the initial bundle
    loadComponent: () => Promise.all([
      import('./player-web-pages/player-web-pages.module'),
      import('./player-web-pages/player-web-pages.component'),
    ]).then(([m, c]) => ({ ngModule: m.PlayerWebPagesModule, component: c.PlayerWebPagesComponent })),
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.player._type,
    widgetSubType: ROOT_WIDGET_CONFIG.player.youtube,
    // lazy: keeps this player's libraries (pdf.js, video.js, ...) out of the initial bundle
    loadComponent: () => Promise.all([
      import('./player-youtube/player-youtube.module'),
      import('./player-youtube/player-youtube.component'),
    ]).then(([m, c]) => ({ ngModule: m.PlayerYoutubeModule, component: c.PlayerYoutubeComponent })),
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.releaseNotes._type,
    widgetSubType: ROOT_WIDGET_CONFIG.releaseNotes.user,
    component: ReleaseNotesComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.slider._type,
    widgetSubType: ROOT_WIDGET_CONFIG.slider.carousel,
    component: SlidersComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.slider._type,
    widgetSubType: ROOT_WIDGET_CONFIG.slider.mob,
    component: SlidersMobComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.tree._type,
    widgetSubType: ROOT_WIDGET_CONFIG.tree.tree,
    component: TreeComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.tree._type,
    widgetSubType: ROOT_WIDGET_CONFIG.tree.catalog,
    component: TreeCatalogComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.page._type,
    widgetSubType: ROOT_WIDGET_CONFIG.page.standard,
    component: PageComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.profileV2._type,
    widgetSubType: ROOT_WIDGET_CONFIG.profileV2.academics,
    component: ProfileAcademicsComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.profileV2._type,
    widgetSubType: ROOT_WIDGET_CONFIG.profileV2.karmapoints,
    component: ProfileKarmapointsComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.profileV2._type,
    widgetSubType: ROOT_WIDGET_CONFIG.profileV2.career,
    component: ProfileCareerComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.profileV2._type,
    widgetSubType: ROOT_WIDGET_CONFIG.profileV2.competencies,
    component: ProfileCompetenciesComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.profileV2._type,
    widgetSubType: ROOT_WIDGET_CONFIG.profileV2.certifications,
    component: ProfileCretificationsComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.profileV2._type,
    widgetSubType: ROOT_WIDGET_CONFIG.profileV2.certificationsV2,
    component: ProfileCretificationsV2Component,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.profileV2._type,
    widgetSubType: ROOT_WIDGET_CONFIG.profileV2.hobbies,
    component: ProfileHobbiesComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.profileV2._type,
    widgetSubType: ROOT_WIDGET_CONFIG.profileV2.departments,
    component: ProfileDepartmentsComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.page._type,
    widgetSubType: ROOT_WIDGET_CONFIG.page.embedded,
    component: EmbeddedPageComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.element._type,
    widgetSubType: ROOT_WIDGET_CONFIG.element.html,
    component: ElementHtmlComponent,
  },

  {
    widgetType: ROOT_WIDGET_CONFIG.selector._type,
    widgetSubType: ROOT_WIDGET_CONFIG.selector.responsive,
    component: SelectorResponsiveComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.layout._type,
    widgetSubType: ROOT_WIDGET_CONFIG.layout.grid,
    component: GridLayoutComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    component: ErrorResolverComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.feature,
    component: BtnFeatureComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.gallery._type,
    widgetSubType: ROOT_WIDGET_CONFIG.gallery.galleryView,
    component: GalleryViewComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.imageMap._type,
    widgetSubType: ROOT_WIDGET_CONFIG.imageMap.imageMapResponsive,
    component: ImageMapResponsiveComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.selector._type,
    widgetSubType: ROOT_WIDGET_CONFIG.selector.intranet,
    component: IntranetSelectorComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.wrapper._type,
    widgetSubType: ROOT_WIDGET_CONFIG.wrapper.videoWrapper,
    // lazy: embeds the video player, which pulls in video.js and its plugins
    loadComponent: () => Promise.all([
      import('./video-wrapper/video-wrapper.module'),
      import('./video-wrapper/video-wrapper.component'),
    ]).then(([m, c]) => ({ ngModule: m.VideoWrapperModule, component: c.VideoWrapperComponent })),
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.card._type,
    widgetSubType: ROOT_WIDGET_CONFIG.card.home_hubs,
    component: CardHubsListComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.card._type,
    widgetSubType: ROOT_WIDGET_CONFIG.card.home_notify,
    component: CardNotifyComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.card._type,
    widgetSubType: ROOT_WIDGET_CONFIG.card.home_course,
    component: CardCourseComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.card._type,
    widgetSubType: ROOT_WIDGET_CONFIG.card.home_carrier,
    component: CardCarrierHomeComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.menus._type,
    widgetSubType: ROOT_WIDGET_CONFIG.menus.leftMenu,
    component: LeftMenuComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.card._type,
    widgetSubType: ROOT_WIDGET_CONFIG.card.event_hub,
    component: CardEventHubComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.card._type,
    widgetSubType: ROOT_WIDGET_CONFIG.card.card_competency,
    component: CardCompetencyComponent,
  },
]
