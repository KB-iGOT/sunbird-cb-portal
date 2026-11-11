import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ViewerTopBarComponent } from './viewer-top-bar.component'
import { BtnFullscreenModule } from '@sunbird-cb/collection/src/lib/btn-fullscreen/btn-fullscreen.module'
import { BtnPageBackNavModule } from '@sunbird-cb/collection/src/lib/btn-page-back-nav/btn-page-back-nav.module'
import { ContentProgressModule } from '@sunbird-cb/collection/src/lib/_common/content-progress/content-progress.module'
import { RouterModule } from '@angular/router'
import { ValueService } from '@sunbird-cb/utils-v2'
import { CourseCompletionDialogModule } from '../course-completion-dialog/course-completion-dialog.module'
import { TranslateModule } from '@ngx-translate/core'
import { ShareTocModule } from '@sunbird-cb/toc'
import { SkeletonLoaderModule } from '@sunbird-cb/collection/src/lib/_common/skeleton-loader/skeleton-loader.module'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
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
