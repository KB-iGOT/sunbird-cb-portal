import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipeFilterModule, PipeHtmlTagRemovalModule, PipeOrderByModule, PipeRelativeTimeModule, PipeListFilterModule } from '@sunbird-cb/utils'
import { TaxonomyHomeComponent } from './routes/taxonomy-home/taxonomy.component'
import { DiscussCommetsComponent } from './components/discuss-comments/discuss-comments.component'
import { TaxonomyRoutingModule } from './taxonomy.rounting.module'
import { TaxonomyLevelCardComponent } from './components/taxonomy-level-card/taxonomy-level-card.component'
import { CategoryCardComponent } from './components/category-card/category-card.component'
import { LeftMenuComponent } from './components/left-menu/left-menu.component'
import { PostCardComponent } from './components/post-card/post-card.component'
import { RightMenuComponent } from './components/right-menu/right-menu.component'
// import { BasicCKEditorComponent } from './components/basic-ckeditor/basic-ckeditor.component'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { WidgetResolverModule } from '@sunbird-cb/resolver'
import {
  MatIconModule,
  MatListModule,
  MatFormFieldModule,
  MatDialogModule,
  MatSelectModule,
  MatInputModule,
  MatButtonModule,
  MatSidenavModule,
  MatChipsModule,
  MatProgressSpinnerModule,
} from '@angular/material'
import { MatCardModule } from '@angular/material/card'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { TrendingTagsComponent } from './components/trending-tags/trending-tags.component'
import { RelatedDiscussionComponent } from './components/related-discussion/related-discussion.component'
import { AvatarPhotoModule, BtnPageBackModule, CardContentModule, BreadcrumbsOrgModule } from '@sunbird-cb/collection'
import { EditorSharedModule } from '@ws/author/src/lib/routing/modules/editor/shared/shared.module'
// import { CkEditorModule } from 'library/ws-widget/collection/src/lib/_common/ck-editor/ck-editor.module'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
// import { CKEditorService } from 'library/ws-widget/collection/src/lib/_common/ck-editor/ck-editor.service'
import { PaginationComponent } from './components/pagination/pagination.component'

import { DiscussTopicsComponent } from './routes/discuss-topics/discuss-topics.component'

@NgModule({
  declarations: [
    CategoryCardComponent,
    TaxonomyHomeComponent,
    TaxonomyLevelCardComponent,
    DiscussCommetsComponent,
    LeftMenuComponent,
    PostCardComponent,
    RightMenuComponent,
    RelatedDiscussionComponent,
    TrendingTagsComponent,
    PaginationComponent,
    DiscussTopicsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TaxonomyRoutingModule,
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
    WidgetResolverModule,
    CardContentModule,
    BreadcrumbsOrgModule,
  ],
  providers: [
    // CKEditorService,
    LoaderService,
  ],
  exports: [
    PostCardComponent,
  ],
})
export class TaxonomyModule {

}
