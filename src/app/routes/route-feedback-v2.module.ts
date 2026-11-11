import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FeedbackV2Module } from '@ws/app/src/lib/routes/feedback-v2/feedback-v2.module'

@NgModule({
  imports: [CommonModule, FeedbackV2Module],
  exports: [FeedbackV2Module],
})
export class RouteFeedbackV2Module {}
