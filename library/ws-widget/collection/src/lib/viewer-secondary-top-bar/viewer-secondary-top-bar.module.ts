import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { RouterModule } from '@angular/router'
import { ValueService } from '@sunbird-cb/utils-v2'
import { CourseCompletionDialogModule } from '../course-completion-dialog/course-completion-dialog.module'
import { ViewerSecondaryTopBarComponent } from './viewer-secondary-top-bar.component'
import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { ShareTocModule } from '../app-toc/share-toc/share-toc.module'
import { BtnFullscreenModule } from '../btn-fullscreen/btn-fullscreen.module'
import { BtnPageBackNavModule } from '../btn-page-back-nav/btn-page-back-nav.module'
import { ContentProgressModule } from '../_common/content-progress/content-progress.module'
@NgModule({
  declarations: [ViewerSecondaryTopBarComponent],
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
  ],
  exports: [ViewerSecondaryTopBarComponent],
  providers: [ValueService],
})
export class ViewerSecondaryTopBarModule {
  isXSmall = false

  constructor() {

  }
}
