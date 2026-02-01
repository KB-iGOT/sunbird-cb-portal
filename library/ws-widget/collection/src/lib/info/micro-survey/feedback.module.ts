import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MicroSurveyModule } from '@sunbird-cb/micro-surveys'
import { FeedbackComponent } from './components/feedback.component'

import { HorizontalScrollerModule, PipeSafeSanitizerModule } from '@sunbird-cb/utils-v2'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { BtnPageBackNavModule } from '../../btn-page-back-nav/btn-page-back-nav.module'
import { BtnPageBackModule } from '../../btn-page-back/btn-page-back.module'

@NgModule({
  declarations: [FeedbackComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,

    BtnPageBackNavModule,
    HorizontalScrollerModule,
    SbUiResolverModule,
    PipeSafeSanitizerModule,
    MicroSurveyModule,
    BtnPageBackModule,

  ],
  exports: [FeedbackComponent],
})
export class FeedBackModule { }
