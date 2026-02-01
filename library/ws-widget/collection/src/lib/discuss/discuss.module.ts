import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipeFilterModule, PipeHtmlTagRemovalModule, PipeOrderByModule, PipeRelativeTimeModule, PipeListFilterModule } from '@sunbird-cb/utils-v2'
import { DiscussComponent } from './routes/discuss-home/discuss.component'
import { DiscussCommetsComponent } from './components/discuss-comments/discuss-comments.component'
import { DiscussCategoriesComponent } from './routes/discuss-categories/discuss-categories.component'
import { DiscussGroupsComponent } from './routes/discuss-groups/discuss-groups.component'
import { DiscussLeaderboardComponent } from './routes/discuss-leaderboard/discuss-leaderboard.component'
import { DiscussMyDiscussionsComponent } from './routes/discuss-my-discussions/discuss-my-discussions.component'
import { DiscussTagsComponent } from './routes/discuss-tags/discuss-tags.component'
import { DiscussRoutingModule } from './dicuss.rounting.module'
import { DiscussCardComponent } from './components/discuss-card/discuss-card.component'
import { CategoryCardComponent } from './components/category-card/category-card.component'
import { LeftMenuComponent } from './components/left-menu/left-menu.component'
import { PostCardComponent } from './components/post-card/post-card.component'
import { RightMenuComponent } from './components/right-menu/right-menu.component'
// import { BasicCKEditorComponent } from './components/basic-ckeditor/basic-ckeditor.component'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'

import { MatCardModule } from '@angular/material/card'
import { DiscussAllComponent } from './routes/discuss-all/discuss-all.component'
import { DiscussStartComponent } from './components/discuss-start/discuss-start.component'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { TrendingTagsComponent } from './components/trending-tags/trending-tags.component'
import { DiscussionComponent } from './routes/discussion/discussion.component'
import { RelatedDiscussionComponent } from './components/related-discussion/related-discussion.component'
import { InitResolver } from './resolvers/init-resolve.service'
import { PaginationComponent } from './components/pagination/pagination.component'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSelectModule } from '@angular/material/select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { EditorSharedModule } from '../routing/modules/editor/shared/shared.module'
import { LoaderService } from '../services/loader.service'
import { AvatarPhotoModule } from '../_common/avatar-photo/avatar-photo.module'
import { BtnPageBackModule } from '../btn-page-back/btn-page-back.module'

@NgModule({
    declarations: [
        CategoryCardComponent,
        DiscussComponent,
        DiscussionComponent,
        DiscussAllComponent,
        DiscussCardComponent,
        DiscussCommetsComponent,
        DiscussCategoriesComponent,
        DiscussGroupsComponent,
        DiscussLeaderboardComponent,
        DiscussMyDiscussionsComponent,
        DiscussStartComponent,
        DiscussTagsComponent,
        LeftMenuComponent,
        PostCardComponent,
        RightMenuComponent,
        RelatedDiscussionComponent,
        TrendingTagsComponent,
        PaginationComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        DiscussRoutingModule,
        MatGridListModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatDividerModule,
        MatIconModule,
        MatCardModule,
        MatChipsModule,
        MatListModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatDialogModule,
        MatButtonModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        PipeFilterModule,
        PipeHtmlTagRemovalModule,
        PipeRelativeTimeModule,
        AvatarPhotoModule,
        EditorSharedModule,
        // CkEditorModule,
        PipeOrderByModule,
        PipeListFilterModule,
        BtnPageBackModule,
        SbUiResolverModule,
    ],
    providers: [
        // CKEditorService,
        LoaderService,
        InitResolver,
    ],
    exports: [
        PostCardComponent,
    ]
})
export class DiscussModule {

}
