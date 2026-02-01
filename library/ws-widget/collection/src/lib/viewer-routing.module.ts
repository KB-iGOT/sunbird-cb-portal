import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ViewerComponent } from './viewer.component'
import { ViewerResolve } from './viewer.resolve'
import { AudioComponent } from './audio/audio.component'
import { AudioModule } from './audio/audio.module'
import { AudioNativeComponent } from './audio-native/audio-native.component'
import { AudioNativeModule } from './audio-native/audio-native.module'
import { HtmlComponent } from './html/html.component'
import { HtmlModule } from './html/html.module'
import { PdfComponent } from './pdf/pdf.component'
import { PdfModule } from './pdf/pdf.module'
// import { PracticeTestComponent } from './practice-test/practice-test.component'
import { PracticeTestModule } from './practice-test/practice-test.module'
import { ChannelComponent } from './channel/channel.component'
import { ChannelModule } from './channel/channel.module'
import { VideoComponent } from './video/video.component'
import { VideoModule } from './video/video.module'
import { YoutubeComponent } from './youtube/youtube.component'
import { YoutubeModule } from './youtube/youtube.module'
import { SurveyModule } from './survey/survey.module'
import { HtmlMobileComponent } from './html-mobile/html-mobile.component'
import { HtmlMobileModule } from './html-mobile/html-mobile.module'
// import { ConfigurationsService } from './resolvers/config-resolver.service'
// import { ProfileResolverService } from './resolvers/profile-resolver.service'
import { PageResolve } from '@sunbird-cb/utils-v2'
import { OfflineSessionComponent } from './offline-session/offline-session.component'
import { OfflineSessionModule } from './offline-session/offline-session.module'

