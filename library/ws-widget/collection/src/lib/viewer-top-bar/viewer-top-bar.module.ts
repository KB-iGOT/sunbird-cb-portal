import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ViewerTopBarComponent } from './viewer-top-bar.component'
import { RouterModule } from '@angular/router'
import { ValueService } from '@sunbird-cb/utils-v2'
import { CourseCompletionDialogModule } from '../course-completion-dialog/course-completion-dialog.module'
import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { ShareTocModule } from '../app-toc/share-toc/share-toc.module'
import { SkeletonLoaderModule } from '../_common/skeleton-loader/skeleton-loader.module'
import { ContentProgressModule } from '../_common/content-progress/content-progress.module'
import { BtnPageBackNavModule } from '../btn-page-back-nav/btn-page-back-nav.module'
import { BtnFullscreenModule } from '../btn-fullscreen/btn-fullscreen.module'
@NgModule({
  declarations: [ViewerTopBarComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    BtnFullscreenModule,
    BtnPageBackNavModule,
    MatTooltipModule,
    RouterModule,
    CourseCompletionDialogModule,
    MatProgressBarModule,
    ContentProgressModule,
    TranslateModule,
    ShareTocModule,
    SkeletonLoaderModule,
  ],
  exports: [ViewerTopBarComponent],
  providers: [ValueService],
})
export class ViewerTopBarModule {
  isXSmall = false

  constructor() {

  }

}
