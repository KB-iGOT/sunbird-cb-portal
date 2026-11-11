import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { HomeRoutingModule } from './home-routing.module'

import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'

import { HeaderModule } from '../header/header.module'
import { GridLayoutModule } from '@sunbird-cb/collection/src/lib/grid-layout/grid-layout.module'
import { SlidersModule } from '@sunbird-cb/collection/src/lib/sliders/sliders.module'
import { DiscussStripMultipleModule } from '@sunbird-cb/collection/src/lib/discuss-strip-multiple/discuss-strip-multiple.module'
import { NetworkStripMultipleModule } from '@sunbird-cb/collection/src/lib/network-strip-multiple/network-strip-multiple.module'
import { ContentStripWithTabsModule } from '@sunbird-cb/collection/src/lib/content-strip-with-tabs/content-strip-with-tabs.module'
import { AvatarPhotoModule } from '@sunbird-cb/collection/src/lib/_common/avatar-photo/avatar-photo.module'
import { SkeletonLoaderModule } from '@sunbird-cb/collection/src/lib/_common/skeleton-loader/skeleton-loader.module'
import { PipeRelativeTimeModule, ImageResponsiveModule } from '@sunbird-cb/utils-v2'
import { WeeklyClapsModule } from '@sunbird-cb/collection/src/lib/_common/weekly-claps/weekly-claps.module'
import { TipsForLearnerModule } from '@sunbird-cb/collection/src/lib/_common/tips-for-learner/tips-for-learner.module'
import { UpdatePostsModule } from '@sunbird-cb/collection/src/lib/_common/update-posts/update-posts.module'
import { DiscussionsModule } from '@sunbird-cb/collection/src/lib/_common/discussions/discussions.module'
import { RecentRequestsModule } from '@sunbird-cb/collection/src/lib/_common/recent-requests/recent-requests.module'
import { SharedModule } from '../shared/shared.module'
import { FeedListModule } from './home/feed-list/feed-list.module'

import { HomeComponent } from './home/home.component'
import { HomeV2Component } from './home-v2/home-v2.component'
import { DiscussionInfoComponent } from '../component/discussion-info/discussion-info.component'
import { PageContainerComponent } from '../component/page-container/page-container.component'
import { ClientSliderComponent } from '../component/client-slider/client-slider.component'
import { HomeOtherPortalModule } from '../component/home-other-portal/home-other-portal.module'
import { HomeContainerComponent } from '../component/home-container/home-container.component'
import { NetworkHubComponent } from './home/network-hub/network-hub.component'
import { NotificationComponent } from './home/notification/notification.component'
import { SurveyFormComponent } from '../component/app-survey/survey-form/survey-form.component'

import { PendingRequestModule } from '@sunbird-cb/collection/src/lib/_common/pending-request/pending-request.module'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { HttpLoaderFactory } from '../app.module'
import { HttpClient } from '@angular/common/http'
import { ContentStripWithTabsLibModule, ContentStripWithTabsPillsModule, ContetnSectionsComponent } from '@sunbird-cb/consumption'
import { SurveyFormModule } from '@sunbird-cb/collection/src/lib/_common/survey-form-left-section/survey-form/survey-form.module'
import { MatButtonModule } from '@angular/material/button'
import { SignupService } from '../routes/signup/signup.service'
import { InSightSideBarModule } from '../component/in-sight-side-bar/in-sight-side-bar.module'
import { CardsModule, CardCourseV2Component } from '@sunbird-cb/consumption'
import { KarmaLeaderboardV2Module } from './home-v2/karma-leaderboard-v2/karma-leaderboard-v2.module'
import { InSpotlightV2Module } from './home-v2/in-spotlight-v2/in-spotlight-v2.module'
@NgModule({
    declarations: [
        HomeComponent,
        HomeV2Component,
        PageContainerComponent, DiscussionInfoComponent, ClientSliderComponent,
        HomeContainerComponent,
        NetworkHubComponent, NotificationComponent, SurveyFormComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        HomeRoutingModule,
        GridLayoutModule,
        SlidersModule,
        DiscussStripMultipleModule,
        NetworkStripMultipleModule,
        ContentStripWithTabsModule,
        MatCardModule,
        MatIconModule,
        SharedModule,
        WeeklyClapsModule,
        TipsForLearnerModule,
        UpdatePostsModule,
        DiscussionsModule,
        RecentRequestsModule,
        SkeletonLoaderModule,
        PipeRelativeTimeModule,
        ImageResponsiveModule,
        AvatarPhotoModule,
        PendingRequestModule,
        ContentStripWithTabsLibModule,
        ContentStripWithTabsPillsModule,
        MatButtonModule,
        // forChild, not forRoot: HomeModule is lazy loaded, so forRoot would provide a second
        // TranslateStore in this module's injector and every `| translate` under the home route
        // would read an isolated store that InitService never set a language on — the keys render
        // raw. forChild reuses the root store and its already-loaded translations
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
        SurveyFormModule,
        FeedListModule,
        InSightSideBarModule,
        HomeOtherPortalModule,
        ContetnSectionsComponent,
        CardsModule,
        CardCourseV2Component,
        KarmaLeaderboardV2Module,
        InSpotlightV2Module,
    ],
    exports: [
        HeaderModule,
        MatCardModule,
        SharedModule,
        TranslateModule,
        FeedListModule,
        InSightSideBarModule,
        HomeOtherPortalModule,
    ],
    providers: [
        SignupService,
    ],
})
export class HomeModule { }
