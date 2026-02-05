import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { GeneralGuard } from '@ws/app'
import { PublicHomeComponent } from './routes/public/public-home/public-home.component'
// 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥
// Please declare routes in alphabetical order
// 😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵

const routes: Routes = [

  { path: '', redirectTo: 'page/home', pathMatch: 'full' },
  { path: 'home', redirectTo: 'page/home', pathMatch: 'full' },

  // App Routes - Main Application
  {
    path: 'app/activities',
    loadChildren: () => import('./routes/route-activities.module').then(m => m.RouteActivitiesModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/browse-by/competency',
    loadChildren: () => import('./routes/route-browse-competency.module').then(m => m.RouteBrowseCompetencyModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/browse-by/competency-v2',
    loadChildren: () => import('./routes/route-browse-competency-v2.module').then(m => m.RouteBrowseCompetencyModuleV2),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/browse-by/provider',
    loadChildren: () => import('./routes/route-browse-provider.module').then(m => m.RouteBrowseProviderModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/careers',
    loadChildren: () => import('./routes/route-careers.module').then(m => m.RouteCareerHubModule),
    canActivate: [GeneralGuard],
  },
  // {
  //   path: 'app/certificate',
  //   loadChildren: () => import('./routes/route-cert.module').then(m => m.RouteCertModule),
  //   canActivate: [GeneralGuard],
  // },
  // {
  //   path: 'app/certificate-v2',
  //   loadChildren: () => import('./routes/route-cert-v2.module').then(m => m.RouteCertV2Module),
  //   canActivate: [GeneralGuard],
  // },
  {
    path: 'app/channels',
    loadChildren: () => import('./routes/route-channels.module').then(m => m.RouteChannelsModule),
    canActivate: [GeneralGuard],
  },
  // {
  //   path: 'app/competencie',
  //   loadChildren: () => import('./routes/route-competencie.module').then(m => m.RouteCompetenciesModule),
  //   canActivate: [GeneralGuard],
  // },
  {
    path: 'app/content-assignment',
    loadChildren: () => import('./routes/route-content-assignment.module').then(m => m.RouteContentAssignmentModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/curated-collections',
    loadChildren: () => import('./routes/route-curated-course.module').then(m => m.RouteCuratedCourseModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/discuss',
    loadChildren: () => import('./routes/route-discuss.module').then(m => m.RouteDiscussModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/discussion-forum',
    loadChildren: () => import('./routes/route-app-discussion-v2.module').then(m => m.RouteAppDiscussionV2Module),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/event',
    loadChildren: () => import('./routes/route-app-event.module').then(m => m.AppEventsModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/events',
    loadChildren: () => import('./routes/route-events.module').then(m => m.RouteEventsModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/feedback',
    loadChildren: () => import('./routes/route-feedback-app.module').then(m => m.RouteFeedbackAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/feedback-v2',
    loadChildren: () => import('./routes/route-feedback-v2.module').then(m => m.RouteFeedbackV2Module),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/frac',
    loadChildren: () => import('./routes/route-frac.module').then(m => m.RouteFracModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/goals',
    loadChildren: () => import('./routes/route-goals-app.module').then(m => m.RouteGoalsAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/gyaan-karmayogi',
    loadChildren: () => import('./routes/route-gyaan-karmayogi.module').then(m => m.RouteGyaanKarmayogiModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/infy/khub',
    loadChildren: () => import('./routes/route-infy-app.module').then(m => m.RouteAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/info',
    loadChildren: () => import('./routes/route-info-app.module').then(m => m.RouteInfoAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/jan-karmayogi',
    loadChildren: () => import('./routes/route-jan-karmayogi.module').then(m => m.RouteJanKarmayogiModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/karma-programs',
    loadChildren: () => import('./routes/route-karma-programs.module').then(m => m.RouteKarmaProgramsModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/knowledge-resource',
    loadChildren: () => import('./routes/route-knowledge-resource.module').then(m => m.RouteKnowledgeResourceModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/learn-hub',
    loadChildren: () => import('./routes/route-learning-hub-app.module').then(m => m.LearningHubAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/mandatory-course',
    loadChildren: () => import('./routes/route-mandatory-course.module').then(m => m.RouteMandatoryCourseModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/mdo-channels',
    loadChildren: () => import('./routes/route-mdo-channels.module').then(m => m.RouteMdoChannelsModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/my-dashboard',
    loadChildren: () => import('./routes/route-my-dashboard.module').then(m => m.RouteMyDashboardModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/my-learning',
    loadChildren: () => import('./routes/route-my-learning.module').then(m => m.RouteMyLearningModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/my-rewards',
    loadChildren: () => import('./routes/route-my-rewards.module').then(m => m.RouteMyRewarddModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/national-learning-week',
    loadChildren: () => import('./routes/route-national-learning-week.module').then(m => m.RouteNationalLearningWeekModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/network-v2',
    loadChildren: () => import('./routes/route-network-v2.module').then(m => m.RouteNetworkV2Module),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/network-v3',
    loadChildren: () => import('./routes/route-network-v3.module').then(m => m.RouteNetworkV3Module),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/notification',
    loadChildren: () => import('./routes/route-notification-app.module').then(m => m.RouteNotificationAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/org-details',
    loadChildren: () => import('./routes/route-organization.module').then(m => m.RouteOrganizationModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/person-profile/:wid',
    loadChildren: () => import('./routes/route-person-profile.module').then(m => m.RoutePersonProfileModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/playlist',
    loadChildren: () => import('./routes/route-playlist-app.module').then(m => m.RoutePlaylistAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/profile',
    loadChildren: () => import('./routes/route-profile-app.module').then(m => m.RouteProfileAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/profile-v2',
    loadChildren: () => import('./routes/route-profile-v2.module').then(m => m.RouteProfileV2Module),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/profile-v3',
    loadChildren: () => import('./routes/route-profile-v3.module').then(m => m.RouteProfileV3Module),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/search',
    loadChildren: () => import('./routes/route-search-app.module').then(m => m.RouteSearchAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/search-v2',
    loadChildren: () => import('./routes/route-searchv2-app.module').then(m => m.RouteSearchV2AppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/search-v3',
    loadChildren: () => import('./routes/route-searchv3-app.module').then(m => m.RouteSearchV3AppModule),
    canActivate: [GeneralGuard],
  },
  // {
  //   path: 'app/see-all',
  //   loadChildren: () => import('./routes/route-see-all-app.module').then(m => m.RouteSeeAllAppModule),
  //   canActivate: [GeneralGuard],
  // },
  {
    path: 'app/setup',
    loadChildren: () => import('./routes/route-app-setup.module').then(m => m.RouteAppSetupModule),
  },
  {
    path: 'app/social',
    loadChildren: () => import('./routes/route-social-app.module').then(m => m.RouteSocialAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/taxonomy',
    loadChildren: () => import('./routes/route-taxonomy.module').then(m => m.RouteTaxonomyModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/toc/:id',
    loadChildren: () => import('./routes/route-app-toc.module').then(m => m.RouteAppTocModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/user-profile',
    loadChildren: () => import('./routes/route-user-profile-app.module').then(m => m.RouteUserProfileAppModule),
    canActivate: [GeneralGuard],
  },

  // Author
  {
    path: 'author',
    loadChildren: () => import('./routes/route-authoring-app.module').then(m => m.AuthoringAppModule),
  },

  // Page Routes
  {
    path: 'page/home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
    data: {
      pageType: 'page',
      pageKey: 'home',
      pageId: 'page/home',
      module: 'Home',
    },
    resolve: {
      // module: ModuleNameResolve,
      // pageId: PageNameResolve,
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'page/learn',
    loadChildren: () => import('./routes/route-learning-hub-app.module').then(m => m.LearningHubAppModule),
    data: {
      pageType: 'page',
      pageKey: 'learn',
      pageId: 'page/learn',
      module: 'Learn',
    },
    canActivate: [GeneralGuard],
  },

  // Public Routes
  {
    path: 'public/about',
    loadChildren: () => import('./routes/public/public-about/public-about.module').then(m => m.PublicAboutModule),
  },
  {
    path: 'public/contact',
    loadChildren: () => import('./routes/public/public-contact/public-contact.module').then(m => m.PublicContactModule),
  },
  {
    path: 'public/home',
    component: PublicHomeComponent,
    data: {
      pageType: 'public',
      pageKey: 'home',
      pageId: 'public/home',
      module: 'PublicHome',
    },
  },
  {
    path: 'public/logout',
    loadChildren: () => import('./routes/public/public-logout/public-logout.module').then(m => m.PublicLogoutModule),
  },
  {
    path: 'public/request',
    loadChildren: () => import('./routes/public/public-request/public-request.module').then(m => m.PublicRequestModule),
  },
  {
    path: 'public/signup',
    loadChildren: () => import('./routes/public/public-signup/public-signup.module').then(m => m.PublicSignupModule),
  },
  {
    path: 'public/toc/:id',
    loadChildren: () => import('./routes/public/public-toc/public-toc.module').then(m => m.PublicTocModule),
  },
  {
    path: 'public/welcome',
    loadChildren: () => import('./routes/public/welcome/public-welcome.module').then(m => m.PublicWelcomeModule),
  },

  // Viewer
  {
    path: 'viewer',
    loadChildren: () => import('./routes/route-viewer.module').then(m => m.RouteViewerModule),
  },

]
@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule { }
