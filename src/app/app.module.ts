
import { APP_BASE_HREF, PlatformLocation } from '@angular/common'
import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withJsonpSupport } from '@angular/common/http'
// Injectable
import { APP_INITIALIZER, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
// HAMMER_GESTURE_CONFIG
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { LoggerService } from '@sunbird-cb/utils-v2'

import 'hammerjs'
// import { KeycloakAngularModule } from 'keycloak-angular'
import { AppRoutingModule } from './app-routing.module'
import { InitService } from './services/init.service'

import { RootComponent } from './component/root/root.component'
import { LoginComponent } from './component/login/login.component'
import { AppFooterComponent } from './component/app-footer/app-footer.component'
import { AppPublicNavBarComponent } from './component/app-public-nav-bar/app-public-nav-bar.component'
import { DialogConfirmComponent } from './component/dialog-confirm/dialog-confirm.component'
import { InvalidUserComponent } from './component/invalid-user/invalid-user.component'
import { LoginRootComponent } from './component/login-root/login-root.component'
import { LoginRootDirective } from './component/login-root/login-root.directive'
import { TncRendererComponent } from './component/tnc-renderer/tnc-renderer.component'
import { TncComponent } from './routes/tnc/tnc.component'
import { AppInterceptorService } from './services/app-interceptor.service'
import { AppRetryInterceptorService } from './services/app-retry-interceptor.service'
import { environment } from 'src/environments/environment'
import { AppIntroComponent } from './component/app-intro/app-intro.component'
import { NoConnectionComponent } from './component/no-connection/no-connection.component'
import { PublicHomeComponent } from './routes/public/public-home/public-home.component'
import { PublicContacthomeComponent } from './routes/public/public-contacthome/public-contacthome.component'
import { PublicLoginWComponent } from './routes/public/public-login-w/public-login-w.component'
import { PublicLoginWGComponent } from './routes/public/public-login-wg/public-login-wg.component'
import { AppTourComponent } from './component/app-tour/app-tour.component'
import { AppTourVideoComponent } from './component/app-tour-video/app-tour-video.component'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'


import { DialogBoxComponent } from './component/dialog-box/dialog-box.component'
import { SocialLinkComponent } from './component/social-link/social-link.component'
import { FooterSectionComponent } from './component/app-footer/footer-section/footer-section.component'
import { AppLogoComponent } from './component/app-logo/app-logo.component'
import { NoDataComponent } from './component/no-data/no-data.component'
import { SurveyShikshaComponent } from './component/survey-shiksha/survey-shiksha.component'

import { PrivacyPolicyComponent } from './component/privacy-policy/privacy-policy.component'
import { LearnerAdvisoryComponent } from './learner-advisory/learner-advisory.component'
import { ProfileVerificationDialogComponent } from './profile-verification-dialog/profile-verification-dialog.component'
import { CommonDataService } from './services/common-data.service'
import { NPSGridService } from '../../library/ws-widget/collection/src/lib/grid-layout/nps-grid.service'
import { HeaderModule } from './header/header.module'
// @Injectable()
// export class HammerConfig extends GestureConfig {
//   buildHammer(element: HTMLElement) {
//     return new GestureConfig({ touchAction: 'pan-y' }).buildHammer(element)
//   }
// }
const appInitializer = (initSvc: InitService, logger: LoggerService) => async () => {
  try {
    await initSvc.init()
  } catch (error) {
    logger.error('ERROR DURING APP INITIALIZATION >', error)
  }
}

const getBaseHref = (platformLocation: PlatformLocation): string => {
  return platformLocation.getBaseHrefFromDOM()
}

// tslint:disable-next-line:function-name
export function HttpLoaderFactory() {
  return new TranslateHttpLoader()
}


@NgModule({
  declarations: [
    RootComponent,
    LoginComponent,
    // AppNavBarComponent,
    AppPublicNavBarComponent,
    NoDataComponent,
    TncComponent,
    AppIntroComponent,
    TncRendererComponent,
    AppFooterComponent,
    InvalidUserComponent,
    DialogConfirmComponent,
    LoginRootComponent,
    LoginRootDirective,
    NoConnectionComponent,
    PublicHomeComponent,
    PublicContacthomeComponent,
    PublicLoginWComponent,
    PublicLoginWGComponent,
    AppTourVideoComponent,
    AppTourComponent,
    DialogBoxComponent,
    SocialLinkComponent,
    FooterSectionComponent,
    AppLogoComponent,
    SurveyShikshaComponent,
    PrivacyPolicyComponent,
    LearnerAdvisoryComponent,
    ProfileVerificationDialogComponent
  ],
  exports: [
    TncComponent,
    TranslateModule,
  ],
  bootstrap: [RootComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HeaderModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ], providers: [

    {
      deps: [InitService, LoggerService],
      multi: true,
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
    },
    { provide: HTTP_INTERCEPTORS, useClass: AppInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AppRetryInterceptorService, multi: true },
    NPSGridService,
    HttpClient,
    CommonDataService,
    {
      provide: APP_BASE_HREF,
      useFactory: getBaseHref,
      deps: [PlatformLocation],
    },
    {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient],
    },
    { provide: 'environment', useValue: environment },
    provideHttpClient(withInterceptorsFromDi(), withJsonpSupport()),
  ]
})
export class AppModule { }
