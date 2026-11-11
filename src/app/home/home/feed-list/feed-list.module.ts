import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FeedListComponent } from './feed-list.component'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { RouterModule } from '@angular/router'
import { GridLayoutModule } from '@sunbird-cb/collection/src/lib/grid-layout/grid-layout.module'
import { SlidersModule } from '@sunbird-cb/collection/src/lib/sliders/sliders.module'
import { DiscussStripMultipleModule } from '@sunbird-cb/collection/src/lib/discuss-strip-multiple/discuss-strip-multiple.module'
import { NetworkStripMultipleModule } from '@sunbird-cb/collection/src/lib/network-strip-multiple/network-strip-multiple.module'
import { ContentStripWithTabsModule } from '@sunbird-cb/collection/src/lib/content-strip-with-tabs/content-strip-with-tabs.module'
import { AvatarPhotoModule } from '@sunbird-cb/collection/src/lib/_common/avatar-photo/avatar-photo.module'
import { ContentStripWithTabsLibModule, ContentStripWithTabsPillsModule, ContentStripWithTabsPillsNewModule } from '@sunbird-cb/consumption'

@NgModule({
  declarations: [FeedListComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    GridLayoutModule,
    SlidersModule,
    DiscussStripMultipleModule,
    NetworkStripMultipleModule,
    ContentStripWithTabsModule,
    AvatarPhotoModule,
    ContentStripWithTabsLibModule,
    ContentStripWithTabsPillsModule,
    ContentStripWithTabsPillsNewModule,
  ],
  exports: [FeedListComponent],
})
export class FeedListModule { }