const routes: Routes = [
  {
    path: 'audio/:resourceId',
    component: AudioComponent,
    data: {
      resourceType: 'audio',
      module: 'Learn',
      pageId: 'audio/:resourceId',
    },
    resolve: {
      content: ViewerResolve,
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
  },
  {
    path: 'audio-native/:resourceId',
    component: AudioNativeComponent,
    data: {
      resourceType: 'audio-native',
    },
    resolve: {
      content: ViewerResolve,
      module: 'Learn',
      pageId: 'audio-native/:resourceId',
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
  },
  {
    path: 'certification',
    data: {
      resourceType: 'certification',
      module: 'Learn',
      pageId: 'certification',
    },
    resolve: {
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
    loadChildren: () =>
      import('./certification/certification.module').then(u => u.CertificationModule),
  },
  {
    path: 'class-diagram',
    data: {
      resourceType: 'class-diagram',
      module: 'Learn',
      pageId: 'class-diagram',
    },
    resolve: {
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
    loadChildren: () =>
      import('./class-diagram/class-diagram.module').then(u => u.ClassDiagramModule),
  },
  {
    path: 'dnd-quiz',
    data: {
      resourceType: 'dnd-quiz',
      module: 'Learn',
      pageId: 'dnd-quiz',
    },
    resolve: {
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
    loadChildren: () =>
      import('./dnd-quiz/dnd-quiz.module').then(u => u.DndQuizModule),
  },
  {
    path: 'hands-on',
    data: {
      resourceType: 'hands-on',
      module: 'Learn',
      pageId: 'hands-on',
    },
    resolve: {
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
    loadChildren: () =>
      import('./hands-on/hands-on.module').then(u => u.HandsOnModule),
  },
  {
    path: 'html/:resourceId',
    component: HtmlComponent,
    data: {
      resourceType: 'html',
      module: 'Learn',
      pageId: 'html/:resourceId',
    },
    resolve: {
      content: ViewerResolve,
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
  },
  {
    path: 'mobile/html/:resourceId',
    component: HtmlMobileComponent,
    data: {
      resourceType: 'mobile/html',
      module: 'Learn',
      pageId: 'mobile/html/:resourceId',
    },
    resolve: {
      content: ViewerResolve,
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
  },
  {
    path: 'html-picker',
    data: {
      resourceType: 'html-picker',
      module: 'Learn',
      pageId: 'html-picker',
    },
    loadChildren: () =>
      import('./html-picker/html-picker.module').then(u => u.HtmlPickerModule),
  },
  {
    path: 'channel/:resourceId',
    data: {
      resourceType: 'channel',
      module: 'Learn',
      pageId: 'channel/:resourceId',
    },
    resolve: {
      content: ViewerResolve,
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
    component: ChannelComponent,
  },
  {
    path: 'iap',
    data: {
      resourceType: 'iap',
      module: 'Learn',
      pageId: 'iap',
    },
    resolve: {
      content: ViewerResolve,
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
    loadChildren: () =>
      import('./iap/iap.module').then(u => u.IapModule),
  },
  {
    path: 'interactive-exercise',
    data: {
      resourceType: 'interactive-exercise',
      module: 'Learn',
      pageId: 'interactive-exercise',
    },
    resolve: {
      content: ViewerResolve,
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
    loadChildren: () =>
      import('./interactive-exercise/interactive-exercise.module').then(u => u.InteractiveExerciseModule),
  },
  {
    path: 'pdf/:resourceId',
    component: PdfComponent,
    data: {
      resourceType: 'pdf',
      module: 'Learn',
      pageId: 'pdf/:resourceId',
    },
    resolve: {
      content: ViewerResolve,
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
  },
  {
    path: 'offline-session/:resourceId',
    component: OfflineSessionComponent,
    data: {
      resourceType: 'offline-session',
      module: 'Learn',
      pageId: 'offline-session/:resourceId',
    },
    resolve: {
      content: ViewerResolve,
    },
    // loadChildren: () => import('./offline-session/offline-session.module').then(p => p.OfflineSessionModule),
  },
  {
    path: 'survey',
    // component: SurveyComponent,
    data: {
      resourceType: 'survey',
      module: 'Learn',
      pageId: 'survey',
    },
    resolve: {
      content: ViewerResolve,
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
    loadChildren: () =>
      import('./survey/survey.module').then(u => u.SurveyModule),
  },
  {
    path: 'quiz',
    data: {
      resourceType: 'quiz',
      module: 'Learn',
      pageId: 'quiz',
    },
    resolve: {
      content: ViewerResolve,
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
    loadChildren: () =>
      import('./quiz/quiz.module').then(u => u.QuizModule),
  },
  {
    path: 'practice',
    // component: PracticeTestComponent,
    data: {
      pageType: 'feature',
      pageKey: 'practice',
      resourceType: 'practice',
      module: 'Learn',
      pageId: 'practice',
    },
    resolve: {
      pageData: PageResolve,
      content: ViewerResolve,
    },
    loadChildren: () => import('./practice-test/practice-test.module').then(p => p.PracticeTestModule),
  },
  {
    path: 'assessment',
    data: {
      resourceType: 'assessment',
      module: 'Learn',
      pageId: 'assessment',
    },
    resolve: {
      content: ViewerResolve,
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
    loadChildren: () =>
      import('./assessment/assessment.module').then(u => u.AssessmentModule),
  },
  {
    path: 'rdbms-hands-on',
    data: {
      resourceType: 'rdbms-hands-on',
      module: 'Learn',
      pageId: 'rdbms-hands-on',
    },
    resolve: {
      content: ViewerResolve,
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
    loadChildren: () =>
      import('./rdbms-hands-on/rdbms-hands-on.module').then(u => u.RdbmsHandsOnModule),
  },
  {
    path: 'resource-collection',
    data: {
      resourceType: 'resource-collection',
      module: 'Learn',
      pageId: 'resource-collection',
    },
    resolve: {
      content: ViewerResolve,
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
    loadChildren: () => import('./resource-collection/resource-collection.module')
      .then(u => u.ResourceCollectionModule),
  },
  {
    path: 'video/:resourceId',
    component: VideoComponent,
    data: {
      resourceType: 'video',
      module: 'Learn',
      pageId: 'video/:resourceId',
    },
    resolve: {
      content: ViewerResolve,
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
  },
  {
    path: 'web-module',
    data: {
      resourceType: 'web-module',
      module: 'Learn',
      pageId: 'web-module',
    },
    resolve: {
      content: ViewerResolve,
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
    loadChildren: () =>
      import('./web-module/web-module.module').then(u => u.WebModuleModule),
  },
  {
    path: 'youtube/:resourceId',
    component: YoutubeComponent,
    data: {
      resourceType: 'youtube',
      module: 'Learn',
      pageId: 'youtube/:resourceId',
    },
    resolve: {
      content: ViewerResolve,
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
  },
  {
    path: ':resourceId',
    component: ViewerComponent,
    data: {
      resourceType: 'unknown',
      module: 'Learn',
      pageId: ':resourceId',
    },
    resolve: {
      content: ViewerResolve,
      // configData: ConfigurationsService,
      // profileData: ProfileResolverService,
    },
  },
  // {
  //   path: '**',
  //   data: {
  //     resourceType: 'error',
  //     module: 'Learn',
  //     pageId: '404',
  //   },
  //   resolve: {
  //     content: ViewerResolve,
  //     // configData: ConfigurationsService,
  //     // profileData: ProfileResolverService,
  //   },
  // },
]

@NgModule({
  imports: [
    AudioModule,
    AudioNativeModule,
    HtmlModule,
    HtmlMobileModule,
    PdfModule,
    SurveyModule,
    PracticeTestModule,
    VideoModule,
    YoutubeModule,
    ChannelModule,
    OfflineSessionModule,
    RouterModule.forChild([
      {
        path: '',
        component: ViewerComponent,
        children: routes,
        data: {
          module: 'Player',
          pageId: '',
        },
      },
    ])],
  exports: [RouterModule],
  providers: [
    ViewerResolve,
    // ConfigurationsService,
    // ProfileResolverService,
  ],
})
export class ViewerRoutingModule { }
